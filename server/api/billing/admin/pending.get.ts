export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (user?.email !== 'admin@gmail.com') {
    throw createError({ statusCode: 403, message: 'Akses admin saja' })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return createSuccessResponse(data)
})
