// Live data for the staff Admin section. Each hook loads its rows and reloads
// whenever Supabase Realtime reports a change, so every open tab stays in sync.
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { hm, istDay, istTime } from './format'
import type { Announcement, AttendanceDay, LeaveForReview, LeaveRequest, Staff } from '../types'
import type { PunchRow } from './punchImport'

type Result<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

// ponytail: refetches the whole (small) list on any change; patch rows in place if lists grow large.
function useLive<T>(table: string, load: () => Result<T>, key = '') {
  const [rows, setRows] = useState<T[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const refresh = () => load().then(({ data, error }) => {
      if (!alive) return
      if (error) setError(error.message)
      else { setError(''); setRows(data ?? []) }
    })
    refresh()
    const channel = supabase
      .channel(`${table}:${key}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
      .subscribe()
    return () => { alive = false; supabase.removeChannel(channel) }
  }, [table, key])

  return { rows, error, loading: rows === null && !error }
}

// ---------- Announcements ----------
export const useAnnouncements = (limit = 100) =>
  useLive<Announcement>('announcements', () =>
    supabase.from('announcements').select('*, employees(name, designations(title))').order('created_at', { ascending: false }).limit(limit) as unknown as Result<Announcement>,
  String(limit))

export const postAnnouncement = (title: string, body: string) => supabase.from('announcements').insert({ title: title.trim(), body: body.trim() })
export const deleteAnnouncement = (id: number) => supabase.from('announcements').delete().eq('id', id)

// ---------- Attendance (RLS returns only the signed-in staff member's rows) ----------
export const monthStart = () => istDay().slice(0, 8) + '01'

export const useMyAttendance = () =>
  useLive<AttendanceDay>('employee_attendance', () =>
    supabase.from('employee_attendance').select('*').gte('day', monthStart()).order('day') as unknown as Result<AttendanceDay>,
  monthStart())

/** Punch in (first call of the day) or punch out (later calls). The server sets the time. */
export const punch = () => supabase.rpc('punch')

export const LATE_AFTER = '09:20'

/** Month summary from the signed-in staff member's attendance rows. */
export function attendanceStats(rows: AttendanceDay[], today = istDay()) {
  const done = rows.filter((r) => r.punch_out)
  const minutes = done.reduce((t, r) => t + (Date.parse(r.punch_out!) - Date.parse(r.punch_in)) / 6e4, 0)
  return {
    today: rows.find((r) => r.day === today),
    daysRecorded: rows.length,
    onCampus: hm(minutes),
    lateCount: rows.filter((r) => istTime(r.punch_in) > LATE_AFTER).length,
  }
}

// ---------- Leave ----------
export const useMyLeaves = () =>
  useLive<LeaveRequest>('leave_requests', () =>
    supabase.from('leave_requests').select('*').order('created_at', { ascending: false }) as unknown as Result<LeaveRequest>)

export const applyLeave = (l: { type: string; from_date: string; to_date: string; reason: string }) =>
  supabase.from('leave_requests').insert({ ...l, reason: l.reason.trim() }) // status is set by the server (HOD or Dean first)
export const cancelLeave = (id: number) => supabase.from('leave_requests').update({ status: 'Cancelled' }).eq('id', id)

export const LEAVE_QUOTA: Record<string, number> = { 'Casual leave': 12, 'Medical leave': 10 }

export const leaveDays = (l: Pick<LeaveRequest, 'from_date' | 'to_date'>) =>
  Math.round((Date.parse(l.to_date) - Date.parse(l.from_date)) / 864e5) + 1

/** Days of `type` used this year (approved or still in review). */
export const leaveUsed = (leaves: LeaveRequest[], type: string, year = istDay().slice(0, 4)) =>
  leaves.filter((l) => l.type === type && l.from_date.startsWith(year) && (l.status === 'Approved' || l.status === 'Pending' || l.status === 'HOD approved'))
    .reduce((t, l) => t + leaveDays(l), 0)

/** Where a request is in the HOD → Dean flow, in words for the applicant. */
export const leaveStage = (s: LeaveRequest['status']) =>
  ({ Pending: 'Waiting for HOD', 'HOD approved': 'Approved by HOD · waiting for Dean', Approved: 'Approved by Dean', Declined: 'Rejected', Cancelled: 'Cancelled by you' })[s]

// ---------- HOD / Dean: leave approvals (RLS limits rows to the caller's team) ----------
export const useLeavesForReview = () =>
  useLive<LeaveForReview>('leave_requests', () =>
    supabase.from('leave_requests')
      .select('*, employee:employees!leave_requests_employee_id_fkey(emp_id, name, departments(name), designations(title))')
      .order('created_at', { ascending: false }) as unknown as Result<LeaveForReview>, 'review')

/** HOD: Pending → HOD approved / Declined. Dean: HOD approved → Approved / Declined. */
export const decideLeave = (id: number, approve: boolean, note?: string) =>
  supabase.rpc('decide_leave', { leave_id: id, approve, note: note ?? null })

// ---------- Directory (all employees, for Dean / HOD) ----------
export const useDirectory = () =>
  useLive<Staff>('employees', () => supabase.from('employee_profiles').select('*').order('emp_id') as unknown as Result<Staff>)

// ---------- Manager: biometric import ----------
export const importAttendance = (rows: PunchRow[]) => supabase.rpc('import_attendance', { rows })

export const useRecentPunches = () =>
  useLive<AttendanceDay & { employees: { emp_id: string; name: string } | null }>('employee_attendance', () =>
    supabase.from('employee_attendance').select('*, employees(emp_id, name)').order('day', { ascending: false }).order('punch_in', { ascending: false }).limit(50) as unknown as Result<AttendanceDay & { employees: { emp_id: string; name: string } | null }>, 'recent')
