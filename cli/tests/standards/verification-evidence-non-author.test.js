/**
 * XSPEC-432 R1 / AC-1 (DEC-104-L1): verification-evidence 1.4.0 adds the "non-author
 * adjudication" rule group, and it reaches every shipped layer.
 *
 * The test reads the files that actually ship (core, ai/standards, the .standards
 * self-adoption copy, both locales) and parses the YAML with a real parser. Every
 * expected value below is written by hand from the spec; none is recomputed from the
 * file under test.
 *
 * Single test on purpose: its full name is the evidence name DEC-104-L1 points at, and it
 * sets up everything itself, so it can be run alone with `-t`.
 */
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const read = (...parts) => readFileSync(resolve(ROOT, ...parts), 'utf-8').replace(/\r\n/g, '\n');

// The eight rules of XSPEC-432 R1, in the spec's order, with the priority each must carry.
const NEW_RULES = [
  ['VE-013', 'critical'], // claim judged by a non-author
  ['VE-014', 'critical'], // three outcomes; undecidable is neither false nor pass
  ['VE-015', 'high'],     // "all confirmed" is not a pass
  ['VE-016', 'high'],     // known-false memory; re-verify when the subject changes
  ['VE-017', 'required'], // fingerprint + re-run method on the record
  ['VE-018', 'critical'], // author may not weaken their own judge
  ['VE-019', 'high'],     // calibrate the judge first
  ['VE-020', 'high']      // one success is not stability
];

it('verification-evidence requires claims to be judged by a non-author', () => {
  // ── the AI-facing standard (the file DEC-104-L1 names) ──
  const doc = load(read('ai', 'standards', 'verification-evidence.ai.yaml'));
  const ai = doc.standard;
  expect(ai.meta.version).toBe('1.4.0');

  const group = ai.non_author_adjudication;
  expect(group, 'non_author_adjudication section is missing').toBeTruthy();
  expect(group.rules.map(r => r.id)).toEqual(NEW_RULES.map(([id]) => id));
  for (const [id, priority] of NEW_RULES) {
    const rule = group.rules.find(r => r.id === id);
    expect(rule.priority, `${id} priority`).toBe(priority);
    expect(String(rule.trigger).length, `${id} trigger`).toBeGreaterThan(0);
    expect(String(rule.action).length, `${id} action`).toBeGreaterThan(0);
  }

  // exactly three outcomes, and "undecidable" may never be recorded as false / absent / passed
  expect(group.outcomes.map(o => o.name)).toEqual(['confirmed', 'refuted', 'undecidable']);
  const undecidable = group.outcomes.find(o => o.name === 'undecidable');
  expect(undecidable.never_recorded_as).toEqual(['false', 'absent', 'passed']);
  expect(undecidable.always_when.length).toBe(2); // failing query tool, failing adjudicator

  // author self-review is named as NOT being adjudication
  expect(String(group.not_adjudication)).toMatch(/自我複查/);
  // the order of adjudicators: a deterministic tool first, a fresh agent second
  expect(group.adjudicator_order).toHaveLength(2);
  expect(group.adjudicator_order[0]).toMatch(/確定性工具/);
  expect(group.adjudicator_order[1]).toMatch(/全新 agent/);

  // the evidence record gains the two fields (VE-017); optional in general, so no
  // existing record becomes invalid
  const fields = Object.fromEntries(ai.evidence_format.fields.map(f => [f.name, f]));
  for (const name of ['subject_fingerprint', 'rerun_method']) {
    expect(fields[name], `evidence field ${name}`).toBeTruthy();
    expect(fields[name].required, `${name} stays optional in the schema`).toBe(false);
  }
  // the four original required fields are untouched
  for (const name of ['command', 'exit_code', 'output', 'timestamp']) {
    expect(fields[name].required).toBe(true);
  }

  // the existing trust rules and the checklist now carry the rule too
  expect(ai.trust_rules.some(r => r.includes('VE-013'))).toBe(true);
  for (const [id] of NEW_RULES) {
    expect(doc.physical_spec.checks.some(c => c.includes(id)), `${id} in physical_spec.checks`).toBe(true);
  }

  // the earlier twelve rules were not disturbed
  const oldIds = [
    ...ai.rules, ...ai.environment_rules, ...ai.validity_rules,
    ...ai.narrow_coverage_registration.rules
  ].map(r => r.id);
  expect(oldIds).toEqual([
    'VE-001', 'VE-002', 'VE-003', 'VE-004', 'VE-005', 'VE-006',
    'VE-007', 'VE-008', 'VE-009', 'VE-010', 'VE-011', 'VE-012'
  ]);

  // ── the human-facing standard ──
  const core = read('core', 'verification-evidence.md');
  expect(core).toMatch(/^\*\*Version\*\*: 1\.4\.0$/m);
  expect(core).toMatch(/^## Non-Author Adjudication$/m);
  for (const [id] of NEW_RULES) {
    expect(core, `core table row for ${id}`).toMatch(new RegExp(`^\\| ${id} \\|`, 'm'));
  }
  for (const field of ['subject_fingerprint', 'rerun_method']) {
    expect(core).toMatch(new RegExp(`^\\| \`${field}\` \\|`, 'm'));
  }

  // the section is standard text, not an adoption layer: no vendor model identifiers
  // (XSPEC-362 R4) and no project name that is not UDS's own
  const section = core.split(/^## Non-Author Adjudication$/m)[1].split(/^## /m)[0];
  expect(section.length).toBeGreaterThan(500);
  expect(section).not.toMatch(/\b(claude|gpt|gemini|llama)-[a-z0-9.-]*\d/i);
  expect(section).not.toMatch(/vibeops|dev-platform/i);

  // ── the other layers carry the same version and the same rules ──
  // self-adoption copy is the shipped AI standard, byte for byte
  expect(read('.standards', 'verification-evidence.ai.yaml')).toBe(
    read('ai', 'standards', 'verification-evidence.ai.yaml')
  );
  for (const locale of ['zh-TW', 'zh-CN']) {
    const text = read('locales', locale, 'core', 'verification-evidence.md');
    expect(text, `${locale} source_version`).toMatch(/^source_version: 1\.4\.0$/m);
    expect(text, `${locale} status`).toMatch(/^status: current$/m);
    expect(text, `${locale} version line`).toMatch(/^\*\*版本\*\*: 1\.4\.0$/m);
    for (const [id] of NEW_RULES) {
      expect(text, `${locale} table row for ${id}`).toMatch(new RegExp(`^\\| ${id} \\|`, 'm'));
    }
  }
});
