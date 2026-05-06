const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  getAllConversations,
  getConversationById,
  getStats,
  getAllAgents,
  getAllUsers,
  createAgent,
  deleteUser,
  deleteAgent
} = require('../Controllers/adminController');

router.get('/stats', protect(['admin']), getStats);

router.get('/conversations', protect(['admin']), getAllConversations);
router.get('/conversations/:id', protect(['admin']), getConversationById);

router.get('/agents', protect(['admin']), getAllAgents);
router.post('/agents', protect(['admin']), createAgent);
router.delete('/agents/:id', protect(['admin']), deleteAgent);

router.get('/users', protect(['admin']), getAllUsers);
router.delete('/users/:id', protect(['admin']), deleteUser);

module.exports = router;