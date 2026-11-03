import Papa from 'papaparse'
import { NUTRITION_COLUMNS, parseMenuCsv } from '../src/lib/menu.js'

const menuColumns = ['id', 'name', 'price', 'canteen', 'stall', 'cuisine', 'dietary_tags', 'image', 'source']
const nutritionColumns = [...Object.keys(NUTRITION_COLUMNS), 'nutrition_status', 'nutrition_basis', 'nutrition_source']

function readCsv(text) {
  const parsed = Papa.parse(text.trimEnd(), { delimiter: ',', skipEmptyLines: 'greedy', dynamicTyping: false })
  if (parsed.errors.length) throw new Error('Invalid CSV: ' + parsed.errors[0].message)
  const [rawHeaders = [], ...rows] = parsed.data
  const headers = rawHeaders.map((v) => v.replace(/^\uFEFF/, '').trim())
  const named = headers.filter(Boolean)
  if (new Set(named).size !== named.length) throw new Error('Duplicate named CSV columns.')
  for (const column of menuColumns) if (!headers.includes(column)) throw new Error('Missing menu column: ' + column)
  return { headers, rows: rows.map((cells) => {
    if (cells.length !== headers.length) throw new Error('Uneven CSV row width.')
    if (headers.some((name, i) => !name && cells[i].trim())) throw new Error('Unnamed CSV column contains data.')
    return Object.fromEntries(headers.flatMap((key, i) => key ? [[key, cells[i]]] : []))
  }) }
}

/** Match stable IDs and exact menu identity. Never replace menu facts with an older upload. */
export function mergeNutritionEstimates(menuCsv, estimatesCsv, sourceName) {
  if (typeof sourceName !== 'string' || !sourceName.trim()) throw new Error('An estimate source name is required.')
  parseMenuCsv(menuCsv)
  const menu = readCsv(menuCsv), input = readCsv(estimatesCsv)
  for (const column of Object.keys(NUTRITION_COLUMNS)) if (!input.headers.includes(column)) throw new Error('Missing nutrition column: ' + column)
  const byId = new Map(menu.rows.map((row) => [row.id, row]))
  const seen = new Set()
  for (const row of input.rows) {
    if (seen.has(row.id)) throw new Error('Duplicate nutrition ID: ' + row.id)
    seen.add(row.id)
    const current = byId.get(row.id)
    if (!current) throw new Error('Nutrition ID is absent from the current menu: ' + row.id)
    for (const column of menuColumns.filter((c) => c !== 'source')) {
      if (current[column] !== row[column]) throw new Error('Menu identity changed for ' + row.id + ': ' + column)
    }
    const currentSources = new Set(current.source.split(';').map((v) => v.trim()).filter(Boolean))
    if (row.source.split(';').some((value) => value.trim() && !currentSources.has(value.trim()))) {
      throw new Error('Photo evidence changed for ' + row.id)
    }
    if (!Object.keys(NUTRITION_COLUMNS).some((column) => row[column].trim())) throw new Error('No estimates for ' + row.id)
    for (const column of Object.keys(NUTRITION_COLUMNS)) current[column] = row[column].trim()
    current.nutrition_status = 'ai-estimate'
    current.nutrition_basis = 'per-order'
    current.nutrition_source = sourceName.trim()
  }
  const fields = [...menu.headers, ...nutritionColumns.filter((column) => !menu.headers.includes(column))]
  const csv = Papa.unparse({ fields, data: menu.rows.map((row) => fields.map((column) => row[column] ?? '')) }, { newline: '\n' }) + '\n'
  const validated = parseMenuCsv(csv)
  return { csv, imported: input.rows.length, withEstimates: validated.filter((r) => r.nutrition).length,
    withoutEstimates: validated.filter((r) => !r.nutrition).length, total: validated.length }
}
