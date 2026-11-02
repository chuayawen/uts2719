import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import Papa from 'papaparse'
import { calculateRecipe, edibleGrams, mergeReferenceRecipes, REFERENCE_SOURCE } from '../scripts/reference-nutrition.js'
import { mergeNutritionEstimates } from '../scripts/nutrition-import.js'
import { parseMenuCsv, NUTRITION_COLUMNS } from '../src/lib/menu.js'
import { mapCsvMenu } from '../src/data/catalogue.ts'

const root = new URL('../', import.meta.url)
const read = (file) => readFile(new URL(file, root), 'utf8')
const csv = await read('public/data/menu.csv')
const foods = JSON.parse(await read('data/nutrition/hpb-foods.json'))
const recipes = JSON.parse(await read('data/nutrition/reference-recipes.json'))
const preservation = JSON.parse(await read('data/nutrition/preserved-input.json'))
const items = parseMenuCsv(csv)
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')

test('original 842 menu identities and 559 supplied estimate cells remain byte-for-byte equivalent', () => {
  const rows = Papa.parse(csv, { header: true, skipEmptyLines: 'greedy' }).data
  assert.equal(hash(rows.map((r) => preservation.menuColumns.map((key) => r[key]))), preservation.menuIdentitySha256)
  const supplied = rows.filter((r) => r.nutrition_source !== REFERENCE_SOURCE)
  assert.equal(supplied.length, preservation.suppliedCount)
  assert.equal(hash(supplied.map((r) => [r.id, ...preservation.nutritionColumns.map((key) => r[key])])), preservation.suppliedEstimatesSha256)
})

test('edible percentage is applied once to gross weight; manually edible weights bypass bones', () => {
  const chickenRice = foods.F05100133
  assert.equal(chickenRice.name, 'Steamed chicken rice')
  assert.ok(Math.abs(edibleGrams({ grams: 346, basis: 'as-served' }, chickenRice) - 322.991) < .001)
  assert.equal(edibleGrams({ grams: 100, basis: 'edible' }, chickenRice), 100)
  const nutrition = calculateRecipe({ assumptions: 'default bowl', components: [{ foodId: chickenRice.id, grams: 346, basis: 'as-served' }] }, foods)
  assert.equal(nutrition.calories_kcal, 470)
  assert.equal(nutrition.protein_g, 19)
  assert.throws(() => edibleGrams({ grams: 0, basis: 'edible' }, chickenRice), /Invalid/)
  assert.throws(() => edibleGrams({ grams: 100, basis: 'as-served' }, { ediblePercent: 120 }), /Invalid/)
})

test('trace and unavailable components stay unknown even when another component has known fibre', () => {
  const value = calculateRecipe({ assumptions: 'roast chicken with vegetables', components: [
    { foodId: 'F05100112', grams: 363, basis: 'as-served' },
    { foodId: 'F14080052', grams: 70, basis: 'edible' },
  ] }, foods)
  assert.equal(value.fibre_g, null)
  assert.equal(calculateRecipe({ assumptions: 'plain rice', components: [{ foodId: 'F05090006', grams: 200, basis: 'edible' }] }, foods).sodium_mg, 0)
  assert.throws(() => calculateRecipe({ assumptions: '', components: [] }, foods), /assumptions/)
  assert.throws(() => calculateRecipe({ assumptions: 'invalid source', components: [{ foodId: 'missing', grams: 10, basis: 'edible' }] }, foods), /Invalid reference/)
})

test('each new estimate has a reproducible recipe, valid primary references, and no unlabelled precision', async () => {
  const audit = JSON.parse(await read('public/data/nutrition-calculations.json'))
  assert.equal(recipes.length, 283)
  assert.equal(new Set(recipes.map((r) => r.id)).size, 283)
  assert.deepEqual(audit.foods, foods)
  assert.equal(audit.recipes.length, 283)
  for (const recipe of recipes) {
    const item = items.find((i) => i.id === recipe.id)
    assert.equal(item.name, recipe.name)
    assert.equal(item.nutrition.method, 'reference-recipe')
    assert.equal(item.nutrition.source, REFERENCE_SOURCE)
    const values = calculateRecipe(recipe, foods)
    for (const [column, key] of Object.entries(NUTRITION_COLUMNS)) assert.equal(item.nutrition[key], values[column], `${item.id} ${column}`)
    assert.ok(item.nutrition.assumptions.includes(recipe.assumptions))
    assert.ok(item.nutrition.caloriesKcal > 100 && item.nutrition.caloriesKcal < 2000)
    for (const ref of item.nutrition.references) {
      assert.equal(ref.name, foods[ref.id].name)
      assert.equal(foods[ref.id].url, `https://pphtpc.hpb.gov.sg/web/sgfoodid/tools/food-search/details/${ref.id}`)
    }
    assert.deepEqual(audit.recipes.find((r) => r.id === recipe.id).estimatedNutrients, values)
  }
  assert.equal(mergeReferenceRecipes(csv, recipes, foods).csv, csv)
  assert.throws(() => mergeReferenceRecipes(csv, [recipes[0], recipes[0]], foods), /Duplicate recipe/)
  assert.throws(() => mergeReferenceRecipes(csv, [{ ...recipes[0], name: 'Different dish' }], foods), /renamed/)
})

test('alternative choices, sharing dishes, sizes and soup-only portions remain explicit', () => {
  const get = (id) => items.find((i) => i.id === id).nutrition
  assert.match(get('fr-chicken-001').assumptions, /Assumes roasted chicken with rice/)
  assert.match(get('fr-chuanyang-015').assumptions, /Full sharing order, excluding rice/)
  assert.match(get('fr-soup-001').assumptions, /Soup only/)
  assert.match(get('dk-stirfry-039').assumptions, /Assumes chicken option, not pork/)
  assert.ok(get('fr-ruyi-007').caloriesKcal > get('fr-ruyi-006').caloriesKcal)
  assert.ok(get('fr-noodles-002').caloriesKcal > get('fr-noodles-001').caloriesKcal)
  assert.ok(get('fr-japanese-004').caloriesKcal > get('fr-japanese-001').caloriesKcal)
  assert.ok(get('fr-korean-022').proteinG > get('fr-korean-021').proteinG)
})

test('reference attribution survives UI mapping and later supplied imports clear outdated attribution', () => {
  const raw = items.find((i) => i.id === recipes[0].id)
  const [ui] = mapCsvMenu([raw], [{ id: raw.canteen, name: raw.canteen }], '/')
  assert.deepEqual(ui.nutrition, raw.nutrition)
  assert.notEqual(ui.nutrition.references, raw.nutrition.references)
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: 'greedy' })
  const row = parsed.data.find((r) => r.id === raw.id)
  const uploaded = Papa.unparse([row])
  const updated = parseMenuCsv(mergeNutritionEstimates(csv, uploaded, 'updated.csv').csv).find((i) => i.id === raw.id)
  assert.equal(updated.nutrition.source, 'updated.csv')
  assert.equal(updated.nutrition.method, undefined)
  assert.equal(updated.nutrition.references, undefined)
  const badRow = { ...row, nutrition_references: JSON.stringify([{ id: 'javascript:alert(1)', name: 'Unsafe reference' }]) }
  assert.throws(() => parseMenuCsv(Papa.unparse([badRow])), /validation problem/)
  assert.throws(() => parseMenuCsv(Papa.unparse([{ ...row, nutrition_references: '{invalid' }])), /validation problem/)
  assert.throws(() => parseMenuCsv(Papa.unparse([{ ...row, nutrition_assumptions: '' }])), /validation problem/)
})
