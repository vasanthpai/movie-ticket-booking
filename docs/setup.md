# Setup

How to get the project running locally. This file grows as each phase adds something
that needs installing or configuring.

## Prerequisites

| Tool    | Version used     | Check with        |
|---------|------------------|-------------------|
| Node.js | 24.x (LTS)       | `node -v`         |
| npm     | 11.x             | `npm -v`          |
| Git     | 2.x              | `git --version`   |

Accounts / services:
- **MongoDB Atlas** free-tier cluster — **needed now** (see `database.md`)
- **Redis** — local via Docker or a hosted free tier (Phase 11)
- **Razorpay** test-mode account (Phase 13)
- **Resend** account (Phase 15)

## Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
                          # then set MONGODB_URI (see docs/database.md)
npm run dev
```

Then open http://localhost:5000/api/health — you should see:

```json
{ "success": true, "data": { "status": "ok", "database": "connected", ... } }
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
| `MONGODB_URI` | **yes** | —          | MongoDB connection string. See `database.md` for Atlas setup |
| `CORS_ORIGIN` | no      | `http://localhost:3000` | Frontend origin allowed to call the API from a browser |

Variables are validated at startup in `backend/src/config/env.ts`. If one is invalid,
the server refuses to start and prints which variable is wrong.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

### Frontend scripts

| Script                 | What it does                                                    |
|------------------------|-----------------------------------------------------------------|
| `npm run dev`          | Next.js dev server (Turbopack) with hot reload                  |
| `npm run build`        | Production build (does **not** run the linter in Next.js 16)    |
| `npm start`            | Serves the production build                                     |
| `npm run typecheck`    | Generates Next.js route types, then runs `tsc --noEmit`          |
| `npm run lint`         | ESLint with Next.js rules                                       |
| `npm run format`       | Prettier (also sorts Tailwind classes)                          |
| `npm run format:check` | Fails if any file isn't formatted                               |

### Frontend environment variables

| Variable              | Required | Example                 | Description          |
|-----------------------|----------|-------------------------|----------------------|
| `NEXT_PUBLIC_API_URL` | yes      | `http://localhost:5000` | Backend API base URL |

`NEXT_PUBLIC_` variables are embedded in the browser bundle **at build time** —
changing them requires a rebuild, and they must never contain secrets.

### Adding shadcn/ui components

```bash
npx shadcn@latest add <component>   # e.g. card, input, dialog
npm run format                      # generated files use a different code style
```

Components are copied into `components/ui/` — they become our code, which we can edit.

## Running both

Use two terminals: `cd backend && npm run dev` and `cd frontend && npm run dev`.
Backend → http://localhost:5000, frontend → http://localhost:3000.

## Environment files

Secrets live in `.env` files that are **never committed** (see `.gitignore`). Each
project ships an `.env.example` listing the variables with placeholder values:

```
backend/.env.example   → copy to backend/.env
frontend/.env.example  → copy to frontend/.env.local
```
