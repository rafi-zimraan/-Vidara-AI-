export default defineEventHandler(async () => {
  const packages = [
    { id: 'hemat', label: 'Hemat', credits: 1000, bonus: 0, price_idr: 70000, popular: false },
    { id: 'starter', label: 'Starter', credits: 2000, bonus: 0, price_idr: 140000, popular: false },
    { id: 'populer', label: 'Populer', credits: 5000, bonus: 500, price_idr: 350000, popular: true },
    { id: 'pro', label: 'Pro', credits: 10000, bonus: 2000, price_idr: 700000, popular: false },
    { id: 'studio', label: 'Studio', credits: 20000, bonus: 5000, price_idr: 1400000, popular: false },
    { id: 'bisnis', label: 'Bisnis', credits: 50000, bonus: 15000, price_idr: 3500000, popular: false },
    { id: 'enterprise', label: 'Enterprise', credits: 100000, bonus: 35000, price_idr: 7000000, popular: false },
  ]

  return createSuccessResponse(packages)
})
