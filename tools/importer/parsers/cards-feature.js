/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base block: cards.
 * Source: https://www.choicehotels.com/everhome-suites (live AEM core-components DOM)
 *
 * element = a .cmp-grid-container. Three distinct grid shapes:
 *
 *   1. Location image grid: items are .cmp-image, each with
 *        a.cmp-image__link > figure > img + figcaption.cmp-image__title
 *      Card = image + linked caption title.
 *
 *   2. Amenities grid: items are .cmp-teaser--type-promo, each with
 *        .cmp-teaser__image img + .cmp-teaser__content (h4 + p description)
 *      Card = icon + title + text.
 *
 *   3. Featured-hotels grid: items are .cmp-teaser--type-card, each with
 *        .cmp-teaser__image img + .cmp-teaser__content
 *          (.eyebrow p + h3.cmp-teaser__title + .cmp-teaser__description + a.cmp-button CTA)
 *      Card = image + eyebrow + title + description + CTA.
 *
 * Output: standard cards table (first row = block name; each subsequent row =
 * [image, text content]).
 */
export default function parse(element, { document }) {
  const cells = [];

  const imageCards = Array.from(element.querySelectorAll(':scope .cmp-image a.cmp-image__link'))
    .map((a) => a.closest('.cmp-image'))
    .filter((v, i, arr) => v && arr.indexOf(v) === i);
  const teaserCards = Array.from(element.querySelectorAll(':scope .cmp-teaser'));

  if (teaserCards.length) {
    // Teaser-based grid (amenities promos or featured cards).
    teaserCards.forEach((teaser) => {
      const image = teaser.querySelector('.cmp-teaser__image img, img');
      const textCell = [];

      const eyebrow = teaser.querySelector('.cmp-teaser__content .eyebrow, .eyebrow');
      if (eyebrow && (eyebrow.textContent || '').trim()) {
        const p = document.createElement('p');
        p.innerHTML = eyebrow.innerHTML;
        textCell.push(p);
      }

      const title = teaser.querySelector('.cmp-teaser__title');
      if (title && (title.textContent || '').trim()) {
        const level = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : 'h3';
        const h = document.createElement(level);
        h.innerHTML = title.innerHTML;
        textCell.push(h);
      }

      const desc = teaser.querySelector('.cmp-teaser__description');
      if (desc) {
        // Description may carry headings (promo teasers embed h4 + p) and/or
        // paragraphs. Preserve block-level children in order; otherwise take the
        // whole description as a paragraph.
        const blocks = desc.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p');
        if (blocks.length) {
          blocks.forEach((node) => {
            if (!(node.textContent || '').trim()) return;
            const tag = /^H[1-6]$/.test(node.tagName) ? node.tagName.toLowerCase() : 'p';
            const el = document.createElement(tag);
            el.innerHTML = node.innerHTML;
            textCell.push(el);
          });
        } else if ((desc.textContent || '').trim()) {
          const np = document.createElement('p');
          np.innerHTML = desc.innerHTML;
          textCell.push(np);
        }
      }

      const cta = teaser.querySelector('.cmp-teaser__cta a, a.cmp-button, a.button');
      if (cta) {
        const a = document.createElement('a');
        a.setAttribute('href', cta.getAttribute('href') || '#');
        a.textContent = (cta.textContent || '').trim();
        const p = document.createElement('p');
        p.appendChild(a);
        textCell.push(p);
      }

      cells.push([image || '', textCell.length ? textCell : '']);
    });
  } else if (imageCards.length) {
    // Image grid with linked caption (location cards).
    imageCards.forEach((card) => {
      const link = card.querySelector('a.cmp-image__link');
      const image = card.querySelector('img');
      const caption = card.querySelector('figcaption, .cmp-image__title');
      const captionText = caption ? (caption.textContent || '').trim()
        : (link ? (link.textContent || '').trim() : '');

      const textCell = [];
      if (link && link.getAttribute('href')) {
        const a = document.createElement('a');
        a.setAttribute('href', link.getAttribute('href'));
        a.textContent = captionText;
        textCell.push(a);
      } else if (captionText) {
        const p = document.createElement('p');
        p.textContent = captionText;
        textCell.push(p);
      }

      cells.push([image || '', textCell.length ? textCell : '']);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
