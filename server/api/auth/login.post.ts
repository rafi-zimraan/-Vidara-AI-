export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 422,
      statusMessage: 'VALIDATION_ERROR',
      message: 'Email and password are required',
    })
  }

  const supabase = createClientSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'AUTH_INVALID_CREDENTIALS',
      message: error.message,
    })
  }

  return createSuccessResponse({
    user_id: data.user.id,
    email: data.user.email,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  })
})
