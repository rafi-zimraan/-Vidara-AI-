const PLAN_MONTHLY_CREDITS: Record<string, number> = {
  free: 500,
  pro: 5000,
  business: 20000,
  enterprise: 100000,
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
}

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const supabase = useServerSupabase()

  // Get user plan from profiles (graceful fallback if column doesn't exist yet)
  let plan = 'free'
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    if (profile?.plan) plan = profile.plan
  } catch { /* plan column may not exist — default to free */ }

  const monthlyCredits = PLAN_MONTHLY_CREDITS[plan] ?? 500

  // Fetch existing credits row
  const { data, error } = await supabase
    .from('user_credits')
    .select('balance, total_purchased, total_used, total_expired')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Auto-initialize if: no row, OR never had any credits allocated (total_purchased=0, total_used=0)
  const needsInit = !data || (data.total_purchased === 0 && data.balance === 0 && (data.total_used ?? 0) === 0)

  if (needsInit) {
    await supabase
      .from('user_credits')
      .upsert(
        {
          user_id: user.id,
          balance: monthlyCredits,
          total_purchased: monthlyCredits,
          total_used: 0,
          total_expired: 0,
        },
        { onConflict: 'user_id' },
      )

    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: monthlyCredits,
      type: 'bonus',
      description: `Alokasi kredit awal paket ${PLAN_LABELS[plan] ?? plan}`,
      balance_after: monthlyCredits,
    })

    return createSuccessResponse({
      balance: monthlyCredits,
      total_purchased: monthlyCredits,
      total_used: 0,
      total_expired: 0,
      plan,
      plan_label: PLAN_LABELS[plan] ?? plan,
      monthly_credits: monthlyCredits,
    })
  }

  return createSuccessResponse({
    balance: data.balance ?? 0,
    total_purchased: data.total_purchased ?? 0,
    total_used: data.total_used ?? 0,
    total_expired: data.total_expired ?? 0,
    plan,
    plan_label: PLAN_LABELS[plan] ?? plan,
    monthly_credits: monthlyCredits,
  })
})
