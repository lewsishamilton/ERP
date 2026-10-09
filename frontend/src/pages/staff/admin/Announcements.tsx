import { useState } from 'react'
import { deleteAnnouncement, postAnnouncement, useAnnouncements } from '../../../lib/staffApi'
import { istDateTime } from '../../../lib/format'
import { useErp } from '../../../store/ErpContext'
import { CardHead } from '../../../components/ui'

export default function Announcements() {
  const { s, flash } = useErp()
  const { rows, error, loading } = useAnnouncements()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  const post = async () => {
    if (!title.trim() || !body.trim()) return flash('Add a title and a message first')
    setBusy(true)
    const { error } = await postAnnouncement(title, body)
    setBusy(false)
    if (error) return flash('Could not post: ' + error.message)
    setTitle(''); setBody('')
    flash('Announcement posted. All staff can see it now.')
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this announcement for everyone?')) return
    const { error } = await deleteAnnouncement(id)
    flash(error ? 'Could not delete: ' + error.message : 'Announcement deleted')
  }

  return (
    <div className="grid grid-cols-[380px_minmax(0,1fr)] gap-8 items-start">
      <div className="card p-7 flex flex-col gap-5">
        <div><h2 className="h2">Post an announcement</h2><p className="sub">Shown to all staff instantly</p></div>
        <div><label className="lbl" htmlFor="an-title">Title</label><input id="an-title" className="inp" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Staff meeting on Friday" /></div>
        <div><label className="lbl" htmlFor="an-body">Message</label><textarea id="an-body" className="inp" maxLength={5000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the announcement" /></div>
        <button type="button" className="btn btn-p disabled:opacity-70" disabled={busy} onClick={post}>{busy ? 'Posting…' : 'Post announcement'}</button>
      </div>
      <div className="card overflow-hidden">
        <CardHead title="All announcements" sub="Newest first · updates live" />
        {error && <div className="tr text-danger">{error}</div>}
        {loading && <div className="tr muted">Loading…</div>}
        {rows?.length === 0 && <div className="tr muted">No announcements yet.</div>}
        {rows?.map((n) => (
          <div key={n.id} className="tr flex gap-4 items-start">
            <div className="grow min-w-0">
              <div className="font-medium">{n.title}</div>
              <div className="text-ink-2 whitespace-pre-line mt-1">{n.body}</div>
              <div className="eyebrow mt-1.5">{istDateTime(n.created_at)} · {n.employees?.name ?? 'Staff'}{n.employees?.designations ? `, ${n.employees.designations.title}` : ''}</div>
            </div>
            {n.author_id === s.staff?.id && <button type="button" className="linkbtn shrink-0" onClick={() => remove(n.id)}>Delete</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
