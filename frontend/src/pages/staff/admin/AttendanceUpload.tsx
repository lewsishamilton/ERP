import { useState } from 'react'
import { readSheet } from 'read-excel-file/browser'
import { csvToCells, parsePunchRows, type Cell, type PunchRow } from '../../../lib/punchImport'
import { importAttendance, useRecentPunches } from '../../../lib/staffApi'
import { fmtDate, istTime } from '../../../lib/format'
import { useErp } from '../../../store/ErpContext'
import { CardHead } from '../../../components/ui'

const TEMPLATE = 'Emp_ID,Date,Punch_In,Punch_Out\nemp101,2026-10-08,09:14,17:30\nemp102,2026-10-08,09:02,\n'

export default function AttendanceUpload() {
  const { flash } = useErp()
  const recent = useRecentPunches()
  const [file, setFile] = useState('')
  const [rows, setRows] = useState<PunchRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const pick = async (f: File | undefined) => {
    setRows([]); setErrors([]); setFile(f?.name ?? '')
    if (!f) return
    try {
      const cells: Cell[][] = /\.xlsx$/i.test(f.name) ? ((await readSheet(f)) as unknown as Cell[][]) : csvToCells(await f.text())
      const parsed = parsePunchRows(cells)
      setRows(parsed.rows); setErrors(parsed.errors)
    } catch (e) {
      setErrors([`Could not read ${f.name}: ${(e as Error).message}. Use .csv or .xlsx.`])
    }
  }

  const upload = async () => {
    setBusy(true)
    const { data, error } = await importAttendance(rows)
    setBusy(false)
    if (error) return flash('Import failed, nothing was saved: ' + error.message)
    const r = data as { imported: number; unknown: string[] }
    flash(`Imported ${r.imported} records${r.unknown.length ? ` · unknown Emp IDs skipped: ${r.unknown.join(', ')}` : ''}`)
    setRows([]); setErrors([]); setFile('')
  }

  const templateHref = 'data:text/csv;charset=utf-8,' + encodeURIComponent(TEMPLATE)

  return (
    <div className="grid grid-cols-[400px_minmax(0,1fr)] gap-8 items-start">
      <div className="card p-7 flex flex-col gap-5">
        <div>
          <h2 className="h2">Upload punch records</h2>
          <p className="sub">CSV or Excel (.xlsx) with columns Emp_ID, Date, Punch_In, Punch_Out. Times are IST. Re-uploading a day replaces it.</p>
        </div>
        <div>
          <label className="lbl" htmlFor="punch-file">File</label>
          <input id="punch-file" className="inp" type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
        </div>
        <a className="linkbtn self-start" href={templateHref} download="punch-template.csv">Download template</a>
        {file && (
          <div className="px-4 py-3.5 rounded-lg bg-page text-[13px] leading-[1.6]">
            <div className="font-medium">{file}</div>
            <div className="text-success">{rows.length} valid rows</div>
            {errors.length > 0 && <div className="text-danger">{errors.length} rows need fixing (see right)</div>}
          </div>
        )}
        <button type="button" className="btn btn-p disabled:opacity-60" disabled={busy || rows.length === 0 || errors.length > 0} onClick={upload}>
          {busy ? 'Importing…' : `Import ${rows.length || ''} records`}
        </button>
        {errors.length > 0 && <p className="sub m-0">Fix the rows with errors and choose the file again. Nothing is imported until the whole file is valid.</p>}
      </div>

      <div className="flex flex-col gap-8">
        {(errors.length > 0 || rows.length > 0) && (
          <div className="card overflow-hidden">
            <CardHead title="Preview" sub={errors.length ? 'Problems found' : 'First 20 rows'} />
            {errors.slice(0, 50).map((e) => <div key={e} className="tr text-danger">{e}</div>)}
            {!errors.length && rows.slice(0, 20).map((r, i) => (
              <div key={i} className="tr grid grid-cols-[100px_140px_100px_100px] gap-6">
                <div className="font-medium">{r.emp_id.toUpperCase()}</div><div>{fmtDate(r.day)}</div><div>In {r.punch_in}</div><div className="muted">{r.punch_out ? `Out ${r.punch_out}` : 'No out'}</div>
              </div>
            ))}
          </div>
        )}
        <div className="card overflow-hidden">
          <CardHead title="Latest records" sub="Most recent 50 · updates live" />
          <div className="th grid grid-cols-[100px_minmax(0,1fr)_130px_90px_90px]"><div>Emp ID</div><div>Name</div><div>Date</div><div>In</div><div>Out</div></div>
          {recent.error && <div className="tr text-danger">{recent.error}</div>}
          {recent.rows?.length === 0 && <div className="tr muted">No attendance recorded yet.</div>}
          {recent.rows?.map((r) => (
            <div key={r.employee_id + r.day} className="tr grid grid-cols-[100px_minmax(0,1fr)_130px_90px_90px]">
              <div className="font-medium">{r.employees?.emp_id.toUpperCase()}</div><div>{r.employees?.name}</div>
              <div className="muted">{fmtDate(r.day)}</div><div>{istTime(r.punch_in)}</div><div className="muted">{r.punch_out ? istTime(r.punch_out) : '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
