const mongoose = require('mongoose');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
require('dotenv').config();

const products = [
  {
    id: 1,
    title: "Pan Card",
    description: "Pan card use daily life",
    price: "200",
    src: "https://i.pinimg.com/736x/dd/19/b9/dd19b9cf4869fbf1d1583b58d472acea.jpg",
  },
  {
    id: 2,
    title: "Aadhar Services",
    description: "Link and update Aadhar easily",
    price: "150",
    src: "https://tse1.mm.bing.net/th/id/OIP.o6ileBbQ2OgIGwwfbvA1FgHaEK?pid=Api&P=0&h=180",
  },
  {
    id: 3,
    title: "Driving License",
    description: "Apply or renew your driving license",
    price: "500",
    src: "https://tse3.mm.bing.net/th/id/OIP.LqR0EJ-AjUpJPEfPaQsUwwAAAA?pid=Api&P=0&h=180",
  },
  {
    id: 4,
    title: "Library Membership",
    description: "Access thousands of books and journals",
    price: "300",
    src: "https://tse2.mm.bing.net/th/id/OIP.WvUt-DFKsFEl7x7ITQ3Y-QHaEK?pid=Api&P=0&h=180",
  },
  {
    id: 5,
    title: "E-Library Access",
    description: "Online access to premium e-books",
    price: "250",
    src: "https://tse1.mm.bing.net/th/id/OIP.S6yPGpFAcbA7GdLp1ZBGxAHaEK?pid=Api&P=0&h=180",
  },
  {
    id: 6,
    title: "Health Insurance",
    description: "Affordable health coverage plans",
    price: "2000",
    src: "https://d28c6jni2fmamz.cloudfront.net/Health_Insurance_69c35c8189.jpg",
  },
  {
    id: 7,
    title: "Car Insurance",
    description: "Protect your vehicle against damages",
    price: "3500",
    src: "https://tse2.mm.bing.net/th/id/OIP.xm3dwe9AOwqKtZA8kD4-tgHaEC?pid=Api&P=0&h=180",
  },
  {
    id: 8,
    title: "Life Insurance",
    description: "Secure your family's future",
    price: "5000",
    src: "https://tse3.mm.bing.net/th/id/OIP.u2stUyWPQ29LJa1UguBogQHaFL?pid=Api&P=0&h=180",
  },
  {
    id: 9,
    title: "Travel Insurance",
    description: "Safe travel with full coverage",
    price: "1200",
    src: "https://tse3.mm.bing.net/th/id/OIP.b65CnF686bgukC1y2In1oAHaHa?pid=Api&P=0&h=180",
  },
  {
    id: 10,
    title: "Partner Program",
    description: "Join our partner program & earn rewards",
    price: "0",
    src: "https://tse1.mm.bing.net/th/id/OIP.atW3AqAYCCC2odQATGJI7wHaEG?pid=Api&P=0&h=180",
  },
  {
    id: 11,
    title: "Business Partner",
    description: "Grow with our partnership opportunities",
    price: "0",
    src: "https://tse4.mm.bing.net/th/id/OIP.DCNb7PbC72YSD0oBoaVPQQHaHa?pid=Api&P=0&h=180",
  },
  {
    id: 12,
    title: "Digital Services",
    description: "Get access to online government services",
    price: "100",
    src: "https://tse4.mm.bing.net/th/id/OIP.UHbLZ8RpYt9AO-wJNlAkkwHaE8?pid=Api&P=0&h=180",
  },
];

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shivalik_service_hub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Admin.deleteMany({});

    console.log('Cleared existing data');

    // Insert products
    await Product.insertMany(products);
    console.log('Products seeded successfully');

    // Create default admin user
    const admin = new Admin({
      username: 'admin',
      password: 'admin123' // This will be hashed automatically
    });

    await admin.save();
    console.log('Default admin user created');
    console.log('Username: admin');
    console.log('Password: admin123');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
