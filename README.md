# Campus ERP

Staff portal (Learning + Admin) backed by Supabase. Student pages exist but are not connected yet. The React app in `frontend/` is a pixel-for-pixel port of the original HTML prototype in `design/`.

```
ERP/
├── design/      Original HTML/CSS/JS prototype (reference only)
├── frontend/    React + TypeScript + Tailwind app
└── backend/     Supabase schema, staff seed + check scripts (see backend/README.md)
```

## Run the application

From the project root:
```bash
npm install
npm run dev
```

Or from the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```

First-time setup: follow backend/README.md (run schema.sql, then `npm run seed:staff`).

Then open http://localhost:5173 and sign in with an Emp ID and password from the CSV (e.g. `emp101` / `Aarav@101`). Run `npm run build` to type-check and produce the production bundle.

## Frontend layout

```
frontend/src/
├── main.tsx              Entry point: mounts <App/> inside the store provider
├── App.tsx               Follows the Supabase session: login or staff portal, plus the toast
├── index.css             Tailwind setup, colour tokens, shared design classes (.card, .btn, …)
├── types.ts              Data shapes (Notice, Assignment, Query, …)
├── data/mock.ts          All demo data. Swap these for API calls later
├── lib/format.ts         Date, currency and IST time helpers
├── lib/supabase.ts       Supabase client + Emp ID → login email
├── lib/staffApi.ts       Live (realtime) data hooks + actions for the Admin section
├── lib/punchImport.ts    CSV / Excel punch file parser (check: node frontend/scripts/check-punch-import.ts)
├── store/ErpContext.tsx  App-wide state: useErp() → { s, set, flash }
├── components/
│   ├── Icon.tsx          The SVG icons
│   ├── ui.tsx            Small building blocks: Pill, Bar, Tabs, CardHead, StatCard, Select, …
│   └── PortalLayout.tsx  Sidebar + header shared by both portals
└── pages/
    ├── Login.tsx
    ├── student/          StudentPortal.tsx (menu) + one file per page
    │                     Dashboard, BasicInfo, Academic, Exams, Fees, Marks,
    │                     Downloads, AskFaculty, Contact
    └── staff/
        ├── StaffPortal.tsx   Learning / Admin switch + menus
        ├── learning/         Students' data (demo data for now): Dashboard, Attendance,
        │                     MarksEntry, Assignments, Notices, Queries
        └── admin/            Own records, live from Supabase: Dashboard, Announcements,
                              MyAttendance, MyLeave, Profile, PunchButton
                              + role pages: LeaveApprovals (HOD/Dean), People (HOD team / Dean directory),
                                AttendanceUpload (Manager)
```

**To add a page:** create a file in `pages/staff/learning/` or `pages/staff/admin/`, add its key to `LearningSection`/`AdminSection` in `types.ts`, then add it to `LEARNING`/`ADMIN` and `nav` in `StaffPortal.tsx`.

**Data:** the Admin section reads and writes Supabase and updates live through Realtime. The Learning and student pages still use the in-memory demo data in `data/mock.ts`.
