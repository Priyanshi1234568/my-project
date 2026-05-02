const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true, trim: true },
  title:       { type: String },
  content:     { type: String, required: true },
  lastScraped: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);