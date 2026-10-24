import { Response } from 'express';
import { Event } from '../models/Event.js';
import { Ticket } from '../models/Ticket.js';
import { Attendance } from '../models/Attendance.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import { Certificate } from '../models/Certificate.js';
import { CertificateTemplate } from '../models/CertificateTemplate.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { processVerifiedAttendanceReward } from '../services/coinService.js';
import { generateCertificatePdf } from '../services/certificatePdfService.js';
import { enqueueJob } from '../config/queue.js';
import { buildCertificateEmailHtml } from '../services/emailService.js';
import { config } from '../config/env.js';

export const scanAndVerifyTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tokenOrCode, eventId } = req.body;
    const scannerStaffId = req.user?._id;

    if (!tokenOrCode) {
      res.status(400).json({ success: false, message: 'Ticket QR token or code is required' });
      return;
    }

    // 1. Locate Ticket by ticketToken OR ticketCode
    const ticket = await Ticket.findOne({
      $or: [{ ticketToken: tokenOrCode }, { ticketCode: tokenOrCode }],
    }).populate('userId', 'name email avatarUrl organization');

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Invalid ticket. Ticket token not recognized.' });
      return;
    }

    // 2. Validate Event association
    if (eventId && String(ticket.eventId) !== String(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Ticket mismatch: This ticket is for a different event.',
      });
      return;
    }

    const event = await Event.findById(ticket.eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Authorization: Only the event's organizer, assigned staff, or admin can scan
    if (String(event.organizerId) !== String(scannerStaffId) && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the event organizer or authorized staff can check in attendees.',
      });
      return;
    }

    // 3. Prevent duplicate scans / concurrent check-ins
    // First, check if attendance record already exists
    const existingAttendance = await Attendance.findOne({
      $or: [{ ticketId: ticket._id }, { eventId: event._id, userId: ticket.userId }],
    });

    if (existingAttendance || ticket.status === 'checked_in') {
      const checkInTime = existingAttendance?.verifiedAt
        ? new Date(existingAttendance.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'earlier';

      res.status(409).json({
        success: false,
        isDuplicate: true,
        message: `Already checked in at ${checkInTime}`,
        participant: ticket.userId,
        checkedInAt: existingAttendance?.verifiedAt || ticket.checkedInAt,
        ticketCode: ticket.ticketCode,
      });
      return;
    }

    // 4. Atomic ticket status update
    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: ticket._id, status: 'active' },
      {
        $set: {
          status: 'checked_in',
          checkedInAt: new Date(),
          checkedInBy: scannerStaffId,
        },
      },
      { new: true }
    );

    if (!updatedTicket) {
      // Race condition caught: another staff member just verified it
      res.status(409).json({
        success: false,
        isDuplicate: true,
        message: 'Already checked in just now.',
      });
      return;
    }

    // 5. Create Attendance record with server-generated verifiedAt timestamp
    const attendance = await Attendance.create({
      eventId: event._id,
      userId: ticket.userId,
      ticketId: ticket._id,
      registrationId: ticket.registrationId,
      verifiedAt: new Date(),
      verifiedBy: scannerStaffId,
      checkInMethod: 'qr_scan',
      deviceInfo: req.get('User-Agent') || 'Web QR Scanner',
    });

    // Update Registration status to 'attended'
    await Registration.findByIdAndUpdate(ticket.registrationId, { status: 'attended' });

    // Increment event's verified attendance count
    await Event.findByIdAndUpdate(event._id, { $inc: { verifiedAttendanceCount: 1 } });

    // 6. Trigger Gamification / EventCoins reward (+10 EventCoins, badges)
    const rewardResult = await processVerifiedAttendanceReward(ticket.userId._id, event._id, attendance._id);

    // 7. Automatic Certificate Generation Workflow
    let certificateRecord = null;
    if (event.certificateEnabled) {
      try {
        const participant = await User.findById(ticket.userId);
        const template = await CertificateTemplate.findOne({
          $or: [{ eventId: event._id }, { organizerId: event.organizerId, isDefault: true }],
        });

        const certSerial = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const verificationUrl = `${config.frontendUrl}/certificates/verify/${certSerial}`;

        const pdfPath = await generateCertificatePdf({
          certificateId: certSerial,
          participantName: participant?.name || 'Participant',
          eventTitle: event.title,
          eventDate: event.startDate.toLocaleDateString('en-US', { dateStyle: 'long' }),
          organizerName: template?.signatureName || req.user?.name || 'EventSphere Committee',
          organizerRole: template?.signatureTitle || 'Lead Organizer',
          verificationUrl,
          template: template
            ? {
                title: template.title,
                subtitle: template.subtitle,
                bodyText: template.bodyText,
                primaryColor: template.primaryColor,
                accentColor: template.accentColor,
                borderStyle: template.borderStyle,
                showQr: template.showQr,
              }
            : undefined,
        });

        certificateRecord = await Certificate.create({
          certificateId: certSerial,
          eventId: event._id,
          userId: ticket.userId,
          attendanceId: attendance._id,
          participantName: participant?.name || 'Participant',
          eventTitle: event.title,
          eventDate: event.startDate,
          pdfPath,
          verificationUrl,
          status: 'issued',
          issuedAt: new Date(),
        });

        // In-app notification for certificate
        await Notification.create({
          userId: ticket.userId,
          title: '🎓 Certificate Issued!',
          message: `Your verified certificate for "${event.title}" is ready for download.`,
          type: 'certificate',
          link: '/participant/certificates',
        });

        // Dispatch background email with certificate download link
        if (participant?.email) {
          const certEmailHtml = buildCertificateEmailHtml({
            userName: participant.name,
            eventTitle: event.title,
            certificateId: certSerial,
            downloadLink: `${config.frontendUrl}${pdfPath}`,
          });

          await enqueueJob('SEND_CERTIFICATE_EMAIL', {
            type: 'SEND_CERTIFICATE_EMAIL',
            data: {
              to: participant.email,
              subject: `Your Verified Certificate: ${event.title}`,
              html: certEmailHtml,
            },
          });
        }
      } catch (certErr: any) {
        console.error('⚠️ Failed auto-generating certificate:', certErr.message);
        // Do not fail attendance check-in if certificate generation encounters an issue
      }
    }

    res.json({
      success: true,
      message: 'Attendance verified successfully!',
      participant: ticket.userId,
      ticketCode: ticket.ticketCode,
      verifiedAt: attendance.verifiedAt,
      reward: rewardResult,
      certificateId: certificateRecord?.certificateId || null,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttendanceHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Fetch verified attendance records
    const records = await Attendance.find({ userId })
      .populate({
        path: 'eventId',
        select: 'title slug description coverImage domain startDate venueName address',
      })
      .sort({ verifiedAt: -1 });

    // Fetch associated certificates and coin transactions
    const eventIds = records.map((r) => r.eventId?._id);
    const certificates = await Certificate.find({ userId, eventId: { $in: eventIds } });
    const certMap = new Map();
    certificates.forEach((c) => certMap.set(String(c.eventId), c));

    const enriched = records.map((rec) => ({
      ...rec.toObject(),
      certificate: certMap.get(String(rec.eventId?._id)) || null,
      coinsEarned: 10,
    }));

    res.json({
      success: true,
      totalVerifiedAttended: enriched.length,
      history: enriched,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLiveAttendanceForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (String(event.organizerId) !== String(req.user?._id) && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const attendances = await Attendance.find({ eventId })
      .populate('userId', 'name email avatarUrl organization')
      .populate('ticketId', 'ticketCode')
      .sort({ verifiedAt: -1 });

    res.json({
      success: true,
      totalRegistered: event.registeredCount,
      totalAttended: attendances.length,
      turnoutRate: event.registeredCount > 0 ? Math.round((attendances.length / event.registeredCount) * 100) : 0,
      attendances,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
