# Published menu data

`menu.csv` contains 842 priced dish/portion variants across seven canteens, updated on 2 November 2026 from the reviewed photograph extraction. Every row has a source photograph reference. Prices are SGD as printed in those photographs, which span 2025 and 2026; the update date does not mean prices or availability were checked with vendors on that date.

| Canteen | Dish variants |
| --- | ---: |
| Fine Food | 94 |
| Techno Edge | 81 |
| The Terrace | 81 |
| Yusof Ishak House | 29 |
| The Deck | 126 |
| Flavours | 252 |
| Frontier | 179 |

Only legible item names/prices with supported stall identities are included. Uncertain entries and the unidentified IMG_7578 stall remain excluded. Separate sizes/proteins have separate IDs. Drinks, individual ingredients, add-ons and takeaway fees from the full extraction are excluded from dish search. Original photographs are not distributed with the site.

The 2 November update adds 283 dish variants from the user-confirmed Frontier and The Deck batches. Matching Ba Wei records keep their IDs and gain source references. Conflicting board prices, unclear size/price mappings and variable prices remain excluded. Where a trading name is not visible, the stall sign or a descriptive menu-group label identifies the photographed counter; that label does not assert a vendor brand.

Dietary tags preserve explicit evidence from photographed signs. Missing tags mean no recorded claim; they do not establish suitability. A no-pork/no-lard statement is not treated as halal certification. The site does not infer allergens or current certification.

## Nutrition estimates

559 dish variants have user-supplied AI estimates from `nus_canteen_menu_nutrition_estimates.csv`. The other 283 variants have no supplied estimates and display “Nutrition estimates unavailable”. The original menu facts and all 842 record IDs are preserved. Estimates match by ID and exact dish/canteen/stall/price identity, rather than row order or similar names.

Optional columns `calories_kcal`, `protein_g`, `total_carbs_g`, `fats_g`, `sodium_mg` and `fibre_g` contain values per menu order. Their metadata must state `nutrition_status=ai-estimate`, `nutrition_basis=per-order` and `nutrition_source=<source filename>`. Blank values mean unavailable; zero means an explicit estimate of zero. Older CSVs without nutrition columns still load. Spacer columns in the supplied file are removed from the app CSV.

These figures are AI-generated estimates, not laboratory results, vendor measurements or independently verified nutrition. Portions, sauces and cooking oil may vary. They are separate from calorie claims printed in the source photographs. The supplier mentioned [HPB SG FoodID](https://www.hpb.gov.sg/healthy-living/food-and-beverage/sgfoodid/) generally, but supplied no dish-level database IDs, recipes or portion mappings. The app does not label the estimates as HPB-verified. `nutrition-provenance.json` records the input hash, basis and coverage.

To import a later edited copy with the same menu identity columns and six nutrition columns:

```sh
node scripts/import-nutrition-estimates.js path/to/estimates.csv
```

The importer validates the entire result before writing, rejects duplicate/unknown IDs and changed menu identities, retains newer photo references, and preserves any existing estimates for dishes absent from the upload. Review the resulting diff, run the checks below, and redeploy.

`canteens.json` uses the NUS UCI dining directory for building associations and published hours, with NUS Campus Map or Singapore OneMap coordinates. Each record includes source URLs and the location-check date. Coordinates locate the canteen or its building, not individual stalls; Fine Food uses its Town Plaza building pin. Hours belong to the canteen and may differ by stall.

To update menus, edit or replace `menu.csv` using the same columns and stable IDs, then run `npm run validate:menu`, `npm test`, `npm run lint`, and `npm run build`. Commit and deploy the new version. Set `VITE_MENU_SOURCE=preview` only to use the explicitly labelled fictional demo.
