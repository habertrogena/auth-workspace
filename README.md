# Auth Workspace

A full-stack authentication app: NestJS API + Next.js frontend in a pnpm monorepo. Features include register, login (JWT in HTTP-only cookies), password reset via email, and a simple dashboard.

---

## Tech stack

| Layer      | Technology |
|-----------|------------|
| **Monorepo** | pnpm workspaces |
| **Backend**  | NestJS 11, Node 22, TypeScript |
| **API**      | Express, Passport (JWT), bcrypt, class-validator, class-transformer, Helmet, cookie-parser, Throttler, Pino (logging) |
| **Database** | MySQL via Prisma 5 (ORM + migrations) |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **UI**        | Tailwind CSS, Radix UI, react-hook-form, Zod, Lucide React |
| **Auth**      | JWT stored in HTTP-only cookies; CORS + credentials for cross-origin frontend |

---

## How to run the project locally

**Prerequisites:** Node.js 22 (or LTS), pnpm 10.x, a local MySQL instance (or a reachable MySQL URL).

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd auth-workspace
   pnpm install
   ```

2. **Environment**
   - Create a `.env` file at the **repo root** (see `.env.example` below if you add one).
   - Required for the API:
     - `DATABASE_URL` – MySQL connection string (e.g. `mysql://user:password@localhost:3306/auth`)
     - `JWT_SECRET` – long random string (e.g. `openssl rand -base64 32`)

3. **Generate Prisma client**
   ```bash
   pnpm exec prisma generate
   ```
   Run from the repo root so the client is generated into the root `node_modules` (used by the API).

4. **Optional: run migrations**
   ```bash
   pnpm exec prisma migrate deploy
   ```
   Use this when the database is empty or you want to apply pending migrations.

5. **Start dev (API + frontend)**
   ```bash
   pnpm dev
   ```
   - API: http://localhost:4200  
   - Frontend: http://localhost:3000  

All commands above are intended to be run from the **repo root**. The frontend talks to the API via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4200` when unset).

---

## Assumptions and decisions

- **Monorepo:** One repo for API and frontend to keep auth and UI in sync and simplify tooling (single lockfile, shared scripts).
- **Prisma at root:** Schema and migrations live in `/prisma`; the API depends on the root `@prisma/client` and generated client. `prisma generate` is run from the root.
- **JWT in HTTP-only cookies:** Tokens are not exposed to JS, reducing XSS risk. Frontend sends credentials so cookies are sent cross-origin; the API uses `CORS_ORIGIN` / `FRONTEND_URL` to allow the frontend origin.
- **Single frontend origin in production:** CORS is configured for one frontend URL (`FRONTEND_URL` or `CORS_ORIGIN`). Multiple origins would require a list or env-based config.
- **Password reset via email:** Reset links point at the frontend; the API validates the token and redirects. SMTP is optional and configured via env (e.g. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- **No OAuth/social login:** Only email + password and JWT; social providers would be a separate addition.
- **MySQL:** Prisma migrations are used for schema changes.

---

## What would be improved with more time

- **One-time OTP after login:** Incorporate a one-time OTP (e.g. email or authenticator app) once the user logs in to strengthen security.
- **Turborepo:** Configure the app to use Turborepo as the monorepo grows, for faster and more predictable builds and caching.
- **Social login:** Add sign-in with Google (and optionally other providers) to simplify the process for users.
- **E2E tests:** Add a small E2E suite (e.g. Playwright or Supertest) for register → login → protected route and optionally password reset.
- **Rate limiting and security:** Tune Throttler per route (stricter on login/register), add optional CSRF for state-changing requests, and document security headers (Helmet is already in use).
- **Structured logging:** Use Pino’s request context and log levels in production; optional correlation IDs for tracing.
- **Health and readiness:** Add a `/health` (or `/ready`) endpoint for the API for liveness and, if needed, DB connectivity checks.
