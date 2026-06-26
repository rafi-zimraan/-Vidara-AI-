<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Projects</h1>
      <NuxtLink to="/projects/new"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
        New Project
      </NuxtLink>
    </div>

    <div class="mb-6 flex gap-2">
      <button v-for="filter in filters" :key="filter.value"
        @click="activeFilter = filter.value"
        :class="[
          'px-4 py-2 text-sm rounded-lg border',
          activeFilter === filter.value
            ? 'bg-primary-50 border-primary-300 text-primary-700'
            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
        ]">
        {{ filter.label }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">Loading projects...</div>

    <div v-else-if="filteredProjects.length === 0" class="text-center py-12 text-gray-500">
      No projects found.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink v-for="project in filteredProjects" :key="project.id"
        :to="`/projects/${project.id}`"
        class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <h3 class="text-sm font-semibold text-gray-900">{{ project.title }}</h3>
          <span :class="statusBadge(project.status)"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
            {{ project.status }}
          </span>
        </div>
        <p v-if="project.description" class="mt-2 text-xs text-gray-500 line-clamp-2">{{ project.description }}</p>
        <div class="mt-4 flex items-center gap-4 text-xs text-gray-400">
          <span>{{ project.language?.toUpperCase() }}</span>
          <span>{{ project.resolution }}</span>
          <span>{{ formatDate(project.created_at) }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { projects, loading, fetchProjects } = useProjects()
const activeFilter = ref('all')

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Generating', value: 'generating' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') return projects.value
  return projects.value.filter(p => p.status === activeFilter.value)
})

onMounted(() => fetchProjects())

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
