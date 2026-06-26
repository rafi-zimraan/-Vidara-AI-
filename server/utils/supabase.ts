import { createClient } from '@supabase/supabase-js'

let _serverClient: ReturnType<typeof createClient> | null = null

export function useServerSupabase() {
  const config = useRuntimeConfig()
  if (!_serverClient) {
    _serverClient = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }
  return _serverClient
}

export function createClientSupabase() {
  const config = useRuntimeConfig()
  return createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
  )
}
