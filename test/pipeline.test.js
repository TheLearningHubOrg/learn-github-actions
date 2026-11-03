import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { planWaves, simulateRun } from '../src/graph.js';
import { hashFiles, readableScopes, restoreCache, saveCache } from '../src/cache.js';
import { ConcurrencyGroup } from '../src/concurrency.js';
import { subjectFor, verifyClaims, GITHUB_ISSUER } from '../src/oidc.js';
import { main } from '../src/cli.js';

describe('needs graph', () => {
  const jobs = {
    lint: {},
    test: {},
    build: { needs: ['lint', 'test'] },
    deploy: { needs: 'build' },
    notify: { needs: ['deploy'], if: 'failure()' },
    report: { needs: ['test'], if: 'always()' },
  };

  it('groups jobs into parallel waves', () => {
    assert.deepEqual(planWaves(jobs), [['lint', 'test'], ['build', 'report'], ['deploy'], ['notify']]);
  });

  it('reports unknown dependencies and cycles', () => {
    assert.throws(() => planWaves({ a: { needs: 'ghost' } }), /unknown job "ghost"/);
    assert.throws(() => planWaves({ a: { needs: 'b' }, b: { needs: 'a' } }), /cycle/);
  });

  it('skips everything downstream of a failure except always()/failure() jobs', () => {
    const result = simulateRun(jobs, { test: 'failure' });
    assert.equal(result.build, 'skipped');
    assert.equal(result.deploy, 'skipped');
    assert.equal(result.report, 'success');
    // notify needs deploy (skipped), but failure() checks all ancestors,
    // and test is an ancestor that failed.
    assert.equal(result.notify, 'success');
  });

  it('runs a failure() job only when some ancestor failed', () => {
    assert.equal(simulateRun(jobs, {}).notify, 'skipped');
    assert.equal(simulateRun(jobs, { deploy: 'failure' }).notify, 'success');
  });
});

describe('cache', () => {
  it('hashes contents, not paths order, and returns empty for no files', () => {
    const a = { path: 'a/package-lock.json', content: '{"v":1}' };
    const b = { path: 'b/package-lock.json', content: '{"v":2}' };
    assert.equal(hashFiles([a, b]), hashFiles([b, a]));
    assert.notEqual(hashFiles([a]), hashFiles([{ ...a, content: '{"v":3}' }]));
    assert.equal(hashFiles([]), '');
  });

  it('searches own branch, then PR base, then default branch', () => {
    assert.deepEqual(readableScopes({ ref: 'refs/pull/7/merge', baseRef: 'release', defaultBranch: 'main' }), [
      'refs/pull/7/merge',
      'refs/heads/release',
      'refs/heads/main',
    ]);
  });

  it('reports cache-hit only on an exact primary key match', () => {
    const entries = [
      { key: 'Linux-npm-aaa', scope: 'refs/heads/main', createdAt: 1 },
      { key: 'Linux-npm-bbb', scope: 'refs/heads/main', createdAt: 2 },
    ];
    const req = { key: 'Linux-npm-ccc', restoreKeys: ['Linux-npm-'], ref: 'refs/heads/feature', defaultBranch: 'main' };
    assert.deepEqual(restoreCache(entries, req), { cacheHit: false, matchedKey: 'Linux-npm-bbb', scope: 'refs/heads/main' });
    assert.equal(restoreCache(entries, { ...req, key: 'Linux-npm-aaa' }).cacheHit, true);
  });

  it('cannot read a sibling feature branch cache', () => {
    const entries = [{ key: 'Linux-npm-x', scope: 'refs/heads/other-feature', createdAt: 1 }];
    const res = restoreCache(entries, { key: 'Linux-npm-x', ref: 'refs/heads/feature', defaultBranch: 'main' });
    assert.equal(res.matchedKey, null);
  });

  it('never overwrites an existing key', () => {
    const entries = [];
    assert.equal(saveCache(entries, { key: 'k', scope: 'refs/heads/main' }), true);
    assert.equal(saveCache(entries, { key: 'k', scope: 'refs/heads/main' }), false);
    assert.equal(entries.length, 1);
  });
});

describe('concurrency group', () => {
  it('keeps one pending run and cancels the older pending one', () => {
    const g = new ConcurrencyGroup({ cancelInProgress: false });
    g.enqueue('run-1');
    g.enqueue('run-2');
    g.enqueue('run-3');
    g.complete('run-1');
    assert.deepEqual(g.log, [
      'run-1: started',
      'run-2: pending',
      'run-2: cancelled (pending replaced by run-3)',
      'run-3: pending',
      'run-1: completed',
      'run-3: started',
    ]);
  });

  it('cancels the running run when cancel-in-progress is true', () => {
    const g = new ConcurrencyGroup({ cancelInProgress: true });
    g.enqueue('run-1');
    g.enqueue('run-2');
    assert.equal(g.running, 'run-2');
    assert.match(g.log.join('\n'), /run-1: cancelled/);
  });
});

describe('OIDC claims', () => {
  const now = 1_800_000_000;
  const policy = {
    audience: 'sts.amazonaws.com',
    subjects: ['repo:TheLearningHubOrg/learn-github-actions:environment:production'],
    now,
  };
  const base = { iss: GITHUB_ISSUER, aud: 'sts.amazonaws.com', exp: now + 300 };

  it('builds the sub claim for each trigger shape', () => {
    const repository = 'TheLearningHubOrg/learn-github-actions';
    assert.equal(subjectFor({ repository, ref: 'refs/heads/main' }), `repo:${repository}:ref:refs/heads/main`);
    assert.equal(subjectFor({ repository, environment: 'production' }), `repo:${repository}:environment:production`);
    assert.equal(subjectFor({ repository, eventName: 'pull_request' }), `repo:${repository}:pull_request`);
  });

  it('accepts the production environment and rejects a fork, a PR and an expired token', () => {
    const sub = 'repo:TheLearningHubOrg/learn-github-actions:environment:production';
    assert.deepEqual(verifyClaims({ ...base, sub }, policy), { valid: true });
    assert.equal(verifyClaims({ ...base, sub: 'repo:attacker/learn-github-actions:environment:production' }, policy).reason, 'subject');
    assert.equal(verifyClaims({ ...base, sub: 'repo:TheLearningHubOrg/learn-github-actions:pull_request' }, policy).reason, 'subject');
    assert.equal(verifyClaims({ ...base, sub, exp: now - 1 }, policy).reason, 'expired');
    assert.equal(verifyClaims({ ...base, sub, aud: 'api://AzureADTokenExchange' }, policy).reason, 'audience');
  });

  it('treats * as a wildcard and anchors the whole subject', () => {
    const wide = { ...policy, subjects: ['repo:TheLearningHubOrg/*:ref:refs/heads/main'] };
    assert.equal(verifyClaims({ ...base, sub: 'repo:TheLearningHubOrg/any:ref:refs/heads/main' }, wide).valid, true);
    assert.equal(verifyClaims({ ...base, sub: 'repo:TheLearningHubOrgX/any:ref:refs/heads/mainX' }, wide).valid, false);
  });
});

describe('cli', () => {
  it('prints the demo plan', () => {
    const lines = [];
    assert.equal(main(['demo'], (l) => lines.push(l)), 0);
    assert.ok(lines.includes('  job (ubuntu-24.04-arm, 24)'));
    assert.ok(lines.includes('  wave 2: build'));
  });

  it('returns 2 with usage for an unknown command', () => {
    const lines = [];
    assert.equal(main(['nope'], (l) => lines.push(l)), 2);
  });
});
