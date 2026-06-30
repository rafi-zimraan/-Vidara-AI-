const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

export const PIPELINE_STEPS = [
  { n: 1,  name: 'Analisis Topik',       agent: 'topic-analyzer',  ms: 2000, gemini: false },
  { n: 2,  name: 'Riset Fakta',          agent: 'researcher',       ms: 3000, gemini: false },
  { n: 3,  name: 'Fact-Check',           agent: 'fact-checker',     ms: 2500, gemini: false },
  { n: 4,  name: 'Outline Skrip',        agent: 'outliner',         ms: 2000, gemini: false },
  { n: 5,  name: 'Penulisan Skrip',      agent: 'scriptwriter',     ms: 4000, gemini: true  },
  { n: 6,  name: 'Review Skrip',         agent: 'script-reviewer',  ms: 1500, gemini: false },
  { n: 7,  name: 'Text-to-Speech',       agent: 'tts-engine',       ms: 5000, gemini: false },
  { n: 8,  name: 'Transkripsi',          agent: 'transcriber',      ms: 2000, gemini: false },
  { n: 9,  name: 'Subtitle',             agent: 'subtitle-gen',     ms: 1500, gemini: false },
  { n: 10, name: 'Cari Aset Visual',     agent: 'asset-finder',     ms: 3000, gemini: false },
  { n: 11, name: 'Generate Gambar AI',   agent: 'image-gen',        ms: 6000, gemini: false },
  { n: 12, name: 'Sinkronisasi Audio',   agent: 'audio-sync',       ms: 2000, gemini: false },
  { n: 13, name: 'Efek Transisi',        agent: 'transition-fx',    ms: 1500, gemini: false },
  { n: 14, name: 'Render Video',         agent: 'renderer',         ms: 7000, gemini: false },
  { n: 15, name: 'Quality Check',        agent: 'qa-check',         ms: 2000, gemini: false },
  { n: 16, name: 'Generate Thumbnail',   agent: 'thumbnail-gen',    ms: 3000, gemini: false },
  { n: 17, name: 'Metadata SEO',         agent: 'seo-writer',       ms: 2000, gemini: true  },
  { n: 18, name: 'Siap Publikasi',       agent: 'publisher',        ms: 1000, gemini: false },
]

function getProjectStatus(stepN: number): string {
  if (stepN <= 6) return 'generating_script'
  if (stepN <= 8) return 'generating_voiceover'
  if (stepN === 9) return 'generating_subtitles'
  if (stepN <= 13) return 'generating_footage'
  return 'rendering'
}

async function callGemini(prompt: string, apiKey: string): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
  const res = await $fetch<any>(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      body: {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 8192 },
      },
      timeout: 30000,
    },
  )
  const text: string = res.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const tokensIn: number = res.usageMetadata?.promptTokenCount ?? 0
  const tokensOut: number = res.usageMetadata?.candidatesTokenCount ?? 0
  return { text, tokensIn, tokensOut }
}

function buildScriptPrompt(topic: string, language: string, durationSecs: number): string {
  const durationMin = Math.round(durationSecs / 60)
  const lang = language === 'id' ? 'Bahasa Indonesia' : 'English'
  return `Kamu adalah penulis skrip video YouTube profesional yang berpengalaman membuat konten edukasi viral.

Tugas: Tulis skrip video YouTube berdurasi ${durationMin} menit tentang: "${topic}"

Bahasa: ${lang}

Format skrip yang diinginkan:
1. HOOK (0:00-0:10): Pembuka super menarik yang bikin penonton tidak bisa skip
2. INTRO (0:10-0:30): Perkenalan topik dan apa yang akan dipelajari
3. BAGIAN UTAMA: Dibagi menjadi 3-5 segmen dengan sub-judul jelas, setiap segmen 2-4 menit
4. KESIMPULAN: Rangkuman poin penting
5. OUTRO + CTA: Ajak subscribe, like, dan komen

Ketentuan:
- Narasi harus mengalir natural saat dibacakan
- Gunakan kalimat pendek dan langsung to the point
- Tambahkan fakta menarik atau statistik di setiap segmen
- Tone: informatif, engaging, dan mudah dipahami

Tulis SKRIP LENGKAP sekarang:`
}

function buildSeoPrompt(topic: string, scriptExcerpt: string): string {
  return `Buat metadata SEO untuk video YouTube tentang: "${topic}"

Cuplikan skrip:
${scriptExcerpt.slice(0, 600)}

Balas HANYA dalam format JSON valid berikut (tanpa penjelasan tambahan):
{
  "title": "judul video menarik max 70 karakter",
  "description": "deskripsi YouTube 150-200 kata natural dengan keyword",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
}`
}

// Parse script into scenes for TTS + image gen
function parseScriptToScenes(script: string): string[] {
  const sections = script.split(/\n\s*(?:BAGIAN|SEGMEN|SCENE|Hook|Intro|Kesimpulan|Outro)/i)
  const scenes = sections.filter(s => s.trim().length > 50)
  if (scenes.length === 0) {
    // Fallback: split by paragraphs
    const paras = script.split(/\n\n+/).filter(p => p.trim().length > 30)
    return paras.slice(0, 8)
  }
  return scenes.slice(0, 8)
}

// Image prompt generator from scene text
function buildImagePrompt(sceneText: string, topic: string): string {
  const clean = sceneText.replace(/[\[\]\(\)]/g, '').trim()
  return `cinematic video still, professional lighting, 4K quality, ${clean.slice(0, 300)}, related to ${topic}, YouTube video style, high detail`
}

export async function runPipeline(
  projectId: string,
  topic: string,
  language: string,
  durationSecs: number,
  taskIds: Record<number, string>,
) {
  const supabase = useServerSupabase()
  const config = useRuntimeConfig()
  const geminiKey = config.geminiApiKey as string
  const hasGemini = !!geminiKey

  let generatedScript = ''
  let scenes: string[] = []
  const audioPaths: string[] = []
  const imageUrls: string[] = []

  for (const step of PIPELINE_STEPS) {
    const taskId = taskIds[step.n]
    if (!taskId) continue

    try {
      await supabase.from('agent_tasks').update({
        status: 'running',
        started_at: new Date().toISOString(),
      }).eq('id', taskId)

      const projectStatus = getProjectStatus(step.n)
      await supabase.from('projects').update({ status: projectStatus }).eq('id', projectId)

      let outputData: Record<string, unknown> = {}
      let tokensIn = 0
      let tokensOut = 0

      // STEP 5: Generate script with Gemini
      if (step.gemini && step.n === 5) {
        if (hasGemini) {
          const prompt = buildScriptPrompt(topic, language, durationSecs)
          const result = await callGemini(prompt, geminiKey)
          generatedScript = result.text
          tokensIn = result.tokensIn
          tokensOut = result.tokensOut
          scenes = parseScriptToScenes(generatedScript)
          outputData = { script_length: generatedScript.length, scenes: scenes.length, preview: generatedScript.slice(0, 200) }

          await supabase.from('scripts').upsert({
            project_id: projectId,
            full_script: generatedScript,
            target_language: language,
            word_count: generatedScript.split(/\s+/).length,
          }, { onConflict: 'project_id' })
        } else {
          await sleep(step.ms)
          generatedScript = `[HOOK]\nApa yang kamu ketahui tentang ${topic}? Di video ini, kita akan membahas tuntas!\n\n[BAGIAN 1]\n${topic} adalah topik yang sangat menarik...\n\n[KESIMPULAN]\nItulah pembahasan kita tentang ${topic}. Jangan lupa like, subscribe, dan komen!\n`
          scenes = parseScriptToScenes(generatedScript)
          await supabase.from('scripts').upsert({
            project_id: projectId,
            full_script: generatedScript,
            target_language: language,
            word_count: generatedScript.split(/\s+/).length,
          }, { onConflict: 'project_id' })
          outputData = { mock: true, scenes: scenes.length, preview: generatedScript.slice(0, 200) }
        }
      }

      // STEP 7: Text-to-Speech via ElevenLabs
      else if (step.n === 7) {
        if (generatedScript) {
          if (scenes.length === 0) scenes = parseScriptToScenes(generatedScript)

          for (let i = 0; i < scenes.length; i++) {
            const { audioBuffer } = await generateSpeech({ text: scenes[i] })
            const audioPath = `/tmp/vidara_audio_${projectId}_${i}.mp3`
            const { writeFileSync } = await import('fs')
            writeFileSync(audioPath, audioBuffer)
            audioPaths.push(audioPath)
          }

          outputData = { scenes_processed: audioPaths.length, total_chars: generatedScript.length }
        } else {
          await sleep(step.ms)
          outputData = { mock: true }
        }
      }

      // STEP 10-11: Generate images via Replicate
      else if (step.n === 11) {
        if (scenes.length > 0) {
          for (let i = 0; i < scenes.length; i++) {
            const prompt = buildImagePrompt(scenes[i], topic)
            const { imageUrl } = await generateImage({ prompt })
            imageUrls.push(imageUrl)
          }
          outputData = { images_generated: imageUrls.length }
        } else {
          await sleep(step.ms)
          outputData = { mock: true }
        }
      }

      // STEP 14: Render Video with FFmpeg
      else if (step.n === 14) {
        if (imageUrls.length > 0 || audioPaths.length > 0) {
          const { renderVideo } = await import('./renderer')
          const sceneAssets = scenes.map((_, i) => ({
            imageUrl: imageUrls[i] || `https://placehold.co/1280x720/0E0E1A/8B5CF6?text=${encodeURIComponent(topic.slice(0, 30))}`,
            audioPath: audioPaths[i],
            durationSecs: Math.max(10, Math.round(durationSecs / Math.max(scenes.length, 1))),
          }))

          const result = await renderVideo({
            projectId,
            scenes: sceneAssets,
            resolution: { width: 1920, height: 1080 },
          })

          // Upload to Supabase Storage
          const { readFileSync } = await import('fs')
          const videoBuffer = readFileSync(result.videoPath)
          const { data: uploadData } = await supabase.storage
            .from('videos')
            .upload(`${projectId}/final.mp4`, videoBuffer, {
              contentType: 'video/mp4',
              upsert: true,
            })

          // Save to assets table
          if (uploadData?.path) {
            const { data: { publicUrl } } = supabase.storage
              .from('videos')
              .getPublicUrl(uploadData.path)

            await supabase.from('assets').insert({
              project_id: projectId,
              type: 'video',
              url: publicUrl,
              file_path: uploadData.path,
              mime_type: 'video/mp4',
              file_size_bytes: result.fileSizeBytes,
              metadata: { duration_secs: result.durationSecs },
            })
          }

          // Generate thumbnail from first frame
          const { execSync } = await import('child_process')
          const thumbPath = `/tmp/vidara_thumb_${projectId}.jpg`
          execSync(
            `ffmpeg -y -i "${result.videoPath}" -vframes 1 -vf "scale=1280:720" "${thumbPath}"`,
            { stdio: 'ignore', timeout: 10000 }
          )
          const thumbBuffer = readFileSync(thumbPath)
          await supabase.storage.from('videos').upload(`${projectId}/thumbnail.jpg`, thumbBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          })

          outputData = {
            video_duration_secs: result.durationSecs,
            file_size_bytes: result.fileSizeBytes,
            scenes_composited: scenes.length,
          }
        } else {
          await sleep(step.ms)
          outputData = { mock: true }
        }
      }

      // STEP 17: SEO metadata with Gemini
      else if (step.gemini && step.n === 17) {
        if (hasGemini && generatedScript) {
          const prompt = buildSeoPrompt(topic, generatedScript)
          const result = await callGemini(prompt, geminiKey)
          tokensIn = result.tokensIn
          tokensOut = result.tokensOut
          try {
            const seo = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
            outputData = seo
            if (seo.title) {
              await supabase.from('projects').update({ title: seo.title, metadata: seo }).eq('id', projectId)
            }
          } catch {
            outputData = { raw: result.text }
          }
        } else {
          await sleep(step.ms)
          outputData = { title: topic, tags: ['video', topic.toLowerCase()], mock: true }
        }
      }

      // All other steps: simulate
      else {
        await sleep(step.ms)
        outputData = { step: step.n, completed: true }
      }

      const costUsd = tokensIn > 0 ? (tokensIn * 0.00000010 + tokensOut * 0.00000040) : null
      await supabase.from('agent_tasks').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_data: outputData,
        tokens_in: tokensIn || null,
        tokens_out: tokensOut || null,
        cost_usd: costUsd,
      }).eq('id', taskId)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      await supabase.from('agent_tasks').update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: msg,
      }).eq('id', taskId)

      await supabase.from('projects').update({
        status: 'failed',
        metadata: { error: msg, failed_at_step: step.n, step_name: step.name },
      }).eq('id', projectId)
      return
    }
  }

  // Cleanup temp audio files
  for (const p of audioPaths) {
    try {
      const { unlinkSync } = await import('fs')
      unlinkSync(p)
    } catch {}
  }

  await supabase.from('projects').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', projectId)
}
