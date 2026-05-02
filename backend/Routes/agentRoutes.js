const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { toggleAvailability, getMyChats, getProfile, updateProfile } = require('../controllers/agentController');

router.get('/profile',      protect(['agent']), getProfile);
router.put('/availability', protect(['agent']), toggleAvailability);
router.get('/my-chats',     protect(['agent']), getMyChats);
router.put('/profile', protect(['agent']), updateProfile);

module.exports = router;