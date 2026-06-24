import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'
import { useAuth } from './AuthContext'

interface ProfileState {
  profile: Profile | null
  loading: boolean
  refresh: () => Promise<void>
  update: (patch: Partial<Profile>) => Promise<void>
}

const ProfileContext = createContext<ProfileState | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    // Ensure a profile row exists (created lazily on first sign-in), then load it.
    await supabase.from('sc_profiles').upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })
    const { data } = await supabase.from('sc_profiles').select('*').eq('id', user.id).single()
    setProfile((data as Profile) ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    setLoading(true)
    refresh()
  }, [refresh])

  const update = async (patch: Partial<Profile>) => {
    if (!user) return
    const { data } = await supabase
      .from('sc_profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('*')
      .single()
    if (data) setProfile(data as Profile)
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh, update }}>
      {children}
    </ProfileContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileState {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
