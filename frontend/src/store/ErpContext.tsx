// App-wide UI state. Pages read `s` and update with `set`.
// The staff Admin section keeps its records in Supabase (lib/staffApi.ts); the
// Learning and student pages still use the in-memory demo data below.
import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { ASSIGNMENTS, INITIAL_MARKS, NOTICES, QUERIES, RECEIPTS, type ExamKey, type PayMethod } from '../data/mock'
import { istDay } from '../lib/format'
import type { AdminSection, LearningSection, Screen, Staff, StaffMode, StudentSection } from '../types'

const initialState = () => ({
  // session + navigation
  screen: 'loading' as Screen,
  staff: null as Staff | null, // signed-in staff profile
  loginId: '',
  loginErr: false,
  sSec: 'home' as StudentSection,
  mode: 'admin' as StaffMode,
  tSec: 'home' as LearningSection,
  aSec: 'home' as AdminSection,
  acadTab: 'attendance' as 'attendance' | 'timetable' | 'assignments' | 'syllabus',
  examTab: 'mid1' as ExamKey,
  feeTab: 'pay' as 'pay' | 'receipts',
  marksTab: 'internal' as 'internal' | 'sem',

  // shared records
  notices: NOTICES,
  assignments: ASSIGNMENTS,
  queries: QUERIES,
  receipts: RECEIPTS,

  // student forms
  feePaid: false,
  payMethod: 'upi' as PayMethod,
  qTo: 'Data Structures',
  qSubject: '',
  qText: '',

  // faculty forms
  roster: { '25A51A0504': 'A', '25A51A0511': 'A' } as Record<string, 'P' | 'A'>,
  attSaved: '',
  attClass: 'II CSE-A',
  attSubject: 'Data Structures',
  attPeriod: 'Period 1 · 09:30',
  attDate: new Date().toISOString().slice(0, 10),
  marks: INITIAL_MARKS,
  mClass: 'II CSE-A',
  mExam: 'Mid-I',
  nText: '',
  nAudience: 'All II B.Tech CSE students',
  aTitle: '',
  aSubject: 'Data Structures',
  aClass: 'II CSE-A',
  aDue: '2026-10-10',
  drafts: {} as Record<number, string>,
  lType: 'Casual leave',
  lFrom: istDay(),
  lTo: istDay(),
  lReason: '',

  toast: '',
})

export type ErpState = ReturnType<typeof initialState>
type Patch = Partial<ErpState> | ((s: ErpState) => Partial<ErpState>)

interface Erp {
  s: ErpState
  set: (patch: Patch) => void
  flash: (msg: string) => void
}

const ErpContext = createContext<Erp | null>(null)

export function ErpProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState(initialState)
  const timer = useRef<number>(undefined)

  const set = (patch: Patch) => setS((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))
  const flash = (msg: string) => {
    set({ toast: msg })
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => set({ toast: '' }), 3000)
  }

  return <ErpContext.Provider value={{ s, set, flash }}>{children}</ErpContext.Provider>
}

export function useErp() {
  const ctx = useContext(ErpContext)
  if (!ctx) throw new Error('useErp must be used inside <ErpProvider>')
  return ctx
}

/** onChange handler that writes an input's value into the store */
export function useField() {
  const { set } = useErp()
  return (key: keyof ErpState) => (e: { target: { value: string } }) => set({ [key]: e.target.value } as Partial<ErpState>)
}
