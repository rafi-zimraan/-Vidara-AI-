export default defineEventHandler(async (event) => {
  const { email, password, name } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 422,
      statusMessage: 'VALIDATION_ERROR',
      message: 'Email and password are required',
    })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: name || email.split('@')[0] },
  })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'REGISTRATION_FAILED',
      message: error.message,
    })
  }

  return createSuccessResponse({
    user_id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata.name,
  })
})
