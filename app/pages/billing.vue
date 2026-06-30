<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-1" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Billing & Paket</h1>
      <p class="text-sm" style="color:rgba(236,236,245,0.45);">Kelola langganan dan kredit generasi video kamu.</p>
    </div>

    <!-- Current Plan + Credits -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      <!-- Current Plan (real data from DB) -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-xs font-medium mb-0.5" style="color:rgba(236,236,245,0.4);">Paket Aktif</p>
            <div v-if="creditsLoading" class="h-7 w-20 rounded animate-pulse" style="background:rgba(255,255,255,0.06);"></div>
            <h2 v-else class="text-xl font-bold" style="font-family:'Space Grotesk',sans-serif; background:linear-gradient(135deg,#8B5CF6,#22D3EE); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
              {{ creditBalance?.plan_label || 'Free' }}
            </h2>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:rgba(34,197,94,0.12); color:#4ade80;">Aktif</span>
        </div>
        <div class="space-y-3 mb-4">
          <div>
            <div class="flex justify-between mb-1.5">
              <span class="text-xs" style="color:rgba(236,236,245,0.5);">Kredit/bulan</span>
              <span class="text-xs font-semibold" style="color:#ECECF5;">
                {{ creditsLoading ? '—' : (creditBalance?.monthly_credits || 0).toLocaleString() + ' kredit' }}
              </span>
            </div>
            <div class="h-1.5 rounded-full" style="background:rgba(255,255,255,0.08);">
              <div class="h-full rounded-full" style="background:linear-gradient(90deg,#8B5CF6,#22D3EE); opacity:0.35; width:100%;"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between mb-1.5">
              <span class="text-xs" style="color:rgba(236,236,245,0.5);">Kredit terpakai</span>
              <span class="text-xs font-semibold" style="color:#ECECF5;">{{ (creditBalance?.total_used || 0).toLocaleString() }} kredit</span>
            </div>
            <div class="h-1.5 rounded-full" style="background:rgba(255,255,255,0.08);">
              <div class="h-full rounded-full" :style="`width:${usedPercent}%; background:linear-gradient(90deg,#8B5CF6,#22D3EE);`"></div>
            </div>
          </div>
        </div>
        <p v-if="subscription?.plan_activated_at" class="text-xs" style="color:rgba(236,236,245,0.35);">
          Aktif sejak · <span style="color:#ECECF5;">{{ formatDate(subscription.plan_activated_at) }}</span>
        </p>
        <p v-else class="text-xs" style="color:rgba(236,236,245,0.35);">Diperbarui otomatis setiap bulan</p>
      </div>

      <!-- Credits (real data from DB) -->
      <div class="card p-5">
        <p class="text-xs font-medium mb-1" style="color:rgba(236,236,245,0.4);">Kredit Tersisa</p>
        <div class="flex items-end gap-2 mb-4">
          <p v-if="creditsLoading" class="text-4xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:rgba(236,236,245,0.2);">—</p>
          <p v-else class="text-4xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">{{ (creditBalance?.balance || 0).toLocaleString() }}</p>
          <p class="text-sm mb-1" style="color:rgba(236,236,245,0.4);">kredit</p>
        </div>
        <div class="h-2 rounded-full mb-3" style="background:rgba(255,255,255,0.08);">
          <div class="h-full rounded-full transition-all duration-700"
            :style="`width:${balancePercent}%; background:linear-gradient(90deg,#8B5CF6,#22D3EE);`">
          </div>
        </div>
        <p class="text-xs mb-4" style="color:rgba(236,236,245,0.4);">
          {{ (creditBalance?.balance || 0).toLocaleString() }} dari {{ (creditBalance?.monthly_credits || creditBalance?.total_purchased || 0).toLocaleString() }} kredit tersisa bulan ini
        </p>
        <button @click="showTopup = true" class="btn-primary w-full py-2 text-sm">Beli Kredit Tambahan</button>
      </div>
    </div>

    <!-- Pilih Paket Kredit (USD display, IDR payment) -->
    <h2 class="text-base font-semibold mb-4" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Pilih Paket Kredit</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="pkg in creditPackages" :key="pkg.id"
        class="card p-5 relative overflow-hidden transition-all hover:border-purple-500/30 flex flex-col"
        :style="pkg.popular ? 'border:1px solid rgba(139,92,246,0.35); background:rgba(139,92,246,0.04);' : ''">
        <div v-if="pkg.popular" class="absolute top-0 right-0">
          <span class="block text-xs font-semibold px-3 py-1 rounded-bl-xl" style="background:linear-gradient(135deg,#8B5CF6,#22D3EE); color:#fff;">Best</span>
        </div>
        <p class="text-sm font-bold mb-1" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">{{ pkg.label }}</p>
        <p class="text-3xl font-bold mb-3" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
          ${{ formatUSD(pkg.price_idr) }}
        </p>
        <ul class="space-y-2 flex-1">
          <li v-for="benefit in packageBenefits(pkg)" :key="benefit"
            class="flex items-start gap-2 text-xs leading-relaxed"
            :style="benefit.startsWith('+') ? 'color:#22D3EE;' : 'color:rgba(236,236,245,0.65);'">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" stroke-width="2.5" class="flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
            {{ benefit }}
          </li>
        </ul>
        <div class="mt-3 pt-3 text-center" style="border-top:1px solid rgba(255,255,255,0.06);">
          <button @click="openTopup(pkg.id)" class="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
            style="background:linear-gradient(135deg,#8B5CF6,#22D3EE); color:#fff;">
            Beli ${{ formatUSD(pkg.price_idr) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Riwayat Topup -->
    <div class="card mb-8">
      <div class="px-5 py-4" style="border-bottom:1px solid rgba(255,255,255,0.06);">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Riwayat Topup Kredit</h2>
          <button v-if="requests.length > 0" @click="fetchRequests()" class="text-[10px] px-2 py-1 rounded-lg" style="background:rgba(139,92,246,0.1); color:#8B5CF6;">Refresh</button>
        </div>
      </div>
      <div v-if="requestsLoading" class="px-5 py-8 text-center">
        <p class="text-xs" style="color:rgba(236,236,245,0.3);">Memuat...</p>
      </div>
      <div v-else-if="requests.length === 0" class="px-5 py-8 text-center">
        <p class="text-xs" style="color:rgba(236,236,245,0.3);">Belum ada riwayat topup kredit</p>
      </div>
      <div v-else class="space-y-2 px-5 py-3">
        <div v-for="req in requests" :key="req.id"
          class="flex items-center justify-between p-3 rounded-xl"
          :style="`background:${statusBg(req.status)}; border:1px solid ${statusBorder(req.status)};`">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-xs font-semibold truncate" style="color:#ECECF5;">{{ req.package_label }}</p>
              <span class="text-[10px] px-1.5 py-0.5 rounded" :style="`background:${statusBadgeBg(req.status)}; color:${statusBadgeColor(req.status)};`">
                {{ statusLabel(req.status) }}
              </span>
            </div>
            <p class="text-[10px] mt-0.5" style="color:rgba(236,236,245,0.35);">
              {{ req.payment_method?.toUpperCase() }} · Rp {{ req.amount_idr?.toLocaleString('id-ID') }} · {{ formatDate(req.created_at) }}
            </p>
          </div>
          <div class="text-right flex-shrink-0 ml-3">
            <p class="text-xs font-semibold" style="color:#ECECF5;">{{ (req.credits || 0).toLocaleString() }} kredit</p>
          </div>
        </div>
      </div>
    </div>

    <TopupModal :show="showTopup" :current-balance="creditBalance?.balance" :preselect="preselectPackage" @close="showTopup = false; preselectPackage = ''" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const { token } = useAuth()
const { balance: creditBalance, fetchBalance, getPackages, getPaymentRequests } = useCredits()
const creditsLoading = ref(true)
const showTopup = ref(false)
const requests = ref<any[]>([])
const requestsLoading = ref(false)

// subscription info is now embedded in creditBalance (plan, plan_label, monthly_credits)
const subscription = ref<{ plan_activated_at?: string | null } | null>(null)

async function fetchSubscription() {
  try {
    const res: any = await $fetch('/api/billing/subscription', {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    subscription.value = res.data
  } catch {
    subscription.value = null
  }
}

onMounted(async () => {
  try {
    await Promise.all([fetchBalance(), fetchRequests(), fetchSubscription(), fetchPackages()])
  } finally {
    creditsLoading.value = false
  }
})

async function fetchRequests() {
  requestsLoading.value = true
  try {
    requests.value = await getPaymentRequests()
  } finally {
    requestsLoading.value = false
  }
}

const usedPercent = computed(() => {
  const monthly = creditBalance.value?.monthly_credits || 0
  const used = creditBalance.value?.total_used || 0
  if (!monthly) return 0
  return Math.min(100, (used / monthly) * 100)
})

const balancePercent = computed(() => {
  const total = creditBalance.value?.monthly_credits || creditBalance.value?.total_purchased || 0
  const balance = creditBalance.value?.balance || 0
  if (!total) return 0
  return Math.min(100, (balance / total) * 100)
})

function statusLabel(s: string) {
  const map: Record<string, string> = { pending: 'Menunggu', confirmed: 'Lunas', expired: 'Kadaluarsa', cancelled: 'Batal' }
  return map[s] || s
}
function statusBg(s: string) {
  if (s === 'pending') return 'rgba(250,204,21,0.04)'
  if (s === 'confirmed') return 'rgba(34,197,94,0.04)'
  return 'rgba(239,68,68,0.04)'
}
function statusBorder(s: string) {
  if (s === 'pending') return 'rgba(250,204,21,0.12)'
  if (s === 'confirmed') return 'rgba(34,197,94,0.12)'
  return 'rgba(239,68,68,0.08)'
}
function statusBadgeBg(s: string) {
  if (s === 'pending') return 'rgba(250,204,21,0.12)'
  if (s === 'confirmed') return 'rgba(34,197,94,0.12)'
  return 'rgba(239,68,68,0.1)'
}
function statusBadgeColor(s: string) {
  if (s === 'pending') return '#eab308'
  if (s === 'confirmed') return '#4ade80'
  return '#f87171'
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const creditPackages = ref<any[]>([])
const preselectPackage = ref('')

const benefitsMap: Record<string, string[]> = {
  hemat: [
    '1.000 kredit',
    'Akses semua fitur AI generator',
    'Export video HD (1080p)',
    'Video tanpa watermark',
    'Support via email',
  ],
  starter: [
    '2.000 kredit',
    'Akses semua fitur AI generator',
    'Export video HD (1080p)',
    'Video tanpa watermark',
    'Support via email',
  ],
  populer: [
    '5.500 kredit (+500 bonus)',
    'Akses semua fitur AI generator',
    'Export video 4K UHD',
    'Video tanpa watermark',
    'Custom voice cloning',
    'Support prioritas',
  ],
  pro: [
    '12.000 kredit (+2.000 bonus)',
    'Akses semua fitur AI generator',
    'Export video 4K UHD',
    'Video tanpa watermark',
    'Custom voice cloning',
    'Support prioritas',
  ],
  studio: [
    '25.000 kredit (+5.000 bonus)',
    'Akses semua fitur AI generator',
    'Export video 4K UHD',
    'Video tanpa watermark',
    'Custom voice cloning',
    'Support prioritas',
  ],
  bisnis: [
    '65.000 kredit (+15.000 bonus)',
    'Akses semua fitur AI generator',
    'Export video 4K UHD',
    'Video tanpa watermark',
    'Custom voice cloning',
    'API access',
    'Dedicated support',
  ],
  enterprise: [
    '135.000 kredit (+35.000 bonus)',
    'Akses semua fitur AI generator',
    'Export video 4K UHD',
    'Video tanpa watermark',
    'Custom voice cloning',
    'API access',
    'Dedicated support & SLA',
    'Prioritas rendering queue',
  ],
}

function formatUSD(priceIdr: number) {
  const usd = Math.round(priceIdr / 17500)
  return usd.toLocaleString()
}

function packageBenefits(pkg: any): string[] {
  return benefitsMap[pkg.id] || [`${(pkg.credits + pkg.bonus).toLocaleString()} kredit`]
}

function openTopup(pkgId: string) {
  preselectPackage.value = pkgId
  showTopup.value = true
}

async function fetchPackages() {
  try {
    creditPackages.value = await getPackages()
  } catch {
    creditPackages.value = []
  }
}
</script>
