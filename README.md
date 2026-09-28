# Movie Ticket Booking Platform

A full-stack movie ticket booking platform (in the spirit of BookMyShow), built as a
portfolio project with a focus on clean architecture, concurrency-safe seat booking,
secure payments and thorough documentation.

> 🚧 **Status:** Phase 0 — architecture and planning. See [docs/](docs/).

## Tech stack

| Layer       | Technology                                            |
|-------------|-------------------------------------------------------|
| Frontend    | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend     | Node.js, Express, TypeScript — REST, modular monolith |
| Database    | MongoDB Atlas + Mongoose                              |
| Cache/locks | Redis (seat locks with TTL)                           |
| Auth        | Auth.js + JWT                                         |
| Payments    | Razorpay (test mode)                                  |
| Storage     | Cloudflare R2                                         |
| Email       | Resend                                                |

## Repository structure

```
frontend/   Next.js web app
backend/    Express REST API
docs/       Architecture, decisions, setup and learning notes
```

## Documentation

- [Architecture](docs/architecture.md)
- [Architecture decisions](docs/decisions.md)
- [Setup](docs/setup.md)
- [Learning notes](docs/learning-notes.md)

Other docs (`api.md`, `database.md`, `authentication.md`, `seat-locking.md`,
`payments.md`, `booking-flow.md`, `troubleshooting.md`) are added when the
corresponding feature is built, so they always describe real code.
