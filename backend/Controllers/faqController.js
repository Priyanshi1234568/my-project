const FAQ = require('../models/FAQ');


// Single FAQ
exports.getAllFAQs = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const total = await FAQ.countDocuments({ isActive: true });
    const faqs  = await FAQ.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      faqs,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Naya FAQ add karo (Admin only)
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    const faq = await FAQ.create({ question, answer, category });
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FAQ update karo (Admin only)
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FAQ delete karo (Admin only)
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};