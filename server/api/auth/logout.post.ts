export default defineEventHandler(async (event) => {
  const supabase = createClientSupabase()
  const authHeader = getHeader(event, 'authorization')
  if (authHeader) {
    supabase.auth.setSession({
      access_token: authHeader.slice(7),
      refresh_token: '',
    })
    await supabase.auth.signOut()
  }
  return createSuccessResponse({ message: 'Logged out successfully' })
})
