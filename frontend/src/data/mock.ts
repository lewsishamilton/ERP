// Static demo data. Replace each export with an API call once the backend exists.
import type { Assignment, Notice, Query, Receipt } from '../types'

// ---------- Shared (seed for the store) ----------
export const ROLLS = Array.from({ length: 16 }, (_, i) => '25A51A05' + String(i + 1).padStart(2, '0'))

export const INITIAL_MARKS: Record<string, string> = Object.fromEntries(
  ['27', '24', '29', '18', '26', '22', '28', '25'].map((m, i) => [ROLLS[i], m]),
)

export const NOTICES: Notice[] = [
  { id: 6, date: '26/09/2026', no: '26-27/014', msg: 'II B.Tech I Sem Mid-I examinations begin 13 Oct 2026. The timetable is under Exam Time Tables.', by: 'Examination Branch' },
  { id: 5, date: '22/09/2026', no: '26-27/013', msg: 'Last date to pay Term 2 fees without fine is 10 Oct 2026.', by: 'Accounts Section' },
  { id: 4, date: '18/09/2026', no: '26-27/012', msg: 'Guest lecture on cloud-native systems in Seminar Hall 2 on 24 Sep 2026 at 10:00 AM.', by: 'Dept. of CSE' },
  { id: 3, date: '12/09/2026', no: '26-27/011', msg: 'Revaluation results for I B.Tech II Sem (Regular) have been published.', by: 'Examination Branch' },
  { id: 2, date: '05/09/2026', no: '26-27/010', msg: 'Supplementary examination hall tickets are available under Downloads.', by: 'Examination Branch' },
  { id: 1, date: '01/09/2026', no: '26-27/009', msg: 'Class work for II, III and IV B.Tech I Semester commences on 01 Sep 2026.', by: 'Academic Office' },
]

export const ASSIGNMENTS: Assignment[] = [
  { id: 3, title: 'Implement a stack and a queue using linked lists', subject: 'Data Structures', cls: 'II CSE-A', due: '2026-10-03', status: 'Pending', base: 41 },
  { id: 2, title: 'K-map simplification, problem set 2', subject: 'Digital Logic Design', cls: 'II CSE-A', due: '2026-09-30', status: 'Submitted', base: 54 },
  { id: 1, title: 'Inheritance and interfaces case study', subject: 'OOP through Java', cls: 'II CSE-A', due: '2026-10-08', status: 'Pending', base: 12 },
]

export const QUERIES: Query[] = [
  { id: 1, to: 'Data Structures', subject: 'Circular queue: full vs empty', msg: 'When front equals rear, how do we know whether the circular queue is full or empty?', date: '25/09/2026', reply: 'Either keep one slot empty or track a count of elements. We will work through both in Thursday’s class.', seen: true },
]

export const RECEIPTS: Receipt[] = [{ no: 'AIMS/FEE/2026/0188', date: '14/07/2026', desc: 'Term 1 fees: tuition, library and transport', amt: '₹ 56,500' }]

// ---------- Student: timetable ----------
export const SUBJECT_NAMES: Record<string, string> = { DS: 'Data Structures', DM: 'Discrete Mathematics', DLD: 'Digital Logic Design', OOPJ: 'OOP through Java', CO: 'Computer Organization', BEFA: 'Business Economics & Financial Analysis', 'DS LAB': 'Data Structures Lab', 'JAVA LAB': 'Java Programming Lab', LIB: 'Library hour', MENTOR: 'Mentoring', SPORTS: 'Sports & games' }
export const PERIOD_TIMES = ['09:30 – 10:20', '10:20 – 11:10', '11:20 – 12:10', '12:10 – 01:00', '01:00 – 01:40', '01:40 – 02:30', '02:30 – 03:20']
export const TIMETABLE: Record<string, string[]> = {
  MON: ['DS', 'DM', 'DLD', 'OOPJ', 'LUNCH', 'CO', 'BEFA'],
  TUE: ['DLD', 'DS', 'CO', 'DM', 'LUNCH', 'DS LAB', 'DS LAB'],
  WED: ['OOPJ', 'CO', 'DS', 'BEFA', 'LUNCH', 'DM', 'LIB'],
  THU: ['DM', 'OOPJ', 'DLD', 'DS', 'LUNCH', 'JAVA LAB', 'JAVA LAB'],
  FRI: ['CO', 'BEFA', 'OOPJ', 'DLD', 'LUNCH', 'DS', 'MENTOR'],
  SAT: ['DS', 'DM', 'CO', 'OOPJ', 'LUNCH', 'SPORTS', 'SPORTS'],
}

// ---------- Student: attendance [subject, held, attended] ----------
export const ATTENDANCE: [string, number, number][] = [['Data Structures', 42, 38], ['Discrete Mathematics', 40, 33], ['Digital Logic Design', 38, 35], ['OOP through Java', 41, 37], ['Computer Organization', 36, 26], ['Business Economics & Financial Analysis', 30, 26], ['Data Structures Lab', 14, 14], ['Java Programming Lab', 12, 11]]

export const ATT_HELD = ATTENDANCE.reduce((t, r) => t + r[1], 0)
export const ATT_ATTENDED = ATTENDANCE.reduce((t, r) => t + r[2], 0)
export const ATT_OVERALL = Math.round((ATT_ATTENDED * 100) / ATT_HELD)

export const SYLLABUS = [
  { name: 'Data Structures', pct: 68, unit: 4, topic: 'Trees and BSTs' },
  { name: 'Discrete Mathematics', pct: 55, unit: 3, topic: 'Graph theory' },
  { name: 'Digital Logic Design', pct: 60, unit: 3, topic: 'Sequential circuits' },
  { name: 'OOP through Java', pct: 62, unit: 3, topic: 'Exception handling' },
  { name: 'Computer Organization', pct: 48, unit: 3, topic: 'Memory hierarchy' },
  { name: 'Business Economics & Financial Analysis', pct: 52, unit: 3, topic: 'Cost analysis' },
]

// ---------- Student: exams [date, day, time, subject, code] ----------
const SUBJECT_CODES: [string, string][] = [['Data Structures', 'CS301PC'], ['Discrete Mathematics', 'MA302BS'], ['Digital Logic Design', 'EC303ES'], ['OOP through Java', 'CS304PC'], ['Computer Organization', 'CS305PC'], ['Business Economics & Financial Analysis', 'SM306MS']]
const examRows = (dates: [string, string][], time: string) => dates.map(([date, day], i) => ({ date, day, time, sub: SUBJECT_CODES[i][0], code: SUBJECT_CODES[i][1] }))
export const EXAMS = {
  mid1: { title: 'Mid-I examinations · October 2026', rows: examRows([['13 Oct 2026', 'Tue'], ['14 Oct 2026', 'Wed'], ['15 Oct 2026', 'Thu'], ['16 Oct 2026', 'Fri'], ['17 Oct 2026', 'Sat'], ['19 Oct 2026', 'Mon']], '10:00 – 11:30 AM') },
  mid2: { title: 'Mid-II examinations · December 2026', rows: examRows([['14 Dec 2026', 'Mon'], ['15 Dec 2026', 'Tue'], ['16 Dec 2026', 'Wed'], ['17 Dec 2026', 'Thu'], ['18 Dec 2026', 'Fri'], ['19 Dec 2026', 'Sat']], '10:00 – 11:30 AM') },
  sem: { title: 'Semester-end examinations · January 2027', rows: examRows([['04 Jan 2027', 'Mon'], ['06 Jan 2027', 'Wed'], ['08 Jan 2027', 'Fri'], ['11 Jan 2027', 'Mon'], ['13 Jan 2027', 'Wed'], ['15 Jan 2027', 'Fri']], '10:00 AM – 01:00 PM') },
}
export type ExamKey = keyof typeof EXAMS

// ---------- Student: fees ----------
export const FEES: [string, number][] = [['Tuition fee, instalment 2', 45000], ['Examination fee, I Semester', 1200], ['Library and laboratory fee', 2500], ['Transport fee, term 2', 9000]]
export const FEE_TOTAL = FEES.reduce((t, f) => t + f[1], 0)
export const PAY_METHODS = [{ key: 'upi', label: 'UPI', short: 'UPI' }, { key: 'card', label: 'Debit / credit card', short: 'Card' }, { key: 'netbanking', label: 'Net banking', short: 'Net banking' }] as const
export type PayMethod = (typeof PAY_METHODS)[number]['key']

// ---------- Student: marks ----------
export const CGPA = '8.43'
export const INTERNAL_MARKS = [
  { sub: 'Data Structures', mid1: '26', asg: '5', mid2: '—', total: '31' },
  { sub: 'Discrete Mathematics', mid1: '22', asg: '4', mid2: '—', total: '26' },
  { sub: 'Digital Logic Design', mid1: '27', asg: '5', mid2: '—', total: '32' },
  { sub: 'OOP through Java', mid1: '24', asg: '5', mid2: '—', total: '29' },
  { sub: 'Computer Organization', mid1: '19', asg: '4', mid2: '—', total: '23' },
  { sub: 'Business Economics & Financial Analysis', mid1: '25', asg: '5', mid2: '—', total: '30' },
]
export const SEM_RESULTS = [
  { sem: 'I Year · I Semester', pub: 'Feb 2026', credits: '20 / 20', result: 'Passed', sgpa: '8.21', width: 82 },
  { sem: 'I Year · II Semester', pub: 'Jul 2026', credits: '20 / 20', result: 'Passed', sgpa: '8.64', width: 86 },
]

// ---------- Student: profile, downloads, contacts ----------
export const PROFILE = {
  personal: [['Full name', '[Student Name]'], ['Date of birth', '[DD/MM/YYYY]'], ['Gender', '[Gender]'], ['Blood group', '[Blood group]'], ['Mobile', '[Mobile number]'], ['College email', '[College email]'], ['Aadhaar', 'Hidden for privacy'], ['Category', '[Category]'], ['Address', '[Residential address]']],
  admission: [['Hall Ticket No.', '[Roll No.]'], ['Programme', 'B.Tech, CSE'], ['Batch', '2025–29'], ['Admission type', '[Admission type]'], ['Regulation', '[Regulation]'], ['Mentor', '[Mentor name]']],
  guardian: [['Guardian name', '[Guardian name]'], ['Relation', '[Relation]'], ['Guardian mobile', '[Mobile number]']],
}

export const DOWNLOADS = [['Mid-I hall ticket', 'PDF · available from 06 Oct 2026'], ['Academic calendar 2026–27', 'PDF · 180 KB'], ['II B.Tech syllabus (CSE)', 'PDF · 1.2 MB'], ['Fee structure 2026–27', 'PDF · 96 KB'], ['Bonafide certificate request form', 'PDF · 64 KB'], ['Previous question papers, I Sem', 'ZIP · 4.8 MB']]

export const QUERY_TARGETS = ['Data Structures', 'Discrete Mathematics', 'Digital Logic Design', 'OOP through Java', 'Computer Organization', 'Class Teacher / Mentor']

export const CONTACTS = [
  { dept: 'Examination Branch', desc: 'Hall tickets, results, revaluation', mail: 'Exam branch', hours: 'Mon–Sat, 9:30 AM – 4:30 PM' },
  { dept: 'Accounts Section', desc: 'Fee payments, receipts, scholarships', mail: 'Accounts', hours: 'Mon–Sat, 9:30 AM – 4:00 PM' },
  { dept: 'Academic Office', desc: 'Certificates, bonafide, corrections', mail: 'Academic office', hours: 'Mon–Sat, 9:30 AM – 4:30 PM' },
  { dept: 'Transport Desk', desc: 'Bus routes, passes, pickup points', mail: 'Transport', hours: 'Mon–Sat, 8:00 AM – 5:00 PM' },
]

// ---------- Faculty ----------
export const CLASSES = ['II CSE-A', 'II CSE-B', 'III CSE-A']
export const FACULTY_SUBJECTS = ['Data Structures', 'Data Structures Lab', 'Compiler Design']
export const PERIODS = ['Period 1 · 09:30', 'Period 2 · 10:20', 'Period 3 · 11:20', 'Period 4 · 12:10', 'Period 5 · 01:40', 'Period 6 · 02:30']
export const ASSESSMENTS = ['Mid-I', 'Mid-II', 'Assignment-I']
export const NOTICE_AUDIENCES = ['All II B.Tech CSE students', 'II CSE-A', 'II CSE-B', 'III CSE-A']
export const LEAVE_TYPES = ['Casual leave', 'Medical leave', 'On duty', 'Emergency leave']
export const CLASS_SIZE = 62

export const FACULTY_TODAY: { time: string; cls: string; subject: string; room: string; state: 'done' | 'now' | 'next' }[] = [
  { time: '09:30 – 10:20', cls: 'II CSE-A', subject: 'Data Structures', room: 'Room 204', state: 'done' },
  { time: '10:20 – 11:10', cls: 'II CSE-B', subject: 'Data Structures', room: 'Room 206', state: 'done' },
  { time: '11:20 – 01:00', cls: 'II CSE-A', subject: 'Data Structures Lab', room: 'Lab 3', state: 'now' },
  { time: '01:40 – 02:30', cls: 'III CSE-A', subject: 'Compiler Design', room: 'Room 305', state: 'next' },
  { time: '02:30 – 03:20', cls: 'II CSE-B', subject: 'Mentoring', room: 'Room 206', state: 'next' },
]

export const LESSON_PLAN = [{ cls: 'II CSE-A', sub: 'Data Structures', pct: 68 }, { cls: 'II CSE-B', sub: 'Data Structures', pct: 61 }, { cls: 'II CSE-A', sub: 'DS Lab', pct: 70 }, { cls: 'III CSE-A', sub: 'Compiler Design', pct: 54 }]
