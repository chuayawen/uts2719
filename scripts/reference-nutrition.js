import Papa from 'papaparse'
import { NUTRITION_COLUMNS, parseMenuCsv } from '../src/lib/menu.js'

export const REFERENCE_SOURCE = 'hpb-reference-recipes-2026-11-03'
export const nutrientKeys = Object.freeze({ calories_kcal: 'energy', protein_g: 'protein', total_carbs_g: 'carbohydrate',
  fats_g: 'fat', sodium_mg: 'sodium', fibre_g: 'dietaryFibre' })

/** HPB per-100g values use edible weight. Its default serving weight includes bones/shells. */
export function edibleGrams(component, food) {
  if (!food || !Number.isFinite(component.grams) || component.grams <= 0) throw new Error('Invalid reference or portion.')
  if (component.basis === 'edible') return component.grams
  if (component.basis !== 'as-served' || !Number.isFinite(food.ediblePercent) || food.ediblePercent <= 0 || food.ediblePercent > 100) {
    throw new Error('Invalid serving basis or edible percentage.')
  }
  return component.grams * food.ediblePercent / 100
}

/** Missing/trace source values propagate as unknown, never zero. No protein/carbohydrate inference. */
export function calculateRecipe(recipe, foods) {
  if (!recipe.components?.length || !recipe.assumptions?.trim()) throw new Error('Recipe needs portions and assumptions.')
  const portions = recipe.components.map((part) => ({ food: foods[part.foodId], grams: edibleGrams(part, foods[part.foodId]) }))
  return Object.fromEntries(Object.entries(nutrientKeys).map(([column, key]) => {
    const known = portions.every(({ food }) => Number.isFinite(food.per100gEdible[key]) && food.per100gEdible[key] >= 0)
    const value = known ? portions.reduce((sum, { food, grams }) => sum + food.per100gEdible[key] * grams / 100, 0) : null
    // Coarse display precision reflects estimated portions; retain originals separately.
    const step = ['calories_kcal', 'sodium_mg'].includes(column) ? 10 : 1
    return [column, value === null ? null : Math.round(value / step) * step]
  }))
}

export function recipeDescription(recipe, foods) {
  const parts = recipe.components.map((part) => {
    const food = foods[part.foodId]
    return `${part.grams.toLocaleString('en-SG', { maximumFractionDigits: 1 })} g ${food.name} (${part.basis === 'edible' ? 'edible weight' : 'as served'})`
  })
  return `${recipe.assumptions} Calculation portions: ${parts.join('; ')}.${recipe.addedWaterG ? ` Plus ${recipe.addedWaterG} g water, with no added nutrients.` : ''}`
}

/** Fill missing dishes only, or refresh this exact reference batch. Preserve supplied estimates and menu identity. */
export function mergeReferenceRecipes(csv, recipes, foods) {
  parseMenuCsv(csv)
  const parsed = Papa.parse(csv.trimEnd(), { header: true, skipEmptyLines: 'greedy' })
  if (parsed.errors.length) throw new Error('Invalid menu CSV.')
  const byId = new Map(parsed.data.map((row) => [row.id, row]))
  const seen = new Set()
  let applied = 0
  for (const recipe of recipes) {
    if (seen.has(recipe.id)) throw new Error(`Duplicate recipe ID: ${recipe.id}`)
    seen.add(recipe.id)
    const row = byId.get(recipe.id)
    if (!row || row.name !== recipe.name) throw new Error(`Missing or renamed recipe dish: ${recipe.id}`)
    if (row.nutrition_source && row.nutrition_source !== REFERENCE_SOURCE) continue
    const values = calculateRecipe(recipe, foods)
    if (values.calories_kcal === null) throw new Error(`Missing reference energy: ${recipe.id}`)
    Object.assign(row, Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === null ? '' : String(v)])), {
      nutrition_status: 'ai-estimate', nutrition_basis: 'per-order', nutrition_source: REFERENCE_SOURCE,
      nutrition_method: 'reference-recipe', nutrition_assumptions: recipeDescription(recipe, foods),
      nutrition_references: JSON.stringify([...new Set(recipe.components.map((p) => p.foodId))].map((id) => ({ id, name: foods[id].name }))),
    })
    applied++
  }
  const fields = [...parsed.meta.fields, ...[...Object.keys(NUTRITION_COLUMNS), 'nutrition_status', 'nutrition_basis', 'nutrition_source',
    'nutrition_method', 'nutrition_assumptions', 'nutrition_references'].filter((key) => !parsed.meta.fields.includes(key))]
  const result = Papa.unparse({ fields, data: parsed.data.map((row) => fields.map((key) => row[key] ?? '')) }, { newline: '\n' }) + '\n'
  parseMenuCsv(result)
  return { csv: result, applied }
}
