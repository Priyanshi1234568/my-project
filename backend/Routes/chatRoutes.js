const express = require('express');
const router  = express.Router();
const {
  handleMessage,
  getHistory,
  assignAgent,
  getPendingChats,
  closeConversation
} = require('../Controllers/chatController');
const { protect }    = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimitMiddleware');
const { validate, chatRules } = require('../middleware/validationMiddleware');

router.post('/message',             chatLimiter, chatRules, validate, handleMessage);
router.get('/history/:sessionId',   getHistory);
router.put('/close/:sessionId',     protect(['user', 'agent', 'admin']), closeConversation);
router.post('/assign-agent',        protect(['admin']), assignAgent);
router.get('/pending',              protect(['admin']), getPendingChats);

module.exports = router;