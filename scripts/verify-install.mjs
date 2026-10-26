import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, statSync, lstatSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'skills', 'mlga');
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run this check with npm run verify:install.');
const fixture = mkdtempSync(join(tmpdir(), 'mlga-install-check-'));
const sourceArg = process.env.MLGA_TEST_SOURCE || root;
const agents = ['codex', 'claude-code', 'cursor', 'opencode', 'gemini-cli'];

function run(args, cwd) {
  const result = spawnSync(process.execPath, [npmCli, 'exec', '--yes', '--package=skills@1.7.4', '--', 'skills', ...args], {
    cwd,
    env: { ...process.env, DISABLE_TELEMETRY: '1', CI: '1' },
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
}

function compareTree(expected, actual, copy) {
  assert.equal(statSync(actual).isDirectory(), true, `Missing directory: ${actual}`);
  if (copy) assert.equal(lstatSync(actual).isSymbolicLink(), false, `Expected a portable copy: ${actual}`);
  const expectedEntries = readdirSync(expected).sort();
  assert.deepEqual(readdirSync(actual).sort(), expectedEntries, `Incomplete distribution: ${actual}`);
  for (const name of expectedEntries) {
    const original = join(expected, name);
    const installed = join(actual, name);
    if (lstatSync(original).isDirectory()) compareTree(original, installed, copy);
    else assert.deepEqual(readFileSync(installed), readFileSync(original), `Changed content: ${installed}`);
  }
}

try {
  for (const { agent, copy } of agents.flatMap((agent) => [{ agent, copy: false }, { agent, copy: true }])) {
    const project = join(fixture, `${agent}-${copy ? 'copy' : 'default'}`);
    mkdirSync(project);
    const sentinel = join(project, 'existing-project-file.txt');
    writeFileSync(sentinel, 'Preserve existing project content.\n');
    const add = ['add', sourceArg, '--skill', 'mlga', '--agent', agent, ...(copy ? ['--copy'] : []), '--yes'];
    run(add, project);
    const destination = join(project, agent === 'claude-code' ? '.claude' : '.agents', 'skills', 'mlga');
    compareTree(source, destination, copy);
    run(add, project);
    compareTree(source, destination, copy);
    assert.equal(readFileSync(sentinel, 'utf8'), 'Preserve existing project content.\n');
    console.log(`PASS ${agent} (${copy ? 'copy' : 'default'}): complete installation and repeat installation`);
  }
  console.log('Five agents verified in disposable project directories.');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
