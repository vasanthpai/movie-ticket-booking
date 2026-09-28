# Troubleshooting

Real problems hit during development, and how they were solved.

---

## `Port 5000 is already in use`

**Cause:** another process (often a previous `npm run dev` still running in another
terminal) is already listening on the port.

**Fix:** stop the other process, or change `PORT` in `backend/.env`.

On Windows, find what's using the port:
```powershell
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```

---

## `❌ Invalid environment variables` on startup

**Cause:** a value in `backend/.env` doesn't match the schema in
`backend/src/config/env.ts` (e.g. `PORT=abc`).

**Fix:** the message names the variable — correct it in `.env`. Compare against
`.env.example`.

---

## npm warns: `esbuild ... install scripts not yet covered by allowScripts`

**Cause:** npm 11 doesn't run dependencies' install scripts unless you approve them.
This protects against malicious packages that run code during `npm install`.
`esbuild` (used by `tsx`) has one.

**Status:** safe to ignore. esbuild ships its Windows/Linux/macOS binaries as
separate optional packages, so `tsx` works without the script. If `npm run dev` ever
fails with an esbuild error, run `npm approve-scripts esbuild` and reinstall.

---

## Git warns: `LF will be replaced by CRLF`

**Cause:** Windows uses CRLF line endings, Linux/macOS use LF. Without a rule, Git
converts them, and the same file can look different on different machines.

**Fix:** the root `.gitattributes` sets `* text=auto eol=lf`, and Prettier uses
`"endOfLine": "lf"`, so every file uses LF everywhere.
