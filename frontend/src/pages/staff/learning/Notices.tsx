import { NOTICE_AUDIENCES } from '../../../data/mock'
import { todayStr } from '../../../lib/format'
import { useErp, useField } from '../../../store/ErpContext'
import { CardHead, Select } from '../../../components/ui'

export default function Notices() {
  const { s, set, flash } = useErp()
  const field = useField()

  const post = () => {
    if (!s.nText.trim()) return flash('Write the notice first')
    set((cur) => ({ notices: [{ id: Date.now(), date: todayStr(), no: '26-27/0' + (9 + cur.notices.length), msg: cur.nText.trim(), by: 'Dept. of CSE · ' + cur.nAudience, isNew: true }, ...cur.notices], nText: '' }))
    flash('Notice posted. Students can see it now.')
  }

  return (
    <div className="grid grid-cols-[380px_minmax(0,1fr)] gap-8 items-start">
      <div className="card p-7 flex flex-col gap-5">
        <div><h2 className="h2">Post a notice</h2><p className="sub">Appears in the students’ Notifications</p></div>
        <Select id="n-aud" label="Audience" value={s.nAudience} onChange={field('nAudience')} options={NOTICE_AUDIENCES} />
        <div><label className="lbl" htmlFor="n-text">Notice</label><textarea id="n-text" className="inp" value={s.nText} onChange={field('nText')} placeholder="e.g. DS lab internal exam on 06 Oct. Bring your record." /></div>
        <button type="button" className="btn btn-p" onClick={post}>Post notice</button>
      </div>
      <div className="card overflow-hidden">
        <CardHead title="All notices" />
        <div className="th grid grid-cols-[88px_minmax(0,1fr)]"><div>Date</div><div>Notice</div></div>
        {s.notices.map((n) => (
          <div key={n.id} className="tr grid grid-cols-[88px_minmax(0,1fr)]">
            <div className="muted text-[13px]">{n.date}</div>
            <div><div>{n.msg}</div><div className="eyebrow mt-1">{n.no} · {n.by}</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}
