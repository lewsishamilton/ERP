// Turns a biometric export (CSV text or Excel rows) into rows for import_attendance().
// Expected columns (any order, case/spaces ignored): Emp_ID, Date, Punch_In, Punch_Out.
// Dates: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY or Excel dates. Times: 09:14, 9:14:30, 5:30 PM or Excel times.

export interface PunchRow { emp_id: string; day: string; punch_in: string; punch_out: string }
export type Cell = string | number | boolean | Date | null | undefined

const pad = (n: number) => String(n).padStart(2, '0')
const norm = (h: Cell) => String(h ?? '').toLowerCase().replace(/[^a-z]/g, '')
const COLS: Record<string, keyof PunchRow> = { empid: 'emp_id', employeeid: 'emp_id', date: 'day', day: 'day', punchin: 'punch_in', in: 'punch_in', punchout: 'punch_out', out: 'punch_out' }

function toDay(v: Cell): string | null {
  if (v instanceof Date) return isNaN(+v) ? null : `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`
  if (typeof v === 'number') return toDay(new Date(Math.round((v - 25569) * 864e5))) // Excel serial date
  const s = String(v ?? '').trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  const [y, mo, d] = m ? [+m[1], +m[2], +m[3]] : (m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)) ? [+m[3], +m[2], +m[1]] : [0, 0, 0]
  const dt = new Date(Date.UTC(y, mo - 1, d))
  return y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d ? `${y}-${pad(mo)}-${pad(d)}` : null
}

function toTime(v: Cell): string | null {
  if (v instanceof Date) return isNaN(+v) ? null : `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`
  if (typeof v === 'number') { const m = Math.round((v % 1) * 1440); return v >= 0 ? `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}` : null } // Excel time fraction
  const m = String(v ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i)
  if (!m) return null
  let h = +m[1]
  if (m[3]) { if (h < 1 || h > 12) return null; h = (h % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0) }
  return h < 24 && +m[2] < 60 ? `${pad(h)}:${m[2]}` : null
}

/** First row = header. Returns valid rows plus one message per bad row (1-based row numbers). */
export function parsePunchRows(table: Cell[][]): { rows: PunchRow[]; errors: string[] } {
  const header = (table[0] ?? []).map((h) => COLS[norm(h)])
  for (const need of ['emp_id', 'day', 'punch_in'] as const) {
    if (!header.includes(need)) return { rows: [], errors: [`Missing column: ${{ emp_id: 'Emp_ID', day: 'Date', punch_in: 'Punch_In' }[need]}`] }
  }
  const rows: PunchRow[] = [], errors: string[] = []
  table.slice(1).forEach((cells, i) => {
    if (cells.every((c) => c === null || c === undefined || String(c).trim() === '')) return
    const get = (k: keyof PunchRow) => cells[header.indexOf(k)]
    const emp_id = String(get('emp_id') ?? '').trim().toLowerCase()
    const day = toDay(get('day')), punch_in = toTime(get('punch_in'))
    const rawOut = get('punch_out'), punch_out = rawOut === null || rawOut === undefined || String(rawOut).trim() === '' ? '' : toTime(rawOut)
    const problem = !emp_id ? 'missing Emp_ID' : !day ? 'bad date' : !punch_in ? 'bad punch-in time' : punch_out === null ? 'bad punch-out time'
      : punch_out && punch_out < punch_in ? 'punch-out is before punch-in' : ''
    if (problem) errors.push(`Row ${i + 2}: ${problem}`)
    else rows.push({ emp_id, day: day!, punch_in: punch_in!, punch_out: punch_out! })
  })
  return { rows, errors }
}

/** Minimal CSV → cells (handles quoted fields with commas). */
export const csvToCells = (text: string): Cell[][] =>
  text.split(/\r?\n/).filter((l) => l.trim()).map((l) => (l.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? []).slice(0, -1).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim()))
