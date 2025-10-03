const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  price: String,
  src: String,
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0
    }
  },
  cart: [CartItemSchema],
  address: {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' }
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
UserSchema.methods.generateOTP = function() {
  const otp = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    attempts: 0
  };
  return otp;
};

// Method to verify OTP
UserSchema.methods.verifyOTP = function(candidateOTP) {
  if (!this.otp || !this.otp.code) {
    return { valid: false, message: 'No OTP found' };
  }
  
  if (this.otp.expiresAt < new Date()) {
    return { valid: false, message: 'OTP has expired' };
  }
  
  if (this.otp.attempts >= 3) {
    return { valid: false, message: 'Too many failed attempts' };
  }
  
  if (this.otp.code !== candidateOTP) {
    this.otp.attempts += 1;
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid
  this.otp = undefined; // Clear OTP after successful verification
  return { valid: true };
};

// Method to clear expired OTP
UserSchema.methods.clearExpiredOTP = function() {
  if (this.otp && this.otp.expiresAt < new Date()) {
    this.otp = undefined;
  }
};

module.exports = mongoose.model('User', UserSchema);
