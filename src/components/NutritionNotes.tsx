import { GUIDE_THRESHOLDS } from '../lib/nutritionGuide'

/** Shared reference notes, shown once above the current menu. */
export function NutritionNotes() {
  const t = GUIDE_THRESHOLDS
  return (
    <details className="mx-4 my-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <summary className="cursor-pointer font-medium text-nus-blue">About nutrition</summary>
      <div className="mt-3 space-y-3 leading-relaxed">
        <p>≈ means “about”. Nutrition values are estimates for one order, based on AI estimates or similar foods in the Health Promotion Board (HPB) database. Stalls have not verified them. Portion size, sauces and cooking oil can change the actual amounts.</p>
        <p>Use the colours to compare nutrients:</p>
        <ul className="list-disc space-y-1 pl-4">
          <li><strong>Green:</strong> less sodium, or more protein or fibre.</li>
          <li><strong>Amber:</strong> between the green and red ranges.</li>
          <li><strong>Red:</strong> more sodium, or less protein or fibre.</li>
          <li><strong>Grey:</strong> missing information, or a dish meant for sharing.</li>
        </ul>
        <table className="w-full text-left text-xs [&_th]:py-1 [&_th]:pr-2 [&_td]:py-1 [&_td]:pr-2 [&_td]:align-top">
          <caption className="mb-1 text-left font-medium">Amounts for one order</caption>
          <thead><tr><th scope="col">Nutrient</th><th scope="col">Green</th><th scope="col">Amber</th><th scope="col">Red</th></tr></thead>
          <tbody>
            <tr><th scope="row">Sodium (mg)</th><td>{t.sodiumGreenMax} or less</td><td>Over {t.sodiumGreenMax} to {t.sodiumRedAbove.toLocaleString('en-SG')}</td><td>Over {t.sodiumRedAbove.toLocaleString('en-SG')}</td></tr>
            <tr><th scope="row">Protein (g)</th><td>{t.proteinGreenMin} or more</td><td>{t.proteinRedBelow} to under {t.proteinGreenMin}</td><td>Under {t.proteinRedBelow}</td></tr>
            <tr><th scope="row">Fibre (g)</th><td>{t.fibreGreenMin} or more</td><td>{t.fibreRedBelow} to under {t.fibreGreenMin}</td><td>Under {t.fibreRedBelow}</td></tr>
          </tbody>
        </table>
        <p>These ranges are a rough reference for adults, informed by World Health Organization (WHO) daily guidance. They are set by this app, not official WHO limits for a meal or an HPB certification.</p>
        <p>Consider your portion and the rest of your meals. A snack does not need to provide a whole meal’s nutrients. For shared dishes, consider only the amount you eat. A different serving size may change the colour.</p>
        <p>The colours do not rate a food’s overall healthiness. They cover only sodium, protein and fibre. Total fat does not tell us how much saturated or trans fat a food contains, and nutrition numbers do not tell us how processed it is.</p>
        <a className="inline-block text-nus-blue underline" href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet" target="_blank" rel="noreferrer">Read the WHO healthy eating advice</a>
      </div>
    </details>
  )
}
