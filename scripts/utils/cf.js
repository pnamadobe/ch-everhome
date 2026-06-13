/*
 * Content Fragment fetch helper for the Hotel + Hotel Cards blocks.
 *
 * Strategy (mirrors exp-cat-nfl's player-spotlight):
 *  1. Live: read the published "Everhome Hotel" fragment from AEM via a GraphQL
 *     persisted query on the publish tier. Works on the delivered site
 *     (*.aem.page / *.aem.live are CORS-allowed by AEM).
 *  2. Snapshot: when the live fetch is CORS-blocked — namely inside editors
 *     (Universal Editor / DA) whose origin (*.ue.da.live) AEM's CORS doesn't
 *     allow — fall back to ./hotels.json, served from the SAME origin as this
 *     module, so no CORS applies. This powers the in-editor preview; the live
 *     site always uses live AEM data.
 *
 * Keep hotels.json in sync when fragment text/images change (it's only a
 * preview snapshot; the published site doesn't depend on it).
 */
const PUBLISH = 'https://publish-p59602-e520244.adobeaemcloud.com';
const PROJECT = 'aem-demo-assets';
const QUERY = 'everhome-hotel-by-path';

// In-flight + resolved cache so the same fragment isn't fetched twice per page.
const cache = new Map();

function normalize(item) {
  if (!item) return null;
  const description = item.description?.plaintext ?? item.description ?? '';
  // AEM GraphQL exposes content-reference fields as { _path, _publishUrl }.
  // eslint-disable-next-line no-underscore-dangle
  const image = item.image?._publishUrl ?? item.image?._path ?? item.image ?? '';
  return {
    name: item.name ?? '',
    eyebrow: item.eyebrow ?? '',
    description,
    image,
    ctaLabel: item.ctaLabel ?? '',
    ctaLink: item.ctaLink ?? '',
  };
}

// fetch with a hard timeout — a hung/pending request (e.g. inside an editor)
// must never stall block decoration, which would freeze the page render.
function timedFetch(url, ms = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Live AEM data via the GraphQL persisted query (published site).
async function fetchLive(path) {
  try {
    // path: AEM persisted-query variables take the raw value; the slashes must
    // NOT be percent-encoded or AEM resolves the encoded string literally.
    // ck: stable cache key (bump when the query shape changes) so the browser's
    // first cross-origin GET populates a per-origin, CORS-correct cache entry.
    const url = `${PUBLISH}/graphql/execute.json/${PROJECT}/${QUERY};path=${path}?ck=eh2`;
    const resp = await timedFetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    return normalize(json?.data?.everhomeHotelByPath?.item ?? json?.data?.item ?? null);
  } catch {
    return null;
  }
}

// Same-origin snapshot, used only when the live fetch is blocked (editors).
async function fetchSnapshot(path) {
  try {
    const resp = await timedFetch(new URL('./hotels.json', import.meta.url));
    if (!resp.ok) return null;
    const data = await resp.json();
    return data[path] ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch one Everhome Hotel content fragment by its DAM path. Tries live AEM,
 * then the same-origin snapshot (editor preview).
 * @param {string} path e.g. /content/dam/26H2/choicehotels/everhome-...
 * @returns {Promise<object|null>} normalized hotel data, or null
 */
export async function fetchHotel(path) {
  if (!path) return null;
  if (cache.has(path)) return cache.get(path);
  const promise = (async () => (await fetchLive(path)) || fetchSnapshot(path))();
  cache.set(path, promise);
  return promise;
}
