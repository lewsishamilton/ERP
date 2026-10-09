// End-to-end check of the staff backend: logins, RLS isolation, punch(), leave approvals, attendance import, realtime.
// Usage (from backend/): npm run check   — uses emp101/emp102 from data/employees.csv and hod/dean/manager from data/accounts.csv
// Cleans up every row it creates.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { parseEmployees, LOGIN_DOMAIN } from './employees.mjs'

const { SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY } = process.env
const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
const [a, b] = parseEmployees(readFileSync('data/employees.csv', 'utf8'))
const acc = Object.fromEntries(parseEmployees(readFileSync('data/accounts.csv', 'utf8')).map((r) => [r.Emp_ID, r]))
const hodOf = (emp) => Object.values(acc).find((r) => r.Role === 'hod' && r.Emp_Name === emp.HOD)
const otherHod = (emp) => Object.values(acc).find((r) => r.Role === 'hod' && r.Emp_Name !== emp.HOD)

async function signIn(emp) {
  const c = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
  const { data, error } = await c.auth.signInWithPassword({ email: `${emp.Emp_ID.toLowerCase()}@${LOGIN_DOMAIN}`, password: emp.Emp_Password })
  assert.ifError(error)
  return { c, id: data.user.id }
}

const A = await signIn(a), B = await signIn(b)
const H = await signIn(hodOf(a)), H2 = await signIn(otherHod(a)), D = await signIn(acc.dean01), M = await signIn(acc.mgr01)
const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
const created = { leave: [], ann: [] }

try {
  // Profiles: own row readable, protected columns not editable, anon sees nothing.
  const me = await A.c.from('employee_profiles').select('*').eq('id', A.id).single()
  assert.equal(me.data.emp_id, a.Emp_ID.toLowerCase())
  assert.equal(me.data.department, a.Department, 'profile view joins the department')
  const sneaky = await A.c.from('employees').update({ designation_id: 1 }).eq('id', A.id)
  assert.ok(sneaky.error, 'staff must not edit their designation')
  const other = await A.c.from('employees').update({ phone: '9876543210' }).eq('id', B.id).select()
  assert.equal(other.data?.length ?? 0, 0, 'staff must not edit someone else')
  assert.equal((await anon.from('employees').select('id')).data?.length ?? 0, 0, 'anon must not read staff')

  // punch(): server time, one row per day, invisible to others, no direct writes.
  const p1 = await A.c.rpc('punch'); assert.ifError(p1.error)
  const p2 = await A.c.rpc('punch'); assert.ifError(p2.error)
  assert.ok(p2.data.punch_out, 'second punch records punch out')
  assert.equal((await B.c.from('employee_attendance').select('*').eq('employee_id', A.id)).data.length, 0, 'B must not see A attendance')
  const forged = await A.c.from('employee_attendance').insert({ employee_id: A.id, day: '2020-01-01', punch_in: '2020-01-01T03:00:00Z' })
  assert.ok(forged.error, 'direct attendance insert must be blocked')

  // Leave: apply, others can't see, can't self-approve, can cancel.
  const l = await A.c.from('leave_requests').insert({ type: 'Casual leave', from_date: '2026-12-01', to_date: '2026-12-01', reason: 'check script' }).select().single()
  assert.ifError(l.error); created.leave.push(l.data.id)
  assert.equal((await B.c.from('leave_requests').select('id').eq('id', l.data.id)).data.length, 0, 'B must not see A leave')
  const approve = await A.c.from('leave_requests').update({ status: 'Approved' }).eq('id', l.data.id).select()
  assert.ok(approve.error || approve.data.length === 0, 'staff must not approve own leave')
  const cancel = await A.c.from('leave_requests').update({ status: 'Cancelled' }).eq('id', l.data.id).select().single()
  assert.equal(cancel.data?.status, 'Cancelled')

  // Approval flow: HOD first, then Dean. Wrong HOD, early Dean and forged status are refused.
  const forgedLeave = await A.c.from('leave_requests').insert({ type: 'Casual leave', from_date: '2026-12-02', to_date: '2026-12-02', reason: 'x', status: 'Approved' })
  assert.ok(forgedLeave.error, 'applicant must not set the status')
  const apply = async (day) => {
    const r = await A.c.from('leave_requests').insert({ type: 'Casual leave', from_date: day, to_date: day, reason: 'check script' }).select().single()
    assert.ifError(r.error); created.leave.push(r.data.id); return r.data
  }
  const l2 = await apply('2026-12-03')
  assert.equal(l2.status, 'Pending', 'staff with a HOD start at Pending')
  assert.ok((await H2.c.rpc('decide_leave', { leave_id: l2.id, approve: true })).error, 'another HOD must not decide')
  assert.ok((await D.c.rpc('decide_leave', { leave_id: l2.id, approve: true })).error, 'Dean must wait for the HOD')
  assert.equal((await H2.c.from('leave_requests').select('id').eq('id', l2.id)).data.length, 0, 'other HOD must not see it')
  const h = await H.c.rpc('decide_leave', { leave_id: l2.id, approve: true }); assert.ifError(h.error)
  assert.equal(h.data.status, 'HOD approved')
  const d = await D.c.rpc('decide_leave', { leave_id: l2.id, approve: true }); assert.ifError(d.error)
  assert.equal(d.data.status, 'Approved')
  assert.equal((await A.c.from('leave_requests').select('status').eq('id', l2.id).single()).data.status, 'Approved', 'applicant sees final status')

  const l3 = await apply('2026-12-04')
  const rej = await H.c.rpc('decide_leave', { leave_id: l3.id, approve: false, note: 'Exams that week' }); assert.ifError(rej.error)
  assert.equal(rej.data.status, 'Declined'); assert.equal(rej.data.remark, 'Exams that week')
  assert.ok((await D.c.rpc('decide_leave', { leave_id: l3.id, approve: true })).error, 'HOD-rejected leave must not reach the Dean')

  // Manager import: only managers, unknown IDs reported, all-or-nothing on bad data.
  const rows = [{ emp_id: a.Emp_ID, day: '2020-01-02', punch_in: '09:00', punch_out: '17:00' }, { emp_id: 'nobody', day: '2020-01-02', punch_in: '09:00', punch_out: '' }]
  assert.ok((await A.c.rpc('import_attendance', { rows })).error, 'staff must not import attendance')
  const imp = await M.c.rpc('import_attendance', { rows }); assert.ifError(imp.error)
  assert.deepEqual(imp.data, { imported: 1, unknown: ['nobody'] })
  const mine = await A.c.from('employee_attendance').select('punch_in').eq('day', '2020-01-02').single()
  assert.equal(new Date(mine.data.punch_in).toISOString(), '2020-01-02T03:30:00.000Z', '09:00 IST stored correctly')
  assert.ok((await M.c.rpc('import_attendance', { rows: [{ emp_id: a.Emp_ID, day: '2020-13-40', punch_in: '09:00' }] })).error, 'bad dates rejected')

  // Realtime: B receives A's announcement live.
  const got = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('no realtime event within 15s')), 15000)
    B.c.channel(`check-${randomUUID()}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (e) => {
      clearTimeout(t)
      resolve(e.new)
    })
      .subscribe((status) => {
        // ponytail: SUBSCRIBED fires before the server finishes registering postgres_changes; 2s grace, raise if flaky.
        if (status === 'SUBSCRIBED') setTimeout(() => post().catch(reject), 2000)
      })
  })
  const post = async () => {
    const r = await A.c.from('announcements').insert({ title: 'check script', body: 'realtime test' }).select().single()
    assert.ifError(r.error); created.ann.push(r.data.id)
  }
  assert.equal((await got).title, 'check script')

  console.log('✓ all staff backend checks passed')
} finally {
  if (created.leave.length) await admin.from('leave_requests').delete().in('id', created.leave)
  if (created.ann.length) await admin.from('announcements').delete().in('id', created.ann)
  await admin.from('employee_attendance').delete().eq('employee_id', A.id).in('day', [new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }), '2020-01-02'])
  await A.c.removeAllChannels(); await B.c.removeAllChannels()
}
