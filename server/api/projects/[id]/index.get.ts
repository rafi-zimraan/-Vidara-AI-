export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'RESOURCE_NOT_FOUND',
      message: 'Project not found',
    })
  }

  return createSuccessResponse(data)
})
