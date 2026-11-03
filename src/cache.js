// Models actions/cache lookup and save rules, so the reason for a miss can
// be tested instead of guessed.

import { createHash } from 'node:crypto';

/**
 * Like hashFiles(): hash each file, then hash the list of hashes. Files are
 * sorted by path so the result does not depend on filesystem order. Returns
 * '' when nothing matched, which is what makes `key: deps-${{ hashFiles('x') }}`
 * collapse to `deps-` when the lockfile path is wrong.
 * @param {Array<{ path: string, content: string | Buffer }>} files
 */
export function hashFiles(files) {
  if (files.length === 0) return '';
  const outer = createHash('sha256');
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    outer.update(createHash('sha256').update(file.content).digest());
  }
  return outer.digest('hex');
}

/**
 * Which branches a run may read caches from, in search order. A run can read
 * its own ref, then the PR base branch, then the default branch. It can never
 * read a sibling feature branch's cache.
 */
export function readableScopes({ ref, baseRef, defaultBranch }) {
  const scopes = [ref];
  if (baseRef) scopes.push(`refs/heads/${baseRef}`);
  scopes.push(`refs/heads/${defaultBranch}`);
  return [...new Set(scopes)];
}

/**
 * @param {Array<{ key: string, scope: string, createdAt: number }>} entries
 * @param {{ key: string, restoreKeys?: string[], ref: string, baseRef?: string, defaultBranch: string }} request
 * @returns {{ cacheHit: boolean, matchedKey: string | null, scope: string | null }}
 */
export function restoreCache(entries, request) {
  const { key, restoreKeys = [] } = request;
  for (const scope of readableScopes(request)) {
    const inScope = entries.filter((e) => e.scope === scope);
    const exact = inScope.find((e) => e.key === key);
    if (exact) return { cacheHit: true, matchedKey: exact.key, scope };
    for (const prefix of restoreKeys) {
      const newest = inScope
        .filter((e) => e.key.startsWith(prefix))
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      if (newest) return { cacheHit: false, matchedKey: newest.key, scope };
    }
  }
  return { cacheHit: false, matchedKey: null, scope: null };
}

/**
 * Cache entries are immutable: saving a key that already exists in the same
 * scope is skipped. To refresh a cache you must change the key.
 * @returns {boolean} true when a new entry was written
 */
export function saveCache(entries, { key, scope, createdAt = Date.now() }) {
  if (entries.some((e) => e.key === key && e.scope === scope)) return false;
  entries.push({ key, scope, createdAt });
  return true;
}
