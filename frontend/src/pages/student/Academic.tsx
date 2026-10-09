import { ATTENDANCE, ATT_ATTENDED, ATT_HELD, ATT_OVERALL, PERIOD_TIMES, SUBJECT_NAMES, SYLLABUS, TIMETABLE } from '../../data/mock'
import { fmtDate } from '../../lib/format'
import { useErp } from '../../store/ErpContext'
import { Icon } from '../../components/Icon'
import { BarCell, CardHead, InfoRow, Pill, Tabs, statusTone } from '../../components/ui'

export default function Academic() {
  const { s, set } = useErp()
  return (
    <div className="flex flex-col gap-8">
      <Tabs label="Academic information" active={s.acadTab} onChange={(k) => set({ acadTab: k })}
        tabs={[['attendance', 'Attendance'], ['timetable', 'Class timetable'], ['assignments', 'Assignments'], ['syllabus', 'Syllabus progress']]} />
      {s.acadTab === 'attendance' && <Attendance />}
      {s.acadTab === 'timetable' && <Timetable />}
      {s.acadTab === 'assignments' && <Assignments />}
      {s.acadTab === 'syllabus' && <Syllabus />}
    </div>
  )
}

function Attendance() {
  const rows = ATTENDANCE.map(([name, held, att]) => {
    const pct = Math.round((att * 100) / held)
    return { name, held, att, pct, color: pct < 75 ? '#B3261E' : '#0D2D52' }
  })
  const lows = rows.filter((r) => r.pct < 75).map((r) => r.name)
  const deg = Math.round(ATT_OVERALL * 3.6)
  const cols = 'grid grid-cols-[minmax(0,1fr)_64px_72px_200px]'

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div className="card overflow-hidden">
        <CardHead title="Subject-wise attendance" sub="Updated as soon as your faculty submits attendance" />
        <div className={`th ${cols}`}><div>Subject</div><div>Held</div><div>Attended</div><div>Percentage</div></div>
        {rows.map((r) => (
          <div key={r.name} className={`tr ${cols} items-center`}>
            <div>{r.name}</div>
            <div className="muted">{r.held}</div>
            <div className="muted">{r.att}</div>
            <BarCell pct={r.pct} color={r.color} label={`${r.pct}%`} labelClass="font-medium" />
          </div>
        ))}
      </div>
      <div className="card p-7 flex flex-col gap-6">
        <h2 className="h2">Overall</h2>
        <div className="self-center w-[168px] h-[168px] rounded-[50%] grid place-items-center" style={{ background: `conic-gradient(#0D2D52 0deg ${deg}deg, #EEF1F5 ${deg}deg 360deg)` }}>
          <div className="w-[148px] h-[148px] rounded-[50%] bg-white grid place-items-center text-center">
            <div><div className="serif text-[44px] leading-none">{ATT_OVERALL}%</div><div className="eyebrow mt-1.5">{ATT_HELD} classes</div></div>
          </div>
        </div>
        <div className="flex flex-col border-t border-line-soft">
          <InfoRow k="Attended" v={ATT_ATTENDED} />
          <InfoRow k="Missed" v={ATT_HELD - ATT_ATTENDED} last />
        </div>
        <p className="sub m-0 px-4 py-3.5 rounded-lg bg-page">
          {lows.length ? `Below 75% in ${lows.join(', ')}. Attend upcoming classes to stay eligible for exams.` : 'You are above 75% in every subject.'}
        </p>
      </div>
    </div>
  )
}

function Timetable() {
  const { flash } = useErp()
  const head = 'border-transparent text-subtle font-medium text-[12px]'
  const cells: { t: string; cls: string }[] = [{ t: '', cls: head }, ...PERIOD_TIMES.map((t) => ({ t, cls: head }))]
  Object.entries(TIMETABLE).forEach(([day, slots]) => {
    cells.push({ t: day[0] + day.slice(1).toLowerCase(), cls: 'border-transparent text-ink font-semibold text-[13px]' })
    slots.forEach((c) => cells.push(
      c === 'LUNCH' ? { t: 'Lunch', cls: 'border-transparent text-subtle font-normal text-[12px]' }
        : c.includes('LAB') ? { t: c, cls: 'bg-navy-soft border-navy-soft text-navy font-medium text-[13px]' }
        : { t: c, cls: 'bg-white border-line text-ink font-medium text-[13px]' },
    ))
  })

  return (
    <div className="card p-7">
      <div className="flex justify-between items-center">
        <div><h2 className="h2">Weekly timetable</h2><p className="sub">II B.Tech CSE · Section A</p></div>
        <button type="button" className="btn" onClick={() => flash('Downloading timetable PDF')}><Icon name="download" size={16} />Download PDF</button>
      </div>
      <div className="grid grid-cols-8 gap-1.5 mt-7">
        {cells.map((c, i) => (
          <div key={i} className={`min-h-[52px] p-2 rounded-lg border border-solid grid place-items-center text-center ${c.cls}`}>{c.t}</div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-x-8 gap-y-2.5 mt-7 pt-6 border-t border-line-soft text-[13px]">
        {Object.entries(SUBJECT_NAMES).map(([code, name]) => (
          <div key={code}><span className="font-semibold">{code}</span> <span className="muted">{name}</span></div>
        ))}
      </div>
    </div>
  )
}

function Assignments() {
  const { s, set, flash } = useErp()
  const cols = 'grid grid-cols-[minmax(0,1fr)_130px_120px_120px]'
  const submit = (id: number, title: string) => {
    set((cur) => ({ assignments: cur.assignments.map((x) => (x.id === id ? { ...x, status: 'Submitted' as const } : x)) }))
    flash('Submitted: ' + title)
  }

  return (
    <div className="card overflow-hidden">
      <CardHead title="Assignments" sub="New assignments from your faculty appear here instantly" />
      <div className={`th ${cols}`}><div>Assignment</div><div>Due</div><div>Status</div><div></div></div>
      {s.assignments.map((a) => (
        <div key={a.id} className={`tr ${cols} items-center`}>
          <div><div>{a.title}</div><div className="eyebrow mt-0.5">{a.subject}</div></div>
          <div className="muted">{fmtDate(a.due)}</div>
          <div><Pill tone={statusTone(a.status)}>{a.status}</Pill></div>
          <div className="flex justify-end">
            {a.status === 'Pending' && <button type="button" className="btn btn-p" onClick={() => submit(a.id, a.title)}>Submit</button>}
          </div>
        </div>
      ))}
    </div>
  )
}

function Syllabus() {
  const cols = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]'
  return (
    <div className="card overflow-hidden">
      <CardHead title="Syllabus progress" sub="Five units per subject" />
      <div className={`th ${cols}`}><div>Subject</div><div>Now covering</div><div>Completed</div></div>
      {SYLLABUS.map((y) => (
        <div key={y.name} className={`tr ${cols} items-center`}>
          <div>{y.name}</div>
          <div className="muted">Unit {y.unit} · {y.topic}</div>
          <BarCell pct={y.pct} label={`${y.pct}%`} />
        </div>
      ))}
    </div>
  )
}
