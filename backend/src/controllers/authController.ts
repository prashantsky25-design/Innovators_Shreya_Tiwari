import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { config } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendEmail } from '../services/emailService.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, organization, interests } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
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
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      authProvider: 'local',
      organization: organization || '',
      interests: Array.isArray(interests) ? interests : [],
      eventCoinsBalance: 0,
      totalCoinsEarned: 0,
      eventsAttendedCount: 0,
      badges: [],
      isLeaderboardOptedIn: true,
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
        authProvider: user.authProvider,
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

    if (!user.passwordHash) {
      res.status(401).json({
        success: false,
        message: 'This account was created with Google Sign-In. Please click "Continue with Google" to access your account.',
      });
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
        authProvider: user.authProvider,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Google OAuth / One-Tap & Account Sign-In Endpoint
 * Accepts Google GIS ID Token or verified Google profile payload
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, email, name, avatarUrl, googleId, role } = req.body;

    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedAvatar = avatarUrl;
    let verifiedGoogleId = googleId;

    // If client sent Google Identity Services credential (ID Token), verify it with Google
    if (credential) {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (response.ok) {
          const payload: any = await response.json();
          if (payload.email) {
            verifiedEmail = payload.email;
            verifiedName = payload.name || payload.given_name || payload.email.split('@')[0];
            verifiedAvatar = payload.picture || verifiedAvatar;
            verifiedGoogleId = payload.sub || verifiedGoogleId;
          }
        }
      } catch (err) {
        console.warn('Google tokeninfo fetch warning:', err);
      }
    }

    if (!verifiedEmail) {
      res.status(400).json({
        success: false,
        message: 'Google authentication failed: Email is required.',
      });
      return;
    }

    const normalizedEmail = verifiedEmail.toLowerCase().trim();
    let user = await User.findOne({
      $or: [{ email: normalizedEmail }, ...(verifiedGoogleId ? [{ googleId: verifiedGoogleId }] : [])],
    });

    let isNewUser = false;

    if (user) {
      // User exists, link Google ID and update avatar if not present
      let updated = false;
      if (verifiedGoogleId && !user.googleId) {
        user.googleId = verifiedGoogleId;
        updated = true;
      }
      if (verifiedAvatar && (!user.avatarUrl || user.avatarUrl.includes('placeholder'))) {
        user.avatarUrl = verifiedAvatar;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Create new Google-authenticated user
      isNewUser = true;
      const assignedRole = role === 'organizer' ? 'organizer' : 'participant';
      user = await User.create({
        name: verifiedName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: assignedRole,
        authProvider: 'google',
        googleId: verifiedGoogleId || `goog_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        avatarUrl:
          verifiedAvatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
        eventCoinsBalance: 0,
        totalCoinsEarned: 0,
        eventsAttendedCount: 0,
        badges: [],
        interests: ['Tech', 'Workshops'],
        isLeaderboardOptedIn: true,
      });

      await AuditLog.create({
        actorId: user._id,
        actorEmail: user.email,
        action: 'USER_REGISTERED_GOOGLE',
        targetType: 'User',
        targetId: user._id.toString(),
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    await AuditLog.create({
      actorId: user._id,
      actorEmail: user.email,
      action: isNewUser ? 'USER_GOOGLE_REGISTER' : 'USER_GOOGLE_LOGIN',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
    });

    res.json({
      success: true,
      message: isNewUser ? 'Welcome to EventSphere!' : 'Google sign-in successful',
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
        authProvider: user.authProvider,
      },
    });
  } catch (err: any) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error during Google auth' });
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
        authProvider: req.user.authProvider,
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

    if (name) user.name = name.trim();
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
        authProvider: user.authProvider,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // If user has a passwordHash, verify currentPassword
    if (user.passwordHash) {
      if (!currentPassword) {
        res.status(400).json({ success: false, message: 'Current password is required.' });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password does not match.' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await AuditLog.create({
      actorId: user._id,
      actorEmail: user.email,
      action: 'USER_PASSWORD_CHANGED',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Don't disclose user existence for security
      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    await sendEmail({
      to: normalizedEmail,
      subject: 'EventSphere — Reset Your Password',
      type: 'PASSWORD_RESET',
      html: `<h2>Password Reset Request</h2>
       <p>Hello ${user.name},</p>
       <p>You recently requested to reset your password for your EventSphere account.</p>
       <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a></p>
       <p>Or paste this link in your browser: ${resetUrl}</p>
       <p>This link will expire in 1 hour.</p>`,
    });

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      // In dev mode provide the token for instant demo convenience
      devResetToken: config.nodeEnv === 'development' ? resetToken : undefined,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      res.status(400).json({ success: false, message: 'Token, email, and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await AuditLog.create({
      actorId: user._id,
      actorEmail: user.email,
      action: 'USER_PASSWORD_RESET',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
    });

    res.json({ success: true, message: 'Password has been successfully reset. You may now sign in.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
