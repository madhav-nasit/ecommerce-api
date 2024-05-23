const express = require('express');
const UserRoutes = require('../routes/userRoutes');
const ProductRoutes = require('../routes/productRoutes');
const CartRoutes = require('../routes/cartRoutes');
const OrderRoutes = require('../routes/orderRoutes');
const ChatRoutes = require('../routes/chatRoutes');

const router = express.Router();

router.use('/api/auth', UserRoutes);
router.use('/api/product', ProductRoutes);
router.use('/api/cart', CartRoutes);
router.use('/api/order', OrderRoutes);
router.use('/api/chat', ChatRoutes);

module.exports = router;
