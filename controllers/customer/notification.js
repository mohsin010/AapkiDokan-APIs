const NotificationService = require('../../services/notification');
const ResponseService = require('../../common/response');


module.exports = {

  /**
   * Get the push notifications
   */
  async getNotifications(req, res) {
    try {
      const { _user_id: userId } = req._userInfo;
      const filters = {
        userId,
        limit: Number(req.query.limit) || 25,
        offset: Number(req.query.offset) || 0
      };
      const notifications = await NotificationService.getNotifications(filters);
      return res.status(200).send(ResponseService.success(notifications));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  /**
   * Delete push notifications
   */
  async deleteNotifications(req, res) {
    try {
      const { _user_id: userId } = req._userInfo;
      await NotificationService.deleteNotifications(userId);
      return res.status(200).send(ResponseService.success());
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  }
};
