import { CLASSES, CLASS_SIZE, FACULTY_SUBJECTS } from '../../../data/mock'
import { fmtDate } from '../../../lib/format'
import { useErp, useField } from '../../../store/ErpContext'
import { BarCell, CardHead, Select } from '../../../components/ui'

export default function Assignments() {
  const { s, set, flash } = useErp()
  const field = useField()
  const cols = 'grid grid-cols-[minmax(0,1fr)_110px_220px]'

  const publish = () => {
    if (!s.aTitle.trim()) return flash('Give the assignment a title')
    set((cur) => ({ assignments: [{ id: Date.now(), title: cur.aTitle.trim(), subject: cur.aSubject, cls: cur.aClass, due: cur.aDue, status: 'Pending' as const, base: 0 }, ...cur.assignments], aTitle: '' }))
    flash(`Published to ${s.aClass}. Students see it under Assignments.`)
  }

  return (
    <div className="grid grid-cols-[380px_minmax(0,1fr)] gap-8 items-start">
      <div className="card p-7 flex flex-col gap-5">
        <div><h2 className="h2">New assignment</h2><p className="sub">Published instantly to the student portal</p></div>
        <div><label className="lbl" htmlFor="a-title">Title</label><input id="a-title" className="inp" value={s.aTitle} onChange={field('aTitle')} placeholder="e.g. Binary search tree operations" /></div>
        <Select id="a-sub" label="Subject" value={s.aSubject} onChange={field('aSubject')} options={FACULTY_SUBJECTS} />
        <div className="grid grid-cols-2 gap-3">
          <Select id="a-class" label="Class" value={s.aClass} onChange={field('aClass')} options={CLASSES} />
          <div><label className="lbl" htmlFor="a-due">Due date</label><input id="a-due" className="inp" type="date" value={s.aDue} onChange={field('aDue')} /></div>
        </div>
        <button type="button" className="btn btn-p" onClick={publish}>Publish assignment</button>
      </div>
      <div className="card overflow-hidden">
        <CardHead title="Published assignments" />
        <div className={`th ${cols}`}><div>Assignment</div><div>Due</div><div>Submissions</div></div>
        {s.assignments.map((a) => {
          const n = a.base + (a.status === 'Submitted' ? 1 : 0)
          return (
            <div key={a.id} className={`tr ${cols} items-center`}>
              <div><div>{a.title}</div><div className="eyebrow mt-0.5">{a.cls} · {a.subject}</div></div>
              <div className="muted">{fmtDate(a.due)}</div>
              <BarCell pct={Math.round((n * 100) / CLASS_SIZE)} label={`${n} / ${CLASS_SIZE}`} labelClass="text-[13px] w-[52px]!" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
