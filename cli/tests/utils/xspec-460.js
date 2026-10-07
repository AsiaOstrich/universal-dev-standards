/**
 * Shared pieces for the XSPEC-460 end-to-end tests (a release condition that names another project).
 *
 * `makeProject(parent, name, { files, tags })` builds a real git repository holding the given files, with one
 * annotated or lightweight tag per name. The repositories live in a throwaway directory next to the carrier, as a
 * second project on the same machine would; the test then points `uds open-work waiting --root NAME=DIR` at them.
 *
 * Git is run with the variables `git rev-parse --local-env-vars` names removed: when the suite runs from inside a
 * git hook (UDS's own pre-commit), GIT_DIR and GIT_INDEX_FILE point at the UDS repository, and a nested
 * `git init` or `git commit` would write into it.
 */

import { spawnSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export function cleanGitEnv() {
  const env = { ...process.env };
  const listed = spawnSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8', env }).stdout.split('\n').filter(Boolean);
  for (const k of listed) delete env[k];
  Object.assign(env, {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
    GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.invalid',
  });
  return env;
}

export function git(cwd, args) {
  const r = spawnSync('git', ['-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', ...args], { cwd, encoding: 'utf8', env: cleanGitEnv() });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed in ${cwd}: ${r.stderr}`);
  return r.stdout;
}

/** A git repository at parent/name with `files` committed and `tags` placed on that commit. Returns its directory. */
export function makeProject(parent, name, { files = { 'README.md': '# project\n' }, tags = [] } = {}) {
  const dir = join(parent, name);
  mkdirSync(dir, { recursive: true });
  git(dir, ['init', '-q', '-b', 'main']);
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'initial']);
  for (const t of tags) git(dir, ['tag', t]);
  return dir;
}

export const WAITING_HEAD = '| item | status | draft | asked-at | waiting for | release |\n|---|---|---|---|---|---|\n';

/** One carrier row that waits for a release condition. */
export const waitsFor = (title, release, status = 'waiting') => `| ${title} | ${status} | | | | ${release} |\n`;
