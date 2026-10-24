import { Request, Response } from 'express';
import { Certificate } from '../models/Certificate.js';
import { CertificateTemplate } from '../models/CertificateTemplate.js';
import { AuthRequest } from '../middleware/auth.js';

export const getMyCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const certificates = await Certificate.find({ userId, status: 'issued' })
      .populate('eventId', 'title slug coverImage domain startDate venueName')
      .sort({ issuedAt: -1 });

    res.json({ success: true, count: certificates.length, certificates });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certificate.findOne({ certificateId })
      .populate('eventId', 'title slug venueName startDate domain')
      .populate('userId', 'name email');

    if (!certificate) {
      res.status(404).json({ success: false, message: 'Certificate not found or invalid serial.' });
      return;
    }

    res.json({
      success: true,
      isValid: certificate.status === 'issued',
      certificate: {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        eventDate: certificate.eventDate,
        issuedAt: certificate.issuedAt,
        status: certificate.status,
        pdfPath: certificate.pdfPath,
        event: certificate.eventId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveCertificateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      title,
      subtitle,
      bodyText,
      signatureName,
      signatureTitle,
      primaryColor,
      accentColor,
      borderStyle,
      showQr,
      eventId,
      isDefault,
    } = req.body;

    const organizerId = req.user?._id;

    if (!name) {
      res.status(400).json({ success: false, message: 'Template name is required' });
      return;
    }

    if (isDefault) {
      await CertificateTemplate.updateMany({ organizerId }, { isDefault: false });
    }

    const template = await CertificateTemplate.create({
      organizerId,
      eventId: eventId || undefined,
      name,
      title: title || 'CERTIFICATE OF EXCELLENCE',
      subtitle: subtitle || 'This is proudly presented to',
      bodyText: bodyText || 'for active participation and outstanding commitment demonstrated during the event',
      signatureName: signatureName || req.user?.name || 'Lead Organizer',
      signatureTitle: signatureTitle || 'Event Director',
      primaryColor: primaryColor || '#4338ca',
      accentColor: accentColor || '#d97706',
      borderStyle: borderStyle || 'golden',
      showQr: showQr !== false,
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({ success: true, message: 'Certificate template saved', template });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const templates = await CertificateTemplate.find({ organizerId: req.user?._id }).sort({ createdAt: -1 });
    res.json({ success: true, templates });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
