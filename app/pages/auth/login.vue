<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1.5" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Selamat Datang Kembali</h2>
      <p class="text-sm" style="color:rgba(236,236,245,0.45);">Masuk untuk melanjutkan pembuatan video AI kamu.</p>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" class="mb-6 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-fade-in"
      :style="`background:${toast.bg}; border:1px solid ${toast.border}; color:${toast.color};`">
      <span class="text-base flex-shrink-0 mt-0.5">🙏</span>
      <div>
        <p class="font-medium">{{ toast.title }}</p>
        <p class="text-xs mt-0.5" :style="`color:${toast.color}cc;`">{{ toast.message }}</p>
      </div>
      <button @click="toast.show = false" class="ml-auto flex-shrink-0 p-0.5" :style="`color:${toast.color}88;`">&times;</button>
    </div>

    <!-- OAuth Buttons -->
    <div class="space-y-3 mb-6">
      <button type="button" @click="showDevNotice('Google')"
        class="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all hover:border-white/20 active:scale-[0.99]"
        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#ECECF5;">
        <svg width="18" height="18" viewBox="0 0 24 24" class="flex-shrink-0">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span class="flex-1 text-center">Lanjutkan dengan Google</span>
      </button>

      <button type="button" @click="showDevNotice('Facebook')"
        class="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all hover:border-white/20 active:scale-[0.99]"
        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#ECECF5;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" class="flex-shrink-0">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span class="flex-1 text-center">Lanjutkan dengan Facebook</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="flex items-center gap-3 mb-6">
      <div class="flex-1 h-px" style="background:rgba(255,255,255,0.08);"></div>
      <span class="text-xs" style="color:rgba(236,236,245,0.3);">atau masuk dengan email</span>
      <div class="flex-1 h-px" style="background:rgba(255,255,255,0.08);"></div>
    </div>

    <!-- Email/Password Form -->
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold mb-2" style="color:rgba(236,236,245,0.6);">Email</label>
        <input v-model="email" type="email" required autocomplete="email" placeholder="nama@email.com" class="input-dark" />
      </div>
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-semibold" style="color:rgba(236,236,245,0.6);">Password</label>
          <NuxtLink to="/auth/forgot" class="text-xs font-medium" style="color:#8B5CF6;">Lupa password?</NuxtLink>
        </div>
        <div class="relative">
          <input v-model="password" :type="showPwd ? 'text' : 'password'" required autocomplete="current-password" placeholder="••••••••" class="input-dark pr-11" />
          <button type="button" @click="showPwd = !showPwd" class="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5" style="color:rgba(236,236,245,0.4);">
            <svg v-if="!showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>

      <p v-if="error" class="text-xs px-3.5 py-2.5 rounded-xl" style="background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.18);">
        {{ error }}
      </p>

      <button type="submit" :disabled="loading"
        class="btn-primary w-full py-3 text-sm font-semibold mt-2 relative overflow-hidden"
        style="transition:opacity 0.15s;">
        <span v-if="!loading">Masuk →</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          Masuk...
        </span>
      </button>
    </form>

    <p class="text-center text-sm mt-6" style="color:rgba(236,236,245,0.45);">
      Belum punya akun?
      <NuxtLink to="/auth/register" class="font-semibold" style="color:#8B5CF6;"> Daftar gratis</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login } = useAuth()

const email = ref('')
const password = ref('')
const showPwd = ref(false)
const error = ref('')
const loading = ref(false)

const toast = reactive({ show: false, title: '', message: '', bg: '', border: '', color: '' })

function showDevNotice(provider: string) {
  toast.show = true
  toast.title = `🙏 ${provider} — Bismillah, Masih Tahap Perkembangan`
  toast.message = 'Fitur ini sedang dalam pengembangan. Doakan kami agar diberi rezeki waktu luang yang banyak untuk menyelesaikannya. Aamiin.'
  toast.bg = 'rgba(139,92,246,0.1)'
  toast.border = 'rgba(139,92,246,0.2)'
  toast.color = '#A78BFA'
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Email atau password salah'
  } finally {
    loading.value = false
  }
}


</script>
