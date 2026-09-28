# Architecture

> Status: **Planned** — this describes the target architecture. Sections are marked
> ✅ once implemented. Keep this file in sync with the code, not with intentions.

## 1. Big picture

```
                         ┌──────────────────────────┐
   Browser ────────────► │  Frontend (Next.js)      │   Vercel (later)
                         │  App Router, TS,         │
                         │  Tailwind, shadcn/ui     │
                         └────────────┬─────────────┘
                                      │ HTTPS + JSON (REST)
                                      ▼
                         ┌──────────────────────────┐
                         │  Backend (Express + TS)  │   Render/Railway (later)
                         │  Modular monolith        │
                         └──┬─────────┬─────────┬───┘
                            │         │         │
                 ┌──────────▼──┐ ┌────▼────┐ ┌──▼──────────────────────┐
                 │  MongoDB    │ │  Redis  │ │ External services        │
                 │  (Atlas)    │ │         │ │ Razorpay · R2 · Resend   │
                 │ durable data│ │ seat    │ └──────────────────────────┘
                 └─────────────┘ │ locks,  │
                                 │ cache   │
                                 └─────────┘
```

- **Frontend** renders pages and calls the backend over REST. It never talks to
  MongoDB or Redis directly.
- **Backend** owns all business rules (pricing, seat availability, booking state,
  payment verification). The frontend is treated as **untrusted**.
- **MongoDB** is the source of truth for durable data (users, movies, shows, bookings).
- **Redis** holds short-lived data: seat locks with a TTL (auto-expire), and later
  optional caching.

## 2. Repository layout

The repo root is `movie-ticket-booking/`. Frontend and backend are **two independent
npm projects** in one repository (see `decisions.md` → ADR-002).

```
movie-ticket-booking/
├── frontend/          Next.js app (created in Phase 1)
├── backend/           Express API (created in Phase 1)
├── docs/              Living documentation (this folder)
├── README.md
└── .gitignore
```

## 3. Backend: modular monolith

One deployable Express process, split internally into **modules by business domain**.

```
backend/src/
├── config/        env loading/validation, db + redis connections
├── middleware/    error handler, auth guard, validation, request logging
├── utils/         small shared helpers (ApiError, asyncHandler, response helpers)
├── modules/       one folder per domain — created only when we reach that phase
│   └── movies/
│       ├── movie.model.ts        Mongoose schema + model
│       ├── movie.schema.ts       request validation (Zod)
│       ├── movie.service.ts      business logic — no req/res here
│       ├── movie.controller.ts   HTTP layer: read req, call service, send res
│       └── movie.routes.ts       URL → controller mapping
├── app.ts         builds the Express app (middleware + routes), no listen()
└── server.ts      connects to DB, then app.listen()
```

✅ **Implemented (Phase 1a):** `config/env.ts` (Zod-validated env), `app.ts`
(`createApp()`), `server.ts`. Tooling: TypeScript strict + ESM, ESLint, Prettier.

✅ **Implemented (Phase 2):** `config/database.ts`, `routes.ts` (mounts module
routers under `/api`), `middleware/` (not-found, error-handler),
`utils/` (`ApiError`, `sendSuccess`/`sendError`), `modules/health/`.

### Middleware order (as implemented in `app.ts`)

```
helmet        security headers
  ↓
cors          allow the frontend origin (CORS_ORIGIN)
  ↓
morgan        request log — BEFORE the body parser so failed requests are logged too
  ↓
express.json  parse body (100 KB limit)
  ↓
/api router   module routes
  ↓
notFound      nothing matched → ApiError 404
  ↓
errorHandler  every error → { success: false, error } JSON
```

### Error handling

```
Route handler throws ApiError.notFound('Movie not found', 'MOVIE_NOT_FOUND')
        ↓   (Express 5 forwards thrown errors and rejected promises automatically)
errorHandler
        ├── ApiError         → its own status + code + message (safe for clients)
        ├── body parse error → 400 INVALID_JSON / 413 PAYLOAD_TOO_LARGE
        └── anything else    → logged in full, client gets 500 with a generic
                               message in production (no stack traces leaked)
```

Services throw `ApiError`s; controllers don't need `try/catch`.

### Startup and shutdown (`server.ts`)

```
validate env → connect MongoDB → listen
                   └─ fails → log reason, exit(1)

SIGINT / SIGTERM → stop accepting connections → finish in-flight requests
                 → disconnect MongoDB → exit(0)   (forced exit after 10s)
```

### Request flow inside the backend

```
HTTP request
   ↓
Global middleware (JSON parser, CORS, security headers, logging)
   ↓
Router  →  route-level middleware (auth guard, input validation)
   ↓
Controller   (HTTP concerns only)
   ↓
Service      (business rules; calls models / Redis / other services)
   ↓
Model        (MongoDB via Mongoose)
   ↓
Response  ─── or ───  thrown error → central error-handling middleware
```

**Module boundary rule:** a module may call another module's **service**, but never
reach into its model directly. That keeps each module's data rules in one place.

Why split `app.ts` and `server.ts`? Tests can import `app` and send requests to it
without opening a real port or connecting to production services.

### Planned modules (in order of creation)

| Module          | Responsibility                                           | Phase |
|-----------------|----------------------------------------------------------|-------|
| health          | liveness / DB connectivity check                         | 2     |
| auth, users     | registration, login, roles, profile                      | 4     |
| movies          | movie catalogue, search                                  | 5     |
| cities, cinemas, screens, seats | venue data and seat layouts              | 6     |
| shows           | a movie on a screen at a time, with pricing              | 7     |
| bookings        | seat locks (Redis), booking lifecycle                    | 11–12 |
| payments        | Razorpay orders, verification, webhooks                  | 13    |
| notifications   | booking emails via Resend                                | 15    |
| admin           | dashboard stats (management reuses the modules above)    | 16    |

## 4. Frontend

```
frontend/
├── app/          routes (App Router): pages, layouts, loading/error states
├── components/   UI components (shadcn/ui primitives + our own)
├── services/     typed functions that call the backend API
├── lib/          utilities, API client, config
├── hooks/        reusable client-side hooks
├── types/        shared TypeScript types for API data
└── public/       static assets
```

Pages call functions in `services/` rather than calling `fetch` inline, so every API
call lives in one place and is typed.

✅ **Implemented (Phase 1b):** Next.js 16 (App Router, Turbopack), React 19,
Tailwind CSS v4, shadcn/ui (Base UI primitives), `lib/config.ts` for public config.
Folders such as `services/`, `hooks/` and `types/` are created when first needed.

## 5. Cross-cutting design (planned)

**Consistent API responses** ✅ (implemented in Phase 2, documented in `api.md`)
```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "code": "SEAT_ALREADY_LOCKED", "message": "..." } }
```

**Seat safety — two layers of defence**
1. **Redis lock** (`SET key value NX EX 300`): atomic "claim this seat for 5 minutes
   unless someone already has". Fast, auto-expiring. Details in `seat-locking.md`
   when we reach Phase 11.
2. **MongoDB unique index** on booked seats per show: even if something goes wrong
   with Redis, the database refuses to store the same seat twice for one show.

**Payments are verified server-side only.** The frontend reporting "payment
succeeded" is never trusted; the backend verifies Razorpay's signature and also
processes webhooks. Details in `payments.md` in Phase 13.

## 6. Open questions (to decide when we get there)

- **Auth architecture (Phase 4):** how Auth.js on the Next.js side and JWT
  verification on the Express side fit together. To be discussed before implementing.
- **Seat model (Phase 6):** store seats as separate documents or embed a seat layout
  inside each screen.
- **Price model (Phase 7):** price per seat category per show vs per screen.
