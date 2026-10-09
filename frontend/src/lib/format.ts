const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-10-03' → '03 Oct 2026' */
export const fmtDate = (d: string) => {
  const p = String(d || '').split('-')
  return p.length === 3 ? `${p[2]} ${MONTHS[+p[1] - 1]} ${p[0]}` : d
}

/** 56500 → '₹ 56,500' */
export const inr = (n: number) => '₹ ' + n.toLocaleString('en-IN')

/** Today as DD/MM/YYYY */
export const todayStr = () => new Date().toLocaleDateString('en-GB')

export const todayLong = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const todayShort = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

export const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

// ---------- India time (staff attendance is always recorded in IST) ----------
const IST = 'Asia/Kolkata'
/** Date → 'YYYY-MM-DD' in IST */
export const istDay = (d = new Date()) => d.toLocaleDateString('en-CA', { timeZone: IST })
/** ISO timestamp → 'HH:MM' (24h) in IST */
export const istTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: IST })
/** ISO timestamp → '08 Oct 2026, 09:14' in IST */
export const istDateTime = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: IST })
/** Minutes → '36h 04m' */
export const hm = (mins: number) => { const m = Math.floor(mins); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` }
