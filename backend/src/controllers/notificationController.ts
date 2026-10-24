import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(40);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ success: true, unreadCount, notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, userId: req.user?._id }, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user?._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
