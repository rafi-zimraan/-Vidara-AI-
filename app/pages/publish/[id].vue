<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink :to="`/review/${$route.params.id}`" class="p-2 rounded-lg hover:bg-white/5 transition-colors"
        style="color:rgba(236,236,245,0.5);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </NuxtLink>
      <div>
        <h1 class="text-xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
          Publish ke YouTube
        </h1>
        <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.4);">Atur metadata dan publikasikan video</p>
      </div>
      <div class="ml-auto">
        <button @click="handlePublish" class="btn-primary text-sm px-5 py-2">
          Publish Sekarang
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-5">

      <!-- Left: A/B + Metadata -->
      <div class="flex-1 space-y-4">

        <!-- A/B Thumbnail -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
              A/B Thumbnail Test
            </h3>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(34,211,238,0.1); color:#22D3EE;">
              AI Generated
            </span>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="(thumb, i) in thumbnails"
              :key="i"
              @click="selectedThumb = i"
              class="rounded-xl overflow-hidden cursor-pointer transition-all"
              :style="selectedThumb === i
                ? 'border:2px solid #8B5CF6; box-shadow:0 0 0 3px rgba(139,92,246,0.2);'
                : 'border:2px solid rgba(255,255,255,0.06);'"
            >
              <div class="aspect-video flex items-center justify-center relative"
                :style="`background:linear-gradient(135deg, ${thumb.from}, ${thumb.to});`">
                <span class="text-2xl">{{ thumb.emoji }}</span>
                <div v-if="selectedThumb === i" class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style="background:#8B5CF6;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
              </div>
              <div class="px-2 py-1.5" style="background:rgba(255,255,255,0.02);">
                <p class="text-xs" style="color:rgba(236,236,245,0.5);">Varian {{ String.fromCharCode(65 + i) }}</p>
                <p class="text-xs font-medium" style="color:#22D3EE;">CTR: {{ thumb.ctr }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="card p-5 space-y-4">
          <h3 class="text-sm font-semibold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">
            Metadata Video
          </h3>

          <div>
            <label class="block text-xs font-medium mb-1.5" style="color:rgba(236,236,245,0.5);">Judul</label>
            <input v-model="metadata.title" type="text" class="input-dark"
              placeholder="Judul video yang menarik..." />
            <p class="text-xs mt-1 text-right" :style="metadata.title.length > 100 ? 'color:#f87171;' : 'color:rgba(236,236,245,0.3);'">
              {{ metadata.title.length }}/100
            </p>
          </div>

          <div>
            <label class="block text-xs font-medium mb-1.5" style="color:rgba(236,236,245,0.5);">Deskripsi</label>
            <textarea v-model="metadata.description" rows="4" class="input-dark resize-none"
              placeholder="Deskripsi video..."></textarea>
          </div>

          <div>
            <label class="block text-xs font-medium mb-1.5" style="color:rgba(236,236,245,0.5);">Tags</label>
            <input v-model="metadata.tags" type="text" class="input-dark"
              placeholder="Majapahit, Sejarah Indonesia, Edukasi..." />
          </div>

          <!-- Visibility -->
          <div>
            <label class="block text-xs font-medium mb-2" style="color:rgba(236,236,245,0.5);">Visibilitas</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="v in visibilityOptions"
                :key="v.value"
                @click="metadata.visibility = v.value"
                class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
                :style="metadata.visibility === v.value
                  ? 'background:rgba(139,92,246,0.2); border:1px solid rgba(139,92,246,0.5); color:#8B5CF6;'
                  : 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:rgba(236,236,245,0.5);'"
              >
                {{ v.icon }} {{ v.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Preview + Settings + SEO -->
      <div class="lg:w-72 space-y-4" style="align-self:flex-start;">

        <!-- YouTube Preview Card -->
        <div class="card p-4">
          <h3 class="text-xs font-semibold mb-3" style="color:rgba(236,236,245,0.5);">Preview YouTube</h3>
          <div class="aspect-video rounded-lg mb-3"
            :style="`background:linear-gradient(135deg, ${thumbnails[selectedThumb].from}, ${thumbnails[selectedThumb].to}); display:flex; align-items:center; justify-content:center;`">
            <span class="text-3xl">{{ thumbnails[selectedThumb].emoji }}</span>
          </div>
          <p class="text-sm font-medium leading-tight mb-1" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">
            {{ metadata.title || 'Judul Video Kamu' }}
          </p>
          <p class="text-xs" style="color:rgba(236,236,245,0.35);">Vidara Channel · 0 views · Baru saja</p>
        </div>

        <!-- Publish Settings -->
        <div class="card p-4 space-y-3">
          <h3 class="text-xs font-semibold mb-2" style="color:rgba(236,236,245,0.5);">Pengaturan Publish</h3>
          <div v-for="setting in publishSettings" :key="setting.key"
            class="flex items-center justify-between">
            <p class="text-xs" style="color:rgba(236,236,245,0.65); font-family:'Manrope',sans-serif;">{{ setting.label }}</p>
            <button
              @click="settings[setting.key] = !settings[setting.key]"
              class="w-9 h-5 rounded-full relative transition-colors"
              :style="settings[setting.key] ? 'background:#8B5CF6;' : 'background:rgba(255,255,255,0.1);'"
            >
              <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                :style="settings[setting.key] ? 'left:calc(100% - 18px);' : 'left:2px;'"></span>
            </button>
          </div>
        </div>

        <!-- SEO Score -->
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold" style="color:rgba(236,236,245,0.5);">SEO Score</h3>
            <span class="text-xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#4ade80;">94</span>
          </div>
          <div class="h-1.5 rounded-full mb-3" style="background:rgba(255,255,255,0.06);">
            <div class="h-full rounded-full" style="width:94%; background:linear-gradient(90deg,#4ade80,#22D3EE);"></div>
          </div>
          <div class="space-y-1.5">
            <div v-for="check in seoChecks" :key="check.label" class="flex items-center gap-2">
              <svg :width="12" :height="12" viewBox="0 0 24 24" fill="none"
                :stroke="check.pass ? '#4ade80' : '#f87171'" stroke-width="3">
                <path v-if="check.pass" d="M20 6L9 17l-5-5"/>
                <path v-else d="M18 6L6 18M6 6l12 12"/>
              </svg>
              <span class="text-xs" style="color:rgba(236,236,245,0.5);">{{ check.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const selectedThumb = ref(0)

const thumbnails = [
  { from: '#1a0533', to: '#0d1f3c', emoji: '🏰', ctr: 8.4 },
  { from: '#0d2b1a', to: '#0d1f3c', emoji: '⚔️', ctr: 7.1 },
  { from: '#2d1a00', to: '#1a0533', emoji: '👑', ctr: 6.8 },
]

const metadata = reactive({
  title: 'Sejarah Kerajaan Majapahit: Imperium Terbesar Nusantara',
  description: 'Perjalanan epik Kerajaan Majapahit dari lahir hingga kejayaannya di bawah Hayam Wuruk dan Gajah Mada.',
  tags: 'Majapahit, Sejarah Indonesia, Kerajaan Nusantara, Gajah Mada',
  visibility: 'public',
})

const visibilityOptions = [
  { value: 'public', label: 'Publik', icon: '🌍' },
  { value: 'unlisted', label: 'Unlisted', icon: '🔗' },
  { value: 'private', label: 'Privat', icon: '🔒' },
  { value: 'scheduled', label: 'Jadwal', icon: '🕐' },
]

const settings = reactive({
  monetization: true,
  notifications: true,
  madeForKids: false,
})

const publishSettings = [
  { key: 'monetization', label: 'Monetisasi' },
  { key: 'notifications', label: 'Notifikasi subscriber' },
  { key: 'madeForKids', label: 'Konten untuk anak-anak' },
]

const seoChecks = [
  { label: 'Judul mengandung keyword utama', pass: true },
  { label: 'Deskripsi > 200 karakter', pass: true },
  { label: 'Tags relevan ditambahkan', pass: true },
  { label: 'Thumbnail custom diunggah', pass: true },
  { label: 'Durasi optimal (7-15 menit)', pass: true },
  { label: 'Subtitle tersedia', pass: false },
]

function handlePublish() {
  // Placeholder for publish action
}
</script>
