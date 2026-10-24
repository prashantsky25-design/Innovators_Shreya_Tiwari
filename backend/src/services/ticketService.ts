import crypto from 'crypto';
import QRCode from 'qrcode';
import { config } from '../config/env.js';

export const generateTicketCode = (): string => {
  const segment1 = crypto.randomBytes(3).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ESP-${segment1}-${segment2}`;
};

export const generateTicketToken = (eventId: string, userId: string, ticketCode: string): string => {
  const payload = `${eventId}:${userId}:${ticketCode}:${Date.now()}`;
  const hmac = crypto.createHmac('sha256', config.jwtSecret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  // Combine base64 payload and signature for tamper-proof validation
  const tokenString = Buffer.from(`${ticketCode}.${signature}`).toString('base64url');
  return tokenString;
};

export const generateQRCodeDataUrl = async (token: string): Promise<string> => {
  const qrDataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 320,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff',
    },
  });
  return qrDataUrl;
};
