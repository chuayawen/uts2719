import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parseMenuCsv, validateMenuItems, NUTRITION_COLUMNS } from '../src/lib/menu.js'
import { mapCsvMenu } from '../src/data/catalogue.ts'
import { mergeNutritionEstimates } from '../scripts/nutrition-import.js'

const core = 'id,name,price,canteen,stall,cuisine,dietary_tags,image,source'
const dish = 'one,Example rice,3.50,Example,Stall,Chinese,,,photo.jpg'
const columns = Object.keys(NUTRITION_COLUMNS).join(',')
const values = '600,30.5,70,22,900,4'
const metadata = 'nutrition_status,nutrition_basis,nutrition_source'
const csv = `${core},${columns},${metadata}\n${dish},${values},ai-estimate,per-order,provided.csv`

test('nutrition survives CSV parsing and UI mapping with explicit units and provenance', () => {
  const [raw] = parseMenuCsv(csv)
  assert.deepEqual(raw.nutrition, { caloriesKcal: 600, proteinG: 30.5, carbsG: 70, fatG: 22, sodiumMg: 900, fibreG: 4,
    status: 'ai-estimate', basis: 'per-order', source: 'provided.csv' })
  const [ui] = mapCsvMenu([raw], [{ id: 'example', name: 'Example' }], '/')
  assert.deepEqual(ui.nutrition, raw.nutrition)
  assert.notEqual(ui.nutrition, raw.nutrition)
})

test('nutrition missing values stay unknown and zero remains a real estimate', () => {
  assert.equal(parseMenuCsv(`${core}\n${dish}`)[0].nutrition, undefined)
  assert.equal(parseMenuCsv(`${core},${columns},${metadata}\n${dish},,,,,,,,,`)[0].nutrition, undefined)
  const [item] = parseMenuCsv(csv.replace(values, '600,0,,22,0,'))
  assert.equal(item.nutrition.proteinG, 0)
  assert.equal(item.nutrition.carbsG, null)
  assert.equal(item.nutrition.sodiumMg, 0)
  assert.equal(item.nutrition.fibreG, null)
})

test('invalid numbers, missing attribution and unsupported serving bases fail validation', () => {
  for (const invalid of ['-1', 'NaN', 'Infinity', '30g', '2e3', '1e999']) {
    assert.throws(() => parseMenuCsv(csv.replace(values, `600,${invalid},70,22,900,4`)), /validation problem/)
  }
  for (const bad of [csv.replace('per-order', 'per-100g'), csv.replace('ai-estimate,per-order,provided.csv', ',per-order,'), csv.replace('ai-estimate,per-order,provided.csv', 'verified,per-order,provided.csv')]) {
    assert.throws(() => parseMenuCsv(bad), /validation problem/)
  }
  assert.ok(validateMenuItems([{ ...parseMenuCsv(csv)[0], nutrition: '600' }]).some((e) => e.field === 'nutrition'))
})

test('nutrition import handles blank spacer columns, preserves current facts, and leaves unmatched dishes unknown', () => {
  const current = `${core}\n${dish.replace('photo.jpg', 'photo.jpg; newer.jpg')}\ntwo,Other rice,4,Example,Stall,Chinese,,,other.jpg`
  const uploaded = `${core},,,,${columns}\n${dish},,,,${values}`
  const result = mergeNutritionEstimates(current, uploaded, 'provided.csv')
  const records = parseMenuCsv(result.csv)
  assert.equal(result.imported, 1)
  assert.equal(result.withoutEstimates, 1)
  assert.equal(records[0].source, 'photo.jpg; newer.jpg')
  assert.equal(records[0].price, 3.5)
  assert.equal(records[0].nutrition.caloriesKcal, 600)
  assert.equal(records[1].nutrition, undefined)
  assert.deepEqual(mergeNutritionEstimates(result.csv, uploaded, 'provided.csv'), result)
  assert.throws(() => mergeNutritionEstimates(current, uploaded.replace('Example rice', 'Different dish'), 'provided.csv'), /identity changed/)
  assert.throws(() => mergeNutritionEstimates(current, uploaded.replace('one,', 'unknown,'), 'provided.csv'), /absent/)
  assert.throws(() => mergeNutritionEstimates(current, uploaded + '\n' + uploaded.split('\n')[1], 'provided.csv'), /Duplicate nutrition ID/)
})

test('published estimates have the documented coverage without filling today’s unmatched dishes', async () => {
  const items = parseMenuCsv(await readFile(new URL('../public/data/menu.csv', import.meta.url), 'utf8'))
  const metadata = JSON.parse(await readFile(new URL('../public/data/nutrition-provenance.json', import.meta.url), 'utf8'))
  assert.equal(items.length, metadata.coverage.total)
  assert.equal(items.filter((i) => i.nutrition).length, metadata.coverage.withEstimates)
  assert.equal(items.filter((i) => !i.nutrition).length, metadata.coverage.withoutEstimates)
  assert.ok(items.filter((i) => i.id.startsWith('fr-')).every((i) => !i.nutrition))
  assert.equal(items.find((i) => i.id === 'ff-asia-egg-001').nutrition.proteinG, 46)
})
