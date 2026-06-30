# CLAUDE.md — Vidara AI

Context file untuk Claude Code agar memahami proyek ini secara menyeluruh.

## Project Overview

**Vidara AI** adalah SaaS platform AI YouTube Video Generator berbasis web dan mobile. Platform ini memungkinkan kreator konten menghasilkan video YouTube berkualitas tinggi secara otomatis — mulai dari riset topik, penulisan skrip, voice-over, editing visual, hingga auto-publish ke YouTube.

**Owner / Developer:** GriyaITNusantara  
**Email:** raffizimraan27@gmail.com

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 4 (Vue 3, `srcDir: app/`) |
| Styling | Tailwind CSS v4 + custom `@theme {}` |
| UI Components | @nuxt/ui v4.9.0 |
| Database | PostgreSQL 16 via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (email/password + Google + Facebook OAuth) |
| State | Pinia + `useState` (Nuxt) |
| Utils | @vueuse/nuxt |

## Directory Structure

```
VideoGenerator/
├── app/                        # srcDir (Nuxt 4)
│   ├── assets/css/main.css    # Global styles + design tokens
│   ├── composables/
│   │   ├── useAuth.ts         # Auth state (login, register, OAuth, logout)
│   │   └── useProjects.ts     # Projects CRUD
│   ├── layouts/
│   │   ├── app.vue            # Main app layout (sidebar + bottom nav)
│   │   └── auth.vue           # Split-panel auth layout
│   ├── middleware/auth.ts     # Route auth guard
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.vue      # Login (email + Google + Facebook)
│   │   │   ├── register.vue   # Register (email + phone + Google + Facebook)
│   │   │   ├── callback.vue   # OAuth redirect handler
│   │   │   ├── forgot.vue     # Lupa password
│   │   │   └── reset.vue      # Reset password
│   │   ├── dashboard.vue
│   │   ├── generate.vue
│   │   ├── pipeline/[id].vue
│   │   ├── review/[id].vue
│   │   ├── publish/[id].vue
│   │   ├── assets.vue
│   │   ├── analytics.vue
│   │   └── billing.vue
│   ├── plugins/auth.client.ts  # Auth session persistence
│   └── tailwind.config.ts
├── server/
│   ├── api/
│   │   ├── auth/              # login, register, logout, me, refresh
│   │   └── admin/seed.post.ts # Create admin user endpoint
│   ├── middleware/
│   ├── plugins/
│   └── utils/                 # supabase.ts, response.ts
├── supabase/
│   ├── config.toml
│   └── migrations/            # SQL migration files
├── internal/docs/             # Design docs, schema, ERD, API docs
└── nuxt.config.ts
```

## Design System

| Token | Value |
|---|---|
| Background | `#08080F` |
| Surface | `#0E0E1A` |
| Primary Purple | `#8B5CF6` |
| Accent Cyan | `#22D3EE` |
| Gradient | `linear-gradient(135deg, #8B5CF6, #22D3EE)` |
| Text Primary | `#ECECF5` |
| Font Heading | Space Grotesk |
| Font Body | Manrope |

**CSS Utilities:** `.btn-primary`, `.card`, `.input-dark`, `.gradient-text`

## Auth Architecture

- Email/password: via `/api/auth/login` → Supabase `signInWithPassword` → returns JWT
- OAuth (Google/Facebook): via `useSupabaseClient().auth.signInWithOAuth()` → redirects to `/auth/callback`
- Callback page syncs Supabase session to `useAuth` state
- Token stored in `useState('token')` — synced with Supabase client session via `app/plugins/auth.client.ts`
- Middleware `auth.ts` guards all app routes
- Forgot/reset password via `/auth/forgot` → Supabase email → `/auth/reset`

## Admin User

- Email: `admin@gmail.com`
- Password: `tanyaAdminRafi123@`
- Created via: `POST /api/admin/seed` with header `x-seed-secret: vidara-seed-2026`

## ⚠️ CRITICAL: Fix .env Dulu!

File `.env` saat ini memiliki **`SUPABASE_SERVER_ROLE_KEY` yang salah** — nilainya sama dengan `ANON_KEY` (anon key). Ini harus diganti dengan **Service Role Key** dari Supabase Dashboard.

**Akibat:** Registrasi email, admin seed, dan server middleware akan gagal dengan error 403.

**Cara fix:**
1. Buka https://supabase.com/dashboard → project kamu
2. Settings → API → `service_role` key (bukan anon key)
3. Copy nilai `service_role` key
4. Paste ke `.env` sebagai `SUPABASE_SERVER_ROLE_KEY`

Contoh `.env` yang benar:
```
SUPABASE_URL=https://yaozflybdoigbcibadsa.supabase.co
SUPABASE_KEY=sb_publishable_dI5_-H4bBfhKAjJDPnuzDg_CeL2TigT
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
SUPABASE_SERVER_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key — BEDA!)
PROJECT_ID=yaozflybdoigbcibadsa
SEED_SECRET=vidara-seed-2026
```

## OAuth Setup (Required)

Google & Facebook login WAJIB dikonfigurasi di **Supabase Dashboard** dulu. Tanpa ini, tombol OAuth akan error.

### Di Supabase Dashboard:
1. Buka https://supabase.com/dashboard → project `yaozflybdoigbcibadsa`
2. **Authentication → Providers**
3. Aktifkan **Google** dan **Facebook**

### Google Setup:
1. Buka https://console.cloud.google.com → buat project baru
2. **APIs & Services → OAuth consent screen** → isi:
   - User Type: External
   - App name: `Vidara AI`
   - Support email: email kamu
3. **Credentials → Create Credentials → OAuth client ID**
   - Application type: Web application
   - **Authorized redirect URIs:** `https://yaozflybdoigbcibadsa.supabase.co/auth/v1/callback`
4. Copy **Client ID** dan **Client Secret**
5. Paste ke Supabase Dashboard → Google provider

### Facebook Setup:
1. Buka https://developers.facebook.com → buat app (type: Business)
2. Tambah produk **Facebook Login** → Web
3. **Settings:** masukkan `https://yaozflybdoigbcibadsa.supabase.co`
4. **OAuth Redirect URI:** `https://yaozflybdoigbcibadsa.supabase.co/auth/v1/callback`
5. Copy **App ID** dan **App Secret** dari Dashboard
6. Paste ke Supabase Dashboard → Facebook provider

### Verifikasi:
Setelah selesai, coba login dengan Google/Facebook. Jika masih error, cek:
- Redirect URI harus **sama persis** di Google Console, Facebook Developer, dan Supabase
- Aplikasi Google/Facebook harus dalam status **Testing/Production** (tidak harus publish)

## Nuxt Auto-Imports

These are globally available — **no import needed in `<script setup>`**:
- `ref`, `reactive`, `computed`, `watch`, `onMounted` (Vue)
- `useRoute`, `useRouter`, `navigateTo`, `definePageMeta` (Nuxt)
- `useAuth`, `useProjects` (composables)
- `useSupabaseClient` (@nuxtjs/supabase)

## Database

30+ tables. See `internal/docs/database.md` for full schema and `internal/docs/erd.md` for ERD.

Key tables: `users`, `profiles`, `projects`, `agent_tasks`, `voices`, `assets`, `subscriptions`, `credits_usage`

## Running Locally

```bash
npm install
cp .env.example .env  # fill SUPABASE_URL, ANON_KEY, SUPABASE_SERVER_ROLE_KEY
npm run dev

# Seed admin user (first time only)
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -H "x-seed-secret: vidara-seed-2026" \
  -d '{}'
```

## Code Conventions

- All text/labels in **Indonesian** (Bahasa Indonesia)
- Dark theme only — no light mode toggle
- Inline styles for brand colors (not Tailwind utilities) to avoid purge issues
- Mobile-first: bottom nav on mobile, sidebar on desktop (≥768px)
- `definePageMeta({ layout: 'app', middleware: 'auth' })` on all protected pages
