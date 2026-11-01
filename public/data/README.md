# Published menu data

`menu.csv` contains 559 priced dish/portion variants across six canteens, imported on 1 November 2026 from the reviewed photograph extraction. Every row has a source photograph reference. Prices are SGD as printed in those photographs, which span 2025 and 2026; the import date does not mean prices or availability were checked with vendors on that date.

| Canteen | Dish variants |
| --- | ---: |
| Fine Food | 94 |
| Techno Edge | 81 |
| The Terrace | 81 |
| Yusof Ishak House | 29 |
| The Deck | 22 |
| Flavours | 252 |

Only legible item names/prices with supported stall identities are included. Uncertain entries and the unidentified IMG_7578 stall remain excluded. Separate sizes/proteins have separate IDs. Drinks, individual ingredients, add-ons and takeaway fees from the full extraction are excluded from dish search. Original photographs are not distributed with the site.

Dietary tags preserve explicit evidence from photographed signs. Missing tags mean no recorded claim; they do not establish suitability. A no-pork/no-lard statement is not treated as halal certification. The site does not infer allergens or current certification.

`canteens.json` uses the NUS UCI dining directory for building associations and published hours, with NUS Campus Map or Singapore OneMap coordinates. Each record includes source URLs and the location-check date. Coordinates locate the canteen or its building, not individual stalls; Fine Food uses its Town Plaza building pin. Hours belong to the canteen and may differ by stall.

To update menus, edit or replace `menu.csv` using the same columns and stable IDs, then run `npm run validate:menu`, `npm test`, `npm run lint`, and `npm run build`. Commit and deploy the new version. Set `VITE_MENU_SOURCE=preview` only to use the explicitly labelled fictional demo.
