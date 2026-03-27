# SehatSync — Patient records dashboard

React + TypeScript + Tailwind UI for managing patient records, visits, and clinic workflows. Data is stored in PostgreSQL via Prisma and a Node/Express API.

Maintained by the SehatSync team with ongoing development toward production readiness.

## Features

### Core

- **Patient registry**: MRNs, demographics, contacts, allergies, problem list (PostgreSQL)
- **Encounters**: Chief complaint, diagnosis, notes, provider label; timeline on each chart
- **Dashboard** (`/`): Overview stats, activity chart, recent patients (requires sign-in)
- **Search**: Name, patient ID, or phone on the patient list
- **Analytics** (`/analytics`): Volume, revisit rate, pending actions
- **Appointments** (`/appointments`): Month calendar, table, schedule / reschedule / cancel
- **Alerts** (`/alerts`): Overdue follow-ups, upcoming visits, checkups, incomplete profiles
- **Public summary**: Marketing page (`/welcome`) can call `GET /api/public/summary` without auth

### Patient data

- Demographics, addresses, contacts
- Allergies (highlighted on chart)
- Emergency contact and blood type
- Medical history / problem list
- Encounter history

### UX

- Responsive layout, loading and error states
- Form validation on client and API
- Modals for detail views and forms
- Toasts for actions and errors

## Getting started

### Prerequisites

- Node.js 18+ recommended
- npm
- PostgreSQL (create a database, e.g. `sehatsync`, or adjust `DATABASE_URL`)

### Full stack (PostgreSQL + API + frontend)

1. **Environment file** — single `.env` at the **repo root** (not only under `server/`). Used by the API, Prisma, and optional `VITE_*` vars:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sehatsync?schema=public"
   JWT_SECRET="use-a-long-random-string-in-production"
   PORT=4000
   CORS_ORIGIN=http://localhost:8080
   SEED_ADMIN_EMAIL=admin@sehatsync.com
   SEED_ADMIN_PASSWORD=Admin123!
   VITE_API_URL=
   ```

   Align `DATABASE_URL` with your Postgres host, port, user, password, and database. Leave `VITE_API_URL` empty in dev so Vite proxies `/api` to the backend.

2. **Schema and seed**

   ```bash
   cd server && npm install && cd ..
   npm run db:push
   npm run db:seed
   ```

   Reads env from the root `.env` only. After `schema.prisma` changes, run `npm run db:push` again before starting the API. Default admin (change in production): `admin@sehatsync.com` / `Admin123!`

3. **API** (terminal 1):

   ```bash
   cd server
   npm run dev
   ```

   Listens on `http://localhost:4000`. Health: `GET /api/health`. Env is loaded from the project root `.env`.

4. **Frontend** (terminal 2, repo root):

   ```bash
   npm install
   npm run dev
   ```

   Open `http://localhost:8080`, sign in, then use Dashboard, Patients, Appointments, Alerts. Public marketing copy: `/welcome`.

5. **First user** — If the `User` table is empty, `POST /api/auth/register` may create the first account (disabled once any user exists).

### Database troubleshooting

| Issue | Action |
|--------|--------|
| `Can't reach database server at localhost:5432` | Start PostgreSQL (Windows: Services, or Docker/WSL). Ensure root `.env` `DATABASE_URL` matches your instance. |
| `npm run db:generate --pref` causes ENOENT | Invalid flag. From repo root: `npm run db:generate --prefix server`. From `server/`: `npm run db:generate` only. |
| API `503` / "Database unavailable" | Start Postgres, then `npm run db:push` and `npm run db:seed` from repo root. |

### Frontend-only

`npm run dev` without a running API will show errors on protected routes; most features expect a logged-in session and a live API.

### Install (frontend deps only)

```bash
git clone <repository-url>
cd jarurat-patient-dash
npm install
npm run dev
```

Open `http://localhost:8080`.

### Production build

```bash
npm run build
```

Output: `dist/`.

## Technical architecture

### Stack

- Frontend: React 18, TypeScript, Vite, Tailwind, shadcn/ui, TanStack Query, React Router, Lucide
- Backend: Node.js, Express, TypeScript
- Data: PostgreSQL, Prisma ORM
- Auth: JWT bearer tokens, roles `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTION`

### Project layout

```
src/
├── components/
│   ├── ui/                 # shadcn primitives
│   ├── Navigation.tsx
│   ├── DashboardCard.tsx
│   ├── SearchBar.tsx
│   ├── PatientFormModal.tsx
│   ├── PatientCard.tsx
│   ├── PatientModal.tsx
│   ├── AppointmentTable.tsx
│   └── AlertCard.tsx
├── pages/
│   ├── DashboardHome.tsx
│   ├── Home.tsx            # /welcome
│   ├── Patients.tsx
│   ├── Appointments.tsx
│   ├── Alerts.tsx
│   ├── PatientAnalytics.tsx
│   ├── About.tsx
│   └── NotFound.tsx
├── types/
├── hooks/
├── lib/
└── App.tsx
```

### Theming

- Primary: `#2563eb` (configured via CSS variables in `src/index.css`)
- Accent: `#16a34a`
- Extend Tailwind in `tailwind.config.ts`; components under `src/components/ui/`

## Configuration

- Dev server: Vite on port 8080 (default)
- `import` alias: `@/` → `src/`
- TypeScript strict mode enabled
- Production: set `VITE_API_URL` if the SPA is hosted separately from the API

## Deployment

Typical options: static hosting (Vercel, Netlify, S3) for the Vite build, with `VITE_API_URL` pointing at the deployed API. Run the API on a Node host or container with `DATABASE_URL` and `JWT_SECRET` set for the target environment.

### Render (single dynamic service)

For a single URL dynamic deployment (frontend + backend together), deploy as one Render Web Service:

- Root directory: repo root
- Build command:

  ```bash
  npm install --include=dev && npm install --prefix server --include=dev && npm run build && npm run build --prefix server
  ```

  The server `build` script runs `prisma generate` before `tsc` so `@prisma/client` types (enums, `Prisma.*` inputs) exist on CI. Omitting devDependencies breaks the Vite build; the server needs devDependencies for `prisma` CLI and TypeScript during `npm run build --prefix server`.

- Start command:

  ```bash
  node server/dist/index.js
  ```

- Health check path: `/api/health`

Required environment variables:

- `DATABASE_URL` (Supabase pooled connection string with SSL)
- `JWT_SECRET`
- `CORS_ORIGIN` (Render app URL)
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `NODE_ENV=production`

Optional (for WhatsApp):

- `TWILIO_SID`
- `TWILIO_AUTH`
- `TWILIO_WHATSAPP_NUMBER`

After first deploy, run once:

```bash
npm run db:push --prefix server
npm run db:seed --prefix server
```

## Security

- Treat PHI according to your jurisdiction (e.g. HIPAA-style rules). This repo is a demo/MVP; harden auth, TLS, logging, and backups before production.
- Use strong secrets and rotate JWT / DB credentials regularly.
- Restrict CORS origins in production.

## Contributing

1. Fork the repo
2. Branch: `git checkout -b feature/your-feature`
3. Commit with clear messages
4. Push and open a pull request




## Roadmap (ideas)

- Deeper role-specific dashboards
- Clinical alerts and rules engine
- EMR-style timeline across visits, labs, meds
- E-prescribing and lab integrations
- Offline sync for unstable networks
- Audit log for compliance

---

**SehatSync** — outpatient-style registry and encounter tooling for demos and small deployments.
