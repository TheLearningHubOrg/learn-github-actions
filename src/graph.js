// Models the job graph that `needs:` builds, and how a failure upstream
// turns into "skipped" downstream.

/**
 * Groups jobs into waves that can run in parallel. Throws on unknown
 * dependencies and on cycles, the two errors GitHub reports before any job
 * starts.
 * @param {Record<string, { needs?: string | string[] }>} jobs
 * @returns {string[][]}
 */
export function planWaves(jobs) {
  const needsOf = (id) => {
    const n = jobs[id].needs ?? [];
    return Array.isArray(n) ? n : [n];
  };
  for (const id of Object.keys(jobs)) {
    for (const dep of needsOf(id)) {
      if (!(dep in jobs)) throw new Error(`Job "${id}" depends on unknown job "${dep}"`);
    }
  }

  const done = new Set();
  const waves = [];
  let remaining = Object.keys(jobs);
  while (remaining.length > 0) {
    const ready = remaining.filter((id) => needsOf(id).every((dep) => done.has(dep)));
    if (ready.length === 0) throw new Error(`Dependency cycle among: ${remaining.join(', ')}`);
    waves.push(ready);
    for (const id of ready) done.add(id);
    remaining = remaining.filter((id) => !done.has(id));
  }
  return waves;
}

const RUNS_AFTER_FAILURE = /\b(always|failure)\(\s*\)|!\s*cancelled\(\s*\)/;

/**
 * Simulates a run. `outcomes` says how each job ends if it runs
 * ('success' | 'failure'). A job whose dependencies did not all succeed is
 * skipped, unless its `if:` uses always(), failure() or !cancelled().
 * @returns {Record<string, 'success'|'failure'|'skipped'>}
 */
export function simulateRun(jobs, outcomes) {
  const result = {};
  const ancestorsOf = (id, seen = new Set()) => {
    for (const dep of [jobs[id].needs ?? []].flat()) {
      if (!seen.has(dep)) {
        seen.add(dep);
        ancestorsOf(dep, seen);
      }
    }
    return [...seen];
  };
  for (const wave of planWaves(jobs)) {
    for (const id of wave) {
      const deps = [jobs[id].needs ?? []].flat();
      const upstreamOk = deps.every((d) => result[d] === 'success');
      // failure() at job level looks at every ancestor, not only direct needs.
      const upstreamFailed = ancestorsOf(id).some((d) => result[d] === 'failure');
      const condition = jobs[id].if ?? '';
      let runs = upstreamOk;
      if (!upstreamOk && RUNS_AFTER_FAILURE.test(condition)) {
        // failure() is only true when an ancestor actually failed.
        runs = /\bfailure\(\s*\)/.test(condition) ? upstreamFailed : true;
      }
      if (upstreamOk && /\bfailure\(\s*\)/.test(condition) && !/\balways\(/.test(condition)) {
        runs = false;
      }
      result[id] = runs ? (outcomes[id] ?? 'success') : 'skipped';
    }
  }
  return result;
}
