import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { calculateRecipe, mergeReferenceRecipes, REFERENCE_SOURCE } from './reference-nutrition.js'
import { parseMenuCsv } from '../src/lib/menu.js'

const root = new URL('../', import.meta.url)
const file = (name) => new URL(name, root)
const [csv, recipeBytes, foodBytes, provenanceBytes] = await Promise.all([
  readFile(file('public/data/menu.csv'), 'utf8'), readFile(file('data/nutrition/reference-recipes.json')),
  readFile(file('data/nutrition/hpb-foods.json')), readFile(file('public/data/nutrition-provenance.json'), 'utf8'),
])
const recipes = JSON.parse(recipeBytes), foods = JSON.parse(foodBytes)
const result = mergeReferenceRecipes(csv, recipes, foods)
const items = parseMenuCsv(result.csv)
const provenance = JSON.parse(provenanceBytes)
provenance.coverage = { ...provenance.coverage,
  withEstimates: items.filter((i) => i.nutrition).length,
  withoutEstimates: items.filter((i) => !i.nutrition).length, total: items.length,
  supplied: items.filter((i) => i.nutrition && i.nutrition.source !== REFERENCE_SOURCE).length,
  referenceRecipes: result.applied,
}
provenance.description = 'AI-generated estimates per menu order, with separate supplied and reference-recipe batches. Portion scenarios are assumptions, not stall measurements.'
provenance.referenceBatch = {
  id: REFERENCE_SOURCE, calculatedOn: '2026-11-03', count: result.applied,
  foodReferenceCount: Object.keys(foods).length,
  recipesSha256: createHash('sha256').update(recipeBytes).digest('hex'),
  foodsSha256: createHash('sha256').update(foodBytes).digest('hex'),
  method: 'Sum HPB per-100g edible composition multiplied by stated ingredient or comparable dish weights. Apply edible percentage once to as-served weights. Negative trace markers and unavailable values remain unknown. Round new kcal/sodium to 10 units and grams to whole units.',
  limitations: 'Not HPB-verified vendor nutrition. Recipes, portions, sauce retention and alternative choices are unmeasured. Sharing dishes represent the full assumed order. Original supplied estimates are preserved unchanged.',
  methodologyUrl: 'https://pphtpc.hpb.gov.sg/web/sgfoodid/about-our-data',
}
const audit = { batch: provenance.referenceBatch, foods, recipes: recipes.filter((r) => items.find((i) => i.id === r.id)?.nutrition?.source === REFERENCE_SOURCE)
  .map((recipe) => ({ ...recipe, estimatedNutrients: calculateRecipe(recipe, foods) })) }
// All recipes, identities, numeric fields and references validated before writing.
await writeFile(file('public/data/menu.csv'), result.csv, 'utf8')
await writeFile(file('public/data/nutrition-provenance.json'), JSON.stringify(provenance, null, 2) + '\n', 'utf8')
await writeFile(file('public/data/nutrition-calculations.json'), JSON.stringify(audit, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(provenance.coverage, null, 2))
