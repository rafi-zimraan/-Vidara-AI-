<template>
  <div>
    <div class="flex items-end justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold mb-1" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Analytics</h1>
        <p class="text-sm" style="color:rgba(236,236,245,0.45);">Performa channel dan video AI kamu.</p>
      </div>
      <div class="flex gap-1 p-1 rounded-xl" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <button v-for="r in ranges" :key="r" @click="range = r"
          class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :style="range === r ? 'background:rgba(139,92,246,0.2); border:1px solid rgba(139,92,246,0.35); color:#C4B5FD;' : 'color:rgba(236,236,245,0.4); border:1px solid transparent;'">
          {{ r }}
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="kpi in kpis" :key="kpi.label" class="card p-5">
        <p class="text-xs font-medium mb-1.5" style="color:rgba(236,236,245,0.4); font-family:'Manrope',sans-serif;">{{ kpi.label }}</p>
        <p class="text-2xl font-bold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">{{ kpi.value }}</p>
        <p class="text-xs mt-1" :style="`color:${kpi.up ? '#22D3EE' : '#f87171'}`">
          {{ kpi.up ? '↑' : '↓' }} {{ kpi.delta }} {{ range }}
        </p>
      </div>
    </div>

    <!-- Chart + Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      <!-- Bar Chart Placeholder -->
      <div class="lg:col-span-2 card p-5">
        <h3 class="text-sm font-semibold mb-4" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Views per Hari</h3>
        <div class="flex items-end gap-1.5 h-36">
          <div v-for="(bar, i) in chartBars" :key="i" class="flex-1 rounded-t-md transition-all hover:opacity-80"
            :style="`height:${bar}%; background:linear-gradient(180deg,rgba(139,92,246,0.8),rgba(34,211,238,0.4));`">
          </div>
        </div>
        <div class="flex justify-between mt-2">
          <span v-for="label in chartLabels" :key="label" class="text-xs" style="color:rgba(236,236,245,0.3);">{{ label }}</span>
        </div>
      </div>

      <!-- Traffic Sources -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold mb-4" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Sumber Traffic</h3>
        <div class="space-y-3">
          <div v-for="src in sources" :key="src.name" class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full flex-shrink-0" :style="`background:${src.color};`"></div>
            <span class="text-xs flex-1" style="color:rgba(236,236,245,0.7);">{{ src.name }}</span>
            <span class="text-xs font-semibold" style="color:#ECECF5;">{{ src.pct }}%</span>
          </div>
          <div class="mt-2 h-2 rounded-full overflow-hidden flex" style="background:rgba(255,255,255,0.06);">
            <div v-for="src in sources" :key="src.name" class="h-full" :style="`width:${src.pct}%; background:${src.color};`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Videos Table -->
    <div class="card">
      <div class="px-5 py-4" style="border-bottom:1px solid rgba(255,255,255,0.06);">
        <h2 class="text-sm font-semibold" style="font-family:'Space Grotesk',sans-serif; color:#ECECF5;">Video Teratas</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <th class="px-5 py-3 text-left font-medium" style="color:rgba(236,236,245,0.4);">Judul</th>
              <th class="px-5 py-3 text-right font-medium" style="color:rgba(236,236,245,0.4);">Views</th>
              <th class="px-5 py-3 text-right font-medium" style="color:rgba(236,236,245,0.4);">Watch Time</th>
              <th class="px-5 py-3 text-right font-medium" style="color:rgba(236,236,245,0.4);">CTR</th>
              <th class="px-5 py-3 text-right font-medium" style="color:rgba(236,236,245,0.4);">Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="video in topVideos" :key="video.title"
              class="transition-colors hover:bg-white/[0.015]"
              style="border-bottom:1px solid rgba(255,255,255,0.04);">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-7 rounded flex-shrink-0" :style="`background:${video.thumb};`"></div>
                  <span class="font-medium truncate max-w-48" style="color:#ECECF5; font-family:'Manrope',sans-serif;">{{ video.title }}</span>
                </div>
              </td>
              <td class="px-5 py-3 text-right" style="color:rgba(236,236,245,0.7);">{{ video.views }}</td>
              <td class="px-5 py-3 text-right" style="color:rgba(236,236,245,0.7);">{{ video.watchTime }}</td>
              <td class="px-5 py-3 text-right" style="color:#22D3EE;">{{ video.ctr }}</td>
              <td class="px-5 py-3 text-right" style="color:#4ade80;">{{ video.revenue }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })

const range = ref('30D')
const ranges = ['7D', '30D', '90D']

const kpis = [
  { label: 'Total Views', value: '284K', delta: '+18%', up: true },
  { label: 'Watch Time (jam)', value: '12.4K', delta: '+22%', up: true },
  { label: 'Subscribers', value: '+1,240', delta: '+9%', up: true },
  { label: 'Estimasi Revenue', value: '$842', delta: '-4%', up: false },
]

const chartBars = [42, 58, 35, 70, 88, 52, 60, 75, 48, 90, 65, 80, 55, 72]
const chartLabels = ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25']

const sources = [
  { name: 'Browse features', color: '#8B5CF6', pct: 38 },
  { name: 'Suggested video', color: '#22D3EE', pct: 28 },
  { name: 'YouTube search', color: '#a78bfa', pct: 20 },
  { name: 'External', color: 'rgba(255,255,255,0.2)', pct: 14 },
]

const topVideos = [
  { title: 'Misteri Kerajaan Majapahit yang Jarang Diketahui', views: '48.2K', watchTime: '2.1K jam', ctr: '8.4%', revenue: '$124', thumb: 'linear-gradient(135deg,#3B2A6B,#10162E)' },
  { title: 'Mengapa Sriwijaya Menguasai Selat Malaka', views: '36.7K', watchTime: '1.6K jam', ctr: '7.1%', revenue: '$98', thumb: 'linear-gradient(135deg,#243B6B,#101A2E)' },
  { title: 'Rahasia Borobudur yang Belum Terjawab', views: '29.4K', watchTime: '1.3K jam', ctr: '9.2%', revenue: '$78', thumb: 'linear-gradient(135deg,#3B3B2A,#18180E)' },
  { title: 'Fakta Unik Penjelajah Nusantara di Abad 15', views: '22.1K', watchTime: '980 jam', ctr: '6.8%', revenue: '$61', thumb: 'linear-gradient(135deg,#2A5B3B,#0E2418)' },
  { title: 'Kisah Gajah Mada & Sumpah Palapa', views: '19.8K', watchTime: '870 jam', ctr: '7.5%', revenue: '$55', thumb: 'linear-gradient(135deg,#5B2A52,#241030)' },
]
</script>
