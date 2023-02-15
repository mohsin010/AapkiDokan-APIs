const router = require('express').Router();
const jwtAuth = require('../../../middlewares/jwt-auth');
const NotificationController = require('../../../controllers/customer/notification');

router.get('/', jwtAuth, NotificationController.getNotifications);
router.delete('/', jwtAuth, NotificationController.deleteNotifications);

module.exports = router;
