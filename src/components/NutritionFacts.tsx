import type { NutritionEstimate } from '../types/menu'
import { formatPercent, nutritionContext } from '../lib/nutritionGuide'

const number = new Intl.NumberFormat('en-SG', { maximumFractionDigits: 1 })

export function NutritionFacts({ estimate }: { estimate?: NutritionEstimate }) {
  if (!estimate) return <p className="mt-2 text-xs text-slate-500">Nutrition estimates unavailable</p>
  const context = nutritionContext(estimate)
  const sodiumNote = context.sodiumPercent !== null && estimate.sodiumMg !== null
    ? `${formatPercent(context.sodiumPercent, estimate.sodiumMg)} of the adult daily limit` : null
  const fibreNote = context.fibrePercent !== null && estimate.fibreG !== null
    ? `${formatPercent(context.fibrePercent, estimate.fibreG)} of the daily minimum` : null

  const facts = [
    ['Calories', estimate.caloriesKcal, 'kcal', null], ['Protein', estimate.proteinG, 'g', null],
    ['Carbs', estimate.carbsG, 'g', null], ['Total fat', estimate.fatG, 'g', null],
    ['Sodium', estimate.sodiumMg, 'mg', sodiumNote], ['Fibre', estimate.fibreG, 'g', fibreNote],
  ] as const

  return (
    <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
      {context.sharing && <p className="mt-1">Amounts are for the whole order, which is meant for sharing.</p>}
      <dl className="mt-2 grid grid-cols-2 gap-2">
        {facts.map(([label, value, unit, note]) => (
          <div key={label} className="min-w-0 rounded-md bg-slate-50 p-1.5">
            <dt className="inline">{label} </dt>
            <dd className="inline font-medium text-slate-800">
              {value === null ? 'Unavailable' : `≈${number.format(value)} ${unit}`}
            </dd>
            {note && <dd className="mt-0.5 text-slate-500">{note}</dd>}
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
