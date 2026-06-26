<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-3xl font-bold text-primary-600">
          Vidara AI
        </NuxtLink>
        <p class="mt-2 text-sm text-gray-500">
          AI YouTube Video Generator
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
