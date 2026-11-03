import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  command,
  formatFileCommand,
  getBooleanInput,
  getInput,
  inputEnvName,
  parseFileCommand,
  setOutput,
} from '../src/toolkit.js';
import { run } from '../actions/matrix-plan/index.js';

describe('inputs', () => {
  it('maps input names to INPUT_ variables', () => {
    assert.equal(inputEnvName('node-version'), 'INPUT_NODE-VERSION');
    assert.equal(inputEnvName('my input'), 'INPUT_MY_INPUT');
  });

  it('trims values and enforces required inputs', () => {
    const env = { 'INPUT_NODE-VERSION': '  24 \n' };
    assert.equal(getInput('node-version', { env }), '24');
    assert.throws(() => getInput('token', { required: true, env }), /Input required/);
  });

  it('accepts only YAML core-schema booleans', () => {
    assert.equal(getBooleanInput('dry-run', { env: { 'INPUT_DRY-RUN': 'True' } }), true);
    assert.throws(() => getBooleanInput('dry-run', { env: { 'INPUT_DRY-RUN': 'yes' } }), TypeError);
  });
});

describe('file commands', () => {
  it('writes single-line values as name=value', () => {
    assert.deepEqual(parseFileCommand(formatFileCommand('version', '1.4.0')), { version: '1.4.0' });
  });

  it('writes multiline values as a heredoc that round-trips', () => {
    const notes = 'line one\nline two\nversion=9.9.9';
    const text = formatFileCommand('notes', notes, 'EOF_TEST');
    assert.match(text, /^notes<<EOF_TEST/);
    assert.deepEqual(parseFileCommand(text), { notes });
  });

  it('refuses a value that contains its own delimiter', () => {
    assert.throws(() => formatFileCommand('x', 'a\nEOF\nb', 'EOF'), /Delimiter/);
  });

  it('rejects an unterminated heredoc', () => {
    assert.throws(() => parseFileCommand('x<<EOF\nnever closed\n'), /Unterminated/);
  });
});

describe('workflow commands', () => {
  it('escapes newlines so a message cannot start a second command', () => {
    const line = command('warning', { file: 'src/a.js', line: 3 }, 'bad\n::add-mask::x');
    assert.equal(line, '::warning file=src/a.js,line=3::bad%0A::add-mask::x');
  });

  it('escapes : and , inside property values', () => {
    assert.equal(command('error', { title: 'a:b,c' }, 'm'), '::error title=a%3Ab%2Cc::m');
  });
});

describe('matrix-plan action', () => {
  let dir;
  let env;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'gha-'));
    env = { GITHUB_OUTPUT: join(dir, 'output'), GITHUB_STEP_SUMMARY: join(dir, 'summary') };
    writeFileSync(env.GITHUB_OUTPUT, '');
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('writes include and count outputs and a job summary', () => {
    env.INPUT_MATRIX = JSON.stringify({ os: ['ubuntu-latest'], node: [22, 24] });
    run(env);
    const outputs = parseFileCommand(readFileSync(env.GITHUB_OUTPUT, 'utf8'));
    assert.equal(outputs.count, '2');
    assert.deepEqual(JSON.parse(outputs.include), [
      { os: 'ubuntu-latest', node: 22 },
      { os: 'ubuntu-latest', node: 24 },
    ]);
    assert.match(readFileSync(env.GITHUB_STEP_SUMMARY, 'utf8'), /2 jobs/);
  });

  it('fails on invalid JSON and on plans above max-jobs', () => {
    env.INPUT_MATRIX = '{os: [ubuntu]}';
    assert.throws(() => run(env), /not valid JSON/);
    env.INPUT_MATRIX = JSON.stringify({ a: [1, 2, 3] });
    env['INPUT_MAX-JOBS'] = '2';
    assert.throws(() => run(env), /max-jobs is 2/);
  });

  it('setOutput fails loudly outside a job', () => {
    assert.throws(() => setOutput('x', 'y', {}), /GITHUB_OUTPUT is not set/);
  });
});
