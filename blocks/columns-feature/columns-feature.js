function isUppercaseEyebrow(p) {
  const text = p.textContent.trim();
  if (!text || text.length > 40) return false;
  const letters = text.replace(/[^a-zA-Z]/g, '');
  return letters.length > 0 && text === text.toUpperCase();
}

// A promo banner is a feature row with an uppercase eyebrow label and a
// standalone CTA link — render it as a compact dark banner (image | text | CTA).
function decorateBanner(el) {
  const row = el.firstElementChild;
  const textCol = [...row.children].find((c) => !c.querySelector('picture'));
  if (!textCol) return false;
  const eyebrow = textCol.querySelector(':scope > p');
  const ctaLink = textCol.querySelector(':scope > p > a');
  if (!eyebrow || !isUppercaseEyebrow(eyebrow) || !ctaLink) return false;

  el.classList.add('columns-feature-banner');
  eyebrow.classList.add('cf-banner-eyebrow');
  textCol.classList.add('cf-banner-text');

  // Promote the CTA to a sibling so the row lays out as image | text | CTA.
  const ctaPara = ctaLink.closest('p');
  ctaPara.classList.add('cf-banner-cta');
  row.append(ctaPara);
  return true;
}

// A feature row pairs an image with a text column that has a leading eyebrow
// label above the heading. Two flavours:
//  - featured: has a CTA link → filled button + rounded image (e.g. "Featured
//    hotel" → heading → "Check availability").
//  - welcome: no CTA → windowbox (inset, rounded) image + eyebrow/heading
//    text treatment (e.g. "Closer to Home" → "Welcome to Everhome Suites").
function decorateFeatured(el) {
  const row = el.firstElementChild;
  const textCol = [...row.children].find((c) => !c.querySelector('picture'));
  if (!textCol) return;
  const eyebrow = textCol.querySelector(':scope > p:first-child');
  const heading = textCol.querySelector('h2, h3, h4');
  if (!eyebrow || eyebrow.querySelector('a') || !heading) return;
  const ctaLink = textCol.querySelector(':scope > p > a');

  if (ctaLink) {
    el.classList.add('columns-feature-featured');
    eyebrow.classList.add('cf-featured-eyebrow');
    ctaLink.closest('p').classList.add('cf-featured-cta');
  } else {
    el.classList.add('columns-feature-welcome');
    eyebrow.classList.add('cf-welcome-eyebrow');
  }
}

export default function init(el) {
  const cols = [...el.firstElementChild.children];
  el.classList.add(`columns-feature-${cols.length}-cols`);

  // setup image columns
  [...el.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-feature-img-col');
        }
      }
    });
  });

  if (!decorateBanner(el)) decorateFeatured(el);
}
