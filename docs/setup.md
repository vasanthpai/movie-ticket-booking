# Setup

How to get the project running locally. This file grows as each phase adds something
that needs installing or configuring.

## Prerequisites

| Tool    | Version used     | Check with        |
|---------|------------------|-------------------|
| Node.js | 24.x (LTS)       | `node -v`         |
| npm     | 11.x             | `npm -v`          |
| Git     | 2.x              | `git --version`   |

Needed in later phases (not yet):
- **MongoDB Atlas** free-tier cluster (Phase 2)
- **Redis** — local via Docker or a hosted free tier (Phase 11)
- **Razorpay** test-mode account (Phase 13)
- **Resend** account (Phase 15)

## Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Then open http://localhost:5000 — you should see:

```json
{ "success": true, "data": { "message": "Movie booking API is running" } }
```

### Backend scripts

| Script                 | What it does                                                  |
|------------------------|---------------------------------------------------------------|
| `npm run dev`          | Runs `src/server.ts` with tsx; restarts on file changes       |
| `npm run build`        | Compiles TypeScript in `src/` to JavaScript in `dist/`        |
| `npm start`            | Runs the compiled build (`dist/server.js`) — production mode  |
| `npm run typecheck`    | Type-checks without emitting files                            |
| `npm run lint`         | ESLint — finds likely bugs                                    |
| `npm run format`       | Prettier — rewrites files to the standard format              |
| `npm run format:check` | Prettier — fails if any file isn't formatted (useful in CI)   |

### Backend environment variables

| Variable   | Required | Default       | Description                             |
|------------|----------|---------------|-----------------------------------------|
| `NODE_ENV` | no       | `development` | `development` \| `test` \| `production` |
| `PORT`     | no       | `5000`        | Port the API listens on                 |

Variables are validated at startup in `backend/src/config/env.ts`. If one is invalid,
the server refuses to start and prints which variable is wrong.

## Environment files

Secrets live in `.env` files that are **never committed** (see `.gitignore`). Each
project ships an `.env.example` listing the variables with placeholder values:

```
backend/.env.example   → copy to backend/.env
frontend/.env.example  → copy to frontend/.env.local   (Phase 1b)
```
