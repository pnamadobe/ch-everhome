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

## Remaining setup to go live (gated — needs you / AEM admin)

1. **Publish the 7 fragments** (delivery tier only serves published CFs).
2. **Create + publish a GraphQL persisted query** named `everhome-hotel-by-path`
   under the `aem-demo-assets` config (or update `PROJECT`/`QUERY` in
   `scripts/utils/cf.js`). It must accept a `path` parameter and return:
   `name, eyebrow, description { plaintext }, image { _path }, ctaLabel, ctaLink`.
   Example query body:
   ```graphql
   query ($path: String!) {
     everhomeHotelByPath(_path: $path) {
       item { name eyebrow description { plaintext } image { _path } ctaLabel ctaLink }
     }
   }
   ```
   (Verified reachable: `/graphql/execute.json/...` is dispatcher-allowed on the
   publish tier; the single-fragment `/adobe/sites/cf/fragments/{id}` delivery API
   is **not** enabled here.)
3. **CORS**: allow the EDS origin (`https://main--ch-everhome--pnamadobe.aem.live`,
   `.aem.page`, and the production domain) on the publish tier for the GraphQL
   endpoint.
4. **Images**: the fragments' `image` field is empty (page images were DA media,
   not DAM assets). Set a DAM asset on each fragment in the CF editor; the blocks
   render the image when present.

## Wiring the page (in DA)

Replace the existing Featured Hotel (`columns-feature`) and 6-card
(`cards-feature`) blocks on `/everhome-suites` with:
- a **Hotel** block (pick the featured hotel), and
- a **Hotel Cards** block with 6 **Hotel Card** rows (pick a hotel each).

In the Universal Editor each selection is a dropdown of the 7 hotels.

> If your DA Universal Editor turns out to support the `aem-content-fragment`
> picker field, swap the `select` field in the two model files for it to get a
> browse/search picker instead of a fixed dropdown.
