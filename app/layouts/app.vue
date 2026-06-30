<template>
  <div class="flex min-h-screen" style="background:#08080F; color:#ECECF5;">

    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 z-30"
      style="background:#0A0A14; border-right:1px solid rgba(255,255,255,0.06);">

      <!-- Logo -->
      <div class="px-5 py-5">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
            style="background:linear-gradient(135deg,#8B5CF6,#22D3EE);">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M3 2l10 6-10 6V2z"/>
            </svg>
          </div>
          <span class="text-base font-semibold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
            Vidara AI
          </span>
        </NuxtLink>
      </div>

      <!-- Credit Balance Badge -->
      <div class="px-3 mb-3">
        <button @click="navigateTo('/billing')"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/[0.03]"
          style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.15);">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style="background:linear-gradient(135deg,#8B5CF6,#22D3EE);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0 text-left">
            <p class="text-[10px] font-medium" style="color:rgba(236,236,245,0.4);">Kredit Saya</p>
            <p class="text-sm font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
              {{ creditBalance?.balance?.toLocaleString() || '—' }}
              <span class="text-[10px] font-normal" style="color:rgba(236,236,245,0.35);">kredit</span>
            </p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(236,236,245,0.3)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <!-- Main Nav -->
      <nav class="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <NuxtLink
          v-for="item in mainNav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
          :style="isActive(item.to)
            ? 'background:linear-gradient(135deg,rgba(139,92,246,0.18),rgba(34,211,238,0.08)); border:1px solid rgba(139,92,246,0.35); color:#fff;'
            : 'color:rgba(236,236,245,0.55); border:1px solid transparent;'"
        >
          <SideIcon :name="item.icon" :active="isActive(item.to)" />
          <span style="font-family:'Manrope',sans-serif;">{{ item.label }}</span>
        </NuxtLink>

        <div class="my-3" style="border-top:1px solid rgba(255,255,255,0.06);"></div>

        <NuxtLink
          v-for="item in secondaryNav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
          :style="isActive(item.to)
            ? 'background:linear-gradient(135deg,rgba(139,92,246,0.18),rgba(34,211,238,0.08)); border:1px solid rgba(139,92,246,0.35); color:#fff;'
            : 'color:rgba(236,236,245,0.55); border:1px solid transparent;'"
        >
          <SideIcon :name="item.icon" :active="isActive(item.to)" />
          <span style="font-family:'Manrope',sans-serif;">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User Area -->
      <div class="px-3 py-4" style="border-top:1px solid rgba(255,255,255,0.06);">
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style="background:rgba(255,255,255,0.03);">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style="background:linear-gradient(135deg,#8B5CF6,#22D3EE); font-family:'Space Grotesk',sans-serif;">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">
              {{ user?.name || 'User' }}
            </p>
            <p class="text-xs truncate" style="color:rgba(236,236,245,0.4);">{{ user?.email }}</p>
          </div>
          <button @click="handleLogout" class="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style="color:rgba(236,236,245,0.4);" title="Logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 md:ml-60 flex flex-col min-h-screen">
      <main class="flex-1 p-4 md:p-6 pb-24 md:pb-6">
        <slot />
      </main>
    </div>

    <!-- Mobile Bottom Nav -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 safe-area-bottom"
      style="background:#0A0A14; border-top:1px solid rgba(255,255,255,0.06);">
      <NuxtLink
        v-for="item in mobileNav"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all relative"
        :style="isActive(item.to) ? 'color:#8B5CF6;' : 'color:rgba(236,236,245,0.4);'"
      >
        <SideIcon :name="item.icon" :active="isActive(item.to)" />
        <span style="font-family:'Manrope',sans-serif; font-size:10px;">{{ item.label }}</span>
        <div v-if="item.badge" class="absolute -top-0.5 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold"
          style="background:linear-gradient(135deg,#8B5CF6,#22D3EE); color:#fff; line-height:1;">
          {{ creditBalance?.balance?.toLocaleString() || '0' }}
        </div>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()
const { balance: creditBalance, fetchBalance } = useCredits()

onMounted(() => {
  if (user.value) fetchBalance()
})

// Fetch balance when user becomes available (auth loads after mount)
watch(() => user.value, (u) => {
  if (u) fetchBalance()
}, { once: true })

const userInitials = computed(() => {
  const name = user.value?.name || user.value?.email || 'U'
  return name.charAt(0).toUpperCase()
})

function isActive(to: string) {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/generate', label: 'Generate', icon: 'sparkles' },
  { to: '/pipeline', label: 'Pipeline', icon: 'cpu' },
  { to: '/review', label: 'Review & Edit', icon: 'edit' },
  { to: '/publish', label: 'Publish', icon: 'upload' },
  { to: '/assets', label: 'Assets & Brand', icon: 'folder' },
]

const secondaryNav = [
  { to: '/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/billing', label: 'Billing', icon: 'card' },
]

const mobileNav = [
  { to: '/dashboard', label: 'Home', icon: 'grid' },
  { to: '/generate', label: 'Generate', icon: 'sparkles' },
  { to: '/pipeline', label: 'Pipeline', icon: 'cpu' },
  { to: '/assets', label: 'Assets', icon: 'folder' },
  { to: '/billing', label: 'Kredit', icon: 'card', badge: true },
]

async function handleLogout() {
  await logout()
  navigateTo('/auth/login')
}
</script>

<!-- Inline icon component -->
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    SideIcon: defineComponent({
      props: { name: String, active: Boolean },
      template: `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" :style="active ? 'color:#8B5CF6' : ''">
          <path v-if="name==='grid'" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
          <path v-if="name==='sparkles'" d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          <path v-if="name==='cpu'" d="M9 3H5a2 2 0 00-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 012 2v4m-6-6v18m0 0H5a2 2 0 01-2-2v-4m18 0v4a2 2 0 01-2 2h-4m0 0V3"/>
          <path v-if="name==='edit'" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          <path v-if="name==='upload'" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          <path v-if="name==='folder'" d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          <path v-if="name==='chart'" d="M18 20V10M12 20V4M6 20v-6"/>
          <path v-if="name==='card'" d="M2 5h20v14H2zM2 10h20"/>
        </svg>
      `,
    }),
  },
})
</script>
