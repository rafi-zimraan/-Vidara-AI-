export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const { user, token, fetchUser } = useAuth()

  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token) {
    token.value = session.access_token
    await fetchUser()
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'TOKEN_REFRESHED' && session) {
      token.value = session.access_token
    }
  })
})
