// ElevenLabs Text-to-Speech

interface TtsOptions {
  text: string
  voiceId?: string
  stability?: number
  similarityBoost?: number
}

interface TtsResult {
  audioBuffer: Buffer
  durationSecs: number
  charsUsed: number
}

export async function generateSpeech(opts: TtsOptions): Promise<TtsResult> {
  const config = useRuntimeConfig()
  const apiKey = config.elevenlabsApiKey as string
  if (!apiKey) {
    return mockTts(opts.text)
  }

  const voiceId = opts.voiceId || '21m00Tcm4TlvDq8ikWAM' // Rachel — English
  // Indonesian voice: 'D3M8E6d5vR7dVqQgVb2j' (Bella) — has ID support
  const idVoiceId = 'D3M8E6d5vR7dVqQgVb2j'

  const res = await $fetch<any>(
    `https://api.elevenlabs.io/v1/text-to-speech/${idVoiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: {
        text: opts.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: opts.stability ?? 0.35,
          similarity_boost: opts.similarityBoost ?? 0.75,
        },
      },
      responseType: 'arrayBuffer',
      timeout: 60000,
    },
  )

  const audioBuffer = Buffer.from(res)
  const durationSecs = estimateDuration(audioBuffer)
  const charsUsed = opts.text.length

  return { audioBuffer, durationSecs, charsUsed }
}

function estimateDuration(buffer: Buffer): number {
  // Rough estimate: ~15 chars/sec for Indonesian speech
  const bytesPerSec = 32000 // 32kbps MP3
  return Math.ceil(buffer.length / bytesPerSec)
}

// Mock TTS when no API key
async function mockTts(text: string): Promise<TtsResult> {
  const durationSecs = Math.ceil(text.length / 15)
  const audioBuffer = Buffer.from(`[MOCK TTS] ${text.slice(0, 60)}...`)
  return { audioBuffer, durationSecs, charsUsed: text.length }
}

// Split long script into segments for TTS
export function splitScriptIntoChunks(script: string, maxChars = 2500): string[] {
  const segments = script.split(/\n\n+/)
  const chunks: string[] = []
  let current = ''

  for (const seg of segments) {
    if ((current + seg).length > maxChars && current) {
      chunks.push(current.trim())
      current = seg
    } else {
      current += (current ? '\n\n' : '') + seg
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}
