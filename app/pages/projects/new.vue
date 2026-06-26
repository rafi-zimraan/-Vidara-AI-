<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-8">New Project</h1>

    <form @submit.prevent="handleCreate" class="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700">Project Title</label>
        <input v-model="form.title" type="text" required
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Description (optional)</label>
        <textarea v-model="form.description" rows="3"
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Prompt / Topic</label>
        <textarea v-model="form.prompt" rows="4" required
          placeholder="e.g., Buat video dokumenter 8 menit tentang sejarah Kerajaan Majapahit..."
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Language</label>
          <select v-model="form.language"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Target Duration</label>
          <select v-model="form.target_duration_seconds"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
            <option :value="360">6 minutes</option>
            <option :value="480">8 minutes</option>
            <option :value="900">15 minutes</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Aspect Ratio</label>
          <select v-model="form.aspect_ratio"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Resolution</label>
          <select v-model="form.resolution"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex items-center gap-4">
        <button type="submit" :disabled="submitting"
          class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {{ submitting ? 'Creating...' : 'Create Project' }}
        </button>
        <NuxtLink to="/projects" class="text-sm text-gray-500 hover:text-gray-700">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { createProject } = useProjects()
const submitting = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  description: '',
  prompt: '',
  language: 'en',
  target_duration_seconds: 480,
  aspect_ratio: '16:9',
  resolution: '1080p',
})

async function handleCreate() {
  submitting.value = true
  error.value = ''
  try {
    const project = await createProject(form)
    navigateTo(`/projects/${project.id}`)
  } catch (e: any) {
    error.value = e.message || 'Failed to create project'
  } finally {
    submitting.value = false
  }
}
</script>
