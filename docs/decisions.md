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

---

# ADR-006: Backend tooling — ESM, tsx, Zod-validated env, Express 5

## Decision
- The backend uses **ES modules** (`"type": "module"`, TypeScript `module: NodeNext`).
- **tsx** runs TypeScript directly in development; **tsc** compiles to `dist/` for
  production.
- Environment variables are **validated with Zod** at startup (`config/env.ts`).
- **Express 5**, TypeScript in **strict** mode.

## Alternatives
- **CommonJS** (`require`) — the older Node module system.
- **ts-node** or **nodemon + tsc** for development.
- Reading `process.env` directly everywhere, with no validation.
- **Express 4**.

## Why
- ESM is the JavaScript standard module system and the direction Node is going.
- tsx is fast (it uses esbuild) and needs no configuration. It doesn't type-check,
  which is why `npm run typecheck` exists.
- Validating env at startup means a missing or invalid variable crashes the app
  immediately with a clear message, instead of failing later on a real request.
  It also gives typed config (`env.PORT` is a `number`, not `string | undefined`).
- Express 5 passes errors thrown in async route handlers to the error middleware
  automatically. Express 4 needed a wrapper to do this.

## Trade-offs
- ➖ With `NodeNext`, relative imports must end in `.js` (`import { env } from
  './config/env.js'`) even though the source file is `.ts`. TypeScript doesn't
  rewrite import paths, and Node's ESM loader needs the real file name of the
  compiled output.
- ➖ tsx skips type-checking, so type errors only show up in the editor,
  `typecheck`, or `build`.
- ➕ Zod is also going to be our request-validation library, so we learn one tool
  for both jobs.

## Date
2026-09-28

---

# ADR-007: Next.js App Router + Tailwind CSS + shadcn/ui for the frontend

## Decision
- **Next.js 16 with the App Router**, TypeScript, scaffolded with `create-next-app`.
- **Tailwind CSS v4** for styling.
- **shadcn/ui** for UI components (built on Base UI primitives), with components
  copied into `components/ui/`.

## Alternatives
- **Vite + React** — a single-page app with client-side rendering only.
- **Next.js Pages Router** — the older routing system.
- **A component library installed as a package** (MUI, Chakra UI, Mantine).
- **Plain CSS / CSS Modules.**

## Why
- Server rendering matters for public pages: movie listings and details are indexable
  by search engines and show content before JavaScript loads.
- The App Router is the current Next.js model: nested layouts, Server Components,
  and built-in loading/error states per route.
- Tailwind keeps styles next to markup and uses a consistent design scale (spacing,
  colours) instead of one-off values.
- shadcn/ui gives accessible, well-built components as **source code in our repo**,
  not a dependency. We can read and change every line, and nothing breaks when a
  library releases a new major version.

## Trade-offs
- ➕ SEO-friendly, fast first load, good developer experience, easy deploy to Vercel.
- ➖ The App Router's server vs client component split is a real learning curve.
- ➖ Next.js changes quickly between major versions (e.g. v16 removed `next lint`).
- ➖ Tailwind class lists get long; the Prettier plugin at least keeps them ordered.
- ➖ shadcn components are ours to maintain; upstream fixes don't arrive automatically.

## Date
2026-09-28

---

# ADR-008: Central error handling and a single response envelope

## Decision
- Every response uses `{ success: true, data }` or
  `{ success: false, error: { code, message, details? } }`.
- Expected failures are thrown as `ApiError(status, code, message)`. One
  error-handling middleware turns every error into a response.
- Unknown errors become a 500. In production the message is generic, and the full
  error is only logged on the server.

## Alternatives
- Each controller builds its own error response with `try/catch`.
- Return raw data with no envelope (`[...movies]`), and signal errors only through
  status codes.
- A standard error format such as RFC 9457 "Problem Details"
  (`application/problem+json`).

## Why
- One place decides what clients see, so internal details (stack traces, database
  errors) can't leak by accident.
- Controllers stay short: throw and forget, with no repeated `try/catch`.
- A stable `code` lets the frontend react to specific failures (e.g.
  `SEAT_ALREADY_LOCKED` → refresh the seat map), which is much more reliable than
  matching message text.
- The envelope makes every response look the same to the frontend API client.

## Trade-offs
- ➕ Consistency, safety, less code in controllers.
- ➖ The envelope is our own convention, not a standard; RFC 9457 would be more
  interoperable. For an API with one frontend, simplicity wins.
- ➖ `success` duplicates information that's already in the HTTP status. We keep them
  consistent (`success: false` ⇔ non-2xx), even for `/api/health`.

## Date
2026-09-28

---

# ADR-009: helmet, cors and morgan as baseline middleware

## Decision
- **helmet** sets security-related HTTP headers.
- **cors** allows exactly one origin (`CORS_ORIGIN`, the frontend), with credentials.
- **morgan** logs requests (`dev` format locally, Apache `combined` format in
  production).

## Alternatives
- Setting headers by hand.
- `cors()` with no options, which allows every origin.
- A structured JSON logger (pino + pino-http).

## Why
- helmet's defaults cover a long list of headers people forget to set by hand.
- CORS is a browser security rule. Allowing `*` would let any website call our API
  from its visitors' browsers; one explicit origin is the safe default, and
  `credentials: true` will be needed once auth uses cookies (Phase 4).
- morgan is the simplest request logger to understand.

## Trade-offs
- ➖ morgan writes plain-text logs. In production, JSON logs (pino) are easier to
  search and filter; we may switch during deployment (Phase 19).
- ➖ Only one CORS origin is supported for now. Preview deployments with several
  frontend URLs would need a list.
- Note: CORS doesn't protect the API from non-browser clients (curl, scripts).
  Authentication does that.

## Date
2026-09-28
