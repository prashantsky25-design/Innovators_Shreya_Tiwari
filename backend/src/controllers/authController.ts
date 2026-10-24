import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { config } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, organization, interests } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const assignedRole = role === 'organizer' ? 'organizer' : 'participant';

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      organization: organization || '',
      interests: Array.isArray(interests) ? interests : [],
      eventCoinsBalance: 0,
      totalCoinsEarned: 0,
      eventsAttendedCount: 0,
      badges: [],
    });

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    await AuditLog.create({
      actorId: user._id,
      actorEmail: user.email,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        organization: user.organization,
        interests: user.interests,
        eventCoinsBalance: user.eventCoinsBalance,
        eventsAttendedCount: user.eventsAttendedCount,
        badges: user.badges,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    await AuditLog.create({
      actorId: user._id,
      actorEmail: user.email,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        organization: user.organization,
        interests: user.interests,
        eventCoinsBalance: user.eventCoinsBalance,
        totalCoinsEarned: user.totalCoinsEarned,
        eventsAttendedCount: user.eventsAttendedCount,
        badges: user.badges,
        isLeaderboardOptedIn: user.isLeaderboardOptedIn,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl,
        organization: req.user.organization,
        interests: req.user.interests,
        eventCoinsBalance: req.user.eventCoinsBalance,
        totalCoinsEarned: req.user.totalCoinsEarned,
        eventsAttendedCount: req.user.eventsAttendedCount,
        badges: req.user.badges,
        isLeaderboardOptedIn: req.user.isLeaderboardOptedIn,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, organization, interests, avatarUrl, isLeaderboardOptedIn } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (organization !== undefined) user.organization = organization;
    if (Array.isArray(interests)) user.interests = interests;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (isLeaderboardOptedIn !== undefined) user.isLeaderboardOptedIn = Boolean(isLeaderboardOptedIn);

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        organization: user.organization,
        interests: user.interests,
        eventCoinsBalance: user.eventCoinsBalance,
        totalCoinsEarned: user.totalCoinsEarned,
        eventsAttendedCount: user.eventsAttendedCount,
        badges: user.badges,
        isLeaderboardOptedIn: user.isLeaderboardOptedIn,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
