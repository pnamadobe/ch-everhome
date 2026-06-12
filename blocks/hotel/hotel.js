import { fetchHotel } from '../../scripts/utils/cf.js';

/*
 * Featured Hotel block — renders a single "Everhome Hotel" content fragment.
 * The block's content is a single cell holding the chosen fragment's DAM path
 * (set via the Hotel dropdown in the Universal Editor). Mirrors the
 * columns-feature "featured" visual: image on the left, eyebrow / title /
 * description / CTA on the right.
 */
export default async function init(el) {
  const path = el.textContent.trim();
  el.textContent = '';
  if (!path) return;

  const hotel = await fetchHotel(path);
  if (!hotel) return;

  const inner = document.createElement('div');
  inner.className = 'hotel-inner';

  if (hotel.image && /^https?:\/\//.test(hotel.image)) {
    const media = document.createElement('div');
    media.className = 'hotel-media';
    const img = document.createElement('img');
    img.src = hotel.image;
    img.alt = hotel.name;
    img.loading = 'lazy';
    media.append(img);
    inner.append(media);
  }

  const body = document.createElement('div');
  body.className = 'hotel-body';

  if (hotel.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'hotel-eyebrow';
    eyebrow.textContent = hotel.eyebrow;
    body.append(eyebrow);
  }

  if (hotel.name) {
    const title = document.createElement('h2');
    title.className = 'hotel-title';
    title.textContent = hotel.name;
    body.append(title);
  }

  if (hotel.description) {
    const desc = document.createElement('p');
    desc.className = 'hotel-desc';
    desc.textContent = hotel.description;
    body.append(desc);
  }

  if (hotel.ctaLink) {
    const ctaWrap = document.createElement('p');
    ctaWrap.className = 'hotel-cta';
    const cta = document.createElement('a');
    cta.href = hotel.ctaLink;
    cta.className = 'button';
    cta.textContent = hotel.ctaLabel || 'Check availability';
    ctaWrap.append(cta);
    body.append(ctaWrap);
  }

  inner.append(body);
  el.append(inner);
}
