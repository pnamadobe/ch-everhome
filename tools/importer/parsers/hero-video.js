/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Base block: hero.
 * Source: https://www.choicehotels.com/everhome-suites (live AEM core-components DOM)
 *
 * element = .cmp-brand-hero-banner
 *   - background video: <video src=".../*.mp4" class="cmp-brand-hero-banner__background-video">
 *   - overlaid brand logo: .cmp-brand-hero-banner__logo img
 *
 * The local hero block (blocks/hero/hero.js) decorates rows as:
 *   - last :scope > div  -> foreground content
 *   - preceding :scope > div(s) -> background; decorateBackground() looks for an
 *     anchor a[href*=".mp4"] to build the <video> element.
 *
 * Emits a single-column, two-row table:
 *   Row 1 (background): a link to the .mp4 video
 *   Row 2 (foreground): the brand logo image
 */
export default function parse(element, { document }) {
  const cells = [];

  // Background video URL: <video src>, nested <source src>, or any a[href*=".mp4"].
  const video = element.querySelector('video');
  const videoUrl = (video && video.getAttribute('src'))
    || (element.querySelector('video source') ? element.querySelector('video source').getAttribute('src') : null)
    || (element.querySelector('a[href*=".mp4"]') ? element.querySelector('a[href*=".mp4"]').getAttribute('href') : null);

  if (videoUrl) {
    const videoLink = document.createElement('a');
    videoLink.href = videoUrl;
    videoLink.textContent = videoUrl;
    cells.push([videoLink]);
  }

  // Foreground row: overlaid brand logo (plus any heading/CTA if present).
  const foreground = [];
  const heading = element.querySelector('h1, h2, h3');
  if (heading) foreground.push(heading);

  const logo = element.querySelector('.cmp-brand-hero-banner__logo img, img');
  if (logo) foreground.push(logo);

  cells.push(foreground);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
