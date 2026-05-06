# Dev Runbook

## Purpose

This runbook covers common local development operations for Basketball Manager:

- reset the database;
- recreate demo or test seed data;
- inspect logs;
- restart local services or containers;
- recover from common environment issues.

Use it when the app stops loading data, Prisma reports missing tables, backend returns `500`,
or frontend shows stale career state after local experiments.

---

## Quick Health Check

Start here before resetting anything.

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "backend",
  "database": {
    "status": "ok",
    "name": "basketball_manager"
  }
}
```

If this fails, check whether PostgreSQL and backend are running.

```bash
npm run db:test
```

---

## Start Local Environment

### Option A. Local PostgreSQL Helper

Use this when Docker is unavailable or you want a lightweight local database.

```bash
cargo run --manifest-path infra/local-postgres/Cargo.toml -- start
```

Keep this process running while developing. It stores database files in `.local/postgres/data/`.

Then start backend and frontend in separate terminals:

```bash
npm run dev --workspace @basketball-manager/backend
```

```bash
npm run dev --workspace @basketball-manager/frontend
```

Frontend URL:

```text
http://localhost:5173/
```

Backend URL:

```text
http://localhost:3000/
```

### Option B. Docker Compose

Use this when Docker is available and you want backend plus PostgreSQL in containers.

```bash
docker compose up -d postgres backend
```

Check container status:

```bash
docker compose ps
```

Stop containers:

```bash
docker compose down
```

Stop containers and remove the local PostgreSQL volume:

```bash
docker compose down -v
```

`down -v` deletes database data stored in the Compose volume.

---

## Reset DB

### Demo Development Reset

Use this for normal local development.

```bash
npm run prisma:reset
```

What it does:

- drops local database data;
- reapplies all Prisma migrations;
- runs demo seed from [prisma/seed.mjs](/home/newuser/Documents/BM/prisma/seed.mjs:1).

Use when:

- migrations changed;
- local data is inconsistent;
- demo career data should start fresh;
- backend errors mention missing tables or invalid schema.

### Test Seed Reset

Use this for smoke tests, QA, and reproducible bug reports.

```bash
npm run prisma:reset:test
```

What it does:

- drops local database data;
- reapplies all migrations;
- skips demo seed;
- runs deterministic test seed from [prisma/seed-test.mjs](/home/newuser/Documents/BM/prisma/seed-test.mjs:1).

Use when:

- Playwright smoke tests need predictable teams, matches, and standings;
- you need a stable test season;
- a bug report should reproduce with fixed team names and match schedule.

---

## Seed

### Recreate Demo Seed Without Reset

```bash
npm run prisma:seed
```

Alias:

```bash
npm run db:seed
```

This updates demo teams and players without dropping the database.

### Recreate Test Seed Without Reset

```bash
npm run prisma:seed:test
```

This ensures deterministic test teams, players, matches, season, and standings exist.

### When To Reset Instead Of Seed

Seed alone is usually enough when:

- teams or players are missing;
- demo data looks outdated;
- tests need fixed test teams again.

Use reset when:

- Prisma says a table does not exist;
- migrations are pending or schema is inconsistent;
- stale rows from old schema versions break API behavior;
- you need to fully erase local career saves and season data.

---

## Logs

### Local Process Logs

When running with `npm run dev`, logs are printed directly in the terminal where the process is running.

Backend:

```bash
npm run dev --workspace @basketball-manager/backend
```

Frontend:

```bash
npm run dev --workspace @basketball-manager/frontend
```

Watch backend logs for:

- Prisma errors;
- `EADDRINUSE`;
- `500 INTERNAL_ERROR`;
- validation errors;
- route mappings on startup.

### Docker Logs

Backend logs:

```bash
docker compose logs -f backend
```

PostgreSQL logs:

```bash
docker compose logs -f postgres
```

Recent logs only:

```bash
docker compose logs --tail=100 backend
```

```bash
docker compose logs --tail=100 postgres
```

---

## Restart

### Restart Local Dev Processes

For local `npm run dev` processes:

1. Stop the terminal process with `Ctrl+C`.
2. Start it again.

Backend:

```bash
npm run dev --workspace @basketball-manager/backend
```

Frontend:

```bash
npm run dev --workspace @basketball-manager/frontend
```

Local PostgreSQL helper:

```bash
cargo run --manifest-path infra/local-postgres/Cargo.toml -- start
```

### Restart Docker Containers

Restart backend only:

```bash
docker compose restart backend
```

Restart PostgreSQL only:

```bash
docker compose restart postgres
```

Restart all Compose services:

```bash
docker compose restart
```

Rebuild backend image and start again:

```bash
docker compose up -d --build backend
```

---

## Common Issues

### Backend Returns `EADDRINUSE`

Meaning: port `3000` is already used by another backend process.

Fix:

```bash
curl http://localhost:3000/health
```

If another backend is already healthy, reuse it. Otherwise stop the old process and start backend again.

### Frontend Opens But Data Does Not Load

Check backend health:

```bash
curl http://localhost:3000/health
```

Check teams endpoint:

```bash
curl http://localhost:3000/teams
```

If backend is down, start it:

```bash
npm run dev --workspace @basketball-manager/backend
```

If database is down, start PostgreSQL helper or Compose.

### Prisma Says Table Does Not Exist

Typical error:

```text
P2021 table does not exist
```

Fix:

```bash
npm run prisma:migrate
```

If the local database is disposable:

```bash
npm run prisma:reset
```

For deterministic QA state:

```bash
npm run prisma:reset:test
```

### Career Save Looks Stale In Browser

The frontend stores active career save id in browser localStorage under:

```text
bm-active-save-id
```

Use the dev/admin delete save action on the Season Dashboard when possible.

If the save was deleted directly from DB and the UI still points to it, reload `/season`.
The app should clear missing active save state automatically.

### Calendar Or Standings Show Test League Instead Of Career

Calendar and standings prefer the active career save from `bm-active-save-id`.

If they show `Test League 2026`, there is likely no active career save in localStorage.
Open `/season` and create or select a career.

### Smoke Test Fails Before Opening Pages

Run:

```bash
curl http://localhost:3000/health
```

Then:

```bash
npm run prisma:seed:test
```

Then:

```bash
npm run test:smoke --workspace @basketball-manager/frontend
```

The smoke test expects backend and PostgreSQL to be running.

---

## Useful Verification Commands

Backend build:

```bash
npm run build --workspace @basketball-manager/backend
```

Frontend build:

```bash
npm run build --workspace @basketball-manager/frontend
```

Backend e2e:

```bash
npm run test:e2e --workspace @basketball-manager/backend -- --runInBand
```

Frontend smoke:

```bash
npm run test:smoke --workspace @basketball-manager/frontend
```

Prisma migration status:

```bash
npx prisma migrate status
```

Regenerate Prisma client:

```bash
npm run prisma:generate
```

---

## Recovery Recipes

### Fastest Full Local Recovery

Use when the environment is confused and local data can be deleted.

```bash
npm run prisma:reset
npm run dev --workspace @basketball-manager/backend
npm run dev --workspace @basketball-manager/frontend
```

### Stable QA Recovery

Use before smoke tests or reproducible QA.

```bash
npm run prisma:reset:test
npm run test:smoke --workspace @basketball-manager/frontend
```

### Docker Recovery

Use when Compose services are stuck.

```bash
docker compose down
docker compose up -d postgres backend
docker compose logs -f backend
```

If database data can be deleted:

```bash
docker compose down -v
docker compose up -d postgres backend
```
