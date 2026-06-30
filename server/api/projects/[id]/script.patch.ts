export default defineEventHandler(async (event) => {
  const user = event.context.user
  const projectId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const supabase = useServerSupabase()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, owner_id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (projectError || !project) {
    throw createError({ statusCode: 404, message: 'Project tidak ditemukan' })
  }

  const fullScript = body?.full_script as string | undefined
  if (!fullScript?.trim()) {
    throw createError({ statusCode: 400, message: 'full_script wajib diisi' })
  }

  const wordCount = fullScript.trim().split(/\s+/).length

  const { error } = await supabase
    .from('scripts')
    .upsert({ project_id: projectId, full_script: fullScript, word_count: wordCount }, { onConflict: 'project_id' })

  if (error) {
    throw createError({ statusCode: 500, message: 'Gagal menyimpan skrip' })
  }

  return createSuccessResponse({ saved: true, word_count: wordCount })
})
