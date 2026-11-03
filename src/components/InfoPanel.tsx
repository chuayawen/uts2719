import type { ReactNode } from 'react'

export interface InfoPanelProps {
  title: string
  /** Decorative 24×24 stroke icon paths. */
  icon: ReactNode
  children: ReactNode
}

/** Collapsible pink notes card shown above the menu. */
export function InfoPanel({ title, icon, children }: InfoPanelProps) {
  return (
    <details className="group mx-4 my-1.5 overflow-hidden rounded-xl bg-pink-50/70 text-xs text-slate-700">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-1.5 hover:bg-pink-100/60 [&::-webkit-details-marker]:hidden">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 text-pink-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
        <span className="min-w-0 flex-1 font-medium text-slate-700">{title}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 text-pink-500 transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="space-y-3 px-3 pb-3 pt-2 leading-relaxed">{children}</div>
    </details>
  )
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </section>
  )
}

export function InfoTip({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-slate-900" />
      <span>{children}</span>
    </li>
  )
}
