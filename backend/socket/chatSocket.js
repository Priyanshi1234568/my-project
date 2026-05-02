const Conversation = require('../models/Conversation');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // User joins their conversation room
    socket.on('join_room', ({ sessionId }) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined room: ${sessionId}`);
    });

    // User or agent sends a message
    socket.on('send_message', async ({ sessionId, sender, text }) => {
  try {
    if (!sessionId || !sender || !text) {
      return socket.emit('message_error', { message: 'sessionId, sender and text are required' });
    }

    const timestamp = new Date();

    const conversation = await Conversation.findOneAndUpdate(
      { sessionId },
      { $push: { messages: { sender, text, timestamp } } },
      { new: true }
    );

    if (!conversation) {
      return socket.emit('message_error', { message: 'Conversation not found' });
    }

    io.to(sessionId).emit('receive_message', {
      sender,
      text,
      timestamp
    });
  } catch (err) {
    socket.emit('message_error', { message: 'Failed to send message' });
  }
});

    // Agent joins an assigned conversation
    socket.on('agent_join', ({ sessionId, agentName }) => {
      socket.join(sessionId);
      // Notify user that agent has joined
      io.to(sessionId).emit('receive_message', {
        sender:    'bot',
        text:      `Agent ${agentName} has joined the conversation.`,
        timestamp: new Date()
      });
    });

    // User or agent closes the conversation
    socket.on('close_conversation', async ({ sessionId }) => {
      try {
        await Conversation.findOneAndUpdate(
          { sessionId },
          { status: 'closed' }
        );
        io.to(sessionId).emit('conversation_closed', {
          message: 'This conversation has been closed.'
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to close conversation' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

module.exports = { initSocket };