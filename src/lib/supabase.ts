import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabaseConfig'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Where Supabase should send the user back to after they click an email
 * confirmation link. Resolves correctly both in local dev and on GitHub Pages.
 */
export function authRedirectTo(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}`
}
