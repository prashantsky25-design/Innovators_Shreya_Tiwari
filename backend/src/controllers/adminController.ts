import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { Domain } from '../models/Domain.js';
import { AuditLog } from '../models/AuditLog.js';
import { EmailLog } from '../models/EmailLog.js';
import { CoinTransaction } from '../models/CoinTransaction.js';

export const getAdminMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalEvents = await Event.countDocuments();
    const totalAttendances = await Attendance.countDocuments();
    const totalCertificates = await Certificate.countDocuments();
    const coinAgg = await CoinTransaction.aggregate([
      { $group: { _id: null, totalIssued: { $sum: '$amount' } } },
    ]);
    const totalCoinsIssued = coinAgg[0]?.totalIssued || 0;

    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);
    const recentUsers = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalAttendances,
        totalCertificates,
        totalCoinsIssued,
      },
      recentEvents,
      recentUsers,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['participant', 'organizer', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
    res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const moderateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;
    const updates: any = {};
    if (status) updates.status = status;
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);

    const event = await Event.findByIdAndUpdate(id, updates, { new: true });
    res.json({ success: true, message: 'Event status updated', event });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, icon, color } = req.body;
    const domain = await Domain.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      icon: icon || 'Globe',
      color: color || '#6366f1',
      isActive: true,
    });
    res.status(201).json({ success: true, message: 'Domain created', domain });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmailLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
