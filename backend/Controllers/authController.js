const jwt   = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User  = require('../models/User');
const Admin = require('../models/Admin');
const Agent = require('../models/Agent');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── USER ────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ token: generateToken(user._id, user.role), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: generateToken(user._id, user.role), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN ───────────────────────────────────────────
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = await Admin.create({ name, email, password });
    res.status(201).json({ token: generateToken(admin._id, admin.role), admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: generateToken(admin._id, admin.role), admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── AGENT ───────────────────────────────────────────
exports.registerAgent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await Agent.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Agent already exists' });

    const agent = await Agent.create({ name, email, password, phone });
    res.status(201).json({ token: generateToken(agent._id, agent.role), agent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const agent = await Agent.findOne({ email });
    if (!agent || !(await bcrypt.compare(password, agent.password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: generateToken(agent._id, agent.role), agent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};