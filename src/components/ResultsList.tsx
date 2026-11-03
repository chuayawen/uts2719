import { formatPrice } from '../lib/constants'
import type { CanteenSummary } from '../lib/summarise'
import type { MenuItem } from '../types/menu'
import { EmptyState } from './EmptyState'
import { FoodCard } from './FoodCard'

const PREVIEW_COUNT = 3

export interface ResultsListProps {
  summaries: CanteenSummary[]
  onSelectCanteen: (canteenId: string) => void
  onSelectItem: (item: MenuItem) => void
  /** Hovering a canteen's group emphasises its map pin. */
  onHoverCanteen?: (canteenId: string | null) => void
  onReset: () => void
}

/** Default panel view: matching dishes grouped by canteen. */
export function ResultsList({
  summaries,
  onSelectCanteen,
  onSelectItem,
  onHoverCanteen,
  onReset,
}: ResultsListProps) {
  const withResults = summaries.filter((s) => s.items.length > 0)

  return (
    <div className="px-4 pb-6">

      {withResults.length === 0 ? (
        <EmptyState onReset={onReset} />
      ) : (
        <ul>
          {withResults.map(({ canteen, items, minPrice }, index) => (
            <li
              key={canteen.id}
              className={`-mx-4 px-4 py-4 ${index > 0 ? 'border-t-8 border-slate-100' : ''}`}
              onMouseEnter={() => onHoverCanteen?.(canteen.id)}
              onMouseLeave={() => onHoverCanteen?.(null)}
            >
              <button
                type="button"
                onClick={() => onSelectCanteen(canteen.id)}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-slate-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900">{canteen.name}</span>
                  <span className="block truncate text-sm text-slate-500">
                    {canteen.area ?? canteen.location}
                    {minPrice !== null && `, from ${formatPrice(minPrice)}`}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-slate-500">
                  {items.length} {items.length === 1 ? 'dish' : 'dishes'}
                </span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="mt-1">
                {items.slice(0, PREVIEW_COUNT).map((item) => (
                  <FoodCard key={item.id} item={item} onSelect={onSelectItem} />
                ))}
              </div>
              {items.length > PREVIEW_COUNT && (
                <button
                  type="button"
                  onClick={() => onSelectCanteen(canteen.id)}
                  className="ml-2.5 mt-1 text-sm font-semibold text-nus-blue hover:underline"
                >
                  See all {items.length} dishes
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
