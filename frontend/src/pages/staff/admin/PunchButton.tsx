import { useState } from 'react'
import { punch } from '../../../lib/staffApi'
import { istTime } from '../../../lib/format'
import { useErp } from '../../../store/ErpContext'
import type { AttendanceDay } from '../../../types'

/** Punch in, or punch out once already in today. Time comes from the server. */
export default function PunchButton({ today, className = '' }: { today?: AttendanceDay; className?: string }) {
  const { flash } = useErp()
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    const { data, error } = await punch()
    setBusy(false)
    if (error) return flash('Could not record attendance: ' + error.message)
    const r = data as AttendanceDay
    flash(r.punch_out ? `Punched out at ${istTime(r.punch_out)}` : `Punched in at ${istTime(r.punch_in)}`)
  }

  return (
    <button type="button" className={`btn btn-p disabled:opacity-70 ${className}`} disabled={busy} onClick={run}>
      {busy ? 'Saving…' : today ? 'Punch out' : 'Punch in'}
    </button>
  )
}
