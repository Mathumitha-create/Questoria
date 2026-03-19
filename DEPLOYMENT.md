# QUESTORIA Deployment Guide

## Architecture

- Frontend: Vite React app (`/`)
- Backend: Express API (`/server`)
- Database: MongoDB Atlas
- Auth: JWT + Firebase OAuth (Google)

## Local Development

### 1) Frontend

1. Copy `.env.example` to `.env` and fill values.
2. Install deps: `npm install`
3. Run: `npm run dev`

### 2) Backend

1. Copy `server/.env.example` to `server/.env` and fill values.
2. Install deps: `cd server && npm install`
3. Run: `npm run dev`
4. Health check: `http://localhost:5000/health`

## MongoDB Atlas Setup

1. Create cluster and database user.
2. Add your machine IP to network access.
3. Put connection string into `MONGODB_URI`.

## Firebase OAuth Setup

1. Enable Google sign-in in Firebase Auth.
2. Add frontend domain (localhost and deployed domain).
3. Add service account envs in backend:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

## Judge0 Setup

1. Create RapidAPI key for Judge0.
2. Add `JUDGE0_URL` and `JUDGE0_API_KEY` to backend `.env`.

## Gemini Setup

1. Create Gemini API key.
2. Add `GEMINI_API_KEY` in backend and `VITE_GEMINI_KEY` in frontend.

## Deploy Frontend to Vercel

1. Import repo in Vercel.
2. Build command: `npm run build`
3. Output dir: `dist`
4. Add all `VITE_*` environment variables.

## Deploy Backend to Render

1. Create a new Web Service from `/server`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all backend environment variables from `server/.env.example`.

## Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure CORS to your domains only
- [ ] Add rate limiting/WAF
- [ ] Rotate API keys
- [ ] Enable Mongo backups
- [ ] Configure alerting and logs
