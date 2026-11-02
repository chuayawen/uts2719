# Nutrition comparison guide

Version 1, 3 November 2026. The guide is calculated from existing per-order estimates without changing nutrition numbers, menu facts or dietary claims.

| Estimated nutrient per adult meal | Green | Amber | Red |
| --- | --- | --- | --- |
| Sodium | ≤600 mg | >600–1,000 mg | >1,000 mg |
| Protein | ≥20 g | 10–<20 g | <10 g |
| Fibre | ≥8 g | 4–<8 g | <4 g |

These are **app-defined comparison bands**, not validated meal classifications or HPB certification. [WHO Healthy diet, 26 January 2026](https://www.who.int/news-room/fact-sheets/detail/healthy-diet) provides daily context: under 2,000 mg sodium for adults, at least 25 g naturally occurring fibre for people older than 10, and roughly 50–75 g protein for adults at 2,000 kcal. Green bands approximate meal shares; red boundaries (1,000 mg sodium, 4 g fibre and 10 g protein) are practical app choices, not WHO meal thresholds. Individual needs and other food eaten during the day differ.

There is no overall food rating, profile badge or combined score. Individual nutrient colours remain, with screen-reader descriptions. Nutrition is hidden until a dish is opened. Shared estimate notes, colour key and the WHO link appear once in the collapsed About nutrition section above the menu. Only item-specific portion assumptions and reference foods remain within dish details. Null, missing, invalid and trace inputs stay unknown. Zero remains a real input. Explicit sharing notes suppress single-meal colours. Sides/snacks need meal context; near-threshold estimates may change colour with different portions.

Saturated/trans fat and verified ingredient formulations are absent from the dataset. Total fat cannot establish fat quality. Dish names and macros cannot establish ultra-processing status. These limitations are explained in the shared notes. Calories, carbs and total fat remain neutral. Sugar, fruit/vegetable balance and micronutrients are outside the guide. A green nutrient value is not a whole-food health verdict.

Implementation: `src/lib/nutritionGuide.ts`. Boundary, unknown-input, conflicting-signal and sharing-order tests protect these decisions. The shared About nutrition section contains the legend, caveats and WHO source link.
