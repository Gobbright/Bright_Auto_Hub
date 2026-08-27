import sharp from 'sharp'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..', '..')
const sourceRoot = path.join(projectRoot, 'frontend', 'public', 'images', 'catalog', 'spare-parts')
const targetRoot = path.join(projectRoot, 'frontend', 'public', 'images', 'catalog', 'spare-parts-cutout')
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const toPublicPath = (absolutePath) => '/' + path.relative(path.join(projectRoot, 'frontend', 'public'), absolutePath).replaceAll('\\', '/')

async function listImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return listImages(entryPath)
    if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) return [entryPath]
    return []
  }))
  return nested.flat()
}

async function createCutout(sourcePath) {
  const relative = path.relative(sourceRoot, sourcePath)
  const targetPath = path.join(targetRoot, relative).replace(/\.[^.]+$/, '.png')
  await mkdir(path.dirname(targetPath), { recursive: true })

  const { data, info } = await sharp(sourcePath)
    .rotate()
    .resize({ width: 900, height: 720, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  let changedPixels = 0
  for (let offset = 0; offset < data.length; offset += 4) {
    const red = data[offset]
    const green = data[offset + 1]
    const blue = data[offset + 2]
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const isNeutral = max - min < 26
    const isLightBackground = isNeutral && red > 228 && green > 228 && blue > 228
    if (isLightBackground) {
      const fade = Math.max(0, Math.min(255, (255 - min) * 9))
      data[offset + 3] = fade
      changedPixels += 1
    }
  }

  await sharp(data, { raw: info })
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 }, threshold: 8 })
    .png({ compressionLevel: 9, palette: false })
    .toFile(targetPath)

  return { source: toPublicPath(sourcePath), output: toPublicPath(targetPath), changedPixels }
}

try {
  const images = await listImages(sourceRoot)
  const manifest = []
  for (const image of images) manifest.push(await createCutout(image))
  const manifestPath = path.join(targetRoot, 'CUTOUT-MANIFEST.json')
  await writeFile(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: manifest.length, images: manifest }, null, 2) + '\n')
  console.log(`Created ${manifest.length} transparent spare-part cutouts in ${toPublicPath(targetRoot)}`)
} catch (error) {
  console.error('Unable to create spare-part cutouts:', error)
  process.exitCode = 1
}