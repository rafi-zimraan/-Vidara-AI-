<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">Welcome back, {{ user?.name }}</p>
      </div>
      <NuxtLink to="/projects/new"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
        New Project
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-xl border border-gray-200 p-6">
        <p class="text-sm text-gray-500">{{ stat.label }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Recent Projects</h2>
      </div>
      <div v-if="loading" class="p-6 text-center text-gray-500">Loading...</div>
      <div v-else-if="projects.length === 0" class="p-6 text-center text-gray-500">
        No projects yet. Create your first video project!
      </div>
      <div v-else class="divide-y divide-gray-200">
        <NuxtLink v-for="project in projects" :key="project.id"
          :to="`/projects/${project.id}`"
          class="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ project.title }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(project.created_at) }}</p>
          </div>
          <span :class="statusBadge(project.status)"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
            {{ project.status }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user } = useAuth()
const { projects, loading, fetchProjects } = useProjects()

const stats = computed(() => [
  { label: 'Total Projects', value: projects.value.length },
  { label: 'Completed', value: projects.value.filter(p => p.status === 'completed').length },
  { label: 'In Progress', value: projects.value.filter(p => p.status === 'generating').length },
  { label: 'Drafts', value: projects.value.filter(p => p.status === 'draft').length },
])

onMounted(() => fetchProjects())

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    queued: 'bg-yellow-100 text-yellow-800',
    generating: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    published: 'bg-purple-100 text-purple-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}
</script>
