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

All 842 dish variants now have nutrition estimates. The 559 user-supplied AI estimates from `nus_canteen_menu_nutrition_estimates.csv` are unchanged. On 3 November 2026, the remaining 283 variants gained reference-based estimates using 142 retrieved [HPB SG FoodID food records](https://www.hpb.gov.sg/healthy-living/food-and-beverage/sgfoodid/), with an explicit portion scenario for each dish. The original menu facts and all record IDs are preserved. Estimates join by stable ID and dish identity, never by row position or a fuzzy name match.

Optional columns `calories_kcal`, `protein_g`, `total_carbs_g`, `fats_g`, `sodium_mg` and `fibre_g` contain values per menu order. Their metadata must state `nutrition_status=ai-estimate`, `nutrition_basis=per-order` and `nutrition_source=<source filename>`. Blank values mean unavailable; zero means an explicit estimate of zero. Older CSVs without nutrition columns still load. Spacer columns in the supplied file are removed from the app CSV.

These figures are AI-generated estimates, not vendor measurements or independently verified nutrition. Portions, sauces and cooking oil may vary. They are separate from calorie claims printed in the source photographs. The original supplier cited HPB generally but supplied no dish-level records or portion mappings. That original batch remains identified by its input filename and SHA-256 in `nutrition-provenance.json`; the new calculation batch has separate provenance. None of the estimates are presented as HPB-verified stall nutrition.

The new batch adds `nutrition_method=reference-recipe`, `nutrition_assumptions` and `nutrition_references` (a JSON list of HPB food IDs/names). Canteen menu rows expose the assumed portions and clickable HPB sources. Compact cards flag assumed portions; they do not contain nested links inside the dish button.

The [calculation audit](nutrition-calculations.json) contains every new recipe, reference, quantity, edible/gross weight basis and resulting estimate. HPB reports per-100 g composition on an edible basis; its default serving weight includes bones/shells. Calculations apply the edible percentage exactly once for an `as-served` weight, and never again for an already edible weight. This follows [HPB's data and serving definitions](https://pphtpc.hpb.gov.sg/web/sgfoodid/about-our-data).

Comparable complete dishes use their reference portion; other meals sum listed prepared components. Portion weights are assumptions, not measurements or validated vendor recipes. Rice/noodle and protein alternatives state one representative choice; no-pork/no-lard, vegetarian and halal claims are never inferred from a nutrition proxy. Sharing dishes describe the whole assumed order, not a single person's share. Sauces, side dishes, water and size multipliers are explicitly noted. New kcal/sodium values round to 10 units and gram values to whole units. HPB trace markers (`-1`) and missing values propagate to unknown, not zero: four new carbohydrate values and 35 fibre values remain unavailable. Zero can also result from rounding a small known amount.

Reference calculations can be reproduced without network access:

```sh
node scripts/build-reference-nutrition.js
```

The input snapshots and reviewed portion scenarios live in `data/nutrition/hpb-foods.json` and `data/nutrition/reference-recipes.json`. The builder fills missing nutrition or refreshes its own batch and preserves supplied estimates. `preserved-input.json` protects the 842 original identities and the original 559 supplied nutrition records against accidental changes. When intentionally replacing those inputs, review and update that baseline in the same change.

To import a later edited copy with the same menu identity columns and six nutrition columns:

```sh
node scripts/import-nutrition-estimates.js path/to/estimates.csv
```

The importer validates the entire result before writing, rejects duplicate/unknown IDs and changed menu identities, retains newer photo references, and preserves estimates for dishes absent from the upload. A supplied replacement clears that dish's old reference assumptions rather than attributing the new numbers to the previous recipe. The provenance retains previous batch details and records the latest supplied import. Run the reference builder afterwards to regenerate the public calculation audit for remaining reference estimates. Review the diff, run the checks below, and redeploy.

`canteens.json` uses the NUS UCI dining directory for building associations and published hours, with NUS Campus Map or Singapore OneMap coordinates. Each record includes source URLs and the location-check date. Coordinates locate the canteen or its building, not individual stalls; Fine Food uses its Town Plaza building pin. Hours belong to the canteen and may differ by stall.

To update menus, edit or replace `menu.csv` using the same columns and stable IDs, then run `npm run validate:menu`, `npm test`, `npm run lint`, and `npm run build`. Commit and deploy the new version. Set `VITE_MENU_SOURCE=preview` only to use the explicitly labelled fictional demo.
