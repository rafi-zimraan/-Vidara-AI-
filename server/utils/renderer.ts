// FFmpeg Video Renderer
import { execSync, exec } from 'child_process'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

interface SceneAsset {
  imageUrl: string
  audioPath?: string
  durationSecs: number
  caption?: string
}

interface RenderOptions {
  projectId: string
  scenes: SceneAsset[]
  resolution?: { width: number; height: number }
  outputPath?: string
}

interface RenderResult {
  videoPath: string
  durationSecs: number
  fileSizeBytes: number
}

export function checkFfmpeg(): boolean {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export async function renderVideo(opts: RenderOptions): Promise<RenderResult> {
  if (!checkFfmpeg()) {
    return mockRender(opts)
  }

  const workDir = join(tmpdir(), `vidara-render-${randomUUID()}`)
  mkdirSync(workDir, { recursive: true })

  const width = opts.resolution?.width || 1920
  const height = opts.resolution?.height || 1080

  try {
    // Download all images and create per-scene video clips
    const clipPaths: string[] = []

    for (let i = 0; i < opts.scenes.length; i++) {
      const scene = opts.scenes[i]
      const clipPath = join(workDir, `scene_${String(i).padStart(3, '0')}.mp4`)

      // Create a video clip from image + optional audio
      if (scene.audioPath && existsSync(scene.audioPath)) {
        // Image + audio → video clip
        execSync(
          `ffmpeg -y -loop 1 -i "${scene.imageUrl}" -i "${scene.audioPath}" ` +
          `-c:v libx264 -c:a aac -b:a 128k -shortest -pix_fmt yuv420p ` +
          `-vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p" ` +
          `-t ${scene.durationSecs} "${clipPath}"`,
          { stdio: 'ignore', timeout: 30000 }
        )
      } else {
        // Image only → video clip with duration
        execSync(
          `ffmpeg -y -loop 1 -i "${scene.imageUrl}" ` +
          `-c:v libx264 -pix_fmt yuv420p ` +
          `-vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p" ` +
          `-t ${scene.durationSecs} "${clipPath}"`,
          { stdio: 'ignore', timeout: 30000 }
        )
      }

      clipPaths.push(clipPath)
    }

    // Concatenate all clips
    const concatFile = join(workDir, 'concat.txt')
    const concatContent = clipPaths.map(p => `file '${p}'`).join('\n')
    writeFileSync(concatFile, concatContent)

    const outputPath = opts.outputPath || join(workDir, 'final.mp4')

    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${concatFile}" ` +
      `-c:v libx264 -preset medium -crf 22 -c:a aac -b:a 128k ` +
      `-movflags +faststart "${outputPath}"`,
      { stdio: 'ignore', timeout: 120000 }
    )

    const stats = execSync(`ffprobe -v quiet -print_format json -show_format "${outputPath}"`, { encoding: 'utf-8' })
    const info = JSON.parse(stats)
    const durationSecs = Math.round(parseFloat(info.format?.duration || '0'))
    const fileSizeBytes = parseInt(info.format?.size || '0')

    return { videoPath: outputPath, durationSecs, fileSizeBytes }
  } finally {
    // Cleanup temp files (async, don't block)
    exec(`rm -rf "${workDir}"`, () => {})
  }
}

async function mockRender(opts: RenderOptions): Promise<RenderResult> {
  const totalDuration = opts.scenes.reduce((sum, s) => sum + s.durationSecs, 0)
  const outputPath = join(tmpdir(), `vidara-mock-${randomUUID()}.mp4`)

  // Generate a simple test pattern video as mock
  if (checkFfmpeg()) {
    execSync(
      `ffmpeg -y -f lavfi -i "color=c=#08080F:s=1920x1080:d=${totalDuration}:r=30" ` +
      `-f lavfi -i "anullsrc=r=44100:cl=mono" -shortest ` +
      `-c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p "${outputPath}"`,
      { stdio: 'ignore', timeout: 30000 }
    )
  }

  return { videoPath: outputPath, durationSecs: totalDuration, fileSizeBytes: 0 }
}
