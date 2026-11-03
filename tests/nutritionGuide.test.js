import test from 'node:test'
import assert from 'node:assert/strict'
import { nutritionGuide } from '../src/lib/nutritionGuide.ts'

const favourable = { sodiumMg: 600, proteinG: 20, fibreG: 8 }
test('individual nutrient colours have explicit inclusive boundaries', () => {
  assert.ok(Object.values(nutritionGuide(favourable).signals).every((s) => s.tone === 'green'))
  for (const [key, values] of Object.entries({ sodiumMg: [[600.1, 'amber'], [1000, 'amber'], [1000.1, 'red']],
    proteinG: [[19.9, 'amber'], [10, 'amber'], [9.9, 'red']], fibreG: [[7.9, 'amber'], [4, 'amber'], [3.9, 'red']] })) {
    for (const [value, tone] of values) assert.equal(nutritionGuide({ ...favourable, [key]: value }).signals[{ sodiumMg: 'sodium', proteinG: 'protein', fibreG: 'fibre' }[key]].tone, tone)
  }
})
test('unknown, invalid and trace inputs never earn green; zero has nutrient-specific meaning', () => {
  for (const value of [null, undefined, NaN, Infinity, -1, '20']) {
    assert.equal(nutritionGuide({ ...favourable, fibreG: value }).signals.fibre.tone, 'unknown')
  }
  assert.ok(Object.values(nutritionGuide().signals).every((s) => s.tone === 'unknown'))
  assert.equal(nutritionGuide({ ...favourable, sodiumMg: 0 }).signals.sodium.tone, 'green')
  assert.equal(nutritionGuide({ ...favourable, proteinG: 0 }).signals.protein.tone, 'red')
  assert.equal(nutritionGuide({ ...favourable, sodiumMg: 1500, fibreG: null }).signals.sodium.tone, 'red')
  assert.equal(nutritionGuide({ ...favourable, sodiumMg: 1500, fibreG: null }).signals.fibre.tone, 'unknown')
})
test('protein cannot cancel high sodium and total fat/calories never stand in for fat quality', () => {
  assert.equal(nutritionGuide({ ...favourable, proteinG: 80, sodiumMg: 1500 }).signals.sodium.tone, 'red')
  assert.deepEqual(nutritionGuide({ ...favourable, fatG: 80, caloriesKcal: 2000 }), nutritionGuide(favourable))
})
test('known sharing orders are not classified as a single meal and input is immutable', () => {
  const sharing = Object.freeze({ ...favourable, assumptions: 'Sharing whole-fish scenario: full order, excluding rice.' })
  assert.equal(nutritionGuide(sharing).sharing, true)
  assert.ok(Object.values(nutritionGuide(sharing).signals).every((s) => s.tone === 'unknown'))
  assert.equal(sharing.sodiumMg, 600)
  assert.equal('tone' in nutritionGuide(sharing), false)
  assert.equal('label' in nutritionGuide(sharing), false)
})
