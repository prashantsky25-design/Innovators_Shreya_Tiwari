import { Response } from 'express';
import { PhotoAlbum } from '../models/PhotoAlbum.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { enqueueJob } from '../config/queue.js';
import { config } from '../config/env.js';

export const getEventAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const album = await PhotoAlbum.findOne({ eventId }).populate('eventId', 'title slug startDate venueName');

    if (!album) {
      res.json({ success: true, album: { eventId, photos: [], isPublished: false } });
      return;
    }

    res.json({ success: true, album });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addPhotoToAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { url, caption } = req.body;
    const organizerId = req.user?._id;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (String(event.organizerId) !== String(organizerId) && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    let photoUrl = url;
    if (req.file) {
      photoUrl = `/uploads/photos/${req.file.filename}`;
    }

    if (!photoUrl) {
      res.status(400).json({ success: false, message: 'Photo file or URL is required' });
      return;
    }

    let album = await PhotoAlbum.findOne({ eventId });
    if (!album) {
      album = await PhotoAlbum.create({
        eventId: event._id,
        organizerId,
        title: `${event.title} — Official Gallery`,
        photos: [],
      });
    }

    album.photos.push({
      url: photoUrl,
      caption: caption || '',
      uploadedAt: new Date(),
      uploadedBy: organizerId as any,
    });

    await album.save();

    res.status(201).json({ success: true, message: 'Photo uploaded to album', album });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const publishAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const album = await PhotoAlbum.findOne({ eventId });
    if (!album) {
      res.status(404).json({ success: false, message: 'Album not found' });
      return;
    }

    album.isPublished = true;
    album.publishedAt = new Date();
    await album.save();

    // Notify all verified attendees that photographs are published on the website
    const attendances = await Attendance.find({ eventId }).populate('userId', 'email name');
    for (const att of attendances) {
      const user = att.userId as any;
      if (user?._id) {
        await Notification.create({
          userId: user._id,
          title: '📸 New Event Photos Published!',
          message: `Official photos for "${event.title}" are now available in your event portfolio gallery.`,
          type: 'gallery',
          link: `/events/${event.slug}/gallery`,
        });

        if (user.email) {
          await enqueueJob('SEND_GALLERY_NOTIFICATION', {
            type: 'SEND_GALLERY_NOTIFICATION',
            data: {
              to: user.email,
              subject: `Photos Published: ${event.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                  <h2>Official Photos Published</h2>
                  <p>Hi ${user.name},</p>
                  <p>The event organizer has published official photos for <strong>${event.title}</strong>.</p>
                  <p>Access the high-resolution photo gallery directly on EventSphere:</p>
                  <p><a href="${config.frontendUrl}/events/${event.slug}/gallery" style="background: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">View Gallery on EventSphere</a></p>
                </div>
              `,
            },
          });
        }
      }
    }

    res.json({ success: true, message: 'Photo album published! Attendees notified.', album });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
