# Coding Standard — Vidara AI

> **Project:** Vidara AI — AI YouTube Video Generator SaaS  
> **Author:** Platform Engineering Team  
> **Last Updated:** 2026-06-26  
> **Status:** Approved  
> **Cross-Reference:** [Tech Stack](techstack.md) · [Architecture](architecture.md) · [DevOps](devops.md) · [Project Structure](project-structure.md)

---

## 1. Tujuan

Dokumen ini mendefinisikan coding standards dan conventions untuk seluruh codebase Vidara AI. Mencakup TypeScript, Vue/Nuxt, CSS, testing, Git, dan project configuration. Bertujuan memastikan konsistensi, readability, dan maintainability kode di seluruh tim pengembangan.

---

## 2. General Principles

### 2.1 Clean Code

| Principle | Penerapan |
|---|---|
| Meaningful names | Nama function/variable harus menjelaskan intent (bukan `getData()` tapi `fetchProjectById()`) |
| Functions do one thing | Setiap function maksimal 30 baris, satu level abstraction |
| DRY (Don't Repeat Yourself) | Extract repeated logic ke composable, utility, atau shared module |
| Small files | Maksimal 200 baris per file Vue, 300 baris per file TypeScript |
| No commented code | Hapus, jangan comment out. Git sudah menyimpan history |
| No magic numbers/strings | Gunakan constants atau enums, lihat `techstack.md` §15 untuk referensi |

### 2.2 SOLID

| Principle | Vue/Nuxt Implementation |
|---|---|
| **S**ingle Responsibility | Satu component/satu store/satu composable untuk satu tanggung jawab |
| **O**pen/Closed | Extend via composables, props, slots — jangan modify base component |
| **L**iskov Substitution | Props interface harus proper subset; child bisa menggantikan parent |
| **I**nterface Segregation | Props kecil dan spesifik per component, bukan satu large props object |
| **D**ependency Inversion | Components depend on abstractions (interfaces/types), not concrete implementations |

### 2.3 DRY, KISS, YAGNI

| Acronym | Makna | Implementation |
|---|---|---|
| DRY | Don't Repeat Yourself | Shared types in `@vidara/shared`, composables, utils |
| KISS | Keep It Simple, Stupid | Prefer simple composable over complex class hierarchy |
| YAGNI | You Ain't Gonna Need It | Build only for current requirement, not future speculation |

---

## 3. TypeScript Standards

### 3.1 Strict TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "paths": {
      "~/*": ["./app/*"],
      "@/*": ["./*"],
      "@vidara/shared": ["./packages/shared/src"],
      "@vidara/ai-gateway": ["./packages/ai-gateway/src"],
      "@vidara/db": ["./packages/db/src"]
    }
  }
}
```

### 3.2 Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `VideoEditor.vue`, `ProjectCard.vue` |
| Types/Interfaces | PascalCase | `UserProfile`, `VideoConfig`, `IPipelineStep` |
| Classes | PascalCase | `AuthService`, `JobQueue` |
| Functions | camelCase | `fetchProject()`, `useAuth()` |
| Variables | camelCase | `projectList`, `activeTab` |
| Composables | camelCase (use-prefix) | `useAuth()`, `useVideo()`, `useOrganization()` |
| Files/Directories | kebab-case | `video-editor.vue`, `project-card.vue` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Enums | PascalCase (members UPPER_CASE) | `ProjectStatus.COMPLETED` |
| Event names | kebab-case | `@update:model-value`, `@video-ready` |
| Pinia stores | camelCase (refs prefixed use) | `useAuthStore()`, `useProjectStore()` |

### 3.3 Type vs Interface Guidelines

Gunakan **interface** untuk:
- Public API contracts (props, emits, API responses)
- Object shapes yang akan diextend/diimplement
- Library/public module definitions

Gunakan **type** untuk:
- Union types (`type Status = 'idle' | 'loading' | 'success' | 'error'`)
- Intersection types (`type ProjectWithUser = Project & { user: User }`)
- Primitive aliases (`type ProjectId = string`)
- Utility types (`type Nullable<T> = T | null`)

```typescript
// Interface untuk API contracts
export interface ProjectCreateRequest {
  title: string
  prompt: string
  config: VideoConfig
}

export interface ProjectResponse {
  id: string
  title: string
  status: ProjectStatus
  createdAt: string
}

// Type untuk unions dan utilities
export type ProjectStatus = 'draft' | 'queued' | 'processing' | 'completed' | 'failed'

export type Nullable<T> = T | null

export type VideoConfig = {
  resolution: '720p' | '1080p' | '4k'
  language: string
  duration: number
}
```

### 3.4 Generic Naming Conventions

```typescript
// Single generic: T (Type), K (Key), V (Value), E (Element)
function mapById<T extends { id: string }>(items: T[]): Map<string, T>

// Multiple generics: descriptive names
function createPair<KeyType, ValueType>(key: KeyType, value: ValueType): Pair<KeyType, ValueType>

// Constrained generics
function processVideo<T extends VideoAsset>(asset: T): ProcessedVideo
```

### 3.5 Utility Types Usage

```typescript
// Partial untuk updates
export interface UpdateProjectPayload extends Partial<ProjectCreateRequest> {}

// Pick untuk subset props
export type ProjectSummary = Pick<ProjectResponse, 'id' | 'title' | 'status'>

// Omit untuk exclude
export type ProjectWithoutConfig = Omit<ProjectResponse, 'config'>

// Record untuk dictionary
export type ProjectMap = Record<string, ProjectResponse>

// Readonly untuk immutable
export type ImmutableProject = Readonly<ProjectResponse>
```

### 3.6 Import Ordering Rules

Urutan import (dipisah baris kosong antar group):

```typescript
// 1. Node built-in
import { readFile } from 'node:fs'
import { resolve } from 'node:path'

// 2. Third-party
import { defineNuxtConfig } from 'nuxt/config'
import { z } from 'zod'
import { Temporal } from '@temporalio/workflow'

// 3. Internal packages (monorepo)
import { ProjectStatus } from '@vidara/shared/types'
import { AIGateway } from '@vidara/ai-gateway'

// 4. Absolute imports (aliases)
import { useAuth } from '~/composables/useAuth'
import { apiClient } from '~/utils/api-client'

// 5. Relative imports
import { ProjectCard } from './ProjectCard.vue'
import { formatDuration } from '../utils/format'
```

### 3.7 No `any` — Use `unknown` Instead

```typescript
// ❌ NEVER — bypasses type checking
const data: any = await fetchApi()

// ✅ ALWAYS — forces type narrowing
const data: unknown = await fetchApi()
if (isProjectResponse(data)) {
  processProject(data)
}
```

### 3.8 Nullable Handling

```typescript
// Optional chaining
const userName = user?.profile?.name ?? 'Anonymous'

// Nullish coalescing
const timeout = config.timeout ?? 30000

// Null check narrowing
function processProject(project: Project | null): void {
  if (!project) return
  // TypeScript narrows to Project
  console.log(project.title)
}

// No non-null assertion unless ABSOLUTELY sure
const el = document.getElementById('app')! // ❌ avoid
const el = document.getElementById('app')  // ✅ prefer
if (el) { /* use el */ }
```

---

## 4. Vue / Nuxt Standards

### 4.1 Composition API Only

```vue
<script setup lang="ts">
// ✅ ALWAYS — Composition API dengan <script setup>
const count = ref(0)
const increment = () => count.value++
</script>
```

```vue
<script>
export default {
  // ❌ NEVER — Options API
  data() { return { count: 0 } },
  methods: { increment() { this.count++ } }
}
</script>
```

### 4.2 `<script setup lang="ts">` Mandatory

- Semua component Vue WAJIB menggunakan `<script setup lang="ts">`
- No `export default` in components
- Template refs menggunakan `ref<HTMLElement | null>(null)` dengan tipe eksplisit

### 4.3 Component Naming

| Convention | Rule | Example |
|---|---|---|
| Multi-word | Always (kecuali `index.vue`, `error.vue`, `app.vue`) | `VideoPlayer.vue` ✅, `Video.vue` ❌ |
| P prefix | Pages directory | `pages/project/[id]/index.vue` → `PProjectDetail.vue` (cara Nuxt 4 resolve) |
| Base prefix | Base/primitive UI components | `BaseButton.vue`, `BaseInput.vue` |
| Feature prefix | Feature-specific components | `ProjectCard.vue`, `EditorTimeline.vue` |

### 4.4 Composable Naming

```typescript
// Semua composables harus diawali use*
export function useAuth() { ... }
export function useVideo(projectId: string) { ... }
export function useOrganization() { ... }
export function useSubscription() { ... }

// Return object, NOT single value
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  return { count, increment, decrement }
}
```

### 4.5 Server Route Naming Conventions

```
server/api/
├── auth/
│   ├── login.post.ts         → POST /api/auth/login
│   ├── register.post.ts      → POST /api/auth/register
│   ├── callback.get.ts       → GET /api/auth/callback
│   └── refresh.post.ts       → POST /api/auth/refresh
├── projects/
│   ├── index.get.ts          → GET /api/projects
│   ├── index.post.ts         → POST /api/projects
│   └── [id]/
│       ├── index.get.ts      → GET /api/projects/:id
│       ├── index.patch.ts    → PATCH /api/projects/:id
│       └── index.delete.ts   → DELETE /api/projects/:id
└── health.get.ts             → GET /api/health
```

### 4.6 Middleware Naming and Placement

```
middleware/
├── auth.ts              // Global, runs on every route change
├── organization.ts      // Global, attaches org context
├── audit.ts             // Global, logs page views
├── subscription.ts      // Global, checks plan limits

// Per-page middleware in pages/ (Nuxt 4 convention)
pages/
├── dashboard.vue        // definePageMeta({ middleware: 'auth' })
└── billing/
    └── index.vue        // definePageMeta({ middleware: ['auth', 'subscription'] })
```

### 4.7 Plugin Registration Pattern

```typescript
// plugins/api-client.ts
export default defineNuxtPlugin(() => {
  const apiClient = createApiClient()
  return {
    provide: {
      api: apiClient,
    },
  }
})

// Usage: const { $api } = useNuxtApp()
```

```typescript
// plugins/sentry.ts
export default defineNuxtPlugin((nuxtApp) => {
  const sentry = Sentry.init({
    dsn: useRuntimeConfig().public.sentryDsn,
    environment: useRuntimeConfig().public.nodeEnv,
  })
  nuxtApp.vueApp.config.errorHandler = (err) => {
    sentry.captureException(err)
  }
})
```

### 4.8 Module Configuration Pattern

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@hebilicious/form-actions-nuxt',
    '~/modules/custom-module',
  ],

  // Module-specific config
  ui: {
    icons: ['heroicons', 'simple-icons'],
    safelistColors: ['primary', 'secondary', 'danger'],
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },
})
```

---

## 5. Nuxt 4 Conventions

### 5.1 Directory Structure Compliance

Referensi lengkap di `project-structure.md`. Aturan utama:

| Directory | Purpose | Auto-import |
|---|---|---|
| `components/` | Vue components | ✅ Yes |
| `composables/` | Vue composables | ✅ Yes |
| `utils/` | Utility functions | ✅ Yes |
| `server/` | Server-side code (Nitro) | ✅ Yes |
| `pages/` | File-based routing | ✅ Yes (dynamic) |
| `layouts/` | Page layouts | ✅ Yes |
| `middleware/` | Route middleware | ✅ Yes |
| `plugins/` | Vue/Nuxt plugins | ✅ Yes (once) |

### 5.2 Auto-Import Usage Guidelines

- Jangan import manual apapun yang sudah auto-imported oleh Nuxt 4
- Referensi: `useState`, `useFetch`, `useAsyncData`, `ref`, `computed`, `watch`, dll
- Composables kita: `useAuth()`, `useVideo()` — auto-imported from `composables/`
- Components: `VideoEditor`, `ProjectCard` — auto-imported from `components/`
- Utils: `formatDuration()`, `generateSlug()` — auto-imported from `utils/`

```typescript
// ❌ JANGAN — sudah auto-import
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

// ✅ LANGSUNG pakai
const count = ref(0)
const { user, login } = useAuth()
```

### 5.3 Server Component vs Client Component Decisions

| Use Server Components when | Use Client Components when |
|---|---|
| Data fetching dari database | Interactive UI (forms, drag-drop) |
| Rendering static content | Real-time updates (WebSocket) |
| SEO-critical content | Browser API access (localStorage) |
| Initial page load performance | Complex animations |
| Non-interactive lists/tables | Third-party client libraries |

```vue
<!-- Server Component (default di Nuxt 4) -->
<script setup lang="ts">
const projects = await $fetch('/api/projects')
</script>

<template>
  <ProjectList :projects="projects" />
</template>
```

```vue
<!-- Client Component — explicit directive -->
<script setup lang="ts">
const { video, startRender } = useVideo()
</script>

<template>
  <div client:load>
    <button @click="startRender">Render Video</button>
  </div>
</template>
```

### 5.4 `server/` Routes and Middleware

```
server/
├── api/              # REST API endpoints → auto-routed
│   ├── auth/
│   └── projects/
├── middleware/        # Server middleware (auth, rate-limit, CORS)
│   ├── auth.ts
│   ├── rate-limit.ts
│   └── cors.ts
├── utils/            # Server utilities (not auto-imported outside server/)
│   ├── db.ts
│   ├── redis.ts
│   └── minio.ts
└── plugins/          # Nitro plugins (lifecycle hooks)
    ├── websocket.ts
    └── sentry.ts
```

### 5.5 Composables Organization

```
composables/
├── useAuth.ts              # Auth state, login, logout, tokens
├── useVideo.ts             # Video CRUD, pipeline status
├── useOrganization.ts      # Organization context, member management
├── useSubscription.ts      # Plan info, limits, billing
├── useProject.ts           # Project CRUD, list, search
├── useWebSocket.ts         # WebSocket connection, event handlers
├── useMediaUpload.ts       # Upload to MinIO with progress
├── usePagination.ts        # Pagination state and logic
├── useDebounce.ts          # Debounced value
└── useBreakpoints.ts       # Responsive breakpoints
```

### 5.6 Utils Helpers

```
utils/
├── format.ts               # formatDuration(), formatDate(), formatBytes()
├── validation.ts           # validateEmail(), validateUrl(), validatePrompt()
├── slug.ts                 # generateSlug(), slugify()
├── api-client.ts           # Wrapper around $fetch with auth headers
├── youtube.ts              # YouTube URL parsing, duration formatting
└── constants.ts            # API_BASE_URL, MAX_UPLOAD_SIZE, etc.
```

### 5.7 Pages Routing Conventions

```
pages/
├── index.vue                          → /
├── auth/
│   ├── login.vue                      → /auth/login
│   ├── register.vue                   → /auth/register
│   └── callback.vue                   → /auth/callback
├── dashboard.vue                      → /dashboard
├── workspace.vue                      → /workspace
├── project/
│   └── [id]/
│       ├── index.vue                  → /project/:id
│       ├── script.vue                 → /project/:id/script
│       ├── scenes.vue                 → /project/:id/scenes
│       ├── images.vue                 → /project/:id/images
│       ├── voice.vue                  → /project/:id/voice
│       ├── compose.vue                → /project/:id/compose
│       ├── thumbnail.vue              → /project/:id/thumbnail
│       └── publish.vue                → /project/:id/publish
├── settings/
│   ├── index.vue                      → /settings
│   ├── profile.vue                    → /settings/profile
│   ├── billing.vue                    → /settings/billing
│   └── api-keys.vue                   → /settings/api-keys
├── billing/
│   ├── index.vue                      → /billing
│   ├── plans.vue                      → /billing/plans
│   └── invoices.vue                   → /billing/invoices
└── analytics.vue                      → /analytics
```

### 5.8 Layouts Naming

```
layouts/
├── default.vue          # Default layout — navbar + sidebar + footer
├── auth.vue             # Auth pages — centered card, no sidebar
├── workspace.vue        # Workspace layout — full-screen editor
├── admin.vue            # Admin panel — admin navigation
└── minimal.vue          # Minimal — blank canvas for landing pages
```

### 5.9 `app.config.ts` vs Runtime Config

| Config Type | Use Case | Access |
|---|---|---|
| `app.config.ts` | Public, client-safe config | `useAppConfig()` |
| `runtimeConfig` | Private, env-based secrets | `useRuntimeConfig()` |
| `runtimeConfig.public` | Public but env-based | `useRuntimeConfig().public` |

```typescript
// app.config.ts — public, bundled
export default defineAppConfig({
  ui: {
    primary: 'indigo',
    gray: 'slate',
  },
  vidara: {
    maxUploadSize: 100 * 1024 * 1024,
    supportedLanguages: ['en', 'id', 'es', 'fr', 'de'],
    videoResolutions: ['720p', '1080p', '4k'],
  },
})

// nuxt.config.ts → runtimeConfig — secret, env-based
export default defineNuxtConfig({
  runtimeConfig: {
    openAiKey: '',
    jwtSecret: '',
    stripeSecret: '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      sentryDsn: '',
    },
  },
})
```

---

## 6. Nuxt UI 4 Standards

### 6.1 Component Usage Conventions

Referensi techstack.md §15.1 untuk justifikasi Nuxt UI 4.

```vue
<template>
  <!-- ✅ Pakai Nuxt UI components bawaan -->
  <UButton variant="solid" color="primary" size="md" :loading="isLoading">
    Generate Video
  </UButton>

  <UInput v-model="search" placeholder="Search projects..." size="sm" />
  <USelectMenu v-model="sort" :options="sortOptions" />

  <!-- ❌ JANGAN buat custom button/input sendiri -->
  <button class="px-4 py-2 bg-indigo-600 text-white rounded">Generate Video</button>
</template>
```

### 6.2 Theme Customization (Override vs Extend)

```typescript
// app.config.ts — override Nuxt UI theme
export default defineAppConfig({
  ui: {
    primary: 'indigo',
    gray: 'slate',
    button: {
      default: {
        size: 'md',
        variant: 'solid',
      },
      rounded: 'lg',
    },
    input: {
      default: {
        size: 'md',
      },
      rounded: 'lg',
    },
    card: {
      rounded: 'xl',
      shadow: 'lg',
      header: {
        padding: 'px-4 py-3',
      },
      body: {
        padding: 'p-4',
      },
    },
  },
})
```

### 6.3 Design Token Usage (Never Hardcode)

```vue
<template>
  <!-- ✅ Pakai design tokens / Tailwind utility classes -->
  <div class="bg-primary-50 dark:bg-primary-900 rounded-xl p-4 shadow-sm">
    <p class="text-primary-700 dark:text-primary-200">Project stats</p>
    <p class="text-2xl font-bold text-primary-600 dark:text-primary-300">
      {{ projectCount }}
    </p>
  </div>
</template>
```

```vue
<!-- ❌ NEVER hardcode colors, spacing, fonts -->
<div style="background-color: #eef2ff; border-radius: 12px; padding: 16px;">
  <p style="color: #4338ca; font-size: 24px;">{{ projectCount }}</p>
</div>
```

### 6.4 Dark/Light Mode Handling

```vue
<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UButton
    :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
    @click="toggleColorMode"
  />

  <!-- Dark mode classes dengan prefix dark: -->
  <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    Content adapts to theme
  </div>
</template>
```

### 6.5 Responsive Design Patterns

```vue
<template>
  <!-- Tailwind responsive prefixes -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

    <!-- Hide/show based on breakpoint -->
    <USidebar class="hidden lg:block" />
    <UMain class="lg:ml-64">

    <!-- Responsive typography -->
    <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold">

    <!-- Responsive padding -->
    <div class="p-4 sm:p-6 lg:p-8">
  </div>
</template>
```

---

## 7. CSS Standards

### 7.1 Tailwind CSS v4 (Utility-First)

Referensi techstack.md §15 untuk justifikasi Tailwind v4.

```vue
<template>
  <!-- Utility-first dengan Tailwind v4 -->
  <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-3">
      <UIcon name="i-heroicons-video-camera" class="w-5 h-5 text-primary-500" />
      <div>
        <p class="font-medium text-gray-900 dark:text-gray-100">{{ project.title }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(project.createdAt) }}</p>
      </div>
    </div>
    <UBadge :color="statusColor">{{ project.status }}</UBadge>
  </div>
</template>
```

### 7.2 Custom CSS Only When Tailwind Cannot Achieve

```vue
<style scoped>
/* ✅ Custom CSS hanya jika Tailwind benar-benar tidak bisa */
.video-player-container {
  aspect-ratio: 16 / 9;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
}

.recording-indicator {
  animation: pulse-glow 2s infinite;
}
</style>

<style>
/* ❌ Avoid global unscoped styles — use Tailwind @apply instead */
.btn-custom { @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 }
</style>
```

### 7.3 CSS Variables for Design Tokens

```css
/* assets/css/main.css */
@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', sans-serif;
  --font-display: 'Plus Jakarta Sans', sans-serif;

  --color-vidara-50: #eef2ff;
  --color-vidara-100: #e0e7ff;
  --color-vidara-200: #c7d2fe;
  --color-vidara-300: #a5b4fc;
  --color-vidara-400: #818cf8;
  --color-vidara-500: #6366f1;
  --color-vidara-600: #4f46e5;
  --color-vidara-700: #4338ca;
  --color-vidara-800: #3730a3;
  --color-vidara-900: #312e81;

  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### 7.4 Component-Scoped Styles

```vue
<style scoped>
/* ✅ Always use scoped styles for component-specific CSS */
.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-2px);
}
</style>
```

### 7.5 BEM for Custom Component CSS (When Needed)

```vue
<style scoped>
/* Block__Element--Modifier naming jika perlu custom CSS */
.timeline {}
.timeline__track {}
.timeline__track--active {}
.timeline__clip {}
.timeline__clip--selected {}
.timeline__clip--dragging {}
</style>
```

---

## 8. Testing Standards

### 8.1 Test File Naming

| Test Type | Pattern | Location |
|---|---|---|
| Unit tests | `*.test.ts` atau `*.spec.ts` | `__tests__/` di samping source |
| Integration tests | `*.integration.test.ts` | `tests/integration/` |
| E2E tests | `*.e2e.spec.ts` | `tests/e2e/` |
| Component tests | `*.component.test.ts` | `__tests__/` di samping component |
| Store tests | `*.store.test.ts` | `__tests__/` di samping store |

### 8.2 Test Structure (describe → it → expect)

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('useVideo composable', () => {
  let video: ReturnType<typeof useVideo>

  beforeEach(() => {
    video = useVideo()
  })

  describe('createProject', () => {
    it('should create a project with default status "draft"', async () => {
      const project = await video.createProject({ title: 'Test', prompt: 'Hello' })
      expect(project.status).toBe('draft')
      expect(project.title).toBe('Test')
    })

    it('should throw when prompt is empty', async () => {
      await expect(video.createProject({ title: 'Test', prompt: '' }))
        .rejects.toThrow('Prompt cannot be empty')
    })
  })

  describe('getProjectById', () => {
    it('should return null for non-existent project', async () => {
      const result = await video.getProjectById('non-existent')
      expect(result).toBeNull()
    })
  })
})
```

### 8.3 Mocking Guidelines

```typescript
// ✅ Mock external APIs
vi.mock('~/utils/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

// ✅ Mock composables
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ id: 'user-1', name: 'Test User' }),
    isAuthenticated: ref(true),
  }),
}))

// ✅ Mock Pinia stores
import { setActivePinia, createPinia } from 'pinia'
beforeEach(() => {
  setActivePinia(createPinia())
})

// ✅ Mock third-party libraries
vi.mock('@temporalio/workflow', () => ({
  proxyActivities: vi.fn(),
  // ... other exports
}))
```

### 8.4 Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      include: [
        'composables/**/*.ts',
        'utils/**/*.ts',
        'stores/**/*.ts',
        'server/utils/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.config.ts',
        'server/database/migrations/**',
        'server/database/seeds/**',
      ],
    },
  },
})
```

---

## 9. Git Standards

### 9.1 Branch Naming

Referensi devops.md §6 untuk branching strategy.

| Branch | Pattern | Example |
|---|---|---|
| Feature | `feature/<slug>` | `feature/video-pipeline` |
| Bugfix | `bugfix/<issue>-<slug>` | `bugfix/142-fix-retry-logic` |
| Hotfix | `hotfix/<issue>-<slug>` | `hotfix/156-critical-auth-fix` |
| Release | `release/<version>` | `release/v1.2.0` |
| Chore | `chore/<slug>` | `chore/update-deps` |

### 9.2 Commit Message Format (Conventional Commits)

```bash
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Type | Usage | Example |
|---|---|---|
| `feat` | New feature | `feat(pipeline): add temporal workflow compensation` |
| `fix` | Bug fix | `fix(queue): fix BullMQ timeout on long renders` |
| `chore` | Maintenance | `chore(deps): update nuxt to 4.0.1` |
| `docs` | Documentation | `docs(coding): add TypeScript section` |
| `refactor` | Code restructure | `refactor(api): extract auth middleware` |
| `test` | Tests | `test(pipeline): add failure injection tests` |
| `perf` | Performance | `perf(render): enable NVENC hardware encoding` |
| `style` | Formatting | `style(imports): reorder imports` |
| `ci` | CI/CD | `ci(actions): parallelize test stages` |
| `build` | Build | `build(deps): upgrade pnpm to v9` |
| `revert` | Revert | `revert: revert feat(pipeline) due to regression` |
| `security` | Security fix | `security(auth): rotate JWT signing key` |

### 9.3 PR Size Guidelines

- Maksimal **400 lines** perubahan per PR (exclude lockfile, generated files)
- PR >400 lines harus di-breakdown menjadi multiple PRs
- Setiap PR harus memiliki:
  - Deskripsi jelas (what & why)
  - Screenshot/GIF untuk UI changes
  - Testing notes
  - Cross-reference ke issue/linear ticket

### 9.4 Code Review Checklist

- [ ] TypeScript strict mode tidak dilanggar (no `any`, no `@ts-ignore`)
- [ ] Naming conventions diikuti (PascalCase, camelCase, kebab-case)
- [ ] Auto-imports digunakan, tidak ada import redundant
- [ ] Tidak ada hardcoded values (magic numbers/strings)
- [ ] Component menggunakan `<script setup lang="ts">`
- [ ] No Options API
- [ ] CSS menggunakan Tailwind utility classes (no custom CSS jika bisa)
- [ ] Design tokens digunakan, bukan nilai hardcoded
- [ ] Dark mode support ada untuk komponen baru
- [ ] Tests ditambahkan untuk logic baru
- [ ] Error handling untuk semua async operations
- [ ] No console.log (gunakan logger dari utils)
- [ ] Branch di-rebase dari main sebelum merge
- [ ] PR description lengkap

---

## 10. Project Configuration

### 10.1 ESLint + Prettier Configuration

```typescript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    semi: false,
    indent: 2,
    quotes: 'single',
  },
  vue: true,
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  rules: {
    'vue/component-name-in-template-casing': ['error', 'PascalCase', {
      registeredComponentsOnly: false,
    }],
    'vue/multi-word-component-names': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'import/order': ['warn', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
    }],
  },
  ignores: [
    '.output/',
    '.nuxt/',
    'dist/',
    'node_modules/',
    '**/*.config.*',
  ],
})
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 10.2 EditorConfig

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2
```

### 10.3 VSCode Settings Recommendations

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue",
    "html",
    "json",
    "yaml",
    "markdown"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "vue.features": {
    "ide": true,
    "hover": true,
    "completion": true,
    "diagnostics": true
  },
  "tailwindCSS.experimental.configFile": "tailwind.config.ts",
  "tailwindCSS.classAttributes": ["class", "className", "ngClass", "ui"],
  "files.exclude": {
    "**/.nuxt": true,
    "**/.output": true,
    "**/node_modules": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/.nuxt": true,
    "**/.output": true,
    "**/pnpm-lock.yaml": true,
    "**/node_modules": true,
    "**/dist": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "vue.volar",
    "nuxtr.nuxtr",
    "antfu.iconify",
    "vitest.explorer",
    "ms-playwright.playwright",
    "ms-vscode.vscode-typescript-next",
    "github.vscode-github-actions",
    "eamodio.gitlens",
    "mikestead.dotenv",
    "yzhang.markdown-all-in-one",
    "bierner.markdown-mermaid",
    "christian-kohler.path-intellisense",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### 10.4 Husky Pre-Commit Hooks

```bash
#!/bin/sh
# .husky/pre-commit

# 1. Lint-staged
npx lint-staged

# 2. Type check
pnpm typecheck --noEmit

# 3. Unit tests (affected files only)
pnpm test -- --changed --coverage.enabled=false
```

```bash
#!/bin/sh
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

### 10.5 Lint-Staged Configuration

```json
{
  "*.{ts,vue}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,yaml,yml,md}": [
    "prettier --write"
  ],
  "*.css": [
    "prettier --write"
  ],
  "package.json": [
    "sort-package-json"
  ],
  "pnpm-lock.yaml": []
}
```

---

## 11. Code Organization Patterns

### 11.1 Feature-First vs Layer-First

Referensi architecture.md §20 untuk module structure.

```
// LAYER-FIRST (primary pattern untuk API layer)
server/
├── api/
│   ├── auth/         # Auth feature
│   ├── projects/     # Projects feature
│   ├── billing/      # Billing feature
│   └── admin/        # Admin feature
├── middleware/        # Cross-cutting (shared layer)
├── utils/            # Utilities (shared layer)
└── plugins/          # Plugins (shared layer)

// FEATURE-FIRST (alternatif untuk complex features)
features/
├── video-pipeline/
│   ├── components/
│   ├── composables/
│   ├── stores/
│   ├── server/
│   │   ├── api/
│   │   └── services/
│   └── types/
├── billing/
│   ├── components/
│   ├── composables/
│   ├── stores/
│   ├── server/
│   │   ├── api/
│   │   └── services/
│   └── types/
```

### 11.2 Module Dependency Rules

```
app/ (Nuxt 4)
  ↓
packages/shared (types, constants, validators)
  ↓
packages/ai-gateway (AI provider abstraction)
  ↓
packages/db (database schema, client, migrations)
  ↓
server/ (Nitro API, middleware, plugins)
```

- **Layers must only depend on layers above** (shared ← ai-gateway ← db ← server)
- **No circular dependencies** — enforce via `dpdm` in CI
- **packages/shared** should have ZERO dependencies (pure types/constants)
- **packages/ai-gateway** depends only on shared
- **packages/db** depends only on shared

### 11.3 File Naming Per Directory

Referensi project-structure.md untuk detail per directory.

| Directory | Pattern | Example |
|---|---|---|
| `components/` | `PascalCase.vue` | `VideoEditor.vue` |
| `composables/` | `use*.ts` | `useAuth.ts` |
| `utils/` | `kebab-case.ts` | `format-duration.ts` |
| `stores/` | `kebab-case.store.ts` | `project.store.ts` |
| `pages/` | `kebab-case.vue` | `video-editor.vue` |
| `layouts/` | `kebab-case.vue` | `workspace.vue` |
| `middleware/` | `kebab-case.ts` | `auth.ts` |
| `plugins/` | `kebab-case.ts` | `api-client.ts` |
| `server/api/` | `kebab-case.{get|post|put|delete|patch}.ts` | `projects.[id].get.ts` |
| `server/middleware/` | `kebab-case.ts` | `rate-limit.ts` |
| `server/utils/` | `kebab-case.ts` | `db.ts` |
| `server/services/` | `kebab-case.ts` | `ai-pipeline.ts` |
| `server/database/` | `kebab-case.ts` | `project.schema.ts` |

---

## 12. Error Handling Patterns

### 12.1 API Error Response Format

```typescript
// Standard API error response
export interface ApiError {
  statusCode: number
  message: string
  code: string  // Machine-readable error code
  details?: Record<string, string[]>  // Validation errors per field
  requestId?: string  // Trace ID for debugging
}

// Usage in server routes
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = validateProjectCreate(body)
    if (!validated.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: {
          code: 'VALIDATION_ERROR',
          details: validated.error.flatten().fieldErrors,
        },
      })
    }
    // ...
  } catch (error) {
    if (error instanceof AppError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        data: { code: error.code },
      })
    }
    // Unexpected error — log and return generic
    captureError(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { code: 'INTERNAL_ERROR', requestId: event.context.requestId },
    })
  }
})
```

### 12.2 Frontend Error Handling

```typescript
// composables/useApi.ts
export function useApi() {
  const { $api } = useNuxtApp()
  const toast = useToast()

  async function handleRequest<T>(request: Promise<T>): Promise<T | null> {
    try {
      return await request
    } catch (error) {
      if (isApiError(error)) {
        toast.add({
          title: 'Error',
          description: error.message,
          color: 'red',
          icon: 'i-heroicons-exclamation-triangle',
        })
        captureSentryError(error)
      }
      return null
    }
  }

  return {
    get: <T>(url: string) => handleRequest($api.get<T>(url)),
    post: <T>(url: string, body: unknown) => handleRequest($api.post<T>(url, body)),
    patch: <T>(url: string, body: unknown) => handleRequest($api.patch<T>(url, body)),
    delete: <T>(url: string) => handleRequest($api.delete<T>(url)),
  }
}
```

---

## 13. Accessibility Standards

### 13.1 Aria Attributes

```vue
<template>
  <button
    aria-label="Play video"
    aria-pressed="isPlaying"
    @click="togglePlay"
  >
    <UIcon :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" />
  </button>

  <div role="progressbar" aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
    {{ progress }}%
  </div>
</template>
```

### 13.2 Keyboard Navigation

```vue
<script setup lang="ts">
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectItem()
      break
    case 'ArrowDown':
      event.preventDefault()
      focusNext()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPrevious()
      break
    case 'Escape':
      close()
      break
  }
}
</script>

<template>
  <div
    role="listbox"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <slot />
  </div>
</template>
```

---

## 14. Performance Standards

```typescript
// 1. Lazy load components
const VideoEditor = defineAsyncComponent(() => import('~/components/editor/VideoEditor.vue'))

// 2. Use computed over method calls in template
const fullName = computed(() => `${user.firstName} ${user.lastName}`)

// 3. Debounce rapid events
const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 300)

// 4. Virtual scrolling for long lists
const { list, containerProps, wrapperProps } = useVirtualList(projects, {
  itemHeight: 72,
  overscan: 5,
})

// 5. Image optimization
<NuxtImg
  provider="cloudflare"
  format="webp"
  quality="80"
  sizes="sm:100vw md:50vw lg:400px"
  :src="project.thumbnailUrl"
/>

// 6. Avoid unnecessary re-renders
const items = ref(useArrayMap(projects, formatProject))
```

---

## 15. Security Standards

### 15.1 Input Validation

```typescript
// ✅ Always validate and sanitize user input
const schema = z.object({
  title: z.string().min(3).max(200).trim(),
  prompt: z.string().min(10).max(5000).trim(),
  config: z.object({
    resolution: z.enum(['720p', '1080p', '4k']),
    language: z.string().max(10),
  }),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse)
  // body is now fully validated and typed
})
```

### 15.2 Authentication & Authorization

```typescript
// ✅ Always protect routes with auth middleware
export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)  // Throws 401 if not authenticated

  // Resource-based authorization
  const project = await getProject(event.context.params!.id)
  if (project.userId !== user.id && user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { code: 'FORBIDDEN' },
    })
  }

  return project
})
```

---

## 16. Logging Standards

```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, ...context, timestamp: new Date().toISOString() }))
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...context, timestamp: new Date().toISOString() }))
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      ...context,
      timestamp: new Date().toISOString(),
    }))
  },
}

// ❌ Never use raw console.log/error in production code
// ✅ Use logger with structured JSON output
```

---

## 17. Documentation Standards

```typescript
// ✅ Document composables with JSDoc
/**
 * Manages video generation pipeline state.
 *
 * @param projectId - The project ID to track
 * @returns Pipeline state and control functions
 *
 * @example
 * const { status, progress, startPipeline } = useVideo('proj-123')
 * await startPipeline()
 * watch(status, (newStatus) => {
 *   console.log('Pipeline status:', newStatus)
 * })
 */
export function useVideo(projectId: string) {
  // ...
}
```

```typescript
// ✅ Document types/interfaces
/**
 * Configuration for video generation pipeline.
 * Referensi: workflow.md §9 untuk pipeline steps
 */
export interface VideoConfig {
  /** Video resolution (must be supported by FFmpeg NVENC) */
  resolution: '720p' | '1080p' | '4k'
  /** ISO language code */
  language: string
  /** Target duration in seconds (min: 60, max: 3600) */
  duration: number
}
```

---

## 18. State Management Standards

### 18.1 Pinia Store Patterns

```typescript
// stores/project.store.ts
export const useProjectStore = defineStore('project', () => {
  // State — always typed
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters — menggunakan computed
  const activeProjects = computed(() =>
    projects.value.filter(p => p.status !== 'completed'),
  )
  const projectCount = computed(() => projects.value.length)

  // Actions — async operations
  async function fetchProjects() {
    isLoading.value = true
    error.value = null
    try {
      projects.value = await $fetch('/api/projects')
    } catch (e) {
      error.value = 'Failed to load projects'
      logger.error('fetchProjects failed', e)
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(data: ProjectCreateRequest): Promise<Project> {
    const project = await $fetch('/api/projects', {
      method: 'POST',
      body: data,
    })
    projects.value.unshift(project)
    return project
  }

  return {
    projects,
    currentProject,
    isLoading,
    error,
    activeProjects,
    projectCount,
    fetchProjects,
    createProject,
  }
})
```

---

## 19. API Contract Standards

```typescript
// ✅ Always use Zod for request/response validation
// packages/shared/validators/project.ts
import { z } from 'zod'

export const ProjectCreateSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  prompt: z.string().min(10).max(5000).trim(),
  config: z.object({
    resolution: z.enum(['720p', '1080p', '4k']).default('1080p'),
    language: z.string().max(10).default('en'),
    duration: z.number().int().min(60).max(3600).default(300),
  }),
})

export type ProjectCreateRequest = z.infer<typeof ProjectCreateSchema>
export type ProjectCreateResponse = {
  id: string
  status: 'queued'
  createdAt: string
}

// ✅ Server route uses shared schema
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, ProjectCreateSchema.parse)
  const project = await createProject(body)
  return project satisfies ProjectCreateResponse
})
```

---

## 20. WebSocket Standards

Referensi architecture.md §12 untuk WebSocket flow.

```typescript
// composables/useWebSocket.ts
export function useWebSocket() {
  const { $ws } = useNuxtApp()
  const listeners = new Map<string, Set<(data: unknown) => void>>()

  function on(event: string, callback: (data: unknown) => void) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set())
      $ws.addEventListener(event, (data: unknown) => {
        listeners.get(event)?.forEach(cb => cb(data))
      })
    }
    listeners.get(event)!.add(callback)
  }

  function off(event: string, callback: (data: unknown) => void) {
    listeners.get(event)?.delete(callback)
  }

  function send(event: string, data: unknown) {
    $ws.send(JSON.stringify({ event, data }))
  }

  return { on, off, send }
}

// Usage in component
const ws = useWebSocket()
ws.on('pipeline.progress', (data) => {
  progress.value = data.progress
  currentStep.value = data.step
})
```

---

## 21. Environment Variable Standards

```bash
# .env.example — naming conventions
# All env vars prefixed with context:
# NUXT_* = Nuxt client-side
# NITRO_* = Nitro server-side
# VIDARA_* = Application-specific

NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SENTRY_DSN=
NITRO_DATABASE_URL=postgresql://vidara:pass@localhost:6432/vidara_dev
NITRO_REDIS_URL=redis://localhost:6379
VIDARA_MINIO_ENDPOINT=localhost:9000
VIDARA_OPENAI_API_KEY=
VIDARA_ELEVENLABS_API_KEY=
VIDARA_RUNWAY_API_KEY=
VIDARA_DEEPGRAM_API_KEY=
VIDARA_JWT_SECRET=
VIDARA_JWT_REFRESH_SECRET=
VIDARA_STRIPE_SECRET_KEY=
```

- **Never commit** `.env` files (only `.env.example`)
- **Never hardcode** env var names — use `runtimeConfig` consistently
- **All env vars** must be documented in `.env.example` with sensible defaults
- **Secrets** stored in GitHub Secrets + Cloudflare Secrets (referensi devops.md §10.2)

---

## 22. Checklist — Coding Standards Compliance

- [ ] TypeScript strict mode enabled, no `any` usage
- [ ] Naming conventions followed (PascalCase, camelCase, kebab-case, UPPER_CASE)
- [ ] All components use `<script setup lang="ts">`
- [ ] No Options API in any Vue file
- [ ] Composition API only throughout codebase
- [ ] Auto-imports used (no manual Vue/Nuxt imports)
- [ ] Nuxt UI 4 components used over custom HTML
- [ ] Design tokens used instead of hardcoded values
- [ ] Dark mode supported in all new components
- [ ] Tailwind CSS v4 utility-first approach followed
- [ ] Custom CSS only when Tailwind cannot achieve
- [ ] Tests written for composables, stores, utils, server routes
- [ ] Conventional commits followed in all git messages
- [ ] PRs under 400 lines with proper descriptions
- [ ] ESLint + Prettier configured and passing
- [ ] Husky pre-commit hooks active and passing
- [ ] Input validation (Zod) for all API endpoints
- [ ] Auth middleware on protected routes
- [ ] Structured JSON logging (no raw console.log)
- [ ] Components use multi-word names

---

## 23. Referensi Dokumen Lain

| Dokumen | Path | Konten Terkait |
|---|---|---|
| Tech Stack Document | `internal/docs/techstack.md` | Justifikasi Nuxt 4, Nuxt UI 4, Tailwind v4, Vitest |
| Architecture Document | `internal/docs/architecture.md` | C4 diagrams, component structure, module boundaries |
| DevOps Document | `internal/docs/devops.md` | Git strategy, CI/CD, Husky hooks |
| Project Structure | `internal/docs/project-structure.md` | Directory tree, file naming, import aliases |
| API Specification | `internal/docs/api.md` | API contracts, validation schemas |
| Deployment Guide | `internal/docs/deployment.md` | Environment config, secrets, Docker |
| Blueprint | `internal/docs/blueprint.md` | Development workflow, setup instructions |

---

> **End of Coding Standard Document** — Vidara AI © 2026  
> **Maintainer:** Platform Engineering Team  
> **Next Review:** 2026-09-26
