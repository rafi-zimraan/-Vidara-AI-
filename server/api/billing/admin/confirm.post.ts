export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (admin?.email !== 'admin@gmail.com') {
    throw createError({ statusCode: 403, message: 'Akses admin saja' })
  }

  const { payment_request_id } = await readBody(event)
  if (!payment_request_id) {
    throw createError({ statusCode: 422, message: 'payment_request_id wajib' })
  }

  const supabase = useServerSupabase()

  // Get payment request
  const { data: pr, error: prError } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', payment_request_id)
    .eq('status', 'pending')
    .single()

  if (prError || !pr) {
    throw createError({ statusCode: 404, message: 'Payment request tidak ditemukan atau sudah dikonfirmasi' })
  }

  // Check if not expired
  if (new Date(pr.expires_at) < new Date()) {
    await supabase.from('payment_requests').update({ status: 'expired' }).eq('id', pr.id)
    throw createError({ statusCode: 400, message: 'Payment request sudah kedaluwarsa' })
  }

  // Add credits to user
  const { data: existing } = await supabase
    .from('user_credits')
    .select('id, balance, total_purchased, version')
    .eq('user_id', pr.user_id)
    .single()

  const credits = pr.credits

  if (existing) {
    const { error: updateErr } = await supabase
      .from('user_credits')
      .update({
        balance: existing.balance + credits,
        total_purchased: existing.total_purchased + credits,
        version: existing.version + 1,
      })
      .eq('id', existing.id)
      .eq('version', existing.version)

    if (updateErr) throw createError({ statusCode: 500, message: updateErr.message })
  } else {
    const { error: insertErr } = await supabase
      .from('user_credits')
      .insert({ user_id: pr.user_id, balance: credits, total_purchased: credits })

    if (insertErr) throw createError({ statusCode: 500, message: insertErr.message })
  }

  const newBalance = (existing?.balance || 0) + credits

  // Record transaction
  await supabase.from('credit_transactions').insert({
    user_id: pr.user_id,
    type: 'purchase',
    amount: credits,
    balance_after: newBalance,
    description: `Pembelian ${pr.package_label} (${credits.toLocaleString()} kredit) — ${pr.payment_method.toUpperCase()} — Dikonfirmasi admin`,
    metadata: {
      package_id: pr.package_id, price_idr: pr.amount_idr,
      payment_method: pr.payment_method, payment_request_id: pr.id,
      confirmed_by: admin.email,
    },
  })

  // Mark payment as confirmed
  await supabase
    .from('payment_requests')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', pr.id)

  return createSuccessResponse({
    payment_request_id: pr.id,
    user_id: pr.user_id,
    credits_added: credits,
    new_balance: newBalance,
    status: 'confirmed',
  })
})
