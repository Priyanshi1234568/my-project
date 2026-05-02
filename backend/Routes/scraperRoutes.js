const express = require('express');
const router  = express.Router();
const { scrapeWebsite, getScrapedContent, deleteContent } = require('../controllers/scraperController');
const { protect } = require('../middleware/authMiddleware');

// Admin only
router.post('/',        protect(['admin']), scrapeWebsite);
router.get('/',         protect(['admin']), getScrapedContent);
router.delete('/:id',   protect(['admin']), deleteContent);

module.exports = router;