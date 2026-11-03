import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toggleInList } from '../hooks/useMenuFilters'
import { DIETARY_LABELS, formatPrice } from '../lib/constants'
import { NUTRITION_SORT_LABELS, type NutritionSort } from '../lib/nutritionGuide'
import type { FilterOptions, MenuFilters } from '../types/menu'
import { Chip } from './Chip'
import { PriceSlider } from './PriceSlider'

export interface QuickFiltersProps {
  filters: MenuFilters
  options: FilterOptions
  onChange: (patch: Partial<MenuFilters>) => void
  onOpenAllFilters: () => void
  activeFilterCount: number
}

type Menu = 'price' | 'sort' | 'dietary' | 'cuisine'
/** Widest popover (the price slider, w-72). */
const POPOVER_MAX_WIDTH = 288

/** "Cuisine", the one selected name, or "Cuisine (2)". */
function groupLabel(name: string, selected: string[]) {
  if (selected.length === 0) return name
  if (selected.length === 1) return selected[0]
  return `${name} (${selected.length})`
}

/** Chip row over the map: each group opens its own small menu, like map apps' category chips. */
export function QuickFilters({ filters, options, onChange, onOpenAllFilters, activeFilterCount }: QuickFiltersProps) {
  const [openMenu, setOpenMenu] = useState<Menu | null>(null)
  const [popoverLeft, setPopoverLeft] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openMenu) return
    function close(event: PointerEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [openMenu])

  function toggleMenu(menu: Menu) {
    // Open the menu under its chip, kept inside the row so it never runs off screen.
    const root = rootRef.current
    const chip = root?.querySelector(`[data-menu="${menu}"]`)
    if (root && chip) {
      const rootBox = root.getBoundingClientRect()
      const left = chip.getBoundingClientRect().left - rootBox.left
      setPopoverLeft(Math.max(0, Math.min(left, rootBox.width - POPOVER_MAX_WIDTH)))
    }
    setOpenMenu((open) => open === menu ? null : menu)
  }
  const { priceRange } = filters

  return (
    // The popovers sit outside the scrolling row, which would otherwise clip them.
    <div ref={rootRef} className="relative">
      <div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-1">
        <button
          type="button"
          onClick={onOpenAllFilters}
          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-nus-blue text-xs text-white">{activeFilterCount}</span>
          )}
        </button>

        <Divider />
        <MenuChip menu="price" open={openMenu === 'price'} selected={priceRange !== null} onClick={() => toggleMenu('price')}>
          {priceRange ? `${formatPrice(priceRange.min)} to ${formatPrice(priceRange.max)}` : 'Price'}
        </MenuChip>
        <MenuChip menu="sort" open={openMenu === 'sort'} selected={filters.sort !== 'default'} onClick={() => toggleMenu('sort')}>
          {filters.sort === 'default' ? 'Sort' : NUTRITION_SORT_LABELS[filters.sort]}
        </MenuChip>
        <MenuChip menu="dietary" open={openMenu === 'dietary'} selected={filters.dietary.length > 0} onClick={() => toggleMenu('dietary')}>
          {groupLabel('Dietary', filters.dietary.map((tag) => DIETARY_LABELS[tag]))}
        </MenuChip>
        <MenuChip menu="cuisine" open={openMenu === 'cuisine'} selected={filters.cuisines.length > 0} onClick={() => toggleMenu('cuisine')}>
          {groupLabel('Cuisine', filters.cuisines)}
        </MenuChip>
      </div>

      {openMenu === 'price' && (
        <Popover left={popoverLeft} label="Price range" className="w-72 p-4">
          <PriceSlider bounds={options.priceBounds} value={priceRange} onChange={(next) => onChange({ priceRange: next })} />
        </Popover>
      )}

      {openMenu === 'sort' && (
        <Popover left={popoverLeft} label="Sort dishes" className="w-60 p-2">
          <PopoverTitle>Sort by estimated nutrition</PopoverTitle>
          {([['default', 'Menu order'], ...Object.entries(NUTRITION_SORT_LABELS)] as [NutritionSort, string][]).map(([sort, label]) => (
            <Option
              key={sort}
              selected={filters.sort === sort}
              onClick={() => {
                onChange({ sort })
                setOpenMenu(null)
              }}
            >
              {label}
            </Option>
          ))}
        </Popover>
      )}

      {openMenu === 'dietary' && (
        <Popover left={popoverLeft} label="Dietary" className="w-60 p-2">
          <PopoverTitle onClear={filters.dietary.length ? () => onChange({ dietary: [] }) : undefined}>Dietary</PopoverTitle>
          {options.dietary.map((tag) => (
            <Option key={tag} selected={filters.dietary.includes(tag)} onClick={() => onChange({ dietary: toggleInList(filters.dietary, tag) })}>
              {DIETARY_LABELS[tag]}
            </Option>
          ))}
        </Popover>
      )}

      {openMenu === 'cuisine' && (
        <Popover left={popoverLeft} label="Cuisine" className="w-64 p-2">
          <PopoverTitle onClear={filters.cuisines.length ? () => onChange({ cuisines: [] }) : undefined}>Cuisine</PopoverTitle>
          <div className="max-h-72 overflow-y-auto">
            {options.cuisines.map((cuisine) => (
              <Option key={cuisine} selected={filters.cuisines.includes(cuisine)} onClick={() => onChange({ cuisines: toggleInList(filters.cuisines, cuisine) })}>
                {cuisine}
              </Option>
            ))}
          </div>
        </Popover>
      )}
    </div>
  )
}

function MenuChip({ menu, open, selected, onClick, children }: { menu: Menu; open: boolean; selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <span data-menu={menu} className="shrink-0">
    <Chip floating selected={selected} onClick={onClick}>
      {children}
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-3.5 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Chip>
    </span>
  )
}

function Popover({ left, label, className, children }: { left: number; label: string; className: string; children: ReactNode }) {
  return (
    <div
      role="dialog"
      aria-label={label}
      style={{ left }}
      className={`absolute top-full z-10 mt-2 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-lg ring-1 ring-black/5 ${className}`}
    >
      {children}
    </div>
  )
}

function PopoverTitle({ children, onClear }: { children: ReactNode; onClear?: () => void }) {
  return (
    <div className="flex items-center justify-between px-2.5 pb-1 pt-1.5">
      <p className="text-sm font-semibold text-slate-900">{children}</p>
      {onClear && (
        <button type="button" onClick={onClear} className="text-xs font-medium text-nus-blue hover:underline">Clear</button>
      )}
    </div>
  )
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-2.5 text-left text-sm hover:bg-slate-50 ${
        selected ? 'font-semibold text-nus-blue' : 'text-slate-700'
      }`}
    >
      {children}
      {selected && (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function Divider() {
  return <span aria-hidden="true" className="h-6 w-px shrink-0 bg-slate-300/80" />
}
