# Movie Ticket Booking Platform

A full-stack movie ticket booking platform (in the spirit of BookMyShow), built as a
portfolio project with a focus on clean architecture, concurrency-safe seat booking,
secure payments and thorough documentation.

> 🚧 **Status:** Phase 2 — backend foundation done (Express, error handling, MongoDB, health check). See [docs/](docs/).

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

- [Roadmap — what's done and what's next](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Architecture decisions](docs/decisions.md)
- [Setup](docs/setup.md)
- [API reference](docs/api.md)
- [Database](docs/database.md)
- [Learning notes](docs/learning-notes.md)
- [Troubleshooting](docs/troubleshooting.md)

Other docs (`authentication.md`, `seat-locking.md`,
`payments.md`, `booking-flow.md`) are added when the
corresponding feature is built, so they always describe real code.
