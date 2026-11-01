import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { buildFilterOptions, loadCatalogue } from '../src/data/catalogue.ts'
import { EMPTY_FILTERS } from '../src/lib/constants.ts'
import { filterMenuItems } from '../src/lib/filterMenu.ts'
import { getStallId } from '../src/lib/stalls.ts'
import { summariseByCanteen } from '../src/lib/summarise.ts'
import { parseMenuCsv } from '../src/lib/menu.js'

const preview = { canteens: [], menuItems: [], filterOptions: buildFilterOptions([], []), isPreview: true }
const catalogue = await loadCatalogue({ source: 'csv', baseUrl: '/uts2719/' }, preview, {
  fetchImpl: async (url) => {
    const path = new URL(`../public/${url.replace('/uts2719/', '')}`, import.meta.url)
    const text = await readFile(path, 'utf8')
    return { ok: true, text: async () => text, json: async () => JSON.parse(text) }
  },
})

test('published CSV loads with map locations and evidence for every dish', async () => {
  assert.equal(catalogue.isPreview, false)
  assert.ok(catalogue.menuItems.length > 0)
  assert.equal(new Set(catalogue.menuItems.map((item) => item.id)).size, catalogue.menuItems.length)
  const summaries = summariseByCanteen(catalogue.canteens, catalogue.menuItems)
  assert.equal(summaries.reduce((sum, entry) => sum + entry.items.length, 0), catalogue.menuItems.length)
  assert.ok(summaries.every((entry) => entry.items.length > 0))
  assert.ok(catalogue.menuItems.every((item) => item.price !== null))
  const records = parseMenuCsv(await readFile(new URL('../public/data/menu.csv', import.meta.url), 'utf8'))
  assert.ok(records.every((item) => item.source && !/mock|sample/i.test(item.stall)))
  const metadata = JSON.parse(await readFile(new URL('../public/data/canteens.json', import.meta.url), 'utf8'))
  assert.ok(metadata.every((canteen) => canteen.sources.directory.startsWith('https://uci.nus.edu.sg/')))
})

test('published Terrace stall filter combines search and inclusive budget without leaking other stalls', () => {
  const results = filterMenuItems(catalogue.menuItems, {
    ...EMPTY_FILTERS,
    canteenId: 'the-terrace',
    stallId: getStallId('the-terrace', 'Teng Sheng Japanese & Korean Cuisine'),
    query: 'chicken',
    priceRange: { min: 3, max: 5.8 },
  }, catalogue.filterOptions)
  assert.ok(results.length > 0)
  assert.ok(results.every((item) => item.canteenId === 'the-terrace'
    && item.stallName === 'Teng Sheng Japanese & Korean Cuisine' && item.price >= 3 && item.price <= 5.8))
  assert.ok(results.some((item) => item.name === 'Value Meal Chicken Rice' && item.price === 3))
})
