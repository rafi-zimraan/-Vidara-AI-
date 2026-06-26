<template>
  <div>
    <div v-if="loading" class="text-center py-12 text-gray-500">Loading project...</div>

    <template v-else-if="project">
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink to="/projects" class="text-sm text-gray-500 hover:text-gray-700 mb-2 block">
            &larr; Back to Projects
          </NuxtLink>
          <h1 class="text-2xl font-bold text-gray-900">{{ project.title }}</h1>
          <p class="text-sm text-gray-500 mt-1">Created {{ formatDate(project.created_at) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span :class="statusBadge(project.status)"
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
            {{ project.status }}
          </span>
          <button @click="handleDelete"
            class="text-sm text-red-600 hover:text-red-700">Delete</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-sm font-semibold text-gray-900 mb-3">Prompt</h2>
            <p class="text-sm text-gray-600">{{ project.prompt_text || 'No prompt' }}</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-sm font-semibold text-gray-900 mb-3">Description</h2>
            <p class="text-sm text-gray-600">{{ project.description || 'No description' }}</p>
          </div>

          <div v-if="project.youtube_url" class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-sm font-semibold text-gray-900 mb-3">YouTube</h2>
            <a :href="project.youtube_url" target="_blank"
              class="text-sm text-primary-600 hover:text-primary-700">
              {{ project.youtube_url }}
            </a>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Details</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-xs text-gray-500">Status</dt>
                <dd class="text-xs font-medium text-gray-900">{{ project.status }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-xs text-gray-500">Language</dt>
                <dd class="text-xs font-medium text-gray-900">{{ project.language?.toUpperCase() }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-xs text-gray-500">Duration</dt>
                <dd class="text-xs font-medium text-gray-900">{{ project.target_duration_secs }}s</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-xs text-gray-500">Resolution</dt>
                <dd class="text-xs font-medium text-gray-900">{{ project.resolution }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-xs text-gray-500">Aspect Ratio</dt>
                <dd class="text-xs font-medium text-gray-900">{{ project.aspect_ratio }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-12 text-gray-500">Project not found</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { getProject, deleteProject } = useProjects()
const project = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getProject(route.params.id as string)
    project.value = res.data
  } catch {
    project.value = null
  } finally {
    loading.value = false
  }
})

async function handleDelete() {
  if (!confirm('Delete this project?')) return
  await deleteProject(route.params.id as string)
  navigateTo('/projects')
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
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
