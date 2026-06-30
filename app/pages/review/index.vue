<template>
  <div>
    <!-- Header -->
    <div class="flex items-end justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Review & Edit</h1>
        <p class="text-sm mt-1" style="color:rgba(236,236,245,0.45);">Video yang sudah selesai digenerate dan siap ditinjau.</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex gap-1 p-1 rounded-xl" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
          <button v-for="f in filterOptions" :key="f.value" @click="activeFilter = f.value"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :style="activeFilter === f.value
              ? 'background:rgba(139,92,246,0.2); border:1px solid rgba(139,92,246,0.35); color:#C4B5FD;'
              : 'color:rgba(236,236,245,0.4); border:1px solid transparent;'">
            {{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="card overflow-hidden animate-pulse">
        <div style="aspect-ratio:16/9; background:rgba(255,255,255,0.04);"></div>
        <div class="p-4 space-y-2">
          <div class="h-3 rounded" style="background:rgba(255,255,255,0.06); width:80%;"></div>
          <div class="h-2 rounded" style="background:rgba(255,255,255,0.04); width:50%;"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredProjects.length === 0" class="py-20 text-center">
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.15);">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </div>
      <p class="text-lg font-semibold mb-2" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">
        Belum ada video untuk direview
      </p>
      <p class="text-sm mb-6" style="color:rgba(236,236,245,0.4);">
        Video akan muncul di sini setelah proses generasi selesai
      </p>
      <NuxtLink to="/generate" class="btn-primary text-sm px-6 py-3">
        Buat Video Baru
      </NuxtLink>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="project in filteredProjects"
        :key="project.id"
        :to="`/review/${project.id}`"
        class="card overflow-hidden hover:border-purple-500/30 transition-all block group"
      >
        <!-- Thumbnail Preview -->
        <div style="aspect-ratio:16/9; position:relative; overflow:hidden;"
          :style="`background:linear-gradient(135deg, hsl(${thumbHue(project.id)},35%,12%), hsl(${thumbHue(project.id)+20},25%,8%));`">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style="background:rgba(139,92,246,0.3); backdrop-filter:blur(4px);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <!-- Duration badge -->
          <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-bold"
            style="background:rgba(0,0,0,0.6); color:#ECECF5; backdrop-filter:blur(4px);">
            {{ durationLabel(project.target_duration_secs) }}
          </div>
          <!-- Status badge -->
          <div class="absolute top-2 left-2">
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :style="statusStyle(project.status)">
              {{ statusLabel(project.status) }}
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="p-4">
          <h3 class="text-sm font-semibold mb-1.5 line-clamp-2" style="color:#ECECF5; font-family:'Manrope',sans-serif;">
            {{ project.title }}
          </h3>
          <div class="flex items-center justify-between text-xs" style="color:rgba(236,236,245,0.35);">
            <div class="flex items-center gap-2">
              <span>{{ project.language?.toUpperCase() }}</span>
              <span>·</span>
              <span>{{ project.resolution }}</span>
            </div>
            <span>{{ formatDate(project.created_at) }}</span>
          </div>

          <!-- Action bar -->
          <div class="mt-3 pt-3 flex items-center justify-between"
            style="border-top:1px solid rgba(255,255,255,0.06);">
            <span class="text-xs" style="color:rgba(236,236,245,0.4);">Klik untuk review</span>
            <div class="flex items-center gap-1 text-xs font-medium" style="color:#8B5CF6;">
              Review
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const { projects, loading, fetchProjects } = useProjects()
const activeFilter = ref('semua')

const filterOptions = [
  { label: 'Semua', value: 'semua' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Draft', value: 'draft' },
]

const filteredProjects = computed(() => {
  const reviewable = projects.value.filter(p =>
    ['completed', 'draft', 'failed'].includes(p.status)
  )
  if (activeFilter.value === 'semua') return reviewable
  return reviewable.filter(p => p.status === activeFilter.value)
})

onMounted(() => fetchProjects())

function thumbHue(id: string) {
  return id.split('').reduce((a, c) => a + c.charCodeAt(0), 200) % 360
}

function durationLabel(secs?: number) {
  if (!secs) return '—'
  return `${Math.round(secs / 60)} mnt`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function statusStyle(status: string) {
  const map: Record<string, string> = {
    draft: 'background:rgba(0,0,0,0.5); color:rgba(236,236,245,0.7);',
    completed: 'background:rgba(34,197,94,0.8); color:#fff;',
    failed: 'background:rgba(239,68,68,0.8); color:#fff;',
  }
  return map[status] || 'background:rgba(0,0,0,0.5); color:rgba(236,236,245,0.7);'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: 'Draft', completed: 'Siap Review', failed: 'Gagal',
  }
  return map[status] || status
}
</script>
