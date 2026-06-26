<template>
  <div class="min-h-screen bg-gray-50">
    <header v-if="user" class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-8">
            <NuxtLink to="/dashboard" class="text-xl font-bold text-primary-600">
              Vidara AI
            </NuxtLink>
            <nav class="hidden md:flex gap-6">
              <NuxtLink to="/dashboard" class="text-sm font-medium text-gray-600 hover:text-gray-900">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/projects" class="text-sm font-medium text-gray-600 hover:text-gray-900">
                Projects
              </NuxtLink>
              <NuxtLink to="/videos" class="text-sm font-medium text-gray-600 hover:text-gray-900">
                Videos
              </NuxtLink>
            </nav>
          </div>
          <div class="flex items-center gap-4">
            <NuxtLink to="/projects/new"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
              New Project
            </NuxtLink>
            <button @click="handleLogout"
              class="text-sm text-gray-500 hover:text-gray-700">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()

async function handleLogout() {
  await logout()
  navigateTo('/auth/login')
}
</script>
