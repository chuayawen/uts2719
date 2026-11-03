import type { NutritionEstimate } from '../types/menu'
import { nutritionGuide, type GuideTone } from '../lib/nutritionGuide'

const number = new Intl.NumberFormat('en-SG', { maximumFractionDigits: 1 })
const colours: Record<GuideTone, string> = {
  green: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-900 ring-amber-200',
  red: 'bg-rose-50 text-rose-900 ring-rose-200',
  unknown: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function NutritionFacts({ estimate, expanded = false }: { estimate?: NutritionEstimate; expanded?: boolean }) {
  if (!estimate) return <p className="mt-2 text-xs text-slate-500">Nutrition estimates unavailable</p>
  const guide = nutritionGuide(estimate)

  const facts = [
    ['Calories', estimate.caloriesKcal, 'kcal', null], ['Protein', estimate.proteinG, 'g', guide.signals.protein],
    ['Carbs', estimate.carbsG, 'g', null], ['Total fat', estimate.fatG, 'g', null],
    ['Sodium', estimate.sodiumMg, 'mg', guide.signals.sodium], ['Fibre', estimate.fibreG, 'g', guide.signals.fibre],
  ] as const

  return (
    <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
      <p className="font-medium text-slate-500">{estimate.method === 'reference-recipe' ? 'HPB-based estimates per order' : 'AI estimates per order'}</p>
      <p className={`mt-2 inline-block rounded-md px-2 py-1 font-semibold ring-1 ring-inset ${colours[guide.tone]}`}>{guide.label}</p>
      <dl className="mt-2 grid grid-cols-2 gap-2">
        {facts.map(([label, value, unit, signal]) => (
          <div key={label} className={`min-w-0 rounded-md p-1.5 ${signal ? `${colours[signal.tone]} ring-1 ring-inset` : 'bg-slate-50'}`}>
            <dt className="inline">{label} </dt>
            <dd className="inline font-medium">
              {value === null ? 'Unavailable' : `≈${number.format(value)} ${unit}`}
            </dd>
            {signal && (value !== null || guide.sharing) && <p className="mt-0.5 text-[11px]">{signal.label}</p>}
          </div>
        ))}
      </dl>
      <p className="mt-2 leading-relaxed text-slate-500">Fat quality and processing: not assessed.</p>
      {estimate.method === 'reference-recipe' && !expanded && <p className="mt-1 text-slate-500">Assumed portions · open menu for details</p>}
      {expanded && <>
        <details className="mt-2">
          <summary className="cursor-pointer font-medium text-nus-blue">How to read this guide</summary>
          <p className="mt-2 leading-relaxed">An adult meal comparison using estimated amounts per order. Green means favourable on the three estimated nutrients only. Unknown data stays grey. Sides and snacks may need other foods; sharing dishes need a portion adjustment. Estimates near a cut-off may change colour with a different serving.</p>
          <table className="mt-2 w-full text-left text-[11px]">
            <caption className="mb-1 text-left font-medium">App meal guide — green / amber / red</caption>
            <tbody>
              <tr><th scope="row" className="pr-2">Sodium</th><td>≤600 / &gt;600–1,000 / &gt;1,000 mg</td></tr>
              <tr><th scope="row" className="pr-2">Protein</th><td>≥20 / 10–&lt;20 / &lt;10 g</td></tr>
              <tr><th scope="row" className="pr-2">Fibre</th><td>≥8 / 4–&lt;8 / &lt;4 g</td></tr>
            </tbody>
          </table>
          <p className="mt-2 leading-relaxed">These are app comparison bands, not official meal cut-offs or HPB certification. They use the WHO adult daily context of under 2,000 mg sodium, at least 25 g fibre and roughly 50–75 g protein at 2,000 kcal. The app allocates approximate meal shares; the amber/red boundaries are practical comparison choices.</p>
          <p className="mt-2 leading-relaxed">Total fat does not reveal saturated or trans fat. Ingredient lists and preparation details are needed to assess ultra-processing. Neither is inferred from a dish name or its macros, and neither contributes a positive score. Sugar, portion balance and other nutrients are also outside this guide.</p>
          <a className="mt-2 inline-block text-nus-blue underline" href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet" target="_blank" rel="noreferrer">WHO healthy diet guidance</a>
        </details>
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
