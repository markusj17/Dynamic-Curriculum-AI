const { User } = require('../models');

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (or Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] } // Dont include sensitive info
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile (e.g., L&D Manager updates their own details)
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user) {
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password_hash = req.body.password; 
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser.id,
                email: updatedUser.email,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile', error: error.message });
    }
};