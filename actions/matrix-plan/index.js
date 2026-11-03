// Entry point of the `matrix-plan` JavaScript action. The runner starts it
// with `node index.js` using the Node version named in action.yml (node24).

import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { expandMatrix, matrixJobName } from '../../src/matrix.js';
import { getInput, notice, setFailed, setOutput } from '../../src/toolkit.js';

export function run(env = process.env) {
  const raw = getInput('matrix', { required: true, env });
  let matrix;
  try {
    matrix = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Input "matrix" is not valid JSON: ${err.message}`);
  }

  const limit = Number(getInput('max-jobs', { env }) || '256');
  const jobs = expandMatrix(matrix);
  if (jobs.length > limit) throw new Error(`Plan has ${jobs.length} jobs, max-jobs is ${limit}`);

  setOutput('include', JSON.stringify(jobs), env);
  setOutput('count', String(jobs.length), env);

  if (env.GITHUB_STEP_SUMMARY) {
    const rows = jobs.map((j) => `| ${matrixJobName('job', j)} |`).join('\n');
    appendFileSync(env.GITHUB_STEP_SUMMARY, `### Matrix plan: ${jobs.length} jobs\n\n| Job |\n| --- |\n${rows}\n`);
  }
  notice(`Matrix plan has ${jobs.length} jobs`);
  return jobs;
}

// Run only when executed directly, not when imported by the tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run();
  } catch (err) {
    setFailed(err.message);
  }
}
