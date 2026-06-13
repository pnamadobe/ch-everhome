# Hotel Content Fragments (Featured Hotel + Hotel Cards)

The Featured Hotel and the 6-card grid on `/everhome-suites` are backed by AEM
**Content Fragments** (model: *Everhome Hotel*). Authors pick which hotel a block
shows from a dropdown in the Universal Editor; the page fetches + renders the
published fragment at runtime.

## What's in AEM (author-p59602-e520244)

- **Model** `Everhome Hotel` — `/conf/aem-demo-assets/settings/dam/cfm/models/everhome-hotel`
  Fields: `name`, `eyebrow`, `description`, `image` (content-reference), `ctaLabel`, `ctaLink`.
- **7 fragments** under `/content/dam/26H2/choicehotels/`:
  `everhome-somerset-south-brunswick` (featured) + 6 cards (stockbridge-atlanta,
  panama-city-beach, georgetown-austin, san-bernardino-loma-linda,
  san-antonio-lackland, ocala-i75-north).

## What's in this repo

- **UE pickers**: `ue/models/blocks/hotel.json` (featured, one Hotel dropdown) and
  `ue/models/blocks/hotel-cards.json` (container + `hotel-card` child, one Hotel
  dropdown each). The dropdown options are the 7 fragment paths. Run
  `npm run build:json` after editing.
- **Render blocks**: `blocks/hotel/` (featured) and `blocks/hotel-cards/` (grid),
  reusing the existing featured/cards visuals.
- **Fetch helper**: `scripts/utils/cf.js` — reads a published fragment via a
  GraphQL persisted query.

## AEM setup (done)

1. **7 fragments published** to the publish tier.
2. **GraphQL persisted query** `everhome-hotel-by-path` (config `aem-demo-assets`)
   created + published. Body:
   ```graphql
   query ($path: String!) {
     everhomeHotelByPath(_path: $path) {
       item {
         name eyebrow description { plaintext }
         image { ... on ImageRef { _dynamicUrl _publishUrl } }
         ctaLabel ctaLink
       }
     }
   }
   ```
   (Reachable publicly: `/graphql/execute.json/...` is dispatcher-allowed on the
   publish tier; the `/adobe/sites/cf/fragments/{id}` OpenAPI delivery is **not**
   enabled here. To change the query: DELETE then PUT — PUT alone 409s — then
   republish the query node.)
3. **Images**: all 7 photos imported to `/content/dam/26H2/choicehotels/<slug>.jpg`,
   set on each fragment's `image` field, fragments + assets published. `cf.js`
   renders `image._publishUrl`.

## How rendering works in editors vs live (no CORS change needed)

AEM's publish CORS allows `*.aem.live` / `*.aem.page` but not `*.ue.da.live`, so
the live GraphQL fetch is blocked **inside the UE/DA editor**. `cf.js` therefore
falls back to a **same-origin snapshot** `scripts/utils/hotels.json` (no CORS) for
the editor preview; the published site always uses live AEM data. **Keep
`hotels.json` in sync** when fragment text/images change (it only powers the
editor preview).

> Alternative: add `*.ue.da.live` to the publish CORS allowlist (OSGi
> `CORSPolicyImpl`, deployed via Cloud Manager) to give the editor live data too.
> Deploy-time only on AEMaaCS; unnecessary given the snapshot.

## Wiring the page (in DA)

Replace the existing Featured Hotel (`columns-feature`) and 6-card
(`cards-feature`) blocks on `/everhome-suites` with:
- a **Hotel** block (pick the featured hotel), and
- a **Hotel Cards** block with 6 **Hotel Card** rows (pick a hotel each).

In the Universal Editor each selection is a dropdown of the 7 hotels. The
**Hotel Cards** block is a container: each nested **Hotel Card** item carries its
own Hotel dropdown, and cards are added/removed/reordered with the container
controls.

> **Container-child selector:** the `hotel-card` field binds to the cell with
> `selector: "div:nth-child(1)"` (the cell `div`), **not** `"div>p"`. Container
> cells have no seeded `<p>` (unlike the featured `hotel` block, whose
> `unsafeHTML` provides one), so a `div>p` selector binds to nothing and the
> container shows as sealed in UE. Match the verified `card`/`carousel-item`
> pattern and target the cell div.

> If your DA Universal Editor turns out to support the `aem-content-fragment`
> picker field, swap the `select` field in the two model files for it to get a
> browse/search picker instead of a fixed dropdown. (Same one-line swap is the
> fallback if `select` inside a container child proves unsupported: use `text`.)
