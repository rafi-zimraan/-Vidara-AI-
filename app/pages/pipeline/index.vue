<template>
  <div>
    <!-- Header -->
    <div class="flex items-end justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Pipeline</h1>
        <p class="text-sm mt-1" style="color:rgba(236,236,245,0.45);">Pantau proses generasi video AI yang sedang berjalan.</p>
      </div>
      <NuxtLink to="/generate" class="btn-primary flex items-center gap-2 text-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Generate Video Baru
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4">
      <div v-for="i in 3" :key="i" class="card p-5 animate-pulse">
        <div class="h-4 rounded" style="background:rgba(255,255,255,0.06); width:60%;"></div>
        <div class="h-2 rounded mt-4" style="background:rgba(255,255,255,0.04); width:100%;"></div>
        <div class="h-2 rounded mt-2" style="background:rgba(255,255,255,0.04); width:80%;"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="activeProjects.length === 0" class="py-20 text-center">
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style="background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(34,211,238,0.06)); border:1px solid rgba(139,92,246,0.2);">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5">
          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 012 2v4m-6-6v18m0 0H5a2 2 0 01-2-2v-4m18 0v4a2 2 0 01-2 2h-4m0 0V3"/>
        </svg>
      </div>
      <p class="text-lg font-semibold mb-2" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">
        Tidak ada pipeline aktif
      </p>
      <p class="text-sm mb-6" style="color:rgba(236,236,245,0.4);">
        Buat video baru untuk memulai proses generasi AI
      </p>
      <NuxtLink to="/generate" class="btn-primary text-sm px-6 py-3">
        Mulai Generate Video
      </NuxtLink>
    </div>

    <!-- Active Pipelines -->
    <div v-else class="space-y-4">
      <NuxtLink
        v-for="project in activeProjects"
        :key="project.id"
        :to="`/pipeline/${project.id}`"
        class="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-purple-500/30 transition-all block"
      >
        <!-- Icon + Info -->
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style="background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.25);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.8">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 012 2v4m-6-6v18m0 0H5a2 2 0 01-2-2v-4m18 0v4a2 2 0 01-2 2h-4m0 0V3"/>
            </svg>
            <span v-if="project.status === 'generating'"
              class="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
              style="background:#22D3EE; border:2px solid #08080F;"></span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <h3 class="text-sm font-semibold truncate" style="color:#ECECF5; font-family:'Manrope',sans-serif;">
                {{ project.title }}
              </h3>
              <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0" :style="statusStyle(project.status)">
                {{ statusLabel(project.status) }}
              </span>
            </div>
            <div class="flex items-center gap-4 text-xs flex-wrap" style="color:rgba(236,236,245,0.4);">
              <span>{{ project.language?.toUpperCase() }}</span>
              <span>{{ project.resolution }}</span>
              <span>{{ formatDate(project.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="sm:w-48 flex-shrink-0">
          <div class="flex justify-between mb-1.5 text-xs">
            <span style="color:rgba(236,236,245,0.5);">Progress</span>
            <span style="color:#22D3EE; font-family:'Space Grotesk',sans-serif;">
              {{ project.status === 'queued' ? 'Menunggu' : '~' + mockProgress(project.id) + '%' }}
            </span>
          </div>
          <div class="h-1.5 rounded-full" style="background:rgba(255,255,255,0.06);">
            <div class="h-full rounded-full transition-all"
              :style="`width:${project.status === 'queued' ? 0 : mockProgress(project.id)}%; background:linear-gradient(90deg,#8B5CF6,#22D3EE);`">
            </div>
          </div>
          <p class="text-xs mt-1.5" style="color:rgba(236,236,245,0.3);">
            {{ project.status === 'queued' ? 'Akan segera dimulai' : 'Sedang diproses 18 agen AI' }}
          </p>
        </div>

        <!-- Arrow -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="flex-shrink-0 hidden sm:block" style="color:rgba(236,236,245,0.25);">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </NuxtLink>
    </div>

    <!-- Completed Recent -->
    <div v-if="completedRecent.length > 0" class="mt-10">
      <h2 class="text-sm font-semibold mb-4" style="font-family:'Space Grotesk',sans-serif; color:rgba(236,236,245,0.5);">
        Baru Selesai
      </h2>
      <div class="space-y-2">
        <NuxtLink
          v-for="project in completedRecent"
          :key="project.id"
          :to="`/review/${project.id}`"
          class="card px-5 py-3.5 flex items-center gap-4 hover:border-green-500/20 transition-all block"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style="background:rgba(34,197,94,0.1);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" style="color:#ECECF5; font-family:'Manrope',sans-serif;">
              {{ project.title }}
            </p>
            <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.35);">Selesai · Siap untuk direview</p>
          </div>
          <span class="text-xs flex-shrink-0" style="color:#4ade80;">Review →</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const { projects, loading, fetchProjects } = useProjects()

const activeProjects = computed(() =>
  projects.value.filter(p => p.status === 'queued' || p.status === 'generating')
)

const completedRecent = computed(() =>
  projects.value.filter(p => p.status === 'completed').slice(0, 3)
)

onMounted(() => fetchProjects())

function mockProgress(id: string) {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 20 + (hash % 60)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusStyle(status: string) {
  if (status === 'generating') return 'background:rgba(34,211,238,0.12); color:#22D3EE; border:1px solid rgba(34,211,238,0.2);'
  if (status === 'queued') return 'background:rgba(234,179,8,0.12); color:#fbbf24; border:1px solid rgba(234,179,8,0.2);'
  return 'background:rgba(255,255,255,0.06); color:rgba(236,236,245,0.6);'
}

function statusLabel(status: string) {
  return status === 'generating' ? 'Sedang Berjalan' : status === 'queued' ? 'Antrian' : status
}
</script>
