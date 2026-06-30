<template>
  <div class="min-h-screen flex" style="background:#08080F; color:#ECECF5; font-family:'Manrope',sans-serif;">

    <!-- ── LEFT PANEL (desktop only) ── -->
    <div class="hidden lg:flex flex-col flex-1 relative overflow-hidden"
      style="background:linear-gradient(145deg,#0E0A20 0%,#090913 60%,#0A0F1A 100%);">

      <!-- Animated grid bg -->
      <div class="absolute inset-0 opacity-20" style="
        background-image:
          linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px);
        background-size:48px 48px;">
      </div>

      <!-- Glow blobs -->
      <div class="absolute rounded-full blur-3xl opacity-30" style="width:420px;height:420px;background:radial-gradient(circle,#8B5CF6,transparent);top:-80px;left:-80px;"></div>
      <div class="absolute rounded-full blur-3xl opacity-20" style="width:320px;height:320px;background:radial-gradient(circle,#22D3EE,transparent);bottom:60px;right:-60px;"></div>

      <div class="relative z-10 flex flex-col h-full px-12 py-10">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 w-fit">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#8B5CF6,#22D3EE);">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="white"><path d="M3 2l10 6-10 6V2z"/></svg>
          </div>
          <span class="text-xl font-bold" style="font-family:'Space Grotesk',sans-serif;">Vidara AI</span>
        </NuxtLink>

        <!-- Hero text -->
        <div class="mt-auto mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium"
            style="background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.25); color:#A78BFA;">
            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
            AI-Powered Video Generation
          </div>
          <h1 class="text-4xl font-bold leading-tight mb-4" style="font-family:'Space Grotesk',sans-serif;">
            Buat Video YouTube<br>
            <span style="background:linear-gradient(135deg,#8B5CF6,#22D3EE); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Berkualitas Tinggi</span><br>
            dengan AI
          </h1>
          <p class="text-base leading-relaxed" style="color:rgba(236,236,245,0.5); max-width:400px;">
            Dari riset topik hingga upload YouTube — semua otomatis. Hasilkan konten profesional dalam hitungan menit, bukan minggu.
          </p>

          <!-- Feature bullets -->
          <div class="mt-8 space-y-3">
            <div v-for="feat in features" :key="feat.text" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                :style="`background:rgba(${feat.color},0.12); border:1px solid rgba(${feat.color},0.2);`">
                <span class="text-base">{{ feat.icon }}</span>
              </div>
              <p class="text-sm" style="color:rgba(236,236,245,0.65);">{{ feat.text }}</p>
            </div>
          </div>
        </div>

        <!-- Preview mockup card -->
        <div class="rounded-2xl overflow-hidden mb-10" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);">
          <div class="px-4 py-3 flex items-center gap-2" style="border-bottom:1px solid rgba(255,255,255,0.06);">
            <div class="w-2.5 h-2.5 rounded-full" style="background:#f87171;"></div>
            <div class="w-2.5 h-2.5 rounded-full" style="background:#fbbf24;"></div>
            <div class="w-2.5 h-2.5 rounded-full" style="background:#4ade80;"></div>
            <span class="ml-3 text-xs" style="color:rgba(236,236,245,0.3);">vidara.ai — Pipeline AI</span>
          </div>
          <div class="p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="flex-1 h-2 rounded-full" style="background:rgba(255,255,255,0.06);">
                <div class="h-full rounded-full" style="width:72%; background:linear-gradient(90deg,#8B5CF6,#22D3EE);"></div>
              </div>
              <span class="text-xs" style="color:#22D3EE;">72%</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="(step, i) in pipelineSteps" :key="i"
                class="px-2.5 py-2 rounded-lg text-xs"
                :style="step.done ? 'background:rgba(34,197,94,0.08); color:#4ade80; border:1px solid rgba(34,197,94,0.15);' : step.active ? 'background:rgba(139,92,246,0.12); color:#A78BFA; border:1px solid rgba(139,92,246,0.25);' : 'background:rgba(255,255,255,0.03); color:rgba(236,236,245,0.3); border:1px solid rgba(255,255,255,0.06);'">
                {{ step.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Social proof -->
        <div class="flex items-center gap-3">
          <div class="flex -space-x-2">
            <div v-for="av in avatars" :key="av.color"
              class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
              :style="`background:${av.color}22; border-color:${av.color}; color:${av.color};`">
              {{ av.letter }}
            </div>
          </div>
          <p class="text-sm" style="color:rgba(236,236,245,0.5);">
            <span style="color:#ECECF5; font-weight:600;">2,400+</span> kreator aktif
          </p>
        </div>
      </div>
    </div>

    <!-- ── RIGHT PANEL — Form ── -->
    <div class="flex flex-col justify-center w-full lg:w-[460px] xl:w-[520px] flex-shrink-0 px-6 py-12 relative"
      style="background:#08080F;">

      <!-- Mobile logo -->
      <div class="lg:hidden flex justify-center mb-8">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#8B5CF6,#22D3EE);">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="white"><path d="M3 2l10 6-10 6V2z"/></svg>
          </div>
          <span class="text-lg font-bold" style="font-family:'Space Grotesk',sans-serif;">Vidara AI</span>
        </NuxtLink>
      </div>

      <!-- Form slot -->
      <div class="w-full max-w-sm mx-auto">
        <slot />
      </div>

      <p class="text-center text-xs mt-8" style="color:rgba(236,236,245,0.25);">
        © 2026 GriyaITNusantara. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const avatars = [
  { color: '#8B5CF6', letter: 'R' },
  { color: '#22D3EE', letter: 'A' },
  { color: '#f59e0b', letter: 'D' },
  { color: '#ec4899', letter: 'S' },
]

const features = [
  { icon: '🔬', color: '139,92,246', text: 'Riset & skrip otomatis berbasis AI' },
  { icon: '🎙️', color: '34,211,238', text: 'Voice-over dengan 50+ suara AI Indonesia' },
  { icon: '🎬', color: '251,146,60', text: 'Editing & thumbnail otomatis' },
  { icon: '📤', color: '34,197,94', text: 'Auto-publish ke YouTube terjadwal' },
]

const pipelineSteps = [
  { name: 'Riset', done: true, active: false },
  { name: 'Skrip', done: true, active: false },
  { name: 'Voice', done: true, active: false },
  { name: 'Visual', done: true, active: false },
  { name: 'Edit', done: false, active: true },
  { name: 'Upload', done: false, active: false },
]
</script>
