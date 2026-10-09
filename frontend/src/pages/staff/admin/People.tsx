import { useState } from 'react'
import { useDirectory } from '../../../lib/staffApi'
import { useErp } from '../../../store/ErpContext'
import { CardHead, Pill, StatCard } from '../../../components/ui'

const ROLE_LABEL = { staff: 'Staff', hod: 'HOD', dean: 'Dean', manager: 'Manager' }

/** Dean: every employee, grouped by HOD. HOD: their own team. */
export default function People() {
  const { s } = useErp()
  const me = s.staff!
  const { rows, error, loading } = useDirectory()
  const [q, setQ] = useState('')
  const [hod, setHod] = useState('')

  const all = rows ?? []
  const scope = me.role === 'hod' ? all.filter((e) => e.hod_id === me.leader_id) : all
  const hods = all.filter((e) => e.role === 'hod')
  const teamSize = (leaderId: number | null) => all.filter((e) => e.hod_id === leaderId).length
  const needle = q.trim().toLowerCase()
  const shown = scope.filter((e) =>
    (!hod || e.hod === hod) &&
    (!needle || [e.emp_id, e.name, e.department, e.designation].some((v) => v?.toLowerCase().includes(needle))))
  const cols = 'grid grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_100px_90px]'

  return (
    <div className="flex flex-col gap-8">
      {me.role === 'dean' && (<>
        <div className="grid grid-cols-4 gap-5">
          <StatCard icon="user" label="Employees" value={all.filter((e) => e.role === 'staff').length}><div className="sub">Staff and faculty</div></StatCard>
          <StatCard icon="clipboard" label="HODs" value={hods.length}><div className="sub">Approve leave first</div></StatCard>
          <StatCard icon="book" label="Departments" value={new Set(all.map((e) => e.department).filter(Boolean)).size}><div className="sub">With at least one employee</div></StatCard>
          <StatCard icon="settings" label="Managers" value={all.filter((e) => e.role === 'manager').length}><div className="sub">Attendance imports</div></StatCard>
        </div>
        <div className="card overflow-hidden">
          <CardHead title="Heads of department" sub="Click a HOD to see their team below" />
          <div className="grid grid-cols-3 gap-4 px-7 pb-7">
            {hods.map((h) => (
              <button key={h.id} type="button" onClick={() => setHod(hod === h.name ? '' : h.name)}
                className={`text-left p-4 rounded-[10px] border border-solid ${hod === h.name ? 'border-navy bg-navy-soft' : 'border-line bg-white hover:bg-page'}`}>
                <div className="text-[15px] font-medium">{h.name}</div>
                <div className="eyebrow mt-1">{h.emp_id.toUpperCase()} · {teamSize(h.leader_id)} in team</div>
              </button>
            ))}
          </div>
        </div>
      </>)}

      <div className="card overflow-hidden">
        <div className="flex justify-between items-center gap-4 px-7 pt-6 pb-5">
          <div>
            <h2 className="h2">{me.role === 'hod' ? 'My team' : hod ? `${hod}’s team` : 'All employees'}</h2>
            <p className="sub">{shown.length} of {scope.length} shown</p>
          </div>
          <div className="flex gap-2 items-center">
            {hod && <button type="button" className="linkbtn" onClick={() => setHod('')}>Clear HOD filter</button>}
            <input className="inp w-[280px]" type="search" aria-label="Search employees" placeholder="Search ID, name, department…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className={`th ${cols}`}><div>Emp ID</div><div>Name</div><div>Designation</div><div>Department</div><div>HOD</div><div>Role</div></div>
        {error && <div className="tr text-danger">{error}</div>}
        {loading && <div className="tr muted">Loading…</div>}
        {rows && shown.length === 0 && <div className="tr muted">No employees match.</div>}
        {shown.map((e) => (
          <div key={e.id} className={`tr ${cols} items-center`}>
            <div className="font-medium">{e.emp_id.toUpperCase()}</div>
            <div>{e.name}<div className="eyebrow mt-0.5">{e.email ?? '—'}</div></div>
            <div className="muted">{e.designation}</div>
            <div className="muted">{e.department ?? '—'}</div>
            <div className="muted">{e.hod ?? '—'}</div>
            <div><Pill tone={e.role === 'staff' ? 'neutral' : 'navy'}>{ROLE_LABEL[e.role]}</Pill></div>
          </div>
        ))}
      </div>
    </div>
  )
}
