# ch-everhome — Universal Editor + Content Fragments handoff

Status snapshot for `/everhome-suites` on the **ch-everhome** Edge Delivery (DA-sourced)
site. Two bodies of work: (1) making the author-kit/DA site editable in the Universal
Editor while keeping content in DA, and (2) backing the Featured Hotel + 6-card grid
with AEM Content Fragments.

- **Repo:** https://github.com/pnamadobe/ch-everhome (branch `main`)
- **DA:** https://da.live/#/pnamadobe/ch-everhome
- **Preview/live:** https://main--ch-everhome--pnamadobe.aem.page/everhome-suites
- **UE:** experience.adobe.com → opens `main--ch-everhome--pnamadobe.ue.da.live/everhome-suites`
- **AEM author:** https://author-p59602-e520244.adobeaemcloud.com (prog p59602 / env e520244)
- **Framework:** Adobe **author-kit** (custom Lit engine `scripts/ak.js`) — NOT the standard aem.js boilerplate.

---

## 1. Universal Editor instrumentation (content stays in DA)

DA + UE is supported via DA's "Author Bus" (Adobe Early Access). Instrumentation lives in:

- `ue/models/` — one file per block (definitions + models + filters) + base `page/section/text/image.json` + merge templates. Edit these, then **`npm run build:json`**.
- Generated roots (committed, do not hand-edit): `component-definition.json`, `component-models.json`, `component-filters.json`.
- `ue/scripts/ue.js` + `ue-utils.js` — loaded only on `*.ue.da.live` (via `scripts/scripts.js`).
- Build tooling: `npm run build:json` (merge-json-cli + npm-run-all).

**External prereqs (admin, not code):** org Early-Access for UE-on-Author-Bus + AEM Sites credits; a DX Handle; an `editor.path` entry in `da.live/config#/pnamadobe/`.

### author-kit ↔ UE fixes already made
- **`scripts/ak.js`** skips `UE_VIRTUAL_BLOCKS = ['richtext','metadata']` — UE injects those wrapper blocks; author-kit would 404 trying to load them and show dev error overlays.
- **`blocks/footer/footer.js`** made null-safe — UE re-wraps the nav fragment so `querySelectorAll('.section')` was empty → `.classList` of undefined threw.
- Note: `ENV` is `stage` on BOTH `.aem.page` and `.ue.da.live` (host contains `--`), so author-kit dev error overlays show in both.

---

## 2. Content Fragments — Featured Hotel + Hotel Cards

One reusable **"Everhome Hotel"** CF model powers both the featured block and the card grid.
Content is created/edited in AEM; the EDS page fetches + renders it. **DONE and working on the
published site.**

### AEM artifacts (all published)
- **Model "Everhome Hotel"** — `/conf/aem-demo-assets/settings/dam/cfm/models/everhome-hotel`
  (modelId `L2NvbmYvYWVtLWRlbW8tYXNzZXRzL3NldHRpbmdzL2RhbS9jZm0vbW9kZWxzL2V2ZXJob21lLWhvdGVs`).
  Fields: `name`, `eyebrow`, `description` (long-text), `image` (content-reference), `ctaLabel`, `ctaLink`.
  *(Had to use `/conf/aem-demo-assets` — `/conf/global` is ACL-locked and a dedicated `/conf/ch-everhome` can't be made via API. Relocatable later via the Configuration Browser.)*
- **7 fragments** under `/content/dam/26H2/choicehotels/` — all fully populated (name + eyebrow "FEATURED HOTEL" + description + image + CTA) and published:
  `everhome-somerset-south-brunswick` (the original featured), `everhome-stockbridge-atlanta`,
  `everhome-panama-city-beach`, `everhome-georgetown-austin`, `everhome-san-bernardino-loma-linda`,
  `everhome-san-antonio-lackland`, `everhome-ocala-i75-north`.
- **Images** — 7 photos imported to `/content/dam/26H2/choicehotels/<slug>.jpg`, set on each fragment's `image`, published.
- **GraphQL persisted query** — `/conf/aem-demo-assets/settings/graphql/persistentQueries/everhome-hotel-by-path` (published). Body:
  ```graphql
  query ($path: String!) {
    everhomeHotelByPath(_path: $path) {
      item { name eyebrow description { plaintext }
             image { ... on ImageRef { _dynamicUrl _publishUrl } }
             ctaLabel ctaLink }
    }
  }
  ```

### Delivery (verified public)
```
https://publish-p59602-e520244.adobeaemcloud.com/graphql/execute.json/aem-demo-assets/everhome-hotel-by-path;path=<RAW /content/dam path>?ck=eh2
```
- Path must be **raw** (unencoded slashes) — `encodeURIComponent` breaks it.
- `?ck=eh2` cache key avoids a CDN entry cached without CORS headers. **Bump it when the query changes.**
- **CORS:** publish allows `*.aem.live` / `*.aem.page` (with `Vary: Origin`) but **not** `*.ue.da.live`.

### Repo artifacts
- `scripts/utils/cf.js` — `fetchHotel(path)`: tries the live GraphQL query, falls back to a **same-origin
  `scripts/utils/hotels.json` snapshot** when the live fetch is CORS-blocked (i.e. inside the UE/DA editor).
  Both fetches have a 4s timeout so a hung request can't stall the editor.
- `scripts/utils/hotels.json` — snapshot of all 7 hotels (text + image URLs) **for the editor preview only**.
  **Keep in sync** if you change fragment copy/images (the live site always uses live AEM data).
- `blocks/hotel/` — Featured Hotel block (single), styled to match the `columns-feature` "featured" variant. Renders eyebrow/title/description/image/CTA; shows a placeholder if the CF can't resolve.
- `blocks/hotel-cards/` — the 6-card grid, styled to match the `cards-feature` "featured-hotel" variant.
- `ue/models/blocks/hotel.json`, `ue/models/blocks/hotel-cards.json` — UE pickers (7-hotel dropdowns).
- `ue/HOTELS.md` — detailed setup doc.

---

## 3. Authoring workflow

**Featured hotel** (`hotel` block) — works in UE *and* DA:
- DA: a 1-column block table `| hotel |` then a row with the CF path.
- UE: select the **Hotel (Featured)** block → **Hotel** dropdown → pick a hotel. ✅ Works (binds + renders).

**6-card grid** (`hotel-cards` block) — a UE container of **Hotel Card** children (per-card selector fix in §4, pending live verify):
- UE: select **Hotel Cards** → each nested **Hotel Card** has a **Hotel** dropdown; add/remove/reorder cards with the container's `+`/drag controls.
- DA (always works): a 1-column table, header `hotel-cards`, one CF path per row (one card each). Add/remove/reorder/swap by editing rows.

Both render with images + text on the live site and in the UE canvas (via the snapshot).

---

## 4. Hotel Cards per-card UE editing — root-caused + fixed (pending re-test)

An earlier pass concluded per-card editing was a DA-UE limitation ("`select` inside a container child").
**That was wrong**, and so was the first follow-up guess (a bad selector). Two findings, in order:

**(a) Selector** — `hotel-card` bound its field with `selector: "div>p"`, a `<p>` that doesn't reliably
exist in a container cell. Changed to **`"div:nth-child(1)"`** (the cell `div`), which UE resolves
against the source cell with or without a `<p>`. Deployed (commit `72cc6fe`) — but the block was **still
sealed** in a fresh-Incognito test: it renders all 6 cards and is selectable as one *Hotel Cards*
component, but exposes no nested *Hotel Card* children. So the selector was necessary-not-sufficient.

**(b) The real cause — dropped instrumentation.** Per this repo's own `ue/scripts/ue.js`: author-kit
blocks restructure their DOM during decoration, which **drops the `data-aue-*` instrumentation UE injects
on the source rows**; a `MutationObserver` re-attaches it — but it only watched `.accordion-faq,
.cards-feature`, **not `.hotel-cards`**. And `hotel-cards.js` did `el.textContent = ''` + an async rebuild
from the fetched fragment, destroying each card's child instrumentation with nothing to restore it → the
cards were invisible to UE → sealed. (The *featured* single `hotel` block survives the same
`textContent = ''` because a container's **child** instrumentation lives on the rows it deletes, while a
single block's instrumentation is on the block element itself.) The verified `exp-cat-nfl`/boilerplate
`cards.js` avoids this by **moving** the original cell `<div>`s into the new `<li>` (instrumentation
rides along); ours rebuilt fresh.

**Fix applied (2 files):**
- `blocks/hotel-cards/hotel-cards.js` — rewritten to build one `<li>` per source row and call
  **`moveInstrumentation(row, li)` synchronously, before the `await`**, then `el.replaceChildren(ul)` and
  fill each `<li>` from the fetch. Empty/just-added cards keep a selectable placeholder shell. (Imports
  `moveInstrumentation` from `ue/scripts/ue-utils.js`; it's a pure attribute-mover and a no-op on the
  live site, which has no `data-aue-*`.)
- `ue/scripts/ue.js` — added `.hotel-cards` to the observer watch list + the cards-feature row→`<li>`
  branch, as a backup for the case where UE injects instrumentation after decoration.

**Status: pending re-test.** Commit → push (the JS is repo *code* — the Helix code bus serves it on push;
no DA publish), hard-reload the UE session, then **click an individual card** → expect *Hotel Card* in the
breadcrumb and the Hotel dropdown in the properties rail.

**If still sealed:** check the console whether each `<li class="hotel-card">` has `data-aue-resource`
after decoration. If not, UE isn't injecting on the source rows at all → suspect the model/definition
mapping, not the block JS. Last resort: switch the `hotel-card` model field `"component": "select"` →
`"text"`/`aem-content` to exactly match the verified `card`/`carousel-item` field type.

Other open items:
- Optional: add `*.ue.da.live` to the publish CORS allowlist (OSGi `CORSPolicyImpl`, via Cloud Manager — deploy-time only on AEMaaCS) so the editor uses LIVE data instead of the snapshot. Unnecessary given the snapshot.
- `hotels.json` snapshot must be re-synced if fragment copy/images change (editor preview only).

---

## 5. The hard-won fixes (so they're not re-discovered)

| Symptom | Cause | Fix |
|---|---|---|
| Header/nav "Error" boxes in UE | author-kit 404s loading UE's `richtext`/`metadata` wrapper blocks | `UE_VIRTUAL_BLOCKS` skip in `ak.js` |
| Footer crash in UE | nav fragment re-wrapped → empty `.section` → `.classList` of undefined | null-safe `footer.js` |
| Whole page blank in UE | stale Adobe-shell service worker (`sw.js` clone error) | clear site data / fresh Incognito |
| CF block renders nothing on live | CDN cached a CORS-less GraphQL response (fetched w/o Origin) | `?ck=` cache key + **never curl the delivery URL without an `Origin` header** |
| CF renders on live, blank in UE | publish CORS doesn't allow `*.ue.da.live` | same-origin `hotels.json` snapshot fallback |
| `;path=` not resolving | slashes were percent-encoded | pass the **raw** path |
| UE dropdown empty / saved blank | model field used a raw CSS selector with no `da.fields` mapping | map a logical field (`cfPath`) via definition `da.fields` → selector, value in a `<p>` (mirror `player-spotlight`) |
| UE editor hanging | cross-origin fetch stayed pending | 4s `AbortController` timeout on fetches |
| Hotel Cards sealed in UE | block JS rebuilt the DOM (`el.textContent=''` + async fetch), dropping the `data-aue-*` the editor put on each card row; `ue.js`'s re-attach observer didn't cover `.hotel-cards` | `hotel-cards.js` now `moveInstrumentation(row, li)` synchronously before the await; `.hotel-cards` added to the `ue.js` observer; child selector `"div:nth-child(1)"` — see §4 |

**Reference project:** `exp-cat-nfl` (cloned at `/Users/pnam/Sandbox/exp-cat-nfl`) — its `player-spotlight`
block is the canonical working pattern for a CF-backed, UE-pickable block on this exact DA/AEM setup.

---

## 6. Recent commits (newest first)
`a89503a` Hotel Cards container (rows/columns) · `d35494c` snapshot descriptions ·
`29fe999` fetch timeout · `3e3e44b` UE dropdown da.fields binding fix · `c8d76fe` robust path extraction ·
`e0bde8b` same-origin snapshot fallback · `e782edd`/`3adb5bb` styling · image + query/publish work ·
`6d921ea` initial Hotel blocks · earlier: UE instrumentation + author-kit fixes.

## 7. Suggested next steps for a new session
1. **Verify the Hotel Cards selector fix (§4):** commit + push (code bus deploys the JSON; no DA publish), hard-reload UE, confirm nested Hotel Card items each show the Hotel dropdown. Apply the `select`→`text` fallback only if still sealed.
2. If keeping the snapshot: consider a small script to regenerate `scripts/utils/hotels.json` from the published fragments.
3. Verify the full page on the **published** site once more and do a visual pass vs choicehotels.com/everhome-suites.
4. (Tidy) Pre-existing lint error unrelated to this work: `scripts/ak.js:114` `no-continue` — `npm run lint` fails on it.
