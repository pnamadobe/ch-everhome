/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Everhome Suites (choicehotels.com) site-wide cleanup.
 *
 * Selectors are derived from the captured DOM in migration-work/cleaned.html.
 * The scrape already excluded global chrome (header, footer, nav) and the
 * app-driven booking-search widget, so the captured <main> contains only
 * authorable content (sections 1-11). The removals below are defensive
 * site-shell cleanup so the transformer is safe to reuse across other
 * choicehotels.com pages where that chrome IS present in the DOM, plus
 * attribute cleanup for the data-* annotations the scraper left on sections.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-authorable shell / widgets present in the live choicehotels.com DOM.
    // The importer renders the full page (header, footer, booking-search app,
    // cookie/onetrust, tracking pixels), so strip it before block parsing.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      'script',
      'noscript',
      'style',
      '[class*="cookie"]',
      '[id*="cookie"]',
      '[id*="onetrust"]',
      '[class*="onetrust"]',
      '[class*="breadcrumb"]',
      // App-driven hotel booking-search widget at the top of <main>.
      'search',
      '[role="search"]',
      '[class*="search-widget"]',
      '[class*="booking-search"]',
      // Skip-to-content link, top "___" anchor, and loading status.
      'a[href="#mainContent"]',
      'a[href="#"]',
      '[role="status"]',
      'status',
    ]);

    // Remove the standalone "Loading"/"Loading complete" status paragraph and
    // the mobile-app logo that precedes the hero (non-authorable shell).
    element.querySelectorAll('img[src*="ch-mobile-app-logo"]').forEach((img) => {
      const wrapper = img.closest('p') || img;
      wrapper.remove();
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Final removal of non-authorable elements and tracking/embeds.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      'aside',
      'script',
      'noscript',
      'style',
      'link',
      'iframe',
      'source',
    ]);

    // Attribute cleanup: strip scraper annotations and tracking attributes.
    // data-section / data-bg are added by the scraper for section detection
    // and are not authorable; the section transformer reads them before this
    // hook only insofar as it runs in afterTransform too (selectors match on
    // data-section), so we strip remaining tracking/event attributes here.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-tracking');
    });
  }
}
