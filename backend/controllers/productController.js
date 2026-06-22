const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/error');

// @desc    Get all products (with search, filter, sort, pagination)
// @route   GET /api/products
// @access  Public
// Query params: search, category, minPrice, maxPrice, sort, page, limit
exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (category) {
    query.category = category;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price-asc') sortOption = { price: 1 };
  if (sort === 'price-desc') sortOption = { price: -1 };
  if (sort === 'name') sortOption = { name: 1 };
  if (sort === 'rating') sortOption = { rating: -1 };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, product });
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, imageUrl, sku } = req.body;

  if (!name || !description || price === undefined || !category) {
    return res.status(400).json({ success: false, message: 'Name, description, price, and category are required' });
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock: stock || 0,
    imageUrl,
    sku,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const allowedFields = ['name', 'description', 'price', 'category', 'stock', 'imageUrl', 'sku', 'isActive'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  await product.save();
  res.status(200).json({ success: true, product });
});

// @desc    Delete a product (soft delete by deactivating)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Hard delete -- swap for product.isActive = false; product.save(); if you prefer soft deletes
  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product removed' });
});

// @desc    Get distinct product categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.status(200).json({ success: true, categories });
});
