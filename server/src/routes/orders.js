const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');

/**
 * GET /api/orders
 * Get all orders (admin or authenticated users)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/orders/user/:id
 * Get all orders for a specific user
 */
router.get('/user/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  // Optionally enforce that users can only see their own orders
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const orders = await Order.find({ customer: userId })
      .populate('customer product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/orders
 * Create a new order
 * Body: { product: <productId>, quantity: <number> }
 */
router.post('/', authenticateToken, async (req, res) => {
  const { product: productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient product stock' });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Create order
    const order = new Order({
      customer: req.user.id,
      product: productId,
      quantity,
      totalPrice
    });
    const createdOrder = await order.save();

    // Decrement product stock
    product.quantity -= quantity;
    await product.save();

    // Populate before sending
    await createdOrder.populate('customer product');
    res.status(201).json(createdOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/orders/:id
 * Update an existing order (status, quantity or product)
 * Body can include: { status, quantity, product }
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { status, quantity: newQty, product: newProductId } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optionally enforce that only admins or owners can update
    if (req.user.id !== order.customer.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update status if provided
    if (status) {
      order.status = status;
    }

    // If product or quantity changed, adjust stocks and totalPrice
    if (newQty != null || newProductId) {
      // Restore stock of old product
      const oldProduct = await Product.findById(order.product);
      if (oldProduct) {
        oldProduct.quantity += order.quantity;
        await oldProduct.save();
      }

      // Determine product to use
      const productToUse = newProductId
        ? await Product.findById(newProductId)
        : oldProduct;

      if (!productToUse) {
        return res.status(404).json({ message: 'New product not found' });
      }

      const finalQty = newQty != null ? newQty : order.quantity;
      if (productToUse.quantity < finalQty) {
        return res.status(400).json({ message: 'Insufficient product stock' });
      }

      // Deduct new stock
      productToUse.quantity -= finalQty;
      await productToUse.save();

      // Apply updates
      order.product = productToUse._id;
      order.quantity = finalQty;
      order.totalPrice = productToUse.price * finalQty;
    }

    const updatedOrder = await order.save();
    await updatedOrder.populate('customer product');
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/orders/:id
 * Delete an order and restore product stock
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optionally enforce that only admins or owners can delete
    if (req.user.id !== order.customer.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Restore product stock
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;