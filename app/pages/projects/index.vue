<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Proyek Saya</h1>
        <p class="text-sm mt-1" style="color:rgba(236,236,245,0.45);">Semua proyek video yang kamu buat.</p>
      </div>
      <NuxtLink to="/generate" class="btn-primary flex items-center gap-2 text-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Buat Proyek Baru
      </NuxtLink>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-1 p-1 rounded-xl mb-5 w-fit" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="activeFilter = filter.value"
        class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
        :style="activeFilter === filter.value
          ? 'background:rgba(139,92,246,0.2); border:1px solid rgba(139,92,246,0.35); color:#C4B5FD;'
          : 'color:rgba(236,236,245,0.4); border:1px solid transparent;'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-sm" style="color:rgba(236,236,245,0.4);">
      Memuat proyek...
    </div>

    <!-- Empty -->
    <div v-else-if="filteredProjects.length === 0" class="py-16 text-center">
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.15);">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5">
          <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
        </svg>
      </div>
      <p class="text-sm font-medium mb-1" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">
        Belum ada proyek
      </p>
      <p class="text-xs mb-4" style="color:rgba(236,236,245,0.4);">
        Mulai generate video AI pertamamu sekarang
      </p>
      <NuxtLink to="/generate" class="btn-primary text-sm">Mulai Generate</NuxtLink>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="project in filteredProjects"
        :key="project.id"
        :to="`/pipeline/${project.id}`"
        class="card p-5 hover:border-purple-500/30 transition-all block"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background:rgba(139,92,246,0.1);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.8">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" :style="statusStyle(project.status)">
            {{ statusLabel(project.status) }}
          </span>
        </div>
        <h3 class="text-sm font-semibold mb-1 line-clamp-2" style="color:#ECECF5; font-family:'Manrope',sans-serif;">
          {{ project.title }}
        </h3>
        <div class="flex items-center gap-3 mt-3 text-xs" style="color:rgba(236,236,245,0.35);">
          <span>{{ project.language?.toUpperCase() }}</span>
          <span>{{ project.resolution }}</span>
          <span class="ml-auto">{{ formatDate(project.created_at) }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const { projects, loading, fetchProjects } = useProjects()
const activeFilter = ref('all')

const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Generating', value: 'generating' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Gagal', value: 'failed' },
]

const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') return projects.value
  return projects.value.filter(p => p.status === activeFilter.value)
})

onMounted(() => fetchProjects())

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
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
