# Deployment Guide

MVP setup: **development** (local) and **production** (deployed).

- **Frontend** → [Vercel](https://vercel.com)
- **Backend (API)** → [Render](https://render.com)
- **Database** → [PlanetScale](https://planetscale.com)

---

## 1. PlanetScale (Database)

1. Create a PlanetScale account and a database (e.g. `auth-db`).
2. In the database branch (e.g. `main`), open **Connect** → **Connect with Prisma** and copy the connection string.
3. Run migrations from your machine:
   ```bash
   DATABASE_URL="mysql://..." pnpm exec prisma migrate deploy
   ```
   Or use PlanetScale’s **Deploy requests** for schema changes.

Use this **production** `DATABASE_URL` in Render.

---

## 2. Render (Backend API)

1. Create a [Render](https://render.com) account and connect your GitHub repo.
2. **New → Web Service**:
   - **Repository:** this repo
   - **Branch:** `main`
   - **Root Directory:** leave empty (repo root)
   - **Build Command:** `pnpm install --frozen-lockfile && pnpm exec prisma generate && pnpm --filter @apps/api build`
   - **Start Command:** `node apps/api/dist/main.js`
   - **Plan:** Free or paid
3. **Environment** (in Render dashboard):
   - `NODE_ENV` = `production`
   - `PORT` = `4200` (or leave default)
   - `DATABASE_URL` = your PlanetScale connection string
   - `JWT_SECRET` = a long random secret (e.g. `openssl rand -base64 32`)
   - `CORS_ORIGIN` or `FRONTEND_URL` = your Vercel frontend URL (e.g. `https://your-app.vercel.app`) — **required** so the frontend can call the API
   - `FRONTEND_URL` = same as above (used for forgot-password reset links)
   - **Password reset email:** set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (and optionally `SMTP_SECURE`, `MAIL_FROM`) so users receive reset links by email
4. After saving, open **Settings → Deploy Hook** and copy the deploy hook URL (for GitHub Actions).

---

## 3. Vercel (Frontend)

1. Create a [Vercel](https://vercel.com) account and import your GitHub repo.
2. Configure the project:
   - **Root Directory:** `apps/frontend`
   - **Framework Preset:** Next.js
   - **Build Command:** `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @apps/frontend build` (or leave default if Vercel detects the root)
   - **Output Directory:** `.next` (default)
3. **Environment variables** (in Vercel dashboard):
   - `NEXT_PUBLIC_API_URL` = your Render API URL (e.g. `https://your-api.onrender.com`)
   - Use **Production**.
4. For GitHub Actions deploys: **Project Settings → General** copy **Project ID**; Team/Profile → **Settings** copy **Team ID** (or **User ID**) → this is `VERCEL_ORG_ID`.

You can either:
- **Option A:** Let Vercel auto-deploy on push to `main`, or  
- **Option B:** Use the GitHub Actions workflow to deploy via CLI (needs the secrets below).

---

## 4. GitHub Secrets

Add these in **GitHub → Repository → Settings → Secrets and variables → Actions** (only if using Option B or Render deploy hook):

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | [Vercel](https://vercel.com/account/tokens) → Create Token (for CLI deploys) |
| `VERCEL_ORG_ID` | Team/User ID from Vercel (see step 3 above) |
| `VERCEL_PROJECT_ID` | Project ID from the frontend Vercel project |
| `RENDER_PROD_DEPLOY_HOOK_URL` | Render deploy hook URL for your production Web Service |

If you use Vercel’s native GitHub integration, you can leave `VERCEL_*` unset; the workflow will skip the Vercel step.

---

## 5. Workflow Summary

- **PR to `main`:** Runs lint and build (Prisma generate). No deploy.
- **Push to `main`:** Runs lint, test, and build; then deploys frontend to Vercel (production) and triggers Render production deploy hook (if secrets are set).

After the first deploy, set **Render’s** `CORS_ORIGIN` / `FRONTEND_URL` and **Vercel’s** `NEXT_PUBLIC_API_URL` to the live URLs so frontend and API can talk to each other.

---

## 6. Production checklist

- [ ] **Render:** `JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN` or `FRONTEND_URL`, and `FRONTEND_URL` are set.
- [ ] **Render:** SMTP env vars set if you want password-reset emails in production.
- [ ] **Vercel:** `NEXT_PUBLIC_API_URL` points to your Render API URL (e.g. `https://your-api.onrender.com`).
- [ ] Auth cookie uses `SameSite=None` and `Secure` in production so login works when frontend (Vercel) and API (Render) are on different domains.
- [ ] Migrations applied to the deployment database (`pnpm exec prisma migrate deploy` with the right `DATABASE_URL`).
