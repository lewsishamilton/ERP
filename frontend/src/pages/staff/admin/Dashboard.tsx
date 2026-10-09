import { attendanceStats, LEAVE_QUOTA, leaveUsed, useAnnouncements, useMyAttendance, useMyLeaves } from '../../../lib/staffApi'
import { greeting, istDateTime, istTime, todayLong } from '../../../lib/format'
import { useErp } from '../../../store/ErpContext'
import { Hero, InfoRow, StatCard } from '../../../components/ui'
import PunchButton from './PunchButton'

export default function Dashboard() {
  const { s, set } = useErp()
  const me = s.staff!
  const att = useMyAttendance()
  const leaves = useMyLeaves()
  const news = useAnnouncements(4)
  const stats = attendanceStats(att.rows ?? [])
  const today = stats.today
  const pending = (leaves.rows ?? []).filter((l) => l.status === 'Pending' || l.status === 'HOD approved').length
  const casualLeft = LEAVE_QUOTA['Casual leave'] - leaveUsed(leaves.rows ?? [], 'Casual leave')

  return (
    <div className="flex flex-col gap-10">
      <Hero>
        <div className="eyebrow text-navy-mid">{todayLong()}</div>
        <h2 className="serif mt-2 mb-0 mx-0 text-[46px] leading-[1.1] text-navy">{greeting()}, {me.name}</h2>
        <p className="mt-2 mb-0 mx-0 text-[15px] text-navy-mid">{me.designation} · {me.department}</p>
        <div className="flex gap-2.5 mt-6">
          <PunchButton today={today} />
          <button type="button" className="btn" onClick={() => set({ aSec: 'leave' })}>Apply leave</button>
        </div>
      </Hero>

      <div className="grid grid-cols-4 gap-5">
        <StatCard icon="clock" label="Today" value={today ? istTime(today.punch_in) : '—'}>
          <div className="sub">{!today ? 'Not punched in yet' : today.punch_out ? `Out at ${istTime(today.punch_out)}` : 'In, not punched out yet'}</div>
        </StatCard>
        <StatCard icon="chart" label="This month on campus" value={stats.onCampus}><div className="sub">{stats.daysRecorded} days recorded · {stats.lateCount} late</div></StatCard>
        <StatCard icon="calendar" label="Casual leave left" value={casualLeft}><div className="sub">of {LEAVE_QUOTA['Casual leave']} days this year</div></StatCard>
        <StatCard icon="clipboard" label="Leave requests pending" value={pending}><div className="sub">Waiting for HOD / Dean</div></StatCard>
      </div>

      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-8 items-start">
        <div className="card px-7 py-6">
          <div className="flex justify-between items-center"><h2 className="h2">Latest announcements</h2><button type="button" className="linkbtn" onClick={() => set({ aSec: 'announcements' })}>View all</button></div>
          <div className="flex flex-col mt-2">
            {news.error && <p className="sub mt-4 text-danger">{news.error}</p>}
            {news.rows?.length === 0 && <p className="sub mt-4">No announcements yet.</p>}
            {news.rows?.map((n) => (
              <div key={n.id} className="py-3.5 border-b border-line-soft">
                <div className="text-[14px] font-medium">{n.title}</div>
                <div className="text-[14px] leading-[1.55] mt-1 text-ink-2 line-clamp-2">{n.body}</div>
                <div className="eyebrow mt-1">{istDateTime(n.created_at)} · {n.employees?.name ?? 'Staff'}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card px-7 py-6">
          <div className="flex justify-between items-center"><h2 className="h2">My details</h2><button type="button" className="linkbtn" onClick={() => set({ aSec: 'profile' })}>Profile</button></div>
          <div className="flex flex-col mt-2">
            <InfoRow k="Employee ID" v={me.emp_id.toUpperCase()} />
            <InfoRow k="Department" v={me.department} />
            <InfoRow k="HOD" v={me.hod} />
            <InfoRow k="Dean" v={me.dean} last />
          </div>
        </div>
      </div>
    </div>
  )
}
