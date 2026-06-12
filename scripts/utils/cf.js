/*
 * Content Fragment fetch helper.
 *
 * The Featured Hotel and Hotel Cards blocks render AEM Content Fragments
 * ("Everhome Hotel" model). AEM as a Cloud Service has no public single-fragment
 * JSON endpoint by default, so we read published fragments through a GraphQL
 * PERSISTED QUERY on the publish tier (the one CORS-friendly, dispatcher-allowed
 * mechanism). The persisted query must be created + published in AEM, and the
 * EDS origin allow-listed via CORS. See ue/HOTELS.md.
 *
 * Adjust these constants to match the AEM setup:
 *   PUBLISH  – AEM publish tier origin
 *   PROJECT  – config that holds the persisted query (currently aem-demo-assets)
 *   QUERY    – persisted query name; must accept a `path` parameter and return
 *              name, eyebrow, description { plaintext }, image { _path },
 *              ctaLabel, ctaLink.
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
  const image = item.image?._path ?? item.image?._publishUrl ?? item.image ?? '';
  return {
    name: item.name ?? '',
    eyebrow: item.eyebrow ?? '',
    description,
    image,
    ctaLabel: item.ctaLabel ?? '',
    ctaLink: item.ctaLink ?? '',
  };
}

/**
 * Fetch one Everhome Hotel content fragment by its DAM path.
 * @param {string} path e.g. /content/dam/26H2/choicehotels/everhome-...
 * @returns {Promise<object|null>} normalized hotel data, or null on failure
 */
export async function fetchHotel(path) {
  if (!path) return null;
  if (cache.has(path)) return cache.get(path);

  const promise = (async () => {
    try {
      const url = `${PUBLISH}/graphql/execute.json/${PROJECT}/${QUERY};path=${encodeURIComponent(path)}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const json = await resp.json();
      // Persisted query is expected to expose `everhomeHotelByPath { item { ... } }`.
      const item = json?.data?.everhomeHotelByPath?.item
        ?? json?.data?.item
        ?? null;
      return normalize(item);
    } catch {
      return null;
    }
  })();

  cache.set(path, promise);
  return promise;
}
