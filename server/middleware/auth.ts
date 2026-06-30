export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (path.startsWith('/api/auth/') || path === '/api/health' || path.startsWith('/api/billing/plans') || path.startsWith('/api/admin/')) {
    return
  }

  if (path.startsWith('/api/')) {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const token = authHeader.slice(7)
    const supabase = useServerSupabase()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
    }

    event.context.user = user
    event.context.supabaseToken = token
  }
})
