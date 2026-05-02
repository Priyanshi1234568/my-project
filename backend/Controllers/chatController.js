const Conversation = require('../models/Conversation');
const WebsiteContent = require('../models/WebsiteContent');
const Agent = require('../models/Agent');
const { findBestFAQ } = require('../services/faqService');
const { searchInContent } = require('../services/scraperService');
const { v4: uuidv4 } = require('uuid');

const normalizeMessage = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const isGreeting = (message) => {
  const greetings = [
    'hi',
    'hii',
    'hello',
    'hey',
    'heyy',
    'good morning',
    'good afternoon',
    'good evening'
  ];

  return greetings.includes(normalizeMessage(message));
};

const isTooWeakForSearch = (message) => {
  const normalized = normalizeMessage(message);

  if (!normalized) return true;

  // Blocks random tiny messages like: me, ok, aa, ??
  if (normalized.length < 4) return true;

  // Blocks single random word with no meaning, like jfsdjfn
  const meaningfulWords = [
    'admission',
    'admissions',
    'fee',
    'fees',
    'course',
    'courses',
    'program',
    'programs',
    'programme',
    'programmes',
    'scholarship',
    'placement',
    'placements',
    'hostel',
    'refund',
    'university',
    'about',
    'contact',
    'address',
    'location',
    'exam',
    'examination',
    'computer',
    'bca',
    'mca',
    'btech',
    'mba',
    'pharmacy',
    'library',
    'transport'
  ];

  const words = normalized.split(/\s+/);

  if (words.length === 1 && !meaningfulWords.includes(words[0])) {
    return true;
  }

  return false;
};

// Main chat handler — processes message through 3 layers
exports.handleMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const sid = sessionId || uuidv4();

    // Find existing conversation or create a new one
    let conversation = await Conversation.findOne({ sessionId: sid });

    if (!conversation) {
      conversation = await Conversation.create({
        sessionId: sid,
        userId: req.user?.id || null,
        messages: []
      });
    }

    if (conversation.status === 'closed') {
      return res.status(400).json({
        message: 'This conversation has been closed.'
      });
    }

    // Save the user's message
    conversation.messages.push({
      sender: 'user',
      text: message
    });

    let botReply = null;
    let source = 'unknown';

    // ─── GREETING HANDLER ────────────────────────────────
    if (isGreeting(message)) {
      botReply = 'Hello! How can I help you with Career Point University today?';
      source = 'unknown';
    }

    // ─── LAYER 1: FAQ DATABASE SEARCH ────────────────────
    if (!botReply && !isTooWeakForSearch(message)) {
      const faqMatch = await findBestFAQ(message);

      if (faqMatch) {
        botReply = faqMatch.answer;
        source = 'faq';
      }
    }

    // ─── LAYER 2: WEBSITE CONTENT SEARCH ─────────────────
    if (!botReply && !isTooWeakForSearch(message)) {
  const websitePages = await WebsiteContent.find().sort({ lastScraped: -1 });

  let bestWebsiteMatch = null;

  for (const page of websitePages) {
    const found = searchInContent(message, page.content, {
      title: page.title,
      url: page.url
    });

    if (found && (!bestWebsiteMatch || found.score > bestWebsiteMatch.score)) {
      bestWebsiteMatch = {
        answer: found.answer,
        score: found.score,
        title: page.title,
        url: page.url
      };
    }
  }

  if (bestWebsiteMatch) {
    botReply = `Based on our website: ${bestWebsiteMatch.answer}`;
    source = 'website';
  }
}
    // ─── LAYER 3: AGENT ASSIGNMENT ────────────────────────
    if (!botReply) {
      const availableAgent = await Agent.findOne({ isAvailable: true });

      conversation.status = availableAgent ? 'agent_assigned' : 'pending_agent';
      conversation.assignedAgent = availableAgent?._id || null;
      source = 'agent';

      botReply = availableAgent
        ? `I was unable to find an answer to your question. You have been connected to agent ${availableAgent.name}. They will assist you shortly!`
        : 'I was unable to find an answer to your question. No agents are available right now, but someone will contact you soon!';
    }

    // Save the bot's reply
    conversation.messages.push({
      sender: 'bot',
      text: botReply
    });

    conversation.source = source;
    await conversation.save();

    res.json({
      reply: botReply,
      source,
      sessionId: sid,
      agentAssigned: conversation.status === 'agent_assigned',
      conversationId: conversation._id
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get full conversation history by session ID
exports.getHistory = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ sessionId: req.params.sessionId })
      .populate('assignedAgent', 'name email');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manually assign an agent to a conversation Admin only
exports.assignAgent = async (req, res) => {
  try {
    const { conversationId, agentId } = req.body;

    if (!conversationId || !agentId) {
      return res.status(400).json({
        message: 'conversationId and agentId are required'
      });
    }

    const agent = await Agent.findById(agentId);

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        assignedAgent: agentId,
        status: 'agent_assigned',
        source: 'agent'
      },
      { new: true }
    ).populate('assignedAgent', 'name email');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({
      message: 'Agent assigned successfully',
      conversation
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all conversations waiting for an agent Admin only
exports.getPendingChats = async (req, res) => {
  try {
    const pending = await Conversation.find({ status: 'pending_agent' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Close a conversation
exports.closeConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { status: 'closed' },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({
      message: 'Conversation closed successfully',
      conversation
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};