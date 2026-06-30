export default defineEventHandler(async (event) => {
  const user = event.context.user
  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return createSuccessResponse(data)
})
