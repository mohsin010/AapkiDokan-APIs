const express = require('express');

const router = express.Router();

const AuthRoutes = require('./auth');
const CommonRoutes = require('./common');
const StoreRoutes = require('./store');
const CategoryRoutes = require('./category');
const ProductRoutes = require('./product');
const CartRoutes = require('./cart');
const UserRoutes = require('./user');
const OrderRoutes = require('./order');
const CouponRoutes = require('./coupon');
const NotificationRoutes = require('./notification');

router.use('/auth', AuthRoutes);
router.use('/store', StoreRoutes);
router.use('/category', CategoryRoutes);
router.use('/product', ProductRoutes);
router.use('/cart', CartRoutes);
router.use('/user', UserRoutes);
router.use('/order', OrderRoutes);
router.use('/coupon', CouponRoutes);
router.use('/notification', NotificationRoutes);
router.use('/', CommonRoutes);

module.exports = router;
