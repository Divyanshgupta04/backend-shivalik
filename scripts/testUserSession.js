const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for session testing...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testUserSession = async () => {
  try {
    await connectDB();
    
    // Find the test user
    const testUser = await User.findOne({ email: 'dg91499255@gmail.com' });
    
    if (!testUser) {
      console.log('❌ Test user not found!');
      return;
    }
    
    console.log('✅ Test user found:');
    console.log('   ID:', testUser._id);
    console.log('   Name:', testUser.name);
    console.log('   Email:', testUser.email);
    console.log('   Is Verified:', testUser.isVerified);
    console.log('   Created:', testUser.createdAt);
    console.log('   Last Login:', testUser.lastLogin);
    
    // Update last login to now (simulate successful login)
    testUser.lastLogin = new Date();
    await testUser.save();
    
    console.log('✅ Updated last login timestamp');
    
    console.log('\n🎯 User is ready for login testing!');
    console.log('📧 Email: dg91499255@gmail.com');
    console.log('👤 Name: Test User');
    console.log('\n💡 Steps to test:');
    console.log('1. Visit: http://localhost:5173/signin');
    console.log('2. Enter name and email');
    console.log('3. Complete OTP verification');
    console.log('4. Visit: http://localhost:5173/account');
    console.log('5. Orders should display automatically');
    
    mongoose.disconnect();
    console.log('\n✅ Session test completed!');
    
  } catch (error) {
    console.error('❌ Session test error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the test
testUserSession();