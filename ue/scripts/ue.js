/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * Universal Editor runtime glue for the author-kit engine.
 *
 * Author-kit blocks restructure their source table during decoration, which
 * drops the data-aue-* instrumentation the Universal Editor injects on the
 * original rows/cells. These observers re-attach that instrumentation onto the
 * decorated DOM so the editor keeps tracking each item, and the select handlers
 * reveal collapsed content (accordion item / tab panel) when it is selected in
 * the editor.
 *
 * NOTE: the exact mutation shapes below are best-effort and must be confirmed
 * against a live *.ue.da.live instance (inspect the /details call + observe the
 * mutations the editor triggers). Refine the selectors/branches once available.
 */

import { moveInstrumentation } from './ue-utils.js';

const setupObservers = () => {
  const blocks = document.querySelectorAll('.accordion-faq, .cards-feature');
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type !== 'childList') return;
      const block = mutation.target.closest?.('.accordion-faq, .cards-feature');
      if (!block) return;

      // cards-feature: each source row <div> is rebuilt as an <li>.
      if (block.classList.contains('cards-feature')) {
        const addedUl = [...mutation.addedNodes].find((n) => n.tagName === 'UL');
        if (addedUl) {
          const removedRows = [...mutation.removedNodes].filter((n) => n.tagName === 'DIV');
          removedRows.forEach((row, i) => {
            if (i < addedUl.children.length) moveInstrumentation(row, addedUl.children[i]);
          });
        }
        return;
      }

      // accordion-faq: each source row <div> is replaced by a <details>.
      if (block.classList.contains('accordion-faq')) {
        const addedDetails = [...mutation.addedNodes].find((n) => n.tagName === 'DETAILS');
        const removedRow = [...mutation.removedNodes].find((n) => n.tagName === 'DIV');
        if (addedDetails && removedRow) {
          moveInstrumentation(removedRow, addedDetails);
          moveInstrumentation(removedRow.children[0], addedDetails.querySelector('summary'));
          moveInstrumentation(removedRow.children[1], addedDetails.querySelector('.accordion-faq-item-body'));
        }
      }
    });
  });

  blocks.forEach((block) => observer.observe(block, { childList: true, subtree: true }));
};

const setupSelectHandlers = () => {
  document.addEventListener('aue:ui-select', (event) => {
    const resource = event.detail?.resource;
    if (!resource) return;
    const element = document.querySelector(`[data-aue-resource="${resource}"]`);
    if (!element) return;

    // Reveal a selected accordion item.
    const details = element.closest('details.accordion-faq-item');
    if (details) {
      details.closest('.accordion-faq')?.querySelectorAll('details').forEach((d) => { d.open = false; });
      details.open = true;
      return;
    }

    // Activate the tab panel matching a selected advanced-tabs section.
    const panel = element.closest('[role="tabpanel"]');
    if (panel && panel.id) {
      const btn = document.getElementById(panel.getAttribute('aria-labelledby'));
      btn?.click();
    }
  });
};

export default () => {
  setupObservers();
  setupSelectHandlers();
};
