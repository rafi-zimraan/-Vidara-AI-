export default defineEventHandler(async (event) => {
  const user = event.context.user
  const query = getQuery(event)

  const supabase = useServerSupabase()
  let dbQuery = supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(Number(query.limit) || 20)

  if (query.status) {
    dbQuery = dbQuery.eq('status', query.status)
  }

  const { data, error } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PROJECT_LIST_FAILED',
      message: error.message,
    })
  }

  return createPaginatedResponse(data || [], {
    total: data?.length || 0,
    has_more: (data?.length || 0) >= (Number(query.limit) || 20),
    limit: Number(query.limit) || 20,
  })
})
