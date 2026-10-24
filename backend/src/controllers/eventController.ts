import { Request, Response } from 'express';
import { Event } from '../models/Event.js';
import { Domain } from '../models/Domain.js';
import { AuthRequest } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';

// Helper to slugify title
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .concat(`-${Date.now().toString(36)}`);
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      domain,
      search,
      priceType, // 'free' | 'paid' | 'all'
      dateFilter, // 'today' | 'this_week' | 'upcoming' | 'all'
      lat,
      lng,
      radiusKm,
      status = 'published',
      featured,
    } = req.query;

    const filter: any = {};

    if (status !== 'all') {
      filter.status = status;
    }

    if (domain && domain !== 'All') {
      filter.domain = domain;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (priceType === 'free') {
      filter.price = 0;
    } else if (priceType === 'paid') {
      filter.price = { $gt: 0 };
    }

    const now = new Date();
    if (dateFilter === 'today') {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter.startDate = { $gte: now, $lte: endOfDay };
    } else if (dateFilter === 'this_week') {
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + 7);
      filter.startDate = { $gte: now, $lte: endOfWeek };
    } else if (dateFilter === 'upcoming' || !dateFilter) {
      filter.endDate = { $gte: now };
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { venueName: searchRegex },
        { address: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Geospatial filtering if coordinates provided
    if (lat && lng && radiusKm) {
      const parsedLat = parseFloat(String(lat));
      const parsedLng = parseFloat(String(lng));
      const parsedRadius = parseFloat(String(radiusKm));

      if (!isNaN(parsedLat) && !isNaN(parsedLng) && !isNaN(parsedRadius)) {
        // Radius in radians = distance in km / earth radius in km (6378.1)
        filter.location = {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [parsedLng, parsedLat],
            },
            $maxDistance: parsedRadius * 1000, // in meters
          },
        };
      }
    }

    const events = await Event.find(filter)
      .populate('organizerId', 'name email avatarUrl organization')
      .sort({ startDate: 1 })
      .limit(100);

    // Compute remaining seats dynamically
    const formattedEvents = events.map((ev) => {
      const remainingSeats = Math.max(0, ev.capacity - ev.registeredCount);
      return {
        ...ev.toObject(),
        remainingSeats,
        isSoldOut: remainingSeats <= 0,
        isPastDeadline: new Date() > new Date(ev.registrationDeadline),
      };
    });

    res.json({
      success: true,
      count: formattedEvents.length,
      events: formattedEvents,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEventBySlugOrId = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = String(req.params.identifier);

    let query: any = { slug: identifier };
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: identifier }, { slug: identifier }] };
    }

    const event = await Event.findOne(query)
      .populate('organizerId', 'name email avatarUrl organization')
      .populate('certificateTemplateId');

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const remainingSeats = Math.max(0, event.capacity - event.registeredCount);

    res.json({
      success: true,
      event: {
        ...event.toObject(),
        remainingSeats,
        isSoldOut: remainingSeats <= 0,
        isPastDeadline: new Date() > new Date(event.registrationDeadline),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const {
      title,
      description,
      domain,
      tags,
      coverImage,
      eligibility,
      startDate,
      endDate,
      registrationDeadline,
      timezone,
      venueName,
      address,
      latitude,
      longitude,
      capacity,
      price,
      instructions,
      isExternal,
      externalSourceUrl,
      certificateEnabled,
      certificateTemplateId,
      galleryEnabled,
      customFields,
      status,
    } = req.body;

    if (!title || !description || !domain || !startDate || !endDate || !venueName || !address) {
      res.status(400).json({
        success: false,
        message: 'Title, description, domain, start date, end date, venue, and address are required.',
      });
      return;
    }

    const lat = parseFloat(latitude) || 28.6139; // Default New Delhi / center fallback
    const lng = parseFloat(longitude) || 77.2090;

    const slug = slugify(title);

    const event = await Event.create({
      title,
      slug,
      description,
      organizerId: req.user._id,
      domain,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      coverImage: coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      eligibility: eligibility || 'Open to All',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline || startDate),
      timezone: timezone || 'Asia/Kolkata',
      venueName,
      address,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      capacity: parseInt(capacity, 10) || 100,
      registeredCount: 0,
      verifiedAttendanceCount: 0,
      price: parseFloat(price) || 0,
      instructions: instructions || '',
      isExternal: Boolean(isExternal),
      externalSourceUrl: externalSourceUrl || '',
      certificateEnabled: certificateEnabled !== false,
      certificateTemplateId: certificateTemplateId || undefined,
      galleryEnabled: galleryEnabled !== false,
      customFields: Array.isArray(customFields) ? customFields : [],
      status: status || 'published',
    });

    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      action: 'EVENT_CREATED',
      targetType: 'Event',
      targetId: event._id.toString(),
      details: { title: event.title, domain: event.domain },
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
    });

    res.status(201).json({
      success: true,
      message: 'Event published successfully',
      event,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (String(event.organizerId) !== String(req.user?._id) && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to modify this event' });
      return;
    }

    const updates = { ...req.body };
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      updates.location = {
        type: 'Point',
        coordinates: [parseFloat(updates.longitude), parseFloat(updates.latitude)],
      };
      delete updates.latitude;
      delete updates.longitude;
    }

    // Never overwrite registeredCount or verifiedAttendanceCount directly
    delete updates.registeredCount;
    delete updates.verifiedAttendanceCount;

    const updated = await Event.findByIdAndUpdate(id, updates, { new: true });

    res.json({ success: true, message: 'Event updated successfully', event: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrganizerEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ organizerId: req.user?._id }).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDomains = async (req: Request, res: Response): Promise<void> => {
  try {
    const domains = await Domain.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, domains });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
