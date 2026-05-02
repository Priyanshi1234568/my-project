const axios = require('axios');
const cheerio = require('cheerio');
const WebsiteContent = require('../models/WebsiteContent');

const cleanText = (text = '') => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/inAcademicEnquiry/gi, ' ')
    .replace(/AdmissionCall UsMenu/gi, ' ')
    .replace(/Call UsMenu/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Scrape the company/university website and save content to the database
const scrapeAndSave = async (url) => {
  try {
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(data);

    // Remove unnecessary HTML elements
    $(
      'script, style, nav, footer, header, noscript, svg, form, button, input, select, textarea'
    ).remove();

    const title = cleanText($('title').first().text());

    const metaDescription = cleanText(
      $('meta[name="description"]').attr('content') || ''
    );

    const headings = [];
    $('h1, h2, h3').each((_, el) => {
      const text = cleanText($(el).text());
      if (text && text.length > 3) headings.push(text);
    });

    const paragraphs = [];
    $('p, li, td, th').each((_, el) => {
      const text = cleanText($(el).text());
      if (text && text.length > 20) paragraphs.push(text);
    });

    const content = cleanText([
      title,
      metaDescription,
      ...headings,
      ...paragraphs
    ].join('. '));

    if (!content || content.length < 50) {
      throw new Error('No readable content found on this page');
    }

    await WebsiteContent.findOneAndUpdate(
      { url },
      {
        url,
        title,
        content,
        lastScraped: new Date()
      },
      { upsert: true, new: true }
    );

    return { title, content };
  } catch (err) {
    throw new Error('Website scraping failed: ' + err.message);
  }
};

// Search stored website content
// Search stored website content
const searchInContent = (question, content, page = {}) => {
  const greetings = [
    'hi',
    'hii',
    'hello',
    'hey',
    'heyy',
    'good morning',
    'good afternoon',
    'good evening'
  ];

  const normalizedQuestion = question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (greetings.includes(normalizedQuestion)) return null;
  if (!normalizedQuestion || normalizedQuestion.length < 4) return null;

  const stopWords = new Set([
    'what', 'where', 'when', 'how', 'can', 'could', 'would', 'should',
    'is', 'are', 'am', 'the', 'a', 'an', 'to', 'of', 'for', 'in', 'on',
    'and', 'or', 'me', 'my', 'i', 'you', 'your', 'please', 'tell',
    'about', 'details', 'detail',
    'kya', 'kaise', 'kab', 'kahan', 'hai', 'hota', 'hoti', 'mujhe',
    'batao', 'btao', 'ke', 'ki', 'ka'
  ]);

  const synonyms = {
    programs: ['program', 'programs', 'course', 'courses', 'programme', 'programmes'],
    program: ['program', 'programs', 'course', 'courses', 'programme', 'programmes'],
    courses: ['course', 'courses', 'program', 'programs', 'programme', 'programmes'],
    course: ['course', 'courses', 'program', 'programs', 'programme', 'programmes'],

    admission: ['admission', 'admissions', 'apply', 'application', 'enquiry'],
    admissions: ['admission', 'admissions', 'apply', 'application', 'enquiry'],

    fees: ['fee', 'fees', 'structure', 'tuition', 'payment', 'deposition', 'installment'],
    fee: ['fee', 'fees', 'structure', 'tuition', 'payment', 'deposition', 'installment'],

    scholarship: ['scholarship', 'financial', 'aid'],
    placement: ['placement', 'placements', 'career', 'job', 'recruitment'],
    hostel: ['hostel', 'accommodation'],
    refund: ['refund', 'withdrawal'],
    computer: ['computer', 'application', 'applications', 'technology', 'bca', 'mca'],
    application: ['computer', 'application', 'applications', 'technology', 'bca', 'mca'],
    technology: ['computer', 'application', 'applications', 'technology']
  };

  let originalWords = normalizedQuestion
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  if (originalWords.length === 0) return null;

  const expandedWords = new Set(originalWords);

  for (const word of originalWords) {
    if (synonyms[word]) {
      synonyms[word].forEach(item => expandedWords.add(item));
    }
  }

  const questionWords = Array.from(expandedWords);

  const pageText = `${page.title || ''} ${page.url || ''}`
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ');

  let pageScore = 0;

  for (const word of originalWords) {
    if (pageText.includes(word)) {
      pageScore += 2;
    }
  }

  const sentences = content
    .split(/[.!?।]/)
    .map(sentence => cleanText(sentence))
    .filter(sentence => {
      const lower = sentence.toLowerCase();

      return (
        sentence.length > 40 &&
        sentence.length < 500 &&
        !lower.includes('menu') &&
        !lower.includes('call us') &&
        !lower.includes('academic enquiry')
      );
    });

  const scored = sentences.map(sentence => {
    const lower = sentence.toLowerCase();

    let sentenceScore = 0;
    let originalWordHits = 0;

    for (const word of originalWords) {
      if (lower.includes(word)) {
        sentenceScore += 3;
        originalWordHits += 1;
      }
    }

    for (const word of questionWords) {
      if (!originalWords.includes(word) && lower.includes(word)) {
        sentenceScore += 1;
      }
    }

    if (lower.includes(normalizedQuestion)) {
      sentenceScore += 5;
    }

    // Page boost only if sentence has at least one real original query word.
    const finalScore = originalWordHits > 0
      ? sentenceScore + pageScore
      : sentenceScore;

    return {
      sentence,
      score: finalScore,
      originalWordHits
    };
  });

  const top = scored
    .filter(item => item.score >= 3 && item.originalWordHits > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (top.length === 0) return null;

  return {
    answer: top.map(item => item.sentence).join('. '),
    score: top[0].score + pageScore
  };
};
module.exports = { scrapeAndSave, searchInContent };