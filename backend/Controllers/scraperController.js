const { scrapeAndSave } = require('../services/scraperService');
const WebsiteContent    = require('../models/WebsiteContent');

// Website scrape karo (Admin trigger karega)
exports.scrapeWebsite = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL required' });

    const result = await scrapeAndSave(url);
    res.json({ message: 'Website scraped successfully', title: result.title });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Scraped content list dekho
exports.getScrapedContent = async (req, res) => {
  try {
    const contents = await WebsiteContent.find().select('url title lastScraped').sort({ lastScraped: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Content delete karo
exports.deleteContent = async (req, res) => {
  try {
    await WebsiteContent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};