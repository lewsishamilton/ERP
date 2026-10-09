import { useState, type ReactNode } from 'react'
import { loginEmail, supabase } from '../../../lib/supabase'
import { attendanceStats, LEAVE_QUOTA, leaveUsed, useAnnouncements, useMyAttendance, useMyLeaves } from '../../../lib/staffApi'
import { useErp } from '../../../store/ErpContext'
import { Pill } from '../../../components/ui'
import type { Staff } from '../../../types'

const ROLE_LABEL = { staff: 'Faculty / Staff', hod: 'Head of Department', dean: 'Dean', manager: 'Attendance Manager' }
const initials = (name: string) => name.split(/[\s.]+/).filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join('')

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <div className="card p-7"><h2 className="h2">{title}</h2><div className="mt-5">{children}</div></div>
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><div className="eyebrow">{label}</div><div className="text-[15px] mt-1.5">{children}</div></div>
}
function Tile({ label, value }: { label: string; value: ReactNode }) {
  return <div className="card stat"><div className="eyebrow">{label}</div><div className="num">{value}</div></div>
}

export default function Profile() {
  const { s, set, flash } = useErp()
  const me = s.staff!
  const att = attendanceStats(useMyAttendance().rows ?? [])
  const leaves = useMyLeaves().rows ?? []
  const posted = (useAnnouncements().rows ?? []).filter((a) => a.author_id === me.id).length
  const usedDays = Object.keys(LEAVE_QUOTA).reduce((t, k) => t + leaveUsed(leaves, k), 0)

  const [email, setEmail] = useState(me.email ?? '')
  const [phone, setPhone] = useState(me.phone ?? '')
  const [cur, setCur] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState('')

  const saveContact = async () => {
    if (phone && !/^\+?[0-9 ]{7,15}$/.test(phone)) return flash('Enter a valid phone number')
    setBusy('contact')
    const { error } = await supabase.from('employees').update({ email: email.trim() || null, phone: phone.trim() || null }).eq('id', me.id)
    const { data } = error ? { data: null } : await supabase.from('employee_profiles').select('*').eq('id', me.id).single()
    setBusy('')
    if (error) return flash('Could not save: ' + error.message)
    if (data) set({ staff: data as Staff })
    flash('Contact details saved')
  }

  const changePassword = async () => {
    if (!cur) return flash('Enter your current password')
    if (pw.length < 8) return flash('Use at least 8 characters')
    if (pw !== pw2) return flash('The two new passwords do not match')
    setBusy('pw')
    // Supabase does not check the old password on update, so verify it first.
    const check = await supabase.auth.signInWithPassword({ email: loginEmail(me.emp_id), password: cur })
    const { error } = check.error ? check : await supabase.auth.updateUser({ password: pw })
    setBusy('')
    if (check.error) return flash('Current password is wrong')
    if (error) return flash('Could not change password: ' + error.message)
    setCur(''); setPw(''); setPw2('')
    flash('Password changed. Use it next time you sign in.')
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="card p-7 flex items-center gap-6">
        <div className="w-[72px] h-[72px] rounded-[50%] bg-navy text-white grid place-items-center text-[24px] font-semibold shrink-0">{initials(me.name)}</div>
        <div className="grow min-w-0">
          <div className="serif text-[34px] leading-[1.1]">{me.name}</div>
          <div className="muted text-[14px] mt-1">{me.department ?? 'Administration'}</div>
          <div className="flex gap-2 mt-3">
            <Pill tone="navy">{me.designation}</Pill>
            <Pill tone="neutral">{me.emp_id.toUpperCase()}</Pill>
            <Pill tone="success">Active</Pill>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <Tile label="Days present this month" value={att.daysRecorded} />
        <Tile label="Hours on campus" value={att.onCampus} />
        <Tile label="Leave days used" value={usedDays} />
        <Tile label="Announcements" value={posted} />
      </div>

      <div className="grid grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
          <Section title="Personal Information">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <Field label="Full Name">{me.name}</Field>
              <Field label="Employee ID">{me.emp_id.toUpperCase()}</Field>
              <div><label className="lbl" htmlFor="p-email">Email Address</label><input id="p-email" className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><label className="lbl" htmlFor="p-phone">Mobile</label><input id="p-phone" className="inp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 98765 43210" /></div>
            </div>
            <button type="button" className="btn btn-p mt-5 disabled:opacity-70" disabled={busy === 'contact'} onClick={saveContact}>{busy === 'contact' ? 'Saving…' : 'Save contact details'}</button>
          </Section>

          <Section title="Work Information">
            <div className="flex flex-col">
              {([['Designation', me.designation], ['Department', me.department], ['HOD', me.hod], ['Dean', me.dean]] as const).map(([k, v], i, a) => (
                <div key={k} className={`flex justify-between py-3 text-[14px] ${i < a.length - 1 ? 'border-b border-line-soft' : ''}`}>
                  <span className="muted">{k}</span><span className="font-medium">{v ?? '—'}</span>
                </div>
              ))}
            </div>
            <p className="sub mt-3">Managed by the admin office.</p>
          </Section>
        </div>

        <div className="flex flex-col gap-8">
          <Section title="Account Information">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <Field label="Account Created">{new Date(me.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Field>
              <Field label="Status"><Pill tone="success">Active</Pill></Field>
              <Field label="Role">{ROLE_LABEL[me.role]}</Field>
              <Field label="Casual leave left">{LEAVE_QUOTA['Casual leave'] - leaveUsed(leaves, 'Casual leave')} of {LEAVE_QUOTA['Casual leave']}</Field>
            </div>
          </Section>

          <Section title="Password">
            <div className="flex flex-col gap-5">
              <div><label className="lbl" htmlFor="p-cur">Current Password</label><input id="p-cur" className="inp" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></div>
              <div><label className="lbl" htmlFor="p-pw">New Password</label><input id="p-pw" className="inp" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /><p className="sub">At least 8 characters</p></div>
              <div><label className="lbl" htmlFor="p-pw2">Confirm New Password</label><input id="p-pw2" className="inp" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
              <div><button type="button" className="btn btn-p disabled:opacity-70" disabled={busy === 'pw'} onClick={changePassword}>{busy === 'pw' ? 'Saving…' : 'Change Password'}</button></div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
