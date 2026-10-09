// Staff portal. The sidebar switch picks a section:
//   Learning: manage students (attendance, marks, assignments…). Still on demo data.
//   Admin:    own records, live from Supabase, plus role pages:
//             HOD → Leave Approvals, My Team · Dean → Leave Approvals, Employees · Manager → Attendance Upload
import type { ComponentType } from 'react'
import { PortalLayout, type NavItem } from '../../components/PortalLayout'
import { Icon } from '../../components/Icon'
import { useErp } from '../../store/ErpContext'
import type { AdminSection, LearningSection, Role, StaffMode } from '../../types'
import { useLeavesForReview } from '../../lib/staffApi'
import LearningDashboard from './learning/Dashboard'
import Attendance from './learning/Attendance'
import MarksEntry from './learning/MarksEntry'
import Assignments from './learning/Assignments'
import Notices from './learning/Notices'
import Queries from './learning/Queries'
import AdminDashboard from './admin/Dashboard'
import Announcements from './admin/Announcements'
import MyAttendance from './admin/MyAttendance'
import MyLeave from './admin/MyLeave'
import Profile from './admin/Profile'
import LeaveApprovals from './admin/LeaveApprovals'
import People from './admin/People'
import AttendanceUpload from './admin/AttendanceUpload'

type Page = { title: string; Page: ComponentType }

const LEARNING: Record<LearningSection, Page> = {
  home: { title: 'Dashboard', Page: LearningDashboard },
  attendance: { title: 'Attendance', Page: Attendance },
  marks: { title: 'Marks Entry', Page: MarksEntry },
  assignments: { title: 'Assignments', Page: Assignments },
  notices: { title: 'Notice Board', Page: Notices },
  queries: { title: 'Student Queries', Page: Queries },
}

const ADMIN: Record<AdminSection, Page> = {
  home: { title: 'Dashboard', Page: AdminDashboard },
  announcements: { title: 'Announcements', Page: Announcements },
  attendance: { title: 'My Attendance', Page: MyAttendance },
  leave: { title: 'My Leave', Page: MyLeave },
  profile: { title: 'My Profile', Page: Profile },
  approvals: { title: 'Leave Approvals', Page: LeaveApprovals },
  people: { title: 'Employees', Page: People },
  upload: { title: 'Attendance Upload', Page: AttendanceUpload },
}

const PORTAL: Record<Role, string> = { staff: 'Staff portal', hod: 'HOD portal', dean: 'Dean portal', manager: 'Manager portal' }
const TEACHES: Role[] = ['staff', 'hod']

/** Badge count of leave requests waiting for this HOD / Dean (live). */
function useWaitingApprovals(role: Role, myEmpId: string) {
  const waitingFor = role === 'hod' ? 'Pending' : role === 'dean' ? 'HOD approved' : null
  const { rows } = useLeavesForReview()
  return waitingFor ? (rows ?? []).filter((l) => l.status === waitingFor && l.employee?.emp_id !== myEmpId).length : 0
}

function ModeSwitch() {
  const { s, set } = useErp()
  const modes: [StaffMode, string, 'book' | 'settings'][] = [['learning', 'Learning', 'book'], ['admin', 'Admin', 'settings']]
  return (
    <div role="group" aria-label="Staff section" className="grid grid-cols-2 gap-1 p-1 mb-4 bg-fill rounded-[10px]">
      {modes.map(([m, label, icon]) => (
        <button key={m} type="button" aria-pressed={s.mode === m} onClick={() => set({ mode: m })}
          className={`seg flex items-center justify-center gap-2 ${s.mode === m ? 'bg-navy text-white shadow-[0_1px_2px_rgba(21,23,28,.12)]' : 'bg-transparent text-muted'}`}>
          <Icon name={icon} size={16} />{label}
        </button>
      ))}
    </div>
  )
}

export default function StaffPortal() {
  const { s, set } = useErp()
  const me = s.staff!
  const pendingQ = s.queries.filter((q) => !q.reply).length
  const goAnnouncements = () => set({ mode: 'admin', aSec: 'announcements' })
  const waiting = useWaitingApprovals(me.role, me.emp_id)
  const teaches = TEACHES.includes(me.role)

  const layout = {
    portalLabel: PORTAL[me.role],
    top: teaches ? <ModeSwitch /> : undefined,
    userName: me.name,
    userMeta: `${me.emp_id.toUpperCase()} · ${me.designation ?? 'Staff'}`,
    headerMeta: 'Academic Year 2026–27',
  }

  if (s.mode === 'learning' && teaches) {
    const nav: NavItem<LearningSection>[] = [
      { key: 'home', label: 'Dashboard', icon: 'home' },
      { key: 'attendance', label: 'Attendance', icon: 'clipboardCheck' },
      { key: 'marks', label: 'Marks Entry', icon: 'pen' },
      { key: 'assignments', label: 'Assignments', icon: 'book' },
      { key: 'notices', label: 'Notice Board', icon: 'megaphone' },
      { key: 'queries', label: 'Student Queries', icon: 'message', badge: pendingQ },
    ]
    const { title, Page } = LEARNING[s.tSec]
    return (
      <PortalLayout key="learning" {...layout} nav={nav} active={s.tSec} onNavigate={(k) => set({ tSec: k })} title={title}
        bellLabel="Student queries" bellDot={pendingQ > 0} onBell={() => set({ tSec: 'queries' })}>
        <Page />
      </PortalLayout>
    )
  }

  const nav: NavItem<AdminSection>[] = [
    { key: 'home', label: 'Dashboard', icon: 'home' },
    { key: 'announcements', label: 'Announcements', icon: 'megaphone' },
    { key: 'attendance', label: 'My Attendance', icon: 'clock' },
    { key: 'leave', label: 'My Leave', icon: 'calendar' },
    { key: 'profile', label: 'My Profile', icon: 'user' },
  ]
  if (me.role === 'hod' || me.role === 'dean') nav.splice(1, 0, { key: 'approvals', label: 'Leave Approvals', icon: 'clipboardCheck', badge: waiting })
  if (me.role === 'hod') nav.splice(2, 0, { key: 'people', label: 'My Team', icon: 'user' })
  if (me.role === 'dean') nav.splice(2, 0, { key: 'people', label: 'Employees', icon: 'user' })
  if (me.role === 'manager') nav.splice(1, 0, { key: 'upload', label: 'Attendance Upload', icon: 'download' })
  // A section from another role (e.g. after re-login as someone else) falls back to the dashboard.
  const section = nav.some((n) => n.key === s.aSec) ? s.aSec : 'home'
  const { title, Page } = ADMIN[section]
  return (
    <PortalLayout key="admin" {...layout} nav={nav} active={section} onNavigate={(k) => set({ aSec: k })} title={section === 'people' && me.role === 'hod' ? 'My Team' : title}
      bellLabel={waiting ? 'Leave approvals waiting' : 'Announcements'} bellDot={waiting > 0} onBell={waiting ? () => set({ aSec: 'approvals' }) : goAnnouncements}>
      <Page />
    </PortalLayout>
  )
}
