/**
 * E2E: `uds check` must not tick "AGENTS.md standards synced" for a manifest that holds an entry the
 * registry cannot resolve (dev-platform #45, risk `uds-check-ghost-standard`).
 *
 * The AI-tool integration check compared the index count with the manifest's raw length and warned
 * ("Index declares 1 standards but the manifest has 2"); the AGENTS.md check compared it with the list
 * left after `.filter(Boolean)` dropped the unresolvable entry, saw 1 == 1, and printed a green tick, in
 * the same run, for the same manifest.
 *
 * Decision recorded here: the AGENTS.md check NAMES the entry and downgrades the tick; it does not change
 * the exit code. `uds update` never prunes such entries (standards removed upstream stay in a manifest), so
 * a non-zero exit would turn an adopter's CI red with no command that clears it. The exit-code assertions
 * below pin that choice on purpose.
 *
 * These tests run the real CLI (`bin/uds.js check`) against a real temp project and read back its report.
 * Isolation: throwaway HOME, and git config pointed at an empty file so nothing reaches the maintainer's
 * keychain-backed global git config.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { isolatedHome } from '../../../scripts/lib/isolated-home.mjs';
import { computeFileHash } from '../../src/utils/hasher.js';
import { stripAnsi } from '../utils/cli-runner.js';

const CLI = resolve(import.meta.dirname, '../../bin/uds.js');
const GHOST = 'ghost-standard-xyz';

const indexBlock = (n) => [
  '<!-- UDS:STANDARDS:START -->',
  '## Installed Standards Index',
  '',
  `This project has adopted **${n}** UDS standards (${n} core, 0 options), installed in \`.standards/\`.`,
  '<!-- UDS:STANDARDS:END -->',
  ''
].join('\n');

describe('E2E: uds check and a manifest entry the registry cannot resolve (#45)', () => {
  let project;
  let home;
  let emptyGitConfig;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'uds-test-45-'));
    home = isolatedHome({ prefix: 'uds-test-45-home-' });
    emptyGitConfig = join(project, '..', `uds-test-45-gitconfig-${process.pid}`);
    writeFileSync(emptyGitConfig, '');
    mkdirSync(join(project, '.standards'), { recursive: true });
    writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'fixture-45', version: '1.0.0' }));
    writeFileSync(join(project, 'AGENTS.md'), `# Agents\n\n${indexBlock(1)}`);
    writeFileSync(join(project, 'CLAUDE.md'), `# Claude\n\n${indexBlock(1)}`);
  });

  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
    rmSync(emptyGitConfig, { force: true });
    home.cleanup();
  });

  function writeManifest(standards) {
    // The one real standard is installed and hashed, so the only thing wrong with the project is the ghost.
    const file = join(project, '.standards', 'commit-message.ai.yaml');
    writeFileSync(file, 'id: commit-message\n');
    writeFileSync(join(project, '.standards', 'manifest.json'), JSON.stringify({
      version: '3.5.0',
      upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '0.0.1', installed: '2026-01-01' },
      format: 'ai',
      contentMode: 'index',
      standards,
      extensions: [],
      generateAgentsMd: true,
      aiTools: ['claude-code'],
      integrations: ['CLAUDE.md'],
      options: { display_language: 'en', output_language: 'english' },
      fileHashes: { '.standards/commit-message.ai.yaml': computeFileHash(file) }
    }, null, 2));
  }

  function check(...args) {
    const r = spawnSync(process.execPath, [CLI, 'check', '--offline', ...args], {
      cwd: project,
      encoding: 'utf8',
      timeout: 60000,
      env: {
        ...home.env,
        FORCE_COLOR: '0',
        UDS_NO_UPDATE_CHECK: '1',
        GIT_CONFIG_GLOBAL: emptyGitConfig,
        GIT_CONFIG_NOSYSTEM: '1'
      }
    });
    return { status: r.status, text: stripAnsi(`${r.stdout}\n${r.stderr}`) };
  }

  /** The AGENTS.md section of the report: from its heading to the next blank-line-separated block. */
  const agentsSection = (text) => {
    const at = text.indexOf('AGENTS.md Standards Sync');
    expect(at, `no AGENTS.md section in:\n${text}`).toBeGreaterThan(-1);
    return text.slice(at).split('\n\n')[0];
  };

  it('names the unresolvable entry in the AGENTS.md section and does not tick it as synced', () => {
    writeManifest(['commit-message', GHOST]);

    const run = check();
    const section = agentsSection(run.text);

    expect(section).toContain(GHOST);
    expect(section).not.toContain('✓');
    expect(section).toContain('⚠ AGENTS.md standards synced (1)');
    // The sibling check, same run, same manifest: the vacuous-pass guard that it really saw the ghost.
    expect(run.text).toContain('Index declares 1 standards but the manifest has 2');
  }, 90000);

  it('control: without the ghost the section ticks green and names nothing', () => {
    writeManifest(['commit-message']);

    const run = check();
    const section = agentsSection(run.text);

    expect(section).toContain('✓ AGENTS.md standards synced (1)');
    expect(section).not.toContain('match no installed standard');
    expect(section).not.toContain(GHOST);
  }, 90000);

  it('keeps the exit code: the ghost is named, not turned into a failing --ci run', () => {
    writeManifest(['commit-message']);
    const control = check('--ci');
    expect(control.status, control.text).toBe(0);

    writeManifest(['commit-message', GHOST]);
    const run = check('--ci');
    expect(agentsSection(run.text)).toContain(GHOST);
    expect(run.status, run.text).toBe(0);
  }, 90000);
});
