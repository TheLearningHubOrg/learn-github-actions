#!/usr/bin/env node
// Small CLI over the models, used by the Docker image and for local experiments:
//   node src/cli.js matrix '{"os":["ubuntu-latest","windows-latest"],"node":[22,24]}'
//   node src/cli.js waves  '{"lint":{},"test":{},"build":{"needs":["lint","test"]}}'
//   node src/cli.js condition "github.ref == 'refs/heads/main'"
//   node src/cli.js demo

import { pathToFileURL } from 'node:url';
import { expandMatrix, matrixJobName } from './matrix.js';
import { planWaves } from './graph.js';
import { effectiveCondition } from './conditions.js';

const DEMO_MATRIX = {
  os: ['ubuntu-latest', 'windows-latest'],
  node: [22, 24],
  exclude: [{ os: 'windows-latest', node: 22 }],
  include: [{ node: 24, coverage: true }, { os: 'ubuntu-24.04-arm', node: 24 }],
};

const DEMO_JOBS = {
  lint: {},
  test: {},
  build: { needs: ['lint', 'test'] },
  'deploy-staging': { needs: 'build' },
  'deploy-production': { needs: 'deploy-staging' },
};

export function main(argv, out = console.log) {
  const [cmd, arg] = argv;
  switch (cmd) {
    case 'matrix': {
      for (const combo of expandMatrix(JSON.parse(arg))) out(matrixJobName('job', combo));
      return 0;
    }
    case 'waves': {
      planWaves(JSON.parse(arg)).forEach((wave, i) => out(`wave ${i + 1}: ${wave.join(', ')}`));
      return 0;
    }
    case 'condition': {
      out(effectiveCondition(arg ?? ''));
      return 0;
    }
    case 'demo': {
      out('Matrix expansion:');
      main(['matrix', JSON.stringify(DEMO_MATRIX)], (l) => out(`  ${l}`));
      out('Job waves:');
      main(['waves', JSON.stringify(DEMO_JOBS)], (l) => out(`  ${l}`));
      out('Implicit success():');
      out(`  ${effectiveCondition("github.ref == 'refs/heads/main'")}`);
      return 0;
    }
    default:
      out('usage: cli.js <matrix|waves|condition|demo> [json-or-expression]');
      return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
