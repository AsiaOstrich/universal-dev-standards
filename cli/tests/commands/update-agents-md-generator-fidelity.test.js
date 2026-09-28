/**
 * Behavioural regression tests for the AGENTS.md generator-ownership bug,
 * found while fixing the CLAUDE.md content-language regression on the same
 * adopter report (asiaostrich-telemetry-server, EngramGraph, 6.12.0 -> 6.13.0).
 *
 * The bug had two parts, both in the reconciler (`--apply`), not in a plain
 * `uds update`:
 *
 * 1. `desired-state-calculator.js`'s `calculateIntegrations` resolved any
 *    `manifest.integrations` entry named 'AGENTS.md' to the 'opencode' tool
 *    via `resolveToolKey`, regardless of whether opencode (or codex, its
 *    alias) was actually a selected AI tool. `uds init` always pushes
 *    'AGENTS.md' into `manifest.integrations` once `generateAgentsMd` writes
 *    one (see init.js's `generateUniversalAgentsMd` call site) — as a bare
 *    "this file is UDS-managed" marker, not as a record of a tool choice.
 *    Confirmed reproducible on a project with NO codex/opencode selected: a
 *    fresh `uds init` followed immediately by `uds update --apply` — zero
 *    manifest edits, zero version change, nothing to reconcile — silently
 *    replaced AGENTS.md's flat "Installed Standards" summary with the
 *    per-tool "Standards Reference" block. This is confirmed by the
 *    generator's own docblock (integration-generator.js, ~line 2452,
 *    commit 00c84164): "selecting codex or opencode turns the universal
 *    AGENTS.md summary OFF" — the choice was always meant to hinge on tool
 *    selection, not on a filename collision.
 *
 * 2. Separately: `generateAgentsMdSummary`'s "this file is an index, not the
 *    standards" reminder (added 2026-08-18, XSPEC-357 R7) lives in the
 *    HEADER, outside the UDS marker block. `writeAgentsMdSummary`'s
 *    marker-based update for an EXISTING file only ever replaces the
 *    content BETWEEN the markers, so that reminder never reaches a project
 *    whose AGENTS.md predates 2026-08-18 — measured 0/2 on two real
 *    adopters, at both the file level and the block level (the block never
 *    had its own copy of the reminder at all, regardless of file age).
 *
 * These tests drive the real `initCommand`/`updateCommand` against a real
 * temp directory and the real generators — no mocking of the generation
 * pipeline. Each was confirmed red against the code before this fix
 * (documented per-test below) and green after.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  checkbox: vi.fn(),
  confirm: vi.fn(),
  input: vi.fn(),
  Separator: class Separator { constructor(t) { this.text = t; } }
}));

import { initCommand } from '../../src/commands/init.js';
import { updateCommand } from '../../src/commands/update.js';
import { extractMarkedContent } from '../../src/utils/integration-generator.js';

function readManifestFile(dir) {
  return JSON.parse(readFileSync(join(dir, '.standards/manifest.json'), 'utf8'));
}

function agentsMdBlock(dir) {
  const content = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
  return extractMarkedContent(content, 'markdown').content || '';
}

/** Force the "real version-bump" path used elsewhere in this suite
 * (update-language-fidelity.test.js): `updateCommand`'s plain flow returns
 * early, before touching any integration file, whenever
 * `manifest.upstream.version >= registry version` — a same-version `update`
 * is a no-op by design, which is exactly what let the underlying bugs here
 * ship unnoticed until a real version bump. */
function seedOldVersion(dir) {
  const manifestPath = join(dir, '.standards/manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.upstream.version = '0.0.1';
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

describe('reconciler and plain `uds update` agree on which AGENTS.md generator owns the file', () => {
  let testDir;
  let originalCwd;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-agents-md-fidelity-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => {});
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'agents-md-fidelity-fixture', version: '1.0.0' }, null, 2)
    );
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('(a) --apply is idempotent for AGENTS.md once settled: a second --apply changes nothing', async () => {
    // `.claude/` is the file-based marker `detectAITools` uses for
    // claude-code — non-interactive `init -y` has no --ai-tool flag, so this
    // is the real, deterministic way to make it select claude-code without
    // relying on this test's own environment.
    mkdirSync(join(testDir, '.claude'), { recursive: true });

    await initCommand({ yes: true, agentsMd: true, format: 'ai' });

    const manifest = readManifestFile(testDir);
    // Sanity: confirms this test actually landed in the scenario it claims
    // to (aiTools genuinely excludes codex/opencode), not silently on some
    // other shape that would make the assertion below vacuous.
    expect(manifest.aiTools).toEqual(['claude-code']);
    expect(manifest.integrations).toContain('AGENTS.md');

    // BEFORE THE FIX: the very first `--apply` alone — no manifest edits, no
    // version bump, nothing to reconcile — replaced `init`'s output with a
    // completely different, per-tool-shaped document (opencode's "Standards
    // Reference" format), because `calculateIntegrations` resolved the bare
    // 'AGENTS.md' tracking marker to opencode regardless of `manifest.aiTools`.
    //
    // The first `--apply` here is deliberately NOT the assertion point: it
    // legitimately changes AGENTS.md's rendered content even after the fix,
    // because `--apply` also normalizes `manifest.standards` from source
    // paths to sorted registry IDs in the SAME run (documented elsewhere as
    // "`--apply` ... normalises any standards entries stored as full
    // paths") — an orthogonal, pre-existing, one-time migration that
    // reorders the rendered bullet list. Asserting against `init`'s raw
    // output would conflate that unrelated, expected change with the actual
    // regression under test. Once settled (standards normalized, block
    // hash tracked), a SECOND `--apply` has nothing left to reconcile — this
    // is the real idempotency claim, and it is what the old bug violated
    // (it kept re-resolving 'AGENTS.md' to opencode on every single run,
    // settled or not).
    await updateCommand({ apply: true, yes: true, offline: true });
    const settled = readFileSync(join(testDir, 'AGENTS.md'), 'utf8');

    // The actual "wrong generator" regression: confirms `--apply` used the
    // universal summary, not opencode's per-tool template, for a project
    // that never selected codex/opencode. Both templates now carry the same
    // disclosure wording (see the fix to generateAgentsMdSummary above), so
    // "the reminder is present" alone no longer distinguishes them — this
    // phrase is unique to generateAgentsMdSummary's own rendering of the
    // standards list.
    expect(settled).toContain('All standards are in `.standards/`. Installed standards:');
    expect(settled).not.toMatch(/Standards (Reference|Compliance Instructions)/);

    const consoleLogSpy = vi.spyOn(console, 'log');
    consoleLogSpy.mockClear();
    await updateCommand({ apply: true, yes: true, offline: true });

    const after = readFileSync(join(testDir, 'AGENTS.md'), 'utf8');
    expect(after).toBe(settled);

    const printed = consoleLogSpy.mock.calls.map((args) => args.join(' ')).join('\n');
    expect(printed).toMatch(/Everything is up to date\.|Unchanged: \d/);
    expect(printed).not.toMatch(/Migrate Block: [1-9]/);
  }, 30000);

  it('(b) a plain `uds update -y` after that same init carries the index reminder inside the block', async () => {
    mkdirSync(join(testDir, '.claude'), { recursive: true });
    await initCommand({ yes: true, agentsMd: true, format: 'ai' });
    expect(readManifestFile(testDir).aiTools).toEqual(['claude-code']);

    seedOldVersion(testDir);
    await updateCommand({ yes: true, offline: true });

    const block = agentsMdBlock(testDir);
    // BEFORE THE FIX (part 2): a brand new file DOES get the reminder in its
    // header (added 2026-08-18), but the block itself never had its own
    // copy — this assertion is specifically about the block, independent of
    // the header.
    expect(block).toContain('This block is an index, not the standards.');
  }, 30000);

  it('(c) an existing AGENTS.md whose block predates the reminder gets one after a real update', async () => {
    // Shape measured on two real adopters: aiTools has no codex/opencode,
    // AGENTS.md is registered, and the file predates 2026-08-18's fix — so
    // its block (and, realistically, its header) carry no reminder at all.
    mkdirSync(join(testDir, '.standards'), { recursive: true });
    const manifest = {
      version: '3.4.0',
      upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '0.0.1', installed: '2026-01-01' },
      format: 'ai',
      contentMode: 'index',
      standards: ['commit-message'],
      extensions: [],
      integrations: ['AGENTS.md'],
      aiTools: [],
      generateAgentsMd: true,
      options: { display_language: 'en', output_language: 'english', workflow: 'github-flow', merge_strategy: 'squash' }
    };
    writeFileSync(join(testDir, '.standards/manifest.json'), JSON.stringify(manifest, null, 2));
    writeFileSync(join(testDir, 'AGENTS.md'), [
      '# AGENTS.md',
      '',
      '> Auto-generated by [Universal Dev Standards (UDS)](https://github.com/AsiaOstrich/universal-dev-standards).',
      '> Full standards available in the `.standards/` directory.',
      '',
      '## Build & Test',
      '',
      '<!-- UDS:STANDARDS:START -->',
      '<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use \'npx uds init\' or \'npx uds update\' to modify. -->',
      '## Installed Standards',
      '',
      'All standards are in `.standards/`. Installed standards:',
      '',
      '- `.standards/commit-message.ai.yaml` — commit-message',
      '<!-- UDS:STANDARDS:END -->',
      ''
    ].join('\n'));

    const before = agentsMdBlock(testDir);
    expect(before).not.toContain('index');

    await updateCommand({ yes: true, offline: true });

    const after = agentsMdBlock(testDir);
    expect(after).toContain('This block is an index, not the standards.');
  }, 30000);

  it('(d) a project that genuinely selected codex/opencode still gets the per-tool format (no regression)', async () => {
    // `detectAITools` reads codex/opencode from whether AGENTS.md ALREADY
    // exists — the real, deterministic lever for this detection path, same
    // idea as `.claude/` above for claude-code.
    writeFileSync(join(testDir, 'AGENTS.md'), '# placeholder\n');

    await initCommand({ yes: true, agentsMd: true, format: 'ai' });

    const manifest = readManifestFile(testDir);
    expect(manifest.aiTools.some((t) => t === 'codex' || t === 'opencode')).toBe(true);

    // The distinguishing signal is the universal summary's own unique
    // phrase, not a specific heading: the per-tool generator's contentMode
    // (minimal vs index, decided by resolveContentModeForTool per the tool's
    // tier) can land on either "## Standards Reference" (minimal) or
    // "## Installed Standards Index" + "## Standards Compliance
    // Instructions" (index) — and "## Installed Standards Index" contains
    // "## Installed Standards" as a substring, which would make a naive
    // `.not.toContain('## Installed Standards')` false-positive against a
    // legitimate per-tool index-mode block. Only `generateAgentsMdSummary`
    // ever writes this exact sentence.
    const SUMMARY_SIGNATURE = 'All standards are in `.standards/`. Installed standards:';

    const initBlock = agentsMdBlock(testDir);
    // Proves this scenario actually landed on the per-tool generator, not
    // the universal summary, before update even runs once.
    expect(initBlock).not.toContain(SUMMARY_SIGNATURE);
    expect(initBlock).toMatch(/Standards (Reference|Compliance Instructions)/);

    seedOldVersion(testDir);
    await updateCommand({ yes: true, offline: true });
    const afterPlainUpdate = agentsMdBlock(testDir);
    expect(afterPlainUpdate).not.toContain(SUMMARY_SIGNATURE);
    expect(afterPlainUpdate).toMatch(/Standards (Reference|Compliance Instructions)/);

    await updateCommand({ apply: true, yes: true, offline: true });
    const afterApply = agentsMdBlock(testDir);
    expect(afterApply).not.toContain(SUMMARY_SIGNATURE);
    expect(afterApply).toMatch(/Standards (Reference|Compliance Instructions)/);
  }, 30000);
});
