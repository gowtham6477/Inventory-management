const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');


router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/user/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  
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

    
    const totalPrice = product.price * quantity;

    
    const order = new Order({
      customer: req.user.id,
      product: productId,
      quantity,
      totalPrice
    });
    const createdOrder = await order.save();

    
    product.quantity -= quantity;
    await product.save();

    
    await createdOrder.populate('customer product');
    res.status(201).json(createdOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id', authenticateToken, async (req, res) => {
  const { status, quantity: newQty, product: newProductId } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    
    if (req.user.id !== order.customer.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    
    if (status) {
      order.status = status;
    }

    
    if (newQty != null || newProductId) {
      
      const oldProduct = await Product.findById(order.product);
      if (oldProduct) {
        oldProduct.quantity += order.quantity;
        await oldProduct.save();
      }

      
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

      
      productToUse.quantity -= finalQty;
      await productToUse.save();

      
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


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    
    if (req.user.id !== order.customer.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    
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