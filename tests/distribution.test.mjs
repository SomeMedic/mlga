import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));

function markdownFiles(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const full = join(path, entry.name);
    return entry.isDirectory() ? markdownFiles(full) : entry.name.endsWith('.md') ? [full] : [];
  });
}

test('one canonical skill is discoverable and fits Agent Skills limits', () => {
  const skills = readdirSync(join(root, 'skills'));
  assert.deepEqual(skills, ['mlga']);
  const body = read('skills/mlga/SKILL.md');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(body);
  assert.ok(match, 'Skill frontmatter is missing');
  const name = /^name: (.+)$/m.exec(match[1])?.[1];
  const description = /^description: (.+)$/m.exec(match[1])?.[1];
  assert.equal(name, 'mlga');
  assert.ok(description?.length > 0 && description.length <= 1024);
  assert.ok(body.slice(match[0].length).trim().length > 0);
});

test('every local Markdown resource ships inside the distribution', () => {
  const files = [join(root, 'README.md'), ...markdownFiles(join(root, 'skills')), ...markdownFiles(join(root, 'docs'))];
  for (const file of files) {
    const body = readFileSync(file, 'utf8');
    for (const match of body.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(?:[a-z]+:|#)/i.test(target)) continue;
      const destination = resolve(dirname(file), decodeURIComponent(target.split('#')[0]));
      const pathFromRoot = relative(root, destination);
      assert.ok(!isAbsolute(pathFromRoot) && pathFromRoot !== '..' && !pathFromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`), `Resource escapes distribution: ${target}`);
      assert.ok(existsSync(destination), `${file}: missing resource ${target}`);
    }
  }
  assert.ok(existsSync(join(root, 'docs/assets/banner.svg')));
});

test('Claude marketplace resolves to the canonical skill and matching release', () => {
  const plugin = json('.claude-plugin/plugin.json');
  const marketplace = json('.claude-plugin/marketplace.json');
  const pkg = json('package.json');
  assert.equal(marketplace.name, 'mlga');
  assert.equal(marketplace.plugins.length, 1);
  const entry = marketplace.plugins[0];
  assert.equal(plugin.name, 'mlga');
  assert.equal(entry.name, plugin.name);
  assert.equal(resolve(root, entry.source), root);
  assert.equal(entry.version, plugin.version);
  assert.equal(pkg.version, plugin.version);
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
  assert.equal(plugin.repository, 'https://github.com/SomeMedic/mlga');
  assert.ok(existsSync(join(root, entry.source, 'skills', plugin.name, 'SKILL.md')));
});

test('Codex metadata invokes the shipped skill and fits display limits', () => {
  const metadata = read('skills/mlga/agents/openai.yaml');
  const short = /^  short_description: "(.+)"$/m.exec(metadata)?.[1];
  const prompt = /^  default_prompt: "(.+)"$/m.exec(metadata)?.[1];
  assert.ok(short && short.length >= 25 && short.length <= 64);
  assert.ok(prompt?.includes('$mlga'));
});
