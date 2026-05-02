const Agent        = require('../models/Agent');
const Conversation = require('../models/Conversation');

// Toggle agent availability on/off
exports.toggleAvailability = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    agent.isAvailable = !agent.isAvailable;
    await agent.save();

    res.json({
      message:     `You are now ${agent.isAvailable ? 'available' : 'unavailable'}`,
      isAvailable: agent.isAvailable
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Agent views their assigned conversations
exports.getMyChats = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const total = await Conversation.countDocuments({ assignedAgent: req.user.id });

    const conversations = await Conversation.find({ assignedAgent: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    res.json({
      conversations,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Agent profile
exports.getProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user.id).select('-password -resetToken -resetTokenExpiry');
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Agent updates their own profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const agent = await Agent.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password -resetToken -resetTokenExpiry');

    res.json({ message: 'Profile updated successfully', agent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};