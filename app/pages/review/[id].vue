<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink :to="`/pipeline/${$route.params.id}`" class="p-2 rounded-lg hover:bg-white/5 transition-colors"
        style="color:rgba(236,236,245,0.5);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <h1 class="text-xl font-bold truncate" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
          {{ project?.title || 'Review & Edit' }}
        </h1>
        <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.4);">Tinjau dan sempurnakan video sebelum publish</p>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button @click="saveScript" :disabled="saving"
          class="px-4 py-2 rounded-xl text-sm font-medium"
          style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:rgba(236,236,245,0.7);">
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
        </button>
        <NuxtLink :to="`/publish/${$route.params.id}`" class="btn-primary text-sm px-4 py-2">
          Publish →
        </NuxtLink>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <div class="w-8 h-8 rounded-full mx-auto mb-3 animate-spin" style="border:2px solid rgba(139,92,246,0.2); border-top-color:#8B5CF6;"></div>
      <p class="text-xs" style="color:rgba(236,236,245,0.3);">Memuat skrip...</p>
    </div>

    <!-- Still generating -->
    <div v-else-if="project?.status !== 'completed'" class="card p-12 text-center">
      <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.2);">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
      </div>
      <h2 class="text-base font-bold mb-2" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Pipeline Masih Berjalan</h2>
      <p class="text-xs mb-5" style="color:rgba(236,236,245,0.4);">Tunggu hingga generasi selesai sebelum mereview.</p>
      <NuxtLink :to="`/pipeline/${$route.params.id}`" class="btn-primary px-6 py-2 text-sm">Lihat Pipeline</NuxtLink>
    </div>

    <template v-else>
      <div class="flex flex-col lg:flex-row gap-5">

        <!-- Left: Preview Placeholder + SEO Info -->
        <div class="flex-1">
          <!-- Video preview placeholder -->
          <div class="card overflow-hidden mb-4" style="aspect-ratio:16/9; position:relative;">
            <div class="absolute inset-0 flex items-center justify-center"
              style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.04));">
              <div class="text-center px-6">
                <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style="background:linear-gradient(135deg,#8B5CF6,#22D3EE);">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p class="text-sm font-medium mb-1" style="color:rgba(236,236,245,0.7); font-family:'Space Grotesk',sans-serif;">Video Siap</p>
                <p class="text-xs" style="color:rgba(236,236,245,0.35);">Preview rendering akan tersedia setelah integrasi media pipeline</p>
              </div>
            </div>
          </div>

          <!-- SEO Metadata (from Gemini step 17) -->
          <div v-if="seoMeta" class="card p-4 mb-4">
            <h3 class="text-sm font-semibold mb-3" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Metadata SEO (AI-generated)</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs mb-1" style="color:rgba(236,236,245,0.45);">Judul YouTube</label>
                <p class="text-sm font-medium" style="color:#ECECF5;">{{ seoMeta.title || project?.title }}</p>
              </div>
              <div v-if="seoMeta.description">
                <label class="block text-xs mb-1" style="color:rgba(236,236,245,0.45);">Deskripsi</label>
                <p class="text-xs leading-relaxed" style="color:rgba(236,236,245,0.6);">{{ seoMeta.description }}</p>
              </div>
              <div v-if="seoMeta.tags?.length">
                <label class="block text-xs mb-2" style="color:rgba(236,236,245,0.45);">Tags</label>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="tag in seoMeta.tags" :key="tag"
                    class="text-xs px-2 py-0.5 rounded-full"
                    style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.2); color:rgba(236,236,245,0.6);">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3">
            <div class="card p-3 text-center">
              <p class="text-xs mb-1" style="color:rgba(236,236,245,0.4);">Kata</p>
              <p class="text-lg font-bold" style="color:#8B5CF6; font-family:'Space Grotesk',sans-serif;">{{ wordCount }}</p>
            </div>
            <div class="card p-3 text-center">
              <p class="text-xs mb-1" style="color:rgba(236,236,245,0.4);">Durasi Est.</p>
              <p class="text-lg font-bold" style="color:#22D3EE; font-family:'Space Grotesk',sans-serif;">{{ durationLabel }}</p>
            </div>
            <div class="card p-3 text-center">
              <p class="text-xs mb-1" style="color:rgba(236,236,245,0.4);">Bahasa</p>
              <p class="text-lg font-bold" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">
                {{ project?.language === 'id' ? '🇮🇩 ID' : '🇺🇸 EN' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Script Editor -->
        <div class="lg:w-96">
          <div class="card sticky top-4">
            <div class="flex items-center justify-between px-4 pt-4 pb-3" style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <h3 class="text-sm font-semibold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Skrip Video</h3>
              <div class="flex items-center gap-2">
                <span class="text-xs" style="color:rgba(236,236,245,0.35);">{{ wordCount }} kata</span>
                <button @click="editMode = !editMode"
                  class="text-xs px-2.5 py-1 rounded-lg transition-colors"
                  :style="editMode
                    ? 'background:rgba(139,92,246,0.2); color:#8B5CF6; border:1px solid rgba(139,92,246,0.3);'
                    : 'background:rgba(255,255,255,0.05); color:rgba(236,236,245,0.5); border:1px solid rgba(255,255,255,0.08);'">
                  {{ editMode ? 'Preview' : 'Edit' }}
                </button>
              </div>
            </div>

            <!-- Script display / editor -->
            <div class="p-4" style="max-height:60vh; overflow-y:auto;">
              <div v-if="!script" class="text-center py-8">
                <p class="text-xs" style="color:rgba(236,236,245,0.3);">Skrip belum tersedia</p>
              </div>
              <template v-else>
                <textarea v-if="editMode"
                  v-model="editedScript"
                  class="input-dark resize-none text-xs leading-relaxed"
                  style="min-height:400px; font-family:'Manrope',sans-serif;"
                />
                <div v-else class="space-y-3">
                  <div v-for="(seg, i) in scriptSegments" :key="i"
                    class="rounded-lg p-3 text-xs leading-relaxed"
                    :style="`background:rgba(255,255,255,0.02); border-left:3px solid ${seg.color};`">
                    <p class="font-bold mb-1.5 text-xs tracking-wide"
                      :style="`color:${seg.color}; font-family:'Space Grotesk',sans-serif;`">
                      {{ seg.label }}
                    </p>
                    <p style="color:rgba(236,236,245,0.7);">{{ seg.text }}</p>
                  </div>
                </div>
              </template>
            </div>

            <!-- Save btn in edit mode -->
            <div v-if="editMode" class="px-4 pb-4">
              <button @click="saveScript" :disabled="saving"
                class="btn-primary w-full py-2 text-sm">
                {{ saving ? 'Menyimpan...' : 'Simpan Skrip' }}
              </button>
            </div>
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
const saving = ref(false)
const editMode = ref(false)
const project = ref<any>(null)
const script = ref<string>('')
const editedScript = ref('')
const wordCount = ref(0)

const seoMeta = computed(() => {
  const meta = project.value?.metadata
  if (!meta || meta.mock) return null
  return meta.title ? meta : null
})

const durationLabel = computed(() => {
  const secs = project.value?.target_duration_secs || 480
  const mins = Math.round(secs / 60)
  return `${mins} mnt`
})

const SEGMENT_COLORS = ['#8B5CF6', '#22D3EE', '#a78bfa', '#38bdf8', '#c4b5fd', '#67e8f9', '#818cf8']

const scriptSegments = computed(() => {
  if (!script.value) return []
  const lines = script.value.split('\n')
  const segments: { label: string; text: string; color: string }[] = []
  let currentLabel = ''
  let currentText: string[] = []
  let colorIdx = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      if (currentText.length) {
        segments.push({ label: currentLabel, text: currentText.join(' '), color: SEGMENT_COLORS[colorIdx % SEGMENT_COLORS.length] })
        colorIdx++
        currentText = []
      }
      currentLabel = trimmed.replace(/[\[\]]/g, '')
    } else {
      currentText.push(trimmed)
    }
  }
  if (currentText.length) {
    segments.push({ label: currentLabel || 'SKRIP', text: currentText.join(' '), color: SEGMENT_COLORS[colorIdx % SEGMENT_COLORS.length] })
  }
  return segments.length ? segments : [{ label: 'SKRIP', text: script.value, color: '#8B5CF6' }]
})

async function fetchScript() {
  loading.value = true
  try {
    const res: any = await $fetch(`/api/projects/${projectId.value}/script`, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    project.value = res.data.project
    if (res.data.script?.full_script) {
      script.value = res.data.script.full_script
      editedScript.value = res.data.script.full_script
      wordCount.value = res.data.script.word_count || script.value.split(/\s+/).length
    }
  } catch (e: any) {
    console.error('Failed to load script:', e)
  } finally {
    loading.value = false
  }
}

async function saveScript() {
  if (!editedScript.value) return
  saving.value = true
  try {
    await $fetch(`/api/projects/${projectId.value}/script`, {
      method: 'PATCH',
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      body: { full_script: editedScript.value },
    })
    script.value = editedScript.value
    wordCount.value = editedScript.value.split(/\s+/).length
    editMode.value = false
  } catch (e: any) {
    console.error('Save failed:', e)
  } finally {
    saving.value = false
  }
}

onMounted(fetchScript)
</script>
