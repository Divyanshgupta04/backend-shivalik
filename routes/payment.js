const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('../utils/email');

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to continue' });
  }
  next();
};

// Initialize Razorpay instance function
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
        throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET in your environment variables.');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
    });
};

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', requireAuth, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Check if Razorpay credentials are configured
        console.log('Checking Razorpay credentials...');
        console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
        console.log('RAZORPAY_SECRET:', process.env.RAZORPAY_SECRET ? 'Present' : 'Missing');
        
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
            console.error('Razorpay credentials not configured');
            return res.status(500).json({ 
                message: 'Payment gateway not configured. Please contact support.' 
            });
        }

        const options = {
            amount: Number(amount * 100), // Convert to paise
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };
        
        const razorpayInstance = getRazorpayInstance();
        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log('Razorpay order creation error:', error);
                return res.status(500).json({ message: "Failed to create payment order" });
            }
            
            res.status(200).json({ 
                success: true,
                data: order,
                key_id: process.env.RAZORPAY_KEY_ID
            });
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
});

// @route   POST /api/payment/verify-payment
// @desc    Verify Razorpay payment and create order
// @access  Private
router.post('/verify-payment', requireAuth, async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderData 
        } = req.body;

        // Verify required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
            return res.status(400).json({ message: 'Missing required payment or order data' });
        }

        // Create signature to verify
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        // Create expected signature
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // Verify signature
        const isAuthentic = expectedSign === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        // Get user details
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate that user has address
        if (!user.address || !user.address.city) {
            return res.status(400).json({ message: 'Please add shipping address before placing order' });
        }

        // Create order in database
        const order = new Order({
            userId: user._id,
            userEmail: user.email,
            userName: user.name,
            items: orderData.items,
            shippingAddress: user.address,
            payment: {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                amount: orderData.total,
                currency: 'INR'
            },
            subtotal: orderData.subtotal,
            tax: orderData.tax || 0,
            shipping: orderData.shipping || 0,
            total: orderData.total
        });

        await order.save();

        // Clear user's cart after successful order
        user.cart = [];
        await user.save();

        // Send confirmation emails
        try {
            await sendOrderConfirmationEmail(user.email, user.name, order);
            await sendAdminOrderNotification(order);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the order creation if emails fail
        }

        res.status(200).json({
            success: true,
            message: "Payment successful and order created",
            orderId: order._id,
            order: {
                id: order._id,
                status: order.status,
                total: order.total,
                orderDate: order.orderDate,
                estimatedDelivery: order.estimatedDelivery
            }
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// @route   GET /api/payment/orders
// @desc    Get user's orders
// @access  Private
router.get('/orders', requireAuth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.session.userId })
            .sort({ createdAt: -1 })
            .select('_id status total orderDate estimatedDelivery items');

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// @route   GET /api/payment/orders/:id
// @desc    Get specific order details
// @access  Private
router.get('/orders/:id', requireAuth, async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;