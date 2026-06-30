<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
          Dashboard
        </h1>
        <p class="text-sm mt-1" style="color:rgba(236,236,245,0.45);">
          Selamat datang kembali, {{ user?.name || 'Creator' }}
        </p>
      </div>
      <NuxtLink to="/generate"
        class="btn-primary flex items-center gap-2 text-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Generate Video
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="card p-5">
        <p class="text-xs font-medium mb-1" style="color:rgba(236,236,245,0.45); font-family:'Manrope',sans-serif;">
          {{ stat.label }}
        </p>
        <p class="text-2xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
          {{ stat.value }}
        </p>
        <p class="text-xs mt-1" :style="`color:${stat.trend >= 0 ? '#22D3EE' : '#f87171'}`">
          {{ stat.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}% bulan ini
        </p>
      </div>
    </div>

    <!-- Recent Projects -->
    <div class="card">
      <div class="px-5 py-4" style="border-bottom:1px solid rgba(255,255,255,0.06);">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
            Proyek Terbaru
          </h2>
          <NuxtLink to="/projects" class="text-xs" style="color:#8B5CF6;">Lihat semua</NuxtLink>
        </div>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm" style="color:rgba(236,236,245,0.4);">
        Memuat...
      </div>

      <div v-else-if="projects.length === 0" class="p-12 text-center">
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
          Mulai generate video AI pertamamu
        </p>
        <NuxtLink to="/generate" class="btn-primary text-sm">
          Mulai Generate
        </NuxtLink>
      </div>

      <div v-else>
        <NuxtLink
          v-for="project in projects.slice(0, 8)"
          :key="project.id"
          :to="`/pipeline/${project.id}`"
          class="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
          style="border-bottom:1px solid rgba(255,255,255,0.04);"
        >
          <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style="background:rgba(139,92,246,0.1);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" style="color:#ECECF5; font-family:'Manrope',sans-serif;">
              {{ project.title }}
            </p>
            <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.35);">
              {{ formatDate(project.created_at) }}
            </p>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" :style="statusStyle(project.status)">
            {{ statusLabel(project.status) }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const { user } = useAuth()
const { projects, loading, fetchProjects } = useProjects()

const stats = computed(() => [
  { label: 'Total Proyek', value: projects.value.length, trend: 12 },
  { label: 'Selesai', value: projects.value.filter(p => p.status === 'completed').length, trend: 8 },
  { label: 'Sedang Generate', value: projects.value.filter(p => p.status === 'generating').length, trend: 0 },
  { label: 'Draft', value: projects.value.filter(p => p.status === 'draft').length, trend: -3 },
])

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
