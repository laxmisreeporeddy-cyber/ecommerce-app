const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, users });
});

// @desc    Get single user (admin)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, user });
});

// @desc    Update a user's role or active status (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;

  if (req.params.id === req.user._id.toString() && role && role !== 'admin') {
    return res.status(400).json({ success: false, message: 'You cannot remove your own admin role' });
  }

  const updates = {};
  if (role) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, user });
});

// @desc    Delete a user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User removed' });
});
