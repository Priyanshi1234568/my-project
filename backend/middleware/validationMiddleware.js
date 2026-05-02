const { body, validationResult } = require('express-validator');

// Return validation errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User/Admin/Agent registration validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Login validation rules
const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// FAQ validation rules
const faqRules = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required')
];

// Chat message validation rules
const chatRules = [
  body('message').trim().notEmpty().withMessage('Message cannot be empty')
];

module.exports = { validate, registerRules, loginRules, faqRules, chatRules };