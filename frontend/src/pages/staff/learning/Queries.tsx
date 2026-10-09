import { useErp } from '../../../store/ErpContext'
import { Pill, statusTone } from '../../../components/ui'

export default function Queries() {
  const { s, set, flash } = useErp()

  const sendReply = (id: number) => {
    const text = (s.drafts[id] || '').trim()
    if (!text) return flash('Write a reply first')
    set((cur) => ({ queries: cur.queries.map((q) => (q.id === id ? { ...q, reply: text, seen: false } : q)) }))
    flash('Reply sent. The student sees it in Ask Faculty.')
  }

  return (
    <div className="flex flex-col gap-4 max-w-[820px]">
      {s.queries.length === 0 && <div className="card p-7 text-[14px]">No student questions yet.</div>}
      {s.queries.map((q) => {
        const status = q.reply ? 'Answered' : 'Awaiting reply'
        return (
          <div key={q.id} className="card px-7 py-6 flex flex-col gap-3.5">
            <div className="flex justify-between gap-4 items-start">
              <div><div className="text-[15px] font-medium">{q.subject}</div><div className="eyebrow mt-1">[Student Name] · II CSE-A · {q.to} · {q.date}</div></div>
              <Pill tone={statusTone(status)}>{status}</Pill>
            </div>
            <div className="text-[14px] leading-[1.6] text-ink-2">{q.msg}</div>
            {q.reply ? (
              <div className="px-[18px] py-4 rounded-lg bg-page">
                <div className="eyebrow">Your reply</div>
                <div className="text-[14px] leading-[1.6] mt-1.5">{q.reply}</div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-1">
                <label className="lbl m-0" htmlFor={'reply-' + q.id}>Reply</label>
                <textarea id={'reply-' + q.id} className="inp min-h-24" placeholder="Write your reply" value={s.drafts[q.id] || ''}
                  onChange={(e) => set((cur) => ({ drafts: { ...cur.drafts, [q.id]: e.target.value } }))} />
                <div><button type="button" className="btn btn-p" onClick={() => sendReply(q.id)}>Send reply</button></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
