export const PLAN_MONTHLY_CREDITS: Record<string, number> = {
  free: 500,
  pro: 5000,
  business: 20000,
  enterprise: 100000,
}

export const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
}

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const supabase = useServerSupabase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, plan_activated_at, plan_expires_at')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan as string) || 'free'
  const monthly_credits = PLAN_MONTHLY_CREDITS[plan] ?? 500

  const plan_expires_at = profile?.plan_expires_at ?? null
  const is_active = !plan_expires_at || new Date(plan_expires_at) > new Date()

  return createSuccessResponse({
    plan,
    label: PLAN_LABELS[plan] ?? plan,
    monthly_credits,
    plan_activated_at: profile?.plan_activated_at ?? null,
    plan_expires_at,
    is_active: plan === 'free' ? true : is_active,
  })
})
