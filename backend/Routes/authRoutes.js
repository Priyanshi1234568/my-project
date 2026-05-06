const express = require('express');
const router  = express.Router();

const {
  registerUser, loginUser,
  registerAdmin, loginAdmin,
  registerAgent, loginAgent
} = require('../Controllers/authController');

const { validate, registerRules, loginRules } = require('../middleware/validationMiddleware');

// ✅ REMOVE ... (spread)
router.post('/user/register',  ...registerRules, validate, registerUser);
router.post('/user/login',     ...loginRules,    validate, loginUser);

router.post('/admin/register', ...registerRules, validate, registerAdmin);
router.post('/admin/login',    ...loginRules,    validate, loginAdmin);

router.post('/agent/register', ...registerRules, validate, registerAgent);
router.post('/agent/login',    ...loginRules,    validate, loginAgent);
module.exports = router;