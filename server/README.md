# Questoria API Server

## Run

1. `npm install`
2. `cp .env.example .env` (or create `.env` manually)
3. `npm run dev`

## Default Admin

- email: `admin@questoria.com`
- password: `Admin@123`

This account is auto-seeded on first boot if it does not exist.

## API Base

`/api`

### Main routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

- `GET /api/problems`
- `GET /api/problems/:id`
- `POST /api/problems/:id/run`
- `POST /api/problems/:id/submit`

- `GET /api/contests`
- `GET /api/leaderboards/global`
- `GET /api/leaderboards/college`
- `GET /api/leaderboards/friends`

- `GET /api/community`
- `POST /api/community`
- `POST /api/community/:id/upvote`

- `GET /api/profile/me`
- `PATCH /api/profile/me`

- `POST /api/ai/mentor`
- `POST /api/ai/resume/analyze`
- `POST /api/ai/resume/compare`

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/ban`
- `GET /api/admin/reports`
