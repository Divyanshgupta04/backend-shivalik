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
    console.log('MongoDB connected for debugging...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugUserOrders = async () => {
  try {
    await connectDB();
    
    // Find the test user
    const testUser = await User.findOne({ email: 'sonugupta25795@gmail.com' });
    
    if (!testUser) {
      console.log('❌ Test user not found!');
      return;
    }
    
    console.log('✅ Test user found:');
    console.log('   ID:', testUser._id);
    console.log('   Name:', testUser.name);
    console.log('   Email:', testUser.email);
    console.log('   Cart items:', testUser.cart?.length || 0);
    
    // Find orders for this user using userId
    const ordersByUserId = await Order.find({ userId: testUser._id });
    console.log(`\n🔍 Orders found by userId (${testUser._id}):`);
    console.log('   Count:', ordersByUserId.length);
    
    // Find orders by email (backup method)
    const ordersByEmail = await Order.find({ userEmail: 'sonugupta25795@gmail.com' });
    console.log(`\n🔍 Orders found by email:`);
    console.log('   Count:', ordersByEmail.length);
    
    if (ordersByEmail.length > 0) {
      console.log('\n📦 Order Details:');
      ordersByEmail.forEach((order, index) => {
        console.log(`   ${index + 1}. Order #${order._id.toString().slice(-6)}`);
        console.log(`      Status: ${order.status}`);
        console.log(`      Total: ₹${order.total}`);
        console.log(`      User ID: ${order.userId}`);
        console.log(`      User Email: ${order.userEmail}`);
        console.log(`      Items: ${order.items?.length || 0}`);
      });
      
      // Check if user IDs match
      const mismatchedOrders = ordersByEmail.filter(order => 
        order.userId.toString() !== testUser._id.toString()
      );
      
      if (mismatchedOrders.length > 0) {
        console.log(`\n⚠️  Found ${mismatchedOrders.length} orders with mismatched user IDs. Fixing...`);
        
        for (const order of mismatchedOrders) {
          order.userId = testUser._id;
          await order.save();
          console.log(`   ✅ Fixed order #${order._id.toString().slice(-6)}`);
        }
        
        console.log('\n✅ All order user IDs fixed!');
      } else {
        console.log('\n✅ All orders have correct user IDs');
      }
    } else {
      console.log('\n❌ No orders found for test user');
    }
    
    // Test the API endpoint logic
    console.log('\n🧪 Testing API endpoint logic...');
    const apiTestOrders = await Order.find({ userId: testUser._id })
      .sort({ createdAt: -1 })
      .select('_id status total orderDate estimatedDelivery items');
    
    console.log(`   API would return ${apiTestOrders.length} orders`);
    if (apiTestOrders.length > 0) {
      console.log('   Sample order structure:');
      console.log('   ', JSON.stringify({
        _id: apiTestOrders[0]._id,
        status: apiTestOrders[0].status,
        total: apiTestOrders[0].total,
        orderDate: apiTestOrders[0].orderDate,
        items: apiTestOrders[0].items?.length || 0
      }, null, 4));
    }
    
    mongoose.disconnect();
    console.log('\n✅ Debug completed successfully!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the debug
debugUserOrders();