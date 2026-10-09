import { PROFILE } from '../../data/mock'
import { useErp } from '../../store/ErpContext'
import { Icon } from '../../components/Icon'
import { InfoRow, Pill } from '../../components/ui'

function FieldGrid({ fields }: { fields: string[][] }) {
  return (
    <div className="grid grid-cols-3 gap-x-8 gap-y-6 mt-6">
      {fields.map(([k, v]) => <div key={k}><div className="eyebrow">{k}</div><div className="text-[15px] mt-1.5">{v}</div></div>)}
    </div>
  )
}

export default function BasicInfo() {
  const { flash } = useErp()
  return (
    <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-8 items-start">
      <div className="card px-7 py-8">
        <div className="w-[88px] h-[88px] rounded-[50%] bg-fill text-subtle grid place-items-center"><Icon name="user" size={40} stroke={1.4} /></div>
        <div className="serif text-[30px] mt-5">[Student Name]</div>
        <div className="muted text-[14px] mt-1">Hall Ticket No. [Roll No.]</div>
        <Pill tone="success" className="mt-4">Active · Regular</Pill>
        <div className="flex flex-col mt-6 border-t border-line-soft">
          <InfoRow k="Branch" v="CSE" />
          <InfoRow k="Section" v="A" />
          <InfoRow k="Year / Semester" v="II / I" />
          <InfoRow k="Batch" v="2025–29" last />
        </div>
      </div>
      <div className="card">
        <div className="p-7">
          <div className="flex justify-between items-center"><h2 className="h2">Personal details</h2><button type="button" className="btn" onClick={() => flash('Correction request sent to the Academic Office')}>Request correction</button></div>
          <FieldGrid fields={PROFILE.personal} />
        </div>
        <div className="p-7 border-t border-line-soft"><h2 className="h2">Admission and academics</h2><FieldGrid fields={PROFILE.admission} /></div>
        <div className="p-7 border-t border-line-soft"><h2 className="h2">Parent / guardian</h2><FieldGrid fields={PROFILE.guardian} /></div>
      </div>
    </div>
  )
}
