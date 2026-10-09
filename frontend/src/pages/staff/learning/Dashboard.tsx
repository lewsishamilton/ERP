import { FACULTY_TODAY, LESSON_PLAN } from '../../../data/mock'
import { greeting, todayLong, todayShort } from '../../../lib/format'
import { useErp } from '../../../store/ErpContext'
import { Bar, CardHead, Hero, Pill, StatCard, statusTone, type Tone } from '../../../components/ui'

const CLASS_STATE: Record<string, { label: string; tone: Tone; text: string }> = {
  done: { label: 'Done', tone: 'neutral', text: 'text-subtle' },
  now: { label: 'In progress', tone: 'navy', text: 'text-ink' },
  next: { label: 'Upcoming', tone: 'white', text: 'text-ink' },
}

export default function Dashboard() {
  const { s, set } = useErp()
  const pendingQ = s.queries.filter((q) => !q.reply).length
  const submissions = s.assignments.reduce((t, a) => t + a.base + (a.status === 'Submitted' ? 1 : 0), 0)
  const cols = 'grid grid-cols-[150px_120px_minmax(0,1fr)_120px_120px]'

  return (
    <div className="flex flex-col gap-10">
      <Hero>
        <div className="eyebrow text-navy-mid">{todayLong()}</div>
        <h2 className="serif mt-2 mb-0 mx-0 text-[46px] leading-[1.1] text-navy">{greeting()}, {s.staff?.name}</h2>
        <p className="mt-2 mb-0 mx-0 text-[15px] text-navy-mid">Computer Science &amp; Engineering · II CSE-A, II CSE-B, III CSE-A</p>
        <div className="flex gap-2.5 mt-6">
          <button type="button" className="btn btn-p" onClick={() => set({ tSec: 'attendance' })}>Take attendance</button>
          <button type="button" className="btn" onClick={() => set({ tSec: 'notices' })}>Post notice</button>
        </div>
        <div className="inline-flex gap-2.5 items-center mt-5 py-2 pl-2 pr-3.5 rounded-[999px] bg-white text-[13px] text-ink-2">
          <Pill tone="solid">Today</Pill>Department staff meeting at 4:00 PM, CSE conference room
        </div>
      </Hero>

      <div className="grid grid-cols-4 gap-5">
        <StatCard icon="clock" label="Classes today" value={5}><div className="sub">2 done · 1 in progress</div></StatCard>
        <StatCard icon="message" label="Pending queries" value={pendingQ}><div className="sub">From your students</div></StatCard>
        <StatCard icon="clipboard" label="Submissions" value={submissions}><div className="sub">Across {s.assignments.length} assignments</div></StatCard>
        <StatCard icon="book" label="Syllabus covered" value="63%">
          <Bar pct={63} className="mt-3" />
          <div className="sub mt-2">Average across classes</div>
        </StatCard>
      </div>

      <div className="card overflow-hidden">
        <CardHead title="Today’s classes" sub={todayShort()} />
        <div className={`th ${cols}`}><div>Time</div><div>Class</div><div>Subject</div><div>Room</div><div>Status</div></div>
        {FACULTY_TODAY.map((c) => {
          const st = CLASS_STATE[c.state]
          return (
            <div key={c.time} className={`tr ${cols} items-center ${st.text}`}>
              <div>{c.time}</div><div className="font-medium">{c.cls}</div><div>{c.subject}</div><div>{c.room}</div>
              <div><Pill tone={st.tone}>{st.label}</Pill></div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-8 items-start">
        <div className="card px-7 py-6">
          <div className="flex justify-between items-center"><h2 className="h2">Notice board</h2><button type="button" className="linkbtn" onClick={() => set({ tSec: 'notices' })}>View all</button></div>
          <div className="flex flex-col mt-2">
            {s.notices.slice(0, 4).map((n) => (
              <div key={n.id} className="py-3.5 border-b border-line-soft"><div className="text-[14px] leading-[1.55]">{n.msg}</div><div className="eyebrow mt-1">{n.date} · {n.by}</div></div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="card px-7 py-6">
            <div className="flex justify-between items-center"><h2 className="h2">Recent student queries</h2><button type="button" className="linkbtn" onClick={() => set({ tSec: 'queries' })}>Open inbox</button></div>
            <div className="flex flex-col mt-2">
              {s.queries.slice(0, 3).map((q) => {
                const status = q.reply ? 'Answered' : 'Awaiting reply'
                return (
                  <div key={q.id} className="flex gap-4 py-3.5 border-b border-line-soft items-center">
                    <div className="grow"><div className="text-[14px]">{q.subject}</div><div className="eyebrow mt-1">{q.to} · {q.date}</div></div>
                    <Pill tone={statusTone(status)}>{status}</Pill>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="card px-7 py-6">
            <h2 className="h2">Lesson plan progress</h2>
            <div className="flex flex-col gap-[18px] mt-5">
              {LESSON_PLAN.map((l) => (
                <div key={l.cls + l.sub}>
                  <div className="flex justify-between text-[14px]"><span>{`${l.cls} · ${l.sub}`}</span><span className="muted">{l.pct}%</span></div>
                  <Bar pct={l.pct} className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
