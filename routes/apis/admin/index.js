const express = require('express');

const router = express.Router();

const AuthRoutes = require('./auth');
const CategoryRoutes = require('./category');
const StoreRoutes = require('./store');
const CustomerRoutes = require('./customer');
const OrderRoutes = require('./order');
const ProductRoutes = require('./product');
const CouponRoutes = require('./coupon');
const AreaRoutes = require('./area');
const CityRoutes = require('./city');
const StoreCategoryRoutes = require('./store_category');

const ConfigRoutes = require('./config');

const DriverRoutes = require('./driver');
const CommonRoutes = require('./common');

const ReportRoutes = require('./report');
const UserRoutes = require('./user');

const isSuperAdminMiddleware = require('../../../middlewares/is-super-admin');

router.use('/auth', AuthRoutes);
router.use('/category', isSuperAdminMiddleware, CategoryRoutes);
router.use('/store', isSuperAdminMiddleware, StoreRoutes);
router.use('/customer', isSuperAdminMiddleware, CustomerRoutes);
router.use('/order', isSuperAdminMiddleware, OrderRoutes);
router.use('/product', isSuperAdminMiddleware, ProductRoutes);
router.use('/coupon', isSuperAdminMiddleware, CouponRoutes);
router.use('/area', isSuperAdminMiddleware, AreaRoutes);
router.use('/city', isSuperAdminMiddleware, CityRoutes);
router.use('/store-category', isSuperAdminMiddleware, StoreCategoryRoutes);
router.use('/driver', isSuperAdminMiddleware, DriverRoutes);
router.use('/report', isSuperAdminMiddleware, ReportRoutes);
router.use('/config', isSuperAdminMiddleware, ConfigRoutes);
router.use('/user', isSuperAdminMiddleware, UserRoutes);
router.use('/', isSuperAdminMiddleware, CommonRoutes);

module.exports = router;
