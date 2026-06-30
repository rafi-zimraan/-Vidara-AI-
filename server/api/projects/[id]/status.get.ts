export default defineEventHandler(async (event) => {
  const user = event.context.user
  const projectId = getRouterParam(event, 'id')!
  const supabase = useServerSupabase()

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, title, prompt_text, language, target_duration_secs, resolution, aspect_ratio, status, metadata, credits_used, created_at, started_at, completed_at, owner_id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (error || !project) {
    throw createError({ statusCode: 404, message: 'Project tidak ditemukan' })
  }

  const { data: tasks } = await supabase
    .from('agent_tasks')
    .select('id, step_name, agent_name, status, started_at, completed_at, error_message, tokens_in, tokens_out, cost_usd')
    .eq('project_id', projectId)
    .order('priority', { ascending: true })

  const completedCount = (tasks || []).filter(t => t.status === 'completed').length
  const totalCount = tasks?.length || PIPELINE_STEPS.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return createSuccessResponse({
    project,
    tasks: tasks || [],
    progress: progressPercent,
    completed_steps: completedCount,
    total_steps: totalCount,
  })
})
