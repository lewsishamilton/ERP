import { CLASSES, FACULTY_SUBJECTS, PERIODS, ROLLS } from '../../../data/mock'
import { useErp, useField } from '../../../store/ErpContext'
import { Select } from '../../../components/ui'

const toggle = 'min-h-[38px] min-w-20 rounded-md border-0 text-[13px] font-medium'
const raised = 'shadow-[0_1px_2px_rgba(21,23,28,.1)]'

export default function Attendance() {
  const { s, set, flash } = useErp()
  const field = useField()
  const isPresent = (roll: string) => (s.roster[roll] || 'P') === 'P'
  const present = ROLLS.filter(isPresent).length
  const absent = ROLLS.length - present

  const mark = (roll: string, v: 'P' | 'A') => set((cur) => ({ roster: { ...cur.roster, [roll]: v } }))
  const submit = () => {
    set({ attSaved: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) })
    flash(`Attendance saved: ${present} present, ${absent} absent`)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-4 gap-5">
        <Select id="att-class" label="Class" value={s.attClass} onChange={field('attClass')} options={CLASSES} />
        <Select id="att-sub" label="Subject" value={s.attSubject} onChange={field('attSubject')} options={FACULTY_SUBJECTS} />
        <div><label className="lbl" htmlFor="att-date">Date</label><input id="att-date" className="inp" type="date" value={s.attDate} onChange={field('attDate')} /></div>
        <Select id="att-period" label="Period" value={s.attPeriod} onChange={field('attPeriod')} options={PERIODS} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex justify-between items-center px-7 py-6 gap-4 border-b border-line">
          <div><h2 className="h2">{s.attClass} · {s.attSubject}</h2><p className="sub">{present} present · {absent} absent · {ROLLS.length} students</p></div>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={() => set({ roster: {} })}>Mark all present</button>
            <button type="button" className="btn btn-p" onClick={submit}>Submit attendance</button>
          </div>
        </div>
        {s.attSaved && <div className="px-7 py-3 bg-success-soft text-success text-[13px]">Submitted at {s.attSaved}. Students see the update in their Attendance page.</div>}
        <div className="grid grid-cols-2 gap-x-12 px-7 pt-2 pb-4">
          {ROLLS.map((roll, i) => {
            const p = isPresent(roll)
            return (
              <div key={roll} className="flex items-center gap-4 py-2.5 border-b border-line-soft">
                <span className="muted w-6 text-[13px]">{String(i + 1).padStart(2, '0')}</span>
                <span className="grow text-[14px] font-medium">{roll}</span>
                <div className="flex gap-1 p-[3px] bg-fill rounded-lg">
                  <button type="button" aria-pressed={p} onClick={() => mark(roll, 'P')} className={`${toggle} ${p ? `bg-white text-ink ${raised}` : 'bg-transparent text-subtle'}`}>Present</button>
                  <button type="button" aria-pressed={!p} onClick={() => mark(roll, 'A')} className={`${toggle} ${!p ? `bg-danger text-white ${raised}` : 'bg-transparent text-subtle'}`}>Absent</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
