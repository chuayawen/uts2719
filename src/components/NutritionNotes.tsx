import { GUIDE_THRESHOLDS } from '../lib/nutritionGuide'

/** Shared reference notes, shown once above the current menu. */
export function NutritionNotes() {
  const t = GUIDE_THRESHOLDS
  return (
    <details className="mx-4 my-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <summary className="cursor-pointer font-medium text-nus-blue">About nutrition</summary>
      <div className="mt-3 space-y-3 leading-relaxed">
        <p>Numbers marked ≈ are estimates per order, from supplied AI estimates or calculations using comparable HPB foods and assumed portions. They are not stall-verified. Portions, sauces and cooking oil may vary.</p>
        <p>Colours help compare individual nutrients; there is no overall food rating. Green indicates lower sodium or higher protein/fibre, amber is the middle band, red indicates higher sodium or lower protein/fibre, and grey means unavailable data or a sharing order.</p>
        <table className="w-full text-left text-[11px]">
          <caption className="mb-1 text-left font-medium">Colour key — amounts per order</caption>
          <thead><tr><th scope="col">Nutrient</th><th scope="col">Green</th><th scope="col">Amber</th><th scope="col">Red</th></tr></thead>
          <tbody>
            <tr><th scope="row">Sodium (mg)</th><td>≤{t.sodiumGreenMax}</td><td>&gt;{t.sodiumGreenMax}–{t.sodiumRedAbove}</td><td>&gt;{t.sodiumRedAbove}</td></tr>
            <tr><th scope="row">Protein (g)</th><td>≥{t.proteinGreenMin}</td><td>{t.proteinRedBelow}–&lt;{t.proteinGreenMin}</td><td>&lt;{t.proteinRedBelow}</td></tr>
            <tr><th scope="row">Fibre (g)</th><td>≥{t.fibreGreenMin}</td><td>{t.fibreRedBelow}–&lt;{t.fibreGreenMin}</td><td>&lt;{t.fibreRedBelow}</td></tr>
          </tbody>
        </table>
        <p>These app-defined bands use approximate adult meal shares of WHO daily guidance: under 2,000 mg sodium, at least 25 g fibre and roughly 50–75 g protein at 2,000 kcal. They are not official meal cut-offs or HPB certification. A side or snack need not provide a whole meal's nutrients; adjust sharing orders to your portion. Estimates near a boundary may change colour with serving size.</p>
        <p>Colours cover only sodium, protein and fibre. Total fat does not identify saturated or trans fat, and macros cannot establish how processed the ingredients are. Consider your portion, other foods and individual needs when choosing.</p>
        <a className="inline-block text-nus-blue underline" href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet" target="_blank" rel="noreferrer">WHO healthy diet reference</a>
      </div>
    </details>
  )
}
