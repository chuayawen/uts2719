# Nutrition comparison guide

Version 2, 3 November 2026. This version replaces the version 1 traffic-light bands. Nutrition numbers, menu facts and dietary claims are unchanged.

## Why the colours were removed

Version 1 coloured sodium, protein and fibre green, amber or red using per-meal bands made by splitting daily guidance across three meals. Those boundaries were arbitrary. Fruit or a side dish could show red for protein while still being a useful choice. An estimate of 19 g protein against 20 g looked like a real difference in quality when it is within the margin of the estimates.

An established traffic-light scheme, such as the [UK front-of-pack labelling guidance](https://www.gov.uk/government/publications/front-of-pack-nutrition-labelling-guidance), works per 100 g with extra portion rules. It also covers saturated fat and sugars. Our per-order estimates have neither, so they cannot support that scheme reliably.

## What the app shows now

| Feature | Behaviour |
| --- | --- |
| Food list | Compact layout: name, price, stall, cuisine and dietary tags. |
| Dish details | Estimated calories, protein, carbohydrates, total fat, sodium and fibre, all in neutral colours. |
| Daily context | Sodium as a share of the adult daily limit and fibre as a share of the daily minimum, rounded to the nearest 5%. Protein is shown as an amount only. |
| Sorting | Less sodium, More protein or More fibre, combined with the canteen, stall, cuisine, price and dietary filters. |
| Comparison scope | The shared notes ask users to compare meals with meals and snacks or sides with similar options. |
| Nutrition guide | One shared About nutrition section above the menu explains the estimates and daily reference amounts. |

Example inside a dish's details:

- Sodium: ≈900 mg, about 45% of the adult daily limit
- Fibre: ≈5 g, about 20% of the daily minimum
- Protein: ≈18 g

Reference amounts come from [WHO Healthy diet, 26 January 2026](https://www.who.int/news-room/fact-sheets/detail/healthy-diet): under 2,000 mg sodium a day for adults and at least 25 g fibre a day for people older than 10. They are daily amounts, not targets for one meal.

## Edge cases

- Null, missing, invalid and trace inputs stay unknown and get no percentage. Zero is a real value.
- A small non-zero amount that rounds to 0% reads as "under 5%".
- Orders whose assumptions mention sharing describe the whole order. They show amounts and a sharing note, with no daily percentage.
- When sorting, dishes with an unknown value for that nutrient and sharing orders come after the comparable dishes, in menu order. Ties keep menu order.
- Sorting changes order only. It never removes dishes. It counts towards the active-filter badge and is cleared by Reset.
- Results stay grouped by canteen, so a sort orders dishes within each canteen.

## Limitations

The dataset has no meal, side or snack category, so the app cannot yet restrict comparisons to similar items automatically. Users are asked to do this themselves. Saturated/trans fat, sugars and verified ingredient formulations are also absent. Total fat cannot establish fat quality, and dish names and macros cannot establish ultra-processing status. Better data would improve these comparisons more than a more complicated scoring formula.

Implementation: `src/lib/nutritionGuide.ts` (daily context and sorting), `src/components/NutritionFacts.tsx` (dish details) and `src/components/NutritionNotes.tsx` (shared notes). Tests are in `tests/nutritionGuide.test.js` and `tests/filterMenu.test.js`.
