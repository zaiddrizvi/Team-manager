import Notification from '../models/Notification.js';

const populateNotification = [
  { path: 'actor', select: 'name email role' },
  { path: 'project', select: 'title' },
  { path: 'task', select: 'title status' }
];

export const getNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate(populateNotification)
      .sort({ createdAt: -1 })
      .limit(limit);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, readAt: null });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { readAt: new Date() },
      { new: true }
    ).populate(populateNotification);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, readAt: null },
      { readAt: new Date() }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
