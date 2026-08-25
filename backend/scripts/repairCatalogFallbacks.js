import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile, copyFile } from 'node:fs/promises'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(scriptDir, '../../frontend/public')
const manifestFile = path.join(publicDir, 'images', 'catalog', 'IMAGE-ATTRIBUTION.json')
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'))
let repaired = 0

for (const item of manifest.filter((entry) => entry.fallback)) {
  const extension = path.extname(item.localPath).toLowerCase()
  const eligible = (candidate) =>
    !candidate.fallback && candidate.kind === item.kind &&
    path.extname(candidate.localPath).toLowerCase() === extension &&
    candidate.sourcePage && candidate.license
  const donor = manifest.find((candidate) => eligible(candidate) && candidate.group === item.group && candidate.category === item.category)
    || manifest.find((candidate) => eligible(candidate) && candidate.group === item.group)
    || manifest.find(eligible)
  if (!donor) continue
  await copyFile(
    path.join(publicDir, donor.localPath.replace(/^\//, '')),
    path.join(publicDir, item.localPath.replace(/^\//, '')),
  )
  item.sourcePage = donor.sourcePage
  item.sourceFile = donor.sourceFile
  item.author = donor.author
  item.license = donor.license
  item.licenseUrl = donor.licenseUrl
  item.fallback = false
  item.reusedCategoryImage = true
  item.reusedFrom = donor.localPath
  repaired += 1
}

await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`)
const remaining = manifest.filter((entry) => entry.fallback).length
console.log(`Repaired ${repaired} fallback images from attributed category donors; ${remaining} remain.`)
if (remaining) process.exitCode = 1
