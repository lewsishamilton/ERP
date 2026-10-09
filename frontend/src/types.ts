// Shared data shapes. These are what the backend API should return later.

export type Screen = 'loading' | 'login' | 'staff' | 'student'
export type StaffMode = 'learning' | 'admin'

export type StudentSection = 'home' | 'basic' | 'academic' | 'exams' | 'fees' | 'marks' | 'downloads' | 'ask' | 'contact'
export type LearningSection = 'home' | 'attendance' | 'marks' | 'assignments' | 'notices' | 'queries'
export type AdminSection = 'home' | 'announcements' | 'attendance' | 'leave' | 'profile' | 'approvals' | 'people' | 'upload'
export type Role = 'staff' | 'hod' | 'dean' | 'manager'

export interface Notice { id: number; date: string; no: string; msg: string; by: string; isNew?: boolean }
export interface Assignment { id: number; title: string; subject: string; cls: string; due: string; status: 'Pending' | 'Submitted'; base: number }
export interface Query { id: number; to: string; subject: string; msg: string; date: string; reply: string; seen?: boolean }
export interface Receipt { no: string; date: string; desc: string; amt: string }

// ---------- Supabase rows (see backend/supabase/schema.sql) ----------
/** Row of the employee_profiles view (employees joined with their lookups). */
export interface Staff { id: string; emp_id: string; name: string; email: string | null; phone: string | null; designation: string | null; department: string | null; hod: string | null; dean: string | null; role: Role; created_at: string; hod_id: number | null; leader_id: number | null }
export interface Announcement { id: number; title: string; body: string; author_id: string; created_at: string; employees: { name: string; designations: { title: string } | null } | null }
export interface AttendanceDay { employee_id: string; day: string; punch_in: string; punch_out: string | null }
export interface LeaveRequest { id: number; type: string; from_date: string; to_date: string; reason: string; status: LeaveStatus; remark: string | null; hod_at: string | null; dean_at: string | null; created_at: string }
export type LeaveStatus = 'Pending' | 'HOD approved' | 'Approved' | 'Declined' | 'Cancelled'
/** Leave request with the applicant, as seen by their HOD / Dean. */
export interface LeaveForReview extends LeaveRequest { employee: { emp_id: string; name: string; departments: { name: string } | null; designations: { title: string } | null } | null }
