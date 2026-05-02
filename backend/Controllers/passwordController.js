const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Admin  = require('../models/Admin');
const Agent  = require('../models/Agent');
const { sendResetEmail } = require('../services/emailService');

// Helper — find user across all 3 models
const findByEmail = async (email) => {
  return (
    await User.findOne({ email })  ||
    await Admin.findOne({ email }) ||
    await Agent.findOne({ email })
  );
};

// Helper — find model by role
const getModel = (role) => {
  if (role === 'admin') return Admin;
  if (role === 'agent') return Agent;
  return User;
};

// Step 1 — Send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findByEmail(email);

    // Always return success (don't reveal if email exists)
    if (!user) return res.json({ message: 'If this email exists, a reset link has been sent' });

    // Generate a secure token
    const resetToken  = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    // Save token and expiry to user
    const Model = getModel(user.role);
    await Model.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry: tokenExpiry
    });

    await sendResetEmail(email, resetToken);

    res.json({ message: 'If this email exists, a reset link has been sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2 — Reset the password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Search all 3 models for matching token
    let user  = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) user = await Admin.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) user = await Agent.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const Model = getModel(user.role);

    // Hash new password and clear reset token
    const hashed = await bcrypt.hash(newPassword, 10);
    await Model.findByIdAndUpdate(user._id, {
      password:         hashed,
      resetToken:       null,
      resetTokenExpiry: null
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};