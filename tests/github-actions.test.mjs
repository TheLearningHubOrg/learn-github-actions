import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('GitHub Actions Matrix Expansion Engine', () => {
  function expandMatrix(dimensions, includes = [], excludes = []) {
    let combinations = [{}];

    for (const [key, values] of Object.entries(dimensions)) {
      const next = [];
      for (const combo of combinations) {
        for (const val of values) {
          next.push({ ...combo, [key]: val });
        }
      }
      combinations = next;
    }

    // Apply excludes
    combinations = combinations.filter(combo => {
      return !excludes.some(ex => {
        return Object.entries(ex).every(([k, v]) => combo[k] === v);
      });
    });

    // Apply includes
    for (const inc of includes) {
      const match = combinations.find(combo => {
        return Object.entries(inc).every(([k, v]) => combo[k] === undefined || combo[k] === v);
      });
      if (match) {
        Object.assign(match, inc);
      } else {
        combinations.push(inc);
      }
    }

    return combinations;
  }

  it('correctly computes cartesian product and applies include/exclude', () => {
    const dimensions = {
      os: ['ubuntu-latest', 'windows-latest'],
      node: ['18.x', '20.x']
    };
    // 2 x 2 = 4 combinations:
    // [ubuntu, 18], [ubuntu, 20], [windows, 18], [windows, 20]

    const excludes = [
      { os: 'windows-latest', node: '18.x' } // drops to 3
    ];

    const includes = [
      { os: 'macos-latest', node: '22.x' } // appends 1 -> total 4
    ];

    const result = expandMatrix(dimensions, includes, excludes);
    assert.equal(result.length, 4);

    const hasWindows18 = result.some(r => r.os === 'windows-latest' && r.node === '18.x');
    assert.equal(hasWindows18, false);

    const hasMac22 = result.some(r => r.os === 'macos-latest' && r.node === '22.x');
    assert.equal(hasMac22, true);
  });
});

describe('Workflow Status Check Expression Evaluator', () => {
  function evaluateStepCondition(condition, workflowState) {
    if (condition === 'always()') return true;
    if (condition === 'cancelled()') return workflowState.isCancelled === true;
    if (condition === 'failure()') return workflowState.hasFailed === true;
    if (condition === 'success()' || condition === '') return !workflowState.hasFailed && !workflowState.isCancelled;
    return false;
  }

  it('evaluates success(), failure(), and always() properly', () => {
    const normalState = { hasFailed: false, isCancelled: false };
    const failedState = { hasFailed: true, isCancelled: false };
    const cancelledState = { hasFailed: false, isCancelled: true };

    assert.equal(evaluateStepCondition('success()', normalState), true);
    assert.equal(evaluateStepCondition('success()', failedState), false);

    assert.equal(evaluateStepCondition('failure()', normalState), false);
    assert.equal(evaluateStepCondition('failure()', failedState), true);

    assert.equal(evaluateStepCondition('always()', failedState), true);
    assert.equal(evaluateStepCondition('always()', cancelledState), true);
  });
});

describe('GitHub OIDC JWT Claims Verification', () => {
  function verifyOidcClaims(claims, expectedRepo, allowedBranch) {
    if (claims.iss !== 'https://token.actions.githubusercontent.com') {
      return { valid: false, reason: 'Invalid issuer' };
    }
    if (claims.aud !== 'sts.amazonaws.com') {
      return { valid: false, reason: 'Audience mismatch' };
    }
    if (claims.repository !== expectedRepo) {
      return { valid: false, reason: 'Repository mismatch' };
    }
    const expectedSub = `repo:${expectedRepo}:ref:refs/heads/${allowedBranch}`;
    if (claims.sub !== expectedSub) {
      return { valid: false, reason: 'Subject branch mismatch' };
    }
    return { valid: true };
  }

  it('verifies valid GitHub OIDC claims for AWS STS assume role', () => {
    const claims = {
      iss: 'https://token.actions.githubusercontent.com',
      aud: 'sts.amazonaws.com',
      repository: 'manthanank/learn-github-actions',
      sub: 'repo:manthanank/learn-github-actions:ref:refs/heads/main'
    };

    const res = verifyOidcClaims(claims, 'manthanank/learn-github-actions', 'main');
    assert.equal(res.valid, true);
  });

  it('rejects untrusted fork branch attempting role assumption', () => {
    const untrustedClaims = {
      iss: 'https://token.actions.githubusercontent.com',
      aud: 'sts.amazonaws.com',
      repository: 'attacker/learn-github-actions',
      sub: 'repo:attacker/learn-github-actions:ref:refs/heads/exploit'
    };

    const res = verifyOidcClaims(untrustedClaims, 'manthanank/learn-github-actions', 'main');
    assert.equal(res.valid, false);
    assert.equal(res.reason, 'Repository mismatch');
  });
});
