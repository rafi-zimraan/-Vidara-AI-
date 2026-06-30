// Replicate Image Generation

interface ImageGenOptions {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  numOutputs?: number
}

interface ImageGenResult {
  imageUrl: string
  prompt: string
}

const DEFAULT_MODEL = 'black-forest-labs/flux-dev'
const FALLBACK_MODEL = 'stability-ai/stable-diffusion-3.5-large'

export async function generateImage(opts: ImageGenOptions): Promise<ImageGenResult> {
  const config = useRuntimeConfig()
  const apiKey = config.replicateApiKey as string

  if (!apiKey) {
    return mockImage(opts.prompt)
  }

  try {
    // Start prediction
    const prediction = await $fetch<any>('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        version: 'black-forest-labs/flux-dev',
        input: {
          prompt: opts.prompt,
          negative_prompt: opts.negativePrompt || 'text, watermark, blurry, low quality',
          width: opts.width || 1280,
          height: opts.height || 720,
          num_outputs: opts.numOutputs || 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
      },
    })

    // Poll until complete
    const result = await pollPrediction(prediction.id, apiKey)
    const imageUrl = result.output?.[0]

    if (!imageUrl) {
      throw new Error('No image in output')
    }

    return { imageUrl, prompt: opts.prompt }
  } catch (err) {
    console.error('[Replicate Error]', err)
    return mockImage(opts.prompt)
  }
}

async function pollPrediction(id: string, apiKey: string, maxRetries = 30): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    const res = await $fetch<any>(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (res.status === 'succeeded') return res
    if (res.status === 'failed') throw new Error(res.error || 'Prediction failed')

    await sleep(1000)
  }
  throw new Error('Prediction timed out')
}

// Mock when no API key
async function mockImage(prompt: string): Promise<ImageGenResult> {
  await sleep(500)
  return {
    imageUrl: `https://placehold.co/1280x720/0E0E1A/8B5CF6?text=${encodeURIComponent(prompt.slice(0, 40))}`,
    prompt,
  }
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
