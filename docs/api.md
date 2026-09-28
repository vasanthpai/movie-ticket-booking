# API Reference

Base URL (local): `http://localhost:5000/api`

## Conventions

### Response format

Every response is JSON, in one of two shapes:

```json
// Success (2xx)
{ "success": true, "data": { ... } }

// Failure (4xx / 5xx)
{ "success": false, "error": { "code": "MACHINE_READABLE_CODE", "message": "Human-readable text", "details": { } } }
```

- `success` is `false` **if and only if** the HTTP status is not 2xx.
- `error.code` is stable, so the frontend can branch on it (`if (code === 'SEAT_ALREADY_LOCKED')`).
  `error.message` is for humans and may change.
- `error.details` is optional (e.g. per-field validation errors).

### Common errors (any endpoint)

| Status | Code                    | When                                                |
|--------|-------------------------|-----------------------------------------------------|
| 400    | `INVALID_JSON`          | Request body is not valid JSON                       |
| 404    | `ROUTE_NOT_FOUND`       | No endpoint matches the method + URL                 |
| 413    | `PAYLOAD_TOO_LARGE`     | Request body over 100 KB                             |
| 500    | `INTERNAL_SERVER_ERROR` | Unexpected bug. Message is generic in production     |

### HTTP methods

| Method   | Meaning                      | Safe? | Idempotent? |
|----------|------------------------------|-------|-------------|
| `GET`    | Read a resource              | yes   | yes         |
| `POST`   | Create / trigger an action   | no    | no          |
| `PATCH`  | Partially update a resource  | no    | not always  |
| `DELETE` | Remove a resource            | no    | yes         |

*Safe* = doesn't change anything. *Idempotent* = doing it twice has the same effect
as doing it once.

---

## Health

### `GET /api/health`

Reports whether this API instance is running and connected to the database.

**Why `GET`:** it only reads status and changes nothing.

| | |
|---|---|
| **Auth**   | None |
| **Body**   | None |
| **Query**  | None |

**200 OK** (database connected)
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "uptimeSeconds": 42,
    "timestamp": "2026-09-28T07:16:40.766Z"
  }
}
```

**503 Service Unavailable** (database disconnected)
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Database is not connected",
    "details": { "database": "disconnected", "uptimeSeconds": 42, "timestamp": "..." }
  }
}
```

Hosting platforms and uptime monitors use the status code, not the body: 503 tells
a load balancer to stop routing traffic to this instance.
