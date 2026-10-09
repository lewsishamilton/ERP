import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env.local')

// Publishable key only: every table is protected by RLS (backend/supabase/schema.sql).
export const supabase = createClient(url, key)

// Staff sign in with their Emp ID. Must match LOGIN_DOMAIN in backend/scripts/seed-staff.mjs.
const LOGIN_DOMAIN = 'staff.aims.local'
export const loginEmail = (empId: string) => `${empId.trim().toLowerCase()}@${LOGIN_DOMAIN}`
