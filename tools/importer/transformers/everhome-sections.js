/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Everhome Suites (choicehotels.com) section handling.
 *
 * Inserts a section break (<hr>) before every section except the first, and a
 * Section Metadata block for every section that declares a `style`
 * (e.g. section-10 -> style "dark").
 *
 * Section selectors come from payload.template.sections in page-templates.json,
 * which were derived from the captured DOM in migration-work/cleaned.html
 * (each section is a `section[data-section="N"]` element).
 *
 * Runs in afterTransform only. Sections are processed in reverse document order
 * so that inserting <hr> / Section Metadata for a later section does not shift
 * the positions of earlier ones.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) {
    return;
  }

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 1) {
    return;
  }

  const doc = element.ownerDocument || document;

  // Resolve each section's DOM element via its selector (captured-DOM based).
  const resolved = sections.map((section) => ({
    section,
    el: section.selector ? element.querySelector(section.selector) : null,
  }));

  // Process in reverse so earlier insertions are not displaced.
  for (let i = resolved.length - 1; i >= 0; i -= 1) {
    const { section, el } = resolved[i];
    if (!el) {
      // Selector did not match on this page; skip safely.
      continue;
    }

    // Section Metadata block for sections that declare a style.
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      el.appendChild(metaBlock);
    }

    // Section break before every non-first section that has content before it.
    if (i > 0) {
      const hr = doc.createElement('hr');
      el.parentNode.insertBefore(hr, el);
    }
  }
}
