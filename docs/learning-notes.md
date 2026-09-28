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
