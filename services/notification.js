const mongoose = require('mongoose');
const Notification = require('../models/notification');

module.exports = {

  /**
   * Create a new notification
   */
  createNotification: (notification) => new Notification(notification).save(),

  /**
   * Get the push notifications
   */
  getNotifications: async ({ userId, limit, offset }) => {
    const [count, rows] = await Promise.all([
      Notification.count({
        userId: mongoose.Types.ObjectId(userId)
      }),
      Notification.find({
        userId: mongoose.Types.ObjectId(userId)
      }).skip(offset).limit(limit)
    ]);
    return { count, rows };
  },

  /**
   * Delete push notifications
   */
  deleteNotifications: (userId) => Notification.deleteMany({
    userId: mongoose.Types.ObjectId(userId)
  })
};
