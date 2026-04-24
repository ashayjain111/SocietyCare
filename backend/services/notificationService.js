const db = require('../models');
const { sendPushNotification } = require('../config/firebase');

class NotificationService {
  // Create in-app notification and optionally send push
  async notify(userId, title, message, type = 'general', referenceId = null, referenceType = null) {
    const notification = await db.Notification.create({
      userId,
      title,
      message,
      type,
      referenceId,
      referenceType,
    });

    // Send push notification if user has FCM token
    const user = await db.User.findByPk(userId);
    if (user?.fcmToken) {
      await sendPushNotification(user.fcmToken, title, message, {
        type,
        referenceId: String(referenceId || ''),
      });
    }

    return notification;
  }

  // Notify multiple users
  async notifyMultiple(userIds, title, message, type = 'general') {
    const notifications = await Promise.all(
      userIds.map((userId) => this.notify(userId, title, message, type))
    );
    return notifications;
  }

  // Notify all residents
  async notifyAllResidents(title, message, type = 'announcement') {
    const residents = await db.User.findAll({ where: { role: 'resident', isActive: true } });
    const userIds = residents.map((r) => r.id);
    return this.notifyMultiple(userIds, title, message, type);
  }

  // Get user notifications
  async getUserNotifications(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return { notifications: rows, total: count, page, totalPages: Math.ceil(count / limit) };
  }

  // Mark as read
  async markAsRead(notificationId, userId) {
    const notification = await db.Notification.findOne({ where: { id: notificationId, userId } });
    if (notification) {
      notification.isRead = true;
      await notification.save();
    }
    return notification;
  }

  // Mark all as read
  async markAllAsRead(userId) {
    await db.Notification.update({ isRead: true }, { where: { userId, isRead: false } });
  }
}

module.exports = new NotificationService();
