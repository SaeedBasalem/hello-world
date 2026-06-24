// Supabase connection details for this project.
//
// The "publishable" key below is SAFE to expose in client-side code and commit
// to the repo — that is exactly what it is designed for. All data access is
// protected by Postgres Row Level Security policies that restrict every row to
// its owner (auth.uid() = user_id), so this key alone grants no access to
// anyone else's data. See the migration `speaking_confidence_app_schema`.
export const SUPABASE_URL = 'https://vfyzedlyveukjaukcekq.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_0rV81EKte4h5bhFyj6Nf4g_kDDLiDTD'
