export default function init(el) {
  const ul = document.createElement('ul');
  [...el.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-feature-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture, img')) {
        div.className = 'cards-feature-card-image';
      } else {
        div.className = 'cards-feature-card-body';
        // promote a trailing link paragraph to a CTA
        const lastPara = div.querySelector(':scope > p:last-of-type');
        if (lastPara && lastPara.querySelector('a')) {
          lastPara.classList.add('cards-feature-card-cta');
        }
        // A leading short paragraph above a heading is an eyebrow label.
        const firstPara = div.querySelector(':scope > p:first-child');
        const heading = div.querySelector('h2, h3, h4, h5, h6');
        if (firstPara && heading && !firstPara.querySelector('a')) {
          firstPara.classList.add('cards-feature-card-eyebrow');
        }
        // A body that is just a link (no heading/paragraph) is an image
        // caption overlaid on the photo (location cards).
        if (!heading && div.querySelector(':scope > a')
          && div.textContent.trim() === div.querySelector(':scope > a').textContent.trim()) {
          div.classList.add('cards-feature-card-caption');
        }
      }
    });
    ul.append(li);
  });
  el.textContent = '';
  el.append(ul);

  // Featured-hotel variant: cards with an eyebrow label above the heading.
  if (ul.querySelector('.cards-feature-card-eyebrow')) {
    el.classList.add('cards-feature-featured');
  }
  // Media-overlay variant: cards whose only body is a caption link over the image.
  if (ul.querySelector('.cards-feature-card-caption')) {
    el.classList.add('cards-feature-overlay');
  }
  // Icon-grid variant: cards using h4 headings with line-art icons (amenities).
  if (!el.classList.contains('cards-feature-featured')
    && !el.classList.contains('cards-feature-overlay')
    && ul.querySelector('.cards-feature-card-body h4')) {
    el.classList.add('cards-feature-icons');
  }
}
