# Setup

How to get the project running locally. This file grows as each phase adds something
that needs installing or configuring.

## Prerequisites

| Tool    | Version used     | Check with        |
|---------|------------------|-------------------|
| Node.js | 24.x (LTS)       | `node -v`         |
| npm     | 11.x             | `npm -v`          |
| Git     | 2.x              | `git --version`   |

Needed in later phases (not yet):
- **MongoDB Atlas** free-tier cluster (Phase 2)
- **Redis** — local via Docker or a hosted free tier (Phase 11)
- **Razorpay** test-mode account (Phase 13)
- **Resend** account (Phase 15)

## Project status

Phase 0 — planning and documentation only. No runnable code yet.

## Environment variables

Secrets live in `.env` files that are **never committed**. Each project will ship an
`.env.example` listing the required variables with placeholder values:

```
backend/.env.example   → copy to backend/.env
frontend/.env.example  → copy to frontend/.env.local
```
