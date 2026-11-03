import type { MenuItem, NutritionEstimate } from '../types/menu'

/**
 * WHO adult daily reference amounts (Healthy diet fact sheet, 26 January 2026).
 * Used only to give context to one order's estimate, never to pass or fail a dish.
 */
export const DAILY_REFERENCES = Object.freeze({ sodiumMaxMg: 2000, fibreMinG: 25 })

export type NutritionSort = 'default' | 'less-sodium' | 'more-protein' | 'more-fibre'

export const NUTRITION_SORT_LABELS: Record<Exclude<NutritionSort, 'default'>, string> = {
  'less-sodium': 'Less sodium',
  'more-protein': 'More protein',
  'more-fibre': 'More fibre',
}

const known = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0

/** Whole-order sharing estimates describe several portions, not one person's meal. */
export const isSharingOrder = (estimate?: NutritionEstimate) => /\bsharing\b/i.test(estimate?.assumptions ?? '')

/** Rounds to the nearest 5% so rough estimates do not look precise. */
export function dailyPercent(value: unknown, reference: number): number | null {
  if (!known(value)) return null
  return Math.round((value / reference) * 20) * 5
}

/** Daily context for one order. Sharing orders and unknown values get no percentage. */
export function nutritionContext(estimate?: NutritionEstimate) {
  const sharing = isSharingOrder(estimate)
  return {
    sharing,
    sodiumPercent: sharing ? null : dailyPercent(estimate?.sodiumMg, DAILY_REFERENCES.sodiumMaxMg),
    fibrePercent: sharing ? null : dailyPercent(estimate?.fibreG, DAILY_REFERENCES.fibreMinG),
  }
}

/** "about 45%", or "under 5%" for a small but non-zero amount. */
export function formatPercent(percent: number, value: number) {
  return percent === 0 && value > 0 ? 'under 5%' : `about ${percent}%`
}

const SORT_FIELDS = {
  'less-sodium': { key: 'sodiumMg', direction: 1 },
  'more-protein': { key: 'proteinG', direction: -1 },
  'more-fibre': { key: 'fibreG', direction: -1 },
} as const

/**
 * Stable sort by one nutrient. Unknown values and sharing orders keep their
 * original order after the comparable dishes, so they are never ranked.
 */
export function sortByNutrition(items: MenuItem[], sort: NutritionSort): MenuItem[] {
  if (sort === 'default') return items
  const { key, direction } = SORT_FIELDS[sort]
  const value = (item: MenuItem) => {
    const amount = item.nutrition?.[key]
    return known(amount) && !isSharingOrder(item.nutrition) ? amount : null
  }
  return items
    .map((item, index) => ({ item, index, amount: value(item) }))
    .sort((a, b) => {
      if (a.amount === null || b.amount === null) {
        return a.amount === b.amount ? a.index - b.index : a.amount === null ? 1 : -1
      }
      return (a.amount - b.amount) * direction || a.index - b.index
    })
    .map(({ item }) => item)
}
