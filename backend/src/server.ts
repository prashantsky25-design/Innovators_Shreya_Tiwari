import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { initQueue, EventJobPayload } from './config/queue.js';
import { sendEmail } from './services/emailService.js';
import { seedInitialData } from './utils/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Allows OpenStreetMap tiles, fonts, and inline styles in production
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static file serving for uploads (Certificates, Covers, Photos)
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Background Job Worker Processor
const handleBackgroundJob = async (job: { id: string; name: string; data: EventJobPayload }) => {
  const { type, data } = job.data;
  switch (type) {
    case 'SEND_TICKET_EMAIL':
    case 'SEND_REMINDER_EMAIL':
    case 'SEND_CERTIFICATE_EMAIL':
    case 'SEND_GALLERY_NOTIFICATION':
      await sendEmail({
        to: data.to,
        subject: data.subject,
        html: data.html,
        type,
      });
      break;
    default:
      console.log(`[Queue Worker] Unhandled job type: ${type}`);
  }
};

// API Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Elevate Hyperlocal API',
    version: '1.0.0',
  });
});

// Production Frontend Static Asset Serving (Single-Service Deployment on Render)
const potentialDistPaths = [
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
];

const distPath = potentialDistPaths.find((p) => fs.existsSync(p));

if (distPath) {
  console.log(`📦 Serving production frontend assets from: ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Centralized Error Handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();
    await initQueue(handleBackgroundJob);

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 Elevate Server active on port: ${config.port}`);
      console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err: any) {
    console.error('Fatal server boot error:', err);
    process.exit(1);
  }
};

startServer();
