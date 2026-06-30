<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1.5" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Reset Password</h2>
      <p class="text-sm" style="color:rgba(236,236,245,0.45);">Buat password baru untuk akun kamu.</p>
    </div>

    <form @submit.prevent="handleResetPassword" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold mb-2" style="color:rgba(236,236,245,0.6);">Password Baru</label>
        <div class="relative">
          <input v-model="password" :type="showPwd ? 'text' : 'password'" required minlength="8" autocomplete="new-password" placeholder="Min. 8 karakter" class="input-dark pr-11" />
          <button type="button" @click="showPwd = !showPwd" class="absolute right-3.5 top-1/2 -translate-y-1/2" style="color:rgba(236,236,245,0.4);">
            <svg v-if="!showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold mb-2" style="color:rgba(236,236,245,0.6);">Konfirmasi Password</label>
        <input v-model="confirmPassword" type="password" required minlength="8" autocomplete="new-password" placeholder="Ulangi password baru" class="input-dark" />
      </div>

      <p v-if="error" class="text-xs px-3.5 py-2.5 rounded-xl" style="background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.18);">
        {{ error }}
      </p>
      <p v-if="success" class="text-xs px-3.5 py-2.5 rounded-xl" style="background:rgba(34,197,94,0.08); color:#4ade80; border:1px solid rgba(34,197,94,0.18);">
        {{ success }}
      </p>

      <button type="submit" :disabled="loading"
        class="btn-primary w-full py-3 text-sm font-semibold">
        <span v-if="!loading">Reset Password →</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          Mereset...
        </span>
      </button>
    </form>

    <p class="text-center text-sm mt-6" style="color:rgba(236,236,245,0.45);">
      <NuxtLink to="/auth/login" class="font-semibold" style="color:#8B5CF6;">← Kembali ke Login</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const showPwd = ref(false)
const error = ref('')
const success = ref('')
const loading = ref(false)

onMounted(async () => {
  if (route.hash?.includes('type=recovery')) {
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !data.session) {
      error.value = 'Tautan reset tidak valid atau sudah kedaluwarsa.'
    }
  } else {
    error.value = 'Tautan reset tidak valid.'
  }
})

async function handleResetPassword() {
  error.value = ''
  success.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Password tidak cocok.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password minimal 8 karakter.'
    return
  }

  loading.value = true
  try {
    const { error: err } = await supabase.auth.updateUser({ password: password.value })
    if (err) throw err
    success.value = 'Password berhasil direset. Silakan masuk.'
    setTimeout(() => navigateTo('/auth/login'), 2000)
  } catch (e: any) {
    error.value = e.message || 'Gagal mereset password'
  } finally {
    loading.value = false
  }
}
</script>
