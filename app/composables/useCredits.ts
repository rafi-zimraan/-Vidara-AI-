interface CreditBalance {
  balance: number
  total_purchased: number
  total_used: number
  total_expired: number
  plan: string
  plan_label: string
  monthly_credits: number
}

interface CreditPackage {
  id: string
  label: string
  credits: number
  bonus: number
  price_idr: number
  popular: boolean
}

export const useCredits = () => {
  const supabase = useSupabaseClient()
  const { token } = useAuth()

  const balance = useState<CreditBalance | null>('credit-balance', () => null)
  const loading = useState('credit-loading', () => false)

  const _fetch = (url: string, opts?: any) =>
    $fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        ...opts?.headers,
      },
    })

  async function fetchBalance() {
    loading.value = true
    try {
      const res: any = await _fetch('/api/billing/credits')
      balance.value = res.data
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function getPackages(): Promise<CreditPackage[]> {
    const res: any = await _fetch('/api/billing/credits/packages')
    return res.data
  }

  async function topup(packageId: string, paymentMethod?: string) {
    loading.value = true
    try {
      const res: any = await _fetch('/api/billing/credits/topup', {
        method: 'POST',
        body: { package_id: packageId, payment_method: paymentMethod || 'bca' },
      })
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function getPaymentRequests(): Promise<any[]> {
    const res: any = await _fetch('/api/billing/credits/requests')
    return res.data || []
  }

  return { balance, loading, fetchBalance, getPackages, topup, getPaymentRequests }
}
