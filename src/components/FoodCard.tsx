import { useState } from 'react'
import { DIETARY_LABELS, formatPrice } from '../lib/constants'
import type { MenuItem } from '../types/menu'
import { NutritionFacts } from './NutritionFacts'

export interface FoodCardProps {
  item: MenuItem
  /** Shown after the stall name; omit when the canteen is already obvious. */
  canteenName?: string
  /** Visually marks the dish, e.g. after it was picked from the results list. */
  highlighted?: boolean
  onSelect?: (item: MenuItem) => void
  /** Called when the nutrition details open or close (menus without `onSelect`). */
  onToggle?: (open: boolean) => void
}

/** Compact dish row used in the results list and canteen menus. */
export function FoodCard({ item, canteenName, highlighted = false, onSelect, onToggle }: FoodCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const showImage = item.imageUrl && item.imageUrl !== failedImageUrl
  const [nutritionOpen, setNutritionOpen] = useState(highlighted)
  const nutritionId = `nutrition-${item.id}`


  const body = (
    <>
      {showImage && (
        <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setFailedImageUrl(item.imageUrl ?? null)}
            className="size-full object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-slate-900">{item.name}</h3>
          <span className="shrink-0 font-bold text-nus-blue">{formatPrice(item.price)}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-600">
          {item.stallName}
          {canteenName && <span className="text-slate-400">, {canteenName}</span>}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {[item.cuisine, ...item.dietary.map((tag) => DIETARY_LABELS[tag])].filter(Boolean).join(', ')}
        </p>
        <span className="sr-only">{onSelect ? 'View details' : nutritionOpen ? 'Hide nutrition' : 'View nutrition'}</span>
      </div>
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 shrink-0 self-center text-slate-400 transition ${!onSelect && nutritionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2}>
        <path d={onSelect ? 'm9 5 7 7-7 7' : 'm6 9 6 6 6-6'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  )

  const className = `flex w-full gap-3 rounded-xl p-2.5 text-left transition ${
    highlighted ? 'bg-pink-50' : ''
  }`

  if (onSelect) {
    return (
      <button
        type="button"
        id={`dish-${item.id}`}
        onClick={() => onSelect(item)}
        className={`${className} hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-nus-blue`}
      >
        {body}
      </button>
    )
  }
  return (
    <article id={`dish-${item.id}`} className={`rounded-xl ${highlighted ? 'bg-pink-50' : ''}`}>
      <button
        type="button"
        aria-expanded={nutritionOpen}
        aria-controls={nutritionId}
        onClick={() => {
          setNutritionOpen(!nutritionOpen)
          onToggle?.(!nutritionOpen)
        }}
        className={`flex w-full gap-3 rounded-xl p-2.5 text-left focus-visible:outline-2 focus-visible:outline-nus-blue ${highlighted ? "hover:bg-pink-100" : "hover:bg-slate-50"}`}
      >
        {body}
      </button>
      <div id={nutritionId} hidden={!nutritionOpen} className="px-3 pb-3">
        {nutritionOpen && <NutritionFacts estimate={item.nutrition} />}
      </div>
    </article>
  )
}
