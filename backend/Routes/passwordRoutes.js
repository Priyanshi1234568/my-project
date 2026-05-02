const express = require('express');
const router  = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

router.post('/forgot',
  [body('email').isEmail().withMessage('Valid email required')],
  validate,
  forgotPassword
);

router.post('/reset',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  resetPassword
);

module.exports = router;