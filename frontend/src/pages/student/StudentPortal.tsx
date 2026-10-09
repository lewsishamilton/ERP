// Student portal: sidebar menu + which page renders for each section.
// Not reachable yet: App.tsx only routes staff. Reconnect when student logins exist.
import type { ComponentType } from 'react'
import { PortalLayout, type NavItem } from '../../components/PortalLayout'
import { useErp } from '../../store/ErpContext'
import type { StudentSection } from '../../types'
import Dashboard from './Dashboard'
import BasicInfo from './BasicInfo'
import Academic from './Academic'
import Exams from './Exams'
import Fees from './Fees'
import Marks from './Marks'
import Downloads from './Downloads'
import AskFaculty from './AskFaculty'
import Contact from './Contact'

const PAGES: Record<StudentSection, { title: string; Page: ComponentType }> = {
  home: { title: 'Dashboard', Page: Dashboard },
  basic: { title: 'Basic Information', Page: BasicInfo },
  academic: { title: 'Academic Information', Page: Academic },
  exams: { title: 'Exam Time Tables', Page: Exams },
  fees: { title: 'Online Fee Payments', Page: Fees },
  marks: { title: 'Marks Details', Page: Marks },
  downloads: { title: 'Downloads', Page: Downloads },
  ask: { title: 'Ask Faculty', Page: AskFaculty },
  contact: { title: 'Contact Us', Page: Contact },
}

export default function StudentPortal() {
  const { s, set } = useErp()
  const newReplies = s.queries.filter((q) => q.reply && !q.seen).length
  const nav: NavItem<StudentSection>[] = [
    { key: 'home', label: 'Dashboard', icon: 'home' },
    { key: 'basic', label: 'Basic Information', icon: 'user' },
    { key: 'academic', label: 'Academic Information', icon: 'book' },
    { key: 'exams', label: 'Exam Time Tables', icon: 'calendar' },
    { key: 'fees', label: 'Online Fee Payments', icon: 'card' },
    { key: 'marks', label: 'Marks Details', icon: 'chart' },
    { key: 'downloads', label: 'Downloads', icon: 'download' },
    { key: 'ask', label: 'Ask Faculty', icon: 'message', badge: newReplies },
    { key: 'contact', label: 'Contact Us', icon: 'phone' },
  ]
  const { title, Page } = PAGES[s.sSec]

  return (
    <PortalLayout
      portalLabel="Student portal" nav={nav} active={s.sSec} onNavigate={(k) => set({ sSec: k })}
      userName="[Student Name]" userMeta="[Roll No.] · CSE"
      title={title} headerMeta="AY 2026–27 · II Year, I Sem"
      bellLabel="Notifications" bellDot={s.notices.some((n) => n.isNew)} onBell={() => set({ sSec: 'home' })}
    >
      <Page />
    </PortalLayout>
  )
}
