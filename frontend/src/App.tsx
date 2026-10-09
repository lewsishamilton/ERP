// Top level: follows the Supabase session, then shows login or the staff portal, plus the toast.
// Student pages (pages/student) are kept but not connected until student logins exist.
import { useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useErp } from './store/ErpContext'
import { supabase } from './lib/supabase'
import { Icon } from './components/Icon'
import Login from './pages/Login'
import StaffPortal from './pages/staff/StaffPortal'
import type { Staff } from './types'

export default function App() {
  const { s, set, flash } = useErp()

  useEffect(() => {
    const load = async (session: Session | null) => {
      if (!session) return set({ screen: 'login', staff: null })
      const { data, error } = await supabase.from('employee_profiles').select('*').eq('id', session.user.id).maybeSingle()
      if (error || !data) {
        // PGRST205 = table/view missing: backend/supabase/schema.sql has not been run yet.
        flash(error?.code === 'PGRST205' ? 'Database is not set up yet. Run backend/supabase/schema.sql in Supabase.'
          : error ? 'Could not load your profile: ' + error.message
          : 'No employee record for this login. Run the staff seed (npm run seed:staff).')
        await supabase.auth.signOut()
        return
      }
      set({ screen: 'staff', staff: data as Staff })
    }
    // Defer Supabase calls out of the auth callback (recommended by supabase-js to avoid deadlocks).
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') setTimeout(() => load(session))
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <div className="w-full min-w-[1200px] h-screen relative overflow-hidden bg-page">
      {s.screen === 'login' && <Login />}
      {s.screen === 'staff' && s.staff && <StaffPortal />}

      {s.toast && (
        <div role="status" className="absolute left-1/2 bottom-8 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3.5 rounded-[10px] bg-navy text-white text-[14px] shadow-[0_8px_24px_rgba(21,23,28,.18)] max-w-[720px]">
          <Icon name="check" size={16} stroke={2.2} color="#9FD8BA" />{s.toast}
        </div>
      )}
    </div>
  )
}
