import { ATT_OVERALL, CGPA, FEE_TOTAL, PERIOD_TIMES, SUBJECT_NAMES, TIMETABLE } from '../../data/mock'
import { fmtDate, greeting, inr, todayLong } from '../../lib/format'
import { useErp } from '../../store/ErpContext'
import { Bar, CardHead, Hero, Pill, StatCard } from '../../components/ui'

export default function Dashboard() {
  const { s, set } = useErp()
  const goTimetable = () => set({ sSec: 'academic', acadTab: 'timetable' })

  const dayKey = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()]
  const todayClasses = (TIMETABLE[dayKey] || [])
    .map((code, i) => ({ code, name: SUBJECT_NAMES[code] || code, time: PERIOD_TIMES[i] }))
    .filter((c) => c.code !== 'LUNCH')
  const pending = s.assignments.filter((a) => a.status === 'Pending')
  const nextDue = [...pending].sort((a, b) => (a.due < b.due ? -1 : 1))[0]

  return (
    <div className="flex flex-col gap-10">
      <Hero>
        <div className="eyebrow text-navy-mid">{todayLong()}</div>
        <h2 className="serif mt-2 mb-0 mx-0 text-[46px] leading-[1.1] text-navy">{greeting()}, [Student Name]</h2>
        <p className="mt-2 mb-0 mx-0 text-[15px] text-navy-mid">B.Tech Computer Science &amp; Engineering · II Year, I Semester · Section A</p>
        <div className="flex gap-2.5 mt-6">
          <button type="button" className="btn btn-p" onClick={() => set({ sSec: 'fees' })}>Pay fees</button>
          <button type="button" className="btn" onClick={goTimetable}>View timetable</button>
        </div>
      </Hero>

      <div className="grid grid-cols-4 gap-5">
        <StatCard icon="check" label="Overall attendance" value={`${ATT_OVERALL}%`}>
          <Bar pct={ATT_OVERALL} className="mt-3" />
          <div className="sub mt-2">Minimum 75% required</div>
        </StatCard>
        <StatCard icon="chart" label="CGPA" value={CGPA}><div className="sub">After 2 semesters</div></StatCard>
        <StatCard icon="cardPlain" label="Fee due" value={inr(s.feePaid ? 0 : FEE_TOTAL)}><div className="sub">{s.feePaid ? 'All fees paid' : 'Due by 10 Oct 2026'}</div></StatCard>
        <StatCard icon="clipboard" label="Assignments pending" value={pending.length}><div className="sub">{nextDue ? 'Next due ' + fmtDate(nextDue.due) : 'Nothing due'}</div></StatCard>
      </div>

      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-8 items-start">
        <div className="card overflow-hidden">
          <CardHead title="Notifications" sub="From the college offices and your faculty" />
          <div className="th grid grid-cols-[88px_minmax(0,1fr)]"><div>Date</div><div>Notice</div></div>
          {s.notices.map((n) => (
            <div key={n.id} className="tr grid grid-cols-[88px_minmax(0,1fr)]">
              <div className="muted text-[13px]">{n.date}</div>
              <div>
                <div className="flex gap-2.5 items-start"><span className="grow">{n.msg}</span>{n.isNew && <Pill tone="navy">New</Pill>}</div>
                <div className="eyebrow mt-1">{n.no} · {n.by}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8">
          <div className="card px-7 py-6">
            <div className="flex justify-between items-center"><h2 className="h2">Today’s classes</h2><button type="button" className="linkbtn" onClick={goTimetable}>Timetable</button></div>
            {todayClasses.length === 0 && <p className="sub mt-4">No classes scheduled today.</p>}
            <div className="flex flex-col mt-3">
              {todayClasses.map((c, i) => (
                <div key={i} className="flex gap-4 items-baseline py-3 border-b border-line-soft">
                  <div className="muted w-[104px] shrink-0 text-[13px]">{c.time}</div>
                  <div className="text-[14px]">{c.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card px-7 py-6">
            <div className="flex justify-between items-center"><h2 className="h2">Due soon</h2><button type="button" className="linkbtn" onClick={() => set({ sSec: 'academic', acadTab: 'assignments' })}>All assignments</button></div>
            {pending.length === 0 && <p className="sub mt-4">You’re all caught up.</p>}
            <div className="flex flex-col mt-3">
              {pending.map((a) => (
                <div key={a.id} className="py-3 border-b border-line-soft">
                  <div className="text-[14px]">{a.title}</div>
                  <div className="eyebrow mt-1">{a.subject} · Due {fmtDate(a.due)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
