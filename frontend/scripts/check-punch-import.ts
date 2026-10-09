// Self-check for the punch file parser. Run: node frontend/scripts/check-punch-import.ts
import assert from 'node:assert/strict'
import { csvToCells, parsePunchRows } from '../src/lib/punchImport.ts'

const csv = `Emp ID,Date,Punch In,Punch Out
EMP101,2026-10-08,09:14,17:30
emp102,08/10/2026,9:05 AM,5:45 PM
emp103,"08-10-2026",10:00,
emp104,31/02/2026,09:00,17:00
,2026-10-08,09:00,17:00
emp105,2026-10-08,18:00,09:00`
const { rows, errors } = parsePunchRows(csvToCells(csv))
assert.deepEqual(rows, [
  { emp_id: 'emp101', day: '2026-10-08', punch_in: '09:14', punch_out: '17:30' },
  { emp_id: 'emp102', day: '2026-10-08', punch_in: '09:05', punch_out: '17:45' },
  { emp_id: 'emp103', day: '2026-10-08', punch_in: '10:00', punch_out: '' },
])
assert.deepEqual(errors, ['Row 5: bad date', 'Row 6: missing Emp_ID', 'Row 7: punch-out is before punch-in'])

// Excel cells: Date objects and serial numbers.
const xl = parsePunchRows([['Emp_ID', 'Date', 'Punch_In', 'Punch_Out'], ['emp101', new Date(Date.UTC(2026, 9, 8)), 0.385416667, new Date(Date.UTC(1899, 11, 30, 17, 30))], ['emp102', 46303, '09:00', null]])
assert.deepEqual(xl.rows, [
  { emp_id: 'emp101', day: '2026-10-08', punch_in: '09:15', punch_out: '17:30' },
  { emp_id: 'emp102', day: '2026-10-08', punch_in: '09:00', punch_out: '' }, // Excel serial 46303
])
assert.deepEqual(parsePunchRows([['Name', 'Date']]).errors, ['Missing column: Emp_ID'])
console.log('✓ punch import parser checks passed')
