// Creates a Supabase login + employee record for every row of the given CSVs,
// filling the departments / designations / leaders lookup tables on the way.
// Usage (from backend/): npm run seed:staff
//   data/employees.csv  staff (role defaults to "staff")
//   data/accounts.csv   HODs, Dean, Manager (Role column: hod | dean | manager)
// Re-runnable: existing users get their password and profile refreshed.
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { LOGIN_DOMAIN, parseEmployees } from './employees.mjs'

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env')
const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

const rows = process.argv.slice(2).filter(existsSync).flatMap((f) => parseEmployees(readFileSync(f, 'utf8')))
const roleOf = (r) => (r.Role || 'staff').toLowerCase()

// One listing of existing users so re-runs update instead of failing.
const existing = new Map()
for (let page = 1; ; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
  if (error) throw error
  data.users.forEach((u) => existing.set(u.email, u.id))
  if (data.users.length < 1000) break
}

// Lookup tables: upsert every distinct value once, then map value → id.
async function lookup(table, col, values, extra = {}) {
  const unique = [...new Set(values.filter(Boolean))]
  if (!unique.length) return new Map()
  const { data, error } = await admin.from(table)
    .upsert(unique.map((v) => ({ [col]: v, ...extra })), { onConflict: [col, ...Object.keys(extra)].join(',') })
    .select(`id, ${col}`)
  if (error) throw new Error(`${table}: ${error.message}`)
  return new Map(data.map((d) => [d[col], d.id]))
}
const departments = await lookup('departments', 'name', rows.map((r) => r.Department))
const designations = await lookup('designations', 'title', rows.map((r) => r.Designation))
const hods = await lookup('leaders', 'name', [...rows.map((r) => r.HOD), ...rows.filter((r) => roleOf(r) === 'hod').map((r) => r.Emp_Name)], { role: 'HOD' })
const deans = await lookup('leaders', 'name', [...rows.map((r) => r.Dean), ...rows.filter((r) => roleOf(r) === 'dean').map((r) => r.Emp_Name)], { role: 'Dean' })

let ok = 0
for (const r of rows) {
  const empId = r.Emp_ID.toLowerCase()
  const role = roleOf(r)
  const email = `${empId}@${LOGIN_DOMAIN}`
  let id = existing.get(email)
  const res = id
    ? await admin.auth.admin.updateUserById(id, { password: r.Emp_Password })
    : await admin.auth.admin.createUser({ email, password: r.Emp_Password, email_confirm: true, app_metadata: { emp_id: empId } })
  if (res.error) { console.error(`✗ ${empId}: ${res.error.message}`); continue }
  id = res.data.user.id

  const { error } = await admin.from('employees').upsert({
    id, emp_id: empId, name: r.Emp_Name, email: r['Email-ID'] || null, role,
    department_id: departments.get(r.Department) ?? null, designation_id: designations.get(r.Designation),
    hod_id: hods.get(r.HOD) ?? null, dean_id: deans.get(r.Dean) ?? null,
  })
  if (error) { console.error(`✗ ${empId} profile: ${error.message}`); continue }

  // HOD / Dean accounts own their leaders row, which is what approvals check.
  const leader = role === 'hod' ? hods.get(r.Emp_Name) : role === 'dean' ? deans.get(r.Emp_Name) : null
  if (leader) {
    const { error: e } = await admin.from('leaders').update({ employee_id: id }).eq('id', leader)
    if (e) { console.error(`✗ ${empId} leader link: ${e.message}`); continue }
  }
  ok++
}
console.log(`Seeded ${ok}/${rows.length} accounts · ${departments.size} departments · ${designations.size} designations · ${hods.size} HODs · ${deans.size} deans.`)
if (ok < rows.length) process.exitCode = 1
