export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,
      title: body.title,
      description: body.description,
      prompt_text: body.prompt,
      language: body.language || 'en',
      target_duration_secs: body.target_duration_seconds,
      aspect_ratio: body.aspect_ratio || '16:9',
      resolution: body.resolution || '1080p',
      status: 'draft',
      config: body.config || {},
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PROJECT_CREATE_FAILED',
      message: error.message,
    })
  }

  return createSuccessResponse(data)
})
