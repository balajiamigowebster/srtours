/**
 * Fetch JSON from the Express API first; if unavailable (e.g. static Vercel deploy),
 * seamlessly fall back to the pre-exported static JSON in /data/.
 */
export async function fetchJson(apiUrl, staticUrl) {
  for (const url of [apiUrl, staticUrl]) {
    try {
      const r = await fetch(url);
      const ct = r.headers.get('content-type') || '';
      if (r.ok && ct.includes('application/json')) {
        return await r.json();
      }
    } catch {
      // try fallback
    }
  }
  throw new Error(`Failed to load ${apiUrl}`);
}
