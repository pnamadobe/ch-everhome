import { fetchHotel } from '../../scripts/utils/cf.js';
import { moveInstrumentation } from '../../ue/scripts/ue-utils.js';

/*
 * Hotel Cards block — a grid of "Everhome Hotel" content fragments.
 *
 * Each source row holds one cell with the chosen fragment's DAM path (set via
 * the per-card Hotel dropdown in the Universal Editor). We build one <li> per
 * row and MOVE the row's `data-aue-*` instrumentation onto it
 * (moveInstrumentation) BEFORE the async fetch — otherwise rebuilding the DOM
 * drops the instrumentation and the editor can no longer track / select each
 * card (the block looks "sealed"). The card visuals (image, name, CTA) are then
 * filled in from the fetched fragment. Mirrors the cards-feature grid.
 */
function extractPath(row) {
  // The cell may be plain text, a link href, or an absolute URL.
  const link = row.querySelector('a');
  const raw = (link ? link.getAttribute('href') : row.textContent).trim();
  const match = raw.match(/\/content\/dam\/[^\s"']+/);
  return match ? match[0] : raw;
}

function fillCard(li, hotel) {
  if (hotel.image && /^https?:\/\//.test(hotel.image)) {
    const media = document.createElement('div');
    media.className = 'hotel-card-image';
    const img = document.createElement('img');
    img.src = hotel.image;
    img.alt = hotel.name || '';
    img.loading = 'lazy';
    media.append(img);
    li.append(media);
  }

  const body = document.createElement('div');
  body.className = 'hotel-card-body';

  if (hotel.name) {
    const title = document.createElement('h3');
    title.className = 'hotel-card-title';
    title.textContent = hotel.name;
    body.append(title);
  }

  if (hotel.ctaLink) {
    const ctaWrap = document.createElement('p');
    ctaWrap.className = 'hotel-card-cta';
    const cta = document.createElement('a');
    cta.href = hotel.ctaLink;
    cta.className = 'button';
    cta.textContent = hotel.ctaLabel || 'Check availability';
    ctaWrap.append(cta);
    body.append(ctaWrap);
  }

  li.append(body);
}

export default async function init(el) {
  // One <li> per source row, carrying the row's UE instrumentation so each card
  // stays individually selectable/editable in the Universal Editor even though
  // the visible content is derived from the content fragment. Done synchronously
  // (before any await) so the data-aue-* attributes are preserved on the new
  // elements; a freshly added/empty card keeps its shell so it can be picked.
  const cards = [...el.children].map((row) => {
    const li = document.createElement('li');
    li.className = 'hotel-card';
    moveInstrumentation(row, li);
    return { path: extractPath(row), li };
  });

  const ul = document.createElement('ul');
  ul.className = 'hotel-cards-list';
  cards.forEach(({ li }) => ul.append(li));
  el.replaceChildren(ul);

  await Promise.all(cards.map(async ({ path, li }) => {
    const hotel = path ? await fetchHotel(path) : null;
    if (hotel) {
      fillCard(li, hotel);
      return;
    }
    // Empty/unresolved card (e.g. a card added in UE with no hotel picked yet).
    // Keep a visible, still-selectable placeholder.
    const body = document.createElement('div');
    body.className = 'hotel-card-body';
    const note = document.createElement('h3');
    note.className = 'hotel-card-title';
    note.textContent = path || 'Pick a hotel';
    body.append(note);
    li.append(body);
  }));
}
