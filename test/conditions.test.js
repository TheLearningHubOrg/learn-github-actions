import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { effectiveCondition, shouldRun, statusFunction } from '../src/conditions.js';

describe('effectiveCondition', () => {
  it('defaults an empty if to success()', () => {
    assert.equal(effectiveCondition(''), 'success()');
  });

  it('wraps a condition without a status function in success() &&', () => {
    assert.equal(
      effectiveCondition("github.ref == 'refs/heads/main'"),
      "success() && (github.ref == 'refs/heads/main')",
    );
  });

  it('treats ${{ }} around the condition as optional', () => {
    assert.equal(effectiveCondition('${{ always() }}'), 'always()');
  });

  it('leaves a condition with a status function untouched', () => {
    assert.equal(effectiveCondition("failure() && github.event_name == 'push'"), "failure() && github.event_name == 'push'");
  });
});

describe('status functions', () => {
  const ok = { failed: false, cancelled: false };
  const failed = { failed: true, cancelled: false };
  const cancelled = { failed: false, cancelled: true };

  it('evaluates each function against the run state', () => {
    assert.equal(statusFunction('success', ok), true);
    assert.equal(statusFunction('success', failed), false);
    assert.equal(statusFunction('failure', failed), true);
    assert.equal(statusFunction('cancelled', cancelled), true);
    assert.equal(statusFunction('always', cancelled), true);
  });

  it('skips a plain condition after a failure because of the implicit success()', () => {
    assert.equal(shouldRun("github.ref == 'refs/heads/main'", failed, () => true), false);
    assert.equal(shouldRun("github.ref == 'refs/heads/main'", ok, () => true), true);
  });

  it('runs cleanup with !cancelled() after a failure but not after a cancel', () => {
    assert.equal(shouldRun('!cancelled()', failed), true);
    assert.equal(shouldRun('!cancelled()', cancelled), false);
  });

  it('runs always() even when the run was cancelled', () => {
    assert.equal(shouldRun('always()', cancelled), true);
  });
});
