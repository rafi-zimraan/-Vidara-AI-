<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.6); backdrop-filter:blur(4px);"
      @click.self="$emit('close')">
      <div class="w-full max-w-lg rounded-2xl overflow-hidden"
        style="background:#0E0E1A; border:1px solid rgba(255,255,255,0.08);">

        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid rgba(255,255,255,0.06);">
          <h3 class="text-base font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Beli Kredit</h3>
          <button @click="$emit('close')" class="p-1 rounded-lg transition-colors hover:bg-white/5" style="color:rgba(236,236,245,0.4);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="flex px-6 pt-4 gap-1.5">
          <div v-for="i in 3" :key="i" class="flex-1 h-1 rounded-full transition-all"
            :style="`background:${step >= i ? 'linear-gradient(90deg,#8B5CF6,#22D3EE)' : 'rgba(255,255,255,0.08)'}`"></div>
        </div>

        <div class="px-6 py-3" style="background:rgba(139,92,246,0.04); border-bottom:1px solid rgba(139,92,246,0.08);">
          <p class="text-xs" style="color:rgba(236,236,245,0.4);">
            Saldo: <strong style="color:#8B5CF6;">{{ (currentBalance || 0).toLocaleString() }}</strong> kredit
          </p>
        </div>

        <!-- STEP 1: Pilih Paket -->
        <div v-show="step === 1" class="px-6 py-4 space-y-2.5 max-h-72 overflow-y-auto">
          <p class="text-xs font-semibold mb-2" style="color:rgba(236,236,245,0.6);">Pilih Paket Kredit</p>
          <p v-if="packagesLoading" class="text-xs text-center py-8" style="color:rgba(236,236,245,0.3);">Memuat paket...</p>
          <p v-else-if="packages.length === 0" class="text-xs text-center py-8" style="color:rgba(236,236,245,0.3);">Gagal memuat paket. Coba lagi nanti.</p>
          <button v-for="pkg in packages" :key="pkg.id"
            @click="selectedPkg = pkg"
            class="w-full flex items-center gap-4 p-3.5 rounded-xl text-left transition-all"
            :style="selectedPkg?.id === pkg.id
              ? 'background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3);'
              : 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);'">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-sm font-semibold" style="color:#ECECF5;">{{ pkg.label }}</span>
                <span v-if="pkg.popular" class="text-[10px] px-1.5 py-0.5 rounded font-semibold" style="background:linear-gradient(135deg,#8B5CF6,#22D3EE); color:#fff;">Best</span>
              </div>
              <p class="text-xs" style="color:rgba(236,236,245,0.45);">
                {{ (pkg.credits + pkg.bonus).toLocaleString() }} kredit
                <span v-if="pkg.bonus" style="color:#22D3EE;"> (+{{ pkg.bonus }} bonus)</span>
              </p>
              <p class="text-[10px] truncate mt-0.5" style="color:rgba(236,236,245,0.3);">{{ modalBlurb(pkg.id) }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-sm font-bold" style="color:#ECECF5;">Rp {{ formatPrice(pkg.price_idr) }}</p>
              <p class="text-[10px]" style="color:rgba(236,236,245,0.3);">{{ Math.round(pkg.price_idr / (pkg.credits + pkg.bonus)) }}/kredit</p>
            </div>
          </button>
        </div>

        <!-- STEP 2: Pilih Pembayaran -->
        <div v-show="step === 2" class="px-6 py-4 space-y-2.5">
          <div class="mb-2">
            <p class="text-xs font-semibold" style="color:rgba(236,236,245,0.6);">Pilih Bank Tujuan</p>
            <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.35);">
              Paket <strong style="color:#ECECF5;">{{ selectedPkg?.label }}</strong> —
              Rp {{ selectedPkg ? formatPrice(selectedPkg.price_idr) : '' }}
            </p>
          </div>
          <button v-for="pm in paymentMethods" :key="pm.id"
            @click="selectedPayment = pm.id"
            class="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
            :style="selectedPayment === pm.id
              ? 'background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3);'
              : 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);'">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              :style="`background:${pm.color}15;`">
              <span>{{ pm.icon }}</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold" style="color:#ECECF5;">{{ pm.name }}</p>
              <p class="text-xs" style="color:rgba(236,236,245,0.4);">{{ pm.type }}</p>
            </div>
            <svg v-if="selectedPayment === pm.id" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>

        <!-- STEP 3: Konfirmasi & Petunjuk Transfer -->
        <div v-show="step === 3" class="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
          <div class="rounded-xl p-4" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
            <p class="text-xs font-semibold mb-3" style="color:rgba(236,236,245,0.6);">Ringkasan Pesanan</p>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between"><span style="color:rgba(236,236,245,0.4);">Paket</span><span style="color:#ECECF5;">{{ selectedPkg?.label }}</span></div>
              <div class="flex justify-between"><span style="color:rgba(236,236,245,0.4);">Kredit</span><span style="color:#ECECF5;">{{ (selectedPkg?.credits || 0).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span style="color:rgba(236,236,245,0.4);">Total</span><span class="font-bold" style="color:#ECECF5;">Rp {{ selectedPkg ? formatPrice(selectedPkg.price_idr) : '' }}</span></div>
            </div>
          </div>

          <!-- Detail Rekening Tujuan -->
          <div class="rounded-xl p-4" :style="`background:${selectedPaymentInfo?.color}08; border:1px solid ${selectedPaymentInfo?.color}25;`">
            <p class="text-xs font-semibold mb-3" :style="`color:${selectedPaymentInfo?.color};`">Transfer ke rekening berikut:</p>
            <div class="space-y-2 text-xs">
              <div>
                <p class="text-[10px]" style="color:rgba(236,236,245,0.35);">Bank</p>
                <p class="text-sm font-bold" style="color:#ECECF5;">{{ selectedPaymentInfo?.name }}</p>
              </div>
              <div>
                <p class="text-[10px]" style="color:rgba(236,236,245,0.35);">Nomor Rekening</p>
                <p class="text-base font-bold tracking-wider" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5; letter-spacing:2px;">
                  {{ selectedPaymentInfo?.account_number }}
                </p>
              </div>
              <div>
                <p class="text-[10px]" style="color:rgba(236,236,245,0.35);">Atas Nama</p>
                <p class="text-sm font-medium" style="color:#ECECF5;">{{ selectedPaymentInfo?.account_name }}</p>
              </div>
            </div>
            <div class="mt-3 pt-3 text-center" style="border-top:1px solid rgba(255,255,255,0.06);">
              <p class="text-[10px]" style="color:rgba(236,236,245,0.35);">
                Transfer sebelum waktu habis. Konfirmasi via WhatsApp setelah transfer.
              </p>
            </div>
          </div>

          <!-- WhatsApp Konfirmasi -->
          <div class="rounded-xl p-4 text-center" style="background:rgba(37,211,102,0.06); border:1px solid rgba(37,211,102,0.15);">
            <p class="text-xs font-semibold mb-2" style="color:#25D366;">Setelah Transfer, Konfirmasi via WhatsApp</p>
            <p class="text-[11px] mb-3" style="color:rgba(236,236,245,0.45);">
              Kirim bukti transfer ke nomor WhatsApp admin. Kredit akan ditambahkan setelah dikonfirmasi.
            </p>
            <a :href="waLink" target="_blank"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style="background:#25D366; color:#fff;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Konfirmasi via WhatsApp
            </a>
          </div>

          <!-- Expiry Timer -->
          <div v-if="expiresAt" class="text-center">
            <p class="text-[10px] mb-1" style="color:rgba(236,236,245,0.3);">Batas pembayaran</p>
            <p class="text-sm font-bold" style="color:#f87171;">
              {{ expiryCountdown }}
            </p>
          </div>

          <p class="text-xs text-center px-3 py-2.5 rounded-xl"
            style="background:rgba(139,92,246,0.06); color:#a78bfa; border:1px solid rgba(139,92,246,0.12);">
            Pesanan #{{ result?.payment_request_id?.slice(0, 8) || '-' }} — Menunggu konfirmasi admin via WhatsApp
          </p>
        </div>

        <!-- Error -->
        <div class="px-6">
          <p v-if="error" class="text-xs mb-3 px-3 py-2 rounded-xl" style="background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.18);">{{ error }}</p>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 flex gap-3" style="border-top:1px solid rgba(255,255,255,0.06);">
          <button v-if="step > 1 && step < 3" @click="step--"
            class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:rgba(236,236,245,0.6);">
            Kembali
          </button>
          <button v-if="step < 3" @click="handleNext" :disabled="!canProceed || loading"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            :style="!canProceed || loading ? 'opacity:0.5; cursor:not-allowed; background:rgba(139,92,246,0.15); color:rgba(236,236,245,0.4);' : 'btn-primary'">
            {{ loading ? 'Memproses...' : step === 2 ? 'Buat Pesanan' : 'Lanjut' }}
          </button>
          <button v-if="step === 3" @click="emit('close')"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-primary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface CreditPackage { id: string; label: string; credits: number; bonus: number; price_idr: number; popular: boolean }

const props = defineProps<{ show: boolean; currentBalance?: number; preselect?: string }>()
const emit = defineEmits<{ close: [] }>()

const { getPackages, topup } = useCredits()
const packages = ref<CreditPackage[]>([])
const packagesLoading = ref(false)
const selectedPkg = ref<CreditPackage | null>(null)
const selectedPayment = ref<string | null>(null)
const step = ref(1)
const loading = ref(false)
const error = ref('')
const expiresAt = ref('')
const result = ref<any>(null)
const expiryCountdown = ref('')

const paymentMethods = [
  { id: 'bca', name: 'BCA', type: 'Transfer Bank', icon: '🏦', color: '#0066AE', account_number: '1711739942', account_name: 'Rafi Zimraan Arjuna Wijaya' },
  { id: 'mandiri', name: 'Mandiri', type: 'Transfer Bank', icon: '🏛️', color: '#003C71', account_number: '1370025938271', account_name: 'Rafi Zimraan Arjuna Wijaya' },
  { id: 'bsi', name: 'BSI', type: 'Transfer Bank', icon: '🏛️', color: '#004D40', account_number: '7220340648', account_name: 'Rafi Zimraan Arjuna Wijaya' },
  { id: 'ocbc', name: 'OCBC NISP', type: 'Transfer Bank', icon: '🏢', color: '#ED1C24', account_number: '5379408023264911', account_name: 'Rafi Zimraan Arjuna Wijaya' },
]

const selectedPaymentInfo = computed(() => paymentMethods.find(p => p.id === selectedPayment.value))

const waLink = computed(() => {
  if (!result.value) return '#'
  const msg = encodeURIComponent(result.value.wa_message || '')
  return `https://wa.me/${result.value.wa_admin.replace(/[^0-9]/g, '')}?text=${msg}`
})

const modalBlurbs: Record<string, string> = {
  hemat: 'Coba dulu — hasilkan beberapa video pendek',
  starter: 'Mulai produksi konten rutin',
  populer: 'Paling laris! Untuk kreator serius',
  pro: 'Untuk YouTuber profesional',
  studio: 'Skalakan produksi konten Anda',
  bisnis: 'Untuk tim marketing & agency',
  enterprise: 'Untuk production house & perusahaan',
}

function formatPrice(price: number) { return price.toLocaleString('id-ID') }
function modalBlurb(id: string) { return modalBlurbs[id] || '' }

const canProceed = computed(() => {
  if (step.value === 1) return !!selectedPkg.value
  if (step.value === 2) return !!selectedPayment.value
  return true
})

watch(() => props.show, async (val) => {
  if (val) {
    step.value = 1; selectedPkg.value = null; selectedPayment.value = null
    error.value = ''; result.value = null
    expiresAt.value = ''; expiryCountdown.value = ''
    packagesLoading.value = true
    try {
      packages.value = await getPackages()
      if (props.preselect) {
        const found = packages.value.find((p: any) => p.id === props.preselect)
        if (found) {
          selectedPkg.value = found
          step.value = 2
        }
      }
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat paket'
      packages.value = []
    } finally {
      packagesLoading.value = false
    }
  }
})

async function handleNext() {
  error.value = ''
  if (step.value === 1) { if (selectedPkg.value) step.value = 2; return }
  if (step.value === 2) {
    if (!selectedPkg.value || !selectedPayment.value) return
    loading.value = true
    try {
      const res: any = await topup(selectedPkg.value.id, selectedPayment.value)
      result.value = res
      expiresAt.value = res.expires_at
      step.value = 3
      startCountdown(res.expires_at)
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Gagal memproses'
    } finally { loading.value = false }
    return
  }
}

function startCountdown(expiryISO: string) {
  const expiry = new Date(expiryISO).getTime()
  const timer = setInterval(() => {
    const now = Date.now()
    const diff = expiry - now
    if (diff <= 0) {
      expiryCountdown.value = 'Kedaluwarsa'
      clearInterval(timer)
      return
    }
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    expiryCountdown.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, 1000)
}
</script>
