## MediDash Plus – Hospital Management System (HMS)

Live Demo: [medidash-plus.vercel.app/home](https://medidash-plus.vercel.app/home)

MediDash Plus is a role‑based Hospital Management System built primarily as a frontend app with Supabase as the backend‑as‑a‑service. It implements authentication, authorization by role, and key workflows such as appointment booking and prescription creation.

### Assignment Mapping (Requirements vs Implemented)

- **Stack requirement (MERN: MongoDB, Express.js, React, Node.js)**
  - Followed: React + Vite + TypeScript on the frontend.
  - Not followed: No Express/Node server or MongoDB. Used Supabase (Postgres + auth + storage) instead of a custom MERN backend.

- **Authentication & Authorization (Super Admin, Admin, Doctor, Patient, Nurse, Receptionist)**
  - Followed: Email/password auth via Supabase; role stored in `user_roles` table; guarded routes and role‑based dashboards with `ProtectedRoute` and `AuthContext`.

- **State management (Redux/Zustand/Context API)**
  - Followed: React Context API (`src/contexts/AuthContext.tsx`) for auth/session/role state.

- **Global search, pagination, form validation**
  - Partially followed: Several forms use validation with `zod`. Global search and pagination are not implemented across lists; only small in‑dialog filtering is present (e.g., receptionist patient search).

- **Role‑specific dashboards and access**
  - Followed: Dedicated dashboards for all roles with protected routing.

- **CRUD operations (users, patients, doctors, appointments, etc.)**
  - Partially followed: Implemented creation flows for appointments (Patient and Receptionist) and prescriptions (Doctor). Many list/detail/update/delete views are scaffolded in UI but not wired to data yet.

- **Document management**
  - Not fully followed: UI stubs exist for documents, but upload/verify/download flows are not completed. No file storage integration yet.

- **Scalability & maintainability**
  - Followed at a basic level: Modular pages/components, role‑based routing, Supabase SQL migrations. No production Node API.

- **Bonus: Real‑time notifications**
  - Not followed: No Socket.io or real‑time channels wired up yet.

### What’s Implemented in the Dashboard

- **Authentication**: Sign up/sign in with role awareness; prevents logging in with a mismatched role.
- **Role‑based routing**: Redirects to appropriate dashboard. Unassigned users are sent to `Home`.
- **Patient**:
  - Book appointment with doctor selection, date/time picker, and reason.
  - Auto‑create a minimal patient profile if missing.
- **Receptionist**:
  - Book appointment for existing patients; quick patient search and doctor selection.
- **Doctor**:
  - Create prescription with multiple medications; persists `medical_records` and `prescriptions` in Supabase.
- **Admin / Super Admin / Nurse**:
  - Rich UI cards and actions are scaffolded; most buttons are placeholders pending backend endpoints and data tables.

### Known Limitations / Non‑Working or Partial Areas

- Document uploads, verification, and downloads are not implemented.
- Most analytics/stats are static placeholders.
- No global search across entities; no pagination on lists.
- Limited CRUD: update/delete flows and detailed list pages are pending.
- No server‑side Node/Express API and no MongoDB; Supabase is used instead.
- No real‑time notifications.

---

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Postgres + SQL migrations)
- Zod (form validation)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Supabase project (recommended) or run Supabase locally

### Environment Variables

Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
```

### Setup & Run

```
git clone <your-repo-url>
cd medidash-plus-1
npm install

# Start dev server
npm run dev
```

Open the app at the Vite URL shown in the terminal.

### Optional: Run Supabase locally

Windows batch helpers are provided:

```
# Start Supabase Docker stack (requires Docker Desktop)
start-supabase.bat

# Apply database schema/migrations
setup-database.bat
```

Alternatively, create the required tables in a hosted Supabase project and set the `.env` accordingly. SQL migrations are in `supabase/migrations/`.

## Usage Notes

- You can self‑register as a Patient. Other roles typically need an admin to assign a role in the `user_roles` table.
- Sign‑in requires selecting the correct role; mismatched role logins are rejected by the app.

## Deployment

The app is deployed to Vercel:

- Live: [MediDash Plus (Vercel)](https://medidash-plus.vercel.app/home)

To deploy your fork, connect the repository to Vercel and configure the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

## Directory Highlights

- `src/contexts/AuthContext.tsx`: Auth/session/role management and navigation logic.
- `src/components/ProtectedRoute.tsx`: Role‑gated routing.
- `src/pages/*Dashboard.tsx`: Role dashboards and flows.
- `src/integrations/supabase/`: Supabase client and types.
- `supabase/migrations/`: SQL migrations used by the app.

## Roadmap (Next Steps)

- Implement document storage (upload/verify/download) via Supabase Storage.
- Add list pages with server‑side pagination and global search.
- Complete CRUD for users, doctors, patients, appointments.
- Add real‑time notifications (e.g., appointments and prescription updates).
- Replace placeholder stats with live analytics.

---

If you have trouble running the project or need test data/roles created in your Supabase instance, open an issue or contact the maintainer.


