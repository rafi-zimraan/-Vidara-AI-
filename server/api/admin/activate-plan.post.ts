const PLAN_MONTHLY_CREDITS: Record<string, number> = {
  free: 500,
  pro: 5000,
  business: 20000,
  enterprise: 100000,
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = getHeader(event, 'x-seed-secret')
  if (!secret || secret !== config.seedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { user_id, plan, allocate_credits = true } = await readBody(event)

  if (!user_id || !plan) {
    throw createError({ statusCode: 422, message: 'user_id dan plan diperlukan' })
  }
  if (!(plan in PLAN_MONTHLY_CREDITS)) {
    throw createError({ statusCode: 422, message: 'Plan tidak valid. Pilih: free, pro, business, enterprise' })
  }

  const supabase = useServerSupabase()
  const monthly_credits = PLAN_MONTHLY_CREDITS[plan]
  const now = new Date().toISOString()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ plan, plan_activated_at: now })
    .eq('id', user_id)

  if (profileError) throw createError({ statusCode: 500, message: profileError.message })

  let credits_allocated = 0

  if (allocate_credits) {
    const { data: existing } = await supabase
      .from('user_credits')
      .select('balance, total_purchased')
      .eq('user_id', user_id)
      .single()

    const currentBalance = existing?.balance ?? 0
    const newBalance = currentBalance + monthly_credits
    const newTotalPurchased = (existing?.total_purchased ?? 0) + monthly_credits

    if (existing) {
      await supabase
        .from('user_credits')
        .update({ balance: newBalance, total_purchased: newTotalPurchased })
        .eq('user_id', user_id)
    } else {
      await supabase
        .from('user_credits')
        .insert({ user_id, balance: monthly_credits, total_purchased: monthly_credits })
    }

    await supabase.from('credit_transactions').insert({
      user_id,
      type: 'bonus',
      amount: monthly_credits,
      balance_after: newBalance,
      description: `Alokasi kredit bulanan paket ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
    })

    credits_allocated = monthly_credits
  }

  return createSuccessResponse({
    user_id,
    plan,
    credits_allocated,
    message: `Paket ${plan} berhasil diaktifkan` + (allocate_credits ? ` dan ${monthly_credits.toLocaleString()} kredit telah ditambahkan` : ''),
  })
})
