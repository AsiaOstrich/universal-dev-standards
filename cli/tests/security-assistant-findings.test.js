/**
 * XSPEC-432 R2 / AC-2 (DEC-104-L2): the /security skill's verification stage and the
 * deterministic check of its structured report, `uds security check-findings`.
 *
 * Every check below runs the real command (bin/uds.js in a child process) on a report
 * file, and reads the effect back from what the command prints and from its exit code.
 * The shipped skill files are read as they ship. Expected values are written by hand.
 *
 * "only confirmed findings may carry severity" is the evidence name DEC-104-L2 points at.
 * It sets up its own files, so it can be run alone with `-t`.
 */
import { it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const UDS = resolve(import.meta.dirname, '..', 'bin', 'uds.js');

function finding(over) {
  return { id: 'F-1', title: 'a finding', location: 'src/a.js:1', discovered_by: 'scan', ...over };
}
const confirmed = (over = {}) => finding({
  status: 'confirmed', severity: 'high', verified_by: 'verifier-1', evidence: 'reaches the sink', ...over
});
const unverified = (over = {}) => finding({ status: 'unverified', pending_reason: 'no verifier yet', ...over });
const refuted = (over = {}) => finding({
  status: 'refuted', verified_by: 'verifier-1', refutation_reason: 'the output is escaped', ...over
});
const report = (findings, over = {}) => ({ scope: 'src', completion: 'all_verified', findings, ...over });

/** Write `body` to a temp file and run `uds security check-findings` on it. */
function check(body) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-findings-'));
  try {
    const file = join(dir, 'report.json');
    writeFileSync(file, typeof body === 'string' ? body : JSON.stringify(body), 'utf-8');
    const r = spawnSync(process.execPath, [UDS, 'security', 'check-findings', file], { encoding: 'utf-8' });
    return { code: r.status, out: r.stdout, err: r.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The lines printed under one heading of the OK output. */
function section(out, heading) {
  const lines = out.split('\n');
  const start = lines.findIndex(l => l.startsWith(heading));
  if (start === -1) return [];
  const body = [];
  for (const l of lines.slice(start + 1)) {
    if (!l.startsWith('  ')) break;
    body.push(l.trim());
  }
  return body;
}

it('only confirmed findings may carry severity', () => {
  // an unverified finding with a severity is refused, and the finding is named
  const waiting = check(report([confirmed({ id: 'F-1' }), unverified({ id: 'F-2', severity: 'medium' })],
    { completion: 'incomplete', incomplete_reason: 'verifier budget ran out' }));
  expect(waiting.code).toBe(1);
  expect(waiting.out).toContain('SF-002 F-2:');
  expect(waiting.out).not.toContain('SF-002 F-1');

  // a refuted finding with a severity is refused the same way
  const struck = check(report([refuted({ id: 'F-3', severity: 'low' })]));
  expect(struck.code).toBe(1);
  expect(struck.out).toContain('SF-002 F-3:');

  // a confirmed finding with a severity passes, and is the only one ranked
  const ok = check(report([
    confirmed({ id: 'F-1', severity: 'medium' }),
    confirmed({ id: 'F-4', severity: 'critical' }),
    unverified({ id: 'F-2' }),
    refuted({ id: 'F-3' })
  ], { completion: 'incomplete', incomplete_reason: 'one finding has no verifier' }));
  expect(ok.code).toBe(0);
  expect(ok.out).toContain('2 confirmed, 1 unverified, 1 refuted');
  const ranked = section(ok.out, 'RANKED');
  expect(ranked).toHaveLength(2);
  expect(ranked[0]).toMatch(/^1\. \[critical\] F-4 /); // most severe first
  expect(ranked[1]).toMatch(/^2\. \[medium\] F-1 /);
  // the refuted finding is kept, with its reason, apart from the ranking
  expect(section(ok.out, 'REFUTED')[0]).toContain('F-3');
  expect(section(ok.out, 'REFUTED')[0]).toContain('the output is escaped');
  expect(section(ok.out, 'UNVERIFIED')[0]).toContain('F-2');
});

it('a confirmed finding without a severity, or with an invented one, is refused', () => {
  const none = check(report([confirmed({ severity: undefined })]));
  expect(none.code).toBe(1);
  expect(none.out).toContain('SF-003 F-1:');
  const invented = check(report([confirmed({ severity: 'urgent' })]));
  expect(invented.code).toBe(1);
  expect(invented.out).toContain('SF-003 F-1:');
});

it('the one who found a finding cannot be the one who verified it', () => {
  const r = check(report([confirmed({ discovered_by: 'scan', verified_by: 'scan' })]));
  expect(r.code).toBe(1);
  expect(r.out).toContain('SF-004 F-1:');
});

it('a refuted finding keeps its reason and carries no remediation', () => {
  const noReason = check(report([refuted({ refutation_reason: undefined })]));
  expect(noReason.code).toBe(1);
  expect(noReason.out).toContain('SF-005 F-1:');
  const advice = check(report([refuted({ remediation: 'fix it anyway' })]));
  expect(advice.code).toBe(1);
  expect(advice.out).toContain('SF-005 F-1:');
});

it('a review ends all_verified or incomplete with a reason, nothing in between', () => {
  const lying = check(report([unverified()], { completion: 'all_verified' }));
  expect(lying.code).toBe(1);
  expect(lying.out).toContain('SF-008');
  const silent = check(report([unverified()], { completion: 'incomplete' }));
  expect(silent.code).toBe(1);
  expect(silent.out).toContain('SF-008');
  const halfway = check(report([confirmed()], { completion: 'stopped' }));
  expect(halfway.code).toBe(1);
  expect(halfway.out).toContain('SF-008');
  const honest = check(report([unverified()], { completion: 'incomplete', incomplete_reason: 'no verifier was available' }));
  expect(honest.code).toBe(0);
  expect(honest.out).toContain('INCOMPLETE: no verifier was available');
});

it('a status other than the three is refused, and a misspelt field is not silently ignored', () => {
  const status = check(report([confirmed({ status: 'probably' })]));
  expect(status.code).toBe(1);
  expect(status.out).toContain('SF-001 F-1:');
  const typo = check(report([confirmed({ sevrity: 'low' })]));
  expect(typo.code).toBe(1);
  expect(typo.out).toContain('SF-007 F-1:');
});

it('a report the check cannot read is exit 2, which is not a pass', () => {
  const notJson = check('this is not json');
  expect(notJson.code).toBe(2);
  expect(notJson.err).toContain('CANNOT DECIDE');
  const notReport = check('[1, 2, 3]');
  expect(notReport.code).toBe(1); // readable, but not a report: a violation, not a pass
  expect(notReport.out).toContain('SF-000');
});

it('the shipped /security skill states the rule, names the check, and its example passes it', () => {
  const sources = [
    ['skills/security-assistant/SKILL.md', ['skills', 'security-assistant', 'SKILL.md']],
    ['zh-TW', ['locales', 'zh-TW', 'skills', 'security-assistant', 'SKILL.md']],
    ['zh-CN', ['locales', 'zh-CN', 'skills', 'security-assistant', 'SKILL.md']]
  ];
  for (const [label, parts] of sources) {
    const text = readFileSync(resolve(ROOT, ...parts), 'utf-8').replace(/\r\n/g, '\n');
    expect(text, `${label} names the severity rule`).toContain('SF-002');
    expect(text, `${label} names the check`).toContain('uds security check-findings');
    expect(text, `${label} has the Verify stage`).toMatch(/### 3\. Verify/);
    // the report example in the skill is a real, passing report
    const example = text.match(/```json\n([\s\S]*?)\n```/);
    expect(example, `${label} has a JSON report example`).toBeTruthy();
    const r = check(example[1]);
    expect(r.code, `${label} example: ${r.out}${r.err}`).toBe(0);
    expect(section(r.out, 'RANKED')).toHaveLength(1);
  }
  // the skill is allowed to run the check, and only that command
  const skill = readFileSync(resolve(ROOT, 'skills', 'security-assistant', 'SKILL.md'), 'utf-8');
  expect(skill).toMatch(/^allowed-tools: .*Bash\(uds security check-findings:\*\)/m);
  const command = readFileSync(resolve(ROOT, 'skills', 'commands', 'security.md'), 'utf-8');
  expect(command).toContain('uds security check-findings');
});
