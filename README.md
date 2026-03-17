# Questoria

Questoria is a full-stack coding + career preparation platform with:

- Practice problems and contests
- AI mentor features
- Virtual mock interviews
- Gamification (points, streaks, badges, levels, leaderboard)
- Smart resume upload and analysis

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT + Firebase Google Sign-In
- AI: Gemini API

## Project Structure

- `src/` — frontend React app
  - `components/MockInterview.jsx` — interview UI with Monaco + timer + chart
  - `components/ResumeAnalyzer.jsx` — resume upload + analysis page
  - `components/Profile.jsx` — badges/stats/profile data
- `server/src/` — backend API
  - `routes/interviewRoutes.js` — interview lifecycle APIs
  - `routes/gamificationRoutes.js` — rewards, badges, gamified leaderboard
  - `routes/resumeRoutes.js` — `/resume/upload` + `/resume/analysis`
  - `models/InterviewSession.js` — interview session persistence
  - `utils/interviewAI.js` — AI-driven question/evaluation utilities
  - `utils/gamification.js` — points, level, badges, streak logic

## Setup

### 1) Install dependencies

Frontend:

- `npm install`

Backend:

- `cd server`
- `npm install`

### 2) Configure environment

In `server/.env` ensure these values are set:

- `PORT=5000`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `GEMINI_API_KEY=...` (recommended for AI interview/resume quality)
- Firebase admin keys (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)

In frontend env (e.g., `.env`):

- `VITE_API_URL=http://localhost:5000/api`
- `VITE_GEMINI_KEY=...` (optional for client-side avatar generation)

### 3) Run the apps

Backend:

- `cd server`
- `npm run dev`

Frontend:

- `npm run dev`

## New APIs

### Interview APIs

- `POST /api/interview/start`
- `POST /api/interview/answer`
- `GET /api/interview/result/:sessionId`
- `GET /api/interview/history`
- `GET /api/interview/performance`

### Gamification APIs

- `GET /api/gamification/leaderboard`
- `POST /api/gamification/reward/update`
- `GET /api/gamification/badges`
- `GET /api/gamification/daily-challenge`

### Resume APIs

- `POST /api/resume/upload`
- `GET /api/resume/analysis`

Legacy AI resume APIs still exist under:

- `POST /api/ai/resume/validate`
- `POST /api/ai/resume/analyze`
- `POST /api/ai/resume/compare`

## Security Enhancements

- JWT-protected APIs for user data and interview/resume workflows
- Added API-level and AI-route rate limiting via `express-rate-limit`
- File upload constraints for resume type and max size
- Validation-first processing for resume content

## Notes

- If Gemini quota is unavailable, Questoria uses structured fallback behaviors where possible.
- Frontend build currently reports large chunk warnings; functionality is unaffected.
