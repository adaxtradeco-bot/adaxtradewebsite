/**
 * Canonical key for an API URL: pathname + sorted query pairs.
 * Mirrors normalizeApiKey in export-template/static-shim.js; both are checked
 * against __tests__/fixtures/api-key-vectors.json.
 */
const BASE = 'http://static.invalid';

const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

export function normalizeApiKey(urlOrPath: string): string {
  const url = new URL(String(urlOrPath), BASE);
  const pairs: Array<[string, string]> = [];
  url.searchParams.forEach((value, name) => pairs.push([name, value]));
  pairs.sort((a, b) => compare(a[0], b[0]) || compare(a[1], b[1]));
  const query = new URLSearchParams(pairs).toString();
  return url.pathname + (query ? `?${query}` : '');
}
