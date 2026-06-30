<template>
  <div>
    <!-- Header -->
    <div class="flex items-end justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Publish</h1>
        <p class="text-sm mt-1" style="color:rgba(236,236,245,0.45);">Video yang siap dipublikasikan atau sudah live di YouTube.</p>
      </div>
      <NuxtLink to="/review" class="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors"
        style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:rgba(236,236,245,0.7);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Review Video Dulu
      </NuxtLink>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="card p-4 text-center">
        <p class="text-xs mb-1" style="color:rgba(236,236,245,0.4); font-family:'Manrope',sans-serif;">{{ stat.label }}</p>
        <p class="text-xl font-bold" style="font-family:'Space Grotesk',sans-serif;" :style="`color:${stat.color};`">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="card p-5 animate-pulse">
        <div class="flex items-center gap-4">
          <div class="w-20 h-12 rounded-lg flex-shrink-0" style="background:rgba(255,255,255,0.04);"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 rounded" style="background:rgba(255,255,255,0.06); width:70%;"></div>
            <div class="h-2 rounded" style="background:rgba(255,255,255,0.04); width:40%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="publishableProjects.length === 0" class="py-20 text-center">
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.15);">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
      </div>
      <p class="text-lg font-semibold mb-2" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">
        Belum ada video siap publish
      </p>
      <p class="text-sm mb-6" style="color:rgba(236,236,245,0.4);">
        Review video yang sudah selesai digenerate terlebih dahulu
      </p>
      <NuxtLink to="/review" class="btn-primary text-sm px-6 py-3">
        Pergi ke Review
      </NuxtLink>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="project in publishableProjects"
        :key="project.id"
        :to="`/publish/${project.id}`"
        class="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-purple-500/25 transition-all block"
      >
        <!-- Thumbnail -->
        <div class="w-full sm:w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          :style="`background:linear-gradient(135deg, hsl(${thumbHue(project.id)},35%,12%), hsl(${thumbHue(project.id)+20},25%,8%));`">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start gap-2 flex-wrap mb-1">
            <h3 class="text-sm font-semibold" style="color:#ECECF5; font-family:'Manrope',sans-serif;">
              {{ project.title }}
            </h3>
            <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0" :style="statusStyle(project.status)">
              {{ statusLabel(project.status) }}
            </span>
          </div>
          <div class="flex items-center gap-3 text-xs flex-wrap" style="color:rgba(236,236,245,0.4);">
            <span>{{ project.language?.toUpperCase() }}</span>
            <span>{{ project.resolution }}</span>
            <span>{{ formatDate(project.created_at) }}</span>
            <a v-if="project.youtube_url" :href="project.youtube_url" target="_blank" rel="noopener"
              @click.stop
              class="flex items-center gap-1 font-medium" style="color:#f87171;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
              YouTube
            </a>
          </div>
        </div>

        <!-- CTA -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <span v-if="project.status !== 'published'" class="text-xs font-semibold" style="color:#8B5CF6;">
            Publish Sekarang →
          </span>
          <span v-else class="text-xs" style="color:rgba(236,236,245,0.3);">
            Lihat Detail →
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const { projects, loading, fetchProjects } = useProjects()

const publishableProjects = computed(() =>
  projects.value.filter(p => ['completed', 'published'].includes(p.status))
)

const stats = computed(() => [
  { label: 'Siap Publish', value: publishableProjects.value.filter(p => p.status === 'completed').length, color: '#8B5CF6' },
  { label: 'Sudah Published', value: publishableProjects.value.filter(p => p.status === 'published').length, color: '#4ade80' },
  { label: 'Total Views', value: '—', color: '#22D3EE' },
  { label: 'Est. Revenue', value: '—', color: '#fbbf24' },
])

onMounted(() => fetchProjects())

function thumbHue(id: string) {
  return id.split('').reduce((a, c) => a + c.charCodeAt(0), 200) % 360
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusStyle(status: string) {
  if (status === 'published') return 'background:rgba(139,92,246,0.15); color:#C4B5FD; border:1px solid rgba(139,92,246,0.25);'
  if (status === 'completed') return 'background:rgba(34,197,94,0.12); color:#4ade80; border:1px solid rgba(34,197,94,0.2);'
  return 'background:rgba(255,255,255,0.06); color:rgba(236,236,245,0.6);'
}

function statusLabel(status: string) {
  return status === 'published' ? 'Published' : status === 'completed' ? 'Siap Publish' : status
}
</script>
