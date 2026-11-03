import test from 'node:test'
import assert from 'node:assert/strict'
import { DAILY_REFERENCES, dailyPercent, formatPercent, nutritionContext, sortByNutrition } from '../src/lib/nutritionGuide.ts'

test('daily context uses WHO adult sodium limit and fibre minimum', () => {
  assert.deepEqual(DAILY_REFERENCES, { sodiumMaxMg: 2000, fibreMinG: 25 })
  assert.deepEqual(nutritionContext({ sodiumMg: 900, fibreG: 5, proteinG: 18 }), { sharing: false, sodiumPercent: 45, fibrePercent: 20 })
})

test('percentages round to the nearest 5% and small amounts read as under 5%', () => {
  assert.equal(dailyPercent(1240, 2000), 60)
  assert.equal(dailyPercent(1260, 2000), 65)
  assert.equal(dailyPercent(30, 2000), 0)
  assert.equal(formatPercent(0, 30), 'under 5%')
  assert.equal(formatPercent(0, 0), 'about 0%')
  assert.equal(formatPercent(45, 900), 'about 45%')
})

test('unknown, invalid and trace inputs get no percentage; zero is a real value', () => {
  for (const value of [null, undefined, NaN, Infinity, -1, '20']) assert.equal(dailyPercent(value, 25), null)
  assert.deepEqual(nutritionContext(), { sharing: false, sodiumPercent: null, fibrePercent: null })
  assert.equal(nutritionContext({ sodiumMg: 0, fibreG: 0 }).sodiumPercent, 0)
})

test('there is no pass/fail judgement and protein has no daily percentage', () => {
  const context = nutritionContext({ sodiumMg: 1500, proteinG: 2, fibreG: 1 })
  assert.deepEqual(Object.keys(context).sort(), ['fibrePercent', 'sharing', 'sodiumPercent'])
})

test('sharing orders get no single-person percentage and input is immutable', () => {
  const sharing = Object.freeze({ sodiumMg: 600, fibreG: 8, assumptions: 'Sharing whole-fish scenario: full order, excluding rice.' })
  assert.deepEqual(nutritionContext(sharing), { sharing: true, sodiumPercent: null, fibrePercent: null })
  assert.equal(sharing.sodiumMg, 600)
})

const dish = (id, nutrition) => ({ id, nutrition })
const items = [
  dish('a', { sodiumMg: 900, proteinG: 18, fibreG: 5 }),
  dish('b', { sodiumMg: null, proteinG: null, fibreG: null }),
  dish('c', { sodiumMg: 400, proteinG: 30, fibreG: 2 }),
  dish('d', { sodiumMg: 100, proteinG: 90, fibreG: 20, assumptions: 'Sharing platter for 3' }),
  dish('e', { sodiumMg: 900, proteinG: 25, fibreG: 5 }),
  dish('f'),
]
const order = (sort) => sortByNutrition(items, sort).map((item) => item.id)

test('nutrition sorts are stable and keep unknown and sharing dishes last in menu order', () => {
  assert.deepEqual(order('default'), ['a', 'b', 'c', 'd', 'e', 'f'])
  assert.deepEqual(order('less-sodium'), ['c', 'a', 'e', 'b', 'd', 'f'])
  assert.deepEqual(order('more-protein'), ['c', 'e', 'a', 'b', 'd', 'f'])
  assert.deepEqual(order('more-fibre'), ['a', 'e', 'c', 'b', 'd', 'f'])
  assert.deepEqual(items.map((item) => item.id), ['a', 'b', 'c', 'd', 'e', 'f'])
})
