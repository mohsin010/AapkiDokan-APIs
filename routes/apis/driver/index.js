const express = require('express');

const router = express.Router();

const AuthRoutes = require('./auth');
const OrderRoutes = require('./order');
const UserRoutes = require('./user');
const NotificationRoutes = require('./notification');

router.use('/auth', AuthRoutes);
router.use('/order', OrderRoutes);
router.use('/user', UserRoutes);
router.use('/notification', NotificationRoutes);


module.exports = router;
