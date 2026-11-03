# NUS Food Finder

A responsive, map-first web app for browsing food across NUS campus canteens. Pins on a campus map show where matching dishes are; a side panel (desktop) or draggable bottom sheet (mobile) lists the menus. Built with React, TypeScript, Vite, Tailwind CSS v4 and Leaflet (with a MapLibre vector basemap), with no backend.

## Run it

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

Deploy to Vercel or Netlify as a Vite project: the build command is `npm run build` and the output directory is `dist`.

## Project layout

```
src/
  types/menu.ts          Shared data contracts (MenuItem, Canteen, MenuFilters, ...)
  data/index.ts          CSV defaults and optional labelled sample catalogue
  data/catalogue.ts      CSV-to-interface mapping and canteen validation
  data/mock/mockMenu.ts  MOCK data for UI preview only (not real menus)
  lib/filterMenu.ts      Search, canteen/cuisine/dietary filters and price slider
  lib/constants.ts       Dietary labels, empty filter state and map bounds
  lib/summarise.ts       Groups filtered results by canteen for pins and the list
  hooks/                 Dataset loading/retry, filter UI state, viewport helpers
  data/nusCampus.ts      NUS campus outlines (from OpenStreetMap) for the NUS-only map
  components/map/        Leaflet map, canteen pins, minimal campus basemap
  components/            Panel views (ResultsList, CanteenDetail), FoodCard, SearchBar,
                         QuickFilters chip row, FilterSheet, BottomSheet
  App.tsx                Layout and wiring (desktop side panel vs mobile bottom sheet)
```

## Integration guide (Person 2)

The latest interface is connected through `useMenuCatalogue`: one dataset drives the filter choices, slider limits, cards, results and map pins. Loading, failed loading/retry, missing menu data and no matching results have separate states.

1. **Dataset: `src/data/index.ts`.** CSV mode is the default. It loads the checked-in photo-supported menus and sourced canteen metadata, then maps their fields to the shared UI types. CSV errors never silently fall back to sample records.
2. **Search and filtering: `src/lib/filterMenu.ts`.** The existing controls call the shared filtering logic, including the continuous price slider and all selected dietary tags. Changing a filter returns to the matching-results list, and clearing an empty search resets both the query and filters.

How `MenuFilters` is defined (an empty value means no restriction):

| Field          | Set by                         | Meaning                                  |
| -------------- | ------------------------------ | ---------------------------------------- |
| `query`        | Search bar (every keystroke)   | Raw search text                          |
| `canteenId`    | Filter dropdown                | One `Canteen.id`, or `null` for all      |
| `stallId`      | Stall dropdown                 | One distinct stall within its canteen, or `null` for all |
| `cuisines`     | Quick chips + filter sheet     | Match **any** selected cuisine           |
| `priceRange`   | Price slider                   | `{ min, max }` in SGD, inclusive; `null` means any price |
| `dietary`      | Quick chips + filter sheet     | Item must have **all** selected tags |

Other notes:

- The stall dropdown follows the selected canteen. With all canteens selected, each stall label includes its canteen so repeated names remain distinguishable. Changing canteens clears the previous stall. Stall selection combines with every other filter and is included in the active-filter count.

- Every `Canteen` needs `coordinates: { lat, lng }` for its map pin. The mock coordinates are approximate, so use the real ones from the dataset or check them on a map.
- Pins and the list are built from whatever `filterMenuItems` returns. A canteen with no matching dishes stays on the map as a small grey pin.
- Clicking a pin opens that canteen in the panel. This is UI state and separate from the `canteenId` filter.
- The basemap is OpenFreeMap's free, keyless full-colour "Liberty" vector style, with shop/place icons, place names, road shields, one-way arrows and 3D buildings removed (`HIDDEN_LAYER` in `CampusBasemap.tsx`). Everything outside the NUS outline is covered in grey, and panning and zooming are limited to campus (`NUS_MAX_BOUNDS`, `minZoom` in `MapView.tsx`).
- The map code (MapLibre) is about 335 KB gzipped, so it's lazy-loaded and the panel appears first. Vite's "chunk larger than 500 kB" warning is expected.
- `MenuItem.imageUrl` is optional. When it's missing or the image fails to load, the card shows a plain placeholder.
- `DietaryTag` is a union in `types/menu.ts`. If the dataset has more tags, add them there and in `DIETARY_LABELS`, and the compiler will flag anything else that needs updating.
- The price slider spans `filterOptions.priceBounds`, which is the cheapest to dearest dish rounded to whole dollars, in $0.50 steps.
- Blank CSV prices stay unknown: cards show "Price unavailable", active price filters exclude them, and map summaries do not turn them into $0.00. Unknown cuisine and dietary attributes are not inferred.
- `FoodCard` accepts an optional `onSelect` callback if a dish detail view is added later.

## Update the menu data

The default build loads `public/data/menu.csv` and `public/data/canteens.json` without environment setup. The published catalogue contains 842 priced dish variants at seven canteens. See [data sources and scope](public/data/README.md) for coverage, photographed prices and location evidence. Replace the CSV or edit rows using stable IDs, run the checks below, and redeploy to publish updates.

All 842 variants carry nutrition estimates: 559 supplied estimates and 283 calculated from HPB food references and explicit portion scenarios. Food lists show compact dish details. Click a dish to open its nutrition estimates, comparison colours, portion assumptions and source links; click again to collapse it. Selecting a search result opens that dish in its canteen menu. Individual unavailable or trace source values stay unknown. See the [nutrition methods and limitations](public/data/README.md#nutrition-estimates) before updating these values.

For custom file locations, copy `.env.example` to `.env.local` and override these settings. Restart Vite after changing environment settings.

```dotenv
VITE_MENU_SOURCE=csv
VITE_MENU_CSV_FILES=["data/menu.csv"]
VITE_CANTEENS_URL=data/canteens.json
```

`VITE_MENU_CSV_FILES` accepts a JSON array of one or multiple public CSV URLs. Relative data/image URLs respect Vite's deployment base path. `canteens.json` is an array of canteens with a unique `id`, `name`, and numeric `coordinates.lat` / `coordinates.lng`; `location` and `openingHours` are optional text. Each menu CSV's `canteen` must match an exact canteen ID or an unambiguous name. See [the data handoff](docs/person-2-handoff.md) for the menu column format.

Set `VITE_MENU_SOURCE=preview` only when testing the labelled fictional demo. Empty CSV files show that menus are not available yet; loading failures show a retry state.

## Verify changes

Use Node.js 24 LTS (`.nvmrc` pins 24.16.0).

```sh
npm test
npm run lint
npm run build
npm run test:build
npm run validate:menu
```

CI checks the published CSV and canteen mappings, tests, lint, type checking and builds. Menu validation rejects empty datasets, duplicate IDs, invalid prices/tags and unknown locations. Add only source-supported menu content and dietary evidence.

See [the responsive QA report](docs/device-qa.md) for the tested browser sizes, scenarios, fixes and remaining physical-device checks.
