// A dependency-free subset of what @actions/core does, written out so the
// runner protocol is visible: inputs arrive as INPUT_* environment variables,
// outputs and env vars are appended to files the runner names, and log
// commands are lines that start with "::".

import { appendFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { EOL } from 'node:os';

/** `with: { node-version: 24 }` arrives as INPUT_NODE-VERSION=24. */
export function inputEnvName(name) {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
}

export function getInput(name, { required = false, env = process.env } = {}) {
  const value = (env[inputEnvName(name)] ?? '').trim();
  if (required && value === '') throw new Error(`Input required and not supplied: ${name}`);
  return value;
}

/** YAML 1.2 "core schema" booleans, the only spellings @actions/core accepts. */
export function getBooleanInput(name, options) {
  const value = getInput(name, options);
  if (['true', 'True', 'TRUE'].includes(value)) return true;
  if (['false', 'False', 'FALSE'].includes(value)) return false;
  throw new TypeError(`Input "${name}" must be true or false, got "${value}"`);
}

/**
 * Formats one entry for $GITHUB_OUTPUT / $GITHUB_ENV. Single-line values use
 * name=value; anything with a newline uses a heredoc with a random delimiter
 * so the value cannot end the block early and inject extra entries.
 */
export function formatFileCommand(name, value, delimiter = `ghadelimiter_${randomUUID()}`) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (!text.includes('\n') && !text.includes('\r')) return `${name}=${text}${EOL}`;
  if (name.includes(delimiter) || text.includes(delimiter)) {
    throw new Error('Delimiter must not appear in the name or value');
  }
  return `${name}<<${delimiter}${EOL}${text}${EOL}${delimiter}${EOL}`;
}

/** Parses the content of a file command file back into key/value pairs. */
export function parseFileCommand(content) {
  const result = {};
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === '') continue;
    const heredoc = /^([^=<]+)<<(.+)$/.exec(line);
    if (heredoc) {
      const [, name, delimiter] = heredoc;
      const end = lines.indexOf(delimiter, i + 1);
      if (end === -1) throw new Error(`Unterminated heredoc for "${name}"`);
      const body = lines.slice(i + 1, end);
      i = end;
      result[name] = body.join('\n');
      continue;
    }
    const eq = line.indexOf('=');
    if (eq <= 0) throw new Error(`Invalid file command line: ${line}`);
    result[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return result;
}

function appendTo(fileVariable, name, value, env) {
  const file = env[fileVariable];
  if (!file) throw new Error(`${fileVariable} is not set; are you running inside a job?`);
  appendFileSync(file, formatFileCommand(name, value));
}

export const setOutput = (name, value, env = process.env) => appendTo('GITHUB_OUTPUT', name, value, env);
export const exportVariable = (name, value, env = process.env) => appendTo('GITHUB_ENV', name, value, env);
export const addPath = (dir, env = process.env) => {
  if (!env.GITHUB_PATH) throw new Error('GITHUB_PATH is not set');
  appendFileSync(env.GITHUB_PATH, `${dir}${EOL}`);
};

// Workflow commands ("::name key=value::message") need escaping, or a value
// containing a newline would start a second, attacker-controlled command.
export const escapeData = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
export const escapeProperty = (s) => escapeData(s).replace(/:/g, '%3A').replace(/,/g, '%2C');

export function command(name, properties, message) {
  const props = Object.entries(properties)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${escapeProperty(v)}`)
    .join(',');
  return `::${name}${props ? ` ${props}` : ''}::${escapeData(message)}`;
}

export const error = (message, props = {}) => console.log(command('error', props, message));
export const warning = (message, props = {}) => console.log(command('warning', props, message));
export const notice = (message, props = {}) => console.log(command('notice', props, message));
export const setSecret = (value) => console.log(command('add-mask', {}, value));
export const startGroup = (title) => console.log(command('group', {}, title));
export const endGroup = () => console.log('::endgroup::');

export function setFailed(message) {
  process.exitCode = 1;
  error(message);
}
