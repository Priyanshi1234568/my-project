const Conversation = require('../models/Conversation');
const User         = require('../models/User');
const Agent        = require('../models/Agent');
const FAQ          = require('../models/FAQ');

// Get all conversations with pagination
exports.getAllConversations = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 10;
    const status = req.query.status; // filter by status (optional)
    const skip   = (page - 1) * limit;

    const filter = status ? { status } : {};
    const total  = await Conversation.countDocuments(filter);

    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId',        'name email')
      .populate('assignedAgent', 'name email');

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

// Get single conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('userId',        'name email')
      .populate('assignedAgent', 'name email');

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [
      totalChats,
      activeChats,
      pendingChats,
      resolvedChats,
      faqAnswered,
      websiteAnswered,
      agentAnswered,
      totalUsers,
      totalAgents,
      totalFAQs,
      availableAgents
    ] = await Promise.all([
      Conversation.countDocuments(),
      Conversation.countDocuments({ status: 'active' }),
      Conversation.countDocuments({ status: 'pending_agent' }),
      Conversation.countDocuments({ status: 'closed' }),
      Conversation.countDocuments({ source: 'faq' }),
      Conversation.countDocuments({ source: 'website' }),
      Conversation.countDocuments({ source: 'agent' }),
      User.countDocuments(),
      Agent.countDocuments(),
      FAQ.countDocuments({ isActive: true }),
      Agent.countDocuments({ isAvailable: true })
    ]);

    res.json({
      chats: {
        total:    totalChats,
        active:   activeChats,
        pending:  pendingChats,
        resolved: resolvedChats
      },
      sources: {
        faq:     faqAnswered,
        website: websiteAnswered,
        agent:   agentAnswered
      },
      users:           totalUsers,
      agents:          totalAgents,
      availableAgents,
      faqs:            totalFAQs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all agents list
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find()
      .select('-password -resetToken -resetTokenExpiry')
      .sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users list
exports.getAllUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password -resetToken -resetTokenExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an agent by ID
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ message: 'Agent deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new agent by admin
exports.createAgent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = await Agent.findOne({ email });

    if (exists) {
      return res.status(400).json({ message: 'Agent already exists' });
    }

    const agent = await Agent.create({
      name,
      email,
      password,
      phone
    });

    const safeAgent = agent.toObject();
    delete safeAgent.password;
    delete safeAgent.resetToken;
    delete safeAgent.resetTokenExpiry;

    res.status(201).json({
      message: 'Agent created successfully',
      agent: safeAgent
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};