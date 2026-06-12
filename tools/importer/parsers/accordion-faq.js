/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base block: accordion.
 * Source: https://www.choicehotels.com/everhome-suites (live AEM core-components DOM)
 *
 * element = .cmp-accordion
 *   items: .cmp-accordion__item
 *     question: .cmp-accordion__item-button (text; trailing indicator stripped)
 *     answer:   .cmp-accordion__item-content (rich text)
 *
 * Output: standard accordion block table.
 *   Row 1: block name
 *   Each subsequent row: [question, answer]
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll(':scope .cmp-accordion__item');
  const cells = [];

  items.forEach((item) => {
    const button = item.querySelector('.cmp-accordion__item-button');
    let question = '';
    if (button) {
      // Drop the indicator icon node so only the question text remains.
      const clone = button.cloneNode(true);
      const indicator = clone.querySelector('.cmp-accordion__item-indicator');
      if (indicator) indicator.remove();
      question = (clone.textContent || '').replace(/ /g, ' ').trim();
    }
    if (!question) {
      const header = item.querySelector('.cmp-accordion__item-header, h3, h4');
      question = header ? (header.textContent || '').replace(/ /g, ' ').trim() : '';
    }

    // Answer: prefer the dedicated content node; fall back to the panel minus header.
    let answer = item.querySelector('.cmp-accordion__item-content');
    if (!answer) {
      const panel = item.querySelector('.cmp-accordion__panel');
      if (panel) {
        const clone = panel.cloneNode(true);
        const hdr = clone.querySelector('.cmp-accordion__item-header');
        if (hdr) hdr.remove();
        answer = clone;
      }
    }
    if (answer) {
      answer.removeAttribute('hidden');
    }

    cells.push([question, answer || '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
