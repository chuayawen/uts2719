import type { NutritionEstimate } from '../types/menu'

const number = new Intl.NumberFormat('en-SG', { maximumFractionDigits: 1 })

export function NutritionFacts({ estimate, expanded = false }: { estimate?: NutritionEstimate; expanded?: boolean }) {
  if (!estimate) return <p className="mt-2 text-xs text-slate-500">Nutrition estimates unavailable</p>

  const facts = [
    ['Calories', estimate.caloriesKcal, 'kcal'], ['Protein', estimate.proteinG, 'g'],
    ['Carbs', estimate.carbsG, 'g'], ['Fat', estimate.fatG, 'g'],
    ...(expanded ? [['Sodium', estimate.sodiumMg, 'mg'], ['Fibre', estimate.fibreG, 'g']] as const : []),
  ] as const

  return (
    <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
      <p className="font-medium text-slate-500">{estimate.method === 'reference-recipe' ? 'HPB-based estimates per order' : 'AI estimates per order'}</p>
      <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
        {facts.map(([label, value, unit]) => (
          <div key={label} className="min-w-0">
            <dt className="inline">{label} </dt>
            <dd className="inline font-medium text-slate-700">
              {value === null ? 'Unavailable' : `≈${number.format(value)} ${unit}`}
            </dd>
          </div>
        ))}
      </dl>
      {estimate.method === 'reference-recipe' && !expanded && <p className="mt-1 text-slate-500">Assumed portions · open menu for details</p>}
      {expanded && <>
        <p className="mt-2 leading-relaxed text-slate-500">{estimate.method === 'reference-recipe'
          ? 'Calculated from comparable HPB foods and assumed portions. These are not HPB-verified stall values.'
          : 'Supplied AI estimates, not stall-verified.'} Portions, sauces and cooking oil may vary.</p>
        {estimate.method === 'reference-recipe' && <details className="mt-2">
          <summary className="cursor-pointer font-medium text-nus-blue">Portion assumptions and sources</summary>
          <p className="mt-2 break-words leading-relaxed">{estimate.assumptions}</p>
          <ul className="mt-2 space-y-1">
            {estimate.references?.map((reference) => <li key={reference.id}>
              <a className="text-nus-blue underline" href={`https://pphtpc.hpb.gov.sg/web/sgfoodid/tools/food-search/details/${reference.id}`} target="_blank" rel="noreferrer">{reference.name} (HPB)</a>
            </li>)}
          </ul>
        </details>}
      </>}
    </div>
  )
}
