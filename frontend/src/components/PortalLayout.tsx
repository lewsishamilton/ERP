// Sidebar + top header shell shared by the student and faculty portals.
import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { useErp } from '../store/ErpContext'
import { supabase } from '../lib/supabase'

export interface NavItem<K extends string> { key: K; label: string; icon: IconName; badge?: number }

interface Props<K extends string> {
  portalLabel: string
  nav: NavItem<K>[]
  active: K
  onNavigate: (k: K) => void
  userName: string
  userMeta: string
  title: string
  headerMeta: string
  /** Extra block above the menu (e.g. the staff Learning / Admin switch) */
  top?: ReactNode
  bellLabel: string
  bellDot: boolean
  onBell: () => void
  children: ReactNode
}

export function PortalLayout<K extends string>(p: Props<K>) {
  const { set } = useErp()
  const logout = async () => {
    await supabase.auth.signOut()
    set({ screen: 'login', staff: null, loginId: '', loginErr: false })
  }

  return (
    <div className="flex w-full h-screen">
      <aside className="w-[248px] shrink-0 bg-white border-r border-line flex flex-col gap-0.5 px-4 py-6">
        <div className="px-2 pt-1 pb-5.5 mb-3.5 border-b border-line-soft">
          <img src="/logo.png" alt="Arundathi Institute of Medical Sciences and Hospital" className="block w-[188px] h-auto -ml-[9px]" />
          <span className="pill mt-3.5 bg-navy-soft text-navy">{p.portalLabel}</span>
        </div>
        {p.top}
        <div className="eyebrow px-3 pt-0.5 pb-2 text-[11px] tracking-[.1em] uppercase">Menu</div>
        {p.nav.map((n) => {
          const on = n.key === p.active
          return (
            <button key={n.key} type="button" className={`nav ${on ? 'bg-navy-soft text-navy' : 'bg-transparent text-muted'}`} onClick={() => p.onNavigate(n.key)}>
              <Icon name={n.icon} />
              <span className="grow">{n.label}</span>
              {!!n.badge && <span className="pill bg-navy text-white h-5 px-[7px]">{n.badge}</span>}
            </button>
          )
        })}
        <div className="grow" />
        <div className="flex items-center gap-3 px-2 py-4 border-t border-line-soft">
          <div className="w-9 h-9 rounded-[50%] bg-fill text-muted grid place-items-center shrink-0"><Icon name="user" /></div>
          <div className="min-w-0"><div className="text-[14px] font-medium">{p.userName}</div><div className="eyebrow">{p.userMeta}</div></div>
        </div>
        <button type="button" className="nav bg-transparent text-muted" onClick={logout}>
          <Icon name="logout" /><span className="grow">Log out</span>
        </button>
      </aside>

      <div className="grow min-w-0 flex flex-col">
        <header className="h-[72px] shrink-0 border-b border-line flex items-center gap-3 px-12">
          <h1 className="grow m-0 text-[18px] font-semibold">{p.title}</h1>
          <span className="eyebrow mr-2">{p.headerMeta}</span>
          <button type="button" className="icon-btn" aria-label={p.bellLabel} onClick={p.onBell}>
            <Icon name="bell" />
            {p.bellDot && <span className="absolute top-2.5 right-[11px] w-2 h-2 rounded-[50%] bg-navy border-2 border-solid border-white" />}
          </button>
        </header>
        {/* key = section, so scroll resets to the top when switching pages */}
        <main key={p.active} className="scroll grow overflow-y-auto px-12 pt-10 pb-16">{p.children}</main>
      </div>
    </div>
  )
}
