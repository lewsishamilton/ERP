import { useState, type KeyboardEvent } from 'react'
import { useErp, useField } from '../store/ErpContext'
import { loginEmail, supabase } from '../lib/supabase'

const FEATURES = [
  ['Attendance', 'Updated as soon as faculty submit it.'],
  ['Fees', 'Pay online and download receipts.'],
  ['Faculty', 'Ask questions, get replies here.'],
]

export default function Login() {
  const { s, set, flash } = useErp()
  const field = useField()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Success is picked up by the auth listener in App.tsx, which loads the staff profile.
  const signIn = async () => {
    if (busy) return
    if (!s.loginId.trim()) return set({ loginErr: true })
    if (!password) return setError('Enter your password.')
    setBusy(true); setError(''); set({ loginErr: false })
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail(s.loginId), password })
    setBusy(false)
    if (error) setError(error.message === 'Invalid login credentials' ? 'Wrong Employee ID or password.' : error.message)
    else { setPassword(''); set({ mode: 'admin', aSec: 'home', tSec: 'home' }) }
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') signIn() }

  return (
    <div className="flex w-full h-screen">
      <section className="grow relative overflow-hidden bg-navy text-white px-20 py-14 flex flex-col justify-between">
        <div aria-hidden="true" className="absolute -right-[60px] -bottom-12 w-[540px] h-[466px] overflow-hidden opacity-[.07]">
          <img src="/logo-white.png" alt="" className="block w-[1487px] h-auto -ml-[74px] -mt-7" />
        </div>
        <img src="/logo-white.png" alt="Arundathi Institute of Medical Sciences and Hospital" className="relative block w-[300px] h-auto -ml-[15px]" />
        <div className="relative max-w-[600px]">
          <div className="text-[12px] font-medium tracking-[.1em] uppercase text-navy-light">Campus ERP · Academic Year 2026–27</div>
          <h1 className="serif mt-5 mb-0 mx-0 text-[72px] leading-[1.02]">The whole campus, <span className="italic text-navy-light">in one place.</span></h1>
          <p className="mt-6 mb-0 mx-0 text-[17px] leading-[1.65] max-w-[460px] text-navy-pale">Attendance, results, fees and notices for students. Attendance, marks and assignments for faculty. One portal, updated as it happens.</p>
          <div className="grid grid-cols-3 gap-8 mt-14 pt-7 border-t border-white/14">
            {FEATURES.map(([t, d]) => (
              <div key={t}><div className="text-[14px] font-semibold">{t}</div><div className="mt-1 text-[13px] leading-[1.5] text-navy-light">{d}</div></div>
            ))}
          </div>
        </div>
        <div className="relative text-[12px] text-navy-light">© 2026 · Student &amp; Faculty ERP</div>
      </section>

      <section className="w-[560px] shrink-0 bg-white border-l border-line flex items-center justify-center">
        <div className="w-[380px] flex flex-col gap-6">
          <div><h2 className="m-0 text-[26px] font-semibold tracking-[-0.02em]">Sign in</h2><p className="sub text-[14px]">Choose your portal to continue.</p></div>
          {/* Student portal is kept but locked until student logins exist. */}
          <div role="group" aria-label="Portal" className="grid grid-cols-2 gap-1 p-1 bg-fill rounded-[9px]">
            <button type="button" className="seg bg-transparent text-muted opacity-50 cursor-not-allowed" disabled title="Student portal is not available yet">Student</button>
            <button type="button" className="seg bg-white text-ink shadow-[0_1px_2px_rgba(21,23,28,.08)]" aria-pressed="true">Faculty</button>
          </div>
          <div>
            <label className="lbl" htmlFor="login-id">Employee ID</label>
            <input id="login-id" className="inp" value={s.loginId} onChange={field('loginId')} onKeyDown={onKey} placeholder="e.g. emp101" autoComplete="username" />
            {s.loginErr && <div className="mt-2 text-[13px] text-danger">Enter your Employee ID to continue.</div>}
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <label className="lbl" htmlFor="login-pw">Password</label>
              <button type="button" className="linkbtn" onClick={() => flash('Ask the admin office to reset your password')}>Forgot password?</button>
            </div>
            <input id="login-pw" className="inp" type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} />
            {error && <div role="alert" className="mt-2 text-[13px] text-danger">{error}</div>}
          </div>
          <button type="button" className="btn btn-p w-full min-h-12 disabled:opacity-70" disabled={busy} onClick={signIn}>{busy ? 'Signing in…' : 'Sign in to Staff Portal'}</button>
        </div>
      </section>
    </div>
  )
}
