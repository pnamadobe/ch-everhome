# Universal Editor (UE) instrumentation

This site keeps its content in **DA (Document Authoring)** and is instrumented so it
can also be edited in the **Universal Editor** via DA's Author Bus. Content is **not**
moved to AEM as a Cloud Service — UE connects to DA.

## How it works

UE reads three files from the **project root** to learn what is editable:

| Root file | Purpose |
| --- | --- |
| `component-definition.json` | Which blocks exist and their initial table structure |
| `component-models.json` | The fields shown in the UE properties panel, mapped to cells via CSS selectors |
| `component-filters.json` | Which children are allowed inside container blocks / sections |

**Do not edit those root files by hand.** They are generated. The source of truth is
`ue/models/` (one file per block), merged by `npm run build:json`.

```
ue/
  models/
    component-definition.json   # merge template (globs ue/models/blocks/*.json)
    component-models.json        # merge template
    component-filters.json       # merge template
    page.json                    # page metadata model
    section.json                 # section options + allowed children
    text.json / image.json       # default content
    blocks/<block>.json          # one file per block: definitions + models + filters
  scripts/
    ue-utils.js                  # moveInstrumentation helper
    ue.js                        # author-kit DOM-reconstruction + select handlers
```

### Regenerating the root files

```sh
npm run build:json
```

Run this after any change under `ue/models/` and commit the regenerated root files.

### Loading the UE runtime

`scripts/scripts.js` imports `ue/scripts/ue.js` **only** on `*.ue.da.live` /
`*.stage-ue.da.live` hosts, so production delivery is unaffected.

## External prerequisites (admin — not in this repo)

UE editing of DA content requires Adobe's **Early Access Technology program**:

1. IMS org has a **DX Handle** (e.g. `@choicehotels`) and UE enabled (requires AEM Sites credits).
2. In `https://da.live/config#/pnamadobe/`, add an `editor.path` entry pointing content
   paths at `…--ch-everhome--pnamadobe.ue.da.live`.
3. Chrome or Safari only.

See https://docs.da.live/developers/reference/universal-editor and
https://docs.da.live/administrators/guides/setup-universal-editor.

## ⚠️ Author-kit caveat — needs live verification

This site runs the **author-kit** engine (`scripts/ak.js`), not the standard
`aem.js` boilerplate that UE instrumentation is normally built against. The block
**model selectors** here are derived from each block's input table contract and the
container **reconstruction** in `ue/scripts/ue.js` is best-effort. Both must be
confirmed against a live `*.ue.da.live` instance:

1. Add a block to a test page in DA.
2. Open the page in UE; select the block.
3. In the browser Network tab, inspect the `/details` response to see the parsed
   block DOM and the exact CSS selectors UE expects.
4. Reconcile `ue/models/blocks/<block>.json` selectors with that response and
   re-run `npm run build:json`.

Blocks most likely to need adjustment:

- **card / table** — modelled as a single rich-text cell (freeform content).
- **advanced-tabs** — tab panels are sibling *sections*, which UE cannot model as
  children of the block; the label list is editable, panels are edited as sections.
- **accordion-faq / cards-feature** — container reconstruction in `ue.js` assumes the
  row→`<details>` / row→`<li>` mutation shapes; verify the editor's mutations match.

`header` and `footer` are authored as their own nav documents and are intentionally
excluded from in-page UE editing.
