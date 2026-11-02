import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { createHash } from 'node:crypto'
import { mergeNutritionEstimates } from './nutrition-import.js'

const input = process.argv[2]
if (!input) throw new Error('Usage: node scripts/import-nutrition-estimates.js <estimates.csv>')
const target = new URL('../public/data/menu.csv', import.meta.url)
const bytes = await readFile(input)
const { csv, ...coverage } = mergeNutritionEstimates(await readFile(target, 'utf8'), bytes.toString('utf8'), basename(input))
const provenance = {
  status: 'ai-estimate', basis: 'per-order', sourceFile: basename(input),
  sha256: createHash('sha256').update(bytes).digest('hex'), importedOn: new Date().toISOString().slice(0, 10),
  coverage,
  description: 'User-supplied AI-generated nutrition estimates per menu order. Actual portions, sauces and cooking oil may vary. Values are not independently or stall-verified.',
  referenceScope: 'The supplier cited HPB SG FoodID generally, without dish-level database IDs, recipes or portion mappings. These values are not presented as HPB-verified figures.',
}
// Validation and identity matching complete before either public file is written.
await writeFile(target, csv, 'utf8')
await writeFile(new URL('../public/data/nutrition-provenance.json', import.meta.url), JSON.stringify(provenance, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(coverage, null, 2))
