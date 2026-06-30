<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/dashboard" class="p-2 rounded-lg hover:bg-white/5 transition-colors"
        style="color:rgba(236,236,245,0.5);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <h1 class="text-xl font-bold truncate" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
          {{ project?.title || 'Memproses Video...' }}
        </h1>
        <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.4);">ID: {{ $route.params.id }}</p>
      </div>
      <div v-if="projectStatus" class="ml-auto flex items-center gap-2">
        <span class="text-xs px-2.5 py-1 rounded-full" :style="statusBadgeStyle(projectStatus)">
          {{ statusLabel(projectStatus) }}
        </span>
      </div>
    </div>

    <!-- Redirect banner saat selesai -->
    <div v-if="redirecting" class="card p-4 mb-6 flex items-center gap-4"
      style="border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05);">
      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background:rgba(34,197,94,0.15);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold" style="color:#4ade80; font-family:'Space Grotesk',sans-serif;">Video Berhasil Dibuat!</p>
        <p class="text-xs" style="color:rgba(236,236,245,0.5);">Mengarahkan ke halaman review...</p>
      </div>
      <NuxtLink :to="`/review/${$route.params.id}`" class="btn-primary px-4 py-2 text-xs flex-shrink-0">Review Sekarang</NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="w-8 h-8 rounded-full mx-auto mb-3 animate-spin" style="border:2px solid rgba(139,92,246,0.2); border-top-color:#8B5CF6;"></div>
      <p class="text-xs" style="color:rgba(236,236,245,0.3);">Memuat pipeline...</p>
    </div>

    <div v-else-if="error" class="card p-8 text-center">
      <p class="text-sm" style="color:#f87171;">{{ error }}</p>
      <button @click="fetchStatus" class="mt-3 text-xs px-4 py-2 rounded-lg" style="background:rgba(139,92,246,0.1); color:#8B5CF6;">Coba Lagi</button>
    </div>

    <template v-else>
      <!-- Draft state: show start button -->
      <div v-if="projectStatus === 'draft'" class="card p-12 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.2);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5">
            <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
          </svg>
        </div>
        <h2 class="text-lg font-bold mb-2" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Pipeline Siap Dimulai</h2>
        <p class="text-xs mb-6" style="color:rgba(236,236,245,0.4);">
          {{ project?.title || 'Proyek ini' }} akan diproses oleh 18 agen AI secara berurutan.
        </p>
        <button @click="startGeneration" :disabled="generating"
          class="px-8 py-3 rounded-xl text-sm font-semibold btn-primary"
          :style="generating ? 'opacity:0.5; cursor:not-allowed;' : ''">
          {{ generating ? 'Memulai...' : 'Mulai Generate Video' }}
        </button>
      </div>

      <!-- Pipeline Running / Completed / Failed -->
      <div v-else class="flex flex-col lg:flex-row gap-5">
        <div class="flex-1">
          <div class="card overflow-hidden mb-4" style="aspect-ratio:16/9; position:relative;">
            <div class="absolute inset-0 flex items-center justify-center"
              style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.04));">
              <div class="text-center">
                <div v-if="projectStatus === 'completed'" class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style="background:rgba(34,197,94,0.15);">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div v-else class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style="background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.3);">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5">
                    <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                  </svg>
                </div>
                <p class="text-sm font-medium" style="color:rgba(236,236,245,0.6); font-family:'Manrope',sans-serif;">
                  {{ projectStatus === 'completed' ? 'Video siap di-review!' : 'Preview tersedia setelah rendering' }}
                </p>
                <NuxtLink v-if="projectStatus === 'completed'" :to="`/review/${$route.params.id}`"
                  class="inline-block mt-3 px-5 py-2 rounded-xl text-xs font-semibold btn-primary">
                  Review Video
                </NuxtLink>
              </div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1" style="background:rgba(255,255,255,0.05);">
              <div class="h-full transition-all duration-700"
                :style="`width:${progress}%; background:linear-gradient(90deg,#8B5CF6,#22D3EE);`"></div>
            </div>
          </div>

          <div class="card p-4">
            <h3 class="text-sm font-semibold mb-4" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
              18 Agen AI
            </h3>
            <!-- Placeholder steps while tasks not yet loaded -->
            <div v-if="tasks.length === 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div v-for="(step, i) in defaultSteps" :key="i"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);">
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style="background:rgba(255,255,255,0.04);">
                  <span class="text-xs" style="color:rgba(236,236,245,0.2);">{{ i + 1 }}</span>
                </div>
                <p class="text-xs truncate" style="color:rgba(236,236,245,0.3);">{{ step }}</p>
              </div>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div v-for="(step, i) in tasks" :key="i"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all"
                :style="stepStyle(step.status)">
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  :class="step.status === 'running' ? 'animate-pulse-glow' : ''"
                  :style="dotStyle(step.status)">
                  <svg v-if="step.status === 'completed'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                  <svg v-else-if="step.status === 'running'" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
                  <span v-else class="text-xs" style="color:rgba(236,236,245,0.2);">{{ i + 1 }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-medium truncate" :style="stepTextStyle(step.status)">{{ step.step_name }}</p>
                  <p v-if="step.status === 'running'" class="text-xs" style="color:#22D3EE;">Berjalan...</p>
                  <p v-else-if="step.status === 'completed'" class="text-xs" style="color:rgba(236,236,245,0.3);">Selesai</p>
                  <p v-else-if="step.status === 'failed'" class="text-xs" style="color:#f87171;">Gagal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:w-64 space-y-4 flex-shrink-0" style="align-self:flex-start;">
          <div class="card p-5 flex flex-col items-center">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#g)" stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="`${progress * 3.14} ${314 - progress * 3.14}`"
                stroke-dashoffset="78.5"
                style="transition: stroke-dasharray 0.7s ease;"/>
              <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#8B5CF6"/>
                  <stop offset="100%" stop-color="#22D3EE"/>
                </linearGradient>
              </defs>
              <text x="60" y="56" text-anchor="middle" fill="#ECECF5" font-size="22" font-family="Space Grotesk" font-weight="700">{{ doneCount }}</text>
              <text x="60" y="72" text-anchor="middle" fill="rgba(236,236,245,0.4)" font-size="11" font-family="Manrope">dari 18</text>
            </svg>
            <p class="text-sm font-semibold mt-2" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
              {{ currentStepName || 'Selesai' }}
            </p>
            <p class="text-xs mt-1" style="color:rgba(236,236,245,0.4);">
              {{ projectStatus === 'completed' ? 'Video siap' : projectStatus === 'failed' ? 'Gagal' : 'Sedang berjalan' }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="card p-3 text-center">
              <p class="text-xs mb-1" style="color:rgba(236,236,245,0.4);">Progress</p>
              <p class="text-base font-bold" style="color:#8B5CF6; font-family:'Space Grotesk',sans-serif;">
                {{ progress }}%
              </p>
            </div>
            <div class="card p-3 text-center">
              <p class="text-xs mb-1" style="color:rgba(236,236,245,0.4);">Elapsed</p>
              <p class="text-base font-bold" style="color:#22D3EE; font-family:'Space Grotesk',sans-serif;">
                {{ elapsed }}
              </p>
            </div>
          </div>

          <div v-if="projectStatus === 'completed'" class="card p-4 space-y-2">
            <NuxtLink :to="`/review/${$route.params.id}`"
              class="block w-full py-2.5 rounded-xl text-sm font-semibold text-center btn-primary">
              Review & Edit
            </NuxtLink>
            <NuxtLink :to="`/publish/${$route.params.id}`"
              class="block w-full py-2.5 rounded-xl text-sm font-semibold text-center"
              style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:rgba(236,236,245,0.7);">
              Publikasikan
            </NuxtLink>
          </div>

          <div v-else-if="projectStatus === 'failed'" class="card p-4">
            <p class="text-xs text-center" style="color:#f87171;">Pipeline gagal. Coba buat ulang proyek.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const route = useRoute()
const { token } = useAuth()
const projectId = computed(() => route.params.id as string)

const loading = ref(true)
const error = ref('')
const generating = ref(false)
const project = ref<any>(null)
const tasks = ref<any[]>([])
const projectStatus = ref('')
const progress = ref(0)
const elapsed = ref('00:00')
const startTime = ref(Date.now())
const redirecting = ref(false)

const defaultSteps = [
  'Analisis Topik', 'Riset Fakta', 'Fact-Check', 'Outline Skrip', 'Penulisan Skrip',
  'Review Skrip', 'Text-to-Speech', 'Transkripsi', 'Subtitle', 'Cari Aset Visual',
  'Generate Gambar AI', 'Sinkronisasi Audio', 'Efek Transisi', 'Render Video',
  'Quality Check', 'Generate Thumbnail', 'Metadata SEO', 'Siap Publikasi',
]

const doneCount = computed(() => tasks.value.filter(t => t.status === 'completed').length)
const currentStepName = computed(() => tasks.value.find(t => t.status === 'running')?.step_name || '')

let pollTimer: ReturnType<typeof setInterval> | null = null
let elapsedTimer: ReturnType<typeof setInterval> | null = null

async function fetchStatus() {
  try {
    const res: any = await $fetch(`/api/projects/${projectId.value}/status`, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    project.value = res.data.project
    tasks.value = res.data.tasks
    projectStatus.value = res.data.project.status
    progress.value = res.data.progress
    error.value = ''

    if (projectStatus.value === 'completed' && !redirecting.value) {
      redirecting.value = true
      stopPolling()
      setTimeout(() => navigateTo(`/review/${projectId.value}`), 3000)
    } else if (['failed', 'draft'].includes(projectStatus.value)) {
      stopPolling()
    } else if (!['completed'].includes(projectStatus.value)) {
      startPolling()
    }
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat pipeline'
  } finally {
    loading.value = false
  }
}

function startPolling() {
  if (pollTimer) return
  pollTimer = setInterval(async () => {
    await fetchStatus()
  }, 3000)
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

async function startGeneration() {
  generating.value = true
  try {
    await $fetch(`/api/projects/${projectId.value}/generate`, {
      method: 'POST',
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    await fetchStatus()
    startTime.value = Date.now()
    startElapsedTimer()
  } catch (e: any) {
    error.value = e?.message || 'Gagal memulai pipeline'
  } finally {
    generating.value = false
  }
}

function startElapsedTimer() {
  if (elapsedTimer) return
  elapsedTimer = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime.value) / 1000)
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    elapsed.value = `${m}:${s}`
  }, 1000)
}

onMounted(() => {
  fetchStatus()
  startTime.value = Date.now()
  startElapsedTimer()
})

onUnmounted(() => {
  stopPolling()
  if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }
})

function stepStyle(status: string) {
  if (status === 'running') return 'background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.2);'
  if (status === 'completed') return 'background:rgba(34,197,94,0.04); border:1px solid rgba(34,197,94,0.1);'
  if (status === 'failed') return 'background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15);'
  return 'background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);'
}

function dotStyle(status: string) {
  if (status === 'completed') return 'background:rgba(34,197,94,0.2); color:#4ade80;'
  if (status === 'running') return 'background:rgba(139,92,246,0.3); color:#8B5CF6;'
  if (status === 'failed') return 'background:rgba(239,68,68,0.2); color:#f87171;'
  return 'background:rgba(255,255,255,0.04);'
}

function stepTextStyle(status: string) {
  if (status === 'completed') return 'color:#4ade80;'
  if (status === 'running') return 'color:#ECECF5;'
  if (status === 'failed') return 'color:#f87171;'
  return 'color:rgba(236,236,245,0.35);'
}

function statusBadgeStyle(status: string) {
  if (status === 'completed') return 'background:rgba(34,197,94,0.12); color:#4ade80; border:1px solid rgba(34,197,94,0.2);'
  if (status === 'failed') return 'background:rgba(239,68,68,0.1); color:#f87171; border:1px solid rgba(239,68,68,0.15);'
  if (status === 'draft') return 'background:rgba(236,236,245,0.05); color:rgba(236,236,245,0.4); border:1px solid rgba(236,236,245,0.1);'
  return 'background:rgba(34,211,238,0.1); color:#22D3EE; border:1px solid rgba(34,211,238,0.2);'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: 'Draf', queued: 'Antre', generating_script: 'Nulis Skrip',
    generating_voiceover: 'Voice Over', generating_subtitles: 'Subtitle',
    generating_footage: 'Generate Visual', rendering: 'Render',
    completed: 'Selesai', failed: 'Gagal', published: 'Terpublikasi',
  }
  return map[status] || status
}
</script>
