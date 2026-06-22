const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/error');

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 9.99;

// @desc    Create a new order from cart items
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
  }
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip) {
    return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
  }

  // Use a transaction so stock checks/decrements and order creation are atomic.
  // Requires MongoDB running as a replica set; see README for standalone-mode notes.
  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const orderItems = [];
      let itemsPrice = 0;

      for (const reqItem of items) {
        const product = await Product.findById(reqItem.productId).session(session);
        if (!product || !product.isActive) {
          throw Object.assign(new Error(`Product not found: ${reqItem.productId}`), { statusCode: 404 });
        }
        if (product.stock < reqItem.quantity) {
          throw Object.assign(
            new Error(`Insufficient stock for ${product.name}. Only ${product.stock} left.`),
            { statusCode: 400 }
          );
        }

        product.stock -= reqItem.quantity;
        await product.save({ session });

        orderItems.push({
          product: product._id,
          name: product.name,
          quantity: reqItem.quantity,
          price: product.price,
          imageUrl: product.imageUrl,
        });

        itemsPrice += product.price * reqItem.quantity;
      }

      const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
      const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
      const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

      const [order] = await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'card',
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            status: 'pending',
            statusHistory: [{ status: 'pending' }],
          },
        ],
        { session }
      );

      createdOrder = order;
    });
  } finally {
    session.endSession();
  }

  res.status(201).json({ success: true, order: createdOrder });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { user: req.user._id };
  if (status && status !== 'all') query.status = status;

  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Get single order (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }

  res.status(200).json({ success: true, order });
});

// @desc    Cancel own order (only allowed while pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.status}` });
  }

  // Restock items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled' });
  await order.save();

  res.status(200).json({ success: true, order });
});

// ----------------- ADMIN -----------------

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // If admin cancels an order that wasn't already cancelled, restock items
  if (status === 'cancelled' && order.status !== 'cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  order.status = status;
  order.statusHistory.push({ status });
  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();
  res.status(200).json({ success: true, order });
});

// @desc    Get order/sales stats for admin dashboard
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = asyncHandler(async (req, res) => {
  const [totalOrders, revenueAgg, statusCounts] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.status(200).json({
    success: true,
    totalOrders,
    totalRevenue: revenueAgg[0] ? revenueAgg[0].total : 0,
    statusCounts,
  });
});
