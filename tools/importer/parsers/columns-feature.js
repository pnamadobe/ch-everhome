/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base block: columns.
 * Source: https://www.choicehotels.com/everhome-suites (live AEM core-components DOM)
 *
 * Side-by-side image/text layout. Two distinct source shapes:
 *
 *   1. .cmp-banner (limited-time promo):
 *        .image-container .cmp-image img
 *        .banner-content > .banner-text (eyebrow .eyebrow, h2.banner-title, body)
 *        a.cmp-button (CTA)
 *
 *   2. .cmp-teaser--type-tile-left (welcome intro, featured-hotel spotlight):
 *        .cmp-teaser__image img
 *        .cmp-teaser__content (.eyebrow, .cmp-teaser__title h2, .cmp-teaser__description, CTA a)
 *
 * Output table: first row = block name; second row = two cells
 *   cell 1 = image, cell 2 = text content (eyebrow, heading, body, CTA).
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-image img, .cmp-teaser__image img, figure img, img');

  const textCell = [];
  const seen = new Set();
  const pushClone = (node, tag) => {
    if (!node) return;
    const txt = (node.textContent || '').trim();
    if (!txt) return;
    const el = document.createElement(tag || 'p');
    el.innerHTML = node.innerHTML;
    textCell.push(el);
  };

  // Eyebrow.
  const eyebrow = element.querySelector('.eyebrow, .cmp-teaser__pretitle, .banner-eyebrow');
  if (eyebrow) { pushClone(eyebrow, 'p'); seen.add(eyebrow); }

  // Heading.
  const heading = element.querySelector('.banner-title, .cmp-teaser__title, h1, h2, h3');
  if (heading) {
    const level = /^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h2';
    pushClone(heading, level);
    seen.add(heading);
  }

  // Body text.
  const body = element.querySelector('.banner-text, .cmp-teaser__description');
  if (body) {
    // banner-text may contain the eyebrow + title; emit only paragraphs that
    // are not the eyebrow/title we already captured.
    const paras = body.querySelectorAll('p');
    if (paras.length && body.classList.contains('banner-text')) {
      paras.forEach((p) => {
        if (p.closest('.eyebrow') || p.classList.contains('banner-title')) return;
        if ((p.textContent || '').trim()) pushClone(p, 'p');
      });
    } else {
      pushClone(body, 'p');
    }
  }

  // CTA link.
  const cta = element.querySelector('a.cmp-button, .cmp-teaser__cta a, .cmp-button a, a.button');
  if (cta) {
    const a = document.createElement('a');
    a.setAttribute('href', cta.getAttribute('href') || '#');
    a.textContent = (cta.textContent || '').trim();
    const p = document.createElement('p');
    p.appendChild(a);
    textCell.push(p);
  }

  // Single content row, two columns: image | text (side-by-side).
  const cells = [[image || '', textCell.length ? textCell : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
