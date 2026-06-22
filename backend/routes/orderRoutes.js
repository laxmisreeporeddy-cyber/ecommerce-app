const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

// Admin routes (declared before /:id to avoid route collisions)
router.get('/stats', authorize('admin'), getOrderStats);
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

// User routes
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
