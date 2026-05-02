const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: String, enum: ['user', 'bot', 'agent'], required: true },
  text:      { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId:    { type: String, required: true, unique: true },
  messages:     [messageSchema],
  status:       { type: String, enum: ['active', 'pending_agent', 'agent_assigned', 'closed'], default: 'active' },
  assignedAgent:{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent', default: null },
  source:       { type: String, enum: ['faq', 'website', 'agent', 'unknown'], default: 'unknown' }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);