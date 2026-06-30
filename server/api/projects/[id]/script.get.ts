export default defineEventHandler(async (event) => {
  const user = event.context.user
  const projectId = getRouterParam(event, 'id')!
  const supabase = useServerSupabase()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, status, metadata, language, target_duration_secs, prompt_text, owner_id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (projectError || !project) {
    throw createError({ statusCode: 404, message: 'Project tidak ditemukan' })
  }

  const { data: script } = await supabase
    .from('scripts')
    .select('id, full_script, word_count, target_language, created_at, updated_at')
    .eq('project_id', projectId)
    .single()

  return createSuccessResponse({ project, script: script || null })
})
