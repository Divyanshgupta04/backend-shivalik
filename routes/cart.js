const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to continue' });
  }
  next();
};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('cart');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      cart: user.cart || [],
      itemCount: user.cart ? user.cart.reduce((total, item) => total + item.quantity, 0) : 0
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Verify product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({
        productId: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        src: product.src,
        quantity: quantity
      });
    }

    await user.save();

    const itemCount = user.cart.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: user.cart,
      itemCount
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private
router.put('/update', requireAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      user.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      user.cart[itemIndex].quantity = quantity;
    }

    await user.save();

    const itemCount = user.cart.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: user.cart,
      itemCount
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    const itemCount = user.cart.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: user.cart,
      itemCount
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear all items from cart
// @access  Private
router.delete('/clear', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      cart: [],
      itemCount: 0
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart/sync
// @desc    Sync local cart with server cart (for when user logs in)
// @access  Private
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { localCart = [] } = req.body;

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Merge local cart with server cart
    for (const localItem of localCart) {
      const existingItemIndex = user.cart.findIndex(item => item.productId === localItem.productId);
      
      if (existingItemIndex >= 0) {
        // Add quantities if item exists
        user.cart[existingItemIndex].quantity += localItem.quantity;
      } else {
        // Verify product exists before adding
        const product = await Product.findOne({ id: localItem.productId });
        if (product) {
          user.cart.push({
            productId: localItem.productId,
            title: localItem.title,
            description: localItem.description,
            price: localItem.price,
            src: localItem.src,
            quantity: localItem.quantity
          });
        }
      }
    }

    await user.save();

    const itemCount = user.cart.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      message: 'Cart synced successfully',
      cart: user.cart,
      itemCount
    });

  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
