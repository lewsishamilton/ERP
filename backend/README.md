# Backend (Supabase)

Supabase serves as the backend. There is no separate server: the browser talks to Supabase directly, and access is enforced by Row Level Security in Postgres.

```
backend/
├── supabase/schema.sql      Tables, RLS policies, punch() function, realtime. Run in SQL Editor.
├── scripts/seed-staff.mjs   Creates a login + employee record per CSV row, fills lookup tables
├── scripts/check.mjs        End-to-end check: RLS, punch(), leave approvals, import, realtime
├── scripts/employees.mjs    CSV parser + login domain (shared)
├── data/employees.csv       Test staff list (gitignored: contains passwords)
├── data/accounts.csv        HOD / Dean / Manager logins, Role column (gitignored: contains passwords)
└── .env                     SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY (gitignored)
```

## Setup

1. Supabase Dashboard → SQL Editor → paste `supabase/schema.sql` → Run.
2. `npm run seed:staff` (from `backend/` or the repo root).
3. `npm run check`. It should print `✓ all staff backend checks passed`.

## Logins

Staff sign in with **Emp ID + password** from the CSV (e.g. `emp101` / `Aarav@101`).
Internally each Emp ID maps to the auth email `emp101@staff.aims.local`, so the CSV email is only used as contact info.
Re-running the seed resets passwords to the CSV values.

| Login | Role | Sees |
|---|---|---|
| `emp101`…`emp160` | staff | own attendance, leave, profile |
| `hod01`…`hod06` | HOD (Chandra, Anjali, Pooja, Cherry, Mohan, Radha) | + Leave Approvals and My Team for their staff |
| `dean01` | Dean (Gangadhar) | + all employees and HODs, final leave approval |
| `mgr01` | Attendance Manager | + upload biometric punches (CSV / .xlsx) |

Passwords for the leader accounts are in `data/accounts.csv`.

## Leave approval flow

```
apply → Pending ──HOD approves──→ HOD approved ──Dean approves──→ Approved
            └─HOD rejects─→ Declined      └─Dean rejects─→ Declined
```
Staff without a HOD (HODs themselves, the manager) start at **HOD approved**, so their request goes straight to the Dean.
Decisions go through `decide_leave()`, which checks the caller really is that employee's HOD or Dean.
The applicant can cancel until the Dean decides, and sees each status change live.

## Tables

```
departments ─┐
designations ┼─< employees >── auth.users (login + hashed password)
leaders ─────┘   (HOD / Dean; hod_id, dean_id)
employees ─< employee_attendance, leave_requests, announcements
```

| Table | Who can read | Who can write |
|---|---|---|
| `departments`, `designations`, `leaders` | all signed-in staff | seed script only |
| `employees` | all signed-in staff | seed script; staff may edit only their own `email`, `phone` |
| `employee_profiles` (view) | all signed-in staff | read-only flat profile (employee + department, designation, HOD, dean) |
| `announcements` | all signed-in staff | any staff posts; author deletes |
| `employee_attendance` | own rows; Manager and Dean see all | `punch()` (server clock), Manager via `import_attendance()` |
| `leave_requests` | own rows; your HOD and Dean | apply; cancel own until final; HOD/Dean via `decide_leave()` |

Passwords live only in Supabase Auth (hashed), never in these tables.

The secret key is used only by these scripts. Never put it in `frontend/`.
