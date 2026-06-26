# Laporan Riset Teknologi AI Video Generation 2026

> **Tanggal:** 26 Juni 2026
> **Tujuan:** Evaluasi teknologi untuk pipeline AI video generation end-to-end

---

## 1. AI Video Generation Models — State of the Art 2026

### 1.1 OpenAI Sora 2

| Metrik | Detail |
|---|---|
| **Kualitas** | Terbaik di kelas untuk realisme fisika, konsistensi karakter, audio tersinkronasi |
| **Resolusi Maks** | 1080p (Pro), 720p (Standard) |
| **Durasi Maks** | 25 detik (Pro), 12 detik (Standard) |
| **API Pricing** | Standard $0.10/detik, Pro $0.30-0.50/detik |
| **Subscription** | Plus $20/bln (50 kredit), Pro $200/bln (500 kredit) |
| **Biaya 10 detik** | ~$1.00 (Standard), ~$5.00 (Pro 1080p) |
| **Kelebihan** | Native audio generation, image-to-video, physics simulation, cameo feature |
| **Kekurangan** | Mahal, durasi pendek, US/Canada only (awalnya), GPU scarcity |

**Sumber:** OpenAI direct API $0.10/s (Standard), $0.30-0.50/s (Pro). Free tier dihentikan Jan 2026. Biaya operasional OpenAI ~$1 juta/hari untuk Sora.

### 1.2 Runway Gen-4 / Gen-4.5

| Metrik | Detail |
|---|---|
| **Kualitas** | 4K output, motion brush, director mode, temporal consistency |
| **Gen-4.5 Elo Score** | 1,247 (ungguli Veo 3 dan Sora 2 Pro di blind test) |
| **Durasi Maks** | ~60 detik (Gen-4.5) |
| **API Pricing** | $0.12/detik, 10s clip ~$1.20 |
| **Subscription** | Free (125 kredit sekali), Standard $15/bln, Pro $35/bln, Unlimited $76/bln |
| **Kredit** | ~10-15 kredit/detik (Gen-4), ~25-40 kredit/detik (Turbo/4K) |
| **Kelebihan** | 4K output, motion brush, Act-One/Two motion capture, Aleph in-video editor, character consistency |
| **Kekurangan** | Render time 2-5 menit/clip, credit burn tinggi, character drift >30s |

### 1.3 Stable Video Diffusion (SVD)

| Metrik | Detail |
|---|---|
| **Kualitas** | Open-source, 14-25 frame, 576x1024 resolution |
| **Biaya** | Gratis (open source, self-host), Professional $20/bln (API) |
| **Kelebihan** | Free, self-host, customizable frame rate 3-30fps, fast processing <2 menit |
| **Kekurangan** | Output pendek (2-4 detik), kualitas di bawah Sora/Runway, research-grade |

### 1.4 Perbandingan Video Models

| Model | API Cost/detik | Max Durasi | Resolusi | Kualitas | Hosting |
|---|---|---|---|---|---|
| Sora 2 Standard | $0.10 | 12s | 720p | ★★★★★ | Cloud only |
| Sora 2 Pro | $0.30-0.50 | 25s | 1080p | ★★★★★ | Cloud only |
| Runway Gen-4 | ~$0.12 | 60s | 4K | ★★★★☆ | Cloud only |
| Runway Gen-4.5 | ~$0.20-0.30 | 60s | 4K | ★★★★★ | Cloud only |
| Stable Video Diffusion | Gratis (self-host) | 2-4s | 576x1024 | ★★★☆☆ | Self-host |
| Kling 2.0 | ~$0.07 | 10s | 1080p | ★★★★☆ | Cloud |
| Veo 3.1 | ~$0.15 | 60s | 4K | ★★★★☆ | Cloud |

### 1.5 Rekomendasi

- **Cinematic/production quality:** Runway Gen-4.5 (best value) atau Sora 2 Pro (best quality)
- **High-volume social content:** Sora 2 Standard $0.10/s
- **Self-hosted/custom pipeline:** Stable Video Diffusion (gratis tapi kualitas terbatas)
- **API untuk pipeline otomatis:** Runway API ($0.12/s) paling mature untuk production

---

## 2. Text-to-Speech (TTS)

### 2.1 Perbandingan Harga TTS API (per 1M karakter)

| Provider | Model | Harga/1M chars | Kualitas | Latency | Voice Cloning |
|---|---|---|---|---|---|
| **OpenAI** | tts-1 | $15.00 | ★★★★☆ | ~500ms | Tidak |
| **Azure** | Neural Standard | $14.11 | ★★★★☆ | ~300ms | Ya (custom $5K+) |
| **ElevenLabs** | Turbo v2.5 | $66.00 | ★★★★★ | ~200ms | Ya (include) |
| **ElevenLabs** | Multilingual v2 | $66.00 | ★★★★★ | ~300ms | Ya |
| **Cartesia** | Sonic | $50.00 | ★★★★★ | <100ms | Tidak |
| **Deepgram** | Aura | $45.00 | ★★★★☆ | <300ms | Tidak |
| **Google** | Chirp 3 | $32.00 | ★★★★☆ | ~200ms | Ya (premium) |
| **Amazon** | Polly Generative | $4.00 | ★★★☆☆ | ~400ms | Tidak |

### 2.2 ElevenLabs Detail

| Plan | Harga/bulan | Karakter | Fitur |
|---|---|---|---|
| Free | $0 | 10K chars | Basic voices |
| Starter | $6 | 30K chars | 1 voice clone |
| Creator | $22 | 100K chars | Instant voice clone |
| Pro | $99 | 500K chars | 30 voices |
| Scale | $299 | 2M chars | Professional clone |
| Business | $990 | 11M chars | Custom models |

- **Kualitas suara:** Mean Opinion Score (MOS) 4.14 — tertinggi di industri
- **Latency Flash model:** 75ms untuk real-time
- **74 languages** dengan emotional depth
- **1,200+ voices** di library

### 2.3 Deepgram Aura TTS

- Pricing: $0.075/menit (Standard), $0.065/menit (BYO TTS)
- Terintegrasi dengan Deepgram STT untuk voice agent end-to-end
- Latency <300ms dengan WebSocket streaming

### 2.4 Rekomendasi

- **Best quality:** ElevenLabs Turbo v2.5 (voice cloning included)
- **Best latency:** Cartesia Sonic (<100ms first-byte)
- **Best value:** OpenAI tts-1 ($15/1M chars) atau Azure Neural ($14.11/1M chars)
- **Untuk pipeline video:** ElevenLabs (kualitas terbaik untuk narasi) atau Deepgram Aura (jika sudah pakai Deepgram STT)

---

## 3. Speech-to-Text (STT)

### 3.1 Perbandingan Akurasi (WER — Word Error Rate)

| Model | WER | Catatan |
|---|---|---|
| AssemblyAI Universal-2 | 4.5% | Terbaik di kelas hosted |
| Deepgram Nova-3 (batch) | 4.8% | 5.26% di real-world test |
| Whisper large-v3 (self-host) | 5.2% | Open source |
| OpenAI Whisper API (whisper-1) | 6.1% | Model medium lawas |
| NVIDIA Canary Qwen 2.5B | 5.63% | Open ASR Leaderboard top |

### 3.2 Perbandingan Latency

| API | Streaming | First-word Latency | Use Case |
|---|---|---|---|
| Deepgram | Native | ~300ms | Live captions, voice agents |
| AssemblyAI | Native | ~500ms | Live with metadata |
| OpenAI Whisper API | Batch only | N/A | Async transcription |
| Self-host Whisper | With effort | ~700ms | Custom voice apps |
| ElevenLabs Scribe v2 | Native | ~150ms | 30 languages real-time |

### 3.3 Perbandingan Harga

| Volume/bulan | OpenAI | Deepgram | AssemblyAI | Self-host |
|---|---|---|---|---|
| 10 jam | $3.60 | $2.58 | $6.12 | $40 (fixed) |
| 100 jam | $36 | $25.80 | $61.20 | $40 (fixed) |
| 1,000 jam | $360 | $258 | $612 | $80-200 |
| 10,000 jam | $3,600 | $2,580 | $6,120 | $500-1,500 |

### 3.4 Detail Provider

| Fitur | Deepgram | AssemblyAI | Whisper |
|---|---|---|---|
| Max file size | 2 GB | 5 GB | 25 MB (API) |
| Diarization | Ya (extra cost) | Ya (built-in) | Tidak (via pyannote) |
| Custom vocabulary | Ya | Ya | Tidak |
| Languages | 45+ | 99+ (Universal-2) | 57+ |
| Real-time streaming | Ya | Ya | Tidak |

### 3.5 Rekomendasi

- **Voice agent real-time:** Deepgram Nova-3 + Flux (sub-300ms, $0.0043-0.0077/min)
- **Akurasi tertinggi:** AssemblyAI Universal-2 (4.5% WER)
- **Budget maksimal:** Self-host Whisper (gratis, GPU bill only)
- **Multilingual real-time:** ElevenLabs Scribe v2 (150ms, 30 languages)
- **Batch transkripsi volume besar:** Deepgram ($258/1K jam)

---

## 4. Image Generation

### 4.1 API Pricing (per image)

| Provider | Model | Cost/Image | Kualitas |
|---|---|---|---|
| **OpenAI** | GPT Image 1.5 | $0.040-0.100 | ★★★★★ (Elo 1,264) |
| **OpenAI** | GPT Image 1 Mini | $0.005 | ★★★☆☆ |
| **Google** | Imagen 4 Fast | $0.010 | ★★★★☆ |
| **Google** | Imagen 4 Standard | $0.040 | ★★★★★ |
| **Black Forest Labs** | Flux 2 Pro | $0.050 | ★★★★★ (Elo 1,265) |
| **Black Forest Labs** | Flux 2 Dev | $0.025 | ★★★★☆ |
| **Black Forest Labs** | Flux 2 Schnell | $0.003 | ★★★☆☆ |
| **Stability AI** | SDXL Turbo | $0.005 | ★★★☆☆ |
| **Stability AI** | SD 3.5 Large | $0.065 | ★★★★☆ |
| **Midjourney** | v6 API | $0.167 | ★★★★★ |
| **Ideogram** | 3.0 | $0.080 | ★★★★☆ |

### 4.2 Subscription Pricing

| Platform | Entry Price | API Access | Local Deployment |
|---|---|---|---|
| DALL-E (via ChatGPT) | $20/bln | Ya | Tidak |
| Midjourney Basic | $10/bln | Tidak (limited) | Tidak |
| Stable Diffusion | Gratis | Ya (via platform) | Ya (self-host) |
| Flux | Gratis (open weights) | Ya | Ya (self-host) |

### 4.3 Perbandingan Kualitas

| Aspek | Pemenang |
|---|---|
| **Photorealism** | Flux 2 Pro / GPT Image 1.5 (tie) |
| **Artistic stylization** | Midjourney |
| **Text in images** | Ideogram 3.0 / DALL-E |
| **Prompt adherence** | GPT Image 1.5 |
| **Speed** | Flux Schnell (<1s) / Imagen 4 Fast |
| **Customization** | Stable Diffusion (LoRA, ControlNet) |
| **Best value** | Imagen 4 Fast ($0.010) / Flux Schnell ($0.003) |

### 4.4 Rekomendasi

- **Premium quality:** GPT Image 1.5 ($0.04-0.10) atau Flux 2 Pro ($0.05)
- **High-volume budget:** GPT Image 1 Mini ($0.005) atau Flux Schnell ($0.003)
- **Self-hosted open source:** Stable Diffusion 3.5 atau Flux Dev (gratis)
- **Text in image:** Ideogram 3.0 atau GPT Image 1.5
- **Photorealistic product shots:** Flux 2 Pro

---

## 5. Video Rendering & Processing

### 5.1 FFmpeg — GPU Hardware Acceleration

| Hardware | Encoder | Decoder | Kecepatan vs CPU |
|---|---|---|---|
| **NVIDIA NVENC/NVDEC** | `h264_nvenc`, `hevc_nvenc`, `av1_nvenc` | CUDA hwaccel | 5-10x lebih cepat |
| **Intel QuickSync (QSV)** | `h264_qsv`, `hevc_qsv` | `hwaccel qsv` | 3-5x lebih cepat |
| **AMD AMF** | `h264_amf`, `hevc_amf` | AMF hwaccel | 3-5x lebih cepat |
| **Apple VideoToolbox** | `h264_videotoolbox` | VT hwaccel | 3-4x lebih cepat |

### 5.2 Optimasi FFmpeg

```bash
# NVIDIA GPU-accelerated encoding (H.264)
ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -preset p5 \
  -rc vbr -cq 23 -b:v 5M -maxrate 7M -bufsize 10M output.mp4

# NVIDIA GPU-accelerated encoding (HEVC)
ffmpeg -hwaccel cuda -i input.mp4 -c:v hevc_nvenc -preset p5 \
  -rc vbr -cq 23 -b:v 3M -maxrate 5M -bufsize 8M output.mp4

# AV1 encoding with NVENC (Ada Lovelace+)
ffmpeg -hwaccel cuda -i input.mp4 -c:v av1_nvenc -preset p5 \
  -rc vbr -b:v 2M -maxrate 4M output.mp4
```

### 5.3 GPU-Accelerated Filters (CUDA)

- `scale_cuda` — Resolusi scaling di GPU (tanpa CPU transfer)
- `overlay_cuda` — Overlay di GPU
- `yadif_cuda` — Deinterlacing
- Zero-copy pipeline: decode → filter → encode tetap di GPU

### 5.4 NVENC Session Limits

| GPU Generation | Max Parallel Encodes |
|---|---|
| Consumer (RTX 4090) | 3 sessions |
| Ada Lovelace | 3 sessions |
| Blackwell (RTX 5090) | 3-5 sessions |
| Professional (RTX 6000 Ada) | Unlimited |
| Data Center (A100, H100) | Unlimited |

### 5.5 Pendekatan Pipeline

1. **Concat pipeline:** Generate clip → FFmpeg concat → final render
2. **Parallel encoding:** Multiple NVENC streams untuk batch processing
3. **Adaptive bitrate:** Multiple renditions (1080p, 720p, 480p) dengan satu pass

### 5.6 Rekomendasi

- **GPU dengan NVENC** sangat direkomendasikan untuk video pipeline
- **H.264** untuk kompatibilitas maksimal, **HEVC** untuk kualitas/bandwidth, **AV1** untuk streaming
- **CUDA hwaccel** + `h264_nvenc` adalah workflow standar untuk AI video pipeline
- Untuk batch rendering besar, gunakan A100/H100 atau multi-GPU setup

---

## 6. Queue & Event Architecture

### 6.1 Perbandingan Queue Systems

| Fitur | **BullMQ** | **RabbitMQ** | **Kafka** | **Redis Streams** |
|---|---|---|---|---|
| **Type** | Job Queue | Message Broker | Event Stream | Stream |
| **Bahasa** | Node.js (TypeScript) | Polyglot (AMQP) | Polyglot | Polyglot |
| **Throughput** | Medium | High (~10K/s) | Extremely High (~1M/s) | High |
| **Latency** | <1ms | 1-5ms | 2-10ms | <1ms |
| **Persistence** | Redis (RDB/AOF) | Disk-based | Disk-based | Memory + AOF |
| **Complexity** | Low | Medium | High | Low |
| **Job lifecycle** | Built-in (delay, repeat, retry) | Via plugins | No (manual) | No (manual) |
| **Rate limiting** | Built-in | Manual | Manual | Manual |
| **Event replay** | No | No | Yes | Partial |
| **Scaling** | Vertical | Vertical + cluster | Horizontal | Vertical |

### 6.2 Use Case Mapping

| Use Case | Recommended Queue | Alasan |
|---|---|---|
| **Background job processing** (Node.js) | **BullMQ** | Fitur job lifecycle lengkap, rate limiting |
| **Microservices communication** | **RabbitMQ** | Flexible routing (direct, topic, fanout) |
| **Event sourcing / audit log** | **Kafka** | Replayable log, immutable, high throughput |
| **Real-time analytics** | **Kafka** | 1M+ msg/sec, partitioning |
| **Leaderboards / rate limiting** | **Redis** | In-memory data structures |
| **Simple async processing** | **BullMQ** | Setup minimal dengan Redis |

### 6.3 Pattern: Hybrid Architecture

Untuk AI video generation pipeline, rekomendasi arsitektur hybrid:

```
[Producer] → BullMQ (job queue) → [Worker] → RabbitMQ/Kafka (event bus) → [Services]
```

- **BullMQ** untuk job queue (video generation tasks, retries, scheduling)
- **Kafka** atau **RabbitMQ** untuk cross-service event communication
- **Redis** untuk caching, rate limiting, dan state management

### 6.4 Rekomendasi untuk AI Video Pipeline

- **BullMQ** — Pilihan utama untuk Node.js job queue. Fitur: delayed jobs, repeatable, rate limiting, job lifecycle tracking.
- **Kafka** — Jika perlu event sourcing, replay, high throughput analytics
- **RabbitMQ** — Jika sudah ada infrastruktur AMQP atau perlu polyglot services
- **Redis Streams** — Untuk lightweight event processing

---

## 7. Orchestration Framework

### 7.1 Perbandingan Framework

| Fitur | **Temporal** | **LangChain/LangGraph** | **CrewAI** | **AutoGen** |
|---|---|---|---|---|
| **Filosofi** | Durable execution | Graph-based workflow | Role-based agents | Conversational agents |
| **Bahasa** | Python, Go, Java, TS | Python, TypeScript | Python | Python (.NET preview) |
| **Multi-agent** | Via SDK | Partial (LangGraph) | Native | Native |
| **Durable execution** | Yes (built-in) | Checkpointing (manual) | No | No |
| **Human-in-loop** | Native (Signals) | Manual | Manual | Built-in |
| **State management** | Automatic | Manual (checkpoint) | Via @persist() | Manual |
| **Retries** | Automatic | Manual chains | Manual | Manual |
| **Observability** | Web UI, OpenTelemetry | LangSmith | Limited | Limited |
| **Production maturity** | Sangat matang | Matang | Cukup | Tinggi (v0.4) |
| **GitHub stars** | 15K+ | 95K+ | 35K+ | 40K+ |
| **Best untuk** | Mission-critical pipelines | Flexible LLM pipelines | Rapid prototyping | Research |

### 7.2 Temporal untuk AI Video Pipeline

**Kelebihan Temporal:**
- **Durable execution:** Workflow survive dari crash, restart, failures
- **Retry otomatis:** LLM calls, GPU job failures, API timeouts
- **Human-in-the-loop:** Approvals, review gates dengan Signals
- **Stateful long-running:** Workflow bisa berjalan berjam-jam/hari
- **Observability:** Web UI untuk tracking setiap step pipeline
- **Task Queues:** Pisahkan GPU-heavy tasks dari CPU tasks

**Pattern untuk AI Video Pipeline:**
```
1. User submit request → Temporal Workflow starts
2. Generate script (LLM activity) → retry jika gagal
3. Generate storyboard (Image activity) → parallel
4. Generate voiceover (TTS activity) → parallel
5. Generate video clips (Video activity) → parallel, GPU queue
6. Compose final video (FFmpeg activity) → GPU queue
7. Upload & notify user (Callback activity)
```

### 7.3 Rekomendasi

- **Production mission-critical pipeline:** **Temporal** — durable execution, retries, observability
- **LLM-heavy pipeline dengan tools:** **LangChain/LangGraph** — flexible, extensive integrations
- **Rapid multi-agent prototyping:** **CrewAI** — simplest setup, role-based
- **Temporal + LangGraph** — Arsitektur two-layer untuk production (Temporal untuk durability, LangGraph untuk agent logic)

---

## 8. Cloud GPU Pricing

### 8.1 Perbandingan GPU Hourly Rate (Serverless)

| Provider | T4 | L4 | A10G | A100 80GB | H100 80GB | H200 |
|---|---|---|---|---|---|---|
| **RunPod** (Secure) | $0.19 | $0.43 | $0.69 | $2.17 | $3.35 | $3.99 |
| **RunPod** (Community/Spot) | — | — | — | $1.19-1.64 | $1.99-2.69 | $3.59 |
| **Modal** | — | $0.80 | — | $2.10 | $3.95 | — |
| **Fal.ai** | — | — | — | $0.99 | $1.89 | — |
| **Baseten** | $0.63 | $1.21 | $1.21 | $4.00 | $6.50 | — |
| **Replicate** | $0.225 | — | $1.23 | $5.04 | — | — |
| **Lambda Cloud** | — | — | — | $1.99 | $2.99 | — |
| **CoreWeave** | — | — | — | $2.70 | $4.50 | — |

### 8.2 Serverless GPU Pricing (per detik)

| Provider | H100 Rate/detik | Cold Start | Best Untuk |
|---|---|---|---|
| **Fal.ai** | $0.00050 | 1-3s | Image gen, fast APIs |
| **RunPod Serverless** | $0.00069 | 2-8s | Custom models, PyTorch |
| **Modal** | $0.00090 | 1-4s | Python-native workflows |
| **Replicate** | $0.00115 | 5-30s | Pre-built models |
| **Baseten** | ~$0.00180 | 2-5s | Production serving |

### 8.3 RunPod Detail (Paling Kompetitif)

| GPU | Spot/jam | On-Demand/jam | VRAM | Ideal Untuk |
|---|---|---|---|---|
| RTX 3090 | $0.22 | $0.39 | 24GB | Prototyping, inference 7-13B |
| RTX 4090 | $0.34 | $0.69 | 24GB | Inference, fine-tuning ringan |
| RTX 5090 | $0.69 | $1.22 | 32GB | Inference cepat |
| L4 | $0.44 | $0.78 | 24GB | General purpose |
| L40S | $0.79 | $1.40 | 48GB | Video generation |
| A100 PCIe | $1.19 | $2.10 | 80GB | Training berat |
| A100 SXM | $1.39 | $2.45 | 80GB | Training, inference besar |
| H100 PCIe | $1.99 | $3.51 | 80GB | Model besar, video generation |
| H100 SXM | $2.69 | $4.76 | 80GB | Training premium, video HD |
| H200 | $3.59 | $6.35 | 141GB | Model frontier |
| B200 | $5.98 | $10.57 | 192GB | Enterprise max |

### 8.4 Kapan Serverless vs Dedicated GPU

| Workload | Serverless | Dedicated (Pod) |
|---|---|---|
| Bursty inference (<30 GPU-s/job) | ✅ Lebih murah | ❌ |
| Sustained training (>30 GPU-s/job) | ❌ | ✅ Lebih murah |
| Real-time serving | ✅ (with warm pool) | ✅ |
| Batch processing | ✅ (auto-scale) | ✅ (more stable) |
| Development/experimentation | ✅ (scale to zero) | ✅ (always on) |

### 8.5 Rekomendasi

- **Budget maksimal / prototyping:** RunPod Community Cloud (spot) — RTX 3090 $0.22/jam
- **Video generation production:** Fal.ai ($0.0005/s H100) atau RunPod Serverless ($0.00069/s H100)
- **Training model:** Lambda Cloud A100 $1.99/jam atau RunPod A100 $1.19/jam (spot)
- **Production inference:** Modal (best developer experience) atau Fal.ai (best price)
- **High-volume enterprise:** CoreWeave (Kubernetes-native, reserved pricing)

---

## Ringkasan Rekomendasi Arsitektur End-to-End

### Stack Rekomendasi untuk AI Video Generator Pipeline

| Layer | Technology | Biaya Estimasi |
|---|---|---|
| **Orchestration** | Temporal | Free (self-host) / Cloud $10-50/bln |
| **Queue** | BullMQ (Redis) | $0-50/bln (Redis) |
| **Image Generation** | Flux 2 Pro / Imagen 4 Fast | $0.01-0.05/image |
| **Video Generation** | Runway Gen-4.5 API | $0.12-0.30/detik |
| **TTS** | ElevenLabs Turbo v2.5 | $66/1M chars (~$0.02/menit) |
| **STT** | Deepgram Nova-3 | $0.0043-0.0077/menit |
| **Video Rendering** | FFmpeg + NVENC | Free (GPU already running) |
| **GPU Compute** | RunPod / Fal.ai | $0.69-3.35/jam (H100) |
| **Storage** | S3-compatible (Backblaze B2 / AWS S3) | $0.006/GB/bulan |

### Estimasi Biaya per Video 30 Detik

| Komponen | Biaya |
|---|---|
| Script generation (LLM) | ~$0.02 |
| Storyboard (3 images × Flux Pro) | ~$0.15 |
| Video generation (30s × Runway) | ~$3.60 |
| Voiceover (30s TTS ElevenLabs) | ~$0.01 |
| Rendering & assembly (FFmpeg) | ~$0.05 |
| **Total per video** | **~$3.83** |

### Optimasi Biaya

| Strategi | Penghematan |
|---|---|
| Batch processing multiple clips | 20-40% |
| Spot/community GPU instances | 30-60% |
| Serverless GPU (scale-to-zero) | 50-90% (for bursty) |
| Self-host Whisper STT | 90%+ (at scale) |
| Open source models (Flux/SD) | 50-80% |
| Caching generated assets | Varies |
| Compression (HEVC/AV1 vs H.264) | 30-50% bandwidth/storage |

---

> **Disclaimer:** Harga dapat berubah. Semua data diverifikasi per Juni 2026 dari sumber resmi masing-masing provider. Untuk production, selalu verifikasi pricing terkini langsung dari vendor.
