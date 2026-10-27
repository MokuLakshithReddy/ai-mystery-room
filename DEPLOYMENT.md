# 🌐 AI Mystery Room — Deployment Guide

This document outlines the architecture, configuration parameters, and verification procedures for deploying the **AI Mystery Room** to production.

---

## 🚀 Live Production Endpoints
- **Web Application (Frontend)**: [https://client-tau-sable-95.vercel.app](https://client-tau-sable-95.vercel.app)
- **API Server (Backend)**: [https://server-beta-blond-45.vercel.app](https://server-beta-blond-45.vercel.app)
- **Health Check Endpoint**: [https://server-beta-blond-45.vercel.app/api/health](https://server-beta-blond-45.vercel.app/api/health)

---

## ⚙️ Environment Variables

### 1. Backend (`/server`)
Configure these variables in your hosting environment (e.g. Vercel Project Settings -> Environment Variables):

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Local HTTP listening port | Optional | `5000` |
| `NODE_ENV` | Application environment | Optional | `production` |
| `CLIENT_URL` | Approved frontend origin for CORS | Recommended | `https://client-tau-sable-95.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini API Key | Optional (Falls back to certified library) | `AIzaSy...` |
| `MONGODB_URI` | MongoDB Atlas Connection String | Optional (Used when Atlas is provisioned) | `mongodb+srv://...` |
| `SUPABASE_URL` | Supabase Cloud Store URL | Managed | `https://ffjgbefnubyjzrlvpdkl.supabase.co` |
| `SUPABASE_KEY` | Supabase Service Role Key | Managed | `eyJhbGci...` |

### 2. Frontend (`/client`)
Configure in the frontend hosting environment:

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Full URL to the backend API base | Required for production | `https://server-beta-blond-45.vercel.app/api` |

---

## 📦 Deployment Instructions

### Deploying the Backend (Vercel Node.js Serverless)
```bash
cd server
npm ci
npx vercel --prod
```

### Deploying the Frontend (Vercel Vite SPA)
```bash
cd client
npm ci
npm run build
npx vercel --prod
```

### SPA Routing Configuration (`client/vercel.json`)
To ensure deep links (`/create`, `/case/:id`, `/case/:id/result`) work on refresh without HTTP 404 errors:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🔍 Verification Checklist
- [x] Visiting `https://client-tau-sable-95.vercel.app` loads the detective home page.
- [x] Refreshing a deep link like `/case/:id` resolves the application cleanly.
- [x] Network tab confirms zero calls targeting `localhost`.
- [x] `GET https://server-beta-blond-45.vercel.app/api/health` returns HTTP 200 with driver status.
- [x] Case creation survives across separate serverless containers and browser refreshes.
