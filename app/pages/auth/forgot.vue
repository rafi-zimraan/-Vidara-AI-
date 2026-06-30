<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1.5" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Lupa Password</h2>
      <p class="text-sm" style="color:rgba(236,236,245,0.45);">Masukkan email kamu dan kami akan kirim tautan reset.</p>
    </div>

    <form @submit.prevent="handleForgotPassword" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold mb-2" style="color:rgba(236,236,245,0.6);">Email</label>
        <input v-model="email" type="email" required autocomplete="email" placeholder="nama@email.com" class="input-dark" />
      </div>

      <p v-if="error" class="text-xs px-3.5 py-2.5 rounded-xl" style="background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.18);">
        {{ error }}
      </p>
      <p v-if="success" class="text-xs px-3.5 py-2.5 rounded-xl" style="background:rgba(34,197,94,0.08); color:#4ade80; border:1px solid rgba(34,197,94,0.18);">
        {{ success }}
      </p>

      <button type="submit" :disabled="loading"
        class="btn-primary w-full py-3 text-sm font-semibold">
        <span v-if="!loading">Kirim Tautan Reset →</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          Mengirim...
        </span>
      </button>
    </form>

    <p class="text-center text-sm mt-6" style="color:rgba(236,236,245,0.45);">
      Ingat password?
      <NuxtLink to="/auth/login" class="font-semibold" style="color:#8B5CF6;"> Masuk</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()

const email = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const origin = import.meta.client ? window.location.origin : ''

async function handleForgotPassword() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${origin}/auth/reset`,
    })
    if (err) throw err
    success.value = 'Tautan reset password telah dikirim ke email kamu.'
  } catch (e: any) {
    error.value = e.message || 'Gagal mengirim email reset'
  } finally {
    loading.value = false
  }
}
</script>
