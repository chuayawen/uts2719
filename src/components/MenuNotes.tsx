import { InfoPanel, InfoTip } from './InfoPanel'

/** Shared notes on where prices and dietary labels come from, shown once above the menu. */
export function MenuNotes() {
  return (
    <InfoPanel
      title="About prices and dietary info"
      icon={<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>}
    >
      <ul className="space-y-1.5">
        <InfoTip>Prices are from photographed menus and may change. “Price unavailable” means the photo did not show one.</InfoTip>
        <InfoTip>Dietary labels appear only where the menu or stall information shows them. The app does not guess them from a dish’s name.</InfoTip>
        <InfoTip>“No pork, no lard” is not the same as halal.</InfoTip>
        <InfoTip>The app has no allergen information. Confirm dietary requirements with the stall.</InfoTip>
      </ul>
    </InfoPanel>
  )
}
