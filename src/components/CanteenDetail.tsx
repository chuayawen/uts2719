import { useEffect, useState } from 'react'
import { formatPrice } from '../lib/constants'
import type { CanteenSummary } from '../lib/summarise'
import { FoodCard } from './FoodCard'

export interface CanteenDetailProps {
  summary: CanteenSummary
  onBack: () => void
  /** Dish to scroll to and highlight, e.g. picked from the results list. */
  highlightedItemId?: string | null
}

/** Panel view for one canteen: details plus its matching menu. */
export function CanteenDetail({ summary, onBack, highlightedItemId }: CanteenDetailProps) {
  const { canteen, items, minPrice } = summary
  const { lat, lng } = canteen.coordinates
  // The outline starts on the dish picked from the results list, then follows the dish the user opens.
  const [activeItemId, setActiveItemId] = useState(highlightedItemId ?? null)
  const [lastHighlightedId, setLastHighlightedId] = useState(highlightedItemId)
  if (highlightedItemId !== lastHighlightedId) {
    setLastHighlightedId(highlightedItemId)
    setActiveItemId(highlightedItemId ?? null)
  }

  useEffect(() => {
    if (!highlightedItemId) return
    document.getElementById(`dish-${highlightedItemId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [highlightedItemId])

  return (
    <div className="pb-6">
      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 items-center gap-1 rounded-full pl-1.5 pr-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All results
        </button>
      </div>

      <div className="px-4 pt-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{canteen.name}</h2>
        <p className="mt-0.5 text-sm text-slate-600">{canteen.location}</p>

        {canteen.openingHours && <OpeningHours text={canteen.openingHours} />}

        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <div className="flex gap-1.5">
            <dt className="sr-only">Matching dishes</dt>
            <dd className="text-slate-600">
              {items.length} {items.length === 1 ? 'dish' : 'dishes'}
              {minPrice !== null && `, from ${formatPrice(minPrice)}`}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-nus-blue px-4 text-sm font-semibold text-white hover:bg-nus-blue-dark"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
              <path d="M3 11 21 3l-8 18-2-8-8-2Z" />
            </svg>
            Directions
          </a>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 px-2 pt-3">
        <h3 className="px-2.5 pb-1 text-sm font-semibold text-slate-900">Menu</h3>
        {items.length === 0 ? (
          <p className="px-2.5 py-6 text-sm text-slate-500">No dishes here match your current search and filters.</p>
        ) : (
          items.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              highlighted={item.id === activeItemId}
              onToggle={(open) => setActiveItemId((current) => open ? item.id : current === item.id ? null : current)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Splits text like "Mon–Fri 7am–8pm, Sat 7:30am–2pm; closed Sun/PH; individual stall hours vary"
 * into day/time rows, closures and a footnote. Text that does not fit the pattern is shown as written.
 */
function OpeningHours({ text }: { text: string }) {
  const parts = text.split(';').map((part) => part.trim()).filter(Boolean)
  const footnotes = parts.filter((part) => /^individual stall/i.test(part))
  const closed = parts.filter((part) => /^closed\b/i.test(part))
  const rows = parts
    .filter((part) => !footnotes.includes(part) && !closed.includes(part))
    .flatMap((part) => part.split(/,\s*/))
    .map((row): [string | null, string] => {
      const match = row.match(/^([A-Za-z]+(?:[–-][A-Za-z]+)?)\s+(\d.*)$/)
      return match ? [match[1], match[2]] : [null, row]
    })

  return (
    <section aria-label="Opening hours" className="mt-3 rounded-2xl bg-pink-50 px-3.5 py-3 text-sm">
      <div className="flex items-start gap-2.5">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-pink-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <div className="min-w-0 flex-1">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
            {rows.map(([day, time], index) => day ? (
              <div key={index} className="contents">
                <dt className="font-semibold text-slate-900">{day.replace(/[–—]/g, '-')}</dt>
                <dd className="text-slate-700">{time.replace(/\s*[–—]\s*/g, ' to ')}</dd>
              </div>
            ) : (
              <div key={index} className="col-span-2"><dd className="text-slate-700">{time.replace(/\s*[–—]\s*/g, ' to ')}</dd></div>
            ))}
          </dl>
          {closed.map((note) => (
            <p key={note} className="mt-1 text-slate-500">{note.charAt(0).toUpperCase() + note.slice(1)}</p>
          ))}
          {footnotes.map((note) => (
            <p key={note} className="mt-1.5 text-xs text-slate-500">{note.charAt(0).toUpperCase() + note.slice(1)}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
