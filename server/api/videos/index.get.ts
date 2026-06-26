export default defineEventHandler(async (event) => {
  const user = event.context.user

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .eq('status', 'completed')
    .is('deleted_at', null)
    .order('completed_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'VIDEO_LIST_FAILED',
      message: error.message,
    })
  }

  return createSuccessResponse(data || [])
})
