export default defineEventHandler(async (event) => {
  const user = event.context.user
  const projectId = getRouterParam(event, 'id')!
  const supabase = useServerSupabase()

  // Verify ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, prompt_text, language, target_duration_secs, status, owner_id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (projectError || !project) {
    throw createError({ statusCode: 404, message: 'Project tidak ditemukan' })
  }

  // Prevent re-running if already in progress
  const activeStatuses = ['queued', 'generating_script', 'generating_voiceover', 'generating_subtitles', 'generating_footage', 'rendering']
  if (activeStatuses.includes(project.status)) {
    return createSuccessResponse({ status: project.status, message: 'Pipeline sudah berjalan' })
  }

  // Set project to queued
  await supabase.from('projects').update({ status: 'queued' }).eq('id', projectId)

  // Delete any old agent_tasks for this project (for re-runs)
  await supabase.from('agent_tasks').delete().eq('project_id', projectId)

  // Insert all 18 pipeline steps as pending tasks
  const tasksToInsert = PIPELINE_STEPS.map((step, idx) => ({
    project_id: projectId,
    agent_name: step.agent,
    step_name: step.name,
    status: 'pending',
    priority: idx,
  }))

  const { data: insertedTasks, error: taskError } = await supabase
    .from('agent_tasks')
    .insert(tasksToInsert)
    .select('id, step_name')

  if (taskError || !insertedTasks) {
    await supabase.from('projects').update({ status: 'failed' }).eq('id', projectId)
    throw createError({ statusCode: 500, message: 'Gagal membuat pipeline tasks' })
  }

  // Map step name → task id
  const taskIds: Record<number, string> = {}
  for (const task of insertedTasks) {
    const step = PIPELINE_STEPS.find(s => s.name === task.step_name)
    if (step) taskIds[step.n] = task.id
  }

  const topic = project.prompt_text || project.title
  const language = project.language || 'id'
  const durationSecs = project.target_duration_secs || 480

  // Run pipeline in background (fire-and-forget)
  runPipeline(projectId, topic, language, durationSecs, taskIds).catch(async (err) => {
    console.error('[Pipeline Error]', err)
    await supabase.from('projects').update({ status: 'failed', metadata: { error: String(err) } }).eq('id', projectId)
  })

  return createSuccessResponse({
    status: 'queued',
    project_id: projectId,
    steps: PIPELINE_STEPS.length,
    message: 'Pipeline dimulai',
  })
})
