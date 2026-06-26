# Testing Strategy — Vidara AI

> **Project:** Vidara AI — AI YouTube Video Generator SaaS  
> **Author:** Agent 12 — Senior QA Engineer  
> **Last Updated:** 2026-06-26  
> **Status:** Draft Final  
> **Cross-Reference:** [DevOps](devops.md) · [PRD](prd.md) · [FRD](frd.md) · [Architecture](architecture.md) · [API](api.md) · [Tech Stack](techstack.md) · [Workflow](workflow.md)

---

## 1. Tujuan

Dokumen Testing Strategy ini mendefinisikan pendekatan quality assurance komprehensif untuk Vidara AI. Mencakup seluruh level testing — unit, integration, component, E2E, performance, security, dan AI-specific — dengan target coverage, tools, environment, data management, dan proses CI/CD integration. Bertujuan menjadi panduan utama bagi QA Engineer dan seluruh tim engineering dalam memastikan kualitas platform enterprise-grade.

---

## 2. Background

Vidara AI adalah platform SaaS kompleks dengan arsitektur multi-agent AI yang mengorkestrasi 21 AI agents untuk menghasilkan video YouTube dari prompt teks. Sistem mencakup 117 REST API endpoints (per `api.md`), pipeline AI 20 langkah yang berjalan 10–30 menit, integrasi dengan 6+ external APIs (OpenAI, ElevenLabs, Runway, Deepgram, YouTube, Google/Bing), real-time WebSocket communication, queue processing via BullMQ, workflow orchestration via Temporal, dan multi-tenant RBAC.

Testing harus mencakup:
- **Validasi fungsional** — 44 fitur (per `frd.md`) dengan acceptance criteria terukur
- **Validasi pipeline AI** — output quality, accuracy, latency, cost
- **Validasi non-fungsional** — 99.9% uptime, p95 API <500ms, 1000+ concurrent pipelines
- **Validasi keamanan** — OWASP Top 10, UU PDP compliance, data encryption
- **Validasi integrasi** — 117 endpoints, 6 external providers, queue, database, object storage

Detail pipeline AI dijelaskan di `workflow.md`, arsitektur sistem di `architecture.md`.

---

## 3. Objective

| ID | Objective | Target |
|---|---|---|
| T-01 | Mencapai code coverage >80% (unit + integration) | ≥80% |
| T-02 | Validasi seluruh 117 API endpoints berfungsi sesuai spec | 100% pass |
| T-03 | Validasi 21 AI agents output quality | Score ≥80/100 |
| T-04 | Validasi pipeline end-to-end (prompt → published video) | 95% success rate |
| T-05 | API response time p95 <500ms pada 1000 RPS | Pass |
| T-06 | Zero critical/high security vulnerability | Pass |
| T-07 | E2E mencakup 6 critical user flows | 100% coverage |
| T-08 | Quality gates otomatis di setiap PR | Enforced |

---

## 4. Scope

**In Scope:**
- Unit testing: composables, utilities, Pinia stores, server routes, middleware, validators
- Integration testing: API endpoints, database queries (Drizzle ORM), Redis queue/cache, MinIO storage, external API mocking
- Component testing: all UI components (Vitest + Vue Test Utils), interaction tests, form validation, error/loading states, accessibility
- E2E testing: 6 critical user flows via Playwright, cross-browser (Chrome, Firefox, Safari), mobile viewport, visual regression
- Performance testing: API load (k6, target 1000 RPS p95 <500ms), queue stress (1000 concurrent renders), DB query perf, cache hit ratio
- Security testing: OWASP ZAP automated scan, dependency scanning (npm audit, Snyk), SAST, secret scanning
- AI testing: prompt output validation, A/B testing framework, quality scoring, hallucination detection

**Out of Scope:**
- Manual regression testing (covered by automation)
- Third-party provider API internal testing
- Physical infrastructure penetration testing
- Social engineering testing

---

## 5. Stakeholder

| Stakeholder | Role | Interest |
|---|---|---|
| QA Engineer (Agent 12) | Test Strategy Lead | Test coverage, automation, quality gates |
| Full Stack Engineer (Agent 5) | Implementation | Test feasibility, mocking strategy |
| AI Engineer (Agent 6) | AI Pipeline Quality | Agent output validation, prompt testing |
| DevOps Engineer (Agent 10) | CI/CD Integration | Pipeline execution, test environment |
| Security Engineer (Agent 11) | Security Validation | Vulnerability scanning, compliance |
| Product Manager (Agent 1) | Feature Sign-off | Acceptance criteria, UAT |
| Solution Architect (Agent 3) | Architecture Validation | Contract testing, integration test scope |

---

## 6. Requirement

1. Semua test harus dapat dijalankan di CI/CD pipeline (GitHub Actions) tanpa manual intervention.
2. Test data harus reproducible dan isolated per test run.
3. External API calls harus dimock di unit/integration test.
4. Setiap PR wajib melewati quality gates: lint → typecheck → unit test → integration test → build.
5. Test suite harus selesai dalam <15 menit di CI (parallel execution).
6. Test environment harus mirror production dengan resource scaling disesuaikan.
7. Performance test harus menggunakan dedicated environment (bukan shared CI runner).
8. Test reports harus accessible via CI artifact dan Grafana dashboard.

---

## 7. Functional Requirement

| ID | Requirement | Test Level | Tools |
|---|---|---|---|
| FR-T-01 | Composables dan utilities di-test secara isolated | Unit | Vitest |
| FR-T-02 | Pinia stores di-test dengan mock state dan actions | Unit | Vitest + Pinia |
| FR-T-03 | Server routes di-test dengan request/response validation | Integration | Vitest + Nitro Test Utils |
| FR-T-04 | Drizzle ORM queries di-test dengan test database | Integration | Vitest + pg-mem |
| FR-T-05 | Redis cache/queue operations di-test dengan mock Redis | Integration | Vitest + ioredis-mock |
| FR-T-06 | MinIO upload/download di-test dengan MinIO container | Integration | Vitest + Testcontainers |
| FR-T-07 | External API calls (OpenAI, ElevenLabs, etc.) di-mock | Integration | Vitest + MSW/nock |
| FR-T-08 | Semua komponen UI di-test dengan interaction simulation | Component | Vitest + VTU |
| FR-T-09 | Form validation, error states, loading states per komponen | Component | Vitest + VTU |
| FR-T-10 | Aksesibilitas (a11y) check per komponen | Component | vitest-axe |
| FR-T-11 | Sign up → Create workspace → Create project → Generate video | E2E | Playwright |
| FR-T-12 | Video pipeline: prompt → script → scenes → images → voice → compose → render → export | E2E | Playwright |
| FR-T-13 | YouTube upload flow | E2E | Playwright |
| FR-T-14 | Billing subscription flow | E2E | Playwright |
| FR-T-15 | Team invitation flow | E2E | Playwright |
| FR-T-16 | Cross-browser testing (Chrome, Firefox, Safari) | E2E | Playwright |
| FR-T-17 | Mobile viewport testing (375px, 414px, 768px) | E2E | Playwright |
| FR-T-18 | Visual regression testing | E2E | Playwright + Percy |
| FR-T-19 | API load testing (1000 RPS, p95 <500ms) | Performance | k6 |
| FR-T-20 | Queue stress testing (1000 concurrent render jobs) | Performance | k6 |
| FR-T-21 | Database query performance (slow query detection) | Performance | k6 + pg_stat_statements |
| FR-T-22 | Cache hit ratio validation | Performance | k6 + Redis INFO |
| FR-T-23 | OWASP ZAP automated scanning | Security | ZAP CLI |
| FR-T-24 | Dependency vulnerability scanning | Security | npm audit, Snyk |
| FR-T-25 | SAST (Static Application Security Testing) | Security | Semgrep/CodeQL |
| FR-T-26 | Secret scanning (hardcoded credentials) | Security | truffleHog/gitleaks |
| FR-T-27 | Prompt output validation (accuracy, relevance, safety) | AI Testing | Custom + GPT-5o evaluator |
| FR-T-28 | A/B testing framework for prompt variants | AI Testing | Custom |
| FR-T-29 | Model output quality scoring | AI Testing | Custom scorer |
| FR-T-30 | Hallucination detection testing | AI Testing | Custom hallucination detector |

---

## 8. Non Functional Requirement

| ID | Kategori | Target | Alat Ukur |
|---|---|---|---|
| NFR-T-01 | Code Coverage (unit + integration) | ≥80% lines, ≥75% branches | Vitest --coverage |
| NFR-T-02 | Test Execution Time (CI) | <15 menit (parallel) | GitHub Actions timing |
| NFR-T-03 | API p95 Latency | <500ms at 1000 RPS | k6 thresholds |
| NFR-T-04 | E2E Test Flakiness | <1% failure rate | Playwright retries (max 2) |
| NFR-T-05 | Security Vulnerabilities (critical/high) | 0 | Snyk + ZAP reports |
| NFR-T-06 | Visual Regression Tolerance | <0.1% diff | Percy diff threshold |
| NFR-T-07 | Cache Hit Ratio | ≥90% | Redis INFO |
| NFR-T-08 | A/B Test Statistical Significance | p < 0.05 | Custom statistics |
| NFR-T-09 | Test Data Cleanup | 100% isolated per run | Setup/teardown hooks |
| NFR-T-10 | AI Hallucination Rate | <5% of outputs | Custom evaluator |

---

## 9. Testing Philosophy

### 9.1 Shift-Left Testing

```mermaid
flowchart LR
    subgraph "Traditional (Right-Shifted)"
        A1[Requirements] --> A2[Design] --> A3[Development] --> A4[Testing] --> A5[Deployment]
    end

    subgraph "Vidara AI (Shift-Left)"
        B1[Requirements + Test Design] --> B2[Design + Test Planning]
        B2 --> B3[Development + Unit Tests]
        B3 --> B4[Integration + Component Tests]
        B4 --> B5[CI Quality Gates]
        B5 --> B6[Staging E2E + Perf Tests]
        B6 --> B7[Production Monitoring + Canary]
    end

    style B1 fill:#6366f1,color:#fff
    style B7 fill:#22c55e,color:#fff
```

Testing dimulai dari requirement phase — setiap FRD acceptance criteria ditulis sebagai test case sebelum development dimulai. Developer menulis unit test bersamaan dengan implementation. PR tidak bisa merge tanpa test pass.

### 9.2 Test Pyramid

```mermaid
flowchart TD
    subgraph "Test Pyramid"
        E2E[E2E Tests<br/>Playwright<br/>~50 tests<br/>Slow / Brittle]
        INT[Integration Tests<br/>Vitest + MSW + Testcontainers<br/>~400 tests<br/>Medium]
        COMP[Component Tests<br/>Vitest + VTV<br/>~200 tests<br/>Medium]
        UNIT[Unit Tests<br/>Vitest<br/>~2000 tests<br/>Fast / Reliable]
    end

    UNIT -->|70% of tests| COMP
    COMP -->|15% of tests| INT
    INT -->|10% of tests| E2E
    E2E -->|5% of tests| Top

    style UNIT fill:#22c55e,color:#fff
    style COMP fill:#86efac,color:#000
    style INT fill:#fbbf24,color:#000
    style E2E fill:#ef4444,color:#fff
```

| Layer | Tools | Count | Coverage | Execution Time |
|---|---|---|---|---|
| Unit | Vitest | ~2000 | >80% lines | <30s |
| Component | Vitest + Vue Test Utils | ~200 | >80% lines | <60s |
| Integration | Vitest + MSW + Testcontainers | ~400 | 117 endpoints | <3min |
| E2E | Playwright | ~50 | 6 critical flows | <10min |

### 9.3 Continuous Testing

Testing tidak berhenti di CI. Production monitoring + canary analysis memberikan feedback loop:

1. **PR Phase**: Lint → Typecheck → Unit → Integration → Build → Preview Deploy
2. **Staging Phase**: Full E2E → Performance (nightly) → Security Scan (weekly)
3. **Production Phase**: Canary analysis → Error rate monitoring → Performance regression detection

---

## 10. Unit Testing (Vitest)

### 10.1 Strategy

Unit tests fokus pada pure logic, composables, utilities, dan Pinia stores. External dependencies di-mock. Setiap file dalam `server/utils/`, `composables/`, `stores/`, dan `utils/` harus memiliki test coverage >80%.

### 10.2 Directory Structure

```
tests/
├── unit/
│   ├── composables/
│   │   ├── useVideoPipeline.spec.ts
│   │   ├── useYouTubeAuth.spec.ts
│   │   ├── useSubscription.spec.ts
│   │   ├── useWorkspace.spec.ts
│   │   ├── useOrganization.spec.ts
│   │   ├── useProject.spec.ts
│   │   ├── useBrandKit.spec.ts
│   │   ├── useAssetManager.spec.ts
│   │   └── usePromptBuilder.spec.ts
│   ├── stores/
│   │   ├── authStore.spec.ts
│   │   ├── projectStore.spec.ts
│   │   ├── pipelineStore.spec.ts
│   │   ├── uiStore.spec.ts
│   │   ├── workspaceStore.spec.ts
│   │   └── notificationStore.spec.ts
│   ├── utils/
│   │   ├── formatDuration.spec.ts
│   │   ├── validatePrompt.spec.ts
│   │   ├── tokenCounter.spec.ts
│   │   ├── slugify.spec.ts
│   │   ├── youtubeUrlParser.spec.ts
│   │   ├── creditCalculator.spec.ts
│   │   └── encryption.spec.ts
│   └── validators/
│       ├── authValidator.spec.ts
│       ├── projectValidator.spec.ts
│       ├── workspaceValidator.spec.ts
│       └── billingValidator.spec.ts
```

### 10.3 Coverage Targets per Category

| Category | Lines | Branches | Functions | Key Tests |
|---|---|---|---|---|
| Composables | >85% | >80% | >90% | Reactive state, computed, lifecycle |
| Pinia Stores | >85% | >80% | >90% | Actions, getters, state mutations |
| Utils | >90% | >85% | >95% | Edge cases, type coercion, null safety |
| Validators | >95% | >90% | >100% | Schema validation, error messages |
| AI Prompts | >80% | >75% | >85% | Template rendering, token limits |
| Middleware | >85% | >80% | >90% | Auth guards, rate limiting, logging |

### 10.4 AI Agent Unit Tests

21 AI agents functions and prompt templates:

| Agent | Test File | Key Scenarios |
|---|---|---|
| Master | `agents/masterAgent.spec.ts` | Pipeline orchestration, dynamic selection, error decision |
| Research | `agents/researchAgent.spec.ts` | Query building, source ranking, empty results |
| Fact Checker | `agents/factChecker.spec.ts` | Cross-referencing, confidence scoring, rejection |
| Script | `agents/scriptAgent.spec.ts` | Hook generation, SEO injection, word count |
| Storyboard | `agents/storyboardAgent.spec.ts` | Shot composition, transitions, preview generation |
| Scene | `agents/sceneAgent.spec.ts` | Timeline allocation, resource requirements |
| Image | `agents/imageAgent.spec.ts` | Provider fallback chain, embedding injection |
| Voice | `agents/voiceAgent.spec.ts` | SSML injection, provider fallback, timing sync |
| Subtitle | `agents/subtitleAgent.spec.ts` | STT alignment, translation, format generation |
| Animation | `agents/animationAgent.spec.ts` | FFmpeg filter graph, duration match, overlay |
| Composer | `agents/composerAgent.spec.ts` | Layer sync, audio mix, loudness normalization |
| Thumbnail | `agents/thumbnailAgent.spec.ts` | CTR prediction, brand compliance, text overlay |
| SEO | `agents/seoAgent.spec.ts` | Keyword analysis, competitor insight, density check |
| Publishing | `agents/publishingAgent.spec.ts` | Chunked upload resume, quota handling, OAuth |
| Analytics | `agents/analyticsAgent.spec.ts` | Data aggregation, insight generation, caching |
| Memory | `agents/memoryAgent.spec.ts` | CRUD operations, vector search, TTL expiry |
| Context | `agents/contextAgent.spec.ts` | Token budget, summarization, history injection |
| QA | `agents/qaAgent.spec.ts` | Score aggregation, retry feedback, fallback |
| Moderator | `agents/moderatorAgent.spec.ts` | Content scoring, violation detection, verdict logic |
| Monitoring | `agents/monitoringAgent.spec.ts` | Metric aggregation, alert rule evaluation |

### 10.5 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'tests/integration/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/unit',
      include: [
        'composables/**/*.ts',
        'stores/**/*.ts',
        'utils/**/*.ts',
        'server/utils/**/*.ts',
        'server/middleware/**/*.ts',
        'server/validators/**/*.ts',
        'agents/**/*.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },
    testTimeout: 10_000,
    hookTimeout: 15_000,
    sequence: {
      shuffle: true,
    },
  },
})
```

---

## 11. Integration Testing

### 11.1 API Endpoint Testing

Seluruh **117 endpoints** dari `api.md` harus di-test. Setiap endpoint memiliki test untuk:

- **Happy path**: Request valid → Response sesuai spec
- **Validation errors**: Input invalid → Error codes sesuai
- **Auth errors**: Missing/expired/invalid JWT → 401
- **Authorization errors**: Role mismatch → 403
- **Rate limiting**: Exceed limit → 429
- **Pagination**: Cursor-based pagination behavior
- **Idempotency**: Idempotency-Key header validation

### 11.2 API Test Matrix

| Endpoint Group | Endpoints | Auth | Rate Limit | Validation |
|---|---|---|---|---|
| Auth | 7 | None/Bearer | 10/min | Email, password, OAuth |
| Users | 5 | Bearer | 30/min | Profile, preferences |
| Organizations | 6 | Bearer | 30/min | Slug, members, billing |
| Workspaces | 8 | Bearer | 30/min | Slug, limits, isolation |
| Projects | 9 | Bearer | 30/min | Status transitions, CRUD |
| Videos | 4 | Bearer | 10/min | Pipeline trigger, cancel |
| Scenes | 10 | Bearer | 30/min | Timestamps, resources |
| Scripts | 5 | Bearer | 10/min | Word count, structure |
| Prompts | 6 | Bearer | 30/min | Template variables |
| Images | 8 | Bearer | 10/min | Generation, variants |
| Voices | 6 | Bearer | 10/min | TTS, SSML, emotions |
| Subtitles | 5 | Bearer | 10/min | Format, sync, translation |
| Assets | 8 | Bearer | 30/min | Upload, folder, version |
| Templates | 5 | Bearer | 30/min | CRUD, categories |
| Render Jobs | 4 | Bearer | 30/min | Queue, priority, cancel |
| YouTube | 6 | Bearer | 10/min | Upload, schedule, status |
| Billing | 9 | Bearer | 30/min | Plans, invoices, credits |
| Admin | 8 | Bearer+Admin | 100/min | Tenants, logs, metrics |
| WebSocket | 1 | Bearer | N/A | Connection, events, reconnect |
| **Total** | **117** | | | |

### 11.3 Database Integration (Drizzle ORM)

```typescript
// tests/integration/db/queries.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDb, destroyTestDb } from './helpers/setup'

describe('Drizzle ORM Queries', () => {
  let db: TestDatabase

  beforeAll(async () => {
    db = await createTestDb({ schema: 'test_vidara' })
    await db.migrate()
    await db.seed()
  })

  afterAll(async () => {
    await db.cleanup()
    await destroyTestDb(db)
  })

  it('should query projects with workspace isolation', async () => {
    const projects = await db.query.projects.findMany({
      where: eq(projects.workspaceId, wsId),
      with: { scenes: true, script: true },
    })
    expect(projects).toHaveLength(3)
    projects.forEach(p => expect(p.workspaceId).toBe(wsId))
  })

  it('should enforce RLS policies cross-tenant', async () => {
    const otherProjects = await db.query.projects.findMany({
      where: eq(projects.workspaceId, otherWsId),
    })
    expect(otherProjects).toHaveLength(0)
  })

  it('should handle concurrent optimistic locking', async () => {
    const [result1, result2] = await Promise.allSettled([
      db.update(projects).set({ title: 'A' }).where(eq(projects.id, pid)),
      db.update(projects).set({ title: 'B' }).where(eq(projects.id, pid)),
    ])
    expect(result1.status).toBe('fulfilled')
  })
})
```

### 11.4 Redis Integration

```typescript
// tests/integration/redis/cache.spec.ts
import Redis from 'ioredis-mock'

describe('Redis Cache Operations', () => {
  const redis = new Redis({ data: { 'cache:test': 'value' } })

  it('should cache dashboard data with TTL 30s', async () => {
    await redis.setex('dashboard:user:123', 30, JSON.stringify({ stats: {} }))
    const ttl = await redis.ttl('dashboard:user:123')
    expect(ttl).toBeGreaterThan(0)
    expect(ttl).toBeLessThanOrEqual(30)
  })

  it('should handle cache miss gracefully', async () => {
    const cached = await redis.get('nonexistent')
    expect(cached).toBeNull()
  })

  it('should support pipeline queue operations', async () => {
    await redis.lpush('queue:render', 'job:1', 'job:2')
    const len = await redis.llen('queue:render')
    expect(len).toBe(2)
  })
})
```

### 11.5 MinIO Integration

```typescript
// tests/integration/minio/storage.spec.ts
import { S3Client } from '@aws-sdk/client-s3'
import { GenericContainer, Wait } from 'testcontainers'

describe('MinIO Storage', () => {
  let container: StartedTestContainer
  let client: S3Client

  beforeAll(async () => {
    container = await new GenericContainer('minio/minio:latest')
      .withExposedPorts(9000)
      .withCommand(['server', '/data'])
      .withWaitStrategy(Wait.forLogMessage('API:'))
      .start()

    client = new S3Client({
      endpoint: `http://localhost:${container.getMappedPort(9000)}`,
      forcePathStyle: true,
      credentials: { accessKeyId: 'test', secretAccessKey: 'test123' },
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should upload and download objects', async () => {
    await client.send(new PutObjectCommand({
      Bucket: 'videos', Key: 'test.mp4', Body: Buffer.from('test'),
    }))
    const { Body } = await client.send(new GetObjectCommand({
      Bucket: 'videos', Key: 'test.mp4',
    }))
    expect(await Body?.transformToString()).toBe('test')
  })

  it('should generate presigned URL for upload', async () => {
    const command = new PutObjectCommand({ Bucket: 'videos', Key: 'upload.mp4' })
    const url = await getSignedUrl(client, command, { expiresIn: 3600 })
    expect(url).toContain('X-Amz-Signature')
  })
})
```

### 11.6 External API Mocking

Semua external API di-mock menggunakan **MSW** (Mock Service Worker) untuk HTTP calls dan **nock** untuk SDK-based calls.

```typescript
// tests/integration/mocks/externalApis.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // OpenAI completions mock
  http.post('https://api.openai.com/v1/chat/completions', () =>
    HttpResponse.json({
      choices: [{
        message: { content: 'Generated script...' },
        finish_reason: 'stop',
      }],
      usage: { prompt_tokens: 100, completion_tokens: 200 },
    })
  ),

  // ElevenLabs TTS mock
  http.post('https://api.elevenlabs.io/v1/text-to-speech/:voiceId', () =>
    HttpResponse.arrayBuffer(new ArrayBuffer(1024), {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  ),

  // YouTube upload mock
  http.post('https://www.googleapis.com/upload/youtube/v3/videos', () =>
    HttpResponse.json({
      id: 'yt_video_id',
      status: { uploadStatus: 'uploaded' },
    })
  ),

  // Deepgram STT mock
  http.post('https://api.deepgram.com/v1/listen', () =>
    HttpResponse.json({
      results: {
        channels: [{
          alternatives: [{
            transcript: 'Hello world',
            words: [{ word: 'Hello', start: 0.0, end: 0.5 }],
          }],
        }],
      },
    })
  ),

  // Flux image generation mock
  http.post('https://api.flux.ai/v1/generate', () =>
    HttpResponse.json({
      images: [
        { url: 'https://minio.vidara.ai/images/scene-1-var-1.png' },
        { url: 'https://minio.vidara.ai/images/scene-1-var-2.png' },
      ],
    })
  ),
]
```

---

## 12. Component Testing (Vitest + Vue Test Utils)

### 12.1 Strategy

Setiap komponen UI di-test dengan Vitest + Vue Test Utils (`@vue/test-utils`). Fokus pada interaksi user, rendering states, prop validation, form validation, dan accessibility.

### 12.2 Component Test Structure

```
tests/
├── components/
│   ├── auth/
│   │   ├── LoginForm.spec.ts
│   │   ├── RegisterForm.spec.ts
│   │   └── OAuthButtons.spec.ts
│   ├── dashboard/
│   │   ├── StatsWidget.spec.ts
│   │   ├── RecentProjects.spec.ts
│   │   ├── ActivityFeed.spec.ts
│   │   └── QuickActions.spec.ts
│   ├── project/
│   │   ├── ProjectCard.spec.ts
│   │   ├── ProjectList.spec.ts
│   │   ├── Timeline.spec.ts
│   │   └── SceneEditor.spec.ts
│   ├── ai/
│   │   ├── PromptBuilder.spec.ts
│   │   ├── ScriptEditor.spec.ts
│   │   └── AgentProgress.spec.ts
│   ├── media/
│   │   ├── ImageSelector.spec.ts
│   │   ├── VoiceSelector.spec.ts
│   │   ├── ThumbnailPreview.spec.ts
│   │   └── AssetUploader.spec.ts
│   ├── workspace/
│   │   ├── WorkspaceSwitcher.spec.ts
│   │   ├── MemberList.spec.ts
│   │   └── InviteDialog.spec.ts
│   ├── billing/
│   │   ├── PlanCard.spec.ts
│   │   ├── CreditDisplay.spec.ts
│   │   └── InvoiceHistory.spec.ts
│   └── shared/
│       ├── BrandKitEditor.spec.ts
│       ├── ToastNotification.spec.ts
│       └── ConfirmDialog.spec.ts
```

### 12.3 Example: PromptBuilder Component Test

```typescript
// tests/components/PromptBuilder.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import PromptBuilder from '~/components/ai/PromptBuilder.vue'
import { axe, toHaveNoViolations } from 'vitest-axe'

expect.extend(toHaveNoViolations)

describe('PromptBuilder', () => {
  const defaultProps = {
    topic: '',
    language: 'id',
    duration: 300,
    tone: 'professional',
  }

  it('should render all form fields', () => {
    const wrapper = mount(PromptBuilder, { props: defaultProps })
    expect(wrapper.find('[data-testid="topic-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="language-select"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="duration-slider"]').exists()).toBe(true)
  })

  it('should validate required fields on submit', async () => {
    const wrapper = mount(PromptBuilder, { props: defaultProps })
    await wrapper.find('[data-testid="generate-button"]').trigger('click')
    expect(wrapper.find('[data-testid="error-topic"]').text()).toContain('wajib diisi')
  })

  it('should emit prompt when form is valid', async () => {
    const wrapper = mount(PromptBuilder, {
      props: { ...defaultProps, topic: 'AI Technology Trends 2026' },
    })
    await wrapper.find('[data-testid="generate-button"]').trigger('click')
    expect(wrapper.emitted('generate')).toBeTruthy()
    expect(wrapper.emitted('generate')![0]).toEqual([{
      topic: 'AI Technology Trends 2026',
      language: 'id',
      duration: 300,
      tone: 'professional',
    }])
  })

  it('should display loading state during generation', async () => {
    const wrapper = mount(PromptBuilder, {
      props: { ...defaultProps, topic: 'Test', loading: true },
    })
    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="generate-button"]').attributes('disabled')).toBeDefined()
  })

  it('should show error state on generation failure', async () => {
    const wrapper = mount(PromptBuilder, {
      props: { ...defaultProps, topic: 'Test', error: 'API rate limit exceeded' },
    })
    expect(wrapper.find('[data-testid="error-banner"]').text()).toContain('rate limit')
  })

  it('should have no accessibility violations', async () => {
    const wrapper = mount(PromptBuilder, { props: { ...defaultProps, topic: 'Test' } })
    const results = await axe(wrapper.element)
    expect(results).toHaveNoViolations()
  })
})
```

### 12.4 Accessibility Testing per Component

Setiap komponen di-test dengan `vitest-axe` untuk WCAG 2.2 Level AA compliance:

| Check | Rule | Severity |
|---|---|---|
| Keyboard navigation | `aria-required-children` | Critical |
| Focus management | `tabindex` | Critical |
| Color contrast | `color-contrast` | High |
| ARIA labels | `aria-label`, `aria-labelledby` | High |
| Form labels | `label-has-associated-control` | High |
| Alt text | `image-alt` | Medium |
| Heading hierarchy | `heading-order` | Medium |

---

## 13. E2E Testing (Playwright)

### 13.1 Critical User Flows

#### Flow 1: Sign up → Create workspace → Create project → Generate video

```typescript
// tests/e2e/flows/fullGeneration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Full Video Generation Flow', () => {
  test('user signs up, creates workspace, creates project, generates video', async ({ page }) => {
    // Sign up
    await page.goto('/auth/register')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'Test1234!')
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.click('[data-testid="register-button"]')
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })

    // Create workspace
    await page.click('[data-testid="new-workspace-button"]')
    await page.fill('[data-testid="workspace-name-input"]', 'My Channel')
    await page.click('[data-testid="create-workspace-submit"]')
    await expect(page.locator('[data-testid="workspace-name"]')).toHaveText('My Channel')

    // Create project
    await page.click('[data-testid="new-project-button"]')
    await page.fill('[data-testid="project-title-input"]', 'AI Trends 2026')
    await page.selectOption('[data-testid="project-type-select"]', 'long-form')
    await page.fill('[data-testid="prompt-textarea"]', 'Create a video about AI trends in 2026')
    await page.click('[data-testid="create-project-submit"]')
    await expect(page).toHaveURL(/\/projects\//)

    // Generate video
    await page.click('[data-testid="generate-video-button"]')
    await expect(page.locator('[data-testid="pipeline-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="pipeline-status"]')).toHaveText('completed', {
      timeout: 600000, // 10 min timeout for pipeline
    })
    await expect(page.locator('[data-testid="video-preview"]')).toBeVisible()
  })
})
```

#### Flow 2: Video Pipeline (prompt → script → scenes → images → voice → compose → render → export)

```typescript
test.describe('Video Pipeline Steps', () => {
  test('each pipeline step completes with valid output', async ({ page }) => {
    await page.goto('/projects/test-project')
    await page.click('[data-testid="generate-video-button"]')

    // Monitor each step via WebSocket
    const steps = [
      { selector: '[data-testid="step-research"]', status: 'completed' },
      { selector: '[data-testid="step-fact-check"]', status: 'completed' },
      { selector: '[data-testid="step-script"]', status: 'completed' },
      { selector: '[data-testid="step-storyboard"]', status: 'completed' },
      { selector: '[data-testid="step-images"]', status: 'completed' },
      { selector: '[data-testid="step-voice"]', status: 'completed' },
      { selector: '[data-testid="step-subtitle"]', status: 'completed' },
      { selector: '[data-testid="step-animation"]', status: 'completed' },
      { selector: '[data-testid="step-compose"]', status: 'completed' },
      { selector: '[data-testid="step-render"]', status: 'completed' },
    ]

    for (const step of steps) {
      await expect(page.locator(step.selector)).toHaveAttribute('data-status', step.status, {
        timeout: 120000,
      })
    }

    // Export
    await page.click('[data-testid="export-button"]')
    await page.selectOption('[data-testid="format-select"]', 'mp4')
    await page.selectOption('[data-testid="resolution-select"]', '1080p')
    await page.click('[data-testid="download-button"]')

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 300000 }),
      page.click('[data-testid="confirm-export"]'),
    ])
    expect(download.suggestedFilename()).toMatch(/\.mp4$/)
  })
})
```

#### Flow 3: YouTube Upload

```typescript
test.describe('YouTube Upload Flow', () => {
  test('user uploads video to YouTube with SEO metadata', async ({ page }) => {
    await page.goto('/projects/completed-project')
    await page.click('[data-testid="publish-youtube-button"]')

    // OAuth flow
    await expect(page.locator('[data-testid="youtube-auth"]')).toBeVisible()
    await page.click('[data-testid="authorize-youtube"]')

    // SEO metadata
    await page.fill('[data-testid="video-title"]', 'AI Trends 2026: The Future is Now')
    await page.fill('[data-testid="video-description"]', 'In this video...')
    await page.fill('[data-testid="video-tags"]', 'AI,technology,2026,future')
    await page.selectOption('[data-testid="visibility-select"]', 'public')

    // Upload
    await page.click('[data-testid="upload-button"]')
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 600000 })
    await expect(page.locator('[data-testid="youtube-url"]')).toHaveText(/youtube\.com\/watch/)
  })
})
```

#### Flow 4: Billing Subscription

```typescript
test.describe('Billing Flow', () => {
  test('user upgrades from Free to Pro plan', async ({ page }) => {
    await page.goto('/billing/plans')
    await page.click('[data-testid="pro-plan-cta"]')

    // Stripe checkout
    await expect(page).toHaveURL(/stripe\.com/, { timeout: 30000 })
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/28')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.click('[data-testid="submit-payment"]')

    // Confirmation
    await expect(page).toHaveURL(/\/billing\/success/)
    await expect(page.locator('[data-testid="plan-name"]')).toHaveText('Pro')
    await expect(page.locator('[data-testid="credits-remaining"]')).not.toHaveText('0')
  })
})
```

#### Flow 5: Team Invitation

```typescript
test.describe('Team Invitation Flow', () => {
  test('owner invites member, member accepts', async ({ page, browser }) => {
    // Owner sends invite
    await page.goto('/organization/members')
    await page.click('[data-testid="invite-button"]')
    await page.fill('[data-testid="invite-email"]', 'collab@example.com')
    await page.selectOption('[data-testid="invite-role"]', 'editor')
    await page.click('[data-testid="send-invite"]')
    await expect(page.locator('[data-testid="invite-success"]')).toBeVisible()

    // Member accepts (new context)
    const memberPage = await browser.newPage()
    await memberPage.goto('/auth/register')
    await memberPage.fill('[data-testid="email-input"]', 'collab@example.com')
    await memberPage.fill('[data-testid="password-input"]', 'Collab123!')
    await memberPage.click('[data-testid="register-button"]')

    await expect(memberPage.locator('[data-testid="invite-banner"]')).toBeVisible()
    await memberPage.click('[data-testid="accept-invite"]')
    await expect(memberPage.locator('[data-testid="workspace-name"]')).toHaveText(/My Channel/)
    await memberPage.close()
  })
})
```

### 13.2 Cross-Browser Matrix

| Browser | Viewport | OS | Testing Level |
|---|---|---|---|
| Chrome 125+ | 1920x1080 | macOS/Linux | Full suite |
| Firefox 126+ | 1920x1080 | macOS/Linux | Full suite |
| Safari 17+ | 1920x1080 | macOS | Critical flows |
| Chrome Mobile | 375x812 (iPhone) | Android/iOS | Responsive flows |
| Safari Mobile | 414x896 (iPhone) | iOS | Responsive flows |
| Firefox Mobile | 360x740 | Android | Smoke |

### 13.3 Visual Regression Testing

Visual regression menggunakan **Percy** untuk perbandingan screenshot otomatis:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
})
```

```typescript
// Example visual regression test
test('dashboard page visual snapshot', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.percySnapshot('Dashboard - Default State')
})
```

### 13.4 Playwright Configuration

```typescript
// playwright.config.ts (continued)
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),
})
```

---

## 14. Performance Testing (k6)

### 14.1 API Load Testing

API load testing dengan target **p95 <500ms pada 1000 RPS** — mencakup seluruh 117 endpoints dengan traffic distribution realistis.

```javascript
// tests/performance/api-load.js
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('errors')
const apiLatency = new Trend('api_latency')

export const options = {
  stages: [
    { duration: '2m', target: 200 },   // Ramp up to 200 RPS
    { duration: '5m', target: 500 },   // Ramp to 500 RPS
    { duration: '5m', target: 1000 },  // Ramp to 1000 RPS
    { duration: '3m', target: 1000 },  // Hold at 1000 RPS
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.05'],
  },
}

const BASE_URL = __ENV.API_BASE_URL || 'https://api.vidara.ai/v1'
const TOKEN = __ENV.AUTH_TOKEN

const ENDPOINTS = [
  // Weighted by expected traffic distribution
  { method: 'GET', path: '/projects', weight: 20 },
  { method: 'GET', path: '/projects/${id}', weight: 15 },
  { method: 'POST', path: '/projects', weight: 5 },
  { method: 'GET', path: '/scenes/${projectId}', weight: 10 },
  { method: 'GET', path: '/scripts/${projectId}', weight: 10 },
  { method: 'GET', path: '/dashboard/stats', weight: 10 },
  { method: 'GET', path: '/workspaces', weight: 8 },
  { method: 'GET', path: '/billing/credits', weight: 5 },
  { method: 'POST', path: '/videos/generate', weight: 3 },
  { method: 'GET', path: '/render-jobs/${id}', weight: 5 },
  { method: 'GET', path: '/notifications', weight: 5 },
  { method: 'GET', path: '/users/profile', weight: 4 },
]

export default function () {
  // Weighted random endpoint selection
  const totalWeight = ENDPOINTS.reduce((s, e) => s + e.weight, 0)
  let rand = Math.random() * totalWeight
  let selected = ENDPOINTS[0]
  for (const ep of ENDPOINTS) {
    rand -= ep.weight
    if (rand <= 0) { selected = ep; break }
  }

  const url = `${BASE_URL}${selected.path}`
  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  }

  const res = http.request(selected.method, url, null, params)
  apiLatency.add(res.timings.duration)
  errorRate.add(res.status >= 400)

  check(res, {
    'status is 200/201': (r) => r.status === 200 || r.status === 201,
    'duration < 500ms': (r) => r.timings.duration < 500,
    'duration < 2000ms': (r) => r.timings.duration < 2000,
  })

  sleep(Math.random() * 0.5) // Simulate user think time
}
```

### 14.2 Queue Stress Testing

```javascript
// tests/performance/queue-stress.js
export const options = {
  scenarios: {
    render_queue: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '2m', target: 50 },   // 50 jobs/s
        { duration: '3m', target: 100 },  // 100 jobs/s
        { duration: '5m', target: 200 },  // 200 jobs/s
        { duration: '2m', target: 0 },    // Cooldown
      ],
    },
  },
  thresholds: {
    'queue_enqueue_duration': ['p(95)<200'],
    'queue_process_duration': ['p(95)<300000'], // 5 min max processing
    'queue_failure_rate': ['rate<0.02'],
  },
}

export default function () {
  const job = {
    projectId: `proj_${Math.random().toString(36).slice(2)}`,
    type: Math.random() > 0.7 ? 'render' : 'pipeline',
    priority: Math.ceil(Math.random() * 5),
    config: {
      resolution: ['720p', '1080p', '4k'][Math.floor(Math.random() * 3)],
      duration: Math.ceil(Math.random() * 600) + 60,
    },
  }
  // ... submit to BullMQ queue via HTTP API
}
```

### 14.3 Database Query Performance

```sql
-- Enable pg_stat_statements for slow query tracking
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor queries exceeding threshold
SELECT
  queryid,
  left(query, 100) AS short_query,
  calls,
  mean_exec_time,
  max_exec_time,
  rows
FROM pg_stat_statements
WHERE query LIKE '%vidara%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### 14.4 Cache Hit Ratio Validation

```typescript
// tests/performance/cache-validation.ts
describe('Redis Cache Hit Ratio', () => {
  it('should maintain cache hit ratio >= 90%', async () => {
    const info = await redis.info('stats')
    const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0')
    const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0')
    const ratio = hits / (hits + misses)
    expect(ratio).toBeGreaterThanOrEqual(0.9)
  })

  it('should serve dashboard from cache for active user', async () => {
    const cached = await redis.get('dashboard:user:123')
    expect(cached).not.toBeNull()
  })
})
```

---

## 15. Security Testing

### 15.1 OWASP ZAP Automated Scanning

```yaml
# .github/workflows/security-scan.yml (extended from devops.md)
security-scan:
  runs-on: ubuntu-24.04
  steps:
    - uses: actions/checkout@v4
    - name: Start ZAP
      run: |
        docker run -d --name zap -p 8080:8080 \
          -v $PWD:/zap/wrk/:rw \
          ghcr.io/zaproxy/zaproxy:stable \
          zap.sh -daemon -port 8080 -host 0.0.0.0

    - name: Run ZAP Baseline Scan
      run: |
        docker exec zap zap-cli quick-scan \
          --spider \
          --scan-level high \
          --ajax-spider \
          https://staging.vidara.ai

    - name: Generate ZAP Report
      run: |
        docker exec zap zap-cli report \
          -o /zap/wrk/zap-report.html \
          -f html

    - name: Upload Report
      uses: actions/upload-artifact@v4
      with:
        name: zap-report
        path: zap-report.html
```

### 15.2 SAST (Static Application Security Testing)

```yaml
# Semgrep SAST configuration
rules:
  - id: no-hardcoded-secrets
    pattern-either:
      - pattern: 'const $KEY = "sk-..."'
      - pattern: 'process.env.$VAR = $VAL'
    severity: ERROR

  - id: no-sql-injection
    patterns:
      - pattern: 'db.execute(`... $QUERY ...`)'
      - pattern-not: 'db.execute($QUERY, [...])'
    severity: ERROR

  - id: no-ssrf
    pattern: 'fetch($USER_INPUT)'
    severity: WARNING
```

### 15.3 Dependency Vulnerability Scanning

```bash
# npm audit with threshold
npm audit --audit-level=high

# Snyk monitor
snyk test --all-projects --severity-threshold=high

# Output gate
# Fail if critical + high > 0
```

### 15.4 Secret Scanning

```yaml
# .gitleaks.toml
[allowlist]
  paths = [
    'tests/**',
    '*.spec.ts',
    '*.test.ts',
  ]

[[rules]]
  id = "openai-api-key"
  regex = '''sk-[a-zA-Z0-9]{20,}'''
  severity = "high"

[[rules]]
  id = "jwt-secret"
  regex = '''(JWT_SECRET|jwtSecret)\s*=\s*['"][a-zA-Z0-9]{32,}['"]'''
  severity = "critical"
```

---

## 16. AI Testing

### 16.1 Prompt Output Validation

Setiap prompt output dari 21 AI agents di-validasi untuk accuracy, relevance, dan safety menggunakan automated evaluator:

```typescript
// tests/ai/validators/promptValidator.ts
interface ValidationResult {
  accuracyScore: number    // 0-100
  relevanceScore: number   // 0-100
  safetyScore: number      // 0-100
  factualErrors: string[]
  hallucinationFlags: string[]
}

async function validateAgentOutput(
  agentName: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
): Promise<ValidationResult> {
  // Deterministic checks
  const schemaErrors = validateJsonSchema(agentSchemas[agentName].output, output)
  // Semantic checks via GPT-5o evaluator
  const semanticScore = await evaluateSemanticQuality(input, output)
  // Factual consistency check
  const factualErrors = await checkFactualConsistency(output)
  // Safety moderation
  const safetyFlags = await checkContentSafety(output)

  return {
    accuracyScore: semanticScore.accuracy,
    relevanceScore: semanticScore.relevance,
    safetyScore: safetyFlags.safetyScore,
    factualErrors,
    hallucinationFlags: safetyFlags.hallucinations,
  }
}
```

### 16.2 A/B Testing Framework for Prompt Variants

```typescript
// tests/ai/ab-testing/promptVariants.ts
interface ABTestConfig {
  variantA: { systemPrompt: string; temperature: number }
  variantB: { systemPrompt: string; temperature: number }
  sampleSize: number
  metrics: ['qualityScore', 'latency', 'costPerCall', 'hallucinationRate']
}

async function runABTest(config: ABTestConfig) {
  const resultsA = await runVariants(config.variantA, config.sampleSize)
  const resultsB = await runVariants(config.variantB, config.sampleSize)

  return {
    winner: resultsA.qualityScore > resultsB.qualityScore ? 'A' : 'B',
    significance: calculatePValue(resultsA, resultsB),
    lift: ((resultsA.qualityScore - resultsB.qualityScore) / resultsB.qualityScore) * 100,
    recommendations: generateRecommendations(resultsA, resultsB),
  }
}
```

### 16.3 Model Output Quality Scoring

| Metric | Weight | Calculation | Threshold |
|---|---|---|---|
| Coherence | 25% | GPT-5o evaluation of logical flow | ≥80/100 |
| Relevance | 20% | Semantic similarity to prompt | ≥85/100 |
| Factuality | 25% | Cross-reference with trusted sources | ≥90/100 |
| Safety | 15% | Content moderation score | ≥95/100 |
| Style Match | 15% | Adherence to brand/style guidelines | ≥75/100 |

### 16.4 Hallucination Detection Testing

```typescript
// tests/ai/hallucination/hallucinationDetector.ts
const HALLUCINATION_PATTERNS = [
  { pattern: /according to my research/i, risk: 'medium' },
  { pattern: /studies show(?:\s+that)?\s+[^,]+\s+(?:are|is)\s+/i, risk: 'high' },
  { pattern: /\d{4}\s+(?:study|research|report)\s+(?:found|showed|suggested)/i, risk: 'high' },
  { pattern: /experts\s+(?:say|believe|agree|suggest)/i, risk: 'medium' },
  { pattern: /it is (?:widely|commonly|generally)\s+(?:known|accepted|believed)/i, risk: 'medium' },
]

async function detectHallucinations(output: string): Promise<DetectionResult> {
  const flags: Flag[] = []

  // Pattern-based detection
  for (const { pattern, risk } of HALLUCINATION_PATTERNS) {
    const matches = output.match(pattern)
    if (matches) {
      flags.push({
        pattern: pattern.source,
        match: matches[0],
        risk: risk as 'medium' | 'high',
        position: matches.index,
      })
    }
  }

  // Semantic consistency check
  const consistencyScore = await checkSemanticConsistency(output)

  // Source verification for claims
  const unverifiableClaims = await verifyClaimSources(output)

  return {
    hallucinationCount: flags.length + unverifiableClaims.length,
    riskLevel: flags.some(f => f.risk === 'high') ? 'high' : 'medium',
    flags,
    unverifiableClaims,
    consistencyScore,
    recommendation: flags.length > 3 ? 'retry' : 'proceed',
  }
}
```

### 16.5 Test Data: External API Fixtures

```
tests/
└── fixtures/
    ├── openai/
    │   ├── chat-completion-success.json
    │   ├── chat-completion-stream.json
    │   ├── chat-completion-error-429.json
    │   └── dall-e-generation.json
    ├── elevenlabs/
    │   ├── tts-success.mp3
    │   ├── tts-voices-list.json
    │   └── tts-error-quota.json
    ├── deepgram/
    │   ├── stt-transcript.json
    │   ├── stt-error.json
    │   └── stt-stream.json
    ├── runway/
    │   ├── gen-video-success.json
    │   └── gen-video-progress.json
    ├── youtube/
    │   ├── upload-success.json
    │   ├── analytics-report.json
    │   └── quota-error.json
    └── flux/
        ├── image-generation.json
        ├── image-upscale.json
        └── content-policy-violation.json
```

---

## 17. QA Process

### 17.1 Code Review Checklist

| Kategori | Item | Severity |
|---|---|---|
| Functionality | Apakah kode memenuhi acceptance criteria? | Critical |
| Functionality | Apakah edge cases ditangani? | High |
| Testing | Apakah ada unit test untuk logic baru? | Critical |
| Testing | Apakah test mencakup error states? | High |
| Testing | Apakah snapshot test diupdate? | Medium |
| Security | Apakah input user di-validasi? | Critical |
| Security | Apakah ada hardcoded secrets? | Critical |
| Security | Apakah rate limiting diterapkan? | High |
| Performance | Apakah query di-optimasi (N+1 check)? | High |
| Performance | Apakah caching strategy tepat? | Medium |
| Accessibility | Apakah komponen accessible? | Medium |
| Architecture | Apakah kode mengikuti pattern yang sudah ada? | Medium |

### 17.2 PR Quality Gates

```mermaid
flowchart TD
    PR[PR Opened] --> Lint[Lint Check]
    Lint -->|Pass| TypeCheck[TypeScript Check]
    Lint -->|Fail| Block[Block Merge]
    TypeCheck -->|Pass| UnitTest[Unit Tests]
    TypeCheck -->|Fail| Block
    UnitTest -->|Pass| IntegrationTest[Integration Tests]
    UnitTest -->|Fail| Block
    IntegrationTest -->|Pass| BuildCheck[Build Check]
    IntegrationTest -->|Fail| Block
    BuildCheck -->|Pass| CoverageGate{Coverage ≥80%?}
    BuildCheck -->|Fail| Block
    CoverageGate -->|Yes| PreviewDeploy[Preview Deploy]
    CoverageGate -->|No| Block
    PreviewDeploy -->|Success| ReadyForReview[Ready for Review]
    PreviewDeploy -->|Fail| Block
    
    Block --> Notify[Notify Author with Details]
    
    style PR fill:#6366f1,color:#fff
    style ReadyForReview fill:#22c55e,color:#fff
    style Block fill:#ef4444,color:#fff
```

### 17.3 Automated Test in CI/CD

CI workflow (extended from `devops.md` §7.2):

```yaml
# .github/workflows/ci.yml (test section)
test:
  name: Unit & Integration Tests
  runs-on: ubuntu-24.04
  needs: [lint, typecheck]
  services:
    postgres:
      image: postgres:16-alpine
      env:
        POSTGRES_DB: vidara_test
        POSTGRES_USER: vidara
        POSTGRES_PASSWORD: test_pass
      ports: ["5432:5432"]
    redis:
      image: redis:7-alpine
      ports: ["6379:6379"]
    minio:
      image: minio/minio:latest
      command: ["server", "/data"]
      ports: ["9000:9000"]
      env:
        MINIO_ROOT_USER: test
        MINIO_ROOT_PASSWORD: test123
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 9 }
    - uses: actions/setup-node@v4
      with: { node-version: 22, cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm test:unit -- --coverage
      env:
        DATABASE_URL: postgresql://vidara:test_pass@localhost:5432/vidara_test
        REDIS_URL: redis://localhost:6379
        MINIO_ENDPOINT: http://localhost:9000
        MINIO_ACCESS_KEY: test
        MINIO_SECRET_KEY: test123
    - run: pnpm test:integration
      env:
        DATABASE_URL: postgresql://vidara:test_pass@localhost:5432/vidara_test
    - name: Upload Coverage
      uses: codecov/codecov-action@v4
      with:
        file: ./coverage/unit/lcov.info
        flags: unittests
    - name: Enforce Coverage Threshold
      run: |
        coverage=$(jq '.total.lines.pct' coverage/unit/coverage-summary.json)
        if (( $(echo "$coverage < 80" | bc -l) )); then
          echo "Coverage $coverage% is below 80%" && exit 1
        fi
```

### 17.4 Manual QA Checklist

Pre-release manual QA checklist:

| Area | Item | Tester |
|---|---|---|
| Auth | Register, login, logout, OAuth, forgot password | QA-01 |
| Auth | Session expiry, refresh token, multi-session | QA-01 |
| Workspace | Create, switch, delete workspace, limits | QA-02 |
| Organization | Invite member, role assignment, removal | QA-02 |
| Project | CRUD, status transitions, concurrent edit | QA-02 |
| Pipeline | Full generation flow, cancel, retry | QA-03 |
| Pipeline | All 21 agents output quality (spot check) | QA-03 |
| Image | Generation, variant selection, upscale | QA-03 |
| Voice | TTS preview, voice change, regenerate | QA-03 |
| Video | Preview, export, download | QA-03 |
| YouTube | Auth, upload, schedule, metadata edit | QA-04 |
| Billing | Plan upgrade/downgrade, credit usage, invoice | QA-04 |
| Security | RBAC test (viewer cannot edit, etc.) | QA-05 |
| Security | API Key CRUD, rate limit enforcement | QA-05 |
| Mobile | Responsive layout, touch interactions | QA-01 |
| Performance | Dashboard load time <2s, pipeline start <5s | QA-02 |

### 17.5 UAT Process

```mermaid
flowchart LR
    subgraph "UAT Cycle"
        DEV[Development Complete] --> QA[QA Verification]
        QA --> UAT[User Acceptance Testing]
        UAT -->|Pass| STAGING[Staging Sign-off]
        UAT -->|Fail| FIX[Fix & Re-deploy]
        FIX --> QA
        STAGING --> PROD[Production Release]
    end

    subgraph "UAT Participants"
        PM[Product Manager]
        BA[Business Analyst]
        BETA[Beta Users Group]
        QA[QA Lead]
    end

    UAT --> PM
    UAT --> BA
    UAT --> BETA
    PM & BA & BETA --> FEEDBACK[UAT Feedback Form]
    FEEDBACK --> UAT
```

---

## 18. Test Data Management

### 18.1 Test Factories (using faker)

```typescript
// tests/factories/projectFactory.ts
import { faker } from '@faker-js/faker'

export function createProject(overrides?: Partial<Project>): Project {
  return {
    id: faker.string.uuid(),
    workspaceId: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(['draft', 'generating', 'completed', 'failed']),
    type: faker.helpers.arrayElement(['long-form', 'shorts']),
    language: faker.helpers.arrayElement(['id', 'en', 'jp']),
    targetDuration: faker.number.int({ min: 60, max: 600 }),
    aspectRatio: faker.helpers.arrayElement(['16:9', '9:16', '1:1']),
    resolution: faker.helpers.arrayElement(['720p', '1080p', '4k']),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 7 }),
    ...overrides,
  }
}

export function createUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    plan: faker.helpers.arrayElement(['free', 'pro', 'business', 'enterprise']),
    creditsRemaining: faker.number.int({ min: 0, max: 1000 }),
    emailVerified: faker.datatype.boolean(0.8),
    createdAt: faker.date.past({ years: 1 }),
    ...overrides,
  }
}
```

### 18.2 Database Seed Scripts

```typescript
// internal/db/seeds/test-seed.ts
import { db } from '../index'
import { users, projects, scenes, scripts, workspaces } from '../schema'
import { createUser, createProject } from '../../../tests/factories'

export async function seedTestData() {
  const user = createUser({ email: 'test-e2e@vidara.ai', plan: 'pro' })
  await db.insert(users).values(user)

  const workspace = {
    id: faker.string.uuid(),
    name: 'E2E Test Workspace',
    slug: 'e2e-test-workspace',
    ownerId: user.id,
    plan: 'pro',
  }
  await db.insert(workspaces).values(workspace)

  const projectsList = Array.from({ length: 5 }, () =>
    createProject({ workspaceId: workspace.id, userId: user.id })
  )
  await db.insert(projects).values(projectsList)

  return { user, workspace, projects: projectsList }
}
```

### 18.3 External API Response Fixtures

```
tests/fixtures/
├── openai/
│   ├── chat-completion-success.json
│   ├── chat-completion-stream.raw
│   └── dalle-generation.json
├── elevenlabs/
│   ├── tts-success.bin
│   ├── voices-list.json
│   └── tts-error-quota.json
├── deepgram/
│   ├── stt-response.json
│   └── stt-error.json
├── youtube/
│   ├── upload-init.json
│   ├── upload-complete.json
│   ├── analytics.json
│   └── quota-exceeded.json
└── flux/
    ├── images.json
    ├── upscale.json
    └── content-violation.json
```

### 18.4 Data Cleanup Strategy

| Level | Strategy | Implementation |
|---|---|---|
| Unit Test | Fresh mock per test, no persistence | Vitest `beforeEach` |
| Component Test | Mount/unmount per test, mock store | Vue Test Utils `wrapper.unmount()` |
| Integration Test | Transaction rollback per test suite | Drizzle ORM `db.transaction` + rollback |
| E2E Test | Database truncation + seed before suite | globalSetup + afterAll hooks |
| Performance Test | Dedicated database, truncate before run | Docker compose fresh instance |
| CI/CD | Isolated test database per runner | `test_${GITHUB_RUN_ID}` schema |

```typescript
// tests/helpers/cleanup.ts
import { db } from '~/server/db'
import { sql } from 'drizzle-orm'

export async function truncateAllTables() {
  const tables = [
    'agent_executions', 'pipeline_executions', 'quality_gate_results',
    'scene_images', 'voiceovers', 'subtitles', 'animations',
    'scenes', 'scripts', 'storyboards',
    'projects', 'folders', 'workspaces', 'organization_members',
    'organizations', 'users', 'billing_invoices', 'credit_transactions',
    'api_keys', 'audit_logs', 'notifications',
  ]

  for (const table of tables) {
    await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`)
  }
}
```

---

## 19. Workflow — Full Test Lifecycle

```mermaid
flowchart TD
    PR[PR Created/Updated] --> CI[CI Triggered]

    CI --> LINT[Lint & Format]
    CI --> TYPE[Type Check]
    CI --> UNIT[Unit Tests]
    CI --> INTEGRATION[Integration Tests]
    CI --> BUILD[Build Check]

    LINT -->|Pass| CONTINUE
    TYPE -->|Pass| CONTINUE
    UNIT -->|Pass & Coverage ≥80%| CONTINUE
    INTEGRATION -->|Pass| CONTINUE
    BUILD -->|Pass| CONTINUE
    LINT -->|Fail| FAIL[Block Merge]
    TYPE -->|Fail| FAIL
    UNIT -->|Fail| FAIL
    INTEGRATION -->|Fail| FAIL
    BUILD -->|Fail| FAIL

    CONTINUE --> DEPLOY_PREVIEW[Deploy Preview Environment]
    DEPLOY_PREVIEW --> E2E[E2E Tests - Critical Flows]
    E2E -->|Pass| REVIEW[Ready for Review]
    E2E -->|Fail| FAIL

    subgraph "Nightly / Weekly"
        NIGHTLY[Nightly - Full E2E Suite] --> PERF[Performance Tests - k6]
        WEEKLY[Weekly - Security Scan] --> ZAP[OWASP ZAP]
        WEEKLY --> SNYK[Dependency Scan - Snyk]
        WEEKLY --> SAST[SAST - Semgrep/CodeQL]
        WEEKLY --> SECRET[Secret Scan - Gitleaks]
    end

    subgraph "Production"
        CANARY[Canary Deploy 5%] --> MONITOR[Monitor Error Rates]
        MONITOR -->|OK| ROLLOUT[Rollout 100%]
        MONITOR -->|Spike| ROLLBACK[Auto Rollback]
    end

    style FAIL fill:#ef4444,color:#fff
    style REVIEW fill:#22c55e,color:#fff
    style ROLLOUT fill:#22c55e,color:#fff
    style ROLLBACK fill:#ef4444,color:#fff
```

---

## 20. Flowchart — Test Environment Architecture

```mermaid
flowchart TD
    subgraph "CI Runner (GitHub Actions)"
        CI[CI Pipeline]
    end

    subgraph "Test Environments"
        UNIT_ENV[Unit: Node.js + Vitest]
        INT_ENV[Integration: Node.js + Vitest<br/>+ PostgreSQL 16<br/>+ Redis 7<br/>+ MinIO<br/>+ Testcontainers]
        COMP_ENV[Component: Node.js + Vitest<br/>+ Vue Test Utils<br/>+ JSDOM]
        E2E_ENV[E2E: Playwright<br/>+ Chromium/Firefox/WebKit<br/>+ Nuxt Dev Server]
        PERF_ENV[Performance: k6<br/>+ Dedicated Kubernetes Pod]
        SEC_ENV[Security: OWASP ZAP<br/>+ Snyk<br/>+ Semgrep<br/>+ Gitleaks]
    end

    subgraph "Reporting"
        COV[Coverage Report<br/>/coverage/]
        TEST_REPORT[Test Report<br/>JUnit/HTML]
        PERF_DASH[Performance Dashboard<br/>Grafana]
        SEC_REPORT[Security Report<br/>HTML/SARIF]
    end

    CI --> UNIT_ENV
    CI --> INT_ENV
    CI --> COMP_ENV
    CI --> E2E_ENV

    UNIT_ENV --> COV
    INT_ENV --> TEST_REPORT
    COMP_ENV --> TEST_REPORT
    E2E_ENV --> TEST_REPORT
    PERF_ENV --> PERF_DASH
    SEC_ENV --> SEC_REPORT

    COV -->|Upload| CODECOV[Codecov Dashboard]
    TEST_REPORT -->|Notify| SLACK[Slack Notification]
    PERF_DASH -->|Alert| PAGERDUTY[PagerDuty]
    SEC_REPORT -->|Critical| SLACK
```

---

## 21. Sequence Diagram — Full Test Execution in CI

```mermaid
sequenceDiagram
    participant D as Developer
    participant GH as GitHub
    participant CI as CI Runner
    participant PG as PostgreSQL
    participant RD as Redis
    participant MN as MinIO
    participant TC as Testcontainers
    participant PW as Playwright

    D->>GH: git push / PR
    GH->>CI: Trigger CI Workflow
    CI->>CI: Lint & Format Check
    CI->>CI: TypeScript Compilation Check
    CI->>CI: Run Unit Tests (Vitest)
    CI->>CI: Generate Coverage Report
    alt Coverage < 80%
        CI-->>D: ❌ PR Blocked - Coverage Too Low
    end
    CI->>TC: Start PostgreSQL container
    CI->>TC: Start Redis container
    CI->>TC: Start MinIO container
    TC->>PG: Container ready
    TC->>RD: Container ready
    TC->>MN: Container ready
    CI->>PG: Run migrations
    CI->>PG: Seed test data
    CI->>CI: Run Integration Tests (Vitest)
    CI-->>D: ⚠️ Integration Test Failed
    alt Integration Pass
        CI->>CI: Build Application
        CI->>PW: Run Playwright E2E Tests
        PW->>PW: Chrome / Firefox / WebKit
        PW-->>CI: E2E Results
    end
    CI-->>D: ✅ All Tests Passed
    CI->>D: Coverage Report URL
```

---

## 22. Architecture — Test Infrastructure

```mermaid
C4Container
    title Test Infrastructure — Vidara AI

    Person(dev, "Developer", "Writes code and tests")
    System_Ext(gh, "GitHub Actions", "CI/CD runner")

    System_Boundary(test_infra, "Test Infrastructure") {
        Container(unit, "Unit Test Runner", "Vitest", "~2000 tests, ~30s execution")
        Container(comp, "Component Test Runner", "Vitest + VTU", "~200 tests, ~60s execution")
        Container(int, "Integration Test Runner", "Vitest + Testcontainers", "~400 tests, ~3min execution")
        Container(e2e, "E2E Test Runner", "Playwright", "~50 tests, ~10min execution")
        Container(perf, "Performance Test Runner", "k6", "1000 RPS load tests, ~17min execution")
        Container(sec, "Security Scanner", "ZAP + Snyk + Semgrep", "Weekly scans")
        Container(ai_test, "AI Test Runner", "Custom + GPT-5o", "Output validation, hallucination detection")

        ContainerDb(test_db, "Test Database", "PostgreSQL 16", "Isolated test schema")
        ContainerDb(test_cache, "Test Cache", "Redis 7", "Cache + Queue mock")
        ContainerDb(test_store, "Test Storage", "MinIO", "File storage mock")
    }

    Rel(dev, gh, "Triggers CI/CD")
    Rel(gh, unit, "Runs unit tests")
    Rel(gh, comp, "Runs component tests")
    Rel(gh, int, "Runs integration tests")
    Rel(gh, e2e, "Runs E2E tests")
    Rel(gh, perf, "Runs performance tests (nightly)")
    Rel(gh, sec, "Runs security scans (weekly)")
    Rel(gh, ai_test, "Runs AI validation")

    Rel(int, test_db, "Connects to")
    Rel(int, test_cache, "Connects to")
    Rel(int, test_store, "Connects to")
    Rel(e2e, test_db, "Seeds test data")
    Rel(perf, test_db, "Load tests")
```

---

## 23. ER Diagram — Test Data Model

```mermaid
erDiagram
    TestSuite ||--o{ TestCase : contains
    TestCase ||--o{ TestExecution : has
    TestExecution ||--o{ TestAssertion : validates

    TestSuite {
        string id PK
        string name
        string type "unit|integration|component|e2e|performance|security"
        int total_tests
        int passed
        int failed
        int skipped
        float duration_ms
        datetime executed_at
        string ci_run_id
    }

    TestCase {
        string id PK
        string suite_id FK
        string name
        string file_path
        int line_number
        string status "passed|failed|skipped|flaky"
        float duration_ms
        string last_failure_message
        int retry_count
    }

    TestExecution {
        string id PK
        string case_id FK
        string ci_run_id
        string environment
        string browser "chrome|firefox|webkit"
        string viewport
        datetime started_at
        datetime completed_at
        float duration_ms
        string status
        jsonb error_details
        string screenshot_url
        string trace_url
        string video_url
    }

    TestAssertion {
        string id PK
        string execution_id FK
        string name
        bool passed
        string expected
        string actual
        string message
    }

    CoverageReport ||--o{ CoverageFile : includes
    CoverageReport {
        string id PK
        string ci_run_id
        float lines_pct
        float branches_pct
        float functions_pct
        float statements_pct
        int total_lines
        int covered_lines
    }

    CoverageFile {
        string id PK
        string report_id FK
        string file_path
        float lines_pct
        int total_lines
        int covered_lines
    }
```

---

## 24. Decision Table

### 24.1 Test Level Selection

| Condition | Unit | Component | Integration | E2E | Performance |
|---|---|---|---|---|---|
| Pure logic function | ✅ | ❌ | ❌ | ❌ | ❌ |
| Vue component rendering | ❌ | ✅ | ❌ | ✅ | ❌ |
| API endpoint behavior | ❌ | ❌ | ✅ | ✅ | ❌ |
| Database query correctness | ❌ | ❌ | ✅ | ❌ | ❌ |
| Cross-service integration | ❌ | ❌ | ✅ | ✅ | ❌ |
| User flow completion | ❌ | ❌ | ❌ | ✅ | ❌ |
| Load / stress testing | ❌ | ❌ | ❌ | ❌ | ✅ |
| Visual regression | ❌ | ✅ | ❌ | ✅ | ❌ |
| Security scanning | ❌ | ❌ | ❌ | ❌ | ❌ |
| Accessibility | ❌ | ✅ | ❌ | ✅ | ❌ |

### 24.2 Test Priority for PR Gate

| Change Type | Required Tests | Optional Tests |
|---|---|---|
| New composable/utils | Unit | — |
| New API endpoint | Unit + Integration | E2E |
| New UI component | Unit + Component + A11y | Visual regression |
| New AI agent | Unit + Integration + AI validation | E2E (pipeline) |
| Database schema change | Integration (all queries) | Performance (query plan) |
| Configuration change | — | Integration (smoke) |
| Dependency update | — | Integration + Security scan |
| Hotfix | Unit + Integration (affected) | E2E (critical flow) |
| Major feature | Unit + Component + Integration + E2E + A11y | Performance + Visual |

### 24.3 Test Execution Timing

| Test Type | Trigger | Max Duration | Parallelism |
|---|---|---|---|
| Unit | Every PR push | 30s | 8 workers |
| Component | Every PR push | 60s | 4 workers |
| Integration | Every PR push | 3min | 4 workers |
| E2E (critical) | Every PR push | 10min | 4 workers |
| E2E (full) | Nightly | 30min | 8 workers |
| Performance | Nightly (staging) | 17min | Dedicated runner |
| Security | Weekly + Tag | 20min | Dedicated runner |
| AI Validation | Nightly | 60min | 2 workers |

---

## 25. Checklist — Testing Implementation Readiness

- [x] Vitest configured with coverage thresholds (lines ≥80%, branches ≥75%)
- [x] Vue Test Utils setup with JSDOM for component testing
- [x] Playwright configured with Chromium/Firefox/WebKit projects
- [x] k6 scripts written for API load, queue stress, and DB query performance
- [x] MSW handlers for all 6 external API providers (OpenAI, ElevenLabs, Runway, Deepgram, YouTube, Flux)
- [x] Testcontainers configuration for PostgreSQL, Redis, MinIO
- [x] Test factories using @faker-js/faker for all entities
- [x] External API response fixtures in tests/fixtures/
- [x] Database seed script for E2E test data
- [x] Data cleanup strategy (truncate + transaction rollback)
- [x] GitHub Actions CI workflow with test stages
- [x] Coverage gate enforced in CI (fails if <80%)
- [x] Accessibility testing with vitest-axe per component
- [x] Visual regression with Percy integration
- [x] AI output validation framework (accuracy, relevance, safety scoring)
- [x] Hallucination detection test suite
- [x] A/B testing framework for prompt variants
- [x] OWASP ZAP automated scanning in CI
- [x] SAST rules configured (Semgrep)
- [x] Secret scanning configuration (Gitleaks)
- [x] Dependency scanning (npm audit + Snyk)
- [x] Cross-browser test matrix defined
- [x] Mobile viewport test scenarios
- [x] Code review checklist documented
- [x] PR quality gates enforced
- [x] Manual QA checklist prepared
- [x] UAT process documented

---

## 26. Risk

| ID | Risiko | Level | Dampak | Mitigasi |
|---|---|---|---|---|
| T-R01 | Flaky E2E tests (network, timing) | High | False failures, reduced trust | Playwright retries (2x), networkidle waits, WebSocket polling fallback |
| T-R02 | External API rate limits during test | Medium | Integration tests blocked | MSW mocking for all external APIs; Testcontainers for internal services |
| T-R03 | Test data pollution between runs | Medium | Non-deterministic failures | Transaction rollback per suite; isolated schemas per CI run |
| T-R04 | Coverage below threshold blocks PR | Medium | Developer frustration | Allow override with justification; track trend over time |
| T-R05 | Performance test env not representative | High | False negatives/positives | Dedicated perf environment matching production spec |
| T-R06 | AI model changes break prompt tests | Medium | Test maintenance burden | Semantic similarity scoring instead of exact match; periodic golden dataset refresh |
| T-R07 | Long test execution time (CI) | Medium | Slow developer feedback | Parallel execution (8 shards); tiered test execution (critical first) |
| T-R08 | Visual regression false positives | Low | Noise in CI | Percy diff threshold 0.1%; human review for UI changes |

---

## 27. Mitigation

| ID | Mitigasi | PIC | Timeline |
|---|---|---|---|
| T-R01 | Implement Playwright trace on failure. Auto-retry flaky tests with `testInfo.retry`. Track flaky rate in dashboard. | QA Engineer | Ongoing |
| T-R02 | MSW handlers kept in sync with API spec via OpenAPI codegen. Stale handler detection in CI. | Full Stack Engineer | Weekly sync |
| T-R03 | Drizzle transaction rollback for integration tests. Unique schema per CI run (`test_${GITHUB_RUN_ID}`). | DevOps Engineer | Setup phase |
| T-R04 | Coverage trend chart in dashboard. Allow PR override if coverage improvement trend positive. | QA Engineer | Monthly review |
| T-R05 | Dedicated k6 runner on same instance type as production. Staging environment mirrors production resources. | DevOps Engineer | Setup phase |
| T-R06 | Weekly golden dataset refresh using production-like agent outputs. Test uses cosine similarity for validation. | AI Engineer | Weekly |
| T-R07 | Vitest `shard` option for parallel test execution. Playwright sharding across CI workers. | DevOps Engineer | Configured |
| T-R08 | Percy baseline auto-update on main branch. Human review required for >1% diff. | QA Engineer | Per PR |

---

## 28. Future Improvement

| ID | Improvement | Target Version | Impact |
|---|---|---|---|
| T-FI-01 | Contract testing via Pact for service-to-service API | v1.2 | Early detection of breaking changes |
| T-FI-02 | Chaos engineering experiments (Gremlin/Litmus) | v1.3 | Resilience validation |
| T-FI-03 | AI-powered test generation from FRD | v2.0 | Reduce test writing effort by 40% |
| T-FI-04 | Self-healing test data — auto-repair corrupted test state | v1.2 | Reduce flaky rate |
| T-FI-05 | Synthetic user monitoring — E2E in production every 5min | v1.3 | Production quality SLI |
| T-FI-06 | Performance regression detection in CI (compare with baseline) | v1.1 | Catch perf regression at PR |
| T-FI-07 | Canary test validation — run smoke tests on canary before full rollout | v1.1 | Safer deployments |
| T-FI-08 | Mobile device lab (BrowserStack/SauceLabs) for physical device testing | v2.0 | Real device coverage |
| T-FI-09 | Load test data generation using production traffic replay | v1.3 | Realistic load patterns |
| T-FI-10 | Automated test gap analysis — LLM identifies untested code paths | v2.0 | Higher coverage confidence |

---

## 29. Acceptance Criteria

| AC | Kriteria | Status |
|---|---|---|
| AC-01 | Testing philosophy (shift-left, pyramid, continuous) documented | ✅ |
| AC-02 | Unit testing strategy with Vitest, coverage ≥80% | ✅ |
| AC-03 | Integration testing for all 117 API endpoints | ✅ |
| AC-04 | Database, Redis, MinIO integration tests with Testcontainers | ✅ |
| AC-05 | External API mocking (6 providers) with MSW | ✅ |
| AC-06 | Component testing with Vue Test Utils + interaction + a11y | ✅ |
| AC-07 | E2E testing with Playwright — 6 critical user flows | ✅ |
| AC-08 | Cross-browser (Chrome, Firefox, Safari) + mobile viewport | ✅ |
| AC-09 | Visual regression testing with Percy | ✅ |
| AC-10 | Performance testing with k6 (API load, queue stress, DB perf) | ✅ |
| AC-11 | Security testing (ZAP, SAST, secret scan, dependency scan) | ✅ |
| AC-12 | AI testing (output validation, A/B testing, hallucination detection) | ✅ |
| AC-13 | QA process (code review checklist, PR gates, CI/CD, manual QA, UAT) | ✅ |
| AC-14 | Test data management (factories, seeds, fixtures, cleanup) | ✅ |
| AC-15 | All 21 sections (Tujuan → Referensi) complete | ✅ |
| AC-16 | Valid Mermaid diagrams ≥8 (workflow, flowchart, sequence, arch, ER) | ✅ |
| AC-17 | Cross-reference to devops.md (CI workflow, security scan) | ✅ |
| AC-18 | Cross-reference to prd.md (features, requirements) | ✅ |
| AC-19 | Cross-reference to frd.md (44 fitur, acceptance criteria) | ✅ |
| AC-20 | Cross-reference to api.md (117 endpoints, auth, rate limits) | ✅ |
| AC-21 | Document length ≥500 lines | ✅ |

---

## 30. Referensi

| Dokumen | Path | Konten Terkait |
|---|---|---|
| DevOps & CI/CD | `internal/docs/devops.md` | CI/CD workflows, GitHub Actions, security scanning, deployment pipeline |
| Product Requirement Document | `internal/docs/prd.md` | Product features (53 requirements), user stories, acceptance criteria |
| Functional Requirement Document | `internal/docs/frd.md` | 44 fitur detail, input/output specs, error handling, testability |
| API Specification | `internal/docs/api.md` | 117 REST endpoints, WebSocket events, auth, rate limits, pagination |
| Architecture Document | `internal/docs/architecture.md` | C4 diagrams, system context, container structure, data flow |
| Tech Stack | `internal/docs/techstack.md` | Testing tools selection (Vitest, Playwright, k6), tech decisions |
| Workflow Document | `internal/docs/workflow.md` | Pipeline 20 steps, state machine, event map, queue architecture |
| AI Agent System | `internal/docs/AGENTS.md` | 21 AI agents specification, orchestration, quality gates |
| Prompt Engineering | `internal/docs/prompt-engineering.md` | Per-agent prompt templates, system prompts, context injection |

---

> **End of Testing Strategy Document** — Vidara AI © 2026  
> **Maintainer:** Agent 12 — Senior QA Engineer  
> **Next Step:** Implementasi test suite di CI/CD pipeline per `devops.md` §7.2
