<div align="center">
  <img src="https://img.shields.io/badge/Nuxt-4.0-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</div>

<br/>

<div align="center">
  <h1>🎬 Vidara AI</h1>
  <p><strong>AI YouTube Video Generator — SaaS Platform</strong></p>
  <p>Buat video YouTube berkualitas tinggi secara otomatis dengan kekuatan AI.<br/>
  Dari riset topik, skrip, voice-over, hingga auto-publish — semua dalam satu platform.</p>
</div>

---

## 🖥️ UI Preview — Website

> Design reference dapat dilihat di: `internal/docs/design/design-website.zip`  
> Buka file `Vidara AI App.dc.html` di browser untuk melihat tampilan penuh.

### Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  ▶ Vidara AI  │  Dashboard                    [+ Generate] │
│  ─────────────│────────────────────────────────────────────│
│  Dashboard    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  Generate     │  │  24  │ │  18  │ │   3  │ │   3  │     │
│  Pipeline     │  │Proyek│ │Selesai│ │Genrat│ │Draft │     │
│  Review       │  └──────┘ └──────┘ └──────┘ └──────┘     │
│  Publish      │                                            │
│  Assets       │  Proyek Terbaru                            │
│  ─────────────│  ▸ Misteri Majapahit    ● Selesai          │
│  Analytics    │  ▸ Borobudur Tersembunyi ● Generating      │
│  Billing      │  ▸ Sriwijaya Kuno        ○ Draft           │
│               │                                            │
│  👤 Kreator   │                                            │
└─────────────────────────────────────────────────────────────┘
```

### Generate Video

```
┌─────────────────────────────────────────────────────────────┐
│  Generate                                                    │
│  ┌────────────────────────────────┐  ┌──────────────────┐  │
│  │ Prompt                         │  │ Estimasi Generasi│  │
│  │ ┌──────────────────────────┐  │  │                  │  │
│  │ │ Tuliskan topik atau       │  │  │ ⚡ 120 kredit   │  │
│  │ │ ide video kamu...         │  │  │ ⏱  ~8 menit    │  │
│  │ └──────────────────────────┘  │  │                  │  │
│  │ [Sejarah][Sains][Teknologi]    │  │ [Mulai Generate] │  │
│  │                               │  └──────────────────┘  │
│  │ Konfigurasi                   │                         │
│  │ Durasi: [5m][10m][15m][20m]  │                         │
│  │ Bahasa: Indonesia ▾           │                         │
│  │ Voice:  Arjuna – Epik   ▾     │                         │
│  └────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Pipeline AI (18 Agent Steps)

```
┌─────────────────────────────────────────────────────────────┐
│  Pipeline AI — "Misteri Kerajaan Majapahit"                  │
│                                                             │
│              ████████████░░░░  72%                         │
│                                                             │
│  ✅ Riset     ✅ Fact Check   ✅ Skrip     ✅ Review        │
│  ✅ Voice     ✅ BGM          ✅ SFX       ✅ Visual        │
│  ✅ Animasi   ✅ Thumbnail    🔄 Editing   ⬜ Watermark     │
│  ⬜ Color     ⬜ Render Final ⬜ QA Check  ⬜ Upload        │
│  ⬜ Publish   ⬜ Analytics                                  │
└─────────────────────────────────────────────────────────────┘
```

### Auth — Login & Register (Split Panel)

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │                           │
│  ░                            ░  │  Buat Akun Gratis        │
│  ░  🎬 Vidara AI              ░  │                          │
│  ░                            ░  │  [G] Daftar dengan Google│
│  ░  Buat Video YouTube        ░  │  [f] Daftar dengan FB    │
│  ░  Berkualitas Tinggi        ░  │                          │
│  ░  dengan AI                 ░  │  ──── atau ────          │
│  ░                            ░  │                          │
│  ░  🔬 Riset otomatis         ░  │  Nama Lengkap            │
│  ░  🎙️ Voice-over AI          ░  │  Email                   │
│  ░  🎬 Editing otomatis       ░  │  Nomor HP (+62)          │
│  ░  📤 Auto-publish YouTube   ░  │  Password ●●●●●●●●       │
│  ░                            ░  │                          │
│  ░  [Pipeline Preview Card]   ░  │  [Buat Akun →]          │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 UI Preview — Mobile

> Design reference: `internal/docs/design/design-mobile.zip`  
> Buka `Vidara AI Mobile.dc.html` di browser untuk preview mobile.

```
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Dashboard   │   │   Generate    │   │   Pipeline    │
│               │   │               │   │               │
│  Selamat      │   │  Topik Video  │   │  ████████ 72% │
│  datang 👋    │   │  ┌─────────┐  │   │               │
│               │   │  │ Prompt  │  │   │ ✅ Riset      │
│ ┌────┐┌────┐  │   │  └─────────┘  │   │ ✅ Skrip      │
│ │ 24 ││ 18 │  │   │               │   │ 🔄 Editing    │
│ └────┘└────┘  │   │  [Generate]   │   │ ⬜ Upload     │
│               │   │               │   │               │
│ Proyek:       │   │ Konfigurasi   │   │ [Pause]       │
│ • Majapahit   │   │ Durasi Voice  │   │               │
│ • Sriwijaya   │   │               │   │               │
│               │   │               │   │               │
│ 🏠 ⚡ 🔄 📁 📊│   │ 🏠 ⚡ 🔄 📁 📊│   │ 🏠 ⚡ 🔄 📁 📊│
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Supabase account (cloud atau local)

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd VideoGenerator

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dengan kredensial Supabase kamu

# 4. Jalankan development server
npm run dev
```

Buka http://localhost:3000

### Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
ANON_KEY=your-anon-key
SUPABASE_SERVER_ROLE_KEY=your-service-role-key
SEED_SECRET=vidara-seed-2026
```

### Seed Admin User

Setelah pertama kali setup, buat admin user dengan:

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -H "x-seed-secret: vidara-seed-2026" \
  -d '{}'
```

**Kredensial Admin Default:**
| Field | Value |
|---|---|
| Email | `admin@gmail.com` |
| Password | `tanyaAdminRafi123@` |
| Role | Admin |

> Password dapat dilihat di **Supabase Dashboard → Authentication → Users**

---

## 🏗️ Tech Stack

| Komponen | Teknologi |
|---|---|
| Framework | **Nuxt 4** (Vue 3, Composition API) |
| Styling | **Tailwind CSS v4** + custom design tokens |
| UI Library | **@nuxt/ui v4.9.0** |
| Database | **PostgreSQL 16** via Supabase |
| Auth | **Supabase Auth** (email + Google + Facebook OAuth) |
| State | **Pinia** + Nuxt `useState` |
| Hosting | Vercel / Supabase Edge |

---

## 🔐 Authentication

Vidara AI mendukung 3 metode autentikasi:

### 1. Email & Password
Login/register standar dengan email dan password minimal 8 karakter.

### 2. Google OAuth
```
Supabase Dashboard → Authentication → Providers → Google
→ Enable → Masukkan Client ID & Secret dari Google Cloud Console
→ Tambahkan Redirect URL: https://your-project.supabase.co/auth/v1/callback
```

### 3. Facebook OAuth
```
Supabase Dashboard → Authentication → Providers → Facebook
→ Enable → Masukkan App ID & Secret dari Meta Developer Console
→ Tambahkan OAuth Redirect URI yang sama
```

Setelah konfigurasi, update `SITE_URL` di Supabase Auth Settings ke URL produksi.

---

## 📂 Project Structure

```
VideoGenerator/
├── app/                        # Nuxt srcDir
│   ├── assets/css/main.css    # Global design system
│   ├── composables/           # useAuth, useProjects
│   ├── layouts/               # app.vue, auth.vue
│   ├── middleware/auth.ts     # Route protection
│   └── pages/
│       ├── auth/              # login, register, callback
│       ├── dashboard.vue
│       ├── generate.vue
│       ├── pipeline/[id].vue
│       ├── review/[id].vue
│       ├── publish/[id].vue
│       ├── assets.vue
│       ├── analytics.vue
│       └── billing.vue
├── server/
│   ├── api/auth/              # Login, register, OAuth endpoints
│   └── api/admin/seed.post.ts # Admin seeder
├── supabase/
│   ├── config.toml
│   └── migrations/            # Database migrations
└── internal/docs/             # Schema, ERD, API docs, design files
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#08080F` |
| Surface | `#0E0E1A` |
| Purple Primary | `#8B5CF6` |
| Cyan Accent | `#22D3EE` |
| Gradient | `linear-gradient(135deg, #8B5CF6, #22D3EE)` |
| Font Heading | Space Grotesk |
| Font Body | Manrope |

### CSS Classes
```css
.btn-primary    /* Gradient purple→cyan button */
.card           /* Dark glass card dengan border */
.input-dark     /* Dark form input */
```

---

## 📋 Pages

| Route | Halaman | Akses |
|---|---|---|
| `/auth/login` | Login | Public |
| `/auth/register` | Register | Public |
| `/auth/callback` | OAuth Callback | Public |
| `/dashboard` | Dashboard | Protected |
| `/generate` | Generate Video | Protected |
| `/pipeline/:id` | Pipeline AI | Protected |
| `/review/:id` | Review & Edit | Protected |
| `/publish/:id` | Publish YouTube | Protected |
| `/assets` | Assets & Brand | Protected |
| `/analytics` | Analytics | Protected |
| `/billing` | Billing | Protected |

---

## 🏢 About

**Vidara AI** dikembangkan oleh **GriyaITNusantara** — perusahaan teknologi Indonesia yang berfokus pada pengembangan solusi AI untuk kreator konten.

- 🌐 Website: vidara.ai
- 📧 Email: raffizimraan27@gmail.com
- 📍 Indonesia

---

<div align="center">
  <p>Made with ❤️ by <strong>GriyaITNusantara</strong></p>
  <p>© 2026 GriyaITNusantara. All rights reserved.</p>
  <p><a href="LICENSE.md">LICENSE</a> • <a href="CLAUDE.md">CLAUDE.md</a></p>
</div>
