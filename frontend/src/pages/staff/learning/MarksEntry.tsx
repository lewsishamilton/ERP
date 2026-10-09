import { ASSESSMENTS, CLASSES, FACULTY_SUBJECTS, ROLLS } from '../../../data/mock'
import { useErp, useField } from '../../../store/ErpContext'
import { Pill, Select } from '../../../components/ui'

/** Keeps only digits, max two, capped at 30. */
export const cleanMark = (raw: string) => {
  const v = raw.replace(/\D/g, '').slice(0, 2)
  return v !== '' && +v > 30 ? '30' : v
}

export default function MarksEntry() {
  const { s, set, flash } = useErp()
  const field = useField()
  const entered = ROLLS.filter((r) => s.marks[r]).length

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-5">
        <Select id="m-class" label="Class" value={s.mClass} onChange={field('mClass')} options={CLASSES} />
        <Select id="m-exam" label="Assessment" value={s.mExam} onChange={field('mExam')} options={ASSESSMENTS} />
        <Select id="m-sub" label="Subject" options={FACULTY_SUBJECTS} />
      </div>
      <div className="card overflow-hidden">
        <div className="flex justify-between items-center px-7 py-6 border-b border-line">
          <div><h2 className="h2">{s.mClass} · {s.mExam}, out of 30</h2><p className="sub">{entered} of {ROLLS.length} entered</p></div>
          <button type="button" className="btn btn-p" onClick={() => flash(`${s.mExam} marks saved for ${entered} students`)}>Save marks</button>
        </div>
        <div className="grid grid-cols-2 gap-x-12 px-7 pt-2 pb-4">
          {ROLLS.map((roll, i) => {
            const v = s.marks[roll] || ''
            return (
              <div key={roll} className="flex items-center gap-4 py-2 border-b border-line-soft">
                <span className="muted w-6 text-[13px]">{String(i + 1).padStart(2, '0')}</span>
                <label htmlFor={'mk-' + roll} className="grow text-[14px] font-medium">{roll}</label>
                <input id={'mk-' + roll} className="inp w-20 text-center" inputMode="numeric" placeholder="–" value={v}
                  onChange={(e) => set((cur) => ({ marks: { ...cur.marks, [roll]: cleanMark(e.target.value) } }))} />
                <Pill tone={v ? 'success' : 'neutral'} className="w-[72px] justify-center">{v ? 'Entered' : 'Pending'}</Pill>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
