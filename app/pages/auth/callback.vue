<template>
  <div class="min-h-screen flex items-center justify-center" style="background:#08080F;">
    <div class="text-center">
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style="background:linear-gradient(135deg,#8B5CF6,#22D3EE);">
        <svg class="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      </div>
      <p class="text-base font-semibold mb-1" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">{{ statusText }}</p>
      <p class="text-sm" style="color:rgba(236,236,245,0.4);">Harap tunggu sebentar...</p>
      <p v-if="errorMsg" class="mt-4 text-sm px-4 py-2.5 rounded-xl" style="background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.18);">
        {{ errorMsg }}
        <NuxtLink to="/auth/login" class="block mt-2 font-semibold" style="color:#8B5CF6;">← Kembali ke Login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const supabase = useSupabaseClient()
const { user, token } = useAuth()
const statusText = ref('Memverifikasi akun...')
const errorMsg = ref('')

onMounted(async () => {
  try {
    let session: any = null

    if (route.query.code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(route.query.code as string)
      if (error) throw error
      session = data.session
    } else {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      session = data.session
    }

    if (!session) {
      errorMsg.value = 'Sesi OAuth tidak ditemukan. Silakan coba lagi.'
      return
    }

    statusText.value = 'Masuk berhasil, mengalihkan...'
    token.value = session.access_token
    const fbIdent = session.user.identities?.find(i => i.provider === 'facebook')
    const fbName = fbIdent?.identity_data?.full_name || fbIdent?.identity_data?.name
    const fbEmail = fbIdent?.identity_data?.email
    user.value = {
      id: session.user.id,
      email: session.user.email || fbEmail || `${session.user.id}@placeholder.email`,
      name: fbName
        || session.user.user_metadata?.full_name
        || session.user.user_metadata?.name
        || session.user.email?.split('@')[0]
        || 'User',
      avatar_url: session.user.user_metadata?.avatar_url,
    }
    await navigateTo('/dashboard')
  } catch (e: any) {
    errorMsg.value = e.message || 'Terjadi kesalahan saat masuk.'
  }
})
</script>
