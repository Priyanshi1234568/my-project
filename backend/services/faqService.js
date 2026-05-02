const stringSimilarity = require('string-similarity');
const FAQ = require('../models/FAQ');

// Find the best matching FAQ for the user's question
const findBestFAQ = async (userQuestion) => {
  const faqs = await FAQ.find({ isActive: true });
  if (faqs.length === 0) return null;

  const questions = faqs.map(f => f.question);
  const result    = stringSimilarity.findBestMatch(userQuestion, questions);

  // Only return answer if similarity is 60% or above
  if (result.bestMatch.rating >= 0.6) {
    const matched = faqs[result.bestMatchIndex];
    return {
      question:   matched.question,
      answer:     matched.answer,
      similarity: result.bestMatch.rating
    };
  }

  return null;
};

module.exports = { findBestFAQ };