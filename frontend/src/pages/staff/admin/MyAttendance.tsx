import { attendanceStats, LATE_AFTER, useMyAttendance } from '../../../lib/staffApi'
import { istDay, istTime } from '../../../lib/format'
import { CardHead } from '../../../components/ui'
import PunchButton from './PunchButton'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MyAttendance() {
  const { rows, error } = useMyAttendance()
  const stats = attendanceStats(rows ?? [])
  const today = stats.today
  const byDay = new Map((rows ?? []).map((r) => [r.day, r]))

  // Month grid, Monday first, in IST.
  const todayStr = istDay()
  const [y, m] = todayStr.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
  const monthName = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${todayStr.slice(0, 8)}${String(i + 1).padStart(2, '0')}`)]

  return (
    <div className="flex flex-col gap-8">
      {error && <div className="card p-7 text-[14px] text-danger">{error}</div>}
      <div className="grid grid-cols-3 gap-5">
        <div className="card stat">
          <div className="eyebrow">Today</div>
          <div className="num">{today ? istTime(today.punch_in) : '—'}</div>
          <div className="sub">{!today ? 'Not punched in yet' : today.punch_out ? `Punched out at ${istTime(today.punch_out)}` : 'In, not punched out yet'}</div>
          <PunchButton today={today} className="mt-4" />
        </div>
        <div className="card stat">
          <div className="eyebrow">{monthName} on campus</div>
          <div className="num">{stats.onCampus}</div>
          <div className="sub">{stats.daysRecorded} days recorded · completed days only</div>
        </div>
        <div className="card stat">
          <div className="eyebrow">Late arrivals</div>
          <div className="num">{stats.lateCount} <span className="muted text-[14px]">days</span></div>
          <div className="sub">Punch in after {LATE_AFTER}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <CardHead title={monthName} sub="Your punch in and punch out times, recorded by the server" />
        <div className="grid grid-cols-7 gap-1.5 px-7 pb-7">
          {WEEKDAYS.map((d) => <div key={d} className="eyebrow text-center py-2">{d}</div>)}
          {cells.map((day, i) => {
            if (!day) return <div key={'x' + i} />
            const r = byDay.get(day)
            const isToday = day === todayStr
            const late = r && istTime(r.punch_in) > LATE_AFTER
            return (
              <div key={day} className={`min-h-[76px] p-2.5 rounded-lg border border-solid ${isToday ? 'border-navy' : 'border-line'} ${r ? 'bg-white' : 'bg-page'}`}>
                <div className={`text-[13px] font-semibold ${day > todayStr ? 'text-subtle' : 'text-ink'}`}>{day.slice(8)}</div>
                {r && (
                  <div className="mt-1.5 text-[12px] leading-[1.5]">
                    <div className={late ? 'text-danger' : 'text-success'}>In {istTime(r.punch_in)}</div>
                    <div className="text-muted">{r.punch_out ? `Out ${istTime(r.punch_out)}` : 'Not out'}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
