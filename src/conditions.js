// Models how `if:` conditions and status-check functions decide whether a
// step or job runs.

const STATUS_FUNCTION = /\b(success|failure|always|cancelled)\(\s*\)/;

/**
 * GitHub wraps any `if:` that does not call a status function in
 * `success() && (...)`. That is why `if: github.ref == 'refs/heads/main'`
 * silently skips after an earlier failure.
 */
export function effectiveCondition(expression = '') {
  let expr = expression.trim();
  // `${{ }}` around an `if:` is optional; strip it so both forms behave the same.
  const wrapped = /^\$\{\{([\s\S]*)\}\}$/.exec(expr);
  if (wrapped) expr = wrapped[1].trim();
  if (expr === '') return 'success()';
  return STATUS_FUNCTION.test(expr) ? expr : `success() && (${expr})`;
}

/**
 * Evaluates the four status functions for a given run state.
 * @param {'success'|'failure'|'always'|'cancelled'} fn
 * @param {{ failed?: boolean, cancelled?: boolean }} state
 */
export function statusFunction(fn, state) {
  const failed = Boolean(state.failed);
  const cancelled = Boolean(state.cancelled);
  switch (fn) {
    case 'success':
      return !failed && !cancelled;
    case 'failure':
      return failed;
    case 'cancelled':
      return cancelled;
    case 'always':
      return true;
    default:
      throw new Error(`Unknown status function ${fn}()`);
  }
}

/**
 * Decides whether a step runs, given its `if:` and a predicate for the
 * non-status part. Supports the shapes people actually write:
 *   success(), failure(), always(), cancelled(), !cancelled(),
 *   and "<status fn> && <predicate>".
 */
export function shouldRun(expression, state, predicate = () => true) {
  const expr = effectiveCondition(expression);
  const [head, ...rest] = expr.split('&&').map((s) => s.trim());
  const negated = head.startsWith('!');
  const fn = head.replace(/^!/, '').replace(/\(\s*\)$/, '');
  let result = statusFunction(fn, state);
  if (negated) result = !result;
  return rest.length === 0 ? result : result && predicate(rest.join(' && '));
}
