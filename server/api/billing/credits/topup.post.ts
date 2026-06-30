const CREDIT_PACKAGES = [
  { id: 'hemat', label: 'Hemat', credits: 1000, price_idr: 70000 },
  { id: 'starter', label: 'Starter', credits: 2000, price_idr: 140000 },
  { id: 'populer', label: 'Populer', credits: 5500, price_idr: 350000 },
  { id: 'pro', label: 'Pro', credits: 12000, price_idr: 700000 },
  { id: 'studio', label: 'Studio', credits: 25000, price_idr: 1400000 },
  { id: 'bisnis', label: 'Bisnis', credits: 65000, price_idr: 3500000 },
  { id: 'enterprise', label: 'Enterprise', credits: 135000, price_idr: 7000000 },
]

const PAYMENT_METHODS: Record<string, {
  bank: string; account_name: string; account_number: string
}> = {
  bca: { bank: 'BCA', account_name: 'Rafi Zimraan Arjuna Wijaya', account_number: '1711739942' },
  bsi: { bank: 'BSI', account_name: 'Rafi Zimraan Arjuna Wijaya', account_number: '7220340648' },
  mandiri: { bank: 'Mandiri', account_name: 'Rafi Zimraan Arjuna Wijaya', account_number: '1370025938271' },
  ocbc: { bank: 'OCBC NISP', account_name: 'Rafi Zimraan Arjuna Wijaya', account_number: '5379408023264911' },
}

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const { package_id, payment_method } = await readBody(event)

  if (!package_id || !payment_method) {
    throw createError({ statusCode: 422, message: 'Pilih paket dan metode pembayaran' })
  }

  const pkg = CREDIT_PACKAGES.find(p => p.id === package_id)
  if (!pkg) throw createError({ statusCode: 422, message: 'Paket tidak valid' })

  const method = PAYMENT_METHODS[payment_method]
  if (!method) throw createError({ statusCode: 422, message: 'Metode pembayaran tidak valid' })

  const supabase = useServerSupabase()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data: paymentReq, error: prError } = await supabase
    .from('payment_requests')
    .insert({
      user_id: user.id,
      package_id: pkg.id,
      package_label: pkg.label,
      credits: pkg.credits,
      amount_idr: pkg.price_idr,
      payment_method,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (prError) {
    throw createError({ statusCode: 500, message: prError.message })
  }

  return createSuccessResponse({
    payment_request_id: paymentReq.id,
    package: pkg.label,
    credits: pkg.credits,
    amount_idr: pkg.price_idr,
    payment: {
      bank: method.bank,
      account_name: method.account_name,
      account_number: method.account_number,
    },
    expires_at: expiresAt,
    wa_admin: '+62895428927710',
    wa_message: `Halo kak Rafi Zimraan Arjuna Wijaya, saya sudah transfer Rp${pkg.price_idr.toLocaleString('id-ID')} untuk paket ${pkg.label} (${pkg.credits.toLocaleString()} kredit). Mohon konfirmasi ya, terima kasih!`,
  })
})
