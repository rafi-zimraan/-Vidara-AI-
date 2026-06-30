export default defineEventHandler(async (event) => {
  // Protect with a seed secret — set SEED_SECRET in .env
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const secret = getHeader(event, 'x-seed-secret') || body?.secret
  if (!secret || secret !== config.seedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized: missing or invalid seed secret' })
  }

  const supabase = useServerSupabase()

  // Check if admin already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const adminExists = existing?.users?.some(u => u.email === 'admin@gmail.com')

  if (adminExists) {
    return createSuccessResponse({ message: 'Admin user already exists', created: false })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@gmail.com',
    password: 'tanyaAdminRafi123@',
    email_confirm: true,
    user_metadata: {
      name: 'Admin Vidara',
      role: 'admin',
    },
  })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  const userId = data.user.id

  // Set admin plan to Pro
  await supabase.from('profiles')
    .update({ plan: 'pro', plan_activated_at: new Date().toISOString() })
    .eq('id', userId)

  // Allocate initial Pro credits (5,000)
  await supabase.from('user_credits')
    .upsert({ user_id: userId, balance: 5000, total_purchased: 5000 }, { onConflict: 'user_id' })

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    type: 'bonus',
    amount: 5000,
    balance_after: 5000,
    description: 'Alokasi kredit bulanan paket Pro (seed)',
  })

  return createSuccessResponse({
    message: 'Admin user created successfully with Pro plan and 5,000 credits',
    created: true,
    user_id: userId,
    email: data.user.email,
    plan: 'pro',
    credits: 5000,
    password_hint: 'tanyaAdminRafi123@ (visible in Supabase dashboard → Auth → Users)',
  })
})
