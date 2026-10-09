// Small building blocks reused by many pages.
import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

// ---------- Pill (status badge) ----------
const TONES = {
  success: 'bg-success-soft text-success',
  neutral: 'bg-fill text-slate',
  danger: 'bg-[#FBEEEC] text-[#9B2019]',
  navy: 'bg-navy-soft text-navy',
  solid: 'bg-navy text-white',
  white: 'bg-white text-slate',
}
export type Tone = keyof typeof TONES

/** Maps a record status to its pill colour. */
export const statusTone = (status: string): Tone =>
  ['Approved', 'Submitted', 'Answered', 'Entered', 'Passed'].includes(status) ? 'success' : status === 'Declined' ? 'danger' : status === 'HOD approved' ? 'navy' : 'neutral'

export function Pill({ tone, className = '', children }: { tone: Tone; className?: string; children: ReactNode }) {
  return <span className={`pill ${TONES[tone]} ${className}`}>{children}</span>
}

// ---------- Progress bar ----------
export function Bar({ pct, color = '#0D2D52', className = '' }: { pct: number; color?: string; className?: string }) {
  return (
    <div className={`bar ${className}`}>
      <div className="h-1.5 rounded-[999px]" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

/** Bar + right-aligned value, used in table cells. */
export function BarCell({ pct, label, color, labelClass = '' }: { pct: number; label: ReactNode; color?: string; labelClass?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Bar pct={pct} color={color} className="grow" />
      <span className={`w-10 text-right ${labelClass}`} style={color ? { color } : undefined}>{label}</span>
    </div>
  )
}

// ---------- Card title block (top of table cards) ----------
export function CardHead({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="px-7 pt-6 pb-5">
      <h2 className="h2">{title}</h2>
      {sub && <p className="sub">{sub}</p>}
    </div>
  )
}

// ---------- Stat card on dashboards ----------
export function StatCard({ icon, label, value, children }: { icon: IconName; label: string; value: ReactNode; children: ReactNode }) {
  return (
    <div className="card stat">
      <span className="chip"><Icon name={icon} stroke={1.8} /></span>
      <div className="eyebrow">{label}</div>
      <div className="num">{value}</div>
      {children}
    </div>
  )
}

// ---------- Key / value line (profile + summaries) ----------
export function InfoRow({ k, v, last }: { k: ReactNode; v: ReactNode; last?: boolean }) {
  return (
    <div className={`flex justify-between py-3 text-[14px] ${last ? '' : 'border-b border-line-soft'}`}>
      <span className="muted">{k}</span><span>{v}</span>
    </div>
  )
}

// ---------- Underlined tabs ----------
export function Tabs<K extends string>({ label, tabs, active, onChange }: { label: string; tabs: [K, string][]; active: K; onChange: (k: K) => void }) {
  return (
    <div role="tablist" aria-label={label} className="tabs">
      {tabs.map(([k, text]) => (
        <button key={k} type="button" role="tab" aria-selected={active === k} className="tab" onClick={() => onChange(k)}
          style={{ color: active === k ? '#0D2D52' : '#6B7079', borderBottomColor: active === k ? '#0D2D52' : 'transparent' }}>
          {text}
        </button>
      ))}
    </div>
  )
}

// ---------- Dashboard hero with logo watermark ----------
export function Hero({ children }: { children: ReactNode }) {
  return (
    <div className="hero">
      <div aria-hidden="true" className="absolute right-10 -top-9 w-[300px] h-[259px] overflow-hidden opacity-[.09]">
        <img src="/logo.png" alt="" className="block w-[826px] h-auto -ml-[41px] -mt-[15px]" />
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}

// ---------- Labelled form controls ----------
export function Select({ id, label, value, options, onChange }: { id: string; label: string; value?: string; options: string[]; onChange?: (e: { target: { value: string } }) => void }) {
  return (
    <div>
      <label className="lbl" htmlFor={id}>{label}</label>
      <select id={id} className="inp" value={value} onChange={onChange}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}
