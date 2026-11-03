import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { expandMatrix, matrixJobName, MAX_MATRIX_JOBS } from '../src/matrix.js';

describe('expandMatrix', () => {
  it('builds the cartesian product in declaration order', () => {
    const jobs = expandMatrix({ os: ['ubuntu-latest', 'windows-latest'], node: [22, 24] });
    assert.deepEqual(jobs, [
      { os: 'ubuntu-latest', node: 22 },
      { os: 'ubuntu-latest', node: 24 },
      { os: 'windows-latest', node: 22 },
      { os: 'windows-latest', node: 24 },
    ]);
  });

  it('excludes on a partial match', () => {
    const jobs = expandMatrix({
      os: ['ubuntu-latest', 'windows-latest'],
      node: [22, 24],
      db: ['postgres', 'sqlite'],
      exclude: [{ os: 'windows-latest', db: 'postgres' }],
    });
    assert.equal(jobs.length, 6);
    assert.ok(!jobs.some((j) => j.os === 'windows-latest' && j.db === 'postgres'));
  });

  it('merges an include into every combination it does not contradict', () => {
    const jobs = expandMatrix({
      os: ['ubuntu-latest', 'windows-latest'],
      node: [22, 24],
      include: [{ node: 24, coverage: true }],
    });
    assert.equal(jobs.length, 4);
    assert.deepEqual(
      jobs.filter((j) => j.coverage).map((j) => j.os),
      ['ubuntu-latest', 'windows-latest'],
    );
  });

  it('appends an include that would overwrite an original value', () => {
    const jobs = expandMatrix({
      os: ['ubuntu-latest'],
      node: [22, 24],
      include: [{ os: 'macos-latest', node: 24 }],
    });
    assert.equal(jobs.length, 3);
    assert.deepEqual(jobs.at(-1), { os: 'macos-latest', node: 24 });
  });

  it('lets a later include overwrite a value added by an earlier include', () => {
    const jobs = expandMatrix({
      os: ['ubuntu-latest', 'windows-latest'],
      include: [{ shell: 'bash' }, { os: 'windows-latest', shell: 'pwsh' }],
    });
    assert.deepEqual(jobs, [
      { os: 'ubuntu-latest', shell: 'bash' },
      { os: 'windows-latest', shell: 'pwsh' },
    ]);
  });

  it('never merges a later include into a standalone include combination', () => {
    const jobs = expandMatrix({
      os: ['ubuntu-latest'],
      include: [{ os: 'macos-latest' }, { os: 'macos-latest', xcode: '16' }],
    });
    assert.deepEqual(jobs, [{ os: 'ubuntu-latest' }, { os: 'macos-latest' }, { os: 'macos-latest', xcode: '16' }]);
  });

  it('applies exclude before include, so an include can re-add an excluded pair', () => {
    const jobs = expandMatrix({
      os: ['ubuntu-latest', 'windows-latest'],
      node: [22],
      exclude: [{ os: 'windows-latest' }],
      include: [{ os: 'windows-latest', node: 22, experimental: true }],
    });
    assert.deepEqual(jobs, [
      { os: 'ubuntu-latest', node: 22 },
      { os: 'windows-latest', node: 22, experimental: true },
    ]);
  });

  it('accepts a matrix made only of include entries', () => {
    const jobs = expandMatrix({ include: [{ service: 'api' }, { service: 'web' }] });
    assert.deepEqual(jobs, [{ service: 'api' }, { service: 'web' }]);
  });

  it('rejects empty dimensions and plans over the job limit', () => {
    assert.throws(() => expandMatrix({ os: [] }), /non-empty array/);
    const big = { a: Array.from({ length: 17 }, (_, i) => i), b: Array.from({ length: 16 }, (_, i) => i) };
    assert.throws(() => expandMatrix(big), new RegExp(`limit is ${MAX_MATRIX_JOBS}`));
  });

  it('names jobs the way the checks UI does', () => {
    assert.equal(matrixJobName('test', { os: 'ubuntu-latest', node: 24 }), 'test (ubuntu-latest, 24)');
    assert.equal(matrixJobName('lint', {}), 'lint');
  });
});
