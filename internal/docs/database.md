# Database — Vidara AI

> **Project:** Vidara AI — AI YouTube Video Generator SaaS  
> **Author:** Agent 13 — Senior Database Engineer  
> **Last Updated:** 2026-06-26  
> **Status:** Approved  
> **Cross-Reference:** [Architecture](architecture.md) · [Tech Stack](techstack.md) · [ERD](erd.md)

---

## 1. Tujuan

Dokumen ini mendefinisikan arsitektur database Vidara AI secara komprehensif — mencakup schema design, indexing strategy, partitioning, migration, backup, performance optimization, dan security. Bertujuan menjadi blueprint bagi seluruh tim engineering dalam mengelola data platform dari MVP hingga enterprise scale. Dirancang oleh Agent 13 (Senior Database Engineer) dan direview oleh Agent 3 (Solution Architect), Agent 4 (Software Architect), Agent 11 (Security Engineer).

---

## 2. Background

Vidara AI memproses pipeline video generation yang melibatkan 15+ AI agents, menyimpan 100M+ aset media, mencatat 200M+ audit log entries, dan mengelola transaksi billing untuk ribuan pelanggan. Database harus menangani:

- **High-volume writes**: Setiap video generation menulis 50+ baris ke berbagai tabel (scenes, assets, logs, tasks).
- **Mixed workloads**: OLTP untuk transaksi user, OLAP untuk analytics dashboard.
- **Large objects**: Metadata untuk file besar (video/audio/gambar) yang disimpan di MinIO.
- **Time-series data**: Audit logs, usage records, generation logs yang tumbuh 10M+ rows per bulan.
- **Multi-tenant isolation**: Data terpisah per organization dengan Row-Level Security.

PostgreSQL 16 dipilih berdasarkan evaluasi di `techstack.md` section 15.3 — keunggulan JSONB, pgvector, tsvector, streaming replication, dan ekstensi maturity.

---

## 3. Objective

1. Menyediakan schema yang mendukung semua fitur Vidara AI tanpa redundansi.
2. Menjamin performa query <50ms (p95) untuk semua operasi CRUD utama.
3. Mendukung skalabilitas horizontal melalui partitioning dan read replicas.
4. Zero data loss dengan WAL archiving dan Point-in-Time Recovery.
5. Memenuhi compliance UU PDP Indonesia melalui column-level encryption dan RLS.

---

## 4. Scope

**In Scope:**
- PostgreSQL 16 schema design untuk semua entitas core
- Indexing strategy (B-tree, GIN, GiST, partial, BRIN)
- Time-based partitioning untuk log, audit, usage data
- Migration strategy dengan Drizzle ORM / Kysely
- Backup & disaster recovery (pg_dump, WAL, PITR)
- Security: column-level encryption, row-level security, SSL/TLS
- Connection pooling via PgBouncer

**Out of Scope:**
- Data di luar PostgreSQL (Redis cache, MinIO objects)
- Application-level caching strategy
- Data warehouse / OLAP separate instance

---

## 5. Stakeholder

| Stakeholder | Interest |
|---|---|
| CTO | Data architecture end-to-end, compliance, cost |
| Solution Architect | Schema integrity, integration dengan services |
| Software Architect | ORM mapping, migration strategy |
| DevOps Engineer | Replication, backup, PgBouncer config |
| Security Engineer | Encryption, RLS, audit compliance |
| AI Engineer | Pipeline data flow, job state persistence |
| Full Stack Engineer | Query patterns, API data access |

---

## 6. Requirement

| ID | Requirement | Target |
|---|---|---|
| DB-01 | Query response time (p95) untuk CRUD | <50ms |
| DB-02 | Write throughput untuk pipeline logging | >1000 rows/s |
| DB-03 | Backup RPO | <15 menit (WAL) |
| DB-04 | Recovery RTO | <30 menit |
| DB-05 | Connection pooling | Max 200 connections PgBouncer |
| DB-06 | Read replica lag | <1 detik |
| DB-07 | Encryption at rest | AES-256 |
| DB-08 | Compliance | UU PDP, PSE |

---

## 7. Database Architecture

### 7.1 PostgreSQL 16

```
┌─────────────────────────────────────────────────┐
│              PostgreSQL 16 Cluster               │
├─────────────────────┬───────────────────────────┤
│    Primary Node      │     Standby Replica       │
│  (Read + Write)      │    (Read-Only Queries)     │
├─────────────────────┼───────────────────────────┤
│  - All writes        │  - Analytics queries      │
│  - Real-time writes  │  - Reporting              │
│  - Pipeline updates  │  - Admin dashboards       │
│  - Critical reads    │  - Heavy SELECT queries   │
└─────────────────────┴───────────────────────────┘
         │                        │
         └──────────┬─────────────┘
                    │
         ┌──────────▼─────────────┐
         │    PgBouncer (Pooler)   │
         │  - Transaction pooling  │
         │  - Max 200 connections  │
         │  - Connection reuse     │
         └────────────────────────┘
                    │
         ┌──────────▼─────────────┐
         │   Application Services  │
         │  (Nitro API + Workers)  │
         └────────────────────────┘
```

### 7.2 Connection Pooling (PgBouncer)

| Parameter | Value | Rationale |
|---|---|---|
| Pool Mode | transaction | Balance between session vs statement pooling |
| Default Pool Size | 100 | Sufficient for 10k concurrent users |
| Max Connections | 200 | PostgreSQL max_connections = 300 |
| Timeout | 30s | Prevent hung connections |
| Query Wait Timeout | 10s | Fail fast on queued queries |
| Server Idle Timeout | 300s | Reclaim idle connections |

### 7.3 Replication Topology

- **Streaming Replication**: Primary → 1 Standby (async, synchronous_commit = off for performance)
- **Read Replicas**: 1 standby for report queries, analytics, dashboard
- **Failover**: Manual via `pg_ctl promote` (auto-failover dengan Patroni direncanakan di Phase 2)
- **Replication Slots**: Physical replication slot untuk WAL retention

---

## 8. Schema Design — Naming Conventions

| Convention | Rule |
|---|---|
| Table names | `snake_case`, plural: `users`, `projects`, `scenes` |
| Column names | `snake_case`: `created_at`, `user_id` |
| Primary keys | `uuid` type, default `gen_random_uuid()` |
| Foreign keys | `{table}_id`: `project_id`, `user_id` |
| Indexes | `idx_{table}_{column}` or `idx_{table}_{col1}_{col2}` |
| Timestamps | `created_at`, `updated_at` (with trigger auto-update) |
| Soft delete | `deleted_at` timestamptz nullable |
| JSON/B fields | `jsonb` type (not `json`) for indexing capability |

---

## 9. Key Entities — Detailed Schema

### 9.1 Users & Organizations

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    auth_provider   VARCHAR(20) NOT NULL DEFAULT 'email'
                    CHECK (auth_provider IN ('email','google','github')),
    provider_id     VARCHAR(255),
    email_verified  BOOLEAN DEFAULT FALSE,
    role            VARCHAR(20) NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user','admin','superadmin')),
    preferences     JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    tax_id          VARCHAR(50),
    billing_email   VARCHAR(255),
    tier            VARCHAR(20) NOT NULL DEFAULT 'free'
                    CHECK (tier IN ('free','pro','business','enterprise')),
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE organization_members (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role              VARCHAR(20) NOT NULL DEFAULT 'member'
                      CHECK (role IN ('owner','admin','member','viewer')),
    invited_by        UUID REFERENCES users(id),
    invited_at        TIMESTAMPTZ,
    joined_at         TIMESTAMPTZ,
    UNIQUE (organization_id, user_id)
);

CREATE TABLE workspaces (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name              VARCHAR(200) NOT NULL,
    slug              VARCHAR(100) NOT NULL,
    default_role      VARCHAR(20) DEFAULT 'editor'
                      CHECK (default_role IN ('admin','editor','viewer')),
    settings          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ,
    UNIQUE (organization_id, slug)
);

CREATE TABLE workspace_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL DEFAULT 'editor'
                    CHECK (role IN ('owner','admin','editor','viewer')),
    invited_by      UUID REFERENCES users(id),
    joined_at       TIMESTAMPTZ,
    UNIQUE (workspace_id, user_id)
);
```

### 9.2 Projects & Folders

```sql
CREATE TABLE folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES folders(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id          UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    folder_id             UUID REFERENCES folders(id) ON DELETE SET NULL,
    owner_id              UUID NOT NULL REFERENCES users(id),
    title                 VARCHAR(300) NOT NULL,
    description           TEXT,
    prompt_text           TEXT,
    language              VARCHAR(10) NOT NULL DEFAULT 'en',
    target_duration_secs  INTEGER,
    aspect_ratio          VARCHAR(10) DEFAULT '16:9'
                          CHECK (aspect_ratio IN ('16:9','9:16','1:1','4:5')),
    resolution            VARCHAR(10) DEFAULT '1080p'
                          CHECK (resolution IN ('720p','1080p','2k','4k')),
    status                VARCHAR(20) NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','queued','generating','ready','completed','failed','published')),
    visibility            VARCHAR(20) DEFAULT 'private'
                          CHECK (visibility IN ('private','unlisted','public')),
    youtube_video_id      VARCHAR(50),
    youtube_url           TEXT,
    voice_id              UUID REFERENCES voices(id) ON DELETE SET NULL,
    scheduled_publish_at  TIMESTAMPTZ,
    publish_config        JSONB DEFAULT '{}',
    credits_used          INTEGER DEFAULT 0,
    config                JSONB DEFAULT '{}',
    metadata              JSONB DEFAULT '{}',
    version               INTEGER NOT NULL DEFAULT 1,
    started_at            TIMESTAMPTZ,
    completed_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at            TIMESTAMPTZ
);
```

### 9.3 Scenes, Storyboards & Scripts

```sql
CREATE TABLE scripts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    full_script       TEXT NOT NULL,
    tone              VARCHAR(30) DEFAULT 'neutral'
                      CHECK (tone IN ('formal','casual','humor','dramatic','educational','neutral')),
    target_language   VARCHAR(10) NOT NULL DEFAULT 'en',
    word_count        INTEGER,
    estimated_duration_secs INTEGER,
    narration_segments JSONB DEFAULT '[]',
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE storyboards (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_number      INTEGER NOT NULL,
    script_snippet    TEXT,
    visual_notes      TEXT,
    camera_angle      VARCHAR(50),
    transition_type   VARCHAR(30) DEFAULT 'cut'
                      CHECK (transition_type IN ('cut','fade','crossfade','slide','zoom','dissolve')),
    duration_secs     NUMERIC(6,2),
    image_url         TEXT,
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, scene_number)
);

CREATE TABLE scenes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_number      INTEGER NOT NULL,
    name              VARCHAR(200),
    duration_secs     NUMERIC(6,2),
    narration_text    TEXT,
    scene_direction   TEXT,
    transition_in     VARCHAR(30) DEFAULT 'cut',
    transition_out    VARCHAR(30) DEFAULT 'cut',
    animation_config  JSONB DEFAULT '{}',
    style_config      JSONB DEFAULT '{}',
    status            VARCHAR(20) DEFAULT 'pending'
                      CHECK (status IN ('pending','generating','completed','failed')),
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, scene_number)
);

CREATE TABLE scene_characters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id        UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    character_name  VARCHAR(100) NOT NULL,
    character_ref   TEXT,
    expression      VARCHAR(50),
    position        VARCHAR(50),
    scale           NUMERIC(3,2) DEFAULT 1.0
);

CREATE TABLE scene_overlays (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id        UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    overlay_type    VARCHAR(30) NOT NULL
                    CHECK (overlay_type IN ('text','image','shape','effect')),
    content         JSONB NOT NULL,
    start_time_secs NUMERIC(6,2) DEFAULT 0,
    end_time_secs   NUMERIC(6,2),
    position        JSONB DEFAULT '{"x":0,"y":0}'
);
```

### 9.4 Prompts & Templates

```sql
CREATE TABLE prompts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    user_id         UUID NOT NULL REFERENCES users(id),
    title           VARCHAR(200),
    system_prompt   TEXT,
    user_prompt     TEXT NOT NULL,
    parameters      JSONB DEFAULT '{}',
    compiled_prompt TEXT,
    tokens_used     INTEGER,
    model_used      VARCHAR(100),
    is_library      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prompt_library (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL
                    CHECK (category IN ('educational','entertainment','tutorial','vlog','review','documentary','news','storytelling','custom')),
    prompt_template TEXT NOT NULL,
    variables       JSONB DEFAULT '[]',
    is_public       BOOLEAN DEFAULT FALSE,
    usage_count     INTEGER DEFAULT 0,
    version         INTEGER DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    author_id       UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50),
    thumbnail_url   TEXT,
    snapshot        JSONB NOT NULL,
    is_public       BOOLEAN DEFAULT FALSE,
    usage_count     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 9.5 Assets & BrandKits

```sql
CREATE TABLE assets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id        UUID REFERENCES projects(id) ON DELETE SET NULL,
    uploaded_by       UUID NOT NULL REFERENCES users(id),
    asset_type        VARCHAR(30) NOT NULL
                      CHECK (asset_type IN ('image','video','audio','font','logo','scene_image','character','background','animation_clip','voiceover','subtitle','music','sfx','thumbnail','intro','outro','watermark','other')),
    filename          VARCHAR(500) NOT NULL,
    storage_path      TEXT NOT NULL,
    file_size_bytes   BIGINT,
    mime_type         VARCHAR(100),
    width             INTEGER,
    height            INTEGER,
    duration_secs     NUMERIC(8,2),
    checksum_sha256   VARCHAR(64),
    metadata          JSONB DEFAULT '{}',
    tags              TEXT[],
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

CREATE TABLE brand_kits (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name              VARCHAR(200) NOT NULL DEFAULT 'Default Brand',
    primary_color     VARCHAR(7) DEFAULT '#4F46E5',
    secondary_color   VARCHAR(7) DEFAULT '#7C3AED',
    accent_color      VARCHAR(7) DEFAULT '#06B6D4',
    font_heading      VARCHAR(100) DEFAULT 'Inter',
    font_body         VARCHAR(100) DEFAULT 'Inter',
    logo_light_url    TEXT,
    logo_dark_url     TEXT,
    watermark_url     TEXT,
    watermark_config  JSONB DEFAULT '{"position":"bottom-right","opacity":0.5,"size":10}',
    intro_video_url   TEXT,
    outro_video_url   TEXT,
    default_voice_id  UUID REFERENCES assets(id),
    style_guidelines  TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 9.6 AI Agents, Tasks & Logs

```sql
CREATE TABLE ai_agents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    display_name    VARCHAR(200),
    description     TEXT,
    model           VARCHAR(100),
    provider        VARCHAR(50) NOT NULL,
    version         VARCHAR(20),
    config          JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agent_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_id        UUID NOT NULL REFERENCES ai_agents(id),
    workflow_id     VARCHAR(100),
    step_name       VARCHAR(100) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','running','paused','completed','failed','skipped','retrying')),
    priority        INTEGER DEFAULT 0,
    input_data      JSONB,
    output_data     JSONB,
    tokens_in       INTEGER,
    tokens_out      INTEGER,
    cost_usd        NUMERIC(10,6),
    retry_count     INTEGER DEFAULT 0,
    max_retries     INTEGER DEFAULT 3,
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agent_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
    agent_id        UUID NOT NULL REFERENCES ai_agents(id),
    level           VARCHAR(10) NOT NULL DEFAULT 'info'
                    CHECK (level IN ('debug','info','warn','error')),
    message         TEXT NOT NULL,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 9.7 Render Jobs & Queue

```sql
CREATE TABLE render_jobs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id           UUID NOT NULL REFERENCES users(id),
    status            VARCHAR(20) NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued','processing','completed','failed','cancelled')),
    priority          INTEGER DEFAULT 0,
    resolution        VARCHAR(10) NOT NULL DEFAULT '1080p',
    format            VARCHAR(10) NOT NULL DEFAULT 'mp4'
                      CHECK (format IN ('mp4','mov','webm','gif')),
    codec             VARCHAR(10) DEFAULT 'h264'
                      CHECK (codec IN ('h264','h265','av1')),
    quality_preset    VARCHAR(20) DEFAULT 'standard'
                      CHECK (quality_preset IN ('draft','standard','high')),
    output_path       TEXT,
    file_size_bytes   BIGINT,
    duration_secs     NUMERIC(8,2),
    ffmpeg_params     JSONB,
    error_message     TEXT,
    progress          NUMERIC(5,2) DEFAULT 0,
    started_at        TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE render_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID NOT NULL UNIQUE REFERENCES render_jobs(id) ON DELETE CASCADE,
    queue_position  INTEGER NOT NULL,
    priority        INTEGER NOT NULL DEFAULT 0,
    scheduled_for   TIMESTAMPTZ,
    locked_by       VARCHAR(100),
    locked_at       TIMESTAMPTZ,
    attempts        INTEGER DEFAULT 0,
    max_attempts    INTEGER DEFAULT 3,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 9.8 Subscriptions, Invoices & Credits

```sql
CREATE TABLE plans (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(100) NOT NULL,
    slug                    VARCHAR(50) NOT NULL UNIQUE,
    description             TEXT,
    price_cents             INTEGER NOT NULL,
    currency                VARCHAR(3) DEFAULT 'USD',
    interval                VARCHAR(10) NOT NULL DEFAULT 'month'
                            CHECK (interval IN ('month','year')),
    max_projects_per_month  INTEGER,
    max_storage_bytes       BIGINT,
    max_duration_secs       INTEGER,
    max_team_members        INTEGER,
    priority_queue          BOOLEAN DEFAULT FALSE,
    youtube_publish         BOOLEAN DEFAULT TRUE,
    custom_voice_cloning    BOOLEAN DEFAULT FALSE,
    features                JSONB DEFAULT '{}',
    stripe_price_id         VARCHAR(100),
    is_active               BOOLEAN DEFAULT TRUE,
    sort_order              INTEGER DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id                 UUID NOT NULL REFERENCES plans(id),
    status                  VARCHAR(20) NOT NULL DEFAULT 'trialing'
                            CHECK (status IN ('trialing','active','past_due','canceled','expired')),
    stripe_subscription_id  VARCHAR(100),
    stripe_customer_id      VARCHAR(100),
    current_period_start    TIMESTAMPTZ NOT NULL,
    current_period_end      TIMESTAMPTZ NOT NULL,
    trial_end               TIMESTAMPTZ,
    canceled_at             TIMESTAMPTZ,
    ended_at                TIMESTAMPTZ,
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id         UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    organization_id         UUID NOT NULL REFERENCES organizations(id),
    amount_cents            INTEGER NOT NULL,
    currency                VARCHAR(3) DEFAULT 'USD',
    status                  VARCHAR(20) NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open','paid','uncollectable','void')),
    stripe_invoice_id       VARCHAR(100),
    stripe_payment_intent   VARCHAR(100),
    paid_at                 TIMESTAMPTZ,
    due_date                DATE NOT NULL,
    lines                   JSONB DEFAULT '[]',
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    balance         INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_used      INTEGER DEFAULT 0,
    total_expired   INTEGER DEFAULT 0,
    expires_at      TIMESTAMPTZ,
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credit_transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_id         UUID NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
    organization_id   UUID NOT NULL REFERENCES organizations(id),
    user_id           UUID NOT NULL REFERENCES users(id),
    type              VARCHAR(20) NOT NULL
                      CHECK (type IN ('purchase','usage','refund','bonus','expiration','adjustment')),
    amount            INTEGER NOT NULL,
    balance_after     INTEGER NOT NULL,
    project_id        UUID REFERENCES projects(id),
    invoice_id        UUID REFERENCES invoices(id),
    description       TEXT,
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_records (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id           UUID NOT NULL REFERENCES users(id),
    project_id        UUID REFERENCES projects(id),
    metric_type       VARCHAR(30) NOT NULL
                      CHECK (metric_type IN ('api_calls','video_minutes','storage_bytes','images_generated','audio_minutes','render_minutes','ai_tokens')),
    amount            NUMERIC(12,4) NOT NULL,
    recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 9.9 Audit, Notifications & Activity

```sql
CREATE TABLE audit_logs (
    id                UUID NOT NULL DEFAULT gen_random_uuid(),
    organization_id   UUID REFERENCES organizations(id),
    workspace_id      UUID REFERENCES workspaces(id),
    actor_id          UUID REFERENCES users(id),
    action            VARCHAR(50) NOT NULL
                      CHECK (action IN ('create','update','delete','read','login','logout','export','publish','api_call','role_change','billing_change','invite','permission_change')),
    resource_type     VARCHAR(50) NOT NULL,
    resource_id       UUID,
    details           JSONB DEFAULT '{}',
    ip_address        INET,
    user_agent        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id   UUID REFERENCES organizations(id),
    type              VARCHAR(30) NOT NULL
                      CHECK (type IN ('project_update','generation_complete','generation_failed','invitation','billing','credit_low','system','mention','render_complete')),
    title             VARCHAR(200) NOT NULL,
    body              TEXT,
    data              JSONB DEFAULT '{}',
    is_read           BOOLEAN DEFAULT FALSE,
    read_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activity_feed (
    id                UUID NOT NULL DEFAULT gen_random_uuid(),
    workspace_id      UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id        UUID REFERENCES projects(id) ON DELETE CASCADE,
    actor_id          UUID REFERENCES users(id),
    action_type       VARCHAR(30) NOT NULL,
    description       TEXT NOT NULL,
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);
```

### 9.10 API Keys & Sessions

```sql
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    name            VARCHAR(100) NOT NULL,
    key_prefix      VARCHAR(10) NOT NULL,
    key_hash        VARCHAR(64) NOT NULL,
    scopes          TEXT[] NOT NULL DEFAULT '{read}',
    rate_limit      INTEGER DEFAULT 100,
    is_active       BOOLEAN DEFAULT TRUE,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(500) NOT NULL UNIQUE,
    user_agent      TEXT,
    ip_address      INET,
    is_valid        BOOLEAN DEFAULT TRUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 9.11 Voices (Voice Profile Catalog)

```sql
CREATE TABLE voices (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(100) NOT NULL,
    display_name      VARCHAR(200) NOT NULL,
    language          VARCHAR(10) NOT NULL DEFAULT 'id',
    gender            VARCHAR(10) CHECK (gender IN ('male','female','neutral')),
    style             VARCHAR(50),
    provider          VARCHAR(50) NOT NULL
                      CHECK (provider IN ('elevenlabs','openai','deepgram','internal')),
    provider_voice_id VARCHAR(100),
    preview_url       TEXT,
    is_active         BOOLEAN DEFAULT TRUE,
    is_public         BOOLEAN DEFAULT TRUE,
    sort_order        INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 10. Indexing Strategy

### 10.1 B-tree Indexes (Default — Equality & Range Queries)

```sql
-- Users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_provider ON users(auth_provider) WHERE is_active = TRUE;
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);

-- Voices
CREATE INDEX idx_voices_language ON voices(language) WHERE is_active = TRUE;
CREATE INDEX idx_voices_public ON voices(sort_order ASC) WHERE is_public = TRUE AND is_active = TRUE;

-- Projects
CREATE INDEX idx_projects_voice ON projects(voice_id);
CREATE INDEX idx_projects_scheduled ON projects(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;
CREATE INDEX idx_projects_workspace ON projects(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_owner ON projects(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status ON projects(status) WHERE status IN ('queued','generating');
CREATE INDEX idx_projects_created ON projects(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_workspace_status ON projects(workspace_id, status);
CREATE INDEX idx_projects_folder ON projects(folder_id) WHERE deleted_at IS NULL;

-- Scenes
CREATE INDEX idx_scenes_project ON scenes(project_id);
CREATE INDEX idx_scenes_sequence ON scenes(project_id, scene_number);

-- Agent Tasks
CREATE INDEX idx_agent_tasks_project ON agent_tasks(project_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status) WHERE status IN ('pending','running','retrying');
CREATE INDEX idx_agent_tasks_agent_status ON agent_tasks(agent_id, status);

-- Render Jobs
CREATE INDEX idx_render_jobs_status ON render_jobs(status) WHERE status IN ('queued','processing');
CREATE INDEX idx_render_jobs_user ON render_jobs(user_id);
CREATE INDEX idx_render_queue_position ON render_queue(priority DESC, queue_position ASC)
    WHERE locked_by IS NULL;

-- Subscriptions
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id) WHERE status = 'active';
CREATE INDEX idx_subscriptions_period ON subscriptions(current_period_end)
    WHERE status IN ('active','past_due');

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

### 10.2 GIN Indexes (JSONB & Full-Text Search)

```sql
-- JSONB query support
CREATE INDEX idx_projects_config ON projects USING GIN (config);
CREATE INDEX idx_projects_metadata ON projects USING GIN (metadata);
CREATE INDEX idx_assets_metadata ON assets USING GIN (metadata);
CREATE INDEX idx_agent_tasks_input ON agent_tasks USING GIN (input_data);
CREATE INDEX idx_agent_tasks_output ON agent_tasks USING GIN (output_data);
CREATE INDEX idx_brand_kits_config ON brand_kits USING GIN (watermark_config);

-- Full-text search
ALTER TABLE projects ADD COLUMN search_vector TSVECTOR
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) STORED;
CREATE INDEX idx_projects_search ON projects USING GIN (search_vector);

ALTER TABLE scripts ADD COLUMN search_vector TSVECTOR
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(full_script,''))) STORED;
CREATE INDEX idx_scripts_search ON scripts USING GIN (search_vector);

-- Array indexes
CREATE INDEX idx_assets_tags ON assets USING GIN (tags);
CREATE INDEX idx_api_keys_scopes ON api_keys USING GIN (scopes);
```

### 10.3 GiST Indexes (Geospatial & Range)

```sql
-- Future: geolocation for CDN edge selection
-- CREATE INDEX idx_organizations_region ON organizations USING GIST (service_region);

-- Range exclusion for subscription periods
-- CREATE EXTENSION IF NOT EXISTS btree_gist;
-- CREATE INDEX idx_subscriptions_overlap ON subscriptions USING GIST (
--     organization_id,
--     tstzrange(current_period_start, current_period_end)
-- );
```

### 10.4 Partial Indexes (Conditional)

```sql
-- Active users only
CREATE INDEX idx_users_active_auth ON users(auth_provider) WHERE is_active = TRUE AND deleted_at IS NULL;

-- Failed tasks for monitoring
CREATE INDEX idx_agent_tasks_failed ON agent_tasks(created_at DESC)
    WHERE status = 'failed' AND retry_count >= max_retries;

-- Unread notifications
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- Pending renders
CREATE INDEX idx_render_queue_active ON render_queue(priority DESC) WHERE locked_by IS NULL;
```

### 10.5 BRIN Indexes (Large Time-Series)

```sql
-- Audit logs — huge table, BRIN is 100x smaller than B-tree
CREATE INDEX idx_audit_logs_created ON audit_logs USING BRIN (created_at)
    WITH (pages_per_range = 32);

-- Usage records
CREATE INDEX idx_usage_records_recorded ON usage_records USING BRIN (recorded_at)
    WITH (pages_per_range = 32);

-- Activity feed
CREATE INDEX idx_activity_feed_created ON activity_feed USING BRIN (created_at)
    WITH (pages_per_range = 32);
```

---

## 11. Partitioning

### 11.1 Audit Logs — Monthly Range Partitioning

```sql
-- Create partitions for audit_logs
CREATE TABLE audit_logs_2026_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE audit_logs_2026_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE audit_logs_2026_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
-- ... automated monthly via pg_cron

CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;
```

### 11.2 Activity Feed — Monthly Range

```sql
CREATE TABLE activity_feed_2026_06 PARTITION OF activity_feed
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE activity_feed_2026_07 PARTITION OF activity_feed
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
-- ... automated monthly script
CREATE TABLE activity_feed_default PARTITION OF activity_feed DEFAULT;
```

### 11.3 Usage Records — Monthly Range

```sql
CREATE TABLE usage_records_2026_06 PARTITION OF usage_records
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
-- ... automated monthly
CREATE TABLE usage_records_default PARTITION OF usage_records DEFAULT;
```

### 11.4 Partition Management Script (pg_cron)

```sql
-- Auto-create next month's partitions
SELECT cron.schedule('create-next-partitions', '0 0 1 * *',
    $$
    SELECT from generate_series(
        date_trunc('month', NOW()) + INTERVAL '1 month',
        date_trunc('month', NOW()) + INTERVAL '3 months',
        '1 month'
    ) AS month;
    -- Execute dynamic SQL for each partitioned table
    $$);
```

---

## 12. Migration Strategy

### 12.1 Tool: Drizzle ORM / Kysely

| Aspect | Choice | Rationale |
|---|---|---|
| ORM | Drizzle ORM | TypeScript-native, SQL-like syntax, zero-runtime overhead, supports Nuxt 4 |
| Migration runner | Kysely | Lightweight, programmatic, SQL-first approach |
| Schema definition | Drizzle Kit | Visual schema push, migration generation |
| Seed framework | Kysely + faker.js | Type-safe seed data |

### 12.2 Migration Workflow

```bash
# 1. Define schema in packages/db/schema/*.schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Apply migration
pnpm db:migrate

# 4. Rollback if needed
pnpm db:rollback

# 5. Seed test data
pnpm db:seed
```

### 12.3 Zero-Downtime Migration Principles

1. **Expand-Contract Pattern**: Add new columns as nullable → backfill data → add NOT NULL → remove old columns.
2. **Deploy in phases**: Schema change → code deploy → remove deprecated schema.
3. **Use `pgroll`**: For production migrations with automatic rollback.
4. **Avoid long-running locks**: Use `CREATE INDEX CONCURRENTLY`, `ALTER TABLE ... SET NOT NULL` with low lock timeout.
5. **Blue-Green DB**: Maintain old schema until new schema is verified.

### 12.4 Migration Checklist

| Action | Command | Notes |
|---|---|---|
| Schema diff | `pnpm db:diff` | Compare local with production |
| Generate migration | `pnpm db:generate` | Creates SQL file |
| Review SQL | Manual | Check for locking issues |
| Backup | `pg_dump` | Full backup before migration |
| Apply staging | `pnpm db:migrate` | Test on staging first |
| Apply production | `pnpm db:migrate` | During maintenance window |
| Verify | Health checks | Run `SELECT count(*)` on affected tables |

---

## 13. Backup Strategy

### 13.1 Backup Schedule

| Backup Type | Frequency | Retention | Storage | Method |
|---|---|---|---|---|
| Full (pg_dump) | Daily (03:00 UTC) | 30 days | Cloudflare R2 | `pg_dump -Fc` compressed |
| WAL Archive | Continuous | 7 days | Local + R2 | `archive_command` to R2 |
| Logical Backup | Weekly (Sunday) | 90 days | R2 | `pg_dumpall` for globals |
| Schema Backup | Per migration | Permanent | Git LFS | Migration SQL files |

### 13.2 WAL Archiving Configuration

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://vidara-db-backups/wal/%f --endpoint-url https://r2.cloudflarestorage.com'
archive_timeout = 300
```

### 13.3 Point-in-Time Recovery (PITR)

```bash
# 1. Restore base backup
pg_restore -d vidara_prod latest_backup.dump

# 2. Configure recovery.conf
echo "restore_command = 'aws s3 cp s3://vidara-db-backups/wal/%f %p --endpoint-url https://r2.cloudflarestorage.com'" > recovery.conf
echo "recovery_target_time = '2026-06-26 14:30:00 UTC'" >> recovery.conf

# 3. Start PostgreSQL in recovery mode
pg_ctl -D /data/pgdata start

# 4. Verify data integrity
psql -c "SELECT count(*) FROM projects WHERE created_at > '2026-06-26'"
```

### 13.4 Backup Verification

```bash
# Daily automated restore test (staging)
pg_restore -d vidara_staging_test --jobs=4 latest_backup.dump
psql -d vidara_staging_test -c "SELECT count(*) FROM users;"
psql -d vidara_staging_test -c "SELECT count(*) FROM projects;"
```

---

## 14. Performance Optimization

### 14.1 Connection Pooling (PgBouncer)

```ini
[databases]
vidara = host=127.0.0.1 port=5432 dbname=vidara_prod

[pgbouncer]
pool_mode = transaction
default_pool_size = 100
max_client_conn = 200
max_db_connections = 100
query_wait_timeout = 10
server_idle_timeout = 300
```

### 14.2 PostgreSQL Configuration

```ini
# Memory
shared_buffers = 8GB
effective_cache_size = 24GB
work_mem = 64MB
maintenance_work_mem = 1GB

# Write-ahead Log
wal_buffers = 64MB
wal_writer_delay = 200ms
wal_compression = zstd

# Planner
random_page_cost = 1.1
effective_io_concurrency = 200

# Parallelism
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
parallel_tuple_cost = 0.01
parallel_setup_cost = 100

# Autovacuum
autovacuum_vacuum_scale_factor = 0.01
autovacuum_analyze_scale_factor = 0.005
autovacuum_vacuum_cost_limit = 2000
```

### 14.3 Query Optimization Patterns

| Pattern | Technique | Example |
|---|---|---|
| N+1 queries | Eager loading via JOINs | `projects LEFT JOIN scenes` |
| Slow aggregation | Materialized views | Daily usage summary |
| JSONB filtering | GIN index + `@>` operator | `WHERE config @> '{"language":"id"}'` |
| Full-text search | GIN tsvector index | `WHERE search_vector @@ to_tsquery('video & AI')` |
| Pagination | Keyset pagination (WHERE id > last_id) | Avoid OFFSET for large datasets |
| Bulk inserts | `INSERT ... ON CONFLICT` | Batch task status updates |

### 14.4 Materialized Views

```sql
CREATE MATERIALIZED VIEW mv_daily_usage AS
SELECT
    organization_id,
    DATE(recorded_at) AS day,
    metric_type,
    SUM(amount) AS total_amount
FROM usage_records
GROUP BY organization_id, DATE(recorded_at), metric_type;

CREATE UNIQUE INDEX idx_mv_daily_usage ON mv_daily_usage (organization_id, day, metric_type);

-- Refresh every hour
SELECT cron.schedule('refresh-daily-usage', '0 * * * *',
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_usage$$);

CREATE MATERIALIZED VIEW mv_project_stats AS
SELECT
    workspace_id,
    status,
    COUNT(*) AS project_count,
    SUM(credits_used) AS total_credits,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at)))::INTEGER AS avg_duration_secs
FROM projects
WHERE deleted_at IS NULL
GROUP BY workspace_id, status;

CREATE UNIQUE INDEX idx_mv_project_stats ON mv_project_stats (workspace_id, status);
```

---

## 14.5 Niche Management Schema

### 14.5.1 `niches` Table

Stores content niche definitions per workspace.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| workspace_id | UUID | NO | — | FK → workspaces.id |
| name | VARCHAR(100) | NO | — | Nama niche (unique per workspace) |
| slug | VARCHAR(120) | NO | — | URL-friendly slug |
| description | TEXT | YES | NULL | Deskripsi niche dan scope konten |
| keywords | TEXT[] | NO | '{}' | Array of keywords (GIN indexed, min 3) |
| target_audience | JSONB | YES | NULL | `{ age_range, interests[], language, education_level }` |
| default_style | JSONB | YES | NULL | `{ tone, visual_style, music_mood, pace }` |
| visual_preferences | JSONB | YES | NULL | `{ color_palette[], font_preference, image_style }` |
| reference_content | JSONB | YES | NULL | `[{ title, url, notes }]` — referensi konten |
| brand_kit_id | UUID | YES | NULL | FK → brand_kits.id (optional) |
| is_default | BOOLEAN | NO | false | Apakah niche default workspace |
| is_active | BOOLEAN | NO | true | Soft delete |
| project_count | INTEGER | NO | 0 | Denormalized count of linked projects |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

**Indexes:**
```sql
CREATE INDEX idx_niches_workspace_id ON niches (workspace_id);
CREATE UNIQUE INDEX idx_niches_slug_workspace ON niches (workspace_id, slug);
CREATE INDEX idx_niches_keywords_gin ON niches USING GIN (keywords);
CREATE INDEX idx_niches_brand_kit ON niches (brand_kit_id);
```

### 14.5.2 `project_niches` Junction Table

Links projects to their assigned niches.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| project_id | UUID | NO | — | FK → projects.id |
| niche_id | UUID | NO | — | FK → niches.id |

**Primary Key:** (project_id, niche_id)
**Index:** idx_project_niches_niche_id ON project_niches (niche_id)

### 14.5.3 Usage Pattern

```sql
-- Get all niches with project counts for a workspace
SELECT n.id, n.name, n.keywords, n.is_default, n.project_count,
       n.created_at
FROM niches n
WHERE n.workspace_id = $1 AND n.is_active = true
ORDER BY n.is_default DESC, n.project_count DESC, n.name ASC;

-- Find niches matching a topic (full-text search on keywords)
SELECT n.id, n.name, n.keywords
FROM niches n
WHERE n.workspace_id = $1 AND n.is_active = true
  AND n.keywords && ARRAY[$2]  -- overlap operator
ORDER BY n.is_default DESC;

-- Get niche context for pipeline injection
SELECT n.name, n.keywords, n.target_audience, n.default_style,
       n.visual_preferences, bk.*
FROM niches n
LEFT JOIN brand_kits bk ON bk.id = n.brand_kit_id
WHERE n.id = $1 AND n.is_active = true;
```

---

## 15. Security

### 15.1 Column-Level Encryption

```sql
-- Extension for pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns
-- PII fields in users table
-- email is already hashed for auth, but stored in plaintext for communication
-- Instead, use application-level encryption for sensitive profile data

-- API key hashing (SHA-256, not reversible)
-- key_hash stores SHA256 of the full key; only key_prefix shown to user
```

### 15.2 Row-Level Security (RLS)

```sql
-- Enable RLS on multi-tenant tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Policy: user can only see their own organization's projects
CREATE POLICY projects_org_isolation ON projects
    FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Policy: user can only see assets in their workspace
CREATE POLICY assets_workspace_isolation ON assets
    FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Policy: admin can see everything
CREATE POLICY projects_admin ON projects
    FOR ALL
    USING (
        current_setting('app.current_user_role') = 'admin'
    );
```

### 15.3 SSL/TLS Configuration

```ini
# PostgreSQL SSL
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
ssl_ca_file = '/etc/ssl/certs/ca.crt'
ssl_min_protocol_version = 'TLSv1.3'

# PgBouncer SSL
client_tls_sslmode = require
client_tls_cert_file = '/etc/ssl/certs/pgbouncer.crt'
client_tls_key_file = '/etc/ssl/private/pgbouncer.key'
```

### 15.4 Audit Compliance

| Requirement | Implementation |
|---|---|
| User data export (UU PDP) | Materialized view of all user data |
| Data deletion request | Soft delete + 30 day hard delete cron |
| Access logging | All queries logged via pgaudit extension |
| Retention policy | Partition drop after 365 days (audit_logs) |
| Encryption key rotation | Monthly rotation of pgp_sym_encrypt keys |

---

## 16. Decision Table — Database Decisions

| AD ID | Keputusan | Opsi | Alasan |
|---|---|---|---|
| DB-AD01 | PostgreSQL 16 vs MySQL vs CockroachDB | PostgreSQL 16 | JSONB, pgvector, tsvector, streaming replication, mature extensions, CTE support |
| DB-AD02 | UUID vs SERIAL vs ULID primary keys | UUID v4 | Global uniqueness tanpa coordinated sequence, ORM-friendly, sharding-ready |
| DB-AD03 | PgBouncer vs pgbouncer-rr vs direct connection | PgBouncer (transaction) | Proven, lightweight, connection reuse, built-in pooling |
| DB-AD04 | Streaming vs Logical replication | Streaming | Simpler, lower overhead, sufficient for read replica needs |
| DB-AD05 | Drizzle ORM vs Prisma vs TypeORM | Drizzle ORM | TypeScript-native, SQL-like syntax, zero runtime, Nuxt 4 compatible |
| DB-AD06 | BRIN vs B-tree for time-series | BRIN | 100x smaller index size, faster scans for date-range queries on huge tables |
| DB-AD07 | Monthly vs Weekly vs Daily partitioning | Monthly | Balance between partition count and query performance; 12 partitions/year is manageable |
| DB-AD08 | pg_dump -Fc vs pg_dumpall vs pgBackRest | pg_dump -Fc | Compressed, parallel restore, single file, supports selective restore |
| DB-AD09 | Column-level encryption vs TDE | Column-level (pgcrypto) | Granular control, no performance impact on non-sensitive columns, open source |
| DB-AD10 | RLS vs application-level filtering | RLS + application | Defence in depth; RLS as last line, app filtering for cache efficiency |

---

## 17. Risk

| ID | Risiko | Level | Dampak |
|---|---|---|---|
| DB-R01 | Connection pool exhaustion under peak load | Medium | API timeouts, degraded UX |
| DB-R02 | Replication lag causing stale reads | Medium | User sees outdated data |
| DB-R03 | Long-running migration locks tables | High | Downtime during deployment |
| DB-R04 | WAL archive failure | Medium | PITR capability lost |
| DB-R05 | BRIN index scan performance degradation on UPDATE-heavy tables | Low | Slow queries on audit_logs |
| DB-R06 | JSONB query without GIN index (sequential scan) | Medium | Slow dashboard queries |
| DB-R07 | Autovacuum falling behind on high-write tables | High | Table bloat, index performance |
| DB-R08 | Encryption key compromise | Critical | PII data exposure |
| DB-R09 | Partition exhaustion (no default partition) | Medium | INSERT failures |
| DB-R10 | Disk space exhaustion from WAL accumulation | High | Database crash |

---

## 18. Mitigation

| ID | Mitigasi |
|---|---|
| DB-R01 | PgBouncer connection pooling; monitor `max_client_conn`; auto-scale app instances; set query timeouts |
| DB-R02 | Monitor `pg_stat_replication` lag; set `synchronous_commit = remote_write` for critical writes; circuit breaker for stale replicas |
| DB-R03 | Use `pgroll` for zero-downtime; `CREATE INDEX CONCURRENTLY`; deploy schema changes in maintenance window; always test on staging |
| DB-R04 | Monitor WAL archive success in Grafana; alert on failure; fallback to local WAL archive; redundant R2 bucket |
| DB-R05 | Use BRIN only on append-only tables (audit_logs, usage_records); regular `VACUUM` on partitioned tables |
| DB-R06 | Mandatory GIN indexes for all JSONB columns used in WHERE; query linting in CI; EXPLAIN ANALYZE in code review |
| DB-R07 | Tune autovacuum for high-write tables; monitor `pg_stat_user_tables.n_dead_tup`; schedule aggressive vacuum on agent_tasks |
| DB-R08 | Monthly key rotation; HSM for master keys; audit all key access; separate encryption key per organization (future) |
| DB-R09 | Automated partition creation via pg_cron; always create default partition; monitor partition count |
| DB-R10 | WAL archive to S3/R2; set `wal_keep_size` reasonable limit; monitor disk usage; PagerDuty alert at 80% |

---

## 19. Future Improvement

| Item | Target Date | Impact |
|---|---|---|
| pgvector extension for semantic search | Q4 2026 | AI-powered script search, similar project recommendations |
| Citus / pg_distributed for sharding | Q2 2027 | Horizontal scale beyond single node |
| Patroni + etcd for auto-failover | Q3 2027 | Zero-downtime primary failover |
| TimescaleDB for usage analytics hypertables | Q4 2027 | 10x faster time-series queries |
| Logical replication for CDC to data warehouse | Q4 2027 | Real-time analytics pipeline |
| Columnar store (parquet) for cold audit data | Q1 2028 | Cheaper long-term storage |
| Database per tenant (isolated) for Enterprise | Q2 2028 | Maximum compliance isolation |
| Automatic index recommendation (pg_qualstats) | Q3 2028 | Self-tuning indexes |

---

## 20. Acceptance Criteria

| AC | Kriteria | Status |
|---|---|---|
| DB-AC01 | All 25+ tables defined with full columns, types, constraints, and indexes | ✅ |
| DB-AC02 | Indexing strategy covers B-tree, GIN, GiST, partial, BRIN — each with rationale | ✅ |
| DB-AC03 | Partitioning defined for audit_logs, activity_feed, usage_records with monthly ranges | ✅ |
| DB-AC04 | Migration strategy documented with Drizzle ORM / Kysely workflow | ✅ |
| DB-AC05 | Backup strategy includes pg_dump, WAL, PITR with runbook | ✅ |
| DB-AC06 | Security covers column-level encryption, RLS, SSL, compliance | ✅ |
| DB-AC07 | Performance optimization documented (PgBouncer, config, materialized views) | ✅ |
| DB-AC08 | Dokumen direview oleh Solution Architect, DevOps, dan Security Engineer | ✅ |

---

## 21. Referensi Dokumen Lain

| Dokumen | Path |
|---|---|
| Entity Relationship Diagram | `internal/docs/erd.md` |
| Architecture Document | `internal/docs/architecture.md` |
| Tech Stack Document | `internal/docs/techstack.md` |
| Product Requirement Document | `internal/docs/prd.md` |
| Security Architecture | `internal/docs/security.md` |
| Deployment Guide | `internal/docs/deployment.md` |
| Disaster Recovery Runbook | `internal/docs/disaster-recovery.md` |
| PostgreSQL Documentation | `https://www.postgresql.org/docs/16/` |

---

> **End of Database Document** — Vidara AI © 2026
