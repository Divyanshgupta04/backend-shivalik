const express = require('express');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/email');

const router = express.Router();

// Helper to generate 5-digit OTP
const generateOTP = () => Math.floor(10000 + Math.random() * 90000).toString();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to continue' });
  }
  next();
};

// @route   POST /api/user-auth/register
// @desc    Register user (step 1 - send OTP)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user (not verified yet)
    const user = new User({
      name,
      email,
      password
    });

    // Generate and send OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, name, otp, 'registration');
    
    if (!emailResult.success) {
      // If email sending fails, delete the user
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email for OTP.',
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user-auth/verify-register
// @desc    Verify OTP for registration (step 2)
// @access  Public
router.post('/verify-register', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'Please provide user ID and OTP' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Clear expired OTP
    user.clearExpiredOTP();
    
    // Verify OTP
    const otpResult = user.verifyOTP(otp);
    if (!otpResult.valid) {
      await user.save(); // Save updated attempt count
      return res.status(400).json({ message: otpResult.message });
    }

    // Mark user as verified
    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();

    // Set session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Registration completed successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verify registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user-auth/login
// @desc    Login user (step 1 - send OTP)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ 
        message: 'Please verify your account first',
        needsVerification: true,
        userId: user._id
      });
    }

    // Generate and send OTP for login
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, user.name, otp, 'login');
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.json({
      success: true,
      message: 'Please check your email for login OTP.',
      userId: user._id
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user-auth/verify-login
// @desc    Verify OTP for login (step 2)
// @access  Public
router.post('/verify-login', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'Please provide user ID and OTP' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear expired OTP
    user.clearExpiredOTP();
    
    // Verify OTP
    const otpResult = user.verifyOTP(otp);
    if (!otpResult.valid) {
      await user.save(); // Save updated attempt count
      return res.status(400).json({ message: otpResult.message });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verify login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user-auth/me
// @desc    Get current user
// @access  Private
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password -otp');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      address: user.address || {}
    }
  });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user-auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Failed to logout' });
    }
    
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// @route   POST /api/user-auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId, type } = req.body; // type: 'registration' or 'login'

    if (!userId || !type) {
      return res.status(400).json({ message: 'Please provide user ID and type' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP and store in collection
    const otp = generateOTP();
    await OTP.deleteMany({ email: user.email });
    await OTP.create({ email: user.email, otp });

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, user.name, otp, type);
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully. Please check your email.'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Passwordless OTP: Request OTP (register or login)
router.post('/request-otp', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Please provide name and email' });
    }

    // Find or create user by email (keep returning userId for frontend state)
    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12) + '!A1';
      user = new User({ name, email, password: randomPassword, isVerified: false });
    } else if (name && user.name !== name) {
      user.name = name;
    }
    await user.save();

    // Generate and store OTP in OTP collection (replace previous)
    const otp = generateOTP();
    await OTP.deleteMany({ email: user.email });
    await OTP.create({ email: user.email, otp });

    const emailResult = await sendOTPEmail(user.email, user.name, otp, 'login');
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    return res.json({ success: true, message: 'OTP sent to your email.', userId: user._id });
  } catch (error) {
    console.error('request-otp error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Passwordless OTP: Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ message: 'Please provide user ID and OTP' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate OTP from OTP collection by email
    const otpDoc = await OTP.findOne({ email: user.email, otp });
    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP valid: delete it and sign in
    await OTP.deleteMany({ email: user.email });

    if (!user.isVerified) user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();

    req.session.userId = user._id;
    req.session.user = { id: user._id, name: user.name, email: user.email };

    return res.json({
      success: true,
      message: 'Signed in successfully',
      user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified }
    });
  } catch (error) {
    console.error('verify-otp error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user-auth/address
// @desc    Get current user's address
// @access  Private
router.get('/address', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('address');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, address: user.address || {} });
  } catch (err) {
    console.error('Get address error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user-auth/address
// @desc    Update current user's address
// @access  Private
router.put('/address', requireAuth, async (req, res) => {
  try {
    const { fullName, phone, line1, line2, city, state, postalCode, country } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address = { fullName, phone, line1, line2, city, state, postalCode, country };
    await user.save();

    res.json({ success: true, message: 'Address updated', address: user.address });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
