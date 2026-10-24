import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { EmailLog } from '../models/EmailLog.js';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  if (config.smtp.host && config.smtp.user) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
    console.log(`📧 Configured custom SMTP transporter: ${config.smtp.host}:${config.smtp.port}`);
  } else {
    // Generate an Ethereal test account automatically for zero-friction local testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`📧 Created Ethereal test mail account: ${testAccount.user}`);
    } catch (err: any) {
      console.warn(`⚠️ Could not create Ethereal account (${err.message}). Mail will run in simulated console mode.`);
      // Mock transporter
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: string;
  attachments?: Array<{ filename: string; path?: string; content?: any }>;
}

export const sendEmail = async (options: SendEmailOptions): Promise<{ success: boolean; previewUrl?: string }> => {
  try {
    const activeTransporter = await getTransporter();
    const info = await activeTransporter.sendMail({
      from: config.smtp.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    if (previewUrl) {
      console.log(`📬 [Email Sent] Preview at: ${previewUrl}`);
    } else {
      console.log(`📬 [Email Sent] Sent to ${options.to} (${options.subject})`);
    }

    await EmailLog.create({
      recipient: options.to,
      subject: options.subject,
      type: options.type,
      status: 'sent',
      previewUrl: previewUrl || '',
      metadata: { messageId: info.messageId },
    });

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error(`❌ [Email Error] Failed sending to ${options.to}:`, err.message);
    await EmailLog.create({
      recipient: options.to,
      subject: options.subject,
      type: options.type,
      status: 'failed',
      error: err.message,
    });
    // Requirement: "Email failures must not invalidate successful registrations or attendance."
    return { success: false };
  }
};

export const buildTicketEmailHtml = (params: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  ticketCode: string;
  qrDataUrl: string;
  dashboardLink: string;
}) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0 0 8px; font-size: 26px; font-weight: 700;">EventSphere Ticket Confirmed</h1>
        <p style="margin: 0; opacity: 0.9; font-size: 15px;">Your digital access pass is ready!</p>
      </div>
      <div style="padding: 28px 24px;">
        <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hello <strong>${params.userName}</strong>,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">You have successfully registered for <strong>${params.eventTitle}</strong>. Please present this official QR ticket at the check-in counter on event day.</p>
        
        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <div style="font-size: 12px; font-weight: 700; color: #6366f1; letter-spacing: 0.1em; text-transform: uppercase;">Ticket Pass ID</div>
          <div style="font-size: 20px; font-family: monospace; font-weight: 800; color: #0f172a; margin: 6px 0 16px;">${params.ticketCode}</div>
          <img src="${params.qrDataUrl}" alt="Check-in QR Code" style="width: 180px; height: 180px; display: inline-block; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; padding: 8px;" />
          <div style="font-size: 13px; color: #64748b; margin-top: 10px;">Show this QR code to the event organizers for instant verification</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📅 Date & Time:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${params.eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📍 Venue:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${params.venueName}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${params.dashboardLink}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 12px 28px; font-size: 15px; font-weight: 600; border-radius: 8px; text-decoration: none;">View in Dashboard</a>
        </div>
      </div>
      <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b;">
        EventSphere — Hyperlocal Event Discovery & Community Engagement.
      </div>
    </div>
  `;
};

export const buildCertificateEmailHtml = (params: {
  userName: string;
  eventTitle: string;
  certificateId: string;
  downloadLink: string;
}) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #064e3b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0 0 8px; font-size: 26px; font-weight: 700;">Congratulations on Your Participation!</h1>
        <p style="margin: 0; opacity: 0.9; font-size: 15px;">Your Verified Certificate is Ready</p>
      </div>
      <div style="padding: 28px 24px;">
        <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Dear <strong>${params.userName}</strong>,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Thank you for attending <strong>${params.eventTitle}</strong>. Your attendance has been officially verified, and your personalized Certificate of Completion has been generated.</p>
        
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <div style="font-size: 12px; font-weight: 700; color: #059669; text-transform: uppercase;">Certificate Verification ID</div>
          <div style="font-size: 18px; font-family: monospace; font-weight: 700; color: #065f46; margin-top: 4px;">${params.certificateId}</div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${params.downloadLink}" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 28px; font-size: 15px; font-weight: 600; border-radius: 8px; text-decoration: none;">Download Verified Certificate</a>
        </div>
      </div>
    </div>
  `;
};
