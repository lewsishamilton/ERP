import { FEES, FEE_TOTAL, PAY_METHODS } from '../../data/mock'
import { inr, todayStr } from '../../lib/format'
import { useErp } from '../../store/ErpContext'
import { Icon } from '../../components/Icon'
import { CardHead, Tabs } from '../../components/ui'

export default function Fees() {
  const { s, set } = useErp()
  return (
    <div className="flex flex-col gap-8">
      <Tabs label="Fees" active={s.feeTab} onChange={(k) => set({ feeTab: k })} tabs={[['pay', 'Pay fees'], ['receipts', 'Receipts']]} />
      {s.feeTab === 'pay' ? <Pay /> : <Receipts />}
    </div>
  )
}

function Pay() {
  const { s, set, flash } = useErp()
  const cols = 'grid grid-cols-[minmax(0,1fr)_160px]'

  // ponytail: simulated payment; wire to the payment gateway via the backend.
  const payNow = () => {
    const no = 'AIMS/FEE/2026/0' + (412 + s.receipts.length)
    const method = PAY_METHODS.find((m) => m.key === s.payMethod)!.short
    set((cur) => ({ feePaid: true, receipts: [{ no, date: todayStr(), desc: 'Term 2 fees via ' + method, amt: inr(FEE_TOTAL) }, ...cur.receipts] }))
    flash('Payment successful. Receipt ' + no)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
      <div className="card overflow-hidden">
        <CardHead title="Term 2 fee breakdown" sub="Last date without fine: 10 Oct 2026" />
        <div className={`th ${cols}`}><div>Particulars</div><div className="text-right">Amount</div></div>
        {FEES.map(([desc, amt]) => (
          <div key={desc} className={`tr ${cols}`}><div>{desc}</div><div className="text-right">{inr(amt)}</div></div>
        ))}
        <div className={`${cols} gap-6 px-7 py-5 text-[15px] font-semibold`}><div>Total payable</div><div className="text-right">{inr(FEE_TOTAL)}</div></div>
      </div>

      {!s.feePaid ? (
        <div className="card p-7 flex flex-col gap-4">
          <h2 className="h2">Payment method</h2>
          <div role="radiogroup" aria-label="Payment method" className="flex flex-col gap-2">
            {PAY_METHODS.map((m) => {
              const on = s.payMethod === m.key
              return (
                <button key={m.key} type="button" role="radio" aria-checked={on} onClick={() => set({ payMethod: m.key })}
                  className={`flex items-center gap-3 min-h-[52px] px-4 py-0 rounded-lg border border-solid text-[14px] text-ink text-left ${on ? 'border-ink bg-[#F8FAFC]' : 'border-line bg-white'}`}>
                  <span className={`w-4 h-4 rounded-[50%] border-[5px] border-solid bg-white ${on ? 'border-ink' : 'border-border'}`} />
                  {m.label}
                </button>
              )
            })}
          </div>
          <button type="button" className="btn btn-p min-h-12 mt-2" onClick={payNow}>Pay {inr(FEE_TOTAL)}</button>
          <p className="sub m-0 text-center">You’ll be redirected to the bank’s secure gateway. We never store card details.</p>
        </div>
      ) : (
        <div className="card px-7 py-9 flex flex-col items-center text-center gap-2">
          <div className="w-[52px] h-[52px] rounded-[50%] bg-success-soft text-success grid place-items-center"><Icon name="check" size={24} stroke={2} /></div>
          <div className="serif text-[28px] mt-2">Payment successful</div>
          <div className="sub">Receipt {s.receipts[0]?.no}</div>
          <button type="button" className="btn mt-3" onClick={() => set({ feeTab: 'receipts' })}>View receipts</button>
        </div>
      )}
    </div>
  )
}

function Receipts() {
  const { s, flash } = useErp()
  const cols = 'grid grid-cols-[190px_110px_minmax(0,1fr)_120px_100px]'
  return (
    <div className="card overflow-hidden">
      <CardHead title="Payment receipts" />
      <div className={`th ${cols}`}><div>Receipt no.</div><div>Date</div><div>Description</div><div className="text-right">Amount</div><div></div></div>
      {s.receipts.map((r) => (
        <div key={r.no} className={`tr ${cols} items-center`}>
          <div className="font-medium">{r.no}</div><div className="muted">{r.date}</div><div>{r.desc}</div><div className="text-right">{r.amt}</div>
          <div className="flex justify-end"><button type="button" className="btn" onClick={() => flash('Downloading receipt ' + r.no)}>PDF</button></div>
        </div>
      ))}
    </div>
  )
}
