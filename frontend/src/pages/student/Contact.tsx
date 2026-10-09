import { CONTACTS } from '../../data/mock'
import { CardHead } from '../../components/ui'

export default function Contact() {
  const cols = 'grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]'
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div className="card overflow-hidden">
        <CardHead title="Offices" sub="Reach the right desk directly" />
        <div className={`th ${cols}`}><div>Office</div><div>Contact</div><div>Hours</div></div>
        {CONTACTS.map((c) => (
          <div key={c.dept} className={`tr ${cols}`}>
            <div><div className="font-medium">{c.dept}</div><div className="eyebrow mt-0.5">{c.desc}</div></div>
            <div><div>[Phone number]</div><div className="muted text-[13px]">[{c.mail} email]</div></div>
            <div className="muted">{c.hours}</div>
          </div>
        ))}
      </div>
      <div className="card p-7">
        <h2 className="h2">Campus address</h2>
        <p className="mt-3 mb-0 mx-0 text-[14px] leading-[1.7] text-ink-2">[Street address]<br />[City, State – PIN]</p>
      </div>
    </div>
  )
}
