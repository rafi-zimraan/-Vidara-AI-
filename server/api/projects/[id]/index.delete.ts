export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const supabase = useServerSupabase()
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PROJECT_DELETE_FAILED',
      message: error.message,
    })
  }

  return createSuccessResponse({ message: 'Project deleted' })
})
