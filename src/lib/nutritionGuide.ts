import type { NutritionEstimate } from '../types/menu'

export type GuideTone = 'green' | 'amber' | 'red' | 'unknown'
export interface NutrientSignal { tone: GuideTone; label: string }
export const GUIDE_THRESHOLDS = Object.freeze({ sodiumGreenMax: 600, sodiumRedAbove: 1000,
  proteinGreenMin: 20, proteinRedBelow: 10, fibreGreenMin: 8, fibreRedBelow: 4 })

const known = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0

/** App meal-comparison heuristics, not official food certification or a whole-diet assessment. */
export function nutritionGuide(estimate?: NutritionEstimate) {
  const t = GUIDE_THRESHOLDS
  const sharing = /\bsharing\b/i.test(estimate?.assumptions ?? '')
  const signal = (value: unknown, green: number, red: number, lower: boolean): NutrientSignal => {
    if (!known(value) || sharing) return { tone: 'unknown', label: sharing ? 'Per whole order' : 'Unavailable' }
    const tone = lower ? value <= green ? 'green' : value > red ? 'red' : 'amber'
      : value >= green ? 'green' : value < red ? 'red' : 'amber'
    return { tone, label: tone === 'green' ? 'Within guide' : tone === 'red' ? lower ? 'High for a meal' : 'Low for a meal' : 'Watch' }
  }
  const signals = {
    sodium: signal(estimate?.sodiumMg, t.sodiumGreenMax, t.sodiumRedAbove, true),
    protein: signal(estimate?.proteinG, t.proteinGreenMin, t.proteinRedBelow, false),
    fibre: signal(estimate?.fibreG, t.fibreGreenMin, t.fibreRedBelow, false),
  }
  return { signals, sharing }
}
