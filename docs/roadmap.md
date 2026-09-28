# Roadmap

The full development plan and where the project stands. Update this file at the end
of every phase.

**Legend:** ✅ done · 🔄 in progress · ⏳ pending

**Current status:** Phases 0–2 complete. Next up: **Phase 3 — Database design**.

| #  | Phase                              | Status |
|----|------------------------------------|--------|
| 0  | Planning & architecture docs       | ✅     |
| 1  | Project setup (backend + frontend) | ✅     |
| 2  | Backend foundation                 | ✅     |
| 3  | Database design                    | ⏳ next |
| 4  | Authentication                     | ⏳     |
| 5  | Movies                             | ⏳     |
| 6  | Cities, cinemas, screens, seats    | ⏳     |
| 7  | Shows & pricing                    | ⏳     |
| 8  | Frontend movie experience          | ⏳     |
| 9  | Cinema / show experience           | ⏳     |
| 10 | Seat selection                     | ⏳     |
| 11 | Redis seat locking                 | ⏳     |
| 12 | Booking                            | ⏳     |
| 13 | Payments (Razorpay test mode)      | ⏳     |
| 14 | QR ticket                          | ⏳     |
| 15 | Notifications (Resend email)       | ⏳     |
| 16 | Admin dashboard                    | ⏳     |
| 17 | Testing                            | ⏳     |
| 18 | Security review                    | ⏳     |
| 19 | Deployment                         | ⏳     |
| 20 | Portfolio polish                   | ⏳     |

---

## ✅ Completed

### Phase 0 — Planning & architecture
Commit `8d0e5e9` · `docs: add initial architecture, decisions, and project documentation`
- [x] Inspected workspace (new, empty repo)
- [x] Target architecture: modular monolith, separate frontend/backend (`architecture.md`)
- [x] ADR-001 to ADR-005: modular monolith, repo layout, REST, MongoDB + Mongoose, Redis for seat locks
- [x] README, `.gitignore`, first learning notes

### Phase 1a — Backend setup
Commit `2496344` · `chore: set up backend with TypeScript, ESLint, Prettier, and env validation`
- [x] Express 5 + TypeScript (strict, ES modules)
- [x] ESLint + Prettier
- [x] Environment variables validated with Zod at startup (`config/env.ts`)
- [x] `app.ts` / `server.ts` split
- [x] `.env.example`, `.gitattributes` (LF line endings)
- [x] ADR-006

### Phase 1b — Frontend setup
Commit `82d597e` · `chore: set up Next.js frontend with Tailwind, shadcn/ui, ESLint, and Prettier`
- [x] Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4
- [x] shadcn/ui (Base UI) with a Button component
- [x] ESLint + Prettier (with Tailwind class sorting)
- [x] Public config (`lib/config.ts`), `.env.example`
- [x] Fixed two generator bugs (circular font variable, `.env.example` git-ignored)
- [x] ADR-007

### Phase 2 — Backend foundation
Commit: *(this commit)* · `feat: add Express middleware, error handling, MongoDB connection, and health check`
- [x] Middleware: helmet, CORS (one allowed origin), morgan, JSON body parser (100 KB limit)
- [x] `/api` router structure (`routes.ts`)
- [x] `ApiError` + consistent response format (`{ success, data }` / `{ success, error }`)
- [x] Central error handler + 404 handler
- [x] MongoDB connection (connect before listening, fail fast, reconnect logging)
- [x] Graceful shutdown (SIGINT/SIGTERM)
- [x] `GET /api/health` (200 when connected / 503 when the DB is down)
- [x] `api.md`, `database.md`, ADR-008, ADR-009
- [ ] Manual check: Ctrl+C shows "Shutdown complete" (couldn't be tested automatically on Windows)

---

## ⏳ Pending

### Phase 3 — Database design ← next
- [ ] Data requirements per entity (User, Movie, City, Cinema, Screen, Seat, Show, Booking, Payment)
- [ ] Relationships, and embedding vs referencing decisions
- [ ] **Open question:** seats as separate documents vs a layout embedded in each screen
- [ ] Indexes (including the unique index that prevents double-booking)
- [ ] Initial Mongoose schemas
- [ ] Seed data script

### Phase 4 — Authentication
- [ ] **Decide first:** how Auth.js (Next.js) and JWT verification (Express) fit together
- [ ] Registration, login, password hashing
- [ ] Auth middleware, role-based authorization (user / admin)
- [ ] `authentication.md`

### Phase 5 — Movies
- [ ] Movie model, CRUD API (admin-only writes)
- [ ] Listing with pagination, details, search and filters
- [ ] Request validation (Zod)

### Phase 6 — Cities, cinemas, screens, seats
- [ ] City, cinema, screen APIs
- [ ] Seat layouts and seat categories

### Phase 7 — Shows & pricing
- [ ] Show model (movie + screen + start time)
- [ ] Prevent overlapping shows on one screen
- [ ] Showtime listing, pricing per seat category

### Phase 8 — Frontend movie experience
- [ ] Layout, header, homepage
- [ ] Movie listing, details page, search, filters
- [ ] Typed API client (`services/`)

### Phase 9 — Cinema / show experience
- [ ] City selection, cinema listing, date + showtime selection

### Phase 10 — Seat selection
- [ ] Seat map UI, seat states (available / locked / booked / selected)
- [ ] Backend seat validation

### Phase 11 — Redis seat locking
- [ ] Explain race conditions, TTL, atomic operations, distributed locks first
- [ ] Redis setup, lock creation (`SET NX EX`), expiry, release
- [ ] Concurrency tests (two users, one seat)
- [ ] `seat-locking.md`

### Phase 12 — Booking
- [ ] Booking model and status lifecycle
- [ ] **Prerequisite:** MongoDB replica set for transactions (Atlas, or a single-node replica set locally)
- [ ] Booking creation, history, cancellation
- [ ] `booking-flow.md`

### Phase 13 — Payments
- [ ] Razorpay test mode: order creation, checkout
- [ ] Server-side signature verification, webhooks, idempotency
- [ ] Failure handling (payment succeeded but booking failed)
- [ ] `payments.md`

### Phase 14 — QR ticket
- [ ] QR generation, ticket page, confirmation screen

### Phase 15 — Notifications
- [ ] Resend integration, booking confirmation email

### Phase 16 — Admin dashboard
- [ ] Dashboard statistics
- [ ] Management UIs: movies (poster upload to R2), cinemas, screens, shows, bookings, users

### Phase 17 — Testing
- [ ] Unit, integration and API tests
- [ ] Critical booking-flow tests

### Phase 18 — Security review
- [ ] Auth, authorization, validation, rate limiting, CORS, headers
- [ ] Secrets, payment verification, NoSQL injection, error exposure

### Phase 19 — Deployment
- [ ] Vercel (frontend), Render/Railway (backend), Atlas, hosted Redis
- [ ] Production env config, CI

### Phase 20 — Portfolio polish
- [ ] README, architecture diagram, screenshots, demo account
- [ ] Technical challenges and lessons learned

---

## Notes carried forward

- **Local MongoDB is standalone.** Fine for now, but transactions (Phase 12) need a
  replica set.
- **npm `allow-scripts` warnings** (esbuild, unrs-resolver) are expected. See
  `troubleshooting.md`.
