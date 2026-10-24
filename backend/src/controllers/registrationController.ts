import { Response } from 'express';
import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Ticket } from '../models/Ticket.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateTicketCode, generateTicketToken, generateQRCodeDataUrl } from '../services/ticketService.js';
import { enqueueJob } from '../config/queue.js';
import { buildTicketEmailHtml } from '../services/emailService.js';
import { config } from '../config/env.js';

export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, customAnswers } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!eventId) {
      res.status(400).json({ success: false, message: 'Event ID is required' });
      return;
    }

    // 1. Fetch event and validate status
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (event.status !== 'published') {
      res.status(400).json({ success: false, message: 'This event is currently not open for registration.' });
      return;
    }

    // Check registration deadline
    const now = new Date();
    if (now > new Date(event.registrationDeadline)) {
      res.status(400).json({ success: false, message: 'Registration for this event has closed.' });
      return;
    }

    // Check existing registration
    const existingReg = await Registration.findOne({ eventId, userId, status: { $ne: 'cancelled' } });
    if (existingReg) {
      res.status(400).json({ success: false, message: 'You are already registered for this event.' });
      return;
    }

    // 2. Atomic capacity check and increment using findOneAndUpdate
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lt: ['$registeredCount', '$capacity'] },
      },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      res.status(400).json({ success: false, message: 'Event is fully booked. No seats remaining.' });
      return;
    }

    // 3. Create Registration
    const registration = await Registration.create({
      eventId: event._id,
      userId,
      status: 'registered',
      customAnswers: customAnswers || {},
      registeredAt: new Date(),
    });

    // 4. Generate unique Ticket and Opaque QR Token
    const ticketCode = generateTicketCode();
    const ticketToken = generateTicketToken(event._id.toString(), userId.toString(), ticketCode);
    const qrDataUrl = await generateQRCodeDataUrl(ticketToken);

    const ticket = await Ticket.create({
      ticketCode,
      ticketToken,
      eventId: event._id,
      userId,
      registrationId: registration._id,
      status: 'active',
      qrDataUrl,
    });

    // 5. In-app notification
    await Notification.create({
      userId,
      title: '🎟️ Registration Confirmed!',
      message: `You are registered for "${event.title}". Your digital ticket is ready.`,
      type: 'ticket',
      link: '/participant/tickets',
    });

    // 6. Asynchronous email job dispatch
    const emailHtml = buildTicketEmailHtml({
      userName: req.user?.name || 'Participant',
      eventTitle: event.title,
      eventDate: event.startDate.toLocaleString(),
      venueName: event.venueName,
      ticketCode: ticket.ticketCode,
      qrDataUrl,
      dashboardLink: `${config.frontendUrl}/participant/tickets`,
    });

    await enqueueJob(
      'SEND_TICKET_EMAIL',
      {
        type: 'SEND_TICKET_EMAIL',
        data: {
          to: req.user?.email,
          subject: `Your Event Ticket: ${event.title}`,
          html: emailHtml,
          ticketCode: ticket.ticketCode,
        },
      },
      { jobId: `ticket-email-${ticket._id}` }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Digital QR ticket generated.',
      registration,
      ticket: {
        id: ticket._id,
        ticketCode: ticket.ticketCode,
        ticketToken: ticket.ticketToken,
        qrDataUrl: ticket.qrDataUrl,
        status: ticket.status,
      },
      remainingSeats: Math.max(0, updatedEvent.capacity - updatedEvent.registeredCount),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ registeredAt: -1 });

    const tickets = await Ticket.find({ userId });
    const ticketMap = new Map();
    tickets.forEach((t) => ticketMap.set(String(t.registrationId), t));

    const enriched = registrations.map((r) => ({
      ...r.toObject(),
      ticket: ticketMap.get(String(r._id)) || null,
    }));

    res.json({ success: true, registrations: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEventRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email avatarUrl organization')
      .sort({ registeredAt: -1 });

    const tickets = await Ticket.find({ eventId });
    const ticketMap = new Map();
    tickets.forEach((t) => ticketMap.set(String(t.registrationId), t));

    const enriched = registrations.map((r) => ({
      ...r.toObject(),
      ticket: ticketMap.get(String(r._id)) || null,
    }));

    res.json({ success: true, count: enriched.length, registrations: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
