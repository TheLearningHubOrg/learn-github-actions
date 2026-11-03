// Re-implements how GitHub Actions expands `strategy.matrix`.
// Order of operations on the runner service:
//   1. Cartesian product of every dimension (keys other than include/exclude).
//   2. Remove combinations that match any `exclude` entry (partial match is enough).
//   3. Apply `include` entries one by one against the surviving ORIGINAL combinations.
//   4. Reject the result if it exceeds the per-workflow-run job limit.

export const MAX_MATRIX_JOBS = 256;

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * @param {Record<string, unknown>} matrix the object under `strategy.matrix`
 * @returns {Array<Record<string, unknown>>} one object per job, in run order
 */
export function expandMatrix(matrix) {
  const { include = [], exclude = [], ...dimensions } = matrix;
  const dimensionKeys = Object.keys(dimensions);

  for (const key of dimensionKeys) {
    if (!Array.isArray(dimensions[key]) || dimensions[key].length === 0) {
      throw new Error(`Matrix dimension "${key}" must be a non-empty array`);
    }
  }

  // 1. Cartesian product. With no dimensions, there are no base combinations;
  //    a matrix made only of `include` entries is legal.
  let base = dimensionKeys.length === 0 ? [] : [{}];
  for (const key of dimensionKeys) {
    base = base.flatMap((combo) => dimensions[key].map((value) => ({ ...combo, [key]: value })));
  }

  // 2. Exclude: every key in the exclude entry must equal the combination's value.
  base = base.filter(
    (combo) => !exclude.some((ex) => Object.entries(ex).every(([k, v]) => same(combo[k], v))),
  );

  // 3. Include. An entry merges into every base combination where it would not
  //    overwrite an ORIGINAL dimension value. Values added by an earlier include
  //    may be overwritten. If it merges nowhere, it becomes a new combination,
  //    and later includes never merge into such standalone combinations.
  const extra = [];
  for (const entry of include) {
    const targets = base.filter((combo) =>
      Object.entries(entry).every(
        ([k, v]) => !dimensionKeys.includes(k) || same(combo[k], v),
      ),
    );
    if (targets.length > 0) {
      for (const combo of targets) Object.assign(combo, entry);
    } else {
      extra.push({ ...entry });
    }
  }

  const jobs = [...base, ...extra];
  if (jobs.length > MAX_MATRIX_JOBS) {
    throw new Error(`Matrix produces ${jobs.length} jobs; the limit is ${MAX_MATRIX_JOBS}`);
  }
  return jobs;
}

/** The job name GitHub shows by default: `build (ubuntu-latest, 24)`. */
export function matrixJobName(jobId, combo) {
  const values = Object.values(combo).map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)));
  return values.length ? `${jobId} (${values.join(', ')})` : jobId;
}
