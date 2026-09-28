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
