const express = require('express');
const router  = express.Router();
const {
  getAllFAQs, getFAQById,
  createFAQ, updateFAQ, deleteFAQ
} = require('../Controllers/faqController');
const { protect }  = require('../middleware/authMiddleware');
const { validate, faqRules } = require('../middleware/validationMiddleware');

router.get('/',      getAllFAQs);       // supports ?page=1&limit=10
router.get('/:id',   getFAQById);
router.post('/',     protect(['admin']), faqRules, validate, createFAQ);
router.put('/:id',   protect(['admin']), faqRules, validate, updateFAQ);
router.delete('/:id',protect(['admin']), deleteFAQ);

module.exports = router;