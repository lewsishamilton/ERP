import { EXAMS } from '../../data/mock'
import { useErp } from '../../store/ErpContext'
import { Tabs } from '../../components/ui'

export default function Exams() {
  const { s, set, flash } = useErp()
  const exam = EXAMS[s.examTab]
  const cols = 'grid grid-cols-[120px_56px_170px_minmax(0,1fr)_90px]'

  return (
    <div className="flex flex-col gap-8">
      <Tabs label="Exam type" active={s.examTab} onChange={(k) => set({ examTab: k })}
        tabs={[['mid1', 'Mid-I'], ['mid2', 'Mid-II'], ['sem', 'Semester end']]} />
      <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
        <div className="card overflow-hidden">
          <div className="flex justify-between items-center px-7 pt-6 pb-5">
            <div><h2 className="h2">{exam.title}</h2><p className="sub">II B.Tech I Semester · CSE</p></div>
            <button type="button" className="btn btn-p" onClick={() => flash('Hall ticket download opens 06 Oct 2026')}>Download hall ticket</button>
          </div>
          <div className={`th ${cols}`}><div>Date</div><div>Day</div><div>Time</div><div>Subject</div><div>Code</div></div>
          {exam.rows.map((e) => (
            <div key={e.code} className={`tr ${cols} items-center`}>
              <div className="font-medium">{e.date}</div><div className="muted">{e.day}</div><div className="muted">{e.time}</div><div>{e.sub}</div><div className="muted">{e.code}</div>
            </div>
          ))}
        </div>
        <div className="card p-7">
          <h2 className="h2">Instructions</h2>
          <ol className="mt-4 mb-0 mx-0 pl-[18px] flex flex-col gap-3 text-[14px] leading-[1.55] text-ink-2">
            <li>Report to the exam hall 15 minutes before the start time.</li>
            <li>Carry your hall ticket and college ID card.</li>
            <li>Mobile phones and smart watches are not allowed.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
