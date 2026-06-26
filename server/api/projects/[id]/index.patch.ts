export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('projects')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PROJECT_UPDATE_FAILED',
      message: error.message,
    })
  }

  return createSuccessResponse(data)
})
