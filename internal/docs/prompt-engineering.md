# Prompt Engineering — Vidara AI

> **Project:** Vidara AI — AI YouTube Video Generator SaaS  
> **Author:** Agent 7 — Senior Prompt Engineer  
> **Last Updated:** 2026-06-26  
> **Status:** Draft  
> **Cross-Reference:** [Agents](AGENTS.md) · [Workflow](workflow.md) · [Architecture](architecture.md) · [FRD](frd.md)

---

## 1. Tujuan

Dokumen ini mendefinisikan **Prompt Engineering** system untuk Vidara AI — mulai dari arsitektur prompt, template agent prompts, design patterns, management, hingga cost optimization. Menjadi acuan utama bagi seluruh AI agent orchestration dalam menghasilkan output berkualitas tinggi secara konsisten.

---

## 2. Background

Vidara AI mengoperasikan **20 AI agents** dalam pipeline 20 langkah (Workflow §7). Setiap agent menerima prompt yang dikonstruksi secara dinamis berdasarkan konteks pipeline, user intent, data historis, dan aturan domain. Tanpa sistem prompt engineering yang terstruktur, output antar agent akan inkonsisten, token terbuang percuma, dan biaya API melonjak.

Sistem prompt engineering Vidara AI dibangun di atas 5 pilar:
1. **Prompt Architecture** — hierarchy, template engine, context management
2. **Agent Prompts** — 16 agent-specific prompt templates siap pakai
3. **Prompt Patterns** — CoT, few-shot, structured output, RAG
4. **Prompt Management** — versioning, A/B testing, optimization
5. **Cost Optimization** — token budgeting, compression, caching, model routing

---

## 3. Objective

1. Mendefinisikan arsitektur prompt dengan hierarchy System → User → Context → Tool
2. Menyediakan 20+ template prompt agent siap pakai dengan variable slots
3. Mendokumentasikan 6 pattern prompting (CoT, few-shot, JSON, tool calling, RAG, dynamic few-shot)
4. Mendefinisikan sistem versioning, A/B testing, dan monitoring prompt
5. Menyediakan strategi cost optimization: token budgeting, compression, caching, model routing

---

## 4. Scope

**In Scope:**
- Prompt architecture: hierarchy, template engine (Handlebars-style), context window management
- 16 agent prompt templates (Master, Research, Planner, Fact Checker, Script, Storyboard, Scene, Image, Voice, Subtitle, Animation, Composer, Thumbnail, SEO, Publishing, Analytics, Memory, Context, QA, Moderator)
- Prompt patterns: CoT, few-shot, structured output, tool calling, RAG, dynamic few-shot
- Prompt management: version control, A/B testing, monitoring, optimization, security
- Cost optimization: token counting, compression, caching, model routing

**Out of Scope:**
- AI model training or fine-tuning details
- Database schema for prompt storage
- Frontend implementation of prompt editor
- Specific cloud deployment of prompt management system

---

## 5. Stakeholder

| Stakeholder | Interest |
|---|---|
| AI Engineer | Agent behavior, prompt structure, model selection |
| Prompt Engineer | Prompt patterns, versioning, optimization |
| Backend Engineer | Template engine, context injection, tool calling |
| QA Engineer | Prompt output validation, consistency testing |
| Product Manager | Output quality, cost per generation |
| Security Engineer | Injection prevention, output sanitization |

---

## 6. Requirement

1. Setiap agent prompt harus memiliki template dengan variable slots menggunakan format `{{variable}}`
2. Context window management harus mendukung token budgeting, sliding window, dan summarization
3. Setiap prompt pattern harus memiliki contoh implementasi lengkap
4. Prompt management harus mendukung version control dan A/B testing
5. Cost optimization harus mencakup token counting, compression, caching, dan model routing
6. Semua diagram harus menggunakan Mermaid yang valid

---

## 7. Functional Requirement

| FR ID | Deskripsi |
|---|---|
| PE-FR-01 | System dapat mengkonstruksi prompt dari template + variables |
| PE-FR-02 | System dapat mengelola context window dengan token budgeting |
| PE-FR-03 | System dapat menjalankan Chain-of-Thought prompting |
| PE-FR-04 | System dapat menyisipkan few-shot examples dinamis |
| PE-FR-05 | System dapat memvalidasi structured output (JSON Schema) |
| PE-FR-06 | System dapat melakukan A/B test antar prompt variants |
| PE-FR-07 | System dapat menghitung dan mengoptimalkan token usage |
| PE-FR-08 | System dapat merutekan prompt ke model berdasarkan cost/complexity |
| PE-FR-09 | System dapat mendeteksi dan mencegah prompt injection |
| PE-FR-10 | System dapat menyimpan dan me-versioning prompt templates |

---

## 8. Non Functional Requirement

| NFR | Target |
|---|---|
| Prompt construction latency | <50ms |
| Template rendering throughput | >1000 req/s |
| Context window accuracy | ≥99% token fit |
| A/B test statistical significance | p<0.05 |
| Injection detection rate | >99.9% |
| Cost reduction via optimization | ≥30% |
| Prompt version retrieval | <10ms |

---

## 9. Workflow — Prompt Engineering Lifecycle

```
Template Design → Variable Binding → Context Injection → Pattern Application →
Model Routing → Execution → Output Validation → Logging → Optimization Feedback
```

---

## 10. Flowchart — Prompt Construction Pipeline

```mermaid
flowchart LR
    A[User Input] --> B[Intent Classifier]
    B --> C{Complexity}
    C -->|Simple| D[Template Selector]
    C -->|Complex| E[Chain Builder]
    C -->|Multi-step| F[Agent Orchestrator]
    
    D --> G[Variable Binder]
    E --> G
    F --> G
    
    G --> H[Context Injector]
    H --> I[Pattern Applicator]
    I --> J[Model Router]
    
    J --> K[Cheap Model]
    J --> L[Expensive Model]
    
    K & L --> M[Output Validator]
    M --> N{Valid?}
    N -->|Yes| O[Return Result]
    N -->|No| P[Retry with Fix]
    P --> I

    style A fill:#6366f1,color:#fff
    style O fill:#22c55e,color:#fff
    style M fill:#f59e0b,color:#000
```

---

## 11. Mermaid Diagram — Prompt Architecture Overview

```mermaid
graph TB
    subgraph "Prompt Hierarchy"
        SP[System Prompt<br/>Role, Constraints, Rules] --> UP[User Prompt<br/>Task, Input, Query]
        UP --> CI[Context Injection<br/>History, Memory, Facts]
        CI --> TC[Tool Calls<br/>Functions, APIs, Retrieval]
    end

    subgraph "Template Engine"
        TE[Handlebars Parser] --> VB[Variable Binding]
        VB --> CD[Conditional Directives]
        CD --> LP[Loop Expansion]
    end

    subgraph "Context Management"
        TB[Token Budgeter] --> SW[Sliding Window]
        SW --> SM[Summarizer]
        SM --> RS[Relevance Scorer]
    end

    subgraph "Output Pipeline"
        OP[Output Parser] --> JS[JSON Validator]
        JS --> SF[Safety Filter]
        SF --> FMT[Formatter]
    end

    SP --> TE
    TC --> TB
    RS --> CI
    FMT --> DG[Delivery to Agent]
```

---

## 12. Sequence Diagram — Prompt Execution Lifecycle

```mermaid
sequenceDiagram
    participant MA as Master Agent
    participant PE as Prompt Engine
    participant TE as Template Engine
    participant CM as Context Manager
    participant LLM as AI Model
    participant OV as Output Validator

    MA->>PE: Execute(task, context)
    PE->>TE: LoadTemplate(agent_type)
    TE-->>PE: Template AST
    
    PE->>CM: BuildContext(task_id)
    CM->>CM: Token Budgeting
    CM->>CM: Sliding Window
    CM->>CM: Summarize if needed
    CM-->>PE: Context Package
    
    PE->>PE: Bind Variables
    PE->>PE: Apply Pattern (CoT/Few-shot)
    PE->>LLM: Execute Prompt
    
    LLM-->>PE: Raw Output
    PE->>OV: Validate Output
    OV->>OV: JSON Schema Check
    OV->>OV: Safety Filter
    
    alt Validation Passed
        OV-->>PE: Validated Output
        PE-->>MA: StructuredResult
    else Validation Failed
        OV-->>PE: Validation Error
        PE->>LLM: Retry with Fix Prompt
        LLM-->>PE: Corrected Output
        PE-->>MA: StructuredResult
    end
```

---

## 13. Architecture Diagram — Prompt Engineering System

```mermaid
C4Container
    title Container diagram for Prompt Engineering System

    Person(prompt_eng, "Prompt Engineer", "Designs, tests, and optimizes prompts")

    System_Boundary(pe, "Prompt Engineering System") {
        Container(template_store, "Template Store", "PostgreSQL 16", "Stores versioned prompt templates with metadata")
        Container(engine, "Prompt Engine", "Nitro Server Module", "Renders templates, binds variables, injects context")
        Container(cm, "Context Manager", "Redis + PostgreSQL", "Manages token budgets, sliding windows, summaries")
        Container(router, "Model Router", "Nitro Module", "Routes prompts to optimal model based on cost/complexity")
        Container(cache, "Prompt Cache", "Redis 7", "Caches repeated prompt constructions and responses")
        Container(monitor, "Prompt Monitor", "Grafana + Prometheus", "Tracks token usage, latency, cost, success rate")
        Container(ab_test, "A/B Test Engine", "Nitro Module", "Manages prompt variants and statistical analysis")
    }

    System_Ext(gpt5, "GPT-5o", "Primary LLM")
    System_Ext(gpt4, "GPT-4o", "Fallback LLM")
    System_Ext(claude, "Claude 4", "Alternative LLM")

    Rel(prompt_eng, template_store, "Creates/edits templates", "HTTPS")
    Rel(engine, template_store, "Loads templates", "SQL/TCP")
    Rel(engine, cm, "Gets context", "Redis/TCP")
    Rel(engine, cache, "Checks cache", "Redis/TCP")
    Rel(engine, router, "Selects model", "In-process")
    Rel(router, gpt5, "Executes prompt", "HTTPS/REST")
    Rel(router, gpt4, "Executes prompt (fallback)", "HTTPS/REST")
    Rel(router, claude, "Executes prompt (alternative)", "HTTPS/REST")
    Rel(engine, monitor, "Logs metrics", "HTTPS")
    Rel(ab_test, engine, "Serves variant", "In-process")
    Rel(ab_test, monitor, "Reports results", "HTTPS")
```

---

## 14. Niche Context Injection Pattern

### 14.1 Niche Profile Template

Ketika user membuat project dan memilih niche, sistem meng-inject konteks niche ke system prompt setiap agent:

```
[NICHE_PROFILE]
name: {{niche.name}}
keywords: {{niche.keywords}}
target_audience:
  - age_range: {{niche.target_audience.age_range}}
  - interests: {{niche.target_audience.interests}}
  - language: {{niche.target_audience.language}}
  - education: {{niche.target_audience.education_level}}
default_style:
  - tone: {{niche.default_style.tone}}
  - visual: {{niche.default_style.visual_style}}
  - music: {{niche.default_style.music_mood}}
  - pace: {{niche.default_style.pace}}
brand_kit: {{niche.brand_kit_id ? "Linked: brand_kit_name" : "Not linked"}}
description: {{niche.description}}
[/NICHE_PROFILE]
```

### 14.2 Injection Points

| Agent | Injection Location | Tokens | Purpose |
|---|---|---|---|
| Research Agent | After system prompt, before task instruction | ~300 | Focus search on niche keywords |
| Script Agent | After role definition, before tone instruction | ~350 | Adjust narrative style and vocabulary |
| Image Agent | After style prompt, before generation params | ~250 | Inject color palette and visual style |
| Voice Agent | After voice config, before SSML tags | ~200 | Adjust tone and pacing |
| SEO Agent | After keyword prompt | ~150 | Optimize for niche audience |
| Music Agent | After genre prompt | ~100 | Match music mood to niche |

### 14.3 Caching Strategy

Niche profiles are cached in Redis with TTL 1 hour. Key format: `niche:{workspace_id}:{niche_id}`. Cache is invalidated when niche is updated.

---

## 15. ER Diagram — Prompt Data Model

```mermaid
erDiagram
    PromptTemplate ||--o{ PromptVersion : has
    PromptVersion ||--o{ PromptVariable : defines
    PromptVersion ||--o{ PromptTest : tested-in
    PromptTest ||--o{ PromptResult : produces
    PromptTemplate ||--o{ AgentAssignment : assigned-to
    
    PromptTemplate {
        uuid id PK
        string agent_type UK
        string name
        string description
        string category
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    PromptVersion {
        uuid id PK
        uuid template_id FK
        int version_number
        text system_prompt
        text user_prompt_template
        text pattern_type "cot|fewshot|json|tool|rag"
        int token_count
        float avg_cost_usd
        float avg_latency_ms
        float success_rate
        timestamp created_at
        string created_by
        string status "active|deprecated|archived"
    }
    
    PromptVariable {
        uuid id PK
        uuid version_id FK
        string name
        string type "string|number|array|object|boolean"
        string description
        text default_value
        boolean required
        string validation_regex
    }
    
    PromptTest {
        uuid id PK
        string name
        uuid variant_a_id FK
        uuid variant_b_id FK
        string status "running|completed|failed"
        int sample_size
        timestamp started_at
        timestamp completed_at
        string winner_id
    }
    
    PromptResult {
        uuid id PK
        uuid test_id FK
        uuid version_id FK
        text input
        text output
        int input_tokens
        int output_tokens
        float cost_usd
        float latency_ms
        boolean passed_validation
        string error_message
        timestamp created_at
    }
    
    AgentAssignment {
        uuid id PK
        uuid template_id FK
        string agent_name
        string pipeline_step
        string model_primary
        string model_fallback
        int max_retries
        int timeout_seconds
    }
```

---

## 16. Decision Table — Prompt Engineering Decisions

| AD ID | Keputusan | Opsi | Alasan |
|---|---|---|---|
| PE-AD-01 | Handlebars-style template engine | Handlebars vs Liquid vs EJS | Familiaritas tim, zero dependency, safe by default |
| PE-AD-02 | PostgreSQL untuk template store | PostgreSQL vs Redis vs file-based | Versioning, queryability, ACID compliance |
| PE-AD-03 | Redis untuk context cache | Redis vs Memcached | Pub/sub untuk invalidasi, TTL built-in |
| PE-AD-04 | CoT default pattern | CoT vs direct vs few-shot | 15% lebih akurat untuk multi-step tasks |
| PE-AD-05 | JSON Schema untuk output validation | JSON Schema vs Zod vs custom | Standar terbuka, tooling mature |
| PE-AD-06 | Model routing berbasis token count | Token-based vs task-based vs hybrid | Cost optimal, simple implementation |

---

## 17. Checklist — Prompt Engineering Review

- [x] Prompt hierarchy: System → User → Context → Tool defined
- [x] Template engine with `{{variable}}` syntax implemented
- [x] Context window management with token budgeting
- [x] All 20 agent prompts templated
- [x] Chain-of-Thought pattern documented with examples
- [x] Few-shot prompting with dynamic selection
- [x] Structured output with JSON Schema
- [x] Tool/function calling patterns documented
- [x] RAG pattern with retrieval integration
- [x] Prompt versioning system designed
- [x] A/B testing framework defined
- [x] Performance monitoring per prompt variant
- [x] Prompt security: injection prevention, output sanitization
- [x] Token counting and budgeting strategy
- [x] Prompt compression techniques documented
- [x] Caching strategy for repeated prompts
- [x] Model routing logic (cheap vs expensive)

---

## 18. Risk

| Risk ID | Risiko | Level | Dampak |
|---|---|---|---|
| PE-R01 | Token overflow pada context window | High | Output truncated, quality degrade |
| PE-R02 | Prompt injection via user input | Critical | Unauthorized actions, data leak |
| PE-R03 | Template variable mismatch | Medium | Runtime error, pipeline failure |
| PE-R04 | Model hallucination in structured output | High | Invalid JSON, parsing failure |
| PE-R05 | Cost overrun dari inefficient prompts | Medium | Budget exhaustion |
| PE-R06 | A/B test inconclusive due to small sample | Low | Wasted compute, decision delay |
| PE-R07 | Context staleness (old memory injected) | Medium | Irrelevant output |
| PE-R08 | Multi-agent prompt inconsistency | High | Contradictory outputs across agents |

---

## 19. Mitigation

| Risk ID | Mitigasi |
|---|---|
| PE-R01 | Token budgeter with hard limit + sliding window + summarization fallback |
| PE-R02 | Input sanitization (strip control chars), role isolation, output filter classifier |
| PE-R03 | Template validation at registration time (all variables must have defaults) |
| PE-R04 | JSON Schema validation with retry and structured error repair prompt |
| PE-R05 | Per-prompt cost budget + model routing (cheap model for simple tasks) |
| PE-R06 | Minimum sample size calculator (power analysis) + early stopping rules |
| PE-R07 | Context TTL (15 min default) + relevance scorer (cosine similarity >0.7) |
| PE-R08 | Shared system prompt prefix across agents + consistency validator |

---

## 20. Future Improvement

| Item | Target Version | Impact |
|---|---|---|
| Adaptive prompt compression (ML-based) | v1.1 | 40% token reduction |
| Cross-agent prompt consistency checker | v1.1 | Fewer contradictions |
| Automated few-shot selection via embedding | v1.2 | Better example relevance |
| Prompt health score (composite metric) | v1.2 | Faster regression detection |
| Multi-model prompt ensemble (vote) | v1.3 | Higher accuracy |
| On-device prompt rendering for edge | v1.3 | Lower latency |
| Prompt differential testing (per commit) | v1.1 | Catch regressions early |

---

## 21. Acceptance Criteria

| AC | Kriteria | Status |
|---|---|---|
| PE-AC-01 | 20+ agent prompt templates with variable slots documented | ✅ |
| PE-AC-02 | 6 prompt patterns with implementation examples documented | ✅ |
| PE-AC-03 | Prompt architecture with hierarchy, engine, context management defined | ✅ |
| PE-AC-04 | Prompt management with versioning, A/B testing, monitoring defined | ✅ |
| PE-AC-05 | Cost optimization strategy with token counting, compression, caching, routing defined | ✅ |
| PE-AC-06 | All Mermaid diagrams validated | ✅ |
| PE-AC-07 | Cross-references to agents.md and workflow.md included | ✅ |
| PE-AC-08 | 21 mandatory sections present (Tujuan through Referensi) | ✅ |

---

## 22. Referensi Dokumen Lain

| Dokumen | Path |
|---|---|
| Agent Team Profile | `internal/docs/AGENTS.md` |
| Workflow & Orchestration | `internal/docs/workflow.md` |
| Architecture Document | `internal/docs/architecture.md` |
| Product Requirement Document | `internal/docs/prd.md` |
| Functional Requirement Document | `internal/docs/frd.md` |
| Tech Stack Document | `internal/docs/techstack.md` |
| API Specification | `internal/docs/api.md` |

---

# ═══════════════════════════════════════════════════
# SECTION A: PROMPT ARCHITECTURE
# ═══════════════════════════════════════════════════

## A.1 Prompt Hierarchy

Vidara AI menggunakan 4-layer prompt hierarchy yang ketat:

```
┌─────────────────────────────────────────────────────────┐
│  SYSTEM PROMPT (Layer 1) — Immutable Role Definition     │
│  "You are a {role}. Follow these rules: {rules}"        │
├─────────────────────────────────────────────────────────┤
│  USER PROMPT (Layer 2) — Task Instruction                │
│  "Generate a {output_type} for: {task_description}"     │
├─────────────────────────────────────────────────────────┤
│  CONTEXT INJECTION (Layer 3) — Dynamic Context            │
│  "Context: {research_data} | History: {past_outputs}"   │
├─────────────────────────────────────────────────────────┤
│  TOOL CALLS (Layer 4) — Function Definitions              │
│  "Available tools: {tool_definitions}"                  │
└─────────────────────────────────────────────────────────┘
```

### Layer 1: System Prompt

Tidak pernah berubah selama sesi. Mendefinisikan:
- **Role**: Identitas agent (e.g., "You are a professional script writer for YouTube videos")
- **Constraints**: Batasan output (e.g., "Never include unverified claims")
- **Rules**: Behavioral guidelines (e.g., "Always output valid JSON")
- **Tone**: Gaya komunikasi (e.g., "Be concise and factual")

### Layer 2: User Prompt

Dikonstruksi per-execution. Berisi:
- **Task**: Apa yang harus dilakukan
- **Input Data**: Prompt asli user, parsed entities
- **Parameters**: Konfigurasi spesifik (language, duration, style)

### Layer 3: Context Injection

Disisipkan setelah user prompt. Berisi:
- **Research Data**: Fakta dan sumber dari Research Agent
- **Memory**: Konteks dari sesi sebelumnya (Memory Agent)
- **Past Outputs**: Output dari agent sebelumnya dalam pipeline
- **History**: Multi-turn conversation if applicable

### Layer 4: Tool Calls

Definisi fungsi yang tersedia untuk agent. Format:

```json
{
  "type": "function",
  "function": {
    "name": "web_search",
    "description": "Search the web for current information",
    "parameters": {
      "type": "object",
      "properties": {
        "query": { "type": "string" },
        "num_results": { "type": "integer", "default": 5 }
      }
    }
  }
}
```

---

## A.2 Prompt Template Engine

System menggunakan **Handlebars-style template engine** dengan variable slots `{{variable}}`, conditionals `{{#if}}`, dan loops `{{#each}}`.

### Template Syntax

```
{{! Template: script-agent-template }}

System:
You are a professional YouTube script writer. You write engaging, 
fact-based scripts optimized for viewer retention.

Rules:
- Hook must be in the first 15 seconds
- Use active voice throughout
- Include exactly one Call-to-Action at the end
- Target reading speed: 150 words per minute
- Always output valid JSON matching the provided schema

User:
Write a {{language}} script for a YouTube video about "{{topic}}".

Target Duration: {{duration}} seconds
Target Audience: {{audience}}
Tone: {{tone}}

Key Points to Cover:
{{#each keyPoints}}
- {{this}}
{{/each}}

Research Sources:
{{#each sources}}
- [{{source}}] {{confidence}}% confidence
{{/each}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Variable Binding Rules

| Variable | Type | Source | Required |
|---|---|---|---|
| `{{role}}` | string | AgentAssignment | Yes |
| `{{task}}` | string | Pipeline context | Yes |
| `{{language}}` | string | User config | Yes |
| `{{duration}}` | number | User config | Yes |
| `{{audience}}` | string | User config | No |
| `{{tone}}` | string | User config | No |
| `{{keyPoints}}` | array | Planner Agent | Yes |
| `{{sources}}` | array | Research Agent | Yes |
| `{{context}}` | string | Context Manager | No |
| `{{outputSchema}}` | string | Prompt Version | Yes |

---

## A.3 Context Window Management

### Token Budgeting

Setiap prompt memiliki token budget yang dihitung per model:

```typescript
interface TokenBudget {
  model: string;           // "gpt-5o" | "gpt-4o" | "claude-4"
  maxTokens: number;       // Model context window size
  reservedOutput: number;  // Tokens reserved for response
  systemPrompt: number;    // Tokens for system prompt (fixed)
  userPromptMax: number;   // maxTokens - reservedOutput - systemPrompt
  contextBudget: number;   // 60% of userPromptMax
  instructionBudget: number; // 40% of userPromptMax
}
```

### Budget Allocation Rules

```
Total Context Window: 128,000 tokens (GPT-5o)
├── Reserved Output:    8,000 tokens  (6.25%)
├── System Prompt:      2,000 tokens  (1.56%)
├── Instruction:       47,200 tokens  (36.88%) ← User prompt + pattern
└── Context:           70,800 tokens  (55.31%)
    ├── Research Data:     50%
    ├── Memory/History:    30%
    ├── Few-shot Examples: 10%
    └── Tool Definitions:  10%
```

### Sliding Window Strategy

When context exceeds budget, system applies sliding window:

1. **Sort segments by relevance score** (via Context Agent)
2. **Drop segments below relevance threshold** (<0.3)
3. **Summarize oldest segments** (if still over budget)
4. **Truncate lowest-priority segments**

### Summarization Trigger

```
IF context_tokens > contextBudget THEN
  IF oldest_memory exists THEN
    summarize(oldest_memory)  // Reduce by ~70%
  END IF
  IF still over budget THEN
    drop_lowest_relevance()   // Drop segments with score < 0.3
  END IF
  IF still over budget THEN
    truncate(instructionBudget) // Truncate from bottom
  END IF
END IF
```

---

## A.4 Multi-Turn Conversation Handling

Untuk agent yang mendukung multi-turn (e.g., Script Agent dengan user feedback):

```typescript
interface ConversationTurn {
  turnId: string;
  role: "user" | "assistant";
  content: string;
  tokens: number;
  timestamp: Date;
  relevanceScore: number;  // 0.0 - 1.0
}

// Strategy: Keep last N turns, summarize older ones
const MAX_TURNS = 5;
const MAX_TURN_TOKENS = 4000;

function buildConversationContext(turns: ConversationTurn[]): string {
  if (turns.length <= MAX_TURNS) return turns.map(t => t.content).join('\n');
  
  const recent = turns.slice(-MAX_TURNS);
  const older = turns.slice(0, -MAX_TURNS);
  const summary = summarize(older);
  
  return summary + '\n' + recent.map(t => t.content).join('\n');
}
```

---

## A.5 Error Recovery Prompts

### Retry Prompt Template

When an agent output fails validation, system sends a recovery prompt:

```
Your previous output failed validation.

Error: {{validationError}}

Your previous output was:
{{previousOutput}}

Please fix the following issues:
{{#each issues}}
- [{{severity}}] {{description}}
  {{#if suggestion}}Suggestion: {{suggestion}}{{/if}}
{{/each}}

Remember:
{{rulesForFix}}

Regenerate the output following the original schema.
```

### Recovery Configurations

| Error Type | Retries | Fix Prompt | Fallback |
|---|---|---|---|
| JSON_PARSE_ERROR | 2 | "Ensure valid JSON. Check commas, brackets." | Return { error, fallback_data } |
| SCHEMA_MISMATCH | 2 | Inject specific schema path that failed | Use partial valid data |
| CONTENT_MODERATION | 1 | "Remove content that violates: {policy}" | Mark as flagged |
| LOW_CONFIDENCE | 1 | "Provide supporting sources for: {claims}" | Flag for human review |
| TIMEOUT | 0 (retry at pipeline level) | — | Use cached/simplified version |

---

# ═══════════════════════════════════════════════════
# SECTION B: AGENT PROMPTS — TEMPLATES LENGKAP
# ═══════════════════════════════════════════════════

---

## B.1 Master Agent

**Agent Role:** Orchestration, delegation, quality evaluation  
**Pipeline Step:** All steps (coordinator) — Lihat Workflow §9  
**Model:** GPT-5o  
**Max Tokens:** 8,000

### System Prompt

```
System:
You are the Master Agent — the central orchestrator of Vidara AI's video generation 
pipeline. Your role is to:
1. Parse and validate user prompts
2. Delegate tasks to specialized sub-agents
3. Collect and validate results from each agent
4. Make quality decisions (pass, retry, fallback, fail)
5. Maintain pipeline context across all 20 steps

Pipeline Steps (in order, see Workflow §7):
{{pipelineSteps}}

Quality Gates:
{{qualityGates}}

Rules:
- Always validate input before delegating
- Never skip a quality gate
- Log every decision with rationale
- If an agent fails, decide: retry (max {{maxRetries}}) → fallback → fail
- Pipeline timeout: {{pipelineTimeout}} seconds total
```

### User Prompt Template

```
User:
Execute pipeline for video generation request.

Request ID: {{requestId}}
User Prompt: "{{userPrompt}}"
Configuration:
  Language: {{language}}
  Target Duration: {{duration}} seconds
  Resolution: {{resolution}}
  Tone: {{tone}}
  Auto-Publish: {{autoPublish}}

Current Pipeline State:
  Step: {{currentStep}}
  Previous Step Result: {{previousResult}}
  Artifacts: {{artifacts}}

Delegation Plan:
{{delegationPlan}}

Available Sub-Agents:
{{#each subAgents}}
- {{name}}: {{description}} ({{status}})
{{/each}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Quality Evaluation Criteria

```
Quality Check — Script Agent Output:
- [ ] Hook present in first 15 seconds of narration
- [ ] CTA present at end
- [ ] All key points from research covered
- [ ] No unverified claims (cross-ref with Fact Checker)
- [ ] Duration within ±10% of target
- [ ] Language matches {{language}}
- [ ] Valid JSON structure
- [ ] Tone consistent with {{tone}}

Quality Check — Image Agent Output:
- [ ] Resolution meets minimum {{resolution}}
- [ ] Character consistent across scenes
- [ ] Style matches prompt description
- [ ] No NSFW/graphic content
- [ ] Aspect ratio correct (16:9)

Quality Check — Voice Agent Output:
- [ ] Audio duration matches script duration ±5%
- [ ] No clipping or distortion
- [ ] Emotion matches scene mood
- [ ] Word-level timestamps present

Quality Check — Final Video:
- [ ] Audio sync within 100ms
- [ ] Resolution matches config
- [ ] Duration matches target ±5%
- [ ] Subtitles legible and synced
- [ ] Thumbnail has text overlay
- [ ] YouTube SEO metadata complete
```

---

## B.2 Research Agent

**Agent Role:** Web search, content gathering, source collection  
**Pipeline Step:** Step 2 (Research) — Workflow §7  
**Model:** GPT-5o + Web Search API  
**Max Tokens:** 16,000

### System Prompt

```
System:
You are the Research Agent for Vidara AI. Your job is to gather comprehensive, 
accurate, and up-to-date information about the video topic.

Capabilities:
- Execute web searches via the search_tool function
- Extract and summarize content from web pages
- Prioritize authoritative sources
- Collect quotes, statistics, data points
- Generate structured research brief

Source Hierarchy (highest to lowest priority):
1. Peer-reviewed papers and academic journals
2. Government and official statistics (.gov, .edu)
3. Established news organizations (Reuters, AP, BBC, etc.)
4. Industry reports and recognized experts
5. Wikipedia and encyclopedias (use as starting point)
6. Blogs and opinion pieces (lowest priority)

Rules:
- Never fabricate sources or quotes
- Always include URL for every source
- If a claim cannot be verified, mark as "unverifiable"
- For statistics: include year, source, methodology if available
- Minimum {{minSources}} sources required
- Maximum search depth: {{maxSearchDepth}} pages per query
```

### User Prompt Template

```
User:
Research the following topic for a YouTube video.

Topic: "{{topic}}"
Language: {{language}}
Target Audience: {{audience}}
Key Aspects to Cover:
{{#each keyAspects}}
- {{this}}
{{/each}}

Search Queries to Execute:
{{#each searchQueries}}
- Query {{@index}}: "{{this}}"
{{/each}}

Available Tools:
{{toolDefinitions}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "topic": "string",
  "summary": "string (200 words max)",
  "key_facts": [
    {
      "fact": "string",
      "source": { "title": "string", "url": "string", "date": "string" },
      "confidence": "number (0-100)",
      "category": "string (statistic|quote|definition|event|opinion)"
    }
  ],
  "sources": [
    {
      "title": "string",
      "url": "string",
      "type": "string (academic|news|government|industry|other)",
      "relevance_score": "number (0-100)",
      "extracted_quotes": ["string"]
    }
  ],
  "controversial_claims": ["string"],
  "research_gaps": ["string"]
}
```

---

## B.3 Planner Agent

**Agent Role:** Structure planning, scene breakdown, timing  
**Pipeline Step:** Step 6 (Scene Planning) — Workflow §7  
**Model:** GPT-5o  
**Max Tokens:** 6,000

### System Prompt

```
System:
You are the Planner Agent for Vidara AI. You analyze script and storyboard to 
create optimal scene breakdown and timing allocation.

Rules:
- Total duration must match target ±5%
- Minimum scene duration: 8 seconds
- Maximum scene duration: 45 seconds
- Average scene duration: 12-20 seconds
- Intro scene: max 15% of total duration
- Outro scene: max 10% of total duration
- Each scene must have a clear visual purpose
- Transitions between scenes should vary
```

### User Prompt Template

```
User:
Create a scene plan for the following video.

Script:
{{scriptContent}}

Storyboard:
{{storyboardContent}}

Target Duration: {{targetDuration}} seconds
Total Scenes Target: {{targetSceneCount}}
Visual Style: {{visualStyle}}

Scene Constraints:
{{#each constraints}}
- {{this}}
{{/each}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "total_duration": "number",
  "scene_count": "number",
  "scenes": [
    {
      "scene_id": "number",
      "type": "string (intro|content|transition|outro)",
      "duration": "number (seconds)",
      "narrative_segment": "string",
      "visual_description": "string",
      "mood": "string",
      "character_present": "boolean",
      "requires_image_gen": "boolean",
      "transition_in": "string (fade|cut|slide|zoom|dissolve)",
      "transition_out": "string",
      "keyframe_keywords": ["string"]
    }
  ]
}
```

---

## B.4 Fact Checker

**Agent Role:** Verification, confidence scoring, source citation  
**Pipeline Step:** Step 3 (Fact Validation) — Workflow §7  
**Model:** GPT-5o  
**Max Tokens:** 8,000

### System Prompt

```
System:
You are the Fact Checker Agent for Vidara AI. You verify every claim from 
research against multiple sources and assign confidence scores.

Confidence Scoring Rules:
- 90-100%: Verified by 3+ authoritative sources, no contradictions
- 70-89%: Verified by 2+ sources, minor contradictions exist
- 50-69%: Single source, reasonable doubt, or outdated information
- 25-49%: Unverified, single questionable source, or significant doubt
- 0-24%: Cannot verify, contradictory evidence, or clearly false

Decision Rules:
- Confidence >= 80%: Auto-accept
- Confidence 50-79%: Flag for human review
- Confidence < 50%: Reject from script

Citation Format:
[Source Title](URL) — Published: Date — Type: SourceType
```

### User Prompt Template

```
User:
Validate the following research claims.

Research Document:
{{researchDocument}}

Minimum Sources Per Claim: {{minSourcesPerClaim}}
Auto-Accept Threshold: {{autoAcceptThreshold}}%
Flag Threshold: {{flagThreshold}}%

Available Tools:
{{toolDefinitions}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "validated_facts": [
    {
      "claim": "string",
      "verdict": "string (verified|questionable|rejected|unverifiable)",
      "confidence": "number (0-100)",
      "supporting_sources": [
        {
          "title": "string",
          "url": "string",
          "excerpt": "string",
          "publication_date": "string"
        }
      ],
      "contradicting_sources": [
        {
          "title": "string",
          "url": "string",
          "excerpt": "string"
        }
      ],
      "notes": "string"
    }
  ],
  "overall_confidence": "number",
  "requires_human_review": "boolean",
  "human_review_items": ["string"]
}
```

---

## B.5 Script Agent

**Agent Role:** Narrative writing, hook, CTA, SEO keyword integration  
**Pipeline Step:** Step 4 (Script Generation) — Workflow §7  
**Model:** GPT-5o  
**Max Tokens:** 12,000

### System Prompt

```
System:
You are the Script Agent for Vidara AI — a world-class YouTube script writer 
with expertise in retention-based writing.

Narrative Architecture:
1. HOOK (0-15 seconds): Question, shocking stat, bold statement, or curiosity gap
2. INTRO (15-60 seconds): Context, what viewer will learn, why it matters
3. BODY (60-80% of video): Main content with clear sections and transitions
4. OUTRO (last 10-15%): Summary, key takeaway, CTA

Hook Formulas Available:
- "What if I told you that [counterintuitive fact]?"
- "[Number] things you didn't know about [topic]"
- "This [thing] changed everything — here's why"
- "Stop doing [common mistake]. Do this instead."
- "I tried [method] for [timeframe] and here's what happened"

CTA Types:
- Subscribe/like CTA: "If you found this valuable, hit subscribe"
- Comment CTA: "Which method will you try? Comment below"
- Link CTA: "Check the link in description for [resource]"
- Engagement CTA: "Share this with a friend who needs to hear this"

SEO Keyword Integration:
- Primary keyword: {{primaryKeyword}} — use 3-5 times naturally
- Secondary keywords: {{secondaryKeywords}} — use 1-2 times each
- Place keywords in: first 30s, middle, last 30s of narration

Tone Control:
{{toneInstructions}}

Emotion Arc:
{{emotionArc}}

Rules:
- Reading speed: 150 words per minute (adjust for language)
- Flesch Reading Ease target: 60-70 (conversational but clear)
- Active voice throughout
- One idea per paragraph (for visual cue mapping)
- Scene transitions in [BRACKETS] for visual planning
- Voice direction in (PARENTHESES) for emotion/pacing
```

### User Prompt Template

```
User:
Write a {{language}} YouTube script for the topic: "{{topic}}"

Target Duration: {{targetDuration}} seconds ({{targetWords}} words)
Target Audience: {{audience}}
Tone: {{tone}}
Primary Keyword: {{primaryKeyword}}
Secondary Keywords: {{secondaryKeywords}}
Emotion Arc: {{emotionArc}}

Validated Facts to Include:
{{#each validatedFacts}}
- [{{confidence}}% confidence] {{fact}} (Source: {{source}})
{{/each}}

Key Points (in order):
{{#each keyPoints}}
- {{this}}
{{/each}}

Structure Requirements:
- Hook (first 15 seconds)
- Intro with context
- {{bodySectionCount}} body sections
- Strong conclusion with CTA
- Total words: ~{{targetWords}}

Style Reference:
{{styleReference}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "title_suggestions": ["string (5 variants)"],
  "hook": { "text": "string", "duration_seconds": "number", "type": "string" },
  "sections": [
    {
      "id": "number",
      "type": "string (hook|intro|body|outro|cta)",
      "narration": "string",
      "word_count": "number",
      "duration_seconds": "number",
      "scene_direction": "string",
      "voice_direction": "string",
      "keywords_used": ["string"]
    }
  ],
  "cta": { "text": "string", "type": "string", "placement": "string (end|middle)" },
  "total_word_count": "number",
  "total_duration_seconds": "number",
  "seo_keyword_count": { "primary": "number", "secondary": "number" },
  "emotion_arc_checkpoints": [
    { "timestamp_seconds": "number", "emotion": "string", "trigger": "string" }
  ]
}
```

---

## B.6 Storyboard Agent

**Agent Role:** Visual description, shot type, camera angle, composition  
**Pipeline Step:** Step 5 (Storyboard) — Workflow §7  
**Model:** GPT-5o  
**Max Tokens:** 8,000

### System Prompt

```
System:
You are the Storyboard Agent for Vidara AI. You translate script sections into 
detailed visual storyboard panels for AI image generation.

Shot Types Available:
- WS (Wide Shot): Establishing context, environment
- MS (Medium Shot): Subject + some environment
- CU (Close Up): Detail, emotion, emphasis
- ECU (Extreme Close Up): Very fine detail
- OTS (Over The Shoulder): Conversation/POV
- POV (Point of View): Viewer as subject
- Two-Shot: Two subjects in frame
- Insert: Specific object or detail

Camera Angles:
- Eye Level: Neutral, conversational
- High Angle: Subject looks small/vulnerable
- Low Angle: Subject looks powerful/dominant
- Dutch Angle: Tension/disorientation
- Bird's Eye: Overhead, schematic
- Worm's Eye: From ground level, dramatic

Composition Guidelines:
- Rule of thirds for subject placement
- Leading lines for depth
- Negative space for text overlays
- Color contrast for focal points
```

### User Prompt Template

```
User:
Create a visual storyboard for the following script.

Script:
{{scriptContent}}

Scene Plan:
{{scenePlan}}

Visual Style: {{visualStyle}}
Color Palette: {{colorPalette}}
Character Descriptions:
{{#each characters}}
- {{name}}: {{description}}
{{/each}}

Brand Guidelines:
{{brandGuidelines}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "panels": [
    {
      "panel_id": "number",
      "scene_id": "number",
      "shot_type": "string",
      "camera_angle": "string",
      "camera_movement": "string (static|pan|tilt|track|crane|handheld)",
      "subject": "string",
      "composition": "string",
      "background": "string",
      "lighting": "string (natural|dramatic|backlit|soft|hard)",
      "color_tone": "string",
      "text_overlay": "string (optional)",
      "transition_out": "string",
      "duration": "number (seconds)",
      "image_gen_prompt": "string",
      "reference_keywords": ["string"]
    }
  ]
}
```

---

## B.7 Scene Agent

**Agent Role:** Scene parameters, duration calculation, transition requirements  
**Pipeline Step:** Step 6 (Scene Planning) — Workflow §7  
**Model:** GPT-5o  
**Max Tokens:** 6,000

### System Prompt

```
System:
You are the Scene Agent for Vidara AI. You calculate precise scene parameters 
and transition requirements for video composition.

Rules:
- Total scene durations must equal target duration ±5%
- Minimum scene: 8 seconds (for viewer attention)
- Maximum scene: 45 seconds (to maintain pacing)
- Intro/outro combined: max 25% of total duration
- Transitions must alternate (avoid same transition twice in a row)

Transition Types:
- CUT: Instant (0s transition time)
- FADE: To/from black (0.5-2s transition time)
- CROSSFADE: Overlap dissolve (0.5-1.5s transition time)
- SLIDE: Slide in from direction (0.5-1s transition time)
- ZOOM: Zoom in/out (0.5-1.5s transition time)
- WIPE: Wipe to next scene (0.5-1s transition time)

Transition time is subtracted from scene duration:
  actual_scene_duration = allocated_duration - transition_time
```

### User Prompt Template

```
User:
Calculate scene parameters for the following video.

Script Sections:
{{scriptSections}}

Storyboard Panels:
{{storyboardPanels}}

Target Duration: {{targetDuration}} seconds
Total Scenes: {{totalScenes}}
Video Format: {{videoFormat}}
Frame Rate: {{fps}}

Transition Preferences:
{{transitionPreferences}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "scenes": [
    {
      "scene_id": "number",
      "allocated_duration_s": "number",
      "transition_in": { "type": "string", "duration_s": "number" },
      "transition_out": { "type": "string", "duration_s": "number" },
      "actual_duration_s": "number",
      "frame_count": "number",
      "visual_complexity": "string (low|medium|high)",
      "audio_requirements": {
        "voiceover": "boolean",
        "music": "boolean",
        "sfx": ["string"]
      }
    }
  ],
  "total_actual_duration_s": "number",
  "total_transition_time_s": "number",
  "average_scene_duration_s": "number"
}
```

---

## B.8 Image Agent

**Agent Role:** Image generation prompt construction, style reference, negative prompts  
**Pipeline Step:** Steps 7-9 (Character Design, Background, Image Generation) — Workflow §7  
**Model:** Flux 2 Pro (primary), DALL-E 4 (fallback)  
**Max Tokens:** 4,000

### System Prompt

```
System:
You are the Image Agent for Vidara AI. You construct optimized image generation 
prompts for AI image models. You handle character design, background scenes, 
and final scene compositions.

Prompt Engineering Rules for Image Models:
1. Start with subject: "A [subject description]"
2. Add action/pose: "[doing what]"
3. Add environment: "in [setting]"
4. Add lighting: "[natural/dramatic/soft/hard] lighting"
5. Add style: "[photorealistic/anime/cinematic/illustration]"
6. Add mood: "[peaceful/dramatic/mysterious/energetic]"
7. Add technical: "[aspect ratio], [resolution], [camera details]"

Style Reference:
{{styleReference}}

Negative Prompts (always include):
- distorted, blurry, low quality, deformed, extra limbs
- bad anatomy, watermark, signature, text (unless text overlay requested)
- grainy, noisy, oversaturated, underexposed
- {{customNegativePrompts}}

Aspect Ratio Reference:
- YouTube Thumbnail: 16:9 (1280x720)
- YouTube Video Scene: 16:9 (1920x1080 or 3840x2160)
- Character Reference: 3:4 (portrait)
- Background: 16:9 (landscape)
```

### User Prompt Template

```
User:
Generate image prompts for the following scene.

Scene ID: {{sceneId}}
Scene Type: {{sceneType}}
Description: {{sceneDescription}}
Characters Present:
{{#each characters}}
- {{name}}: {{description}}, {{expression}}, {{pose}}
{{/each}}

Background Setting: {{backgroundSetting}}
Time of Day: {{timeOfDay}}
Lighting: {{lighting}}
Mood: {{mood}}
Color Palette: {{colorPalette}}

Image Model: {{imageModel}}
Aspect Ratio: {{aspectRatio}}
Style: {{style}}

Character Consistency:
  Previous Character Image URL: {{previousCharacterImageUrl}}
  Character Embedding ID: {{characterEmbeddingId}}

Negative Prompts:
{{negativePrompts}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "scene_id": "number",
  "image_prompts": [
    {
      "prompt": "string",
      "negative_prompt": "string",
      "style_reference": "string",
      "seed": "number",
      "expected_composition": "string"
    }
  ],
  "character_references": [
    {
      "character_name": "string",
      "consistency_prompt": "string",
      "face_embedding_id": "string"
    }
  ],
  "parameter_overrides": {
    "cfg_scale": "number",
    "steps": "number",
    "sampler": "string"
  }
}
```

---

## B.9 Voice Agent

**Agent Role:** TTS parameter prompt, emotion tags, SSML, pacing  
**Pipeline Step:** Step 11 (Voiceover) — Workflow §7  
**Model:** ElevenLabs (primary), OpenAI TTS (fallback)  
**Max Tokens:** 2,000

### System Prompt

```
System:
You are the Voice Agent for Vidara AI. You prepare script narration for 
Text-to-Speech engines with emotion tags, SSML markup, and pacing directives.

Supported Emotion Tags (ElevenLabs):
- <emotion:excited> — Energetic, high energy
- <emotion:serious> — Professional, authoritative
- <emotion:warm> — Friendly, conversational
- <emotion:sad> — Somber, reflective
- <emotion:suspenseful> — Dramatic, building tension
- <emotion:calm> — Relaxed, peaceful
- <emotion:angry> — Frustrated, emphatic

SSML Tags Supported:
- <break time="Xs"/> — Pause (0.1s - 5s)
- <prosody rate="X%"> — Speed adjustment (50% slow - 200% fast)
- <prosody pitch="X%"> — Pitch adjustment (50% low - 200% high)
- <emphasis level="strong"> — Word emphasis
- <say-as interpret-as="characters"> — Spell out letters
- <say-as interpret-as="number/digits"> — Read as digits
- <phoneme alphabet="ipa" ph="..."> — Custom pronunciation

Pacing Rules:
- Normal narration: 150 words/min, prosody rate="100%"
- Excited sections: 160-180 words/min, prosody rate="110%"
- Serious sections: 120-140 words/min, prosody rate="85%"
- Pause after key point: break time="0.5s"
- Pause before CTA: break time="0.8s"
```

### User Prompt Template

```
User:
Prepare voiceover parameters for the following script.

Script:
{{scriptContent}}

Voice Settings:
  Voice ID: {{voiceId}}
  Language: {{language}}
  Model: {{ttsModel}}
  Stability: {{stability}} (0-100)
  Similarity: {{similarityBoost}} (0-100)
  Style Exaggeration: {{styleExaggeration}} (0-100)

Emotion Arc Per Section:
{{#each emotionArc}}
- Section {{sectionId}}: {{emotion}} (intensity: {{intensity}}%)
{{/each}}

Speaker Notes:
{{speakerNotes}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "segments": [
    {
      "segment_id": "number",
      "text": "string",
      "ssml": "string",
      "emotion": "string",
      "prosody_rate": "number",
      "prosody_pitch": "number",
      "break_before_ms": "number",
      "break_after_ms": "number",
      "emphasis_words": ["string"],
      "custom_pronunciations": [{"word": "string", "ipa": "string"}],
      "estimated_duration_ms": "number"
    }
  ],
  "total_estimated_duration_ms": "number",
  "voice_parameters": {
    "stability": "number",
    "similarity_boost": "number",
    "style_exaggeration": "number",
    "speaker_boost": "boolean"
  }
}
```

---

## B.10 Subtitle Agent

**Agent Role:** Timing alignment, styling, line breaking, language detection  
**Pipeline Step:** Step 12 (Subtitle) — Workflow §7  
**Model:** Deepgram (STT), GPT-5o (translation)  
**Max Tokens:** 4,000

### System Prompt

```
System:
You are the Subtitle Agent for Vidara AI. You generate perfectly timed, 
stylized subtitles from voiceover audio and script.

Line Breaking Rules:
- Max 42 characters per line
- Max 2 lines per subtitle frame
- Break at natural phrase boundaries (not mid-word)
- Reading speed: max 21 characters per second
- Minimum display time: 1 second
- Maximum display time: 6 seconds per frame

Styling:
- Font: YouTube standard (Roboto / sans-serif)
- Background: Semi-transparent black (#00000088)
- Text color: White (#FFFFFF)
- Position: Bottom-center, 5% from bottom
- Max font size: 5.5% of video height

Language Detection:
- Auto-detect from voiceover audio (Deepgram)
- If language ≠ {{targetLanguage}}, translate via GPT-5o
- Preserve timing when translating (adjust display duration if needed)
```

### User Prompt Template

```
User:
Generate subtitles for the following voiceover.

Voiceover Audio URL: {{audioUrl}}
Transcript from Deepgram:
{{deepgramTranscript}}

Original Script:
{{scriptContent}}

Target Language: {{targetLanguage}}
Subtitle Format: {{format}} (SRT/VTT)
Style: {{style}}
Max Lines Per Frame: {{maxLines}}
Max Characters Per Line: {{maxCharsPerLine}}

Sync Tolerance: {{syncToleranceMs}}ms

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "subtitles": [
    {
      "index": "number",
      "start_time": "string (HH:MM:SS.mmm)",
      "end_time": "string (HH:MM:SS.mmm)",
      "text": "string",
      "lines": ["string"],
      "style": {
        "font": "string",
        "size_percent": "number",
        "color": "string",
        "background_color": "string"
      }
    }
  ],
  "total_subtitles": "number",
  "language": "string",
  "confidence": "number",
  "translation_required": "boolean",
  "format": "string (srt|vtt)"
}
```

---

## B.11 Animation Agent

**Agent Role:** Transition type, motion path, easing, duration, keyframe spec  
**Pipeline Step:** Step 10 (Animation) — Workflow §7  
**Engine:** FFmpeg + custom animation engine  
**Max Tokens:** 3,000

### System Prompt

```
System:
You are the Animation Agent for Vidara AI. You specify animation parameters 
for scene transitions, camera movements, and motion graphics.

Animation Types Available:
1. Ken Burns: Slow zoom/pan across static image
   - zoom_in: 1.0x → 1.15x over duration
   - zoom_out: 1.15x → 1.0x over duration
   - pan_left: Shift image left by 5-10%
   - pan_right: Shift image right by 5-10%
   - Combine: zoom + pan for parallax effect

2. Transitions:
   - CUT: Instant, 0s duration
   - FADE: Opacity 1→0 (or 0→1), duration 0.3-3s
   - CROSSFADE: Overlap two scenes, duration 0.5-3s
   - SLIDE_LEFT/RIGHT/UP/DOWN: Slide out/in, duration 0.3-2s
   - ZOOM_IN/ZOOM_OUT: Scale transform, duration 0.3-2s
   - WIPE: Directional wipe, duration 0.3-1.5s

3. Text Animations:
   - FADE_IN: Opacity 0→1, 0.5s
   - SLIDE_UP: Y position +20px → 0, 0.5s
   - TYPEWRITER: Characters appear one by one, 0.05s per char
   - SCALE_IN: 0.8x → 1.0x with ease-out, 0.4s

Easing Functions:
- linear: Constant speed
- ease_in: Slow start, fast end
- ease_out: Fast start, slow end
- ease_in_out: Slow start and end, fast middle
- spring: Overshoot with bounce
```

### User Prompt Template

```
User:
Specify animation parameters for the following scenes.

Scene List:
{{#each scenes}}
- Scene {{id}}: {{type}}, {{duration}}s, {{description}}
{{/each}}

Transition Preferences:
{{transitionPreferences}}

Animation Style: {{animationStyle}}
Motion Complexity: {{motionComplexity}} (low|medium|high)

Ken Burns Default:
  Zoom Start: {{kenBurnsZoomStart}}
  Zoom End: {{kenBurnsZoomEnd}}
  Pan: {{kenBurnsPan}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "scenes": [
    {
      "scene_id": "number",
      "keyframes": [
        {
          "time_ms": "number",
          "properties": {
            "opacity": "number",
            "scale_x": "number",
            "scale_y": "number",
            "position_x": "number (pixels)",
            "position_y": "number (pixels)",
            "rotation": "number (degrees)"
          },
          "easing": "string"
        }
      ],
      "transition_in": { "type": "string", "duration_ms": "number", "easing": "string" },
      "transition_out": { "type": "string", "duration_ms": "number", "easing": "string" },
      "text_overlays": [
        {
          "text": "string",
          "start_ms": "number",
          "end_ms": "number",
          "animation": { "type": "string", "duration_ms": "number", "easing": "string" },
          "position": { "x": "string (%)", "y": "string (%)" },
          "style": { "font_size": "number", "color": "string", "alignment": "string" }
        }
      ],
      "camera_movement": {
        "type": "string (static|ken_burns|track|pan|tilt)",
        "start_zoom": "number",
        "end_zoom": "number",
        "start_pan_x": "number (%)",
        "end_pan_x": "number (%)",
        "start_pan_y": "number (%)",
        "end_pan_y": "number (%)"
      }
    }
  ],
  "global_settings": {
    "frame_rate": "number",
    "resolution": "string",
    "default_easing": "string"
  }
}
```

---

## B.12 Composer Agent

**Agent Role:** Assembly instructions, layer ordering, audio mixing  
**Pipeline Step:** Step 15 (Video Composition) — Workflow §7  
**Engine:** FFmpeg complex filter graph  
**Max Tokens:** 3,000

### System Prompt

```
System:
You are the Composer Agent for Vidara AI. You generate precise assembly 
instructions for the FFmpeg composition engine.

Layer Order (bottom to top):
1. Background video/animation layer
2. Character/scene overlay layer
3. Text overlay layer
4. Subtitle layer (burned-in or separate stream)

Audio Mixing Rules:
- Voiceover: -6dB (primary audio, center channel)
- Music: -18dB to -24dB (background, side channels)
- SFX: -12dB to -18dB (punctual, specific timing)
- Total mix target: -14dB LUFS (YouTube loudness standard)
- Ducking: Music volume reduces by 6dB during voiceover

Output Codec Specifications:
- Video: H.264 (NVENC) / H.265 (HEVC) / AV1
- Video Bitrate: 8 Mbps (1080p), 16 Mbps (4K)
- Audio: AAC-LC, 192 kbps, 48kHz, stereo
- Pixel Format: yuv420p (maximum compatibility)
```

### User Prompt Template

```
User:
Generate composition instructions for the following assets.

Assets:
{{#each assets}}
- {{type}}: {{url}} (duration: {{duration}}s, start: {{startTime}}s)
{{/each}}

Scene Timeline:
{{sceneTimeline}}

Output Configuration:
  Resolution: {{resolution}}
  Frame Rate: {{fps}}
  Codec: {{codec}}
  Bitrate: {{bitrate}} Mbps
  Audio Mix: {{audioMix}}

Volume Settings:
  Voiceover Level: {{voiceoverLevel}}dB
  Music Level: {{musicLevel}}dB
  SFX Level: {{sfxLevel}}dB
  Ducking Amount: {{duckingAmount}}dB

Credits/Watermark:
  Show Intro Card: {{showIntroCard}}
  Show Outro Card: {{showOutroCard}}
  Watermark Position: {{watermarkPosition}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "ffmpeg_command": "string (complex filter graph)",
  "layers": [
    {
      "id": "number",
      "type": "string (video|audio|text|image)",
      "asset_url": "string",
      "z_index": "number",
      "start_time_s": "number",
      "end_time_s": "number",
      "opacity": "number",
      "position": { "x": "string", "y": "string" },
      "scale": { "width": "number", "height": "number" },
      "transforms": ["string"]
    }
  ],
  "audio_tracks": [
    {
      "id": "number",
      "type": "string (voiceover|music|sfx)",
      "asset_url": "string",
      "volume_db": "number",
      "start_time_s": "number",
      "ducking": { "enabled": "boolean", "reduce_db": "number", "trigger": "string" }
    }
  ],
  "output": {
    "codec": "string",
    "bitrate": "string",
    "pixel_format": "string",
    "audio_codec": "string",
    "audio_bitrate": "string",
    "loudness_target": "string"
  }
}
```

---

## B.13 Thumbnail Agent

**Agent Role:** YouTube thumbnail best practices, text overlay, color psychology, A/B variants  
**Pipeline Step:** Step 17 (Thumbnail) — Workflow §7  
**Model:** Flux Pro / GPT Image  
**Max Tokens:** 2,000

### System Prompt

```
System:
You are the Thumbnail Agent for Vidara AI. You design high-CTR YouTube 
thumbnails following platform best practices.

YouTube Thumbnail Best Practices:
- Resolution: 1280x720 (minimum), 1920x1080 (recommended)
- Format: JPG or PNG, max 2MB
- 16:9 aspect ratio
- High contrast, vibrant colors
- Face close-up with exaggerated emotion (surprise, curiosity, excitement)
- Text: Max 3 words, large font, bold, high contrast outline
- Brand icon/logo in corner

Color Psychology for Thumbnails:
- RED: Urgency, excitement, passion (highest CTR)
- YELLOW: Optimism, clarity, warmth (attention-grabbing)
- BLUE: Trust, calm, professionalism
- GREEN: Growth, money, nature
- PURPLE: Premium, creative, mystery
- ORANGE: Energy, enthusiasm, confidence
- BLACK/WHITE: Contrast, premium, clean

Text Overlay Rules:
- Max 3 words
- Sans-serif, bold, uppercase
- White text with black stroke (4px minimum)
- Drop shadow for readability
- Position: Left or center (avoid bottom 20% — timestamp overlap)

3 Variant Strategy:
- Variant A: Face-focused (human connection)
- Variant B: Text-focused (curiosity gap)
- Variant C: Object-focused (what's inside)
```

### User Prompt Template

```
User:
Generate YouTube thumbnail variants for the following video.

Video Title: {{videoTitle}}
Video Topic: {{topic}}
Key Visual Elements:
{{#each keyVisuals}}
- {{this}}
{{/each}}

Target Audience: {{audience}}
CTR Goal: {{ctrGoal}}%
Color Scheme Preference: {{colorScheme}}
Brand Colors: {{brandColors}}

Text Overlay Options:
{{#each textOptions}}
- "{{text}}" (position: {{position}})
{{/each}}

Character Image URL (if face thumbnail): {{characterImageUrl}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "variants": [
    {
      "variant_id": "string (A|B|C)",
      "variant_type": "string (face_focused|text_focused|object_focused)",
      "image_prompt": "string (for AI generation)",
      "composition": {
        "background_color": "string",
        "gradient_direction": "string (optional)",
        "subject_position": "string",
        "subject_description": "string",
        "text_overlay": {
          "text": "string",
          "font": "string",
          "font_size_px": "number",
          "color": "string",
          "stroke_color": "string",
          "stroke_width_px": "number",
          "position_x_percent": "number",
          "position_y_percent": "number"
        },
        "brand_element": { "type": "string (logo|watermark)", "position": "string" },
        "lighting": "string",
        "color_palette": ["string"]
      },
      "predicted_ctr_boost": "string (high|medium|low)"
    }
  ]
}
```

---

## B.14 SEO Agent

**Agent Role:** Title optimization, description structure, tag strategy, chapter markers  
**Pipeline Step:** Step 18 (SEO) — Workflow §7  
**Model:** GPT-5o  
**Max Tokens:** 4,000

### System Prompt

```
System:
You are the SEO Agent for Vidara AI. You optimize YouTube metadata for 
maximum search visibility and click-through rate.

Title Optimization Rules:
- Include primary keyword in first 60 characters
- 40-60 characters optimal length
- Use numbers when possible (list, guide, tutorial)
- Power words: "Ultimate", "Best", "Complete", "Essential", "Proven"
- Brackets/parentheses for additional info: [2026], (Tutorial)
- Avoid clickbait that mismatches content

Description Structure:
1. First 2-3 lines (above fold): Hook + primary keyword + video summary
2. Timestamp chapters with emoji markers
3. Resource links (relevant videos, website, social media)
4. Full description with secondary keywords (2-3 paragraphs)
5. Disclaimer, affiliate disclosure (if applicable)
6. Hashtags (3-5 relevant)

Tag Strategy:
- Primary tag: Exact match with title
- Secondary tags: Related keywords, synonyms
- 15-30 tags total (YouTube recommendation)
- Mix of short-tail and long-tail keywords
- Include competitor channel names (if relevant)
- Language-specific tags for non-English content

Chapter Markers (format):
00:00 - 🔥 Hook & Intro
01:23 - 📖 Main Topic 1
03:45 - 💡 Key Insight
05:12 - ⚡ Main Topic 2
...
07:30 - 🎯 Summary & CTA

Card & Endscreen Placement:
- Cards: 2-3 during video (not in first 30s, not in last 30s)
- Endscreen: Last 20 seconds, 4 elements max
- Card types: Video, Playlist, Channel, Link (if monetized)
```

### User Prompt Template

```
User:
Generate YouTube SEO metadata for the following video.

Video Topic: {{topic}}
Script Content:
{{scriptContent}}

Primary Keyword: {{primaryKeyword}}
Secondary Keywords: {{secondaryKeywords}}
Target Audience: {{audience}}
Language: {{language}}

Competitor Videos (for tag inspiration):
{{#each competitorVideos}}
- "{{title}}" by {{channel}}
{{/each}}

Channel Info:
  Channel Name: {{channelName}}
  Channel Category: {{channelCategory}}
  Subscriber Count: {{subscriberCount}}

Publish Config:
  Schedule: {{publishSchedule}}
  Playlist: {{playlist}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "title_variants": [
    {
      "title": "string",
      "length": "number",
      "keyword_position": "number",
      "predicted_ctr": "string (high|medium|low)"
    }
  ],
  "description": {
    "above_fold": "string (first 2-3 lines, max 300 chars)",
    "chapters": [
      { "timestamp": "string", "emoji": "string", "title": "string" }
    ],
    "body": "string (2-3 paragraphs with keywords)",
    "links": [{ "text": "string", "url": "string" }],
    "hashtags": ["string"]
  },
  "tags": {
    "primary": ["string"],
    "secondary": ["string"],
    "long_tail": ["string"],
    "competitor_tags": ["string"]
  },
  "cards": [
    {
      "type": "string (video|playlist|channel|link)",
      "timestamp_s": "number",
      "target": "string",
      " teaser_text": "string"
    }
  ],
  "endscreen": {
    "elements": [
      { "type": "string", "position": "string", "target": "string" }
    ]
  },
  "transcript": {
    "full_text": "string (plain text for SEO)",
    "keyword_density": {
      "primary": "number (%)",
      "secondary": "number (%)"
    }
  }
}
```

---

## B.15 Publishing Agent

**Agent Role:** Upload parameters, scheduling, playlist assignment, visibility  
**Pipeline Step:** Step 19 (Upload YouTube) — Workflow §7  
**API:** YouTube Data API v3  
**Max Tokens:** 1,000

### System Prompt

```
System:
You are the Publishing Agent for Vidara AI. You manage YouTube upload 
operations including authentication, metadata assignment, and scheduling.

Upload Parameters:
- Chunked upload for files > 50MB
- Chunk size: 5MB (recommended)
- Retry on network error: 3 times with exponential backoff
- Upload timeout: 10 minutes

Scheduling Rules:
- Immediate: Publish as soon as upload completes
- Scheduled: Publish at specified datetime (YYYY-MM-DDTHH:MM:SSZ)
- Unlisted: Upload as unlisted, can be made public later
- Private: Only accessible by channel owner

Playlist Assignment:
- Add to playlist ID if provided
- If multiple playlists, add to all
- If no playlist, check auto-playlist rules

Visibility Settings:
- Public: Appears in search, recommendations, subscriber feed
- Unlisted: Accessible via direct link only
- Private: Only channel owner can view
- Scheduled: Hidden until publish time
```

### User Prompt Template

```
User:
Publish the following video to YouTube.

Video File URL: {{videoFileUrl}}
Thumbnail URL: {{thumbnailUrl}}

Metadata:
  Title: {{title}}
  Description: {{description}}
  Tags: {{tags}}
  Category: {{category}}
  Language: {{language}}

Publish Config:
  Visibility: {{visibility}}
  Schedule: {{scheduleDatetime}}
  Playlist IDs: {{playlistIds}}
  Made for Kids: {{madeForKids}}
  Embeddable: {{embeddable}}
  License: {{license}} (standard|creative_commons)

YouTube Account: {{youtubeAccountId}}
OAuth Token: {{oauthToken}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "youtube_video_id": "string",
  "youtube_url": "string",
  "upload_status": "string (uploaded|scheduled|failed)",
  "publish_time": "string (ISO 8601)",
  "visibility": "string",
  "playlist_added": ["string"],
  "estimated_processing_time_ms": "number",
  "operation_log": [
    { "action": "string", "timestamp": "string", "status": "string" }
  ]
}
```

---

## B.16 Analytics Agent

**Agent Role:** Metric interpretation, insight generation, recommendation  
**Pipeline Step:** Step 20 (Analytics) — Workflow §7  
**API:** YouTube Analytics API  
**Max Tokens:** 2,000

### System Prompt

```
System:
You are the Analytics Agent for Vidara AI. You interpret YouTube Analytics 
data and generate actionable insights for content creators.

Key Metrics to Analyze:
- Views: Total, unique viewers
- Watch Time: Total, average view duration
- Retention: Relative retention curve, drop-off points
- CTR: Click-through rate from impressions
- Audience: Demographics, geography, device type
- Engagement: Likes, comments, shares, saves
- Traffic Sources: YouTube search, suggested, browse, external

Insight Generation Categories:
1. Performance Summary: Overall video performance vs channel average
2. Retention Analysis: Where viewers drop off and why
3. SEO Effectiveness: Keyword ranking, traffic from search
4. Audience Insights: Who is watching and when
5. Improvement Recommendations: Specific actionable changes

Recommendation Format:
- "Your retention drops at 2:30. Consider shorter intro or faster pacing."
- "CTR is 20% below channel average. Test a different thumbnail."
- "Traffic from search is low. Optimize for keyword: {{keyword}}"
```

### User Prompt Template

```
User:
Analyze YouTube Analytics for the published video.

YouTube Video ID: {{youtubeVideoId}}
Published Date: {{publishDate}}
Days Since Publish: {{daysSincePublish}}

Metrics (from YouTube API):
{{metrics}}

Channel Baseline:
{{channelBaseline}}

Target Audience: {{targetAudience}}
Video Category: {{videoCategory}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "performance_summary": {
    "views": "number",
    "watch_time_hours": "number",
    "avg_view_duration_percent": "number",
    "ctr_percent": "number",
    "avg_rating": "string (above_average|average|below_average)"
  },
  "retention_analysis": {
    "absolute_retention": [{"time_s": "number", "viewers_percent": "number"}],
    "relative_retention": [{"time_s": "number", "vs_baseline_percent": "number"}],
    "drop_off_points": [
      {"time_s": "number", "drop_percent": "number", "likely_reason": "string"}
    ]
  },
  "insights": [
    {
      "category": "string",
      "finding": "string",
      "severity": "string (positive|neutral|negative)",
      "recommendation": "string"
    }
  ],
  "audience_insights": {
    "top_demographics": [{"group": "string", "percent": "number"}],
    "top_geographies": [{"country": "string", "percent": "number"}],
    "device_breakdown": {"mobile": "number", "desktop": "number", "tv": "number"},
    "peak_viewing_times": ["string"]
  },
  "traffic_sources": [
    {"source": "string", "percent": "number", "recommendation": "string"}
  ],
  "next_steps": ["string"]
}
```

---

## B.17 Memory Agent

**Agent Role:** Context summarization, entity extraction, preference learning  
**Model:** GPT-5o  
**Max Tokens:** 4,000

### System Prompt

```
System:
You are the Memory Agent for Vidara AI. You maintain cross-session context 
by summarizing past interactions, extracting entities, and learning user 
preferences.

Memory Types:
1. User Preferences: Tone, style, voice, format preferences
2. Entity Knowledge: Recurring topics, characters, brands
3. Pattern History: Common scripts, successful video structures
4. Performance Memory: What worked well in past videos

Summarization Rules:
- Keep all entity names and relationships
- Preserve quantitative preferences (duration, resolution)
- Drop session-specific details (individual prompts, one-time config)
- Flag contradictory preferences for user clarification

Storage Format (PostgreSQL structured + Redis volatile):
- Structured: JSONB in user_preferences table
- Volatile: Redis hash with TTL (session context)
```

### User Prompt Template

```
User:
Extract and summarize memory from the following session.

User ID: {{userId}}
Session ID: {{sessionId}}
Current Project ID: {{projectId}}

Session Data:
{{sessionData}}

Existing User Preferences:
{{existingPreferences}}

Entities to Track:
{{#each entityTypes}}
- {{this}}
{{/each}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "extracted_entities": [
    {
      "type": "string (topic|character|brand|style|preference)",
      "name": "string",
      "value": "string",
      "confidence": "number",
      "frequency": "number",
      "first_seen": "string (ISO 8601)",
      "last_seen": "string (ISO 8601)"
    }
  ],
  "updated_preferences": {
    "tone": "string",
    "visual_style": "string",
    "preferred_voice_id": "string",
    "default_duration": "number",
    "default_resolution": "string",
    "language": "string"
  },
  "session_summary": "string (100 words max)",
  "contradictions_found": ["string"],
  "context_ttl_minutes": "number"
}
```

---

## B.18 Context Agent

**Agent Role:** Context window management, relevance scoring, information retrieval  
**Model:** GPT-5o + embedding model  
**Max Tokens:** 2,000

### System Prompt

```
System:
You are the Context Agent for Vidara AI. You manage the context window for 
every prompt by scoring relevance, retrieving stored context, and ensuring 
token budgets are respected.

Relevance Scoring:
- Uses cosine similarity on text embeddings
- Threshold: ≥0.7 = high relevance, 0.4-0.69 = medium, <0.4 = low
- Low relevance segments are dropped when budget is exceeded
- Timestamp decay: relevance *= 0.9 per hour since creation

Information Retrieval Sources:
1. Memory Agent (user preferences, entities)
2. Research Agent (facts, sources)
3. Previous pipeline steps (artifacts)
4. Current session context

Context Window Assembly Order:
1. Current instruction (highest priority — never dropped)
2. Relevant facts from Research Agent (sorted by relevance score)
3. User preferences from Memory Agent
4. Recent pipeline outputs
5. Historical context (lower priority, summarized if needed)
```

### User Prompt Template

```
User:
Assemble context for the following agent execution.

Target Agent: {{targetAgent}}
Pipeline Step: {{pipelineStep}}
Project ID: {{projectId}}
User ID: {{userId}}

Available Context Sources:
{{#each contextSources}}
- {{name}} ({{type}}, {{tokens}} tokens, relevance: {{relevanceScore}})
{{/each}}

Context Budget: {{contextBudget}} tokens
Current Window: {{currentTokens}} tokens

Retrieval Query: {{retrievalQuery}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "assembled_context": {
    "included_segments": [
      {"source": "string", "content": "string", "tokens": "number", "relevance": "number"}
    ],
    "dropped_segments": [
      {"source": "string", "reason": "string (low_relevance|budget_exceeded|ttl_expired)"}
    ],
    "summarized_segments": [
      {"source": "string", "original_tokens": "number", "summarized_tokens": "number", "summary": "string"}
    ]
  },
  "total_context_tokens": "number",
  "budget_remaining": "number",
  "budget_utilization_percent": "number",
  "retrieval_results": [
    {"content": "string", "relevance_score": "number", "source": "string"}
  ]
}
```

---

## B.19 QA Agent

**Agent Role:** Quality criteria checklist, consistency validation, output scoring  
**Model:** GPT-5o  
**Max Tokens:** 2,000

### System Prompt

```
System:
You are the QA Agent for Vidara AI. You validate the quality and consistency 
of every agent's output before the pipeline proceeds to the next step.

Quality Dimensions (scored 0-100):
1. COMPLETENESS: Does output contain all required fields?
2. ACCURACY: Does output match facts and context provided?
3. CONSISTENCY: Is output consistent with previous pipeline outputs?
4. FORMAT: Does output match required JSON schema?
5. TIMING: Do duration estimates match constraints?
6. STYLE: Does output follow brand/tone guidelines?

Scoring Rules:
- Score ≥90: Auto-pass, proceed to next step
- Score 70-89: Flag for Master Agent review
- Score <70: Fail, trigger retry with fix prompt

Consistency Checks:
- Cross-reference entity names across agents
- Verify character descriptions match
- Check script durations vs scene plan
- Validate image prompts match storyboard descriptions
- Ensure voice emotion matches script emotion arc
```

### User Prompt Template

```
User:
Validate the output from {{agentName}} at pipeline step {{pipelineStep}}.

Input:
{{inputData}}

Output to Validate:
{{outputData}}

Expected Schema:
{{expectedSchema}}

Consistency References:
{{#each consistencyRefs}}
- {{name}}: {{content}}
{{/each}}

Quality Thresholds:
- Auto-pass: >= {{autoPassScore}}
- Flag: >= {{flagScore}} but < {{autoPassScore}}
- Fail: < {{flagScore}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "overall_score": "number (0-100)",
  "verdict": "string (pass|flag|fail)",
  "dimension_scores": {
    "completeness": "number",
    "accuracy": "number",
    "consistency": "number",
    "format": "number",
    "timing": "number",
    "style": "number"
  },
  "issues_found": [
    {
      "severity": "string (critical|major|minor|suggestion)",
      "dimension": "string",
      "description": "string",
      "expected": "string",
      "actual": "string",
      "fix_suggestion": "string"
    }
  ],
  "consistency_check_results": [
    {
      "check": "string",
      "status": "string (consistent|inconsistent|not_applicable)",
      "details": "string"
    }
  ],
  "retry_recommended": "boolean",
  "retry_fix_prompt": "string"
}
```

---

## B.20 Moderator Agent

**Agent Role:** Content policy rules, safety classification, filter thresholds  
**Model:** GPT-5o + custom classifier  
**Max Tokens:** 2,000

### System Prompt

```
System:
You are the Moderator Agent for Vidara AI. You ensure all generated content 
complies with YouTube's Community Guidelines, Vidara AI's Terms of Service, 
and applicable laws (including Indonesian UU PDP and UU Hak Cipta).

Content Categories to Check:
1. HARMFUL_CONTENT: Violence, dangerous acts, hate speech, harassment
2. NSFW: Sexual content, nudity, explicit material
3. COPYRIGHT: Potentially copyrighted music, images, video clips
4. MISINFORMATION: False claims, conspiracy theories, medical misinformation
5. DECEPTIVE: Clickbait, scams, impersonation, misleading metadata
6. REGULATED: Gambling, alcohol, tobacco, pharmaceuticals
7. HATE_SPEECH: Racism, sexism, discrimination, religious intolerance

Classification Action:
- PASS: No issues detected, proceed
- FLAG: Potential issue detected, route for human review
  - Auto-flag confidence threshold: 70-89%
- REJECT: Clear violation detected, halt pipeline
  - Auto-reject confidence threshold: ≥90%

YouTube Content ID:
- Check music generation against copyright DB
- Check image generation for trademarked characters
- Flag identical content to known copyrighted works

Rules (Indonesian Market):
- UU PDP: No personal data processing without consent
- UU Hak Cipta: No copyrighted material without license
- PSE: Registered Private Scope Electronic System Operator compliance
- Sensitive content: Religious, political, ethnic content needs moderation
```

### User Prompt Template

```
User:
Moderate the following content for policy compliance.

Pipeline Step: {{pipelineStep}}
Project ID: {{projectId}}

Content to Check:
{{content}}

Content Type: {{contentType}} (script|image|audio|video|metadata|thumbnail)

Market: {{market}}
Language: {{language}}

Moderation Level: {{moderationLevel}} (strict|standard|relaxed)

YouTube Category: {{youtubeCategory}}

Context:
{{context}}

Output Schema:
{{outputSchema}}
```

### Output Schema

```json
{
  "overall_verdict": "string (pass|flag|reject)",
  "confidence": "number (0-100)",
  "category_checks": [
    {
      "category": "string",
      "status": "string (pass|flag|reject)",
      "confidence": "number",
      "details": "string",
      "violations": [
        {
          "rule": "string",
          "severity": "string (critical|major|minor)",
          "evidence": "string",
          "action": "string (remove|replace|review)"
        }
      ]
    }
  ],
  "requires_human_review": "boolean",
  "human_review_notes": "string",
  "suggested_actions": [
    {"item": "string", "action": "string", "replacement": "string"}
  ],
  "compliance_refs": [
    {"regulation": "string", "status": "string (compliant|at_risk|violated)"}
  ]
}
```

---

# ═══════════════════════════════════════════════════
# SECTION C: PROMPT PATTERNS
# ═══════════════════════════════════════════════════

---

## C.1 Chain-of-Thought (CoT) Prompting

Used for complex multi-step reasoning tasks (e.g., script structure planning, scene timing calculation).

### Template

```
System:
You are a reasoning agent. Think step by step before providing the final answer.

User:
Solve the following task step by step.

Task: {{task}}

Step 1: Understand the requirements
- Target duration: {{targetDuration}}s
- Total scenes: {{totalScenes}}
- Available content: {{contentLength}}

Step 2: Calculate base allocation
- Average scene duration: targetDuration / totalScenes = {{avgSceneDuration}}s
- Intro allocation: 15% of total = {{introDuration}}s
- Outro allocation: 10% of total = {{outroDuration}}s
- Body allocation: 75% of total = {{bodyDuration}}s

Step 3: Distribute body scenes
- Body scenes count: {{totalScenes}} - 2 (intro/outro) = {{bodyScenesCount}}
- Per body scene: {{bodyDuration}} / {{bodyScenesCount}} = {{perBodyDuration}}s
- Adjust for transition time: {{perBodyDuration}} - 0.5s (avg transition)

Step 4: Validate
- Sum all scenes: {{sumDuration}}s
- Target: {{targetDuration}}s
- Variance: {{variance}}%
- IF variance > 5% THEN adjust last body scene
- ELSE proceed

Step 5: Output final scene plan in required JSON schema

Now, execute the reasoning and output the result.
```

### CoT Implementation Rules

1. **Break down explicit steps** — Number each reasoning step
2. **Show intermediate calculations** — So QA Agent can verify
3. **Include validation step** — Self-check before final output
4. **Separate reasoning from output** — Reasoning in comments or chain, final answer in JSON
5. **Use for tasks requiring >3 logical steps**

---

## C.2 Few-Shot Prompting

Used when the model needs examples to understand output format or style.

### Template

```
System:
You are a {{role}}. Follow the examples below to generate your output.

User:
Generate {{outputType}} for the following input.

Input: {{input}}

Here are {{exampleCount}} examples of {{outputType}}:

{{#each examples}}
--- Example {{@index + 1}} ---
Input: {{input}}
Output:
{{output}}
--- End Example ---
{{/each}}

Now generate for this input:
Input: {{input}}

{{#if outputSchema}}
Output in this JSON schema:
{{outputSchema}}
{{/if}}
```

### Dynamic Few-Shot Selection

System selects the most relevant examples from a pool based on embedding similarity:

```typescript
interface FewShotExample {
  id: string;
  input: string;
  output: string;
  embedding: number[];  // text-embedding-3-small
  metadata: {
    agentType: string;
    complexity: "low" | "medium" | "high";
    language: string;
    duration: number;
    tags: string[];
  };
}

async function selectExamples(
  query: string,
  agentType: string,
  maxExamples: number = 3,
  similarityThreshold: number = 0.75
): Promise<FewShotExample[]> {
  const queryEmbedding = await embed(query);
  const pool = await db.query(
    'SELECT * FROM prompt_examples WHERE agent_type = $1',
    [agentType]
  );
  
  return pool
    .map(ex => ({
      ...ex,
      similarity: cosineSimilarity(queryEmbedding, ex.embedding)
    }))
    .filter(ex => ex.similarity >= similarityThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxExamples);
}
```

---

## C.3 Structured Output (JSON Schema)

Every agent output MUST adhere to its JSON Schema. System validates before accepting.

### JSON Schema Enforcement Pattern

```
System:
You MUST output valid JSON matching the schema below.
Do NOT include markdown code blocks, explanations, or any text outside the JSON.
Only output the raw JSON object.

Schema:
{{jsonSchema}}

User:
{{task}}

Output (JSON only):
```

### JSON Schema Example (Script Agent)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["title_suggestions", "hook", "sections", "cta", "total_word_count", "total_duration_seconds"],
  "properties": {
    "title_suggestions": {
      "type": "array",
      "items": { "type": "string", "minLength": 10, "maxLength": 100 },
      "minItems": 5,
      "maxItems": 5
    },
    "hook": {
      "type": "object",
      "required": ["text", "duration_seconds", "type"],
      "properties": {
        "text": { "type": "string", "minLength": 10 },
        "duration_seconds": { "type": "number", "minimum": 5, "maximum": 20 },
        "type": { "type": "string", "enum": ["question", "statistic", "story", "bold_statement", "curiosity_gap"] }
      }
    },
    "sections": {
      "type": "array",
      "items": { "$ref": "#/definitions/ScriptSection" },
      "minItems": 3,
      "maxItems": 20
    },
    "total_word_count": { "type": "integer", "minimum": 100 },
    "total_duration_seconds": { "type": "number", "minimum": 30 }
  },
  "definitions": {
    "ScriptSection": {
      "type": "object",
      "required": ["id", "type", "narration", "word_count", "duration_seconds"],
      "properties": {
        "id": { "type": "integer" },
        "type": { "type": "string", "enum": ["hook", "intro", "body", "outro", "cta"] },
        "narration": { "type": "string", "minLength": 20 },
        "word_count": { "type": "integer", "minimum": 10 },
        "duration_seconds": { "type": "number", "minimum": 5 },
        "voice_direction": { "type": "string" }
      }
    }
  }
}
```

### Validation & Repair

```typescript
function validateAndRepair(output: string, schema: object): ValidationResult {
  try {
    const parsed = JSON.parse(stripNonJson(output));
    const result = ajv.validate(schema, parsed);
    
    if (result) {
      return { valid: true, data: parsed };
    }
    
    // Collect paths of schema violations
    const errors = ajv.errors!.map(e => ({
      path: e.instancePath,
      message: e.message,
      schemaPath: e.schemaPath
    }));
    
    return { valid: false, errors, repairPrompt: buildRepairPrompt(errors, schema) };
  } catch (e) {
    return { valid: false, errors: [{ path: "root", message: "Invalid JSON" }] };
  }
}
```

---

## C.4 Tool/Function Calling Patterns

Used when agents need to execute external actions (web search, database queries, API calls).

### Function Definition Format

```json
{
  "type": "function",
  "function": {
    "name": "web_search",
    "description": "Search the web for information. Returns up to num_results results.",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "The search query string"
        },
        "num_results": {
          "type": "integer",
          "description": "Number of results to return (1-10)",
          "default": 5
        },
        "language": {
          "type": "string",
          "description": "Language code (en, id, etc.)",
          "default": "en"
        }
      },
      "required": ["query"]
    }
  }
}

// Additional tools:
// - web_search: General web search
// - extract_page: Extract text content from a URL
// - get_current_date: Get current date and time
// - semantic_search: Search vector DB for similar content
// - fetch_youtube_analytics: Fetch metrics for a YouTube video
// - check_copyright: Check content against copyright database
```

### Tool Calling Prompt Pattern

```
System:
You have access to the following tools. Use them when you need real-time 
information or need to execute actions. When you want to call a tool, 
respond with a JSON object in the format:
{"tool": "tool_name", "params": { ... }}

Available tools:
{{toolDefinitions}}

Rules:
- Use tools for real-time data only (not for reasoning)
- For reasoning tasks, use Chain-of-Thought (don't call a tool)
- If a tool fails, try once more then fall back
- Never call the same tool more than 3 times in a row
- Cache tool results within the same turn

User:
{{task}}
```

---

## C.5 RAG (Retrieval Augmented Generation) Patterns

Used when context needs to be retrieved from a knowledge base (past projects, user preferences, research data).

### RAG Retrieval Flow

```
User Query
    │
    ▼
Embed Query (text-embedding-3-small)
    │
    ▼
Vector Search (pgvector, cosine similarity)
    │
    ▼
Retrieve Top-K (k = min(maxSegments, contextBudget / avgSegmentTokens))
    │
    ▼
Re-rank by relevance + recency
    │
    ▼
Inject into context window (Context Agent)
    │
    ▼
Construct final prompt
```

### RAG Prompt Template

```
System:
You have access to the following retrieved context. Use it to answer the 
user's task accurately. If the context doesn't contain the answer, say so 
— do not fabricate information.

Retrieved Context:
{{#each retrievedSegments}}
--- Source {{@index + 1}} (relevance: {{relevanceScore}}) ---
{{content}}
--- End Source ---
{{/each}}

Current User Preferences:
{{userPreferences}}

User:
{{task}}
```

### RAG Implementation Rules

1. Always cite sources inline: `[Source: {name}]`
2. Never modify facts from retrieved context
3. If context contradicts user input, flag the contradiction
4. Maximum 5 retrieved segments per prompt
5. Re-rank results: relevance (0.6) + recency (0.3) + source authority (0.1)

---

## C.6 Dynamic Few-Shot Selection

System selects examples based on current task similarity, not random.

### Selection Algorithm

```typescript
interface ExamplePoolEntry {
  id: string;
  input: string;
  output: string;
  embedding: number[];
  metadata: {
    agentType: string;
    duration: number;
    language: string;
    complexityScore: number;
    successRate: number;
    tokenCount: number;
  };
}

async function dynamicFewShotSelection(
  currentTask: { input: string; agentType: string; complexidad: string },
  pool: ExamplePoolEntry[],
  config: { maxExamples: number; minSimilarity: number; maxTokens: number }
): Promise<ExamplePoolEntry[]> {
  const taskEmbedding = await embed(currentTask.input);
  
  // Filter by agent type and complexity
  let candidates = pool.filter(e => 
    e.metadata.agentType === currentTask.agentType &&
    e.metadata.successRate >= 0.8
  );
  
  // Score by similarity
  candidates = candidates.map(e => ({
    ...e,
    score: cosineSimilarity(taskEmbedding, e.embedding)
  }));
  
  // Sort, filter, and limit by token budget
  candidates.sort((a, b) => b.score - a.score);
  candidates = candidates.filter(e => e.score >= config.minSimilarity);
  
  let totalTokens = 0;
  return candidates.filter(e => {
    if (totalTokens + e.metadata.tokenCount <= config.maxTokens && selected.length < config.maxExamples) {
      totalTokens += e.metadata.tokenCount;
      return true;
    }
    return false;
  });
}
```

---

# ═══════════════════════════════════════════════════
# SECTION D: PROMPT MANAGEMENT
# ═══════════════════════════════════════════════════

---

## D.1 Version Control for Prompts

### Prompt Versioning Strategy

```typescript
interface PromptVersionRecord {
  id: string;                    // UUID
  templateId: string;            // FK to prompt_templates
  versionNumber: number;         // Incremental (1, 2, 3...)
  systemPrompt: string;          // Full system prompt text
  userPromptTemplate: string;    // Template with {{variables}}
  patternType: string;           // cot | fewshot | json | tool | rag
  tokenCount: number;            // Calculated on save
  avgCostUsd: number;            // Updated after N runs
  avgLatencyMs: number;
  successRate: number;           // % of outputs passing validation
  createdAt: string;             // ISO 8601
  createdBy: string;             // Engineer name
  status: "active" | "deprecated" | "archived";
  changeLog: string;            // What changed from previous version
  metrics: {
    totalRuns: number;
    totalCostUsd: number;
    avgOutputTokens: number;
    avgInputTokens: number;
    failureReasons: { reason: string; count: number }[];
  };
}
```

### Versioning Workflow

```
1. Engineer creates new prompt version (copy from active)
2. Engineer edits template in staging environment
3. System auto-calculates token count and validates syntax
4. Engineer runs A/B test: active_vs_new (min 100 samples each)
5. If new version wins (statistically significant, p<0.05):
   a. New version status → active
   b. Old version status → deprecated
   c. Route 100% traffic to new version
6. If new version loses: discard or iterate
7. Rollback: set previous version status → active (instant)
```

### Rollback Procedure

```
When failure rate increases >5% in 1 hour:
1. AUTO: Set previous active version → active (rollback)
2. AUTO: Route all traffic to rolled-back version
3. AUTO: Alert Prompt Engineer via Slack
4. MANUAL: Investigate diff between versions
5. MANUAL: Fix and deploy new version with fix notes
```

---

## D.2 A/B Testing Framework

### A/B Test Configuration

```typescript
interface ABTestConfig {
  testId: string;
  name: string;
  agentType: string;
  variantA: { versionId: string; trafficPercent: number };  // Control (current active)
  variantB: { versionId: string; trafficPercent: number };  // Treatment (new)
  metrics: ("successRate" | "avgCost" | "avgLatency" | "avgOutputTokens" | "userSatisfaction")[];
  minSampleSize: number;      // Calculated via power analysis
  currentSampleSize: number;
  significanceLevel: number;   // alpha = 0.05
  startTime: string;
  endTime: string;
  status: "running" | "completed" | "cancelled";
  winnerId: string | null;
}
```

### Sample Size Calculator

```
Minimum Sample Size = (Z_alpha/2 + Z_beta)^2 * (p1*(1-p1) + p2*(1-p2)) / (p2-p1)^2

Where:
- Z_alpha/2 = 1.96 (for 95% confidence)
- Z_beta = 0.84 (for 80% power)
- p1 = current success rate (e.g., 0.90)
- p2 = minimum detectable effect (e.g., 0.93 = 3% improvement)
- Result: ~1,200 samples per variant
```

### A/B Test Execution Flow

```
1. Register A/B test in prompt_monitor table
2. Router assigns 50% of traffic to A, 50% to B (by user_id hash for consistency)
3. Monitor collects per-variant metrics
4. After reaching minSampleSize:
   a. Run statistical significance test (two-proportion z-test)
   b. If p < 0.05: declare winner, auto-promote
   c. If p >= 0.05: extend test (up to max 3x minSampleSize), then declare no winner
5. Store results in prompt_test_results table
6. Update version metrics
```

---

## D.3 Performance Monitoring

### Metrics Per Prompt Invocation

```typescript
interface PromptMetrics {
  invocationId: string;
  versionId: string;
  templateId: string;
  agentType: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  modelUsed: string;
  success: boolean;
  validationPassed: boolean;
  errorType: string | null;
  userSatisfactionScore: number | null;  // 1-5 (optional feedback)
  timestamp: string;
}
```

### Dashboard Queries

```sql
-- Average cost per agent (last 7 days)
SELECT agent_type, AVG(cost_usd) as avg_cost, SUM(cost_usd) as total_cost
FROM prompt_metrics
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY agent_type
ORDER BY total_cost DESC;

-- Success rate by version
SELECT version_id, 
       COUNT(*) as total_runs,
       SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) as success_rate
FROM prompt_metrics
GROUP BY version_id
ORDER BY success_rate DESC;

-- Token waste (outputs that failed validation)
SELECT AVG(output_tokens) as avg_wasted_tokens,
       SUM(output_tokens) as total_wasted_tokens,
       COUNT(*) as failed_count
FROM prompt_metrics
WHERE validation_passed = false
  AND timestamp > NOW() - INTERVAL '24 hours';
```

### Alert Rules

| Metric | Warning | Critical | Action |
|---|---|---|---|
| Success Rate | <90% | <80% | Auto-rollback to previous version |
| Avg Cost Per Call | >2x baseline | >3x baseline | Investigate token leak |
| Avg Latency | >3x baseline | >5x baseline | Check model availability |
| Validation Failure Rate | >10% | >20% | Check schema mismatch |

---

## D.4 Prompt Optimization Workflow

### Optimization Cycle

```mermaid
flowchart LR
    A[Measure Current Metrics] --> B[Identify Bottleneck]
    B --> C{Optimization Type}
    
    C -->|Token Waste| D[Compress Instructions]
    C -->|Low Accuracy| E[Improve CoT Steps]
    C -->|Schema Errors| F[Tighten JSON Schema]
    C -->|High Cost| G[Model Routing Change]
    C -->|Slow Response| H[Reduce Few-shot Count]
    
    D & E & F & G & H --> I[Create New Version]
    I --> J[Run A/B Test]
    J --> K{Significant?}
    K -->|Yes| L[Promote Version]
    K -->|No| M[Analyze & Iterate]
    M --> A
    L --> N[Monitor 48h]
    N --> O{Stable?}
    O -->|Yes| P[Deprecate Old Version]
    O -->|No| Q[Rollback]
    Q --> A
```

### Optimization Techniques

1. **Instruction Compressing**: Replace verbose descriptions with concise directives
   - Before: "Please carefully write a script that includes an attention-grabbing hook at the very beginning..."
   - After: "Write script. Hook in first 15s. CTA at end."

2. **Token Reduction**: Remove redundant examples, merge similar instructions
   - Target: Reduce system prompt by 30% without accuracy loss

3. **Few-shot Pruning**: Test with fewer examples (3 → 2 → 1 → 0)
   - Track accuracy at each level, keep minimum viable

4. **Schema Simplification**: Reduce output JSON complexity
   - Remove optional fields that aren't consumed downstream
   - Flatten nested structures where possible

---

## D.5 Prompt Security

### Injection Prevention

```typescript
function sanitizeUserInput(input: string): string {
  // Strip control characters (except newlines)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Strip potential injection patterns
  const INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|above)\s+instructions/i,
    /forget\s+(all\s+)?(previous|above)\s+(instructions|context)/i,
    /system\s*(prompt|message|instruction)/i,
    /you\s+are\s+(now|not\s+required\s+to)/i,
    /output\s+(raw|only)\s+json/i,
    /disregard/i,
  ];
  
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
      logSecurityEvent('injection_attempt_detected', { pattern: pattern.source });
    }
  }
  
  return sanitized;
}
```

### Output Sanitization

```typescript
function sanitizeOutput(output: string): string {
  // Remove potential PII patterns
  const PII_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,  // Email
    /\b\d{16}\b/,                                                 // Credit card
    /\b\d{3}-\d{2}-\d{4}\b/,                                      // SSN
    /\b(?:\+?62|0)8[1-9][0-9]{6,11}\b/,                           // Indonesian phone
    /\b\d{16,19}\b/,                                               // Generic card numbers
  ];
  
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(output)) {
      output = output.replace(pattern, '[REDACTED]');
      logSecurityEvent('pii_detected_in_output');
    }
  }
  
  return output;
}
```

### Role Isolation

```
System Prompt Isolation:
- User input is NEVER placed in system prompt layer
- System prompt is immutable, loaded from template DB
- User input only appears in user prompt layer (Layer 2)

Context Isolation:
- Context Agent only injects pre-verified context
- Research data is fact-checked before injection
- Memory data is preference-only (no raw user input)

Tool Isolation:
- Tool call results are validated before injection
- Web search results are parsed (no raw HTML)
- API responses are schema-validated
```

---

# ═══════════════════════════════════════════════════
# SECTION E: PROMPT COST OPTIMIZATION
# ═══════════════════════════════════════════════════

---

## E.1 Token Counting and Budgeting

### Per-Model Token Costs (2026)

| Model | Input (per 1K tokens) | Output (per 1K tokens) | Context Window |
|---|---|---|---|
| GPT-5o | $0.0025 | $0.010 | 128K |
| GPT-4o | $0.005 | $0.015 | 128K |
| Claude 4 Sonnet | $0.003 | $0.015 | 200K |
| GPT-4o-mini | $0.00015 | $0.0006 | 128K |
| Claude 4 Haiku | $0.00025 | $0.00125 | 200K |

### Token Budget Per Agent

| Agent | Avg Input Tokens | Avg Output Tokens | Recommended Model | Est Cost/Call |
|---|---|---|---|---|
| Master | 4,000 | 800 | GPT-5o | $0.018 |
| Research | 2,000 | 6,000 | GPT-5o | $0.065 |
| Planner | 3,000 | 1,500 | GPT-4o-mini | $0.001 |
| Fact Checker | 6,000 | 2,000 | GPT-5o | $0.035 |
| Script | 8,000 | 5,000 | GPT-5o | $0.070 |
| Storyboard | 5,000 | 3,000 | GPT-4o | $0.070 |
| Image | 2,000 | 500 | GPT-4o-mini | $0.001 |
| Voice | 2,000 | 1,000 | GPT-4o-mini | $0.001 |
| Subtitle | 3,000 | 2,000 | GPT-4o-mini | $0.002 |
| Animation | 2,000 | 1,000 | GPT-4o-mini | $0.001 |
| Composer | 3,000 | 1,000 | GPT-4o-mini | $0.001 |
| Thumbnail | 1,000 | 500 | GPT-4o-mini | $0.001 |
| SEO | 4,000 | 3,000 | GPT-4o | $0.065 |
| Publishing | 1,000 | 200 | GPT-4o-mini | $0.001 |
| Analytics | 2,000 | 1,500 | GPT-4o-mini | $0.001 |
| Memory | 3,000 | 1,000 | GPT-4o-mini | $0.001 |
| Context | 1,000 | 500 | GPT-4o-mini | $0.001 |
| QA | 4,000 | 1,000 | GPT-4o-mini | $0.001 |
| Moderator | 3,000 | 1,000 | GPT-4o-mini | $0.001 |

**Total estimated cost per pipeline: ~$0.34** (using recommended model routing)

---

## E.2 Prompt Compression Techniques

### Compression Strategies

```typescript
interface CompressionResult {
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  compressedPrompt: string;
}

function compressPrompt(prompt: string, strategy: string): CompressionResult {
  switch (strategy) {
    case "remove_whitespace":
      return removeExcessWhitespace(prompt);
    case "shorten_instructions":
      return shortenVerbatimInstructions(prompt);
    case "merge_context":
      return mergeAdjacentContext(prompt);
    case "abbreviate_labels":
      return abbreviateFieldLabels(prompt);
    case "aggressive":
      return aggressiveCompression(prompt);
    default:
      return { originalTokens: 0, compressedTokens: 0, compressionRatio: 0, compressedPrompt: prompt };
  }
}
```

### Compression Examples

```
Original (200 tokens):
"You are a professional YouTube script writer. You write engaging scripts
that keep viewers watching until the end. Your scripts should include a 
hook at the beginning that grabs attention within the first 15 seconds."

Compressed (90 tokens — 55% reduction):
"You are a YouTube script writer. Write engaging scripts with retention.
Include a hook in the first 15 seconds."

Original (150 tokens):
"For each scene you generate, you must include the following fields:
scene_id, type, duration, narrative_segment, visual_description, mood,
character_present, requires_image_gen, transition_in, transition_out,
and keyframe_keywords. Make sure every field is populated."

Compressed (50 tokens — 67% reduction):
"Each scene requires: id, type, duration, narrative, visual, mood,
character_present, needs_image, transition_in/out, keyframe_keywords."
```

### Auto-Compression Trigger

```
IF prompt_tokens > userPromptMax * 0.9 THEN
  try_strategies = ["shorten_instructions", "merge_context", "abbreviate_labels"]
  FOR EACH strategy IN try_strategies:
    result = compressPrompt(prompt, strategy)
    IF result.compressedTokens <= userPromptMax * 0.9 THEN
      use result.compressedPrompt
      BREAK
    END IF
  END FOR
  IF still over budget THEN
    use "aggressive" compression
  END IF
END IF
```

---

## E.3 Caching Strategy

### Cache Levels

| Level | Cache Key | TTL | Hit Rate Target | Storage |
|---|---|---|---|---|
| L1 — Prompt Construction | hash(systemPrompt + userPromptTemplate + contextHash) | 1 hour | 20% | Redis |
| L2 — LLM Response | hash(fullPrompt + model + temperature) | 24 hours | 10% | Redis |
| L3 — Research Data | hash(topic + language) | 7 days | 15% | PostgreSQL |
| L4 — Image Gen Prompt | hash(sceneDescription + style) | 30 days | 5% | PostgreSQL |

### Cache Key Generation

```typescript
function cacheKeyForPrompt(prompt: PromptPackage): string {
  const key = SHA256(`
    system:${prompt.systemPrompt}
    user:${prompt.userPrompt}
    context:${prompt.contextHash}
    schema:${JSON.stringify(prompt.outputSchema)}
    model:${prompt.model}
    temp:${prompt.temperature}
  `);
  return `prompt:cache:${key}`;
}

async function getCachedResponse(key: string): Promise<string | null> {
  const cached = await redis.get(key);
  if (cached) {
    incrementCacheHit(key);
    return cached;
  }
  incrementCacheMiss(key);
  return null;
}
```

### Cost Savings Calculation

```
Monthly Pipeline Projections (10,000 videos/month):
├── Without caching: 10,000 × $0.34 = $3,400/month
├── With L1+L2 caching (30% hit rate):
│   ├── 7,000 uncached pipelines = $2,380
│   ├── 3,000 cached pipelines = $0 (response retrieval only)
│   └── Total = $2,380/month
└── Savings: $1,020/month (30%)
```

---

## E.4 Model Routing Strategy

### Routing Rules

```typescript
interface ModelRoute {
  agentType: string;
  primaryModel: string;
  fallbackModel: string;
  complexityThreshold: "low" | "medium" | "high";
  maxCostPerCall: number;
}

const MODEL_ROUTES: ModelRoute[] = [
  // Complex reasoning → expensive model
  { agentType: "master", primaryModel: "gpt-5o", fallbackModel: "gpt-4o", complexityThreshold: "high", maxCostPerCall: 0.05 },
  { agentType: "research", primaryModel: "gpt-5o", fallbackModel: "gpt-4o", complexityThreshold: "high", maxCostPerCall: 0.10 },
  { agentType: "script", primaryModel: "gpt-5o", fallbackModel: "gpt-4o", complexityThreshold: "high", maxCostPerCall: 0.15 },
  
  // Medium complexity → mid-range model
  { agentType: "storyboard", primaryModel: "gpt-4o", fallbackModel: "gpt-4o-mini", complexityThreshold: "medium", maxCostPerCall: 0.08 },
  { agentType: "seo", primaryModel: "gpt-4o", fallbackModel: "gpt-4o-mini", complexityThreshold: "medium", maxCostPerCall: 0.08 },
  { agentType: "fact_checker", primaryModel: "gpt-5o", fallbackModel: "gpt-4o", complexityThreshold: "high", maxCostPerCall: 0.08 },
  
  // Simple tasks → cheap model
  { agentType: "planner", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "image", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "voice", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "animation", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "composer", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "thumbnail", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "publishing", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "analytics", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "memory", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "context", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "qa", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
  { agentType: "moderator", primaryModel: "gpt-4o-mini", fallbackModel: "gpt-4o-mini", complexityThreshold: "low", maxCostPerCall: 0.005 },
];

function selectModel(agentType: string, complexity: string): string {
  const route = MODEL_ROUTES.find(r => r.agentType === agentType);
  if (!route) return "gpt-4o-mini"; // Default cheap model
  
  // Upgrade model if task is more complex than threshold
  if (complexity === "high") return "gpt-5o";
  if (complexity === "medium" && route.primaryModel === "gpt-4o-mini") return "gpt-4o";
  
  return route.primaryModel;
}
```

### Fallback Chain

```
Primary → Fallback → Emergency Fallback

gpt-5o → gpt-4o → gpt-4o-mini
gpt-4o → gpt-4o-mini → claude-4-haiku
gpt-4o-mini → claude-4-haiku → (retry after 30s)
```

### Cost-Aware Routing

```
IF daily_cost > dailyBudget * 0.8 THEN  // 80% of daily budget used
  downgrade all remaining calls:
    gpt-5o → gpt-4o    (saves 50%)
    gpt-4o → gpt-4o-mini (saves 97%)
  Log: "Budget threshold reached. Downgraded model routing."
END IF

IF retry_count > 2 THEN
  Use gpt-4o-mini for retry (regardless of original model)
  Log: "Retry exhausted. Using cheapest model."
END IF
```

---

# ═══════════════════════════════════════════════════
# APPENDIX: TOOL DEFINITIONS
# ═══════════════════════════════════════════════════

## Available Tools for Agents

```json
[
  {
    "name": "web_search",
    "description": "Search the web for current information",
    "parameters": {
      "query": "string",
      "num_results": { "type": "integer", "default": 5 },
      "language": { "type": "string", "default": "en" }
    }
  },
  {
    "name": "extract_page",
    "description": "Extract readable content from a URL",
    "parameters": { "url": "string" }
  },
  {
    "name": "get_current_datetime",
    "description": "Get current date and time",
    "parameters": {}
  },
  {
    "name": "semantic_search",
    "description": "Search vector database for similar content",
    "parameters": {
      "query": "string",
      "collection": { "type": "string", "enum": ["past_projects", "user_preferences", "fact_database"] },
      "limit": { "type": "integer", "default": 5 }
    }
  },
  {
    "name": "check_copyright",
    "description": "Check content against copyright database",
    "parameters": {
      "content_type": { "type": "string", "enum": ["text", "image", "audio", "video"] },
      "content_hash": "string",
      "source_url": { "type": "string", "optional": true }
    }
  }
]
```

---

> **End of Prompt Engineering Document** — Vidara AI © 2026
