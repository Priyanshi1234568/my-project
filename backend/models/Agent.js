const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const agentSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  phone:       { type: String },
  role:        { type: String, default: 'agent' },
  isAvailable: { type: Boolean, default: true },  // ← naya field
resetToken:       { type: String, default: null },
resetTokenExpiry: { type: Date,   default: null }
}, { timestamps: true });

agentSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Agent', agentSchema);