# Single Page Migration to AEM Edge Delivery Services

## Overview
Migrate the source page **`https://www.choicehotels.com/everhome-suites`** to AEM Edge Delivery Services, end-to-end: page structure, content import, block variants, and full design/styling — matching the original as closely as possible.

## Source
- **URL:** `https://www.choicehotels.com/everhome-suites`
- **Scope:** Single page
- **Focus:** Everything (structure, content, blocks, design/styling)

## Goals
- Faithfully reproduce the source page's structure, content, and visual design in AEM EDS.
- Generate any new block variants needed, reusing existing project blocks where possible.
- Verify the result renders correctly in the preview and visually matches the original.

## Approach
Full single-page migration coordinated end-to-end: page analysis → block mapping → import infrastructure → content import → design/styling → visual verification.

## Checklist

### 1. Setup & Discovery
- [ ] Determine project type and available block library endpoint
- [ ] Confirm the local preview server is available for verification

### 2. Page Analysis
- [ ] Scrape the source page (HTML, metadata, images)
- [ ] Identify section boundaries and content sequences
- [ ] Determine authoring approach (default content vs. blocks) per section
- [ ] Produce analysis artifacts (cleaned HTML, screenshots, structure JSON)

### 3. Block Mapping & Variants
- [ ] Survey existing project blocks and the block collection
- [ ] Match content sections to existing blocks (≥70% similarity reuse)
- [ ] Identify and create any new block variants required
- [ ] Record block mappings (DOM selectors) for the page template

### 4. Import Infrastructure
- [ ] Generate block parser(s) for each block variant
- [ ] Generate page transformer(s) (cleanup, sections, media handling)
- [ ] Validate parsers and transformers against the analyzed DOM

### 5. Content Import
- [ ] Build the bundled import script (template + parsers + transformers)
- [ ] Run the import to produce page content and images
- [ ] Verify imported content structure

### 6. Design & Styling
- [ ] Extract design tokens (colors, typography, spacing) from the original
- [ ] Apply site-level styles
- [ ] Style each block to match the source (with visual iterations)

### 7. Verification
- [ ] Render the migrated page in the preview
- [ ] Visually compare migrated vs. original; calculate similarity
- [ ] Fix CSS/layout discrepancies and re-verify until it matches
- [ ] Final QA pass (golden path + edge cases)

## Notes
- Source URL confirmed: `https://www.choicehotels.com/everhome-suites`.
- Execution requires **Execute mode** — this is the planning artifact only. Once approved, I'll begin with Setup & Discovery and Page Analysis.
