# Architecture Decisions

A log of important decisions and the reasoning behind them. Newest decisions at the
bottom. If a decision is reversed later, don't delete it — add a new entry that
supersedes it.

---

# ADR-001: Modular monolith for the backend

## Decision
A single Express application, organised internally into domain modules
(`movies`, `shows`, `bookings`, …), each with its own model, service, controller and
routes.

## Alternatives
- **Microservices** — a separate deployable service per domain.
- **Layered monolith** — top-level `controllers/`, `models/`, `services/` folders
  containing every domain mixed together.

## Why
- One process to run, debug, deploy and host — right-sized for a portfolio project
  with one developer.
- Grouping by domain keeps related code together: everything about bookings lives in
  `modules/bookings/`.
- Clear module boundaries mean a module *could* be extracted into a service later if
  there were a real reason.
- Booking needs to touch shows, seats and payments in one flow; in a monolith that's a
  function call, not a network call that can fail halfway.

## Trade-offs
- ➕ Simple deployment, easy local development, no network between modules.
- ➕ Transactions across domains are possible (same database).
- ➖ Everything scales together — you can't scale "bookings" independently.
- ➖ Boundaries are enforced by discipline, not by the network; it's easy to cheat.

## Date
2026-09-28

---

# ADR-002: Separate frontend and backend in one repository

## Decision
Two independent npm projects, `frontend/` (Next.js) and `backend/` (Express), in one
git repository. No monorepo tooling (npm workspaces, Turborepo, Nx) for now.

## Alternatives
- **Next.js only** — use Next.js Route Handlers / Server Actions as the backend.
- **Monorepo tooling** — npm workspaces or Turborepo with a shared `packages/types`.
- **Two separate repositories.**

## Why
- The project brief calls for a standalone REST API; a separate Express backend makes
  the API, middleware and error handling explicit and easy to explain.
- Payment webhooks and Redis locking belong in a long-running server rather than
  short-lived serverless functions.
- One repo keeps the code, docs and history together for a portfolio.
- Skipping monorepo tooling keeps setup simple. Each folder has its own
  `package.json` and runs on its own.

## Trade-offs
- ➕ Clear separation of concerns; each side can be deployed independently.
- ➕ Minimal tooling to learn.
- ➖ API types are defined twice (backend + frontend) and can drift. If this becomes
  painful, we can introduce npm workspaces with a shared types package.
- ➖ CORS must be configured, since frontend and backend run on different origins.

## Date
2026-09-28

---

# ADR-003: REST API with JSON

## Decision
The backend exposes a REST API using JSON, resource-oriented URLs
(`/api/movies/:id`) and standard HTTP methods and status codes.

## Alternatives
- **GraphQL**
- **tRPC** (TypeScript end-to-end RPC)

## Why
- REST is the most widely understood API style; easy to test with curl/Postman and
  easy to discuss in interviews.
- HTTP caching, status codes and methods map naturally onto our resources.
- tRPC would tie the backend to a TypeScript client; GraphQL adds a schema layer and
  tooling that this project doesn't need.

## Trade-offs
- ➕ Simple, universal, tooling everywhere.
- ➖ Clients may over-fetch or need several requests for one page.
- ➖ No automatic type sharing with the frontend.

## Date
2026-09-28

---

# ADR-004: MongoDB with Mongoose

## Decision
MongoDB (Atlas for development) as the primary database, accessed through the
Mongoose ODM.

## Alternatives
- **PostgreSQL** (with Prisma or Drizzle).
- **MongoDB native driver** without an ODM.

## Why
- Specified in the project brief.
- Movie data is naturally document-shaped (genres, languages, cast lists).
- Mongoose gives schemas, validation, and TypeScript typing on top of a schemaless
  database, which keeps data consistent.
- MongoDB supports multi-document transactions (on replica sets, which Atlas
  provides), which we'll need when confirming bookings.

## Trade-offs
- ➕ Flexible schema, good developer experience, free Atlas tier.
- ➖ Booking data is highly relational (show → screen → cinema → city). A relational
  database would express those relationships and constraints more naturally; we
  compensate with careful referencing, indexes, and unique constraints.
- ➖ Mongoose adds a layer of abstraction and some magic to understand.

## Date
2026-09-28

---

# ADR-005: Redis for temporary seat locks (planned)

## Decision
Use Redis to hold seat locks with an expiry (TTL), using atomic `SET ... NX EX`.
MongoDB remains the source of truth for confirmed bookings, with a unique index as a
final guard against double-booking.

## Alternatives
- **Database-only locking** — a `status: "locked"` field plus a `lockedUntil`
  timestamp on seat documents.
- **In-memory locks** in the Node process.

## Why
- A seat lock is temporary state that should disappear automatically. Redis TTL
  handles expiry without a cleanup job.
- `SET NX` is atomic: when two users click the same seat at the same moment, exactly
  one wins.
- In-memory locks break as soon as there's more than one backend instance or a
  restart.
- Database-only locking works but needs careful conditional updates plus a cleanup
  process for expired locks, and puts high-frequency writes on the primary database.

## Trade-offs
- ➕ Fast, atomic, self-expiring locks.
- ➖ One more piece of infrastructure to run and host.
- ➖ Two data stores can disagree (e.g. lock expires while payment is in progress) —
  we must design for this explicitly in Phase 11–13.

Full explanation will be written in `seat-locking.md` when implemented.

## Date
2026-09-28
