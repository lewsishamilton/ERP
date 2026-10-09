// Shared by seed-staff.mjs and check.mjs.

// Staff sign in with Emp ID; Supabase auth needs an email, so each ID maps to a
// private login address. Must match LOGIN_DOMAIN in frontend/src/lib/supabase.ts.
export const LOGIN_DOMAIN = 'staff.aims.local'

/** CSV → [{ Emp_ID, Emp_Name, ... }]. Skips the "Column1,..." line and blank rows. */
export function parseEmployees(text) {
  const lines = text.split(/\r?\n/).map((l) => l.split(',').map((c) => c.trim()))
  const h = lines.findIndex((c) => c[0] === 'Emp_ID')
  if (h < 0) throw new Error('No Emp_ID header row found')
  return lines.slice(h + 1).filter((c) => c[0]).map((c) => Object.fromEntries(lines[h].map((k, i) => [k, c[i] ?? ''])))
}
