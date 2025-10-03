const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Order = require('../models/Order');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding test user...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test user data
const testUserData = {
  name: 'Test User',
  email: 'dg91499255@gmail.com',
  password: 'temppassword123', // Temp password (not used in OTP system)
  isVerified: true,
  address: {
    fullName: 'Test User',
    phone: '+91 9876543210',
    line1: '123 Test Street',
    line2: 'Near Test Mall',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India'
  },
  cart: [
    {
      productId: 1,
      title: 'Pan Card',
      description: 'PAN Card application service',
      price: '300000',
      src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3',
      quantity: 1
    },
    {
      productId: 2,
      title: 'Aadhar Services', 
      description: 'Aadhar card related services',
      price: '150',
      src: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3',
      quantity: 2
    }
  ],
  lastLogin: new Date()
};

// Sample orders for the test user
const createOrdersForUser = (userId) => {
  const orders = [
    {
      userId: userId,
      userEmail: 'dg91499255@gmail.com',
      userName: 'Test User',
      items: [
        {
          productId: 1,
          title: 'Pan Card',
          description: 'PAN Card application service',
          price: '300000',
          src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3',
          quantity: 1
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        phone: '+91 9876543210',
        line1: '123 Test Street',
        line2: 'Near Test Mall',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India'
      },
      payment: {
        razorpay_order_id: 'order_testuser001',
        razorpay_payment_id: 'pay_testuser001',
        razorpay_signature: 'sig_testuser001',
        amount: 354000, // Including tax and shipping
        currency: 'INR'
      },
      status: 'delivered',
      subtotal: 300000,
      tax: 54000, // 18%
      shipping: 0, // Free shipping
      total: 354000,
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      userId: userId,
      userEmail: 'dg91499255@gmail.com',
      userName: 'Test User',
      items: [
        {
          productId: 2,
          title: 'Aadhar Services',
          description: 'Aadhar card related services',
          price: '150',
          src: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3',
          quantity: 1
        },
        {
          productId: 3,
          title: 'Driving License',
          description: 'Driving license application',
          price: '500',
          src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3',
          quantity: 1
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        phone: '+91 9876543210',
        line1: '123 Test Street',
        line2: 'Near Test Mall',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India'
      },
      payment: {
        razorpay_order_id: 'order_testuser002',
        razorpay_payment_id: 'pay_testuser002',
        razorpay_signature: 'sig_testuser002',
        amount: 817, // Including tax and shipping
        currency: 'INR'
      },
      status: 'shipped',
      subtotal: 650,
      tax: 117, // 18%
      shipping: 50,
      total: 817,
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      userId: userId,
      userEmail: 'dg91499255@gmail.com',
      userName: 'Test User',
      items: [
        {
          productId: 4,
          title: 'Library Membership',
          description: 'Library membership registration',
          price: '300',
          src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3',
          quantity: 3
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        phone: '+91 9876543210',
        line1: '123 Test Street',
        line2: 'Near Test Mall',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India'
      },
      payment: {
        razorpay_order_id: 'order_testuser003',
        razorpay_payment_id: 'pay_testuser003',
        razorpay_signature: 'sig_testuser003',
        amount: 1112, // Including tax and shipping
        currency: 'INR'
      },
      status: 'processing',
      subtotal: 900,
      tax: 162, // 18%
      shipping: 50,
      total: 1112,
      orderDate: new Date(), // Today
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  return orders;
};

const seedTestUser = async () => {
  try {
    await connectDB();
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'dg91499255@gmail.com' });
    
    if (existingUser) {
      console.log('🔄 Test user already exists. Updating orders...');
      
      // Delete existing orders for this user
      await Order.deleteMany({ userId: existingUser._id });
      
      // Create new orders
      const orders = createOrdersForUser(existingUser._id);
      await Order.insertMany(orders);
      
      console.log(`✅ Updated ${orders.length} orders for existing test user!`);
      console.log('\n📋 Test User Login Credentials (OTP System):');
      console.log('Name: Test User');
      console.log('Email: dg91499255@gmail.com');
      console.log('Note: Use OTP authentication - no password needed');
      
    } else {
      console.log('👤 Creating new test user...');
      
      // Create the test user
      const testUser = new User(testUserData);
      await testUser.save();
      
      console.log('✅ Test user created successfully!');
      
      // Create orders for the test user
      const orders = createOrdersForUser(testUser._id);
      await Order.insertMany(orders);
      
      console.log(`✅ Created ${orders.length} orders for test user!`);
      
      console.log('\n📋 Test User Login Credentials (OTP System):');
      console.log('Name: Test User');
      console.log('Email: dg91499255@gmail.com');
      console.log('Note: Use OTP authentication - no password needed');
    }
    
    // Display order summary for the test user
    const userOrders = await Order.find({ userEmail: 'dg91499255@gmail.com' });
    console.log('\n📊 Test User Order Summary:');
    userOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order._id.toString().slice(-6)} - ${order.status.toUpperCase()} - ₹${order.total}`);
      console.log(`   Items: ${order.items.map(item => `${item.title} (x${item.quantity})`).join(', ')}`);
      console.log(`   Date: ${order.orderDate.toLocaleDateString()}`);
    });
    
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    console.log(`\n💰 Total Amount Spent: ₹${totalSpent.toLocaleString()}`);
    console.log(`📦 Total Orders: ${userOrders.length}`);
    
    console.log('\n🎯 Ready to test user features:');
    console.log('1. Login at: http://localhost:5173/signin');
    console.log('   - Enter Name: Test User');
    console.log('   - Enter Email: dg91499255@gmail.com');
    console.log('   - Click "Send OTP" (OTP will be sent to your Gmail)');
    console.log('   - Enter the 5-digit OTP to complete login');
    console.log('2. View account: http://localhost:5173/account');
    console.log('3. Check cart (has 2 items)');
    console.log('4. View order history');
    
    mongoose.disconnect();
    console.log('\n✅ Test user seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding test user:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seeding
seedTestUser();