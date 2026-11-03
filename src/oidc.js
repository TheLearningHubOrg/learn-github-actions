// Checks GitHub OIDC token claims the way a cloud trust policy does.
// Signature verification against the JWKS is the cloud provider's job and
// is out of scope here; this module covers the claim rules people get wrong.

export const GITHUB_ISSUER = 'https://token.actions.githubusercontent.com';

/** Converts a trust-policy pattern with `*` wildcards to a RegExp. */
function wildcard(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

/**
 * The `sub` claim changes shape with the trigger:
 *   repo:ORG/REPO:ref:refs/heads/main        push to a branch
 *   repo:ORG/REPO:ref:refs/tags/v1.2.0       push of a tag
 *   repo:ORG/REPO:environment:production     job that targets an environment
 *   repo:ORG/REPO:pull_request               any pull_request event
 */
export function subjectFor({ repository, ref, environment, eventName }) {
  if (environment) return `repo:${repository}:environment:${environment}`;
  if (eventName === 'pull_request') return `repo:${repository}:pull_request`;
  return `repo:${repository}:ref:${ref}`;
}

/**
 * @param {Record<string, unknown>} claims decoded JWT payload
 * @param {{ audience: string, subjects: string[], now?: number }} policy
 */
export function verifyClaims(claims, policy) {
  const now = policy.now ?? Math.floor(Date.now() / 1000);
  if (claims.iss !== GITHUB_ISSUER) return { valid: false, reason: 'issuer' };
  if (claims.aud !== policy.audience) return { valid: false, reason: 'audience' };
  if (typeof claims.exp !== 'number' || claims.exp <= now) return { valid: false, reason: 'expired' };
  const sub = String(claims.sub ?? '');
  if (!policy.subjects.some((p) => wildcard(p).test(sub))) return { valid: false, reason: 'subject' };
  return { valid: true };
}
