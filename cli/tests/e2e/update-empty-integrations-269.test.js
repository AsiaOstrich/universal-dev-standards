/**
 * E2E: an empty `manifest.integrations` must not turn into "delete the UDS block" (issue #269).
 *
 * The adopter's manifest said `integrations: []`, `aiTools: ['claude-code']`, and recorded CLAUDE.md in
 * `integrationBlockHashes`. `uds update --plan` printed "Delete ... CLAUDE.md (integration no longer configured,
 * removing UDS block)" and `--apply` would have done it, while `uds check` called the same project compliant.
 *
 * These tests run the real CLI (`bin/uds.js update --plan` / `--apply`) against a real temp project and read back
 * the plan text and the file on disk. The control arm is the genuinely removed integration - nothing in the
 * manifest says it is still in use - which must still be proposed for removal, so the fix is not "never delete".
 *
 * Isolation: throwaway HOME (scripts/lib/isolated-home.mjs) and GIT_CONFIG_GLOBAL pointed at the null device,
 * so nothing here can reach the maintainer's keychain-backed git config or ~/.claude.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir, devNull } from 'node:os';
import { join, resolve } from 'node:path';
import { isolatedHome } from '../../../scripts/lib/isolated-home.mjs';
import { stripAnsi } from '../utils/cli-runner.js';

const CLI = resolve(import.meta.dirname, '../../bin/uds.js');
const DELETE_REASON = 'integration no longer configured';
const START = '<!-- UDS:STANDARDS:START -->';
const END = '<!-- UDS:STANDARDS:END -->';

const CLAUDE_MD = [
  '# Project instructions',
  '',
  'Written by a person, above the managed block.',
  '',
  START,
  '<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. -->',
  '## Commit Message Language',
  'Write commit messages in English.',
  END,
  ''
].join('\n');

function manifestFor(overrides) {
  return {
    version: '3.5.0',
    upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '0.0.1', installed: '2026-01-01' },
    format: 'ai',
    contentMode: 'index',
    standards: [],
    extensions: [],
    generateAgentsMd: false,
    options: { display_language: 'en', output_language: 'english' },
    ...overrides
  };
}

describe('E2E: uds update with manifest.integrations empty (issue #269)', () => {
  let project;
  let home;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'uds-test-269-'));
    home = isolatedHome({ prefix: 'uds-test-269-home-' });
    mkdirSync(join(project, '.standards'), { recursive: true });
    writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'fixture-269', version: '1.0.0' }));
    writeFileSync(join(project, 'CLAUDE.md'), CLAUDE_MD);
  });

  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
    home.cleanup();
  });

  function writeManifest(overrides) {
    writeFileSync(join(project, '.standards', 'manifest.json'), JSON.stringify(manifestFor(overrides), null, 2));
  }

  function uds(...args) {
    const r = spawnSync(process.execPath, [CLI, 'update', ...args, '--offline'], {
      cwd: project,
      encoding: 'utf8',
      timeout: 60000,
      env: { ...home.env, FORCE_COLOR: '0', GIT_CONFIG_GLOBAL: devNull, GIT_CONFIG_NOSYSTEM: '1' }
    });
    return { status: r.status, text: stripAnsi(`${r.stdout}\n${r.stderr}`) };
  }

  const claudeMd = () => readFileSync(join(project, 'CLAUDE.md'), 'utf8');

  it('--plan does not propose deleting the CLAUDE.md block when aiTools and the recorded block hash still name it', () => {
    writeManifest({
      integrations: [],
      aiTools: ['claude-code'],
      integrationBlockHashes: {
        'CLAUDE.md': { blockHash: 'sha256:' + 'a'.repeat(64), updatedAt: '2026-06-22T00:00:00.000Z' }
      }
    });

    const run = uds('--plan');

    // Guard against a vacuous pass: the plan ran, and it treats CLAUDE.md as a file UDS keeps managing.
    expect(run.text).toContain('Reconciliation Plan');
    expect(run.text).toMatch(/~ CLAUDE\.md \(integration content differs/);
    expect(run.text).not.toContain(DELETE_REASON);
    expect(run.text).toMatch(/Delete: 0/);
  }, 90000);

  it('--apply leaves the UDS block in CLAUDE.md', () => {
    writeManifest({
      integrations: [],
      aiTools: ['claude-code'],
      integrationBlockHashes: {
        'CLAUDE.md': { blockHash: 'sha256:' + 'a'.repeat(64), updatedAt: '2026-06-22T00:00:00.000Z' }
      }
    });

    const run = uds('--apply', '--yes');

    const after = claudeMd();
    expect(run.text).not.toContain(DELETE_REASON);
    expect(after).toContain(START);
    expect(after).toContain(END);
    expect(after).toContain('Written by a person, above the managed block.');
  }, 90000);

  it('the record alone is enough: aiTools empty but integrationBlockHashes names CLAUDE.md', () => {
    writeManifest({
      integrations: [],
      aiTools: [],
      integrationBlockHashes: {
        'CLAUDE.md': { blockHash: 'sha256:' + 'a'.repeat(64), updatedAt: '2026-06-22T00:00:00.000Z' }
      }
    });

    const run = uds('--plan');

    expect(run.text).toContain('Reconciliation Plan');
    expect(run.text).not.toContain(DELETE_REASON);
    expect(run.text).toMatch(/~ CLAUDE\.md \(integration content differs/);
  }, 90000);

  // aiTools may hold an old tool name (`copilot` is the pre-rename key of `github-copilot`): it has to go through the
  // same legacy-name table as everything else, or the derivation misses it and the file is planned for removal.
  it('an old tool name in aiTools (copilot) is understood too', () => {
    rmSync(join(project, 'CLAUDE.md')); // this project uses Copilot only; a leftover CLAUDE.md block would be a real removal
    mkdirSync(join(project, '.github'), { recursive: true });
    writeFileSync(join(project, '.github', 'copilot-instructions.md'), CLAUDE_MD);
    writeManifest({ integrations: [], aiTools: ['copilot'], integrationBlockHashes: {} });

    const run = uds('--plan');

    expect(run.text).toContain('Reconciliation Plan');
    expect(run.text).not.toContain(DELETE_REASON);
    expect(run.text).toMatch(/~ \.github\/copilot-instructions\.md \(integration content differs/);
  }, 90000);

  // Control arm: nothing in the manifest says the integration is in use, so removal is still proposed.
  it('control: integrations [], aiTools [] and no recorded block hash is still planned for removal', () => {
    writeManifest({ integrations: [], aiTools: [], integrationBlockHashes: {} });

    const run = uds('--plan');

    expect(run.text).toContain(DELETE_REASON);
    expect(run.text).toContain('CLAUDE.md');
  }, 90000);

  it('control: --apply really removes the block of a genuinely removed integration', () => {
    writeManifest({ integrations: [], aiTools: [], integrationBlockHashes: {} });

    uds('--apply', '--yes');

    // Either the block is stripped or the whole file is removed - what --apply does with the human text around
    // the block is a separate question (see the PR's "next release" notes); this arm only needs the block gone.
    expect(existsSync(join(project, 'CLAUDE.md')) ? claudeMd() : '').not.toContain(START);
  }, 90000);
});
