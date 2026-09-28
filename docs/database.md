# Database

MongoDB, accessed through Mongoose (see `decisions.md` → ADR-004).
Schemas, relationships and indexes are added here from Phase 3 onward.

## Connection

Code: `backend/src/config/database.ts`

- **One connection pool per process.** `connectDatabase()` runs once in `server.ts`
  at startup. Mongoose reuses pooled connections for every query; we never connect
  per request.
- **Connect before listening.** The server only starts accepting HTTP requests after
  MongoDB is connected. If the first connection fails, the process exits with a
  clear message, so a misconfigured deploy fails loudly instead of returning errors.
- **Fast failure.** `serverSelectionTimeoutMS: 5000` means a wrong URI or a blocked
  IP fails in 5 seconds instead of Mongoose's default 30.
- **Automatic reconnect.** If the connection drops *after* startup, Mongoose keeps
  retrying. We log `disconnected` / `reconnected`, and `GET /api/health` returns 503
  while it's down.
- **Clean shutdown.** On SIGINT/SIGTERM, `server.ts` stops accepting requests, lets
  in-flight requests finish, then calls `disconnectDatabase()`.

## Connection string

Set `MONGODB_URI` in `backend/.env`. The database name goes after the host:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/movie_booking?retryWrites=true&w=majority
                                                        └─ database name
```

If you leave out the database name, MongoDB uses a database called `test`.
It works, but your data ends up somewhere you didn't intend.

## Setting up MongoDB Atlas (free tier)

1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. **Database Access** → add a database user with a username and a generated
   password (read/write to any database is fine for development).
3. **Network Access** → add your current IP address. `0.0.0.0/0` (anywhere) is
   convenient but opens the cluster to the whole internet, protected only by the
   password. Avoid it except temporarily.
4. **Connect → Drivers** → copy the `mongodb+srv://` string, fill in the password,
   and add `/movie_booking` before the `?`.
5. Paste it into `backend/.env` as `MONGODB_URI`, then run `npm run dev`. You should see
   `✅ MongoDB connected`.

If the password contains special characters (`@ : / ? # %`), URL-encode them
(e.g. `@` → `%40`), or generate one without them.
