import { useState } from 'react'
import { decideLeave, leaveDays, leaveStage, useLeavesForReview } from '../../../lib/staffApi'
import { fmtDate, istDateTime } from '../../../lib/format'
import { useErp } from '../../../store/ErpContext'
import { CardHead, Pill, Tabs, statusTone } from '../../../components/ui'

/** HOD: requests from their team waiting for them. Dean: requests the HODs approved. */
export default function LeaveApprovals() {
  const { s, flash } = useErp()
  const me = s.staff!
  const { rows, error, loading } = useLeavesForReview()
  const [tab, setTab] = useState<'todo' | 'done'>('todo')
  const [busy, setBusy] = useState(0)

  const waitingFor = me.role === 'hod' ? 'Pending' : 'HOD approved'
  const others = (rows ?? []).filter((l) => l.employee && l.employee.emp_id !== me.emp_id)
  const todo = others.filter((l) => l.status === waitingFor)
  const list = tab === 'todo' ? todo : others.filter((l) => l.status !== waitingFor)
  const cols = 'grid grid-cols-[minmax(0,1.1fr)_150px_minmax(0,1fr)_150px_170px]'

  const decide = async (id: number, approve: boolean) => {
    const note = approve ? '' : prompt('Reason for rejecting (shown to the employee):')
    if (note === null) return
    setBusy(id)
    const { error } = await decideLeave(id, approve, note)
    setBusy(0)
    if (error) return flash('Could not save decision: ' + error.message)
    flash(approve ? (me.role === 'hod' ? 'Approved. Sent to the Dean for final approval.' : 'Leave approved.') : 'Leave rejected.')
  }

  return (
    <div className="flex flex-col gap-8">
      <Tabs label="Leave approvals" active={tab} onChange={setTab}
        tabs={[['todo', `Waiting for you (${todo.length})`], ['done', 'History']]} />
      <div className="card overflow-hidden">
        <CardHead title={tab === 'todo' ? 'Waiting for your decision' : 'Decided and in progress'}
          sub={me.role === 'hod' ? 'Requests from your team. Approved requests go to the Dean.' : 'Requests already approved by a HOD. Your decision is final.'} />
        <div className={`th ${cols}`}><div>Employee</div><div>Leave</div><div>Reason</div><div>Status</div><div></div></div>
        {error && <div className="tr text-danger">{error}</div>}
        {loading && <div className="tr muted">Loading…</div>}
        {rows && list.length === 0 && <div className="tr muted">{tab === 'todo' ? 'Nothing waiting. You’re all caught up.' : 'No decided requests yet.'}</div>}
        {list.map((l) => (
          <div key={l.id} className={`tr ${cols} items-center`}>
            <div>
              <div className="font-medium">{l.employee?.name} <span className="muted font-normal">· {l.employee?.emp_id.toUpperCase()}</span></div>
              <div className="eyebrow mt-0.5">{l.employee?.designations?.title}{l.employee?.departments ? ` · ${l.employee.departments.name}` : ''}</div>
            </div>
            <div>
              <div>{l.type}</div>
              <div className="eyebrow mt-0.5">{l.from_date === l.to_date ? fmtDate(l.from_date) : `${fmtDate(l.from_date)} – ${fmtDate(l.to_date)}`} · {leaveDays(l)}d</div>
            </div>
            <div className="muted">{l.reason}{l.remark && <div className="eyebrow mt-0.5">Remark: {l.remark}</div>}</div>
            <div>
              <Pill tone={statusTone(l.status)}>{l.status}</Pill>
              <div className="eyebrow mt-1">{leaveStage(l.status)}</div>
            </div>
            <div className="flex justify-end gap-2">
              {l.status === waitingFor ? (<>
                <button type="button" className="btn disabled:opacity-70" disabled={busy === l.id} onClick={() => decide(l.id, false)}>Reject</button>
                <button type="button" className="btn btn-p disabled:opacity-70" disabled={busy === l.id} onClick={() => decide(l.id, true)}>Approve</button>
              </>) : <span className="eyebrow">{istDateTime(l.dean_at ?? l.hod_at ?? l.created_at)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
