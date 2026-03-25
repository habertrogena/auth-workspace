# ForwardFlow Kenya — Setup

## 1. Database (PostgreSQL)

### Option A: Run PostgreSQL in Docker (recommended)

From the repo root:

```bash
# Start Postgres (required before migrate)
pnpm run docker:db
# or: docker compose up -d
```

**Important:** Ensure Docker Desktop (or Docker Engine) is running, then start the container. Check with:

```bash
docker compose ps
# Should show "forwardflow-postgres" with state "running"
```

This starts PostgreSQL 16 with:
- **Host/port:** `localhost:5433` (port 5433 to avoid conflict with a system Postgres on 5432)
- **User:** `postgres`
- **Password:** `postgres`
- **Database:** `auth_app`

In your `.env` at the repo root, set:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/auth_app"
```

To stop the database:

```bash
pnpm run docker:db:down
# or: docker compose down
```

### Option B: Use an existing PostgreSQL instance

Set `DATABASE_URL` in `.env` at the repo root (or in `apps/api/.env`):

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

## 2. Prisma

From the **repo root**:

```bash
# 1. Generate Prisma client (required so API has Role, User.username, Business, etc.)
pnpm run prisma:generate

# 2. Start Docker Postgres (if not already running), then run migrations
pnpm run db:migrate
# This runs: docker compose up -d → waits for DB → prisma migrate dev

# Or do it manually:
#   pnpm run docker:db
#   # wait a few seconds for Postgres to start
#   pnpm run prisma:migrate

# 3. Seed the default admin user (username: habertdev, password: $Habertdev12)
pnpm run prisma:seed

# 4. (Optional) Seed 30 dummy businesses for testing the dashboard
pnpm run prisma:seed-dummy
```

Or from `apps/api`:

```bash
cd apps/api
pnpm run prisma:generate   # uses ../../prisma/schema.prisma
pnpm run prisma:migrate   # uses ./prisma/schema.prisma for migrations
pnpm run prisma:seed
```

## 3. API (NestJS)

```bash
cd apps/api
pnpm run dev
```

Defaults to `http://localhost:4200`. Ensure `JWT_SECRET` and `DATABASE_URL` are set in env.

## 4. Frontend (Next.js)

```bash
cd apps/frontend
pnpm run dev
```

Set `NEXT_PUBLIC_API_URL` to your API base URL (e.g. `http://localhost:3000` if the API runs there).

## 5. Admin login

- **URL:** `/login`
- **Username:** `habertdev`
- **Password:** `$Habertdev12`

No register endpoint; admins are created manually (e.g. via seed or DB).

## API endpoints (admin, JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login (username + password) |
| GET | `/auth/me` | Current user |
| GET | `/businesses` | List businesses |
| GET | `/businesses/:id` | Business detail |
| PATCH | `/businesses/:id/lock` | Lock business (body: `{ "reason"?: string }`) |
| PATCH | `/businesses/:id/unlock` | Unlock business |
| PATCH | `/subscriptions/:id/update` | Update subscription (body: `planType`, `status`, `endDate`) |
| GET | `/analytics/overview` | Dashboard stats |

---

## Troubleshooting

**"Can't reach database server at localhost:5433"**

1. **Docker must be running** – Start Docker Desktop (or Docker Engine) and ensure it’s not paused.
2. **Start the Postgres container:**
   ```bash
   cd /home/sir/Projects/auth-workspace
   docker compose up -d
   ```
3. **Check the container is up:**
   ```bash
   docker compose ps
   ```
   You should see `forwardflow-postgres` with state `running`. If it’s `exited`, run `docker compose logs postgres` to see why.
4. **Run migrations** (after the container is running):
   ```bash
   pnpm run db:migrate
   ```
   Or: `pnpm run prisma:migrate` if the container is already up.
