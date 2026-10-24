# EventSphere — Hyperlocal Event Discovery & Community Engagement

EventSphere is a full-stack MERN platform designed for hyperlocal community discovery, verified attendance via tamper-proof QR tickets, automated vector PDF certificate generation, on-site live check-in terminals, website-based event photo galleries, and an engagement-driven EventCoins gamification system.

---

## 🌟 Key Features

1. **Hyperlocal Event Discovery & Maps**
   - Interactive OpenStreetMap integration with Leaflet for geospatial radius exploration.
   - Real database seat tracking, remaining capacity meters, and category domain filters (`AI/ML`, `Web Development`, `Cybersecurity`, `Hackathons`, `Startups`, `Workshops`, etc.).
   - Multi-view explorer: Grid View, List View, and Interactive Map View.

2. **Digital Passbook & QR Tickets**
   - Opaque cryptographic ticket tokens (`ESP-XXXXXX-XXXXXX`) embedded into high-resolution QR codes.
   - Atomic capacity checks preventing overselling and race conditions.
   - Automated transactional email delivery of passes with asynchronous queue worker.

3. **Live Attendance Check-In & Anti-Fraud**
   - Mobile and desktop QR camera scanner with real-time video processing (`html5-qrcode`).
   - Server-generated timestamps recording verified on-site check-in.
   - Atomic MongoDB unique compound index preventing duplicate scans ("Already checked in at HH:MM").
   - Instant audio feedback and live turnout analytics for organizers.

4. **Deterministic PDF Certificates**
   - Vector PDF generation using `pdfkit`.
   - Incorporates participant name, event title, date, unique serial number (`CERT-YYYY-XXXX-XXXX`), and verification QR code.
   - Public cryptographic verification portal (`/certificates/verify/:id`).

5. **Gamification & EventCoins Wallet**
   - **+10 EventCoins** awarded per verified on-site attendance.
   - Milestone badges: *First Step Pioneer*, *5 Events Milestone*, *10 Events Sphere Champion*, and *100-Coin Centurion Club*.
   - Tamper-proof transaction ledger with idempotency keys.
   - Privacy-conscious community leaderboard with participant opt-in toggle.

6. **Website Photo Galleries (No Attachments)**
   - Event-specific photo album manager for organizers to upload and curate photographs.
   - Full-screen responsive lightbox modal with keyboard navigation.
   - In-app notifications and email links sent to attendees when albums are published.

7. **Unified Participant & Organizer Dashboards**
   - Participant profile with verified attendance counter, active passes, certificates, and coin wallet.
   - Organizer multi-step event wizard with click-to-pin map coordinates picker, attendee roster, and CSV export.
   - Admin governance portal for user role assignments, domain creation, and audit logging.

8. **Theme & Responsiveness**
   - Dark/Light mode toggle with persistent state across all pages, forms, and maps.
   - Responsive layouts optimized for desktop, tablet, and mobile screens (with mobile bottom navigation).

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Leaflet, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express.js (REST API), TypeScript (`tsx`) |
| **Database** | MongoDB with Mongoose (Local, Atlas, or auto-configured in-memory MongoDB) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing, Role-Based Access Control |
| **QR Engine** | `qrcode` (Generation) & `html5-qrcode` (Live Camera Scanning) |
| **Certificates** | `pdfkit` Vector PDF Generator |
| **Queue / Async**| BullMQ + Redis (with resilient in-memory queue fallback with deduplication and retries) |
| **Email** | Nodemailer with SMTP & auto-provisioned Ethereal test inbox |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm or pnpm

### 2. Run the Application

The project is structured as a monorepo. You can run backend and frontend independently or concurrently:

#### Start Backend:
```bash
cd backend
npm install
npm run dev
```
*The backend automatically connects to MongoDB (or launches an embedded in-memory MongoDB if no URI is provided) and seeds all initial data.*

#### Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🔑 Pre-Seeded Demo Credentials

All test accounts are pre-seeded with rich data and are accessible with one-click buttons on the Login page:

| Role | Email | Password | Details |
|---|---|---|---|
| **Participant** | `participant@eventsphere.io` | `Password123!` | Aarav Sharma (Active passes, attended events, certificates, 40 EventCoins) |
| **Organizer** | `organizer@eventsphere.io` | `Password123!` | Marcus Vance (Hosted events, QR scanner access, gallery management) |
| **Admin** | `admin@eventsphere.io` | `Password123!` | Elena Rostova (Governance, user RBAC management, audit logs) |

---

## 🧪 Automated End-to-End Verification

To execute the automated end-to-end test suite:
```bash
cd backend
npx tsx src/utils/testWorkflow.ts
```

**Workflow Tested:**
1. Health check & API validation
2. Participant authentication
3. Organizer authentication
4. Event discovery & capacity checks
5. Event registration & QR ticket generation
6. Duplicate registration prevention (400 Bad Request)
7. On-site QR ticket scan & attendance recording (+10 EventCoins awarded, PDF certificate generated)
8. Duplicate scan prevention (409 Conflict with timestamp)
9. Verified attendance counter increment (+1)
10. Public certificate verification registry lookup

---

## 📁 Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── config/ (db.ts, env.ts, queue.ts)
│   │   ├── models/ (User, Event, Domain, Registration, Ticket, Attendance, Certificate, PhotoAlbum, CoinTransaction, etc.)
│   │   ├── controllers/ (auth, events, registrations, attendance, certificates, gallery, rewards, admin)
│   │   ├── routes/ (authRoutes, eventRoutes, registrationRoutes, attendanceRoutes, etc.)
│   │   ├── services/ (ticketService, certificatePdfService, coinService, emailService, storageService)
│   │   ├── utils/ (seedData.ts, testWorkflow.ts)
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, MobileBottomNav, Footer, EventMap, MapPinPicker, QRScannerModal, PhotoLightbox)
│   │   ├── context/ (AuthContext, ThemeContext)
│   │   ├── pages/
│   │   │   ├── public/ (LandingPage, ExploreEvents, EventDetail, EventGalleryPage, LeaderboardPage, VerifyCertificate, Login, Signup)
│   │   │   ├── participant/ (ParticipantDashboard, MyTicketsPage, AttendanceHistoryPage, CertificatesPage, RewardsPage, NotificationsPage, ProfileSettingsPage)
│   │   │   ├── organizer/ (OrganizerDashboard, CreateEditEventPage, ManageRegistrationsPage, QRScannerPage, CertificateEditorPage, GalleryManagerPage)
│   │   │   └── admin/ (AdminDashboard)
│   │   ├── services/ (api.ts)
│   │   ├── types/ (index.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── package.json (root scripts)
```
