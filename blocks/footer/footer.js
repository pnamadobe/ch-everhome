import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';
const CONTENT_PREFIX = window.location.pathname.startsWith('/content/') ? '/content' : '';

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const { locale } = getConfig();
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  try {
    const fragment = await loadFragment(`${CONTENT_PREFIX}${locale.prefix}${path}`);
    fragment.classList.add('footer-content');

    const sections = [...fragment.querySelectorAll('.section')];

    // Section order from the fragment:
    // 0: brand row (logo + social), 1-3: link columns, 4: Choice Privileges,
    // last two: legal links, copyright.
    const copyright = sections.pop();
    copyright.classList.add('section-copyright');

    const legal = sections.pop();
    legal.classList.add('section-legal');

    // Legal links (left) and copyright (right) share one bottom bar.
    const legalBar = document.createElement('div');
    legalBar.className = 'footer-legal-bar';
    legalBar.append(legal, copyright);

    const brand = sections.shift();
    brand.classList.add('section-brand');
    brand.querySelector(':scope > div > ul')?.classList.add('footer-social');

    // The remaining sections are the link columns; wrap them in a single row.
    const columns = document.createElement('div');
    columns.className = 'footer-columns';
    sections.forEach((section) => {
      section.classList.add('footer-column');
      columns.append(section);
    });
    brand.insertAdjacentElement('afterend', columns);

    // Promote the Choice Privileges "Join for free" link to a button.
    const cta = columns.querySelector('.footer-column:last-child p:last-of-type a');
    if (cta) cta.parentElement.classList.add('footer-cta');

    fragment.append(legalBar);

    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
