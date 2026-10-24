# Elevate — From Connections to Creations

<div align="center">
  <img src="frontend/public/logo.png" alt="Elevate Logo" width="480" />
  <p><strong>A Production-Ready Hyperlocal Event Discovery, Verified Attendance, and Community Engagement Platform</strong></p>

  [![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-innovators--gamma.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://innovators-gamma.vercel.app/)

  <br />

  [![Vite](https://img.shields.io/badge/Frontend-React_19_+_Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind_CSS_v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/Database-MongoDB_+_Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Firebase](https://img.shields.io/badge/Auth-Firebase_+_Google_OAuth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Render](https://img.shields.io/badge/Deployment-Render_+_Vercel-46E3B7?logo=render&logoColor=white)](https://render.com/)

  <br />
  <p>🔗 <strong>Live Production URL:</strong> <a href="https://innovators-gamma.vercel.app/">https://innovators-gamma.vercel.app/</a></p>
</div>

---

## 📖 Executive Summary

**Elevate** (*"From Connections to Creations"*) is a full-stack MERN application built to solve the challenges of **hyperlocal event discovery, physical community engagement, and verifiable credentialing**. 

Traditional event platforms either act merely as listing directories or fail to solve the physical on-site check-in trust problem. Elevate bridges this gap by offering:
- **Interactive Geospatial Discovery**: Real-time geolocation and Leaflet maps for discovering community workshops, hackathons, and meetups in your neighborhood.
- **Tamper-Proof QR Tickets & Anti-Fraud Check-In**: Cryptographically signed opaque ticket tokens with atomic database locks preventing duplicate admissions or scalping.
- **Automated Deterministic PDF Certificates**: Instant vector PDF certificate issuance upon verified physical attendance, backed by a public verification registry.
- **In-App Website Photo Galleries**: High-resolution event photographs accessible through website albums with full-screen lightboxes—eliminating oversized email attachments.
- **Gamification & EventCoins**: An engagement economy awarding EventCoins (+10 per verified event), unlocking milestone badges, and maintaining an opt-in privacy-conscious leaderboard.
- **Role-Based Portals**: Tailored interfaces and strict backend authorization for **Participants**, **Organizers**, and **Platform Administrators**.
- **Modern Authentication**: Secure local credential management, self-service password recovery, and native **"Continue with Google"** powered by Firebase Authentication.

---

## 🌟 Comprehensive Feature Breakdown

### 1. Hyperlocal Discovery & Interactive Geospatial Map
- **Geospatial Proximity Search**: Uses browser Geolocation APIs and Leaflet + OpenStreetMap to pinpoint nearby events within a configurable radius slider (5 km to 50 km).
- **Multi-View Modes**: Switch dynamically between **Grid View** (responsive cards), **List View** (compact tabular data), and **Map View** (interactive cluster markers with venue popups).
- **Category Domain Filtering**: Instant filtering across domains including `AI/ML`, `Web Development`, `Software Development`, `Data Science`, `Cybersecurity`, `Blockchain`, `Hackathons`, `Startups`, `Workshops`, `Sports`, `Cultural Events`, and `Community Meetups`.
- **Real Database Seat Tracking**: Live capacity calculations reflecting actual database registrations and remaining seat counters. External events clearly show original sources without fabricated attendance.

### 2. Multi-Step Event Creation & Management Studio
- **Multi-Step Form Wizard**: Guides organizers through 4 structured steps:
  1. *Basic Details*: Title, slug, domain, eligibility, tags, and cover image upload.
  2. *Schedule & Venue*: Start date/time, end date/time, registration deadlines, timezone, venue address, and interactive click-to-pin coordinate picker.
  3. *Tickets & Custom Form Builder*: Capacity limits, pricing, attendee instructions, and dynamic registration questions (text, dropdown, multiple-choice).
  4. *Certificates & Galleries*: Toggle deterministic PDF certificates and website photo gallery permissions.
- **Event Editing & Lifecycle**: Dedicated `/organizer/events/:id/edit` suite allowing organizers to update event details, modify instructions, or adjust capacity in real time.

### 3. Cryptographic QR Tickets & Digital Passbook
- **Secure Ticket Generation**: Generates opaque ticket identifiers (`ESP-XXXXXX-XXXXXX`) signed with HMAC-SHA256 tokens to prevent forgery or brute-force guessing.
- **Atomic Registration Flow**: Uses MongoDB atomic transactions and capacity limits to prevent race-condition overselling.
- **Automated Email Dispatch**: Asynchronous worker automatically delivers ticket passes and high-resolution QR codes to the participant's verified inbox.
- **Participant Passbook**: Direct mobile access to QR tickets from `/participant/tickets` with high-contrast screen brightness compatibility for rapid scanning at venue gates.

### 4. Live Check-In Terminal & Anti-Fraud Scanner
- **Dual-Mode Scanner**: Offers both **Live Video Camera Scanner** (`html5-qrcode`) with real-time barcode decoding and **Manual Code Entry** with instant keyboard shortcuts.
- **Strict Concurrency Locking**: Prevents duplicate camera feeds in React StrictMode through dynamic DOM ID isolation and start-lock mutices.
- **Duplicate Scan Prevention**: Atomic MongoDB compound index (`{ eventId: 1, ticketId: 1 }`) ensures that repeat scans immediately output *"Already checked in at [Timestamp]"*, blocking duplicate admissions.
- **Immediate Event Triggers**: Valid scans update the live attendee roster, increment the verified attendance counter, dispatch +10 EventCoins, and trigger the automated certificate pipeline.

### 5. Deterministic Vector PDF Certificates
- **Deterministic Generation**: Uses `pdfkit` to generate crisp, print-ready A4 landscape vector PDFs with custom borders, organization branding, recipient name, event details, and signatures.
- **Verification QR Code & Serial Number**: Every certificate includes a unique verification serial (`CERT-YYYY-XXXX-XXXX`) and an embedded verification QR code.
- **Public Verification Registry**: Anyone can scan the certificate QR or visit `/certificates/verify/:certificateId` to authenticate the attendee's name, event details, and official server-validated timestamp.
- **Email Delivery**: Automatically dispatches a direct download link or PDF attachment to the verified attendee upon check-in.

### 6. Website Photo Galleries (No Email Attachments)
- **Album Management for Organizers**: Organizers can upload high-resolution photographs, reorder images, set album covers, and publish galleries directly from `/organizer/events/:id/gallery`.
- **Responsive Web Lightbox**: Attendees browse photos on the website via a responsive grid and an interactive full-screen lightbox with smooth keyboard (`←` / `→` / `Esc`) and touch navigation.
- **Attendee Notifications**: When an album is published, attendees receive an in-app notification and an optional email containing a direct link to the web gallery.

### 7. Gamification & EventCoins Virtual Economy
- **Verified Attendance Rewards**: +10 EventCoins automatically credited upon verified QR check-in.
- **Tamper-Proof Audit Ledger**: Every transaction is stored in a MongoDB `CoinTransaction` ledger with event references, timestamps, reasons, and idempotency keys to eliminate client-side manipulation.
- **Milestone Achievements**:
  - 🥉 **First Step Pioneer**: Awarded upon 1st verified attendance.
  - 🥈 **Pathfinder (5 Events)**: Awarded upon completing 5 verified events.
  - 🥇 **Sphere Champion (10 Events)**: Awarded upon completing 10 verified events.
  - 💎 **100-Coin Centurion Club**: Unlocked upon earning 100 cumulative EventCoins.
- **Community Leaderboard**: Public ranking displaying participant tiers, badges, and coin balances with opt-in privacy toggles.

### 8. Authentication, RBAC & "Continue with Google"
- **Multi-Provider Authentication**:
  - *Local*: Secure email/password registration with bcrypt salt rounds and JWT session tokens.
  - *Google Sign-In*: Native **"Continue with Google"** powered by Firebase Authentication popup SDK with automatic fallback to Google Identity Services (GIS).
- **Self-Service Password Recovery**: Secure cryptographic token-based forgot/reset password workflow with expiring tokens.
- **Role-Based Access Control (RBAC)**: Backend middleware strictly enforcing roles (`participant`, `organizer`, `admin`) on sensitive endpoints.
- **Profile Customization**: Manage avatars, university/company affiliations, interests, and leaderboard visibility from `/participant/profile`.

### 9. Notifications & Asynchronous Automation
- **In-App Notification Center**: Real-time notifications for registration confirmations, ticket dispatches, event reminders, certificate issuance, and badge unlocks.
- **Queue Workers**: Built with BullMQ + Redis, featuring an automatic, resilient in-memory queue fallback with deduplication and retries so email failures never block user registrations.
- **Audit Logging**: Comprehensive logging of user registrations, logins, role updates, and password changes.

### 10. UI/UX Design System & Accessibility
- **Modern Responsive Design**: Mobile-first architecture featuring compact headers, mobile bottom navigation bar (`MobileBottomNav`), and desktop dashboards.
- **Theme Engine**: Persistent Light/Dark mode toggle with zero flicker, styled using Tailwind CSS and Lucide icons.
- **Touch-Friendly Controls**: Large tap targets, mobile-optimized card lists for attendee tables, and edge-to-edge scrollable category chips.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Tier (Vercel / Local)"]
        UI["React 19 + Vite SPA"]
        Leaflet["OpenStreetMap / Leaflet"]
        QRScanner["html5-qrcode Scanner"]
        FirebaseAuth["Firebase Auth SDK"]
    end

    subgraph Server["Application Tier (Render / Local)"]
        Express["Express.js REST API"]
        AuthMiddleware["JWT & RBAC Middleware"]
        TicketEngine["HMAC Ticket Service"]
        PDFEngine["pdfkit Vector Engine"]
        Queue["BullMQ / Async In-Memory Queue"]
    end

    subgraph Storage["Data & Cloud Tier"]
        MongoDB[("MongoDB Atlas / In-Memory")]
        FirebaseCloud[("Firebase Console")]
        SMTP["Nodemailer / Ethereal SMTP"]
    end

    UI -->|REST API / JSON| Express
    FirebaseAuth -->|Google ID Token| Express
    Express --> AuthMiddleware
    AuthMiddleware --> TicketEngine
    AuthMiddleware --> PDFEngine
    TicketEngine --> MongoDB
    PDFEngine --> MongoDB
    Express --> Queue
    Queue --> SMTP
    Express --> MongoDB
```

---

## 🗄️ Database Models (MongoDB Mongoose)

| Model | Purpose | Key Attributes |
|---|---|---|
| **User** | User profiles, roles, and wallets | `name`, `email`, `passwordHash`, `role`, `authProvider`, `googleId`, `eventCoinsBalance`, `badges`, `interests` |
| **Event** | Event listings and geospatial data | `title`, `slug`, `domain`, `location` (GeoJSON Point), `venueName`, `capacity`, `registeredCount`, `verifiedAttendanceCount`, `price` |
| **Registration** | User event registrations | `userId`, `eventId`, `status`, `customAnswers`, `registeredAt` |
| **Ticket** | Cryptographic digital tickets | `ticketCode`, `opaqueToken`, `qrDataUrl`, `status` (`issued`, `checked_in`, `cancelled`) |
| **Attendance** | Verified physical on-site check-in | `eventId`, `ticketId`, `userId`, `scannedBy`, `scannedAt` |
| **Certificate** | Deterministic issued certificates | `certificateId`, `userId`, `eventId`, `pdfUrl`, `verificationQrUrl`, `issuedAt` |
| **PhotoAlbum** | Event web galleries | `eventId`, `organizerId`, `title`, `photos` (`url`, `caption`, `uploadedAt`), `isPublished` |
| **CoinTransaction** | Gamification economy ledger | `userId`, `amount`, `type`, `reason`, `eventId`, `idempotencyKey` |
| **Notification** | User in-app notifications | `userId`, `title`, `message`, `type`, `link`, `isRead` |
| **AuditLog** | Administrative audit trail | `actorId`, `actorEmail`, `action`, `targetType`, `targetId`, `ip`, `userAgent` |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20 & v24)
- **npm** or **pnpm**
- **Git**

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/<your-username>/innovators.git
cd innovators

# Install root, backend, and frontend packages
npm run install:all
```

### 3. Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=elevate_super_secure_jwt_dev_secret_2026
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```
*(Leave `MONGODB_URI` blank to automatically start the embedded in-memory MongoDB server with pre-seeded demo data!)*

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=AIzaSyAnJb225HkTHNJuBpWeyLnNg9hk82e-wgc
VITE_FIREBASE_AUTH_DOMAIN=elevate-1cf86.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=elevate-1cf86
VITE_FIREBASE_STORAGE_BUCKET=elevate-1cf86.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1071242423962
VITE_FIREBASE_APP_ID=1:1071242423962:web:b0fb744cd4434d5008b923
```

### 4. Start Development Servers

Run backend and frontend concurrently:
```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend Client
cd frontend
npm run dev
```

- **Frontend Client**: `http://localhost:5173` (or `5174`)
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Pre-Seeded Demo Credentials

The database automatically seeds 3 pre-configured user accounts accessible via one-click buttons on the Login screen:

| Role | Email | Password | Pre-Configured State |
|---|---|---|---|
| **Participant** | `participant@eventsphere.io` | `Password123!` | Active QR passes, verified attendance records, certificates, 40 EventCoins |
| **Organizer** | `organizer@eventsphere.io` | `Password123!` | Hosted AI & Web Dev events, QR scanner access, photo gallery manager |
| **Admin** | `admin@eventsphere.io` | `Password123!` | Full platform moderation, user RBAC management, audit log access |

*(You can also click **"Continue with Google"** to instantly sign in with your real Google account via Firebase).*

---

## ☁️ Production Deployment

### Frontend (Vercel)
- **Live URL**: [https://innovators-gamma.vercel.app/](https://innovators-gamma.vercel.app/)
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
4. Deploy! Client-side routes are protected by [`frontend/vercel.json`](./frontend/vercel.json).

### Backend (Render)
1. Create a **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Start Command** to `npm start`.
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/elevate`
   - `JWT_SECRET`: `your_random_32_character_secret`
   - `FRONTEND_URL`: `https://innovators-gamma.vercel.app`
6. Deploy! Read [`RENDER_DEPLOYMENT.md`](./RENDER_DEPLOYMENT.md) for full details.

---

## 🧪 Automated Test Suite

Run the full end-to-end integration test suite verifying all 10 core system workflows:

```bash
cd backend
npx tsx src/utils/testWorkflow.ts
```

**Workflows Tested:**
- [x] API Health & Database connectivity
- [x] Participant & Organizer authentication
- [x] Hyperlocal event discovery & geospatial radius calculations
- [x] Capacity constraints & duplicate registration prevention
- [x] Cryptographic QR ticket token generation
- [x] Live QR attendance scanning with timestamp verification
- [x] Anti-fraud duplicate scan rejection (409 Conflict)
- [x] Automatic EventCoins ledger credit (+10) and wallet increment
- [x] Deterministic vector PDF certificate generation
- [x] Public cryptographic verification registry lookup

---

## 📄 License

This project is licensed under the **ISC License**. Built with ❤️ for community organizers, developers, and creators everywhere.
