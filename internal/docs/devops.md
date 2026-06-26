# DevOps & CI/CD — Vidara AI

> **Project:** Vidara AI — AI YouTube Video Generator SaaS  
> **Author:** Agent 10 — Senior DevOps Engineer, Agent 14 — Senior Cloud Architect  
> **Last Updated:** 2026-06-26  
> **Status:** Final  
> **Cross-Reference:** [Deployment](deployment.md) · [Architecture](architecture.md) · [Tech Stack](techstack.md) · [Database](database.md) · [Roadmap](roadmap.md)

---

## 1. Tujuan

Dokumen DevOps & CI/CD ini mendefinisikan strategi git, pipeline CI/CD, container registry, infrastructure as code, environment management, monitoring stack, cost monitoring, runbooks, dan SLO/SLI definition untuk Vidara AI. Bertujuan menjadi panduan operasional bagi seluruh DevOps dan Engineering team dalam mengelola siklus hidup software dari development hingga production.

---

## 2. Background

Vidara AI adalah platform SaaS kompleks dengan pipeline AI multi-langkah yang membutuhkan reliability tinggi (99.9% uptime), deployment zero-downtime, rollback cepat, dan observability end-to-end. Dengan tim yang terdiri dari 15 agents dengan keahlian berbeda, DevOps practices harus terstandarisasi dan terotomatisasi. Detail infrastruktur dijelaskan di `deployment.md`, sementara arsitektur sistem dijelaskan di `architecture.md`.

---

## 3. Objective

1. Menstandarisasi git workflow dengan trunk-based development dan semantic versioning.
2. Mengotomatisasi seluruh pipeline CI/CD dengan GitHub Actions (7 workflows).
3. Mengelola container image di GitHub Container Registry (ghcr.io).
4. Mengelola environment variables dan secrets secara aman.
5. Menyediakan monitoring end-to-end (Prometheus, Grafana, Loki, Sentry).
6. Mendefinisikan SLO/SLI dan error budget.
7. Menyediakan runbooks untuk operational procedures umum.

---

## 4. Scope

**In Scope:**
- Git strategy: trunk-based development, feature flags, semantic versioning
- GitHub Actions workflows: ci.yml, deploy-dev.yml, deploy-staging.yml, deploy-production.yml, preview.yml, backup.yml, security-scan.yml
- Container registry: GitHub Container Registry (ghcr.io)
- Infrastructure as Code: Docker Compose, Terraform/Pulumi (future)
- Environment management: .env files, secret management, Cloudflare Secrets
- Monitoring stack: Prometheus, Grafana, Loki, Sentry, uptime monitoring, alerting
- Cost monitoring: Cloudflare usage, GPU compute, API usage
- Runbooks: common procedures, incident response, scaling
- SLO/SLI definitions

**Out of Scope:**
- Kubernetes migration (Phase 9 — Q1 2027)
- Multi-region deployment (Phase 9 — Q2 2027)
- Serverless workers (Phase 10 — Q2 2028)

---

## 5. Stakeholder

| Stakeholder | Interest |
|---|---|
| CTO | SLA, uptime, cost efficiency, team velocity |
| DevOps Engineer | CI/CD pipelines, monitoring, infrastructure automation |
| Cloud Architect | Cloudflare, scaling, multi-region strategy |
| Security Engineer | Secret management, security scanning, compliance |
| QA Engineer | Test automation in CI, deployment verification |
| Full Stack Engineer | Git workflow, preview deployments, environment parity |
| Product Manager | Release cadence, feature flag management |

---

## 6. Git Strategy

### 6.1 Branching Model — Trunk-Based Development

```mermaid
gitGraph
    commit id: "initial setup"
    commit id: "project init"
    branch feat/video-pipeline
    checkout feat/video-pipeline
    commit id: "temporal workflows"
    commit id: "bullmq queues"
    commit id: "fix retry logic"
    checkout main
    merge feat/video-pipeline tag: "v1.2.0"
    branch feat/ai-gateway
    checkout feat/ai-gateway
    commit id: "circuit breaker"
    commit id: "fallback chain"
    checkout main
    merge feat/ai-gateway tag: "v1.3.0"
    branch feat/monitoring
    checkout feat/monitoring
    commit id: "grafana dashboards"
    commit id: "prometheus alerts"
    checkout main
    merge feat/monitoring tag: "v1.4.0"
    commit id: "hotfix-rate-limit" tag: "v1.4.1"
```

### 6.2 Branching Rules

| Branch | Source | Target | Lifetime | Purpose |
|---|---|---|---|---|
| `main` | — | — | Permanent | Production-ready code, always deployable |
| `feat/*` | `main` | `main` | ≤ 3 days | New features, improvements |
| `fix/*` | `main` | `main` | ≤ 1 day | Bug fixes, hotfixes |
| `chore/*` | `main` | `main` | ≤ 1 day | Dependencies, config, tooling |
| `deps/*` | `main` | `main` | ≤ 1 day | Automated dependency updates |

### 6.3 Commit Convention

```
<type>(<scope>): <description>

[optional body]

[optional footer: BREAKING CHANGE, Closes #123]
```

| Type | Description | Example |
|---|---|---|
| `feat` | New feature | `feat(pipeline): add temporal workflow compensation` |
| `fix` | Bug fix | `fix(queue): fix BullMQ timeout on long renders` |
| `chore` | Maintenance | `chore(deps): update nuxt to 4.0.1` |
| `refactor` | Code restructure | `refactor(api): extract auth middleware` |
| `perf` | Performance | `perf(render): enable NVENC hardware encoding` |
| `test` | Tests | `test(pipeline): add failure injection tests` |
| `docs` | Documentation | `docs(deploy): add blue-green runbook` |
| `ci` | CI/CD | `ci(actions): parallelize test stages` |
| `sec` | Security | `sec(auth): rotate JWT signing key` |

### 6.4 Semantic Versioning

```
v<MAJOR>.<MINOR>.<PATCH>[-<PRERELEASE>]

MAJOR: Breaking API change or breaking database migration
MINOR: New feature (backward compatible)
PATCH: Bug fix (backward compatible)
PRERELEASE: alpha, beta, rc (pre-release)
```

| Phase | Version Strategy | Example |
|---|---|---|
| Development (Phase 0-4) | 0.x.x (pre-release) | v0.1.0, v0.5.3 |
| Testing (Phase 5) | 0.x.x + rc | v0.8.0-rc.1 |
| Production (Phase 8) | 1.x.x | v1.0.0, v1.2.3 |
| Growth (Phase 9) | 1.x.x | v1.15.0 |
| Enterprise (Phase 10) | 2.x.x | v2.0.0 |

### 6.5 Feature Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `new-pipeline-v2` | boolean | false | Enable new Temporal workflow v2 |
| `ai-fallback` | boolean | true | Enable fallback to secondary AI providers |
| `publish-youtube` | boolean | true | Enable YouTube publish feature |
| `video-chunking` | boolean | false | Enable chunked video rendering |
| `self-serve-billing` | boolean | false | Enable customer self-serve billing portal |
| `enterprise-sso` | boolean | false | Enable SAML/OIDC SSO |

Feature flags are managed via `packages/config/feature-flags.ts` and controlled through environment variables. LaunchDarkly integration planned for Phase 9.

---

## 7. GitHub Actions Workflows

### 7.1 Workflow Overview

```mermaid
flowchart TD
    subgraph "Event Triggers"
        PUSH[Push to main]
        PR[PR Opened/Updated]
        TAG[Tag Created v*]
        SCHED[Cron Schedule]
        MANUAL[Workflow Dispatch]
    end

    subgraph "Workflows"
        CI[ci.yml<br/>Lint → Type → Test → Build]
        DEV[deploy-dev.yml<br/>Auto-deploy to dev]
        STG[deploy-staging.yml<br/>Manual deploy to staging]
        PROD[deploy-production.yml<br/>Manual + Approval + Blue-Green]
        PREV[preview.yml<br/>Ephemeral per PR]
        BACKUP[backup.yml<br/>Scheduled DB backup]
        SEC[security-scan.yml<br/>Dependency + SAST + Secrets]
    end

    subgraph "Environments"
        E_DEV[Development<br/>dev.vidara.ai]
        E_STG[Staging<br/>staging.vidara.ai]
        E_PROD[Production<br/>vidara.ai]
        E_PREV[Preview<br/>pr-{n}.dev.vidara.ai]
    end

    PUSH --> CI
    PR --> CI
    CI -->|Pass on main| DEV
    CI -->|Pass on PR| PREV
    DEV --> E_DEV
    PREV --> E_PREV
    MANUAL --> STG
    STG --> E_STG
    MANUAL --> PROD
    PROD -->|Approval Gate| E_PROD
    SCHED --> BACKUP
    SCHED --> SEC
    TAG --> SEC
```

### 7.2 Workflow: CI (`ci.yml`)

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, 'feat/**', 'fix/**']
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: 22
  PNPM_VERSION: 9

jobs:
  lint:
    name: Lint & Format
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check

  typecheck:
    name: Type Check
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

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
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://vidara:test_pass@localhost:5432/vidara_test
          REDIS_URL: redis://localhost:6379
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: test-results/

  build:
    name: Build
    runs-on: ubuntu-24.04
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: .output/

  e2e:
    name: E2E Tests
    runs-on: ubuntu-24.04
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: .output/
      - run: pnpm exec playwright install chromium
      - run: pnpm test:e2e
        env:
          BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    name: Security Scan
    runs-on: ubuntu-24.04
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - run: pnpm audit --prod
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  docker-build:
    name: Docker Build & Push
    runs-on: ubuntu-24.04
    needs: [e2e, security-scan]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - run: |
          docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --tag ghcr.io/vidara-ai/web:latest \
            --tag ghcr.io/vidara-ai/web:${{ github.sha }} \
            --file docker/Dockerfile.web \
            --push .
          docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --tag ghcr.io/vidara-ai/worker:latest \
            --tag ghcr.io/vidara-ai/worker:${{ github.sha }} \
            --file docker/Dockerfile.worker \
            --push .
```

### 7.3 Workflow: Deploy Dev (`deploy-dev.yml`)

```yaml
# .github/workflows/deploy-dev.yml
name: Deploy to Development

on:
  workflow_run:
    workflows: ["CI"]
    types:
      - completed
    branches: [main]

concurrency:
  group: deploy-dev
  cancel-in-progress: true

env:
  ENVIRONMENT: development
  DOMAIN: dev.vidara.ai

jobs:
  deploy:
    name: Deploy to Dev
    runs-on: ubuntu-24.04
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    environment: development

    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to Dev VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DEV_HOST }}
          username: ${{ secrets.DEV_USER }}
          key: ${{ secrets.DEV_SSH_KEY }}
          script: |
            cd /opt/vidara
            docker compose -f docker-compose.yml pull
            docker compose -f docker-compose.yml up -d --force-recreate api temporal-worker
            docker compose -f docker-compose.yml exec -T api pnpm db:migrate
            docker image prune -f

      - name: Smoke Test
        run: |
          sleep 10
          curl -f https://${{ env.DOMAIN }}/api/health

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "${{ job.status == 'success' && '✅' || '❌' }} Dev deploy ${{ job.status }}: ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 7.4 Workflow: Deploy Staging (`deploy-staging.yml`)

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Image version (git SHA or tag)'
        required: true
        default: 'latest'
      run_migrations:
        description: 'Run database migrations'
        required: true
        type: boolean
        default: true

concurrency:
  group: deploy-staging
  cancel-in-progress: false

env:
  ENVIRONMENT: staging
  DOMAIN: staging.vidara.ai

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-24.04
    environment: staging

    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to Staging VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.STG_HOST }}
          username: ${{ secrets.STG_USER }}
          key: ${{ secrets.STG_SSH_KEY }}
          script: |
            cd /opt/vidara
            export IMAGE_TAG=${{ github.event.inputs.version }}
            docker compose -f docker-compose.yml -f docker-compose.staging.yml pull
            docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d --force-recreate

            if [ "${{ github.event.inputs.run_migrations }}" = "true" ]; then
              docker compose -f docker-compose.yml -f docker-compose.staging.yml exec -T api pnpm db:migrate
            fi

            docker image prune -f

      - name: Run Smoke Tests
        run: |
          sleep 15
          curl -f https://${{ env.DOMAIN }}/api/health
          curl -f https://${{ env.DOMAIN }}/api/v1/projects -H "Authorization: Bearer ${{ secrets.STG_API_KEY }}"

      - name: Run E2E Tests
        run: |
          pnpm exec playwright test --grep "@staging"

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "Staging deploy completed: ${{ github.event.inputs.version }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 7.5 Workflow: Deploy Production (`deploy-production.yml`)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Image version (git SHA or tag)'
        required: true
      canary_percent:
        description: 'Canary traffic percentage (10, 25, 50)'
        required: true
        default: '10'
      run_migrations:
        description: 'Run database migrations'
        type: boolean
        default: false

concurrency:
  group: deploy-production
  cancel-in-progress: false

env:
  ENVIRONMENT: production
  DOMAIN: vidara.ai

jobs:
  approval:
    name: Approval Gate
    runs-on: ubuntu-24.04
    environment: production
    steps:
      - run: echo "Deploying ${{ github.event.inputs.version }} to production"
        # Environment protection rules handle the approval gate

  deploy-blue-green:
    name: Blue-Green Deployment
    runs-on: ubuntu-24.04
    needs: [approval]

    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy Green Instance
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/vidara

            # Pre-deploy backup
            ./scripts/backup/postgres-full.sh

            # Pull new image
            export IMAGE_TAG=${{ github.event.inputs.version }}
            docker compose -f docker-compose.yml -f docker-compose.prod.yml pull api

            # Start green instance
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d api-green

            # Wait for green health
            for i in {1..30}; do
              if curl -sf http://localhost:3001/api/health; then
                echo "Green instance healthy"
                break
              fi
              sleep 2
            done

            # Switch nginx to green
            docker compose -f docker-compose.prod.yml exec nginx \
              sed -i 's/set $api_upstream api:3000/set $api_upstream api:3001/g' /etc/nginx/conf.d/default.conf
            docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

      - name: Canary Release (${{ github.event.inputs.canary_percent }}%)
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/vidara
            # Route canary_percent of traffic to green
            ./scripts/deploy/canary.sh --percent=${{ github.event.inputs.canary_percent }}

      - name: Monitor & Ramp (5 min observation)
        run: |
          echo "Monitoring canary for 5 minutes..."
          sleep 300

          # Check error rate
          ERROR_RATE=$(curl -s https://${{ env.DOMAIN }}/api/monitoring/error-rate | jq '.error_rate')
          if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
            echo "Error rate too high ($ERROR_RATE). Triggering rollback..."
            exit 1
          fi

      - name: Ramp to 100%
        if: success()
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/vidara
            ./scripts/deploy/canary.sh --percent=100
            docker compose -f docker-compose.prod.yml stop api-blue
            docker image prune -f

      - name: Run Migrations
        if: ${{ github.event.inputs.run_migrations == 'true' && success() }}
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/vidara
            docker compose -f docker-compose.prod.yml exec -T api-green pnpm db:migrate

    services:
      rollback:
        name: Rollback on Failure
        if: failure()
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/vidara
            ./scripts/runbooks/rollback.sh
            echo "Rollback completed. Notifying team..."

      - name: Notify Deployment
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "${{ job.status == 'success' && '✅' || '❌' }} Production deploy ${{ job.status }}: ${{ github.event.inputs.version }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 7.6 Workflow: Preview Deploy (`preview.yml`)

```yaml
# .github/workflows/preview.yml
name: Preview Deploy

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: preview-${{ github.ref }}
  cancel-in-progress: true

env:
  PREVIEW_DOMAIN: pr-${{ github.event.number }}.dev.vidara.ai

jobs:
  preview:
    name: Deploy Preview
    runs-on: ubuntu-24.04
    environment:
      name: preview
      url: https://${{ env.PREVIEW_DOMAIN }}

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      - name: Build for Preview
        run: pnpm build
        env:
          NUXT_PUBLIC_SITE_URL: https://${{ env.PREVIEW_DOMAIN }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages deploy .output/public --project-name=vidara-preview --branch=pr-${{ github.event.number }}

      - name: Comment Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployed: https://${{ env.PREVIEW_DOMAIN }}`
            })

  cleanup:
    name: Cleanup Preview
    if: github.event.action == 'closed'
    runs-on: ubuntu-24.04
    steps:
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages delete --project-name=vidara-preview --branch=pr-${{ github.event.number }}
```

### 7.7 Workflow: Backup (`backup.yml`)

```yaml
# .github/workflows/backup.yml
name: Scheduled Backup

on:
  schedule:
    - cron: '0 3 * * *' # Daily at 03:00 UTC
  workflow_dispatch:

jobs:
  postgres:
    name: PostgreSQL Backup
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - name: Execute backup script
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/vidara
            ./scripts/backup/postgres-full.sh
            ./scripts/backup/verify-backup.sh

      - name: Backup Notification
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: '{"text": "${{ job.status == \"success\" && \"✅\" || \"❌\" }} Daily backup ${{ job.status }}"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  config:
    name: Configuration Backup
    runs-on: ubuntu-24.04
    steps:
      - name: Backup Cloudflare config
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cp /opt/vidara/.env.production /backups/config/.env.production.$(date +%Y%m%d)
            cp /opt/vidara/docker/nginx/conf.d/default.conf /backups/config/nginx.$(date +%Y%m%d).conf
            aws s3 sync /backups/config/ s3://vidara-backups-prod/config/ \
              --endpoint-url https://r2.cloudflarestorage.com
```

### 7.8 Workflow: Security Scan (`security-scan.yml`)

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 6 * * 1' # Weekly on Monday 06:00 UTC
  workflow_dispatch:

jobs:
  dependency-scan:
    name: Dependency Audit
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --prod
        continue-on-error: true

  sast:
    name: SAST Scan (CodeQL)
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
          queries: security-and-quality
      - uses: github/codeql-action/analyze@v3

  container-scan:
    name: Container Vulnerability Scan
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'image'
          image-ref: 'ghcr.io/vidara-ai/web:latest'
          format: 'sarif'
          output: 'trivy-image-results.sarif'
          severity: 'CRITICAL,HIGH'

  secret-scan:
    name: Secret Detection
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  report:
    name: Generate Security Report
    runs-on: ubuntu-24.04
    needs: [dependency-scan, sast, container-scan, secret-scan]
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "🔒 Weekly security scan completed. Check findings: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SECURITY_SLACK_WEBHOOK }}
```

### 7.9 Workflow Summary Matrix

| Workflow | Trigger | Environment | Approval | Deploy Strategy | Rollback |
|---|---|---|---|---|---|
| `ci.yml` | Push/PR to main | CI only | None | N/A | N/A |
| `deploy-dev.yml` | CI pass on main | Development | None | Direct replacement | Auto on failure |
| `deploy-staging.yml` | Manual dispatch | Staging | None | Direct replacement | Manual |
| `deploy-production.yml` | Manual dispatch | Production | Required | Blue-Green + Canary | Auto on failure |
| `preview.yml` | PR opened | Preview | None | Cloudflare Pages | Auto on PR close |
| `backup.yml` | Cron (03:00 UTC) | All | None | N/A | N/A |
| `security-scan.yml` | Cron (weekly) | All | None | N/A | N/A |

---

## 8. Container Registry

### 8.1 GitHub Container Registry (ghcr.io)

```yaml
# Registry Structure
ghcr.io/vidara-ai/
├── web                    # Nuxt 4 production image
│   ├── latest
│   ├── <git-sha>
│   ├── v1.2.3
│   └── v1.2.3-rc.1
├── worker                 # Temporal worker image
│   ├── latest
│   ├── <git-sha>
│   └── v1.2.3
└── tools                  # Utility images (migration, seed)
    ├── latest
    └── <git-sha>
```

### 8.2 Image Tagging Strategy

| Tag | Format | Update Frequency | Retention |
|---|---|---|---|
| `latest` | `latest` | Every push to main | 90 days |
| `git-sha` | `abc123def` | Every push to main | 180 days |
| `semantic` | `v1.2.3` | Manual (release) | 365 days |
| `pre-release` | `v1.2.3-rc.1` | Manual (pre-release) | 30 days |
| `branch` | `feat-video-pipeline` | Per branch build | 7 days |
| `pr` | `pr-123` | Per PR build | Until PR close |

### 8.3 Image Cleanup Policy

```yaml
# .github/workflows/cleanup-images.yml
name: Cleanup Container Images

on:
  schedule:
    - cron: '0 6 * * 1' # Weekly

jobs:
  cleanup:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/delete-package-versions@v5
        with:
          package-name: 'web'
          package-type: 'container'
          min-versions-to-keep: 20
          delete-only-pre-release-versions: 'true'
```

---

## 9. Infrastructure as Code

### 9.1 Current: Docker Compose

| File | Purpose | Environment |
|---|---|---|
| `docker-compose.yml` | Base service definitions | All |
| `docker-compose.prod.yml` | Production overrides (replicas, resources) | Production |
| `docker-compose.staging.yml` | Staging overrides | Staging |
| `docker-compose.monitoring.yml` | Prometheus, Grafana, Loki, Alertmanager | All |
| `docker-compose.dev.yml` | Dev-specific overrides | Development |

### 9.2 Future: Terraform (Planned Phase 9)

```hcl
# providers.tf (future)
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

# cloudflare.tf (future)
resource "cloudflare_zone" "vidara" {
  zone = "vidara.ai"
}

resource "cloudflare_record" "api" {
  zone_id = cloudflare_zone.vidara.id
  name    = "api"
  value   = cloudflare_tunnel.vidara.cname
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_r2_bucket" "videos" {
  account_id = var.cloudflare_account_id
  name       = "vidara-videos-${var.environment}"
  location   = "WEU"
}

resource "cloudflare_tunnel" "vidara" {
  account_id = var.cloudflare_account_id
  name       = "vidara-${var.environment}"
  secret     = random_password.tunnel_secret.result
}
```

---

## 10. Environment Management

### 10.1 Dotenv Files

```bash
# .env.example — Template for all environments
NODE_ENV=development

# Database
DATABASE_URL=postgresql://vidara:${DB_PASSWORD}@localhost:6432/vidara_dev
DB_PASSWORD=
DB_POOL_MIN=2
DB_POOL_MAX=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=vidara_dev

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_VIDEOS=vidara-videos
MINIO_BUCKET_ASSETS=vidara-assets

# Temporal
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=vidara-dev
TEMPORAL_TASK_QUEUE=video-pipeline

# AI API Keys
OPENAI_API_KEY=
OPENAI_ORG_ID=
ELEVENLABS_API_KEY=
RUNWAY_API_KEY=
DEEPGRAM_API_KEY=

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# YouTube
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# Cloudflare
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=

# Monitoring
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SLACK_WEBHOOK_URL=
PAGERDUTY_ROUTING_KEY=

# Stripe (Billing)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_FREE=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_BUSINESS=
```

### 10.2 Secret Management

| Secret | Storage | Rotation | Access |
|---|---|---|---|
| `DATABASE_URL` | GitHub Secrets + .env | Quarterly | CI + VPS |
| `JWT_SECRET` | GitHub Secrets + .env | Monthly | CI + VPS |
| `OPENAI_API_KEY` | GitHub Secrets + Cloudflare Secrets | Quarterly | CI + VPS + Workers |
| `ELEVENLABS_API_KEY` | GitHub Secrets + Cloudflare Secrets | Quarterly | CI + VPS + Workers |
| `RUNWAY_API_KEY` | GitHub Secrets + Cloudflare Secrets | Quarterly | CI + VPS + Workers |
| `STRIPE_SECRET_KEY` | GitHub Secrets | Quarterly | CI + VPS |
| `CLOUDFLARE_API_TOKEN` | GitHub Secrets | Quarterly | CI |
| `SLACK_WEBHOOK_URL` | GitHub Secrets | Annually | CI |
| `PAGERDUTY_ROUTING_KEY` | GitHub Secrets | Annually | CI |

### 10.3 Environment Promotion

```bash
# scripts/env/promote.sh
# Promote secrets from dev → staging → production

# Dev → Staging
aws s3 cp s3://vidara-secrets/dev/.env.production \
    s3://vidara-secrets/staging/.env.staging \
    --endpoint-url https://r2.cloudflarestorage.com

# Staging → Production (with manual review)
aws s3 cp s3://vidara-secrets/staging/.env.staging \
    s3://vidara-secrets/prod/.env.production \
    --endpoint-url https://r2.cloudflarestorage.com
```

---

## 11. Monitoring Stack

### 11.1 Monitoring Architecture

```mermaid
graph TB
    subgraph "Metrics Collection"
        PROM[Prometheus]
        NEXP[Node Exporter]
        PEXP[Postgres Exporter]
        REXP[Redis Exporter]
        MEXP[MinIO Exporter]
        NREXP[Nginx Exporter]
    end

    subgraph "Log Aggregation"
        PROMT[Promtail]
        LOKI[Loki]
    end

    subgraph "Visualization"
        GRAF[Grafana]
    end

    subgraph "Alerting"
        AM[Alertmanager]
        PD[PagerDuty]
        SL[Slack]
        EM[Email]
    end

    subgraph "Error Tracking"
        SENTRY[Sentry]
    end

    subgraph "Uptime Monitoring"
        CF_HC[Cloudflare Health Checks]
        CF_WA[Cloudflare Web Analytics]
    end

    NEXP & PEXP & REXP & MEXP & NREXP --> PROM
    PROM --> GRAF
    PROM --> AM
    AM --> PD
    AM --> SL
    AM --> EM

    API[API Server] & WRK[Temporal Workers] & NGX[Nginx] --> PROMT
    PROMT --> LOKI
    LOKI --> GRAF

    API & WRK --> SENTRY

    CF_HC -->|HTTP Check| API
    CF_HC -->|TCP Check| PG[PostgreSQL]
    CF_HC -->|TCP Check| RD[Redis]
```

### 11.2 Grafana Dashboards

| Dashboard | UID | Panels | Refresh |
|---|---|---|---|
| **Vidara — Overview** | `vidara-overview` | RPS, latency p50/p95/p99, error rate, active users | 30s |
| **Vidara — API** | `vidara-api` | Endpoint breakdown, status codes, response times, WebSocket connections | 10s |
| **Vidara — Pipeline** | `vidara-pipeline` | Queue depth, pipeline success rate, avg duration, cost/video | 15s |
| **Vidara — Database** | `vidara-db` | Cache hit ratio, connections, replication lag, slow queries | 30s |
| **Vidara — Infrastructure** | `vidara-infra` | CPU/memory/disk per container, network I/O, Docker health | 60s |
| **Vidara — Business** | `vidara-business` | MRR, active subscriptions, videos/day, total credits used | 5m |
| **Vidara — SLO** | `vidara-slo` | Availability %, error budget remaining, latency SLO | 60s |
| **Vidara — Cost** | `vidara-cost` | API cost per service, cost/video, cost/user | 1h |

### 11.3 Prometheus Alerting Rules

```yaml
# prometheus/alerts.yml
groups:
  - name: vidara-infrastructure
    rules:
      - alert: APIHighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API error rate > 1% for 5 minutes"

      - alert: APIHighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API p95 latency > 500ms"

      - alert: DatabaseConnectionHigh
        expr: pg_stat_activity_count > 200
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL connections > 200"

      - alert: ReplicationLag
        expr: pg_replication_lag_seconds > 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL replication lag > 10 seconds"

      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage > 80%"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Disk space < 10%"

      - alert: QueueDepthHigh
        expr: bullmq_queue_size > 100
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "BullMQ queue depth > 100"

      - alert: ContainerRestarting
        expr: time() - container_last_seen > 300
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Container not responding for 5 minutes"
```

### 11.4 Sentry Configuration

| Property | Value |
|---|---|
| Organization | vidara-ai |
| Projects | `vidara-api`, `vidara-workers`, `vidara-frontend` |
| DSN per env | `https://<key>@o<org>.ingest.sentry.io/<project>` |
| Performance | Traces sample rate: 0.2 (prod), 1.0 (dev) |
| Profiling | Continuous profiling for API and workers |
| Release | `vidara@<git-sha>` |
| Environment | `development`, `staging`, `production` |
| Alert rules | Error count > 10/min → Slack; > 50/min → PagerDuty |

### 11.5 Uptime Monitoring

```yaml
# Cloudflare Health Checks
checks:
  - name: "Vidara API — Production"
    endpoint: "https://vidara.ai/api/health"
    type: HTTP
    method: GET
    interval: 60
    timeout: 10
    retries: 2
    expected_codes: [200]
    notifications:
      - type: slack
        channel: "#ops-alerts"
      - type: email
        to: "oncall@vidara.ai"

  - name: "PostgreSQL — Production"
    endpoint: "tcp://db.internal:5432"
    type: TCP
    interval: 120
    timeout: 10
    retries: 3

  - name: "Temporal Server"
    endpoint: "tcp://temporal.internal:7233"
    type: TCP
    interval: 60
    timeout: 10
    retries: 2
```

### 11.6 Alerting Channels

| Channel | Severity | Integrations | Response Time |
|---|---|---|---|
| PagerDuty | Critical | Critical alerts | < 5 min |
| Slack (#ops-alerts) | Warning, Critical | All alerts | < 15 min |
| Email | Info, Warning | Daily digest, weekly report | < 1 hour |
| SMS (Twilio) | Critical | Production downtime | < 2 min |

### 11.7 Escalation Policy

```yaml
escalation:
  - level: 1
    name: "Primary On-Call (DevOps)"
    response_time: 5 min
    notification: PagerDuty mobile push
    if_no_response: 5 min → escalate

  - level: 2
    name: "Secondary On-Call (Engineering Lead)"
    response_time: 15 min
    notification: PagerDuty + SMS
    if_no_response: 10 min → escalate

  - level: 3
    name: "CTO / VP Engineering"
    response_time: 30 min
    notification: Phone call
```

---

## 12. Cost Monitoring

### 12.1 Cost Dashboard

```yaml
# Grafana dashboards/vidara-cost.json
panels:
  - title: "Monthly AI API Cost"
    metric: sum(vidara_ai_api_cost_total)
    breakdown_by: [provider]
    refresh: 1h

  - title: "Cost Per Video"
    metric: vidara_cost_per_video
    warning_threshold: 0.40
    critical_threshold: 0.50
    refresh: 5m

  - title: "Cloudflare Usage"
    metric: sum(cloudflare_r2_usage_bytes)
    breakdown_by: [bucket]
    refresh: 1h

  - title: "GPU Compute Cost"
    metric: sum(nvidia_smi_power_draw_watts)
    cost_per_kwh: 0.12
    refresh: 1m

  - title: "Cost Per User"
    metric: vidara_cost_per_user
    breakdown_by: [plan_tier]
    refresh: 1h
```

### 12.2 Budget Alerts

| Budget Category | Monthly Limit | Alert Thresholds | Action |
|---|---|---|---|
| OpenAI API | $2,000 | 50% → Slack, 80% → Slack, 100% → PagerDuty | Rate limit, downgrade model |
| ElevenLabs API | $500 | 50% → Slack, 80% → Slack | Switch to fallback TTS |
| Runway API | $500 | 50% → Slack, 80% → Slack | Limit concurrent generation |
| Cloudflare | $200 | 50% → Slack, 80% → Slack | Review cache hit ratio |
| Compute (VPS) | $500 | 50% → Slack, 80% → Slack | Scale down, optimize |
| Total Infrastructure | $3,700 | 80% → Slack, 100% → PagerDuty | Emergency cost review |

### 12.3 API Usage Tracking Per User

```sql
-- Materialized view for cost per user
CREATE MATERIALIZED VIEW mv_user_cost AS
SELECT
    u.id AS user_id,
    u.email,
    o.tier AS plan_tier,
    DATE_TRUNC('month', at.created_at) AS month,
    SUM(at.cost_usd) AS total_api_cost,
    COUNT(DISTINCT at.project_id) AS project_count,
    SUM(at.tokens_in) AS total_tokens_in,
    SUM(at.tokens_out) AS total_tokens_out
FROM agent_tasks at
JOIN users u ON u.id = at.user_id
JOIN organizations o ON o.id = u.organization_id
GROUP BY u.id, u.email, o.tier, DATE_TRUNC('month', at.created_at);
```

---

## 13. On-Call & Incident Response

### 13.1 On-Call Schedule

| Role | Rotation | Coverage | Channel |
|---|---|---|---|
| Primary DevOps | Weekly (Mon→Mon) | 24/7 | PagerDuty + Slack |
| Secondary Engineer | Weekly (Mon→Mon) | Business hours | Slack |
| Escalation (CTO) | Always | 24/7 | Phone |

On-call shifts follow a follow-the-sun schedule for global coverage. Handover happens every Monday at 09:00 UTC via a Slack handover thread documenting ongoing incidents, maintenance windows, and known issues.

### 13.2 Incident Severity Matrix

| Severity | Definition | Response Time | Update Frequency | Examples |
|---|---|---|---|---|
| **SEV-1** | Complete service outage, data loss, security breach | < 5 min | Every 15 min | API 100% down, DB corruption, payment system failure |
| **SEV-2** | Major feature degradation, partial outage | < 15 min | Every 30 min | Pipeline failing > 10%, slow API > 2s p95, YouTube upload broken |
| **SEV-3** | Minor feature issue, no user impact | < 1 hour | Daily | UI bug on settings page, non-critical endpoint slow |
| **SEV-4** | Cosmetic issue, enhancement request | Next sprint | Weekly | Typo in UI, minor styling issues, feature request |

### 13.3 Incident Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DETECTED
    DETECTED --> TRIAGED: On-call acknowledges
    TRIAGED --> MITIGATING: Action identified
    MITIGATING --> RESOLVED: Fix applied
    MITIGATING --> ESCALATED: Needs L2/L3
    ESCALATED --> MITIGATING: Senior engineer assigned
    RESOLVED --> MONITORING: Solution deployed
    MONITORING --> CLOSED: Stable for 30 min
    CLOSED --> [*]: Post-mortem completed

    DETECTED --> CLOSED: Auto-resolved (false alarm)
    CLOSED --> REVIEWING: Post-mortem
    REVIEWING --> [*]: Action items tracked
```

### 13.4 Incident Response Runbook

```bash
# scripts/incident/respond.sh
#!/bin/bash
# Usage: ./respond.sh --severity=SEV1 --summary="API 5xx spike"

SEVERITY=${1#--severity=}
SUMMARY=${2#--summary=}

# 1. Create incident channel
echo "Creating incident channel..."
INCIDENT_ID=$(date +%Y%m%d-%H%M%S)

# 2. Notify team
curl -X POST -H "Content-Type: application/json" \
    -d "{\"text\":\"🚨 INCIDENT [$SEVERITY] #$INCIDENT_ID: $SUMMARY\"}" \
    "$SLACK_WEBHOOK_URL"

if [ "$SEVERITY" = "SEV1" ] || [ "$SEVERITY" = "SEV2" ]; then
    curl -X POST -H "Content-Type: application/json" \
        -d "{\"dedup_key\":\"incident_$INCIDENT_ID\",\"event_action\":\"trigger\",\"payload\":{\"summary\":\"$SUMMARY\",\"severity\":\"$SEVERITY\",\"source\":\"Vidara\"}}" \
        "https://events.pagerduty.com/v2/enqueue"
fi

# 3. Log incident
echo "$(date) | $SEVERITY | $INCIDENT_ID | $SUMMARY" >> /var/log/incidents.log
```

### 13.5 Post-Mortem Template

```markdown
# Post-Mortem: INC-{ID}

**Date:** {date}
**Severity:** {SEV-1|SEV-2|SEV-3}
**Duration:** {start} → {end} ({duration})
**Reported by:** {name}

## Summary
{1-2 paragraph description of what happened}

## Impact
- Users affected: {number}
- Revenue impact: ${amount}
- Pipeline failures: {count}
- Error rate: {x}% (baseline: {y}%)

## Timeline
| Time (UTC) | Event |
|---|---|
| 12:00 | Alert triggered: API error rate > 5% |
| 12:02 | On-call acknowledged |
| 12:05 | Identified root cause: DB connection pool exhausted |
| 12:10 | Increased PgBouncer pool size |
| 12:12 | Error rate returned to normal |
| 12:30 | Monitoring confirmed stable |
| 14:00 | Post-mortem meeting |

## Root Cause
{Detailed explanation of root cause}

## Resolution
{Steps taken to resolve}

## Action Items
- [ ] {action} | Owner: {name} | Due: {date}
- [ ] {action} | Owner: {name} | Due: {date}

## Prevention
{How to prevent recurrence}

## Lessons Learned
{What went well, what could be improved}
```

---

## 15. Runbooks

### 14.1 Common Operational Procedures

#### Procedure: Scale Up API Instances

```bash
# scripts/runbooks/scale-api.sh
#!/bin/bash
# Usage: ./scale-api.sh --replicas=5

REPLICAS=${1#--replicas=}

docker compose -f docker-compose.prod.yml up -d --scale api=$REPLICAS

# Verify
for ((i=0; i<REPLICAS; i++)); do
    PORT=$((3000 + i))
    curl -sf http://localhost:$PORT/api/health || echo "Instance $i unhealthy"
done

# Update Nginx upstream
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

#### Procedure: Database Connection Spike

```bash
# scripts/runbooks/db-connection-spike.sh
#!/bin/bash

# 1. Check current connections
psql -h localhost -U vidara -d vidara_prod -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Check idle connections
psql -h localhost -U vidara -d vidara_prod -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"

# 3. Kill idle connections (if needed)
psql -h localhost -U vidara -d vidara_prod -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'idle'
    AND state_change < NOW() - INTERVAL '30 minutes'
    AND pid <> pg_backend_pid();
"

# 4. Increase PgBouncer pool size
docker compose -f docker-compose.prod.yml exec pgbouncer \
    psql -U pgbouncer -c "SET POOL_SIZE=100;"

# 5. Alert if persistent
echo "Check application for connection leaks. Review PgBouncer logs."
```

#### Procedure: Redis Cache Warm

```bash
# scripts/runbooks/cache-warm.sh
#!/bin/bash

# 1. Check Redis memory
redis-cli INFO memory | grep used_memory_human

# 2. Warm popular queries
for QUERY in "SELECT * FROM projects WHERE status = 'completed' LIMIT 100" \
             "SELECT * FROM users WHERE last_login > NOW() - INTERVAL '7 days'"; do
    psql -h localhost -U vidara -d vidara_prod -c "$QUERY" > /dev/null
done

# 3. Verify cache hit rate
redis-cli INFO stats | grep keyspace_hitrate
```

### 13.2 Incident Response Runbook

```mermaid
flowchart TD
    A[Incident Detected] --> B{Severity?}
    B -->|Critical| C[PagerDuty Alert + On-Call]
    B -->|Warning| D[Slack Alert]
    B -->|Info| E[Email Digest]

    C --> F[On-Call Acknowledges < 5 min]
    F --> G[Assess Impact]
    G --> H{Blast Radius?}

    H -->|API Down| I[Check Nginx + Docker logs]
    H -->|Pipeline Fail| J[Check Temporal + BullMQ]
    H -->|Data Issue| K[Check PostgreSQL + MinIO]
    H -->|Performance| L[Check Prometheus metrics]

    I --> M{Resolved?}
    J --> M
    K --> M
    L --> M

    M -->|Yes| N[Document Incident]
    M -->|No| O[Escalate to Level 2]

    O --> P[Engineering Lead]
    P --> Q{Triage Decision}

    Q -->|Rollback| R[Execute Rollback Runbook]
    Q -->|Scale| S[Execute Scale Runbook]
    Q -->|Debug| T[Deep Dive Investigation]

    R --> N
    S --> N
    T --> N

    N --> U[Post-Mortem < 24h]
    U --> V[Action Items]
    V --> W[Update Runbooks]
```

### 13.3 Common Incident Scenarios

| Incident | Symptoms | Immediate Action | Root Cause Investigation |
|---|---|---|---|
| API 5xx errors | 500/502/503 responses | Rollback deployment | Check Sentry, recent deploy, DB connections |
| Pipeline timeout | Jobs stuck "processing" for > 30 min | Restart Temporal workers | Check AI API status, queue depth, worker logs |
| High memory usage | OOM kills, slow response | Scale up instance, add memory | Profile memory, check for leaks |
| Database replication lag | Stale data on dashboard | Increase wal_sender timeout | Check network, disk I/O, long-running queries |
| SSL certificate expiry | Browser warnings | Renew via certbot/Cloudflare | Auto-renewal script check |
| Cloudflare tunnel down | Users get 521/522 errors | Restart cloudflared | Check tunnel logs, network connectivity |

---

## 16. SLO/SLI Definition

### 14.1 Service Level Indicators (SLIs)

| SLI | Definition | Measurement | Source |
|---|---|---|---|
| **API Availability** | % of requests that return 2xx/3xx | `sum(2xx+3xx) / total * 100` | Prometheus |
| **API Latency (p95)** | 95th percentile response time in ms | `histogram_quantile(0.95, ...)` | Prometheus |
| **API Latency (p99)** | 99th percentile response time in ms | `histogram_quantile(0.99, ...)` | Prometheus |
| **Pipeline Success Rate** | % of pipelines that complete successfully | `pipeline_completed / pipeline_started * 100` | Temporal metrics |
| **Pipeline Duration** | Average time to complete a pipeline | `avg(pipeline_duration_seconds)` | Temporal metrics |
| **Error Budget** | Remaining allowable errors in SLO window | `1 - (error_rate / slo_target)` | Prometheus + Grafana |
| **Queue Depth** | Number of pending jobs in BullMQ | `bullmq_queue_size` | Prometheus |
| **Database Connection** | Active connections to PostgreSQL | `pg_stat_activity_count` | postgres_exporter |

### 14.2 Service Level Objectives (SLOs)

| SLO | Target | Measurement Window | Error Budget | Burn Rate Alert |
|---|---|---|---|---|
| **API Availability** | 99.9% | Rolling 30 days | 43 min downtime/month | > 2% error rate in 1h |
| **API Latency (p95)** | < 500ms | Rolling 7 days | N/A | > 800ms for 5 min |
| **API Latency (p99)** | < 2s | Rolling 7 days | N/A | > 3s for 5 min |
| **Pipeline Success Rate** | 95% | Rolling 30 days | 5% failure budget | > 10% failure in 1h |
| **Pipeline Duration** | < 30 min | Rolling 7 days | N/A | > 45 min for 3 consecutive |
| **Database Uptime** | 99.95% | Rolling 30 days | 21 min downtime/month | Unreachable > 2 min |
| **Queue Processing** | 99% jobs processed within 5 min | Rolling 7 days | 1% delay budget | Queue depth > 100 for 5 min |

### 14.3 Error Budget Policy

```yaml
error_budget:
  api_availability:
    target: 99.9%
    window: 30d
    total_allowable_downtime: 43m  # per 30 days

    consumption_actions:
      - consumed: 50%  # 21.5 min
        action: "Slack alert to engineering team"
      - consumed: 75%  # 32.25 min
        action: "PagerDuty alert, freeze non-critical deployments"
      - consumed: 90%  # 38.7 min
        action: "Freeze all deployments except security patches"
      - consumed: 100%
        action: "Incident review, post-mortem required"

  pipeline_success:
    target: 95%
    window: 30d
    total_allowable_failures: 5%

    consumption_actions:
      - consumed: 50%
        action: "Slack alert to AI engineering team"
      - consumed: 80%
        action: "PagerDuty alert, investigate ML models"
      - consumed: 100%
        action: "Emergency pipeline review"
```

### 14.4 SLO Dashboard

```json
{
  "title": "Vidara AI — SLO Dashboard",
  "panels": [
    {
      "title": "API Availability (30d rolling)",
      "type": "stat",
      "targets": [
        {
          "expr": "avg_over_time((sum(rate(http_requests_total{status=~\"2..|3..\"}[5m])) / sum(rate(http_requests_total[5m])))[30d:5m]) * 100"
        }
      ],
      "thresholds": [
        { "value": 99.9, "color": "green" },
        { "value": 99.5, "color": "yellow" },
        { "value": 99.0, "color": "red" }
      ]
    },
    {
      "title": "Error Budget Remaining",
      "type": "gauge",
      "targets": [
        {
          "expr": "1 - (sum(rate(http_requests_total{status=~\"5..\"}[30d])) / sum(rate(http_requests_total[30d]))) / 0.001 * 100"
        }
      ],
      "unit": "percent",
      "thresholds": [
        { "value": 50, "color": "green" },
        { "value": 25, "color": "yellow" },
        { "value": 10, "color": "red" }
      ]
    }
  ]
}
```

---

## 17. Security Scanning

### 15.1 SAST (Static Application Security Testing)

| Tool | Scan Type | Frequency | Action on Failure |
|---|---|---|---|
| CodeQL (GitHub) | JavaScript/TypeScript analysis | Every PR + Weekly | Block merge on critical |
| ESLint security plugin | Code pattern analysis | Every push | Block merge on critical |
| SonarQube | Full SAST + code quality | Every PR | Gate on quality gate |

### 15.2 DAST (Dynamic Application Security Testing)

| Tool | Scan Type | Frequency | Target |
|---|---|---|---|
| OWASP ZAP | Active/passive web scan | Weekly (staging) | staging.vidara.ai |
| Nikto | Web server scan | Monthly | production endpoints |
| Nuclei | Template-based scanner | Weekly | All environments |

### 15.3 Dependency Scanning

| Tool | Scan Type | Frequency | Policy |
|---|---|---|---|
| `pnpm audit` | npm dependency audit | Every CI run | Critical = block merge |
| Trivy | Container image CVE scan | Every CI run | Critical = block deploy |
| Dependabot | Automated dependency PRs | Daily | Auto-merge patch/minor |
| Snyk | Full dependency tree | Weekly PR + Weekly cron | Monitor & alert |

### 15.4 Secret Detection

| Tool | Scan Type | Frequency | Action |
|---|---|---|---|
| Gitleaks | git history scan | Every push + Weekly cron | Block push on detection |
| TruffleHog | Deep git history scan | Weekly cron | Alert on detection |
| GitHub secret scanning | Built-in GitHub | Real-time | Auto-revoke detected secrets |

---

## 18. Dependency Management

### 16.1 Package Manager

- **Tool**: pnpm 9 (workspace monorepo)
- **Lockfile**: `pnpm-lock.yaml` (committed to git)
- **Registry**: npm registry (public), GitHub Packages (private, future)

### 16.2 Update Policy

| Dependency Type | Update Cadence | Review | Automated |
|---|---|---|---|
| Production patch | Weekly (Dependabot PR) | CI must pass | Auto-merge |
| Production minor | Bi-weekly | Manual review | PR created |
| Production major | Monthly | Manual review + testing | PR created |
| Dev dependencies | Monthly | CI must pass | Auto-merge patch |
| Security patches | Immediate | Automated | Hotfix branch |

### 16.3 Renovate/Dependabot Configuration

```json
{
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true,
      "automergeType": "pr",
      "platformAutomerge": true
    },
    {
      "matchUpdateTypes": ["minor"],
      "groupName": "minor dependencies",
      "schedule": ["before 9am on Monday"]
    },
    {
      "matchUpdateTypes": ["major"],
      "labels": ["major-update"],
      "schedule": ["before 9am on Monday"],
      "assignees": ["@devops-team"]
    },
    {
      "matchPackagePatterns": ["nuxt", "vue", "nitro"],
      "groupName": "Nuxt ecosystem",
      "schedule": ["before 9am on Monday"]
    },
    {
      "matchPackagePatterns": ["@types/"],
      "automerge": true,
      "schedule": ["before 9am on Monday"]
    }
  ],
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"],
    "assignees": ["@security-team"]
  }
}
```

---

## 19. Release Management

### 17.1 Release Process

```mermaid
flowchart LR
    subgraph "Development"
        DEV[Feature Branches]
        PR[Pull Request]
        CI[CI Pipeline]
        REVIEW[Code Review]
    end

    subgraph "Pre-Production"
        STG[Deploy to Staging]
        UAT[UAT Testing]
        PERF[Performance Check]
        SEC[Security Scan]
    end

    subgraph "Production"
        APPROVE[Approval Gate]
        BG[Blue-Green Deploy]
        CANARY[Canary 10% → 100%]
        MONITOR[Monitor 1 Hour]
    end

    subgraph "Post-Release"
        TAG[Git Tag v*.*.*]
        RELEASE[GitHub Release]
        CHANGELOG[Update Changelog]
    end

    DEV --> PR
    PR --> CI
    CI --> REVIEW
    REVIEW -->|Approve| STG
    STG --> UAT
    UAT --> PERF
    PERF --> SEC
    SEC -->|Pass| APPROVE
    APPROVE --> BG
    BG --> CANARY
    CANARY --> MONITOR
    MONITOR -->|Stable| TAG
    TAG --> RELEASE
    RELEASE --> CHANGELOG
```

### 17.2 Release Checklist

| Item | Owner | Before Release | After Release |
|---|---|---|---|
| CI pipeline passes | Engineer | ✅ | — |
| Code review approved | Reviewer | ✅ | — |
| Database migration tested | DBA | ✅ | ✅ |
| Staging deployed & verified | DevOps | ✅ | — |
| Performance test passes | QA | ✅ | — |
| Security scan passed | Security | ✅ | — |
| Changelog updated | Engineer | ✅ | — |
| Approval gate signed | CTO/Lead | ✅ | — |
| Backup completed | DevOps | ✅ | — |
| Rollback plan ready | DevOps | ✅ | — |
| Monitoring dashboards checked | DevOps | — | ✅ |
| Error budget consumption checked | DevOps | — | ✅ |
| Users notified (if breaking) | PM | — | ✅ |

---

## 20. Future Improvements

| Item | Phase | Timeline | Impact |
|---|---|---|---|
| Kubernetes-native deployment | Phase 9 | Q1 2027 | Auto-scaling, self-healing |
| Terraform for all infrastructure | Phase 9 | Q1 2027 | Immutable infrastructure |
| LaunchDarkly feature flags | Phase 9 | Q2 2027 | Per-user flag control |
| GitOps (ArgoCD/Flux) | Phase 9 | Q2 2027 | Declarative deployment |
| Canary by user segment | Phase 10 | Q2 2027 | Targeted canary releases |
| Multi-region active-active | Phase 10 | Q2 2027 | Global low-latency |
| Serverless Temporal workers | Phase 10 | Q2 2028 | Cost per execution |
| AI-assisted incident response | Phase 10 | Q3 2028 | Faster MTTR |

---

## 21. Acceptance Criteria

| AC | Kriteria | Status |
|---|---|---|
| AC-01 | Git strategy documented: trunk-based, semantic versioning, commit convention | ✅ |
| AC-02 | GitHub Actions workflows defined: CI, dev, staging, production, preview, backup, security | ✅ |
| AC-03 | Container registry strategy defined with image tagging and cleanup | ✅ |
| AC-04 | Infrastructure as Code documented (Docker Compose + Terraform future) | ✅ |
| AC-05 | Environment management documented: dotenv, secrets, promotion | ✅ |
| AC-06 | Monitoring stack documented: Prometheus, Grafana, Loki, Sentry, alerts | ✅ |
| AC-07 | Cost monitoring documented: per-service, per-user, budget alerts | ✅ |
| AC-08 | Runbooks provided for common operational procedures | ✅ |
| AC-09 | SLO/SLI definitions with error budget policy documented | ✅ |
| AC-10 | Security scanning documented: SAST, DAST, dependency, secrets | ✅ |
| AC-11 | Release management process with checklist documented | ✅ |
| AC-12 | Cross-references to deployment.md, architecture.md, techstack.md, database.md | ✅ |

---

## 22. Referensi Dokumen Lain

| Dokumen | Path |
|---|---|
| Deployment & Infrastructure | `internal/docs/deployment.md` |
| Architecture Document | `internal/docs/architecture.md` |
| Tech Stack Document | `internal/docs/techstack.md` |
| Database Document | `internal/docs/database.md` |
| Workflow & Orchestration | `internal/docs/workflow.md` |
| Roadmap Document | `internal/docs/roadmap.md` |
| API Specification | `internal/docs/api.md` |
| Security Architecture | `internal/docs/security.md` |
| Monitoring & Alerting | `internal/docs/monitoring.md` |
| Disaster Recovery Runbook | `internal/docs/disaster-recovery.md` |
| GitHub Actions Documentation | `https://docs.github.com/en/actions` |
| Prometheus Documentation | `https://prometheus.io/docs/` |
| Grafana Documentation | `https://grafana.com/docs/` |
| Sentry Documentation | `https://docs.sentry.io/` |
| Docker Compose Documentation | `https://docs.docker.com/compose/` |

---

> **End of DevOps & CI/CD Document** — Vidara AI © 2026
