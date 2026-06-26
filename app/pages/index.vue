<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center max-w-3xl mx-auto">
        <h1 class="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Generate YouTube Videos
          <span class="text-primary-600">with AI</span>
        </h1>
        <p class="mt-6 text-lg text-gray-600">
          Transform your ideas into polished YouTube videos in minutes.
          Just enter a topic and let our AI agents handle the rest.
        </p>
        <div class="mt-10 flex items-center justify-center gap-4">
          <NuxtLink to="/auth/register"
            class="rounded-xl bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
            Get Started Free
          </NuxtLink>
          <NuxtLink to="/auth/login"
            class="rounded-xl border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Sign In
          </NuxtLink>
        </div>
      </div>

      <div class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.title"
          class="bg-white rounded-2xl p-8 border border-gray-200">
          <div class="text-3xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-lg font-semibold text-gray-900">{{ feature.title }}</h3>
          <p class="mt-2 text-sm text-gray-600">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const features = [
  {
    icon: '🎬',
    title: 'AI Script Writing',
    description: 'Generate engaging scripts with proper hooks, narrative arcs, and CTAs optimized for YouTube retention.',
  },
  {
    icon: '🎙️',
    title: 'Voiceovers & Subtitles',
    description: 'Natural-sounding TTS in multiple languages with auto-generated subtitles and translations.',
  },
  {
    icon: '🚀',
    title: 'One-Click Publishing',
    description: 'Auto-generate thumbnails, SEO metadata, and publish directly to YouTube with scheduled uploads.',
  },
]
</script>
