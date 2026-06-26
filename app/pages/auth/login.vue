<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 text-center">Sign in to Vidara AI</h2>
    <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input v-model="email" type="email" required
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Password</label>
        <input v-model="password" type="password" required
          class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button type="submit" :disabled="loading"
        class="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
      <p class="text-center text-sm text-gray-500">
        Don't have an account?
        <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">Register</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, loading } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  try {
    await login(email.value, password.value)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.message || 'Login failed'
  }
}
</script>
