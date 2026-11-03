import { InfoPanel, InfoSection, InfoTip } from './InfoPanel'
import { DAILY_REFERENCES } from '../lib/nutritionGuide'

/** Shared reference notes, shown once above the current menu. */
export function NutritionNotes() {
  const r = DAILY_REFERENCES
  return (
    <InfoPanel
      title="About nutrition"
      icon={<path d="M12 8c0-2.5 1.5-4 4-4M12 8c-2-1.5-5-1.5-6.5.5C3.5 11 4.5 16 7 19c1.5 1.8 3.2 2.2 5 1.2 1.8 1 3.5.6 5-1.2 2.5-3 3.5-8 1.5-10.5C17 6.5 14 6.5 12 8Z" />}
    >
      <p>≈ means “about”. Nutrition values are estimates for one order, based on AI estimates or similar foods in the Health Promotion Board (HPB) database. Stalls have not verified them. Portion size, sauces and cooking oil can change the actual amounts.</p>

      <InfoSection title="Daily amounts for adults (WHO)">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Sodium" value={`< ${r.sodiumMaxMg.toLocaleString('en-SG')} mg`} />
          <Stat label="Fibre" value={`≥ ${r.fibreMinG} g`} />
          <Stat label="Protein" value="Varies" />
        </div>
        <p className="mt-2">Dish details compare sodium and fibre with these amounts. Protein is shown as an amount only, because needs depend on body size and activity. These are daily amounts, not targets for a single meal, and the app does not mark any dish as good or bad.</p>
      </InfoSection>

      <InfoSection title="Comparing dishes">
        <ul className="space-y-1.5">
          <InfoTip>Sort with <strong>Less sodium</strong>, <strong>More protein</strong> or <strong>More fibre</strong> alongside your other filters.</InfoTip>
          <InfoTip>Compare similar foods: meals with meals, and snacks or sides with other snacks or sides.</InfoTip>
          <InfoTip>Small differences, like 19 g against 20 g of protein, are within the margin of these estimates.</InfoTip>
          <InfoTip>Dishes with missing values, and dishes meant for sharing, are listed last when sorting. For shared dishes, consider only the amount you eat.</InfoTip>
        </ul>
      </InfoSection>

      <p className="rounded-xl bg-white/70 p-2.5 text-slate-600">These numbers do not rate a food’s overall healthiness. Total fat does not tell us how much saturated or trans fat a food contains, and nutrition numbers do not tell us how processed it is.</p>

      <a className="inline-flex items-center gap-1 font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900" href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet" target="_blank" rel="noreferrer">
        Read the WHO healthy eating advice
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </InfoPanel>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-2 py-1.5 text-center">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}
