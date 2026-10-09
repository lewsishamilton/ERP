import { DOWNLOADS } from '../../data/mock'
import { useErp } from '../../store/ErpContext'
import { Icon } from '../../components/Icon'
import { CardHead } from '../../components/ui'

export default function Downloads() {
  const { flash } = useErp()
  return (
    <div className="card overflow-hidden">
      <CardHead title="Documents" sub="Hall tickets, calendars, syllabus and forms" />
      {DOWNLOADS.map(([name, meta]) => (
        <div key={name} className="tr flex items-center gap-4">
          <Icon name="file" size={20} stroke={1.6} color="#6B7079" />
          <div className="grow"><div>{name}</div><div className="eyebrow mt-0.5">{meta}</div></div>
          <button type="button" className="btn" onClick={() => flash('Downloading ' + name)}>Download</button>
        </div>
      ))}
    </div>
  )
}
