/**
 * Behavioural regression test for the CLAUDE.md content-language bug found
 * while investigating a 6.12.0 -> 6.13.0 adopter report (asiaostrich-telemetry-
 * server, EngramGraph).
 *
 * The bug: plain `uds update -y` (NOT `--apply`) regenerates each configured
 * AI tool's integration block through an inline `toolConfig` built in
 * `updateCommand`'s main flow. That inline config derived `language` from
 * `output_language`/`commit_language` alone — the commit-message language —
 * ignoring `display_language`, the setting whose entire job is "what language
 * do you want to read". A project installed with `display_language: zh-tw`
 * and `output_language: bilingual` (a real, common combination — bilingual
 * commits with a Chinese-language CLAUDE.md) therefore had its "## 提交訊息語言"
 * heading silently replaced with "## Commit Message Language" the next time
 * a real `uds update -y` ran, discarding a language choice `init` had
 * recorded correctly.
 *
 * The bug was invisible on same-version runs: `updateCommand` returns early
 * when `manifest.upstream.version >= registry version`, before ever reaching
 * this code — so it only ever fired on a genuine version bump, which is why
 * it read as a new "6.13.0 regression" when the underlying derivation bug
 * had shipped in every release since 2026-03-25 (commit ad555d41).
 *
 * This test seeds a manifest one version behind the bundled registry (so the
 * update body actually executes, mirroring a real version-bump upgrade) and
 * runs the real `updateCommand` against a real temp directory and a real,
 * pre-existing CLAUDE.md — no mocking of the generator or the filesystem.
 * Verified red before the fix: reverting the `resolveIntegrationLanguage`
 * call in `commands/update.js` back to the old inline `commonLanguage`
 * derivation turns this test's first assertion red with the exact defect
 * text ("## Commit Message Language" appearing where "## 提交訊息語言" should).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Real generator, real fs — only the interactive prompt library is mocked so
// a stray prompt can't hang the test. `options.yes: true` in every call below
// should make these unreachable, but mocking removes any doubt.
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  checkbox: vi.fn(),
  confirm: vi.fn(),
  input: vi.fn(),
  Separator: class Separator { constructor(t) { this.text = t; } }
}));

import { updateCommand } from '../../src/commands/update.js';

const EXISTING_CLAUDE_MD = `# CLAUDE.md

Some project-specific content above the managed block.

<!-- UDS:STANDARDS:START -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx uds init' or 'npx uds update' to modify. -->
## 提交訊息語言
使用**雙語**格式撰寫提交訊息（英文 + 繁體中文）。
格式：\`<type>(<scope>): <English>. <中文>.\`
本文必須雙語：英文在前 → 空行 → 中文在後。禁止混合語言。
<!-- UDS:STANDARDS:END -->
`;

describe('uds update preserves the recorded content language (CLAUDE.md regression)', () => {
  let testDir;
  let originalCwd;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-lang-fidelity-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    // updateCommand calls process.exit(0) (or 1) explicitly at the end of a
    // successful run (T11 — see its own docblock). The file write this test
    // asserts on happens before that call, so a no-op here is enough; letting
    // the real process.exit through would kill the test runner itself.
    vi.spyOn(process, 'exit').mockImplementation(() => {});

    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'lang-fidelity-fixture', version: '1.0.0' }, null, 2)
    );

    mkdirSync(join(testDir, '.standards'), { recursive: true });

    // One version behind whatever the dev repo's bundled registry reports —
    // this is what makes `updateCommand` actually walk the integrations
    // block instead of hitting the "already up to date" early return.
    const manifest = {
      version: '3.4.0',
      upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '0.0.1', installed: '2026-01-01' },
      format: 'ai',
      contentMode: 'index',
      standards: ['commit-message', 'ai/options/commit-message/bilingual.ai.yaml'],
      extensions: [],
      integrations: ['CLAUDE.md'],
      aiTools: ['claude-code'],
      generateAgentsMd: false,
      options: {
        display_language: 'zh-tw',
        output_language: 'bilingual',
        workflow: 'github-flow',
        merge_strategy: 'squash'
      }
    };
    writeFileSync(join(testDir, '.standards/manifest.json'), JSON.stringify(manifest, null, 2));

    writeFileSync(join(testDir, 'CLAUDE.md'), EXISTING_CLAUDE_MD);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('keeps the Traditional Chinese commit-message heading after a real version-bump update', async () => {
    await updateCommand({ yes: true, offline: true });

    const content = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');

    // The exact defect: the English heading appearing where the Chinese one
    // was. Asserted first and by itself so a failure names the actual defect
    // rather than getting lost in a generic "does not contain" message.
    expect(content).not.toContain('## Commit Message Language');
    expect(content).toContain('## 提交訊息語言');

    // Content above the managed block — real, unrelated project content —
    // must survive untouched; only the marked section is regenerated.
    expect(content).toContain('Some project-specific content above the managed block.');
  }, 30000);

  // A SEPARATE, pre-existing defect surfaced while writing the test above:
  // `updateIntegrationsOnly`'s `--plan` branch compares `cur` (the marked
  // block EXTRACTED from the existing file) against `next` (the FULL
  // document `generateIntegrationContent` returns, headers and all — never
  // extracted). For any contentMode that wraps the block in a bigger
  // document (`index`, `minimal`), this virtually never matches, so `--plan`
  // reports "would change" with a large, meaningless byte delta on every
  // run, independent of language. That bug is real (confirmed by hand:
  // `cur.trim() === String(next).trim()` at update.js ~line 2039 compares
  // block-only to whole-document) but is out of scope here — it is not part
  // of the 6.12.0 -> 6.13.0 report this fix addresses, and fixing it changes
  // the `--plan` diff semantics for every adopter, not just this one call
  // site's language derivation. Reported to the task's caller instead of
  // silently bundled into this fix. Consequently, "the plan reports this
  // project as unchanged" cannot be asserted here without also depending on
  // that unrelated bug being absent. The test below instead isolates the
  // ACTUAL language-derivation fix without touching the diff semantics: it
  // asserts that the plan's generated content is sensitive to
  // `display_language` at all. Pre-fix, this call site read only
  // `output_language`/`commit_language`, so two manifests differing ONLY in
  // `display_language` (with `output_language` held constant at
  // 'bilingual') produced byte-identical generated content and therefore an
  // identical reported delta — this test goes red on the reverted code for
  // exactly that reason.
  it('--plan --integrations-only content is sensitive to display_language, not just output_language', async () => {
    async function planDeltaBytes(displayLanguage) {
      const manifestPath = join(testDir, '.standards/manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      manifest.options.display_language = displayLanguage;
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      const consoleLogSpy = vi.spyOn(console, 'log');
      consoleLogSpy.mockClear();
      await updateCommand({ integrationsOnly: true, plan: true, yes: true, offline: true });
      const printed = consoleLogSpy.mock.calls.map((args) => args.join(' ')).join('\n');
      const match = printed.match(/CLAUDE\.md \(([+-]\d+) bytes in the UDS block\)/);
      expect(match, `expected a "would update" line for CLAUDE.md in:\n${printed}`).toBeTruthy();
      return Number(match[1]);
    }

    const zhTwDelta = await planDeltaBytes('zh-tw');
    const enDelta = await planDeltaBytes('en');

    expect(zhTwDelta).not.toBe(enDelta);
  }, 30000);
});
