# Deploying Elevate on Render

This guide provides simple, step-by-step instructions to deploy the complete **Elevate** MERN platform on [Render](https://render.com).

---

## Architecture Overview

Elevate is configured as a **unified production full-stack service**:
- The Node/Express backend serves the **REST API** (`/api/*`), handles QR token verification, PDF generation, background queues, and authentication.
- The same service serves the optimized **React + Vite single-page application** (`frontend/dist`) for all web requests.
- **Benefits**:
  - Requires only **1 single Free Tier Web Service** on Render.
  - Zero cross-origin (CORS) or domain mismatch issues.
  - Automatic SSL / HTTPS out of the box.

---

## Prerequisites

1. A free [GitHub](https://github.com) or [GitLab](https://gitlab.com) account.
2. A free [Render](https://render.com) account.
3. *(Recommended)* A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or you can use the embedded fallback).

---

## Step 1: Push Code to GitHub / GitLab

Initialize a git repository if you haven't already:

```bash
git init
git add .
git commit -m "Deploy Elevate platform with Google OAuth, QR check-in & certificates"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## Step 2: Deploy on Render

### Method A: Using Render Blueprints (Recommended & Fastest)

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub/GitLab repository.
4. Render will automatically read [`render.yaml`](./render.yaml).
5. Click **Apply**.
6. Render will automatically build the frontend, compile the backend, and launch the service!

---

### Method B: Manual Web Service Setup

If you prefer to configure manually via the Render UI:

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the following fields:
   - **Name**: `elevate-platform` (or any name you choose)
   - **Region**: Select closest to your users (e.g., `Oregon`, `Frankfurt`, or `Singapore`)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repo root)
   - **Runtime**: `Node`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Scroll down to **Environment Variables** and add:

| Key | Suggested Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Render default port |
| `JWT_SECRET` | *(Click "Generate" or enter random string)* | Secret for signing auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/elevate` | Your MongoDB Atlas connection string |

5. Click **Create Web Service**.

---

## Step 3: MongoDB Atlas Setup (Free Tier)

For permanent data storage in production:

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster.
3. Under **Database Access**, create a user (e.g. `elevate_user` with a strong password).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) so Render instances can connect.
5. Click **Connect** → **Drivers** → copy the connection string.
6. Replace `<password>` with your database user password.
7. Paste this connection string into Render's `MONGODB_URI` environment variable.

*(Note: If no `MONGODB_URI` is provided, Elevate starts an in-memory database automatically with sample demo data!)*

---

## Step 4: Optional Integrations

### Google Sign-In ("Continue with Google")
To enable live Google OAuth on production:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add your Render domain (e.g. `https://elevate-platform.onrender.com`) to **Authorized JavaScript origins** and **Authorized redirect URIs**.
4. In Render environment variables, add:
   - `GOOGLE_CLIENT_ID`: `your-client-id.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET`: `your-client-secret`

---

## Verifying Deployment

Once Render finishes the build (usually takes ~1–2 minutes):
1. Open your Render URL: `https://<your-service-name>.onrender.com`.
2. Check the health check endpoint: `https://<your-service-name>.onrender.com/api/health`.
   - Should return: `{"status":"healthy","service":"Elevate Hyperlocal API","version":"1.0.0"}`
3. You can log in immediately using the pre-seeded demo accounts:
   - **Participant**: `participant@eventsphere.io` / `Password123!`
   - **Organizer**: `organizer@eventsphere.io` / `Password123!`
   - **Admin**: `admin@eventsphere.io` / `Password123!`
   *(Or click "Continue with Google" to test instant Google login!)*
