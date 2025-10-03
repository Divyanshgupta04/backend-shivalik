const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding orders...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample order statuses
const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// Sample customer names and emails
const customers = [
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com' },
  { name: 'Priya Sharma', email: 'priya.sharma@email.com' },
  { name: 'Amit Singh', email: 'amit.singh@email.com' },
  { name: 'Neha Gupta', email: 'neha.gupta@email.com' },
  { name: 'Rohit Patel', email: 'rohit.patel@email.com' },
  { name: 'Kavya Reddy', email: 'kavya.reddy@email.com' },
  { name: 'Vikram Joshi', email: 'vikram.joshi@email.com' },
  { name: 'Ananya Nair', email: 'ananya.nair@email.com' },
  { name: 'Suresh Yadav', email: 'suresh.yadav@email.com' },
  { name: 'Meera Iyer', email: 'meera.iyer@email.com' },
  { name: 'Arjun Malhotra', email: 'arjun.malhotra@email.com' },
  { name: 'Pooja Agarwal', email: 'pooja.agarwal@email.com' },
  { name: 'Karan Kapoor', email: 'karan.kapoor@email.com' },
  { name: 'Deepika Sinha', email: 'deepika.sinha@email.com' },
  { name: 'Rahul Verma', email: 'rahul.verma@email.com' }
];

// Sample addresses
const addresses = [
  {
    fullName: 'Rajesh Kumar',
    phone: '+91 9876543210',
    line1: '123 MG Road',
    line2: 'Near Metro Station',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India'
  },
  {
    fullName: 'Priya Sharma',
    phone: '+91 8765432109',
    line1: '456 CP Market',
    line2: 'Block A',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110001',
    country: 'India'
  },
  {
    fullName: 'Amit Singh',
    phone: '+91 7654321098',
    line1: '789 Marine Drive',
    line2: 'Apartment 12B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India'
  },
  {
    fullName: 'Neha Gupta',
    phone: '+91 6543210987',
    line1: '321 Salt Lake',
    line2: 'Sector V',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700001',
    country: 'India'
  },
  {
    fullName: 'Rohit Patel',
    phone: '+91 5432109876',
    line1: '654 SG Highway',
    line2: 'Near Mall',
    city: 'Ahmedabad',
    state: 'Gujarat',
    postalCode: '380001',
    country: 'India'
  }
];

// Sample products (these should match your existing products)
const sampleProducts = [
  {
    productId: 1,
    title: 'Pan Card',
    description: 'PAN Card application service',
    price: '300000',
    src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3'
  },
  {
    productId: 2,
    title: 'Aadhar Services',
    description: 'Aadhar card related services',
    price: '150',
    src: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3'
  },
  {
    productId: 3,
    title: 'Driving License',
    description: 'Driving license application',
    price: '500',
    src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3'
  },
  {
    productId: 4,
    title: 'Library Membership',
    description: 'Library membership registration',
    price: '300',
    src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3'
  }
];

// Generate random date within last 30 days
const getRandomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random order
const generateOrder = (index) => {
  const customer = customers[index % customers.length];
  const address = addresses[index % addresses.length];
  const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
  
  // Random number of items (1-4)
  const numItems = Math.floor(Math.random() * 4) + 1;
  const items = [];
  let subtotal = 0;
  
  for (let i = 0; i < numItems; i++) {
    const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const price = parseFloat(product.price);
    
    items.push({
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      src: product.src,
      quantity: quantity
    });
    
    subtotal += price * quantity;
  }
  
  const tax = Math.round(subtotal * 0.18); // 18% tax
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping above ₹1000
  const total = subtotal + tax + shipping;
  
  const orderDate = getRandomDate();
  
  return {
    userId: new mongoose.Types.ObjectId(), // Generate fake ObjectId
    userEmail: customer.email,
    userName: customer.name,
    items: items,
    shippingAddress: address,
    payment: {
      razorpay_order_id: `order_${Math.random().toString(36).substr(2, 9)}`,
      razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      razorpay_signature: `sig_${Math.random().toString(36).substr(2, 20)}`,
      amount: total,
      currency: 'INR'
    },
    status: status,
    subtotal: subtotal,
    tax: tax,
    shipping: shipping,
    total: total,
    orderDate: orderDate,
    estimatedDelivery: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
    createdAt: orderDate,
    updatedAt: orderDate
  };
};

const seedOrders = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing orders...');
    await Order.deleteMany({});
    
    console.log('Creating 20 dummy orders...');
    const orders = [];
    
    for (let i = 0; i < 20; i++) {
      orders.push(generateOrder(i));
    }
    
    await Order.insertMany(orders);
    console.log('✅ Successfully created 20 dummy orders!');
    
    // Display summary
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    
    console.log('\n📊 Order Summary:');
    statusCounts.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} orders, ₹${stat.totalRevenue.toLocaleString()} revenue`);
    });
    
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    console.log(`\n🎉 Total Orders: ${totalOrders}`);
    console.log(`💰 Total Revenue: ₹${totalRevenue[0]?.total.toLocaleString() || 0}`);
    
    mongoose.disconnect();
    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seeding
seedOrders();