-- Campus ERP: employee directory + staff admin section.
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.
--
--   departments ─┐
--   designations ┼─< employees >── auth.users (login + hashed password, managed by Supabase)
--   leaders ─────┘   (hod_id, dean_id)
--   employees ─< employee_attendance, leave_requests, announcements
--
-- Roles (employees.role): staff | hod | dean | manager. Only the seed script sets them.
-- Leave flow: Pending ─HOD approves→ HOD approved ─Dean approves→ Approved
--             (either rejection → Declined; staff without a HOD start at "HOD approved")
--
-- RLS everywhere: staff read the directory, but change only their own rows.
-- Passwords are never stored here; Supabase Auth keeps them hashed.

-- ---------- Lookup tables ----------
create table if not exists public.departments (
  id   smallint generated always as identity primary key,
  name text not null unique check (length(trim(name)) > 0)
);

create table if not exists public.designations (
  id    smallint generated always as identity primary key,
  title text not null unique check (length(trim(title)) > 0)
);

-- HODs and Deans. employee_id links a leader to their own employee record once known.
create table if not exists public.leaders (
  id          smallint generated always as identity primary key,
  name        text not null check (length(trim(name)) > 0),
  role        text not null check (role in ('HOD', 'Dean')),
  employee_id uuid,
  unique (name, role)
);

-- ---------- Employees (1 row per login) ----------
create table if not exists public.employees (
  id             uuid primary key references auth.users on delete cascade,
  emp_id         text not null unique check (emp_id = lower(emp_id)),
  name           text not null check (length(trim(name)) > 0),
  email          text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone          text check (phone is null or phone ~ '^\+?[0-9 ]{7,15}$'),
  department_id  smallint references public.departments,
  designation_id smallint not null references public.designations,
  hod_id         smallint references public.leaders,
  dean_id        smallint references public.leaders,
  role           text not null default 'staff' check (role in ('staff', 'hod', 'dean', 'manager')),
  created_at     timestamptz not null default now()
);
-- Upgrades for databases created by an earlier version of this file.
alter table public.employees add column if not exists role text not null default 'staff' check (role in ('staff', 'hod', 'dean', 'manager'));
alter table public.employees alter column department_id drop not null;
create index if not exists employees_department_idx on public.employees (department_id);
create index if not exists employees_hod_idx on public.employees (hod_id);

do $$ begin
  alter table public.leaders add constraint leaders_employee_fk foreign key (employee_id) references public.employees on delete set null;
exception when duplicate_object then null; end $$;

-- Flat, read-only profile for the app (respects the caller's RLS).
create or replace view public.employee_profiles with (security_invoker = true) as
select e.id, e.emp_id, e.name, e.email, e.phone,
       d.name as department, g.title as designation, h.name as hod, dn.name as dean,
       e.role, e.created_at, e.hod_id,
       (select l.id from public.leaders l where l.employee_id = e.id limit 1) as leader_id
from public.employees e
left join public.departments d on d.id = e.department_id
join public.designations g on g.id = e.designation_id
left join public.leaders h on h.id = e.hod_id
left join public.leaders dn on dn.id = e.dean_id;

alter table public.departments enable row level security;
alter table public.designations enable row level security;
alter table public.leaders enable row level security;
alter table public.employees enable row level security;

drop policy if exists "departments: read" on public.departments;
create policy "departments: read" on public.departments for select to authenticated using (true);
drop policy if exists "designations: read" on public.designations;
create policy "designations: read" on public.designations for select to authenticated using (true);
drop policy if exists "leaders: read" on public.leaders;
create policy "leaders: read" on public.leaders for select to authenticated using (true);
drop policy if exists "employees: read directory" on public.employees;
create policy "employees: read directory" on public.employees for select to authenticated using (true);
drop policy if exists "employees: update own" on public.employees;
create policy "employees: update own" on public.employees for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Directory data is written only by the seed script (secret key). Staff may edit their contact details only.
revoke all on public.departments, public.designations, public.leaders, public.employees, public.employee_profiles from anon, authenticated;
grant select on public.departments, public.designations, public.leaders, public.employees, public.employee_profiles to authenticated;
grant update (email, phone) on public.employees to authenticated;

-- Caller's role and leader id (HOD/Dean), for policies and functions.
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public
as $$ select role from public.employees where id = auth.uid() $$;
create or replace function public.my_leader_id() returns smallint
language sql stable security definer set search_path = public
as $$ select id from public.leaders where employee_id = auth.uid() limit 1 $$;
revoke execute on function public.my_role(), public.my_leader_id() from public, anon;
grant execute on function public.my_role(), public.my_leader_id() to authenticated;

-- ---------- Announcements (all staff read, author can post/delete) ----------
create table if not exists public.announcements (
  id         bigint generated always as identity primary key,
  title      text not null check (length(trim(title)) between 1 and 200),
  body       text not null check (length(trim(body)) between 1 and 5000),
  author_id  uuid not null default auth.uid() references public.employees on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists announcements_created_idx on public.announcements (created_at desc);
alter table public.announcements enable row level security;

drop policy if exists "announcements: read" on public.announcements;
create policy "announcements: read" on public.announcements for select to authenticated using (true);
drop policy if exists "announcements: post own" on public.announcements;
create policy "announcements: post own" on public.announcements for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "announcements: delete own" on public.announcements;
create policy "announcements: delete own" on public.announcements for delete to authenticated using (author_id = auth.uid());
revoke all on public.announcements from anon, authenticated;
grant select, insert, delete on public.announcements to authenticated;

-- ---------- Employee attendance (one row per employee per IST day) ----------
create table if not exists public.employee_attendance (
  employee_id uuid not null references public.employees on delete cascade,
  day         date not null,
  punch_in    timestamptz not null,
  punch_out   timestamptz check (punch_out is null or punch_out >= punch_in),
  primary key (employee_id, day)
);
alter table public.employee_attendance enable row level security;

drop policy if exists "attendance: read own" on public.employee_attendance;
create policy "attendance: read own" on public.employee_attendance for select to authenticated
  using (employee_id = auth.uid() or public.my_role() in ('manager', 'dean'));
-- No insert/update grants: rows are written only by punch() with the server clock.
revoke all on public.employee_attendance from anon, authenticated;
grant select on public.employee_attendance to authenticated;

-- First call of the day punches in; every later call records the punch out.
create or replace function public.punch()
returns public.employee_attendance
language plpgsql security definer set search_path = public
as $$
declare
  r public.employee_attendance;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  insert into public.employee_attendance (employee_id, day, punch_in)
  values (auth.uid(), (now() at time zone 'Asia/Kolkata')::date, now())
  on conflict (employee_id, day) do update set punch_out = now()
  returning * into r;
  return r;
end $$;
revoke execute on function public.punch() from public, anon;
grant execute on function public.punch() to authenticated;

-- Manager bulk import of biometric punches. All-or-nothing; unknown Emp IDs are skipped and reported.
-- rows: [{ "emp_id": "emp101", "day": "2026-10-08", "punch_in": "09:14", "punch_out": "17:30" }, ...] (IST times)
create or replace function public.import_attendance(rows jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  r jsonb; eid uuid; d date; n int := 0; unknown text[] := '{}';
begin
  if public.my_role() is distinct from 'manager' then raise exception 'Only the attendance manager can import punches'; end if;
  if jsonb_typeof(rows) <> 'array' or jsonb_array_length(rows) > 5000 then raise exception 'Send at most 5000 rows per import'; end if;
  for r in select value from jsonb_array_elements(rows) loop
    select id into eid from public.employees where emp_id = lower(trim(r->>'emp_id'));
    if eid is null then unknown := unknown || (r->>'emp_id'); continue; end if;
    d := (r->>'day')::date;
    insert into public.employee_attendance (employee_id, day, punch_in, punch_out)
    values (eid, d,
      (d + (r->>'punch_in')::time) at time zone 'Asia/Kolkata',
      case when coalesce(r->>'punch_out', '') = '' then null else (d + (r->>'punch_out')::time) at time zone 'Asia/Kolkata' end)
    on conflict (employee_id, day) do update set punch_in = excluded.punch_in, punch_out = excluded.punch_out;
    n := n + 1;
  end loop;
  return jsonb_build_object('imported', n, 'unknown', to_jsonb(unknown));
end $$;
revoke execute on function public.import_attendance(jsonb) from public, anon;
grant execute on function public.import_attendance(jsonb) to authenticated;

-- ---------- Leave requests ----------
create table if not exists public.leave_requests (
  id          bigint generated always as identity primary key,
  employee_id uuid not null default auth.uid() references public.employees on delete cascade,
  type        text not null check (type in ('Casual leave', 'Medical leave', 'On duty', 'Emergency leave')),
  from_date   date not null,
  to_date     date not null,
  reason      text not null check (length(trim(reason)) between 1 and 1000),
  status      text not null default 'Pending',
  hod_by      uuid references public.employees,
  hod_at      timestamptz,
  dean_by     uuid references public.employees,
  dean_at     timestamptz,
  remark      text check (length(remark) <= 500),
  created_at  timestamptz not null default now(),
  check (to_date >= from_date)
);
alter table public.leave_requests add column if not exists hod_by uuid references public.employees;
alter table public.leave_requests add column if not exists hod_at timestamptz;
alter table public.leave_requests add column if not exists dean_by uuid references public.employees;
alter table public.leave_requests add column if not exists dean_at timestamptz;
alter table public.leave_requests add column if not exists remark text check (length(remark) <= 500);
alter table public.leave_requests drop constraint if exists leave_requests_status_check;
alter table public.leave_requests add constraint leave_requests_status_check
  check (status in ('Pending', 'HOD approved', 'Approved', 'Declined', 'Cancelled'));
create index if not exists leave_requests_employee_idx on public.leave_requests (employee_id, created_at desc);
alter table public.leave_requests enable row level security;

-- Visible to the applicant, their HOD, and their Dean.
drop policy if exists "leave: read own" on public.leave_requests;
drop policy if exists "leave: read" on public.leave_requests;
create policy "leave: read" on public.leave_requests for select to authenticated using (
  employee_id = auth.uid() or exists (
    select 1 from public.employees e where e.id = leave_requests.employee_id and (
      (public.my_role() = 'hod' and e.hod_id = public.my_leader_id()) or
      (public.my_role() = 'dean' and e.dean_id = public.my_leader_id()))));
drop policy if exists "leave: apply" on public.leave_requests;
create policy "leave: apply" on public.leave_requests for insert to authenticated with check (employee_id = auth.uid());
-- Applicant may cancel until the Dean decides.
drop policy if exists "leave: cancel pending" on public.leave_requests;
create policy "leave: cancel pending" on public.leave_requests for update to authenticated
  using (employee_id = auth.uid() and status in ('Pending', 'HOD approved'))
  with check (employee_id = auth.uid() and status = 'Cancelled');
revoke all on public.leave_requests from anon, authenticated;
grant select on public.leave_requests to authenticated;
grant insert (type, from_date, to_date, reason) on public.leave_requests to authenticated;
grant update (status) on public.leave_requests to authenticated;

-- New requests go to the HOD, or straight to the Dean when the employee has no HOD.
create or replace function public.route_leave() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  new.status := case when (select hod_id from public.employees where id = new.employee_id) is null then 'HOD approved' else 'Pending' end;
  return new;
end $$;
drop trigger if exists leave_route on public.leave_requests;
create trigger leave_route before insert on public.leave_requests for each row execute function public.route_leave();

-- HOD decides Pending requests of their team; Dean decides HOD-approved ones.
create or replace function public.decide_leave(leave_id bigint, approve boolean, note text default null)
returns public.leave_requests
language plpgsql security definer set search_path = public
as $$
declare
  r public.leave_requests; e public.employees;
  caller_role text := public.my_role(); caller_leader smallint := public.my_leader_id();
  note_clean text := nullif(trim(note), '');
begin
  select * into r from public.leave_requests where id = leave_id for update;
  if not found then raise exception 'Leave request not found'; end if;
  select * into e from public.employees where id = r.employee_id;
  if caller_role = 'hod' and e.hod_id = caller_leader and r.status = 'Pending' then
    update public.leave_requests l
      set status = case when approve then 'HOD approved' else 'Declined' end, hod_by = auth.uid(), hod_at = now(), remark = coalesce(note_clean, l.remark)
      where l.id = leave_id returning * into r;
  elsif caller_role = 'dean' and e.dean_id = caller_leader and r.status = 'HOD approved' then
    update public.leave_requests l
      set status = case when approve then 'Approved' else 'Declined' end, dean_by = auth.uid(), dean_at = now(), remark = coalesce(note_clean, l.remark)
      where l.id = leave_id returning * into r;
  else
    raise exception 'You cannot decide this request (status: %)', r.status;
  end if;
  return r;
end $$;
revoke execute on function public.decide_leave(bigint, boolean, text) from public, anon;
grant execute on function public.decide_leave(bigint, boolean, text) to authenticated;

-- ---------- Realtime ----------
do $$
declare t text;
begin
  foreach t in array array['announcements', 'employee_attendance', 'leave_requests'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Make the new tables visible to the API immediately.
notify pgrst, 'reload schema';
