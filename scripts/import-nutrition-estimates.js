import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { createHash } from 'node:crypto'
import { mergeNutritionEstimates } from './nutrition-import.js'
import { parseMenuCsv } from '../src/lib/menu.js'

const input = process.argv[2]
if (!input) throw new Error('Usage: node scripts/import-nutrition-estimates.js <estimates.csv>')
const target = new URL('../public/data/menu.csv', import.meta.url)
const bytes = await readFile(input)
const { csv, ...coverage } = mergeNutritionEstimates(await readFile(target, 'utf8'), bytes.toString('utf8'), basename(input))
const provenanceUrl = new URL('../public/data/nutrition-provenance.json', import.meta.url)
const previous = JSON.parse(await readFile(provenanceUrl, 'utf8'))
const records = parseMenuCsv(csv)
const suppliedImport = { sourceFile: basename(input), sha256: createHash('sha256').update(bytes).digest('hex'),
  importedOn: new Date().toISOString().slice(0, 10), rows: coverage.imported }
const referenceCount = records.filter((r) => r.nutrition?.method === 'reference-recipe').length
const provenance = { ...previous,
  status: 'ai-estimate', basis: 'per-order', latestSuppliedImport: suppliedImport,
  suppliedImports: [...(previous.suppliedImports ?? []), suppliedImport],
  coverage: { ...coverage, supplied: coverage.withEstimates - referenceCount, referenceRecipes: referenceCount },
  ...(previous.referenceBatch ? { referenceBatch: { ...previous.referenceBatch, count: referenceCount } } : {}),
  description: 'AI-generated nutrition estimates per menu order. Supplied imports and reference recipes have separate attribution. Actual portions, sauces and cooking oil may vary.',
}
// Validation and identity matching complete before either public file is written.
await writeFile(target, csv, 'utf8')
await writeFile(provenanceUrl, JSON.stringify(provenance, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(coverage, null, 2))
