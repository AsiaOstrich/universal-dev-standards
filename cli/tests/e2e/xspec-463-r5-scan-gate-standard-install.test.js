/**
 * E2E: pipeline-security-gates 1.1.0 states the scanner's own three behaviours, and a project can install it
 * and read them back (dev-platform XSPEC-463 R1-R5).
 *
 * Two things are guarded, and they are different kinds of evidence:
 *
 *   1. INSTALL (a real CLI run). `uds update --apply --add-standard pipeline-security-gates` in a throwaway project
 *      (a manifest a real UDS 6.11.0 wrote; HOME and XDG_* isolated, a temporary copy of the CLI) puts
 *      `.standards/pipeline-security-gates.ai.yaml` into the project. The test reads that file back and asserts the
 *      three machine-readable fields (PSG-1 output_redaction, PSG-2 scanner_failure, PSG-3 custom_rule_samples) and
 *      version 1.1.0. Note what `--add-standard` installs: the `.ai.yaml` only. The `.md` is not copied into a
 *      project (UDS ships the `.ai.yaml` as the project's standard), so the `.md` is read in the second test.
 *
 *   2. FILE AGREEMENT (no JavaScript wire to cut). The same standard lives in the Chinese source, two translations,
 *      the `.ai.yaml`, two registries and the self-adoption copy. The second test reads each back and runs the two
 *      repository sync scripts as real processes. What it guards is the agreement of files, not a call.
 *
 * Wire that makes the first test red when cut (one line of CLI source):
 *   cli/src/commands/update.js   const request = resolveAddStandardRequest(manifest, addStandardIds);
 * What makes either test red: dropping one of PSG-1, PSG-2, PSG-3 (the field, or the text) anywhere, leaving the
 * version at 1.0.0 anywhere, a translation whose source_hash is not the hash of the current source, a self-adoption
 * copy that differs from ai/standards, a registry description that lost the scanner wording, or a sync script that
 * exits non-zero.
 *
 * The fake secret named in the standard (FAKE-SECRET-DO-NOT-USE-0000) is notation only; this test never writes one.
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { spawnSync } from 'child_process';
import * as yaml from 'js-yaml';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';
import { makeUpgradeProject } from '../utils/xspec-458.js';

const h = createHarness('xspec463-r5');
afterAll(() => h.cleanup());

const read = (rel) => readFileSync(join(REAL_REPO, rel), 'utf8');
const sh = (script, args = []) => {
  const r = spawnSync('bash', [join(REAL_REPO, 'scripts', script), ...args], { cwd: REAL_REPO, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};
// git's blob hash, first 12 characters: the established `source_hash` convention (scripts/check-translation-sync.sh)
const blob12 = (text) => {
  const buf = Buffer.from(text, 'utf8');
  return createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex').slice(0, 12);
};

it('uds update --apply --add-standard pipeline-security-gates installs the 1.1.0 file into a project, and the file read back carries the output-redaction, scanner-failure and custom-rule-sample fields (XSPEC-463 R5)', async () => {
  const dir = makeUpgradeProject(h);
  const file = join(dir, '.standards', 'pipeline-security-gates.ai.yaml');
  expect(existsSync(file), 'control: the project starts without it').toBe(false);

  const apply = await h.runCli(['update', '--apply', '--yes', '--offline', '--add-standard', 'pipeline-security-gates'], dir);
  expect(apply.code, apply.stdout + apply.stderr).toBe(0);
  expect(existsSync(file), 'the file is in the project').toBe(true);
  expect(readFileSync(file, 'utf8'), 'and is what UDS ships').toBe(read('ai/standards/pipeline-security-gates.ai.yaml'));

  const doc = yaml.load(readFileSync(file, 'utf8'));
  expect(doc.standard.meta.version).toBe('1.1.0');
  expect(doc.standard.meta.updated).toBe('2026-10-07');

  const pre = doc.gate_positions.pre_commit;
  expect(pre.never_skip, 'the existing rule is still there').toBe(true);

  // PSG-1 (MUST): the output never carries the matched value
  expect(pre.output_redaction.level).toBe('must');
  expect(pre.output_redaction.rule).toMatch(/must not contain the matched secret value/);
  expect(pre.output_redaction.surfaces).toEqual(['terminal', 'ci log', 'report file']);
  expect(pre.output_redaction.verification.join('\n'), 'the procedure first proves the gate blocked').toMatch(/first confirm the gate really blocked/);
  // only what was read in the vendor's own documentation is stated; the rest is left to the adopter
  expect(pre.output_redaction.tool_notes.gitleaks).toMatch(/read 2026-10-07/);
  expect(pre.output_redaction.tool_notes['detect-secrets']).toMatch(/adopter must confirm/);
  expect(pre.output_redaction.tool_notes.trufflehog).toMatch(/adopter must confirm/);

  // PSG-2 (MUST): a scanner that cannot run is a gate failure and blocks
  expect(pre.scanner_failure.level).toBe('must');
  expect(pre.scanner_failure.treat_as).toBe('gate_failure');
  expect(pre.scanner_failure.action).toBe('block');
  expect(pre.scanner_failure.forbidden_swallow).toEqual(['|| true', '2>/dev/null']);
  expect(pre.scanner_failure.distinguish_cause_by, 'by output, not by exit code').toBe('output');
  expect(pre.scanner_failure.covers).toEqual(['executable missing', 'config unreadable or invalid', 'timeout', 'unexpected exit']);

  // PSG-3 (SHOULD, not MUST): every self-written rule has a red and a green sample that run
  expect(pre.custom_rule_samples.level, 'a suggestion, not a requirement').toBe('should');
  expect(pre.custom_rule_samples.per_rule).toHaveLength(2);
  expect(pre.custom_rule_samples.samples_run_in_tests).toBe(true);
  expect(pre.custom_rule_samples.gap_blocks, 'a missing sample is reported, not blocked').toBe(false);

  // the three also reach the human-readable guidelines, tied to the existing "gate failure = pipeline failure" rules
  const guidelines = doc.standard.guidelines.join('\n');
  expect(guidelines).toMatch(/MUST NOT contain the matched secret value.*\(PSG-1\)/);
  expect(guidelines).toMatch(/cannot run.*is a gate failure and MUST block.*\(PSG-2\)/);
  expect(guidelines).toMatch(/SHOULD: every detection rule the team writes itself.*\(PSG-3\)/);

  // the install is recorded, so a plain --apply keeps it
  const again = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(again.code, again.stdout + again.stderr).toBe(0);
  expect(existsSync(file), 'a later plain --apply keeps it').toBe(true);
}, 120000);

it('pipeline-security-gates 1.1.0 reads the same in the Chinese source, the zh-TW and zh-CN translations, the .ai.yaml, both registries and the self-adoption copy, and both sync checks exit 0 (XSPEC-463 R5)', () => {
  const core = read('core/pipeline-security-gates.md');
  const zhTW = read('locales/zh-TW/core/pipeline-security-gates.md');
  const zhCN = read('locales/zh-CN/core/pipeline-security-gates.md');
  const ai = read('ai/standards/pipeline-security-gates.ai.yaml');

  // version: the source carries it where the sync script looks (first 20 lines), the .ai.yaml agrees
  expect(core.split('\n').slice(0, 20).join('\n')).toMatch(/^\*\*Version\*\*: 1\.1\.0$/m);
  expect(yaml.load(ai).standard.meta.version).toBe('1.1.0');

  // R1-R3 text: strength words are part of what is asserted (R1, R2 must; R3 should)
  for (const [name, text] of [['core', core], ['zh-TW', zhTW]]) {
    expect(text, `${name}: PSG-1 is MUST`).toMatch(/\*\*PSG-1\*\* \| 必須（MUST） \|[^\n]*不得包含被匹配到的機密值本身/);
    expect(text, `${name}: PSG-2 is MUST`).toMatch(/\*\*PSG-2\*\* \| 必須（MUST） \|[^\n]*無法執行[^\n]*必須阻斷/);
    expect(text, `${name}: PSG-3 is SHOULD, not MUST`).toMatch(/\*\*PSG-3\*\* \| 建議（SHOULD） \|[^\n]*紅[^\n]*綠/);
    expect(text, `${name}: PSG-2 names the swallowing forms`).toMatch(/`\|\| true`、`2>\/dev\/null`/);
    expect(text, `${name}: the check that proves the gate blocked comes first`).toMatch(/先確認閘門確實阻斷/);
    expect(text, `${name}: the fake value is marked as notation`).toMatch(/示意記法：`FAKE-SECRET-DO-NOT-USE-0000`；實際樣本須是.*不得是任何真實服務的有效憑證/);
    expect(text, `${name}: only verified tool behaviour is stated, the rest is left to the adopter`).toMatch(/detect-secrets[^\n]*採用者須自行確認/);
    expect(text, `${name}: UDS ships no scanner`).toMatch(/UDS \*\*不出貨掃描器\*\*/);
  }
  expect(zhCN).toMatch(/\*\*PSG-1\*\* \| 必须（MUST） \|[^\n]*不得包含被匹配到的密钥值本身/);
  expect(zhCN).toMatch(/\*\*PSG-2\*\* \| 必须（MUST） \|[^\n]*无法执行[^\n]*必须阻断/);
  expect(zhCN).toMatch(/\*\*PSG-3\*\* \| 建议（SHOULD） \|[^\n]*红[^\n]*绿/);
  expect(zhCN).toMatch(/先确认闸门确实阻断/);
  expect(zhCN).toMatch(/UDS \*\*不发布扫描器\*\*/);

  // both translations name this source version and the current hash of it
  const hash = blob12(core);
  for (const [name, text] of [['zh-TW', zhTW], ['zh-CN', zhCN]]) {
    expect(text, `${name}: source and translation versions`).toMatch(/source_version: 1\.1\.0\ntranslation_version: 1\.1\.0\n/);
    expect(text, `${name}: source_hash is the current hash of core/pipeline-security-gates.md`).toContain(`source_hash: ${hash}\n`);
  }

  // the self-adoption copy is the shipped file
  expect(read('.standards/pipeline-security-gates.ai.yaml'), 'self-adoption copy is byte-identical').toBe(ai);

  // both registries describe the standard the same way, and say the scanner's own behaviour is in it
  for (const rel of ['cli/standards-registry.json', 'adoption/standards-registry.json']) {
    const entry = JSON.parse(read(rel)).standards.find((s) => s.id === 'pipeline-security-gates');
    expect(entry.description, rel).toMatch(/including the scanner's own output and failure behaviour/);
  }

  // the sync checks: real processes, exit code and the line read back
  const standards = sh('check-standards-sync.sh');
  expect(standards.status, standards.out).toBe(0);
  expect(standards.out).toMatch(/All standards are consistent/);
  for (const locale of ['zh-TW', 'zh-CN']) {
    const translations = sh('check-translation-sync.sh', [locale]);
    expect(translations.status, translations.out).toBe(0);
    expect(translations.out, `${locale}: this standard is not listed as drifted or outdated`).not.toMatch(/pipeline-security-gates/);
  }
}, 180000);
