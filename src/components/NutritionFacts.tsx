import type { NutritionEstimate } from '../types/menu'
import { nutritionGuide, type GuideTone } from '../lib/nutritionGuide'

const number = new Intl.NumberFormat('en-SG', { maximumFractionDigits: 1 })
const colours: Record<GuideTone, string> = {
  green: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-900 ring-amber-200',
  red: 'bg-rose-50 text-rose-900 ring-rose-200',
  unknown: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function NutritionFacts({ estimate }: { estimate?: NutritionEstimate }) {
  if (!estimate) return <p className="mt-2 text-xs text-slate-500">Nutrition estimates unavailable</p>
  const guide = nutritionGuide(estimate)

  const facts = [
    ['Calories', estimate.caloriesKcal, 'kcal', null], ['Protein', estimate.proteinG, 'g', guide.signals.protein],
    ['Carbs', estimate.carbsG, 'g', null], ['Total fat', estimate.fatG, 'g', null],
    ['Sodium', estimate.sodiumMg, 'mg', guide.signals.sodium], ['Fibre', estimate.fibreG, 'g', guide.signals.fibre],
  ] as const

  return (
    <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
      <dl className="mt-2 grid grid-cols-2 gap-2">
        {facts.map(([label, value, unit, signal]) => (
          <div key={label} className={`min-w-0 rounded-md p-1.5 ${signal ? `${colours[signal.tone]} ring-1 ring-inset` : 'bg-slate-50'}`}>
            <dt className="inline">{label} </dt>
            <dd className="inline font-medium">
              {value === null ? 'Unavailable' : `≈${number.format(value)} ${unit}`}
            </dd>
            {signal && (value !== null || guide.sharing) && <span className="sr-only"> — {signal.label}</span>}
          </div>
        ))}
      </dl>
        {estimate.method === 'reference-recipe' && <details className="mt-2">
          <summary className="cursor-pointer font-medium text-nus-blue">Portions and sources</summary>
          <p className="mt-2 break-words leading-relaxed">{estimate.assumptions}</p>
          <ul className="mt-2 space-y-1">
            {estimate.references?.map((reference) => <li key={reference.id}>
              <a className="text-nus-blue underline" href={`https://pphtpc.hpb.gov.sg/web/sgfoodid/tools/food-search/details/${reference.id}`} target="_blank" rel="noreferrer">{reference.name} (HPB)</a>
            </li>)}
          </ul>
        </details>}
    </div>
  )
}
