import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Domain } from '../models/Domain.js';
import { Event } from '../models/Event.js';
import { CertificateTemplate } from '../models/CertificateTemplate.js';
import { Achievement } from '../models/Achievement.js';
import { Registration } from '../models/Registration.js';
import { Ticket } from '../models/Ticket.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { PhotoAlbum } from '../models/PhotoAlbum.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { Notification } from '../models/Notification.js';
import { generateTicketCode, generateTicketToken, generateQRCodeDataUrl } from '../services/ticketService.js';
import { generateCertificatePdf } from '../services/certificatePdfService.js';
import { config } from '../config/env.js';

export const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('🌱 Database already populated. Skipping initial seed.');
      return;
    }

    console.log('🌱 Seeding fresh database with EventSphere demo data...');

    // 1. Achievements
    await Achievement.create([
      {
        code: 'FIRST_STEP',
        title: 'First Step Pioneer',
        description: 'Verified attendance at your very first community event.',
        badgeIcon: 'Compass',
        category: 'attendance',
        threshold: 1,
        bonusCoins: 5,
        tier: 'bronze',
      },
      {
        code: 'EXPLORER_5',
        title: '5 Events Milestone',
        description: 'Attended 5 verified community events across the sphere.',
        badgeIcon: 'Award',
        category: 'attendance',
        threshold: 5,
        bonusCoins: 25,
        tier: 'silver',
      },
      {
        code: 'CHAMPION_10',
        title: '10 Events Sphere Champion',
        description: 'Attended 10 verified events. A true pillar of the hyperlocal community.',
        badgeIcon: 'ShieldCheck',
        category: 'attendance',
        threshold: 10,
        bonusCoins: 50,
        tier: 'gold',
      },
      {
        code: 'CENTURION_100',
        title: '100-Coin Centurion Club',
        description: 'Accumulated 100 or more EventCoins through verified community actions.',
        badgeIcon: 'Trophy',
        category: 'coins',
        threshold: 100,
        bonusCoins: 50,
        tier: 'platinum',
      },
    ]);

    // 2. Domains
    const domainsData = [
      { name: 'AI/ML', slug: 'ai-ml', description: 'Artificial Intelligence, LLMs, Neural Nets, and Deep Learning', icon: 'Cpu', color: '#6366f1' },
      { name: 'Web Development', slug: 'web-dev', description: 'Full stack development, React, Next.js, Cloud APIs', icon: 'Code', color: '#0ea5e9' },
      { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Ethical hacking, threat analysis, cryptography, network security', icon: 'Shield', color: '#ef4444' },
      { name: 'Hackathons', slug: 'hackathons', description: 'Intensive 24-48 hour prototype competitions and prizes', icon: 'Zap', color: '#f59e0b' },
      { name: 'Startups & Pitch', slug: 'startups', description: 'Founder meetups, venture funding, product demos, pitch nights', icon: 'Rocket', color: '#10b981' },
      { name: 'Workshops & Bootcamps', slug: 'workshops', description: 'Hands-on practical training and expert mentorship', icon: 'BookOpen', color: '#8b5cf6' },
      { name: 'Cultural & Arts', slug: 'cultural', description: 'Music, theatre, design exhibitions, and creative workshops', icon: 'Palette', color: '#ec4899' },
      { name: 'Community Meetups', slug: 'meetups', description: 'Casual networking, fireside chats, open source mixers', icon: 'Users', color: '#14b8a6' },
    ];
    await Domain.create(domainsData);

    // 3. Users
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    const adminUser = await User.create({
      name: 'Elena Rostova (Admin)',
      email: 'admin@eventsphere.io',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      organization: 'EventSphere Core Governance',
      interests: ['AI/ML', 'Cybersecurity', 'Startups & Pitch'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      eventCoinsBalance: 150,
      totalCoinsEarned: 150,
      eventsAttendedCount: 12,
      badges: ['FIRST_STEP', 'EXPLORER_5', 'CHAMPION_10', 'CENTURION_100'],
    });

    const organizerUser = await User.create({
      name: 'Marcus Vance',
      email: 'organizer@eventsphere.io',
      passwordHash: defaultPasswordHash,
      role: 'organizer',
      organization: 'TechInnovate Global Lab',
      interests: ['AI/ML', 'Web Development', 'Hackathons'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      eventCoinsBalance: 80,
      totalCoinsEarned: 80,
      eventsAttendedCount: 6,
      badges: ['FIRST_STEP', 'EXPLORER_5'],
    });

    const participantUser = await User.create({
      name: 'Aarav Sharma',
      email: 'participant@eventsphere.io',
      passwordHash: defaultPasswordHash,
      role: 'participant',
      organization: 'National Institute of Tech',
      interests: ['AI/ML', 'Hackathons', 'Web Development'],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      eventCoinsBalance: 40,
      totalCoinsEarned: 40,
      eventsAttendedCount: 4,
      badges: ['FIRST_STEP'],
    });

    // 4. Default Certificate Template
    const defaultTemplate = await CertificateTemplate.create({
      organizerId: organizerUser._id,
      name: 'TechInnovate Official Certificate of Excellence',
      title: 'CERTIFICATE OF ACCOMPLISHMENT',
      subtitle: 'PROUDLY CONFERRED UPON',
      bodyText: 'for demonstrated technical excellence, active engagement, and verified attendance at',
      signatureName: 'Marcus Vance',
      signatureTitle: 'Lead Convener & Program Director',
      primaryColor: '#4338ca',
      accentColor: '#d97706',
      borderStyle: 'golden',
      showQr: true,
      isDefault: true,
    });

    // 5. Events (Rich Hyperlocal Dataset with Coordinates)
    const now = new Date();
    const eventPast = await Event.create({
      title: 'Hyperlocal AI & Generative Tech Summit 2026',
      slug: 'hyperlocal-ai-generative-tech-summit-2026',
      description: 'An elite gathering of machine learning engineers, founders, and researchers exploring on-device inference, multimodality, and community AI initiatives. Features interactive live code sprints, architecture teardowns, and networking sessions.',
      organizerId: organizerUser._id,
      domain: 'AI/ML',
      tags: ['AI', 'LLM', 'Python', 'Inference'],
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      eligibility: 'Open to All Developers & Students',
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      venueName: 'Innovators Hub, Cyber Tech Park',
      address: 'Plot 44, Tech Boulevard, Sector 62, Noida, NCR',
      location: { type: 'Point', coordinates: [77.3621, 28.6280] },
      capacity: 120,
      registeredCount: 88,
      verifiedAttendanceCount: 76,
      price: 0,
      instructions: 'Please bring your laptop with Node.js and Python installed.',
      certificateEnabled: true,
      certificateTemplateId: defaultTemplate._id,
      galleryEnabled: true,
      status: 'completed',
      isFeatured: true,
    });

    const eventUpcoming1 = await Event.create({
      title: 'Full Stack React 19 & Next-Gen Web Architecture',
      slug: 'full-stack-react-19-next-gen-architecture',
      description: 'Deep dive into concurrent React, Server Actions, Edge caching, and modern web vitals. Learn how to design scalable client-side and server-rendered micro-frontends with high performance.',
      organizerId: organizerUser._id,
      domain: 'Web Development',
      tags: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      eligibility: 'Web Developers & Frontend Specialists',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      venueName: 'Auditorium Alpha, Connaught Place',
      address: 'Barakhamba Road, Connaught Place, New Delhi',
      location: { type: 'Point', coordinates: [77.2273, 28.6304] },
      capacity: 150,
      registeredCount: 42,
      verifiedAttendanceCount: 0,
      price: 0,
      instructions: 'WiFi and charging docks provided. Check-in starts 30 minutes prior.',
      certificateEnabled: true,
      certificateTemplateId: defaultTemplate._id,
      galleryEnabled: true,
      status: 'published',
      isFeatured: true,
    });

    const eventUpcoming2 = await Event.create({
      title: 'Hyperlocal 36-Hour Open Innovation Hackathon',
      slug: 'hyperlocal-36-hour-open-hackathon',
      description: 'Build breakthrough open-source solutions tackling urban sustainability, civic services, and hyperlocal logistics. Mentors from top tech firms, seed grant funding, and community demo day.',
      organizerId: organizerUser._id,
      domain: 'Hackathons',
      tags: ['Hackathon', 'OpenSource', 'Bounties', 'Startups'],
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      eligibility: 'Teams of 2 to 4 members',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // In 7 days
      endDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      venueName: 'Innovation Foundry, IIIT Campus',
      address: 'Okhla Phase III, Near Govind Puri Metro, New Delhi',
      location: { type: 'Point', coordinates: [77.2715, 28.5447] },
      capacity: 200,
      registeredCount: 110,
      verifiedAttendanceCount: 0,
      price: 0,
      instructions: 'Meals, coffee, sleeping pods, and 1 Gbps fiber internet included.',
      certificateEnabled: true,
      certificateTemplateId: defaultTemplate._id,
      galleryEnabled: true,
      status: 'published',
      isFeatured: true,
    });

    const eventUpcoming3 = await Event.create({
      title: 'CyberDefend: Red Team vs Blue Team Live CTF',
      slug: 'cyberdefend-live-ctf-competition',
      description: 'Hands-on capture-the-flag competition simulating modern cloud misconfigurations, zero-day vulnerabilities, API exploits, and forensic investigation techniques.',
      organizerId: organizerUser._id,
      domain: 'Cybersecurity',
      tags: ['CTF', 'Infosec', 'ReverseEngineering'],
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      eligibility: 'Cybersecurity Enthusiasts',
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      venueName: 'Cyber Range Arena, Cyber City',
      address: 'DLF Cyber City, Tower 10, Gurugram, Haryana',
      location: { type: 'Point', coordinates: [77.0878, 28.4907] },
      capacity: 80,
      registeredCount: 35,
      verifiedAttendanceCount: 0,
      price: 199,
      instructions: 'Pre-configure Kali Linux in a virtualized container.',
      certificateEnabled: true,
      certificateTemplateId: defaultTemplate._id,
      galleryEnabled: true,
      status: 'published',
      isFeatured: false,
    });

    // 6. Seed a completed attendance & certificate for Aarav Sharma (Participant) on the completed event
    const regPast = await Registration.create({
      eventId: eventPast._id,
      userId: participantUser._id,
      status: 'attended',
      registeredAt: new Date(eventPast.startDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    const ticketPastCode = generateTicketCode();
    const ticketPastToken = generateTicketToken(eventPast._id.toString(), participantUser._id.toString(), ticketPastCode);
    const qrPastDataUrl = await generateQRCodeDataUrl(ticketPastToken);

    const ticketPast = await Ticket.create({
      ticketCode: ticketPastCode,
      ticketToken: ticketPastToken,
      eventId: eventPast._id,
      userId: participantUser._id,
      registrationId: regPast._id,
      status: 'checked_in',
      qrDataUrl: qrPastDataUrl,
      checkedInAt: eventPast.startDate,
      checkedInBy: organizerUser._id,
    });

    const attendancePast = await Attendance.create({
      eventId: eventPast._id,
      userId: participantUser._id,
      ticketId: ticketPast._id,
      registrationId: regPast._id,
      verifiedAt: eventPast.startDate,
      verifiedBy: organizerUser._id,
      checkInMethod: 'qr_scan',
      deviceInfo: 'Organizer Mobile Scanner Pro',
    });

    // Coin Transaction for verified attendance
    await CoinTransaction.create({
      userId: participantUser._id,
      eventId: eventPast._id,
      amount: 10,
      balanceAfter: 40,
      type: 'attendance_reward',
      reason: 'Verified Event Attendance Reward',
      idempotencyKey: `attendance_reward_${attendancePast._id}`,
      timestamp: eventPast.startDate,
    });

    // Generate physical certificate PDF
    const certSerial = 'CERT-2026-AI89-721F';
    const certPdfUrl = await generateCertificatePdf({
      certificateId: certSerial,
      participantName: participantUser.name,
      eventTitle: eventPast.title,
      eventDate: eventPast.startDate.toLocaleDateString('en-US', { dateStyle: 'long' }),
      organizerName: 'Marcus Vance',
      organizerRole: 'Lead Convener, TechInnovate',
      verificationUrl: `${config.frontendUrl}/certificates/verify/${certSerial}`,
      template: {
        title: 'CERTIFICATE OF EXCELLENCE',
        subtitle: 'PROUDLY CONFERRED UPON',
        bodyText: 'for demonstrated technical excellence, active engagement, and verified attendance at',
        primaryColor: '#4338ca',
        accentColor: '#d97706',
        showQr: true,
      },
    });

    await Certificate.create({
      certificateId: certSerial,
      eventId: eventPast._id,
      userId: participantUser._id,
      attendanceId: attendancePast._id,
      participantName: participantUser.name,
      eventTitle: eventPast.title,
      eventDate: eventPast.startDate,
      pdfPath: certPdfUrl,
      verificationUrl: `${config.frontendUrl}/certificates/verify/${certSerial}`,
      status: 'issued',
      issuedAt: eventPast.startDate,
    });

    // 7. Seed Official Event Photo Gallery for eventPast
    await PhotoAlbum.create({
      eventId: eventPast._id,
      organizerId: organizerUser._id,
      title: `${eventPast.title} — Official Gallery`,
      description: 'Official stage highlights, interactive hack tables, keynote presentations, and closing ceremony photos.',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
          caption: 'Opening keynote by industry researchers on transformer architectures',
          uploadedAt: new Date(eventPast.endDate.getTime() + 2 * 60 * 60 * 1000),
          uploadedBy: organizerUser._id as any,
        },
        {
          url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
          caption: 'Active participant collaboration and breakout discussion tables',
          uploadedAt: new Date(eventPast.endDate.getTime() + 2 * 60 * 60 * 1000),
          uploadedBy: organizerUser._id as any,
        },
        {
          url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
          caption: 'Hands-on live deployment workshop and interactive code sprints',
          uploadedAt: new Date(eventPast.endDate.getTime() + 3 * 60 * 60 * 1000),
          uploadedBy: organizerUser._id as any,
        },
        {
          url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
          caption: 'Closing celebration and community awards presentation',
          uploadedAt: new Date(eventPast.endDate.getTime() + 4 * 60 * 60 * 1000),
          uploadedBy: organizerUser._id as any,
        },
      ],
      isPublished: true,
      publishedAt: new Date(eventPast.endDate.getTime() + 4 * 60 * 60 * 1000),
    });

    // 8. Seed an Active Registration & QR Ticket for Aarav on upcoming Event 1
    const regUpcoming = await Registration.create({
      eventId: eventUpcoming1._id,
      userId: participantUser._id,
      status: 'registered',
      registeredAt: new Date(),
    });

    const ticketUpcomingCode = generateTicketCode();
    const ticketUpcomingToken = generateTicketToken(
      eventUpcoming1._id.toString(),
      participantUser._id.toString(),
      ticketUpcomingCode
    );
    const qrUpcomingDataUrl = await generateQRCodeDataUrl(ticketUpcomingToken);

    await Ticket.create({
      ticketCode: ticketUpcomingCode,
      ticketToken: ticketUpcomingToken,
      eventId: eventUpcoming1._id,
      userId: participantUser._id,
      registrationId: regUpcoming._id,
      status: 'active',
      qrDataUrl: qrUpcomingDataUrl,
    });

    // 9. Initial Notifications for demo participant
    await Notification.create([
      {
        userId: participantUser._id,
        title: '🎟️ Ticket Confirmed: React 19 Summit',
        message: 'Your QR ticket pass for Full Stack React 19 is ready.',
        type: 'ticket',
        link: '/participant/tickets',
        isRead: false,
      },
      {
        userId: participantUser._id,
        title: '📸 Photo Gallery Published',
        message: 'Photos for Hyperlocal AI Summit are now viewable on the website gallery.',
        type: 'gallery',
        link: `/events/${eventPast.slug}/gallery`,
        isRead: false,
      },
      {
        userId: participantUser._id,
        title: '🎓 Certificate Available',
        message: 'Your Certificate of Excellence for Hyperlocal AI Summit is ready to download.',
        type: 'certificate',
        link: '/participant/certificates',
        isRead: true,
      },
      {
        userId: participantUser._id,
        title: '🎉 +10 EventCoins Earned!',
        message: 'Verified attendance reward credited to your EventSphere wallet.',
        type: 'coins',
        link: '/participant/rewards',
        isRead: true,
      },
    ]);

    console.log('✅ Demo data seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Demo Credentials:');
    console.log('   Admin:       admin@eventsphere.io       / Password123!');
    console.log('   Organizer:   organizer@eventsphere.io   / Password123!');
    console.log('   Participant: participant@eventsphere.io / Password123!');
    console.log('----------------------------------------------------');
  } catch (err: any) {
    console.error('❌ Error during data seeding:', err);
  }
};
