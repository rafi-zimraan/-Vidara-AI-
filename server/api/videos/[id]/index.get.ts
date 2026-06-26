export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('status', 'completed')
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'RESOURCE_NOT_FOUND',
      message: 'Video not found',
    })
  }

  return createSuccessResponse(data)
})
