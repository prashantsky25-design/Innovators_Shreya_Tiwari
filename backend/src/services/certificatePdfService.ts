import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { config } from '../config/env.js';

export interface CertificateData {
  certificateId: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  organizerRole: string;
  verificationUrl: string;
  template?: {
    title?: string;
    subtitle?: string;
    bodyText?: string;
    primaryColor?: string;
    accentColor?: string;
    borderStyle?: string;
    showQr?: boolean;
  };
}

export const generateCertificatePdf = async (data: CertificateData): Promise<string> => {
  const certificatesDir = path.join(config.uploadDir, 'certificates');
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const filename = `cert_${data.certificateId}.pdf`;
  const filePath = path.join(certificatesDir, filename);

  const primaryColor = data.template?.primaryColor || '#4338ca'; // Indigo
  const accentColor = data.template?.accentColor || '#d97706'; // Gold/Amber

  // Pre-generate QR Code buffer if QR is enabled
  let qrBuffer: Buffer | null = null;
  if (data.template?.showQr !== false) {
    qrBuffer = await QRCode.toBuffer(data.verificationUrl, {
      margin: 1,
      width: 100,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
  }

  return new Promise((resolve, reject) => {
    // Landscape A4 certificate: 841.89 x 595.28 pt
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 36, bottom: 36, left: 36, right: 36 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const width = doc.page.width;
    const height = doc.page.height;

    // Background Base
    doc.rect(0, 0, width, height).fill('#fafafa');

    // Outer Ornamental Border
    doc.rect(20, 20, width - 40, height - 40)
      .lineWidth(3)
      .stroke(accentColor);

    // Inner Elegant Border
    doc.rect(28, 28, width - 56, height - 56)
      .lineWidth(1)
      .stroke(primaryColor);

    // Corner Accents
    const cornerSize = 24;
    // Top-left
    doc.polygon([28, 28], [28 + cornerSize, 28], [28, 28 + cornerSize]).fill(accentColor);
    // Top-right
    doc.polygon([width - 28, 28], [width - 28 - cornerSize, 28], [width - 28, 28 + cornerSize]).fill(accentColor);
    // Bottom-left
    doc.polygon([28, height - 28], [28 + cornerSize, height - 28], [28, height - 28 - cornerSize]).fill(accentColor);
    // Bottom-right
    doc.polygon([width - 28, height - 28], [width - 28 - cornerSize, height - 28], [width - 28, height - 28 - cornerSize]).fill(accentColor);

    // Header Badge / Logo representation
    doc.circle(width / 2, 75, 20).fill(primaryColor);
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
      .text('ES', width / 2 - 10, 68, { width: 20, align: 'center' });

    // Certificate Title
    const certTitle = data.template?.title || 'CERTIFICATE OF PARTICIPATION';
    doc.fillColor(primaryColor).fontSize(26).font('Helvetica-Bold')
      .text(certTitle, 0, 110, { align: 'center' });

    // Subtitle
    const certSubtitle = data.template?.subtitle || 'THIS IS PROUDLY PRESENTED TO';
    doc.fillColor('#64748b').fontSize(12).font('Helvetica-Bold')
      .text(certSubtitle, 0, 145, { align: 'center', characterSpacing: 2 });

    // Participant Name (Prominent)
    doc.fillColor('#0f172a').fontSize(32).font('Helvetica-Bold')
      .text(data.participantName, 0, 185, { align: 'center' });

    // Decorative underline beneath participant name
    doc.moveTo(width / 2 - 180, 225).lineTo(width / 2 + 180, 225)
      .lineWidth(2).stroke(accentColor);

    // Body Text
    const bodyDesc = data.template?.bodyText ||
      `for active participation and verified attendance at the hyperlocal event:`;
    doc.fillColor('#475569').fontSize(13).font('Helvetica')
      .text(bodyDesc, 80, 245, { width: width - 160, align: 'center', lineGap: 4 });

    // Event Title
    doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold')
      .text(`"${data.eventTitle}"`, 80, 275, { width: width - 160, align: 'center' });

    // Event Date & Location Text
    doc.fillColor('#64748b').fontSize(11).font('Helvetica')
      .text(`Conducted on ${data.eventDate} • Verified via EventSphere Hyperlocal Network`, 0, 310, { align: 'center' });

    // Verification QR Code & Details (Bottom Left)
    if (qrBuffer) {
      doc.image(qrBuffer, 60, height - 150, { width: 80 });
      doc.fillColor('#64748b').fontSize(8).font('Helvetica')
        .text('Scan to Verify', 60, height - 65, { width: 80, align: 'center' });
    }

    // Certificate ID & Security Seal (Bottom Center)
    doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold')
      .text(`CERTIFICATE ID: ${data.certificateId}`, 0, height - 100, { align: 'center' });
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
      .text('Cryptographically recorded & non-transferable', 0, height - 85, { align: 'center' });

    // Organizer Signature (Bottom Right)
    const sigX = width - 240;
    const sigY = height - 120;
    doc.moveTo(sigX, sigY).lineTo(sigX + 180, sigY).lineWidth(1).stroke('#cbd5e1');
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold')
      .text(data.organizerName || 'Authorized Organizer', sigX, sigY + 8, { width: 180, align: 'center' });
    doc.fillColor('#64748b').fontSize(10).font('Helvetica')
      .text(data.organizerRole || 'EventSphere Committee', sigX, sigY + 24, { width: 180, align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/uploads/certificates/${filename}`));
    stream.on('error', (err) => reject(err));
  });
};
