import { useEffect } from 'react'
import { QUERY_TARGETS } from '../../data/mock'
import { todayStr } from '../../lib/format'
import { useErp, useField } from '../../store/ErpContext'
import { Pill, Select, statusTone } from '../../components/ui'

export default function AskFaculty() {
  const { s, set, flash } = useErp()
  const field = useField()

  // Opening this page marks faculty replies as read (clears the sidebar badge).
  useEffect(() => {
    if (s.queries.some((q) => q.reply && !q.seen)) set((cur) => ({ queries: cur.queries.map((q) => (q.reply ? { ...q, seen: true } : q)) }))
  }, [s.queries])

  const send = () => {
    if (!s.qSubject.trim() || !s.qText.trim()) return flash('Add a topic and a message first')
    set((cur) => ({ queries: [{ id: Date.now(), to: cur.qTo, subject: cur.qSubject.trim(), msg: cur.qText.trim(), date: todayStr(), reply: '' }, ...cur.queries], qSubject: '', qText: '' }))
    flash('Sent to ' + s.qTo + ' faculty')
  }

  return (
    <div className="grid grid-cols-[400px_minmax(0,1fr)] gap-8 items-start">
      <div className="card p-7 flex flex-col gap-5">
        <div><h2 className="h2">Ask a question</h2><p className="sub">Your faculty sees it in their Student Queries inbox</p></div>
        <Select id="q-to" label="Subject faculty" value={s.qTo} onChange={field('qTo')} options={QUERY_TARGETS} />
        <div><label className="lbl" htmlFor="q-sub">Topic</label><input id="q-sub" className="inp" value={s.qSubject} onChange={field('qSubject')} placeholder="e.g. Doubt in AVL rotations" /></div>
        <div><label className="lbl" htmlFor="q-msg">Message</label><textarea id="q-msg" className="inp" value={s.qText} onChange={field('qText')} placeholder="Describe your question" /></div>
        <button type="button" className="btn btn-p" onClick={send}>Send to faculty</button>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="h2">My questions</h2>
        {s.queries.map((q) => {
          const status = q.reply ? 'Answered' : 'Awaiting reply'
          return (
            <div key={q.id} className="card px-7 py-6 flex flex-col gap-3">
              <div className="flex justify-between gap-4 items-start">
                <div><div className="text-[15px] font-medium">{q.subject}</div><div className="eyebrow mt-1">To {q.to} faculty · {q.date}</div></div>
                <Pill tone={statusTone(status)}>{status}</Pill>
              </div>
              <div className="text-[14px] leading-[1.6] text-ink-2">{q.msg}</div>
              {q.reply && (
                <div className="px-[18px] py-4 rounded-lg bg-page">
                  <div className="eyebrow">Faculty reply</div>
                  <div className="text-[14px] leading-[1.6] mt-1.5">{q.reply}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
