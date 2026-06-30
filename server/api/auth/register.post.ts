export default defineEventHandler(async (event) => {
  const { email, password, name, phone } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 422,
      statusMessage: 'VALIDATION_ERROR',
      message: 'Email dan password wajib diisi',
    })
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 422,
      statusMessage: 'VALIDATION_ERROR',
      message: 'Password minimal 8 karakter',
    })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    phone: phone || undefined,
    email_confirm: true,
    user_metadata: {
      name: name || email.split('@')[0],
      phone: phone || null,
    },
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
