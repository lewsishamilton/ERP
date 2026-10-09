import { CGPA, INTERNAL_MARKS, SEM_RESULTS } from '../../data/mock'
import { useErp } from '../../store/ErpContext'
import { BarCell, CardHead, Pill, Tabs } from '../../components/ui'

export default function Marks() {
  const { s, set, flash } = useErp()
  const intCols = 'grid grid-cols-[minmax(0,1fr)_110px_130px_110px_110px]'
  const semCols = 'grid grid-cols-[minmax(0,1fr)_100px_100px_220px]'

  return (
    <div className="flex flex-col gap-8">
      <Tabs label="Marks" active={s.marksTab} onChange={(k) => set({ marksTab: k })} tabs={[['internal', 'Internal marks'], ['sem', 'Semester results']]} />

      {s.marksTab === 'internal' && (
        <div className="card overflow-hidden">
          <CardHead title="Internal assessment" sub="II B.Tech I Semester · Mid-II marks appear after evaluation" />
          <div className={`th ${intCols}`}><div>Subject</div><div>Mid-I / 30</div><div>Assignment / 5</div><div>Mid-II / 30</div><div>Total / 35</div></div>
          {INTERNAL_MARKS.map((m) => (
            <div key={m.sub} className={`tr ${intCols} items-center`}>
              <div>{m.sub}</div><div>{m.mid1}</div><div>{m.asg}</div><div className="muted">{m.mid2}</div><div className="font-semibold">{m.total}</div>
            </div>
          ))}
        </div>
      )}

      {s.marksTab === 'sem' && (
        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
          <div className="card overflow-hidden">
            <CardHead title="Semester results" />
            <div className={`th ${semCols}`}><div>Semester</div><div>Credits</div><div>Result</div><div>SGPA</div></div>
            {SEM_RESULTS.map((r) => (
              <div key={r.sem} className={`tr ${semCols} items-center`}>
                <div><div>{r.sem}</div><div className="eyebrow mt-0.5">Published {r.pub}</div></div>
                <div className="muted">{r.credits}</div>
                <div><Pill tone="success">{r.result}</Pill></div>
                <BarCell pct={r.width} label={r.sgpa} labelClass="font-medium" />
              </div>
            ))}
          </div>
          <div className="card p-7">
            <div className="eyebrow">Cumulative GPA</div>
            <div className="serif text-[64px] leading-none mt-3">{CGPA}</div>
            <p className="sub mt-3">40 of 40 credits earned · no backlogs</p>
            <button type="button" className="btn mt-5 w-full" onClick={() => flash('Downloading consolidated marks memo')}>Download marks memo</button>
          </div>
        </div>
      )}
    </div>
  )
}
