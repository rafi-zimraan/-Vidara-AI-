<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="py-16 text-center text-sm" style="color:rgba(236,236,245,0.4);">
      Memuat proyek...
    </div>

    <!-- Not found -->
    <div v-else-if="!project" class="py-16 text-center">
      <p class="text-sm" style="color:rgba(236,236,245,0.5);">Proyek tidak ditemukan.</p>
      <NuxtLink to="/projects" class="text-sm mt-3 inline-block" style="color:#8B5CF6;">← Kembali ke Proyek</NuxtLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 mb-8">
        <div>
          <NuxtLink to="/projects" class="text-xs mb-2 inline-flex items-center gap-1"
            style="color:rgba(236,236,245,0.4);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Kembali ke Proyek
          </NuxtLink>
          <h1 class="text-2xl font-bold mt-1" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
            {{ project.title }}
          </h1>
          <p class="text-sm mt-1" style="color:rgba(236,236,245,0.4);">Dibuat {{ formatDate(project.created_at) }}</p>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <span class="text-xs px-2.5 py-1 rounded-full font-medium" :style="statusStyle(project.status)">
            {{ statusLabel(project.status) }}
          </span>
          <NuxtLink :to="`/pipeline/${project.id}`" class="btn-primary text-sm px-4 py-2">
            Lihat Pipeline
          </NuxtLink>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Left -->
        <div class="lg:col-span-2 space-y-5">
          <div class="card p-5">
            <h2 class="text-sm font-semibold mb-3" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
              Prompt
            </h2>
            <p class="text-sm leading-relaxed" style="color:rgba(236,236,245,0.65);">
              {{ project.prompt_text || '—' }}
            </p>
          </div>

          <div v-if="project.description" class="card p-5">
            <h2 class="text-sm font-semibold mb-3" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
              Deskripsi
            </h2>
            <p class="text-sm leading-relaxed" style="color:rgba(236,236,245,0.65);">
              {{ project.description }}
            </p>
          </div>

          <div v-if="project.youtube_url" class="card p-5">
            <h2 class="text-sm font-semibold mb-3" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
              YouTube
            </h2>
            <a :href="project.youtube_url" target="_blank" rel="noopener" class="text-sm" style="color:#8B5CF6;">
              {{ project.youtube_url }}
            </a>
          </div>
        </div>

        <!-- Right: details -->
        <div class="space-y-5">
          <div class="card p-5">
            <h2 class="text-sm font-semibold mb-4" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
              Detail Proyek
            </h2>
            <dl class="space-y-3">
              <div v-for="detail in projectDetails" :key="detail.label" class="flex justify-between">
                <dt class="text-xs" style="color:rgba(236,236,245,0.4);">{{ detail.label }}</dt>
                <dd class="text-xs font-medium" style="color:#ECECF5;">{{ detail.value }}</dd>
              </div>
            </dl>
          </div>

          <button @click="handleDelete"
            class="w-full py-2.5 rounded-xl text-sm font-medium transition-colors card"
            style="color:rgba(239,68,68,0.7); border-color:rgba(239,68,68,0.15);">
            Hapus Proyek
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const route = useRoute()
const { getProject, deleteProject } = useProjects()
const project = ref<any>(null)
const loading = ref(true)

const projectDetails = computed(() => project.value ? [
  { label: 'Status', value: statusLabel(project.value.status) },
  { label: 'Bahasa', value: project.value.language?.toUpperCase() },
  { label: 'Durasi', value: project.value.target_duration_secs ? `${Math.round(project.value.target_duration_secs / 60)} menit` : '—' },
  { label: 'Resolusi', value: project.value.resolution },
  { label: 'Rasio', value: project.value.aspect_ratio },
] : [])

onMounted(async () => {
  try {
    project.value = await getProject(route.params.id as string)
  } catch {
    project.value = null
  } finally {
    loading.value = false
  }
})

async function handleDelete() {
  if (!window.confirm('Hapus proyek ini?')) return
  await deleteProject(route.params.id as string)
  navigateTo('/projects')
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function statusStyle(status: string) {
  const map: Record<string, string> = {
    draft: 'background:rgba(255,255,255,0.06); color:rgba(236,236,245,0.6);',
    queued: 'background:rgba(234,179,8,0.12); color:#fbbf24;',
    generating: 'background:rgba(34,211,238,0.12); color:#22D3EE;',
    completed: 'background:rgba(34,197,94,0.12); color:#4ade80;',
    failed: 'background:rgba(239,68,68,0.12); color:#f87171;',
    published: 'background:rgba(139,92,246,0.12); color:#8B5CF6;',
  }
  return map[status] || 'background:rgba(255,255,255,0.06); color:rgba(236,236,245,0.6);'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: 'Draft', queued: 'Antrian', generating: 'Generating',
    completed: 'Selesai', failed: 'Gagal', published: 'Published',
  }
  return map[status] || status
}
</script>
