import { fetchHotel } from '../../scripts/utils/cf.js';

/*
 * Hotel Cards block — a grid of "Everhome Hotel" content fragments.
 * Each child row holds one cell with the chosen fragment's DAM path (set via the
 * Hotel dropdown per card in the Universal Editor). Mirrors the cards-feature
 * grid: image, hotel name, and a "Check availability" CTA per card.
 */
export default async function init(el) {
  const paths = [...el.children]
    .map((row) => row.textContent.trim())
    .filter(Boolean);
  el.textContent = '';
  if (!paths.length) return;

  const hotels = await Promise.all(paths.map((p) => fetchHotel(p)));

  const ul = document.createElement('ul');
  ul.className = 'hotel-cards-list';

  hotels.forEach((hotel) => {
    if (!hotel) return;
    const li = document.createElement('li');
    li.className = 'hotel-card';

    if (hotel.image && /^https?:\/\//.test(hotel.image)) {
      const media = document.createElement('div');
      media.className = 'hotel-card-image';
      const img = document.createElement('img');
      img.src = hotel.image;
      img.alt = hotel.name;
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
    ul.append(li);
  });

  el.append(ul);
}
