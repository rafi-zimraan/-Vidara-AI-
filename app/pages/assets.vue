<template>
  <div>
    <div class="flex items-end justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold mb-1" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Assets & Brand</h1>
        <p class="text-sm" style="color:rgba(236,236,245,0.45);">Library aset hasil generasi dan pengaturan identitas brand.</p>
      </div>
      <button class="btn-primary flex items-center gap-2 text-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Upload Asset
      </button>
    </div>

    <!-- Tabs + Search -->
    <div class="flex items-center gap-4 mb-5 flex-wrap">
      <div class="flex gap-1 p-1 rounded-xl" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <button v-for="tab in assetTabs" :key="tab" @click="activeTab = tab"
          class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :style="activeTab === tab ? 'background:rgba(139,92,246,0.2); border:1px solid rgba(139,92,246,0.35); color:#C4B5FD;' : 'color:rgba(236,236,245,0.4); border:1px solid transparent;'">
          {{ tab }}
        </button>
      </div>
      <div class="flex-1 relative min-w-48">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3.5 top-1/2 -translate-y-1/2" style="color:rgba(236,236,245,0.3);">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input v-model="search" placeholder="Cari asset..." class="input-dark pl-10" />
      </div>
    </div>

    <!-- Asset Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="asset in filteredAssets" :key="asset.id" class="card overflow-hidden cursor-pointer group transition-all hover:border-purple-500/30">
        <div class="aspect-video relative" :style="`background:${asset.preview};`">
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold" :style="assetTypeStyle(asset.type)">{{ asset.type }}</span>
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </div>
        <div class="p-3">
          <p class="text-xs font-medium truncate" style="color:#ECECF5;">{{ asset.name }}</p>
          <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.35);">{{ asset.size }}</p>
        </div>
      </div>
    </div>

    <!-- Brand Kit -->
    <div class="card p-6">
      <h2 class="font-semibold mb-5" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Brand Kit</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p class="text-xs mb-3" style="color:rgba(236,236,245,0.4);">Warna brand</p>
          <div class="flex gap-2">
            <div class="w-9 h-9 rounded-lg" style="background:#8B5CF6;"></div>
            <div class="w-9 h-9 rounded-lg" style="background:#7C3AED;"></div>
            <div class="w-9 h-9 rounded-lg" style="background:#06B6D4;"></div>
            <button class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.15);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
        <div>
          <p class="text-xs mb-3" style="color:rgba(236,236,245,0.4);">Font</p>
          <p class="text-sm font-semibold" style="color:#ECECF5; font-family:'Space Grotesk',sans-serif;">Space Grotesk</p>
          <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.35);">Heading</p>
          <p class="text-sm font-medium mt-2" style="color:#ECECF5; font-family:'Manrope',sans-serif;">Manrope</p>
          <p class="text-xs mt-0.5" style="color:rgba(236,236,245,0.35);">Body</p>
        </div>
        <div>
          <p class="text-xs mb-3" style="color:rgba(236,236,245,0.4);">Logo</p>
          <div class="flex gap-3 items-center">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#8B5CF6,#22D3EE);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <button class="text-xs" style="color:#8B5CF6;">Ganti</button>
          </div>
        </div>
        <div>
          <p class="text-xs mb-3" style="color:rgba(236,236,245,0.4);">Voice default</p>
          <div class="flex items-center gap-2 px-3 py-2.5 rounded-xl" style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.25);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
            <span class="text-xs font-medium" style="color:#A78BFA;">Arjuna · Epik</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const activeTab = ref('Semua')
const search = ref('')
const assetTabs = ['Semua', 'Gambar', 'Audio', 'Video']

const assets = [
  { id: 1, name: 'majapahit_bg_01.jpg', type: 'IMG', size: '2.4 MB', preview: 'radial-gradient(100% 100% at 30% 20%,#3B2A6B,#10162E)' },
  { id: 2, name: 'voiceover_scene_01.mp3', type: 'AUDIO', size: '1.2 MB', preview: 'radial-gradient(100% 100% at 50% 50%,#0E4D5B,#0B2230)' },
  { id: 3, name: 'character_arjuna.png', type: 'IMG', size: '890 KB', preview: 'radial-gradient(100% 100% at 70% 30%,#5B2A52,#241030)' },
  { id: 4, name: 'bgm_epic_score.mp3', type: 'AUDIO', size: '3.1 MB', preview: 'radial-gradient(100% 100% at 20% 60%,#243B6B,#101A2E)' },
  { id: 5, name: 'thumbnail_v1.jpg', type: 'IMG', size: '456 KB', preview: 'radial-gradient(100% 100% at 80% 20%,#6B4A2A,#2E1E10)' },
  { id: 6, name: 'final_output.mp4', type: 'VIDEO', size: '245 MB', preview: 'radial-gradient(100% 100% at 40% 70%,#2A5B3B,#0E2418)' },
  { id: 7, name: 'sfx_whoosh_01.mp3', type: 'AUDIO', size: '128 KB', preview: 'radial-gradient(100% 100% at 60% 40%,#3B3B2A,#18180E)' },
  { id: 8, name: 'scene_09_bg.jpg', type: 'IMG', size: '1.8 MB', preview: 'radial-gradient(100% 100% at 30% 80%,#2A3B6B,#100E18)' },
]

const filteredAssets = computed(() => {
  const typeMap: Record<string, string> = { Gambar: 'IMG', Audio: 'AUDIO', Video: 'VIDEO' }
  return assets.filter(a => {
    const matchTab = activeTab.value === 'Semua' || a.type === typeMap[activeTab.value]
    const matchSearch = a.name.toLowerCase().includes(search.value.toLowerCase())
    return matchTab && matchSearch
  })
})

function assetTypeStyle(type: string) {
  const map: Record<string, string> = {
    IMG: 'background:rgba(139,92,246,0.8); color:#fff;',
    AUDIO: 'background:rgba(34,211,238,0.8); color:#06121A;',
    VIDEO: 'background:rgba(251,191,36,0.8); color:#1A1200;',
  }
  return map[type] || 'background:rgba(255,255,255,0.3); color:#fff;'
}
</script>
