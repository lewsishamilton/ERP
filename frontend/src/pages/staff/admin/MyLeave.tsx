import { useState } from 'react'
import { LEAVE_TYPES } from '../../../data/mock'
import { applyLeave, cancelLeave, LEAVE_QUOTA, leaveDays, leaveStage, leaveUsed, useMyLeaves } from '../../../lib/staffApi'
import { fmtDate } from '../../../lib/format'
import { useErp, useField } from '../../../store/ErpContext'
import { CardHead, Pill, Select, statusTone } from '../../../components/ui'

export default function MyLeave() {
  const { s, set, flash } = useErp()
  const field = useField()
  const { rows, error, loading } = useMyLeaves()
  const [busy, setBusy] = useState(false)
  const leaves = rows ?? []
  const cols = 'grid grid-cols-[130px_190px_minmax(0,1fr)_180px_70px]'

  const apply = async () => {
    if (!s.lReason.trim()) return flash('Add a reason for the leave')
    if (s.lTo < s.lFrom) return flash('The end date is before the start date')
    setBusy(true)
    const { error } = await applyLeave({ type: s.lType, from_date: s.lFrom, to_date: s.lTo, reason: s.lReason })
    setBusy(false)
    if (error) return flash('Could not send request: ' + error.message)
    set({ lReason: '' })
    flash(s.staff?.hod_id ? 'Leave request sent to your HOD' : 'Leave request sent to the Dean')
  }

  const cancel = async (id: number) => {
    const { error } = await cancelLeave(id)
    flash(error ? 'Could not cancel: ' + error.message : 'Leave request cancelled')
  }

  const balance = (label: string, value: number, unit: string, first?: boolean) => (
    <div className={`px-7 py-6 ${first ? '' : 'border-l border-line-soft'}`}>
      <div className="eyebrow">{label}</div>
      <div className="num">{value} <span className="muted text-[14px]">{unit}</span></div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="card grid grid-cols-3">
        {balance('Casual leave left', LEAVE_QUOTA['Casual leave'] - leaveUsed(leaves, 'Casual leave'), `of ${LEAVE_QUOTA['Casual leave']} days`, true)}
        {balance('Medical leave left', LEAVE_QUOTA['Medical leave'] - leaveUsed(leaves, 'Medical leave'), `of ${LEAVE_QUOTA['Medical leave']} days`)}
        {balance('On duty this year', leaveUsed(leaves, 'On duty'), 'days')}
      </div>
      <div className="grid grid-cols-[380px_minmax(0,1fr)] gap-8 items-start">
        <div className="card p-7 flex flex-col gap-5">
          <h2 className="h2">Apply for leave</h2>
          <Select id="l-type" label="Leave type" value={s.lType} onChange={field('lType')} options={LEAVE_TYPES} />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="lbl" htmlFor="l-from">From</label><input id="l-from" className="inp" type="date" value={s.lFrom} onChange={field('lFrom')} /></div>
            <div><label className="lbl" htmlFor="l-to">To</label><input id="l-to" className="inp" type="date" min={s.lFrom} value={s.lTo} onChange={field('lTo')} /></div>
          </div>
          <div><label className="lbl" htmlFor="l-reason">Reason</label><textarea id="l-reason" className="inp min-h-24" maxLength={1000} value={s.lReason} onChange={field('lReason')} placeholder="Reason for leave" /></div>
          <button type="button" className="btn btn-p disabled:opacity-70" disabled={busy} onClick={apply}>{busy ? 'Sending…' : s.staff?.hod_id ? 'Submit to HOD' : 'Submit to Dean'}</button>
        </div>
        <div className="card overflow-hidden">
          <CardHead title="My leave requests" sub="HOD approves first, then the Dean. Status updates live." />
          <div className={`th ${cols}`}><div>Type</div><div>Dates</div><div>Reason</div><div>Status</div><div></div></div>
          {error && <div className="tr text-danger">{error}</div>}
          {loading && <div className="tr muted">Loading…</div>}
          {rows?.length === 0 && <div className="tr muted">No leave requests yet.</div>}
          {leaves.map((l) => (
            <div key={l.id} className={`tr ${cols} items-center`}>
              <div className="font-medium">{l.type}</div>
              <div className="muted">{l.from_date === l.to_date ? fmtDate(l.from_date) : `${fmtDate(l.from_date)} – ${fmtDate(l.to_date)}`} · {leaveDays(l)}d</div>
              <div className="muted">{l.reason}{l.remark && <div className="eyebrow mt-0.5">Remark: {l.remark}</div>}</div>
              <div><Pill tone={statusTone(l.status)}>{l.status}</Pill><div className="eyebrow mt-1">{leaveStage(l.status)}</div></div>
              <div className="flex justify-end">{(l.status === 'Pending' || l.status === 'HOD approved') && <button type="button" className="linkbtn" onClick={() => cancel(l.id)}>Cancel</button>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
