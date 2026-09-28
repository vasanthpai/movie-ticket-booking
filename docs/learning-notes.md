# Learning Notes

My personal reference: what each feature taught me, explained simply.

---

# Feature: Project planning & architecture

## What I learned

- Monolith vs modular monolith vs microservices
- Why frontend and backend are separate apps
- Controller → service → model layering
- Why seat locking needs more than a boolean flag

## Important concepts

**Modular monolith.** One app, one deployment, but the code is split into folders by
business area (`movies`, `bookings`, …). Like one building with separate rooms,
instead of one open-plan room (messy monolith) or separate buildings (microservices).

**Layers inside a module.**
- *Controller* — speaks HTTP. Reads the request, calls the service, sends a response.
- *Service* — the business rules ("a seat can't be booked twice"). Knows nothing
  about `req`/`res`, so it's easy to test and reuse.
- *Model* — how data is stored in MongoDB.

**The frontend is untrusted.** Anyone can open DevTools and send any request. Prices,
seat availability and payment success must always be decided by the backend.

**Why not `seat.available = false`?** Two users can read "available" at the same
moment and both write "booked" — a *race condition*. And if the user abandons checkout,
something has to set it back. Redis locks with a TTL solve both: the lock is claimed
atomically and expires on its own.

## Common mistakes

- Starting with microservices for a small project.
- Putting business logic in controllers or React components.
- Trusting prices or "payment successful" sent from the browser.
- Committing `.env` files.

## Interview questions

1. What is a modular monolith and why did you choose it over microservices?
2. Why separate controllers from services?
3. Why did you use both Redis and MongoDB? What is each responsible for?
4. What is a race condition? Give an example from a booking system.
5. Why is the frontend considered untrusted?

## Things to revisit

- Race conditions and atomic operations (before Phase 11)
- MongoDB embedding vs referencing (before Phase 3)

---

# Feature: Backend project setup (Phase 1a)

## What I learned

- What `tsconfig.json`, ESLint and Prettier each do
- ES modules vs CommonJS
- Validating environment variables at startup ("fail fast")
- Why `app.ts` and `server.ts` are separate files
- Dev dependencies vs dependencies

## Important concepts

**TypeScript vs ESLint vs Prettier: three different jobs.**
- *TypeScript* checks **types**: "you passed a string where a number was expected".
- *ESLint* checks **patterns**: "this variable is never used", "you forgot `await`".
- *Prettier* only handles **formatting**: quotes, commas, indentation. It never
  changes behaviour. `eslint-config-prettier` turns off ESLint's formatting rules so
  the two tools don't disagree.

**Strict TypeScript.** `strict: true` makes TypeScript complain about possible
`null`/`undefined` and implicit `any`. `noUncheckedIndexedAccess` goes further:
`arr[0]` has type `T | undefined`, because the array might be empty. These catch real
bugs early.

**ES modules.** `import`/`export` instead of `require`/`module.exports`. With
`module: NodeNext` you write `./app.js` in imports even though the file is `app.ts`,
because the import path has to match the compiled output that Node actually loads.

**Environment validation.** `process.env` values are always `string | undefined`.
`config/env.ts` parses them once with Zod, converts `"5000"` to `5000`, fills in
defaults, and exits with a clear error if something is wrong. The rest of the code
imports `env` and gets typed, trusted values.

**`app.ts` vs `server.ts`.** `createApp()` builds the app; `server.ts` starts it
listening. Tests (Phase 17) will import `createApp()` and send it fake requests
without opening a port.

**dependencies vs devDependencies.** `express`, `zod` and `dotenv` are needed at
runtime → `dependencies`. `typescript`, `eslint` and `tsx` are only needed while
developing and building → `devDependencies`. A production install
(`npm ci --omit=dev`) skips devDependencies.

**A bug we actually hit.** In Express 5, the `app.listen()` callback is also called
when the server *fails* to start, with the error as its argument. The first version
ignored that argument, so it printed "API listening" right before "Port in use". The
lesson: when you upgrade a major version of a library, read its migration guide.

## Common mistakes

- Reading `process.env.PORT` directly all over the code: it's untyped, has no
  default, and nothing is validated.
- Committing `.env` instead of `.env.example`.
- Forgetting the `.js` extension in ESM imports → `ERR_MODULE_NOT_FOUND` at runtime.
- Assuming tsx catches type errors (it doesn't; run `npm run typecheck`).
- Putting build tools in `dependencies`, which bloats production installs.

## Interview questions

1. What's the difference between a linter, a formatter, and a type checker?
2. Why validate environment variables at startup instead of when they're used?
3. What does `strict` mode in TypeScript give you?
4. Why separate the Express app from the code that starts the server?
5. What's the difference between `dependencies` and `devDependencies`?

## Things to revisit

- ES modules vs CommonJS in Node
- How `z.coerce` works and when coercion is dangerous

---

# Feature: Frontend project setup (Phase 1b)

## What I learned

- What the App Router's `app/` folder means (folders = URLs)
- Layouts vs pages
- How `NEXT_PUBLIC_` environment variables work, and why they aren't secret
- What shadcn/ui actually is (copied code, not a library)
- Why you still review generated code

## Important concepts

**File-based routing.** In the App Router, folders are URL segments and `page.tsx`
makes a segment visitable: `app/movies/[id]/page.tsx` → `/movies/123`.
`layout.tsx` wraps its pages and every page below it, and persists between
navigations. The root layout holds `<html>` and `<body>`.

**Server Components by default.** Components in `app/` run on the **server** unless
the file starts with `'use client'`. Server Components send HTML, not JavaScript, so
pages load faster. You only need `'use client'` for interactivity: `useState`,
`onClick`, browser APIs. Seat selection (Phase 10) will be a client component.

**`NEXT_PUBLIC_` variables.** At build time, Next.js replaces
`process.env.NEXT_PUBLIC_API_URL` with the literal string. It only does this for
exact, literal references. `process.env[name]` would be `undefined` in the browser.
Anything `NEXT_PUBLIC_` can be read by anyone who views the page source, so it's
fine for an API URL and never OK for a secret key.

**shadcn/ui.** Not an npm dependency you import from: `npx shadcn add button`
**copies** `button.tsx` into `components/ui/`. You own and can edit it. It's built on
Base UI, which handles accessibility (keyboard, focus, ARIA) so we don't have to.

**`cn()` helper.** Merges Tailwind classes and resolves conflicts:
`cn('px-2', 'px-4')` → `'px-4'`. Components use it so a caller can override
default styles.

**Generated code still needs review.** Checking the generators' output found two
real bugs: a self-referencing CSS variable that silently disabled the font, and a
`.gitignore` that would have hidden `.env.example`. Neither threw an error. They
were found by reading the files and testing with `git add -n`.

## Common mistakes

- Putting a secret in a `NEXT_PUBLIC_` variable.
- Adding `'use client'` to everything, which throws away the benefits of Server
  Components.
- Changing `.env.local` and not restarting the dev server.
- Treating shadcn components as untouchable. They're your code; edit them.
- Assuming `next build` catches lint errors (it doesn't since Next.js 16; run
  `npm run lint`).

## Interview questions

1. What's the difference between a Server Component and a Client Component?
2. What does a `layout.tsx` do, and how is it different from `page.tsx`?
3. Why must `NEXT_PUBLIC_` variables never contain secrets?
4. How is shadcn/ui different from a component library like MUI?
5. Why would you choose Next.js over a plain React + Vite app for this project?

## Things to revisit

- Server vs Client Components (before Phase 8)
- CSS custom properties (variables) and how Tailwind v4 themes use them

---

# Feature: Backend foundation (Phase 2)

## What I learned

- What middleware is, and why the order matters
- Centralised error handling in Express 5
- Connecting to MongoDB once, with a connection pool
- Health checks and what 503 means
- CORS, and security headers with helmet
- Graceful shutdown

## Important concepts

**Middleware** is a function `(req, res, next)` that runs on the way to a route. It
can modify `req`/`res`, end the request by sending a response, or call `next()` to
pass the request along. Express runs middleware **in the order it's registered**.
We hit a real bug from this: with the logger after the JSON parser, requests with
broken JSON never got logged, because the parser rejected them first.

**Error-handling middleware** has **four** parameters `(err, req, res, next)`. That's
how Express tells it apart from normal middleware, which is why `_next` stays even
though it's unused. In Express 5, if a handler throws or returns a rejected promise,
Express sends the error there automatically. (Express 4 needed `try/catch` or a
wrapper around every async handler.)

**Expected vs unexpected errors.**
- Expected: "movie not found", "seat taken". We throw `ApiError` with a status and a
  code, and the client can safely see the message.
- Unexpected: a bug, or the database throwing. Log the full details on the server,
  send the client only "Something went wrong". Stack traces help attackers.

**Connection pooling.** Opening a database connection is slow (TCP + TLS +
authentication). Mongoose opens a small pool once and reuses those connections for
every query. Connecting inside each request handler is a classic mistake.

**Health check + 503.** `503 Service Unavailable` means "I'm running, but I can't
serve requests right now". Hosting platforms poll `/api/health`, and a 503 tells
them to stop routing traffic to this instance (or restart it).

**CORS** is enforced by the **browser**. When `localhost:3000` calls
`localhost:5000`, the browser checks the response's `Access-Control-Allow-Origin`
header, and if it doesn't match the page's origin, JavaScript isn't allowed to read
the response. The server doesn't block anything itself. That's why CORS doesn't
protect against curl or scripts, and why authentication is still needed.

**Graceful shutdown.** When a platform redeploys, it sends `SIGTERM`. Exiting
immediately could cut a booking request in half. Instead: stop accepting new
connections, let in-flight requests finish, close the database, then exit.

## Common mistakes

- Registering the error handler **before** the routes (it never sees their errors).
- Error handler with three parameters (Express treats it as normal middleware).
- Sending `error.stack` or raw database errors to the client.
- Connecting to MongoDB per request instead of once at startup.
- Starting the HTTP server before the database is connected.
- `cors()` with no options (allows every origin).
- Returning 200 with `success: false`, so the status code and body disagree.

## Interview questions

1. What is middleware in Express? Why does the order of `app.use()` calls matter?
2. How does Express know a middleware is an error handler?
3. What's the difference between a 4xx and a 5xx error? When would you return 503?
4. What is CORS, who enforces it, and what does it *not* protect against?
5. What is graceful shutdown, and why does it matter during deployments?

## Things to revisit

- The HTTP status codes: 400, 401, 403, 404, 409, 413, 422, 500, 503
- The CORS preflight (`OPTIONS`) request
- What each helmet header protects against (CSP, HSTS, nosniff)
