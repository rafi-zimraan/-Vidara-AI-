<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
        Generate Video
      </h1>
      <p class="text-sm mt-1" style="color:rgba(236,236,245,0.45);">
        Tulis topik atau ide, AI akan menyiapkan semua yang kamu butuhkan
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-5">

      <!-- Left: Input Area -->
      <div class="flex-1" style="flex:1.6;">

        <!-- Prompt -->
        <div class="card p-5 mb-4">
          <label class="block text-sm font-semibold mb-3" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
            Topik atau Ide Video
          </label>
          <textarea
            v-model="form.prompt"
            rows="5"
            placeholder="Contoh: Buat video dokumenter 10 menit tentang sejarah Kerajaan Majapahit yang menarik untuk audiens muda Indonesia..."
            class="input-dark resize-none"
            style="min-height:140px;"
          />
          <!-- Suggestion chips -->
          <div class="flex flex-wrap gap-2 mt-3">
            <button
              v-for="chip in suggestions"
              :key="chip"
              type="button"
              @click="form.prompt = chip"
              class="text-xs px-3 py-1.5 rounded-full transition-colors"
              style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.18); color:rgba(236,236,245,0.6); font-family:'Manrope',sans-serif;"
            >
              {{ chip }}
            </button>
          </div>
        </div>

        <!-- Konfigurasi -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold mb-4" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
            Konfigurasi
          </h3>

          <!-- Duration -->
          <div class="mb-4">
            <label class="block text-xs font-medium mb-2" style="color:rgba(236,236,245,0.5);">Durasi</label>
            <div class="flex gap-2">
              <button
                v-for="d in durations"
                :key="d.value"
                type="button"
                @click="form.target_duration_seconds = d.value"
                class="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                :style="form.target_duration_seconds === d.value
                  ? 'background:rgba(139,92,246,0.2); border:1px solid rgba(139,92,246,0.5); color:#8B5CF6;'
                  : 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:rgba(236,236,245,0.5);'"
              >
                {{ d.label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <!-- Language -->
            <div>
              <label class="block text-xs font-medium mb-2" style="color:rgba(236,236,245,0.5);">Bahasa</label>
              <select v-model="form.language" class="input-dark">
                <option value="id">🇮🇩 Bahasa Indonesia</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
            <!-- Voice -->
            <div>
              <label class="block text-xs font-medium mb-2" style="color:rgba(236,236,245,0.5);">Suara</label>
              <select v-model="form.voice" class="input-dark">
                <option value="arjuna">Arjuna · Epik</option>
                <option value="sinta">Sinta · Hangat</option>
                <option value="bima">Bima · Profesional</option>
                <option value="dewi">Dewi · Cerah</option>
              </select>
            </div>
            <!-- Resolution -->
            <div>
              <label class="block text-xs font-medium mb-2" style="color:rgba(236,236,245,0.5);">Resolusi</label>
              <select v-model="form.resolution" class="input-dark">
                <option value="1080p">1080p HD</option>
                <option value="720p">720p</option>
              </select>
            </div>
            <!-- Aspect Ratio -->
            <div>
              <label class="block text-xs font-medium mb-2" style="color:rgba(236,236,245,0.5);">Rasio</label>
              <select v-model="form.aspect_ratio" class="input-dark">
                <option value="16:9">16:9 YouTube</option>
                <option value="9:16">9:16 Shorts</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>
          </div>

          <!-- Niche Tags -->
          <div>
            <label class="block text-xs font-medium mb-2" style="color:rgba(236,236,245,0.5);">Niche / Kategori</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="niche in niches"
                :key="niche"
                type="button"
                @click="toggleNiche(niche)"
                class="text-xs px-3 py-1.5 rounded-full transition-all"
                :style="form.niches.includes(niche)
                  ? 'background:linear-gradient(135deg,rgba(139,92,246,0.3),rgba(34,211,238,0.15)); border:1px solid rgba(139,92,246,0.5); color:#ECECF5;'
                  : 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:rgba(236,236,245,0.45);'"
              >
                {{ niche }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Estimasi -->
      <div class="lg:w-72 lg:sticky lg:top-6 space-y-4" style="align-self:flex-start;">

        <!-- Estimasi Generasi -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold mb-4" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
            Estimasi Generasi
          </h3>

          <div class="space-y-3 mb-5">
            <div class="flex justify-between text-xs">
              <span style="color:rgba(236,236,245,0.5);">Durasi video</span>
              <span style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">
                {{ durationLabel }}
              </span>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color:rgba(236,236,245,0.5);">Agen AI</span>
              <span style="color:#ECECF5;">18 agen</span>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color:rgba(236,236,245,0.5);">Estimasi waktu</span>
              <span style="color:#22D3EE;">~{{ estimatedTime }} menit</span>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:12px;">
              <div class="flex justify-between text-sm">
                <span style="color:rgba(236,236,245,0.6);">Kredit digunakan</span>
                <span class="font-bold" style="color:#8B5CF6; font-family:'Space Grotesk',sans-serif;">
                  {{ creditCost }} kredit
                </span>
              </div>
            </div>
          </div>

          <button
            @click="handleGenerate"
            :disabled="!form.prompt.trim() || generating"
            class="btn-primary w-full py-3 text-sm"
            :style="generating ? 'opacity:0.7; cursor:wait;' : ''"
          >
            <span v-if="generating" class="flex items-center justify-center gap-2">
              <svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Memulai Pipeline...
            </span>
            <span v-else>Mulai Generate Video</span>
          </button>

          <p v-if="error" class="text-xs mt-2 px-3 py-2 rounded-lg" style="background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.15);">
            {{ error }}
          </p>
        </div>

        <!-- Info -->
        <div class="card p-4" style="background:rgba(34,211,238,0.03); border-color:rgba(34,211,238,0.1);">
          <div class="flex gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" stroke-width="2" class="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <div>
              <p class="text-xs font-medium mb-1" style="color:#22D3EE; font-family:'Space Grotesk',sans-serif;">Fact-check otomatis</p>
              <p class="text-xs" style="color:rgba(236,236,245,0.4); line-height:1.5;">
                18 agen AI akan memverifikasi fakta, menulis skrip, generate visual, dan menyiapkan publikasi otomatis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const { createProject } = useProjects()
const generating = ref(false)

const form = reactive({
  prompt: '',
  target_duration_seconds: 480,
  language: 'id',
  voice: 'arjuna',
  resolution: '1080p',
  aspect_ratio: '16:9',
  niches: [] as string[],
})

const suggestions = [
  'Sejarah Kerajaan Majapahit',
  'Cara Investasi Saham untuk Pemula',
  'Rahasia Produktivitas Orang Sukses',
  'Misteri Laut Indonesia',
]

const durations = [
  { label: '6 menit', value: 360 },
  { label: '8 menit', value: 480 },
  { label: '15 menit', value: 900 },
  { label: '20 menit', value: 1200 },
]

const niches = ['Edukasi', 'Sejarah', 'Teknologi', 'Bisnis', 'Kesehatan', 'Hiburan', 'Sains', 'Travel']

const durationLabel = computed(() => {
  const d = durations.find(d => d.value === form.target_duration_seconds)
  return d?.label || '8 menit'
})

const estimatedTime = computed(() => {
  const base = form.target_duration_seconds / 60
  return Math.ceil(base * 1.5 + 5)
})

const creditCost = computed(() => {
  const base = Math.ceil(form.target_duration_seconds / 60) * 10
  return form.resolution === '1080p' ? base + 20 : base
})

function toggleNiche(niche: string) {
  const idx = form.niches.indexOf(niche)
  if (idx >= 0) form.niches.splice(idx, 1)
  else form.niches.push(niche)
}

const { token } = useAuth()
const error = ref('')

async function handleGenerate() {
  if (!form.prompt.trim()) return
  generating.value = true
  error.value = ''
  try {
    const project = await createProject({
      title: form.prompt.slice(0, 80),
      prompt: form.prompt,
      target_duration_seconds: form.target_duration_seconds,
      language: form.language,
      aspect_ratio: form.aspect_ratio,
      resolution: form.resolution,
    })
    // Trigger pipeline generation immediately
    await $fetch(`/api/projects/${project.id}/generate`, {
      method: 'POST',
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    navigateTo(`/pipeline/${project.id}`)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal memulai generasi'
    generating.value = false
  }
}
</script>
