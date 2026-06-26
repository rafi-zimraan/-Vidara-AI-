export default defineEventHandler(async (event) => {
  const { refresh_token } = await readBody(event)

  if (!refresh_token) {
    throw createError({
      statusCode: 422,
      statusMessage: 'VALIDATION_ERROR',
      message: 'Refresh token is required',
    })
  }

  const supabase = createClientSupabase()
  const { data, error } = await supabase.auth.refreshSession({ refresh_token })

  if (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'AUTH_REFRESH_EXPIRED',
      message: 'Invalid or expired refresh token',
    })
  }

  return createSuccessResponse({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  })
})
