/**
 * Judge a commit message against the commit-message standard, in this process.
 * // implements XSPEC-456 R2
 *
 * `uds simulate -s commit-message` used to pipe the message into `npx commitlint`. That needs the
 * network the first time (npx downloads the tool), needs a commitlint config in the project, and
 * interpolates the message into a shell string. In a project with no commitlint config the tool refuses
 * to run at all, and the old code printed that refusal as "Simulation Failed" - the same answer for a
 * compliant message and a non-compliant one, which is the one thing a simulator must not do.
 *
 * Here the verdict comes from the standard's own rules, read from the installed standard file
 * (`.standards/commit-message.ai.yaml`):
 *
 *   - the header shape `<type>(<scope>): <subject>` from `format.template` (scope optional, as the
 *     standard's component list says);
 *   - the allowed types, from the commit-message option files installed next to the standard
 *     (`.standards/options/`, files whose `meta.parent` is `commit-message`); the Conventional Commits
 *     set when none are installed;
 *   - rule `scope-lowercase` and rule `subject-max-length`, using the `validator` pattern the standard gives.
 *
 * What it does NOT judge is returned in `notChecked`, so a pass never reads as more than it is: rules
 * with no machine-checkable pattern (imperative mood, one logical change per commit) and the language
 * option.
 *
 * @module utils/commit-message-judge
 */

import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

/** Used only when no commit-message option file is installed. The Conventional Commits type set. */
export const FALLBACK_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

/** `type(scope)!: subject` - scope and the breaking-change mark are optional. */
const HEADER = /^(?<type>[A-Za-z][A-Za-z0-9-]*)(?:\((?<scope>[^()]*)\))?(?<bang>!)?: (?<subject>\S.*)$/;

/**
 * The commit types the project's installed option files allow. An option file belongs to this standard when
 * its `meta.parent` is `commit-message`. Installed projects keep option files flat in `.standards/options/`
 * (`english.ai.yaml`); a checkout of UDS itself nests them (`.standards/options/commit-message/`). Both are read.
 * @param {string} standardsDir - `<project>/.standards`
 * @returns {{ types: string[], source: string }}
 */
export function allowedCommitTypes(standardsDir) {
  const found = new Set();
  const optionsDir = path.join(standardsDir, 'options');
  for (const dir of [optionsDir, path.join(optionsDir, 'commit-message')]) {
    let names = [];
    try {
      names = fs.readdirSync(dir).filter((n) => n.endsWith('.ai.yaml'));
    } catch {
      continue; // this layout is not present
    }
    for (const name of names) {
      try {
        const doc = yaml.load(fs.readFileSync(path.join(dir, name), 'utf-8'));
        if (doc?.meta?.parent !== 'commit-message') continue;
        for (const entry of doc.types || []) {
          if (entry && typeof entry.type === 'string') found.add(entry.type);
        }
      } catch {
        // an unreadable option file contributes nothing
      }
    }
  }
  if (found.size === 0) return { types: FALLBACK_TYPES, source: 'the Conventional Commits set, because no commit-message option file is installed' };
  return { types: [...found], source: '.standards/options' };
}

/** The `validator` pattern of a rule in the standard, as a RegExp, or null when there is none. */
function ruleValidator(standardConfig, ruleId) {
  const rule = (standardConfig?.standard?.rules || []).find((r) => r && r.id === ruleId);
  if (!rule || typeof rule.validator !== 'string') return null;
  try {
    return new RegExp(rule.validator);
  } catch {
    return null;
  }
}

/**
 * @param {Object} standardConfig - the parsed commit-message standard
 * @param {string} input - the commit message (only the first line is the header)
 * @param {{ standardsDir: string }} context
 * @returns {{ verdict: 'pass' | 'fail', findings: string[], checked: string[], notChecked: string[] }}
 */
export function judgeCommitMessage(standardConfig, input, { standardsDir }) {
  const findings = [];
  const checked = [];
  const notChecked = [];

  const header = String(input).replace(/\r\n/g, '\n').split('\n')[0];
  const match = HEADER.exec(header);

  checked.push('header format <type>(<scope>): <subject>');
  if (!match) {
    findings.push('The first line is not in the form <type>(<scope>): <subject> (scope is optional).');
  } else {
    const { type, scope, subject } = match.groups;
    const { types, source } = allowedCommitTypes(standardsDir);

    checked.push(`type is one of: ${types.join(', ')} (from ${source})`);
    if (!types.includes(type)) {
      findings.push(`Type "${type}" is not one of: ${types.join(', ')}.`);
    }

    if (scope !== undefined) {
      const scopeRule = ruleValidator(standardConfig, 'scope-lowercase');
      if (scopeRule) {
        checked.push('rule scope-lowercase');
        if (scope === '' || !scopeRule.test(scope)) {
          findings.push(`Scope "${scope}" breaks rule scope-lowercase (use lowercase letters, digits and dashes, starting with a letter).`);
        }
      } else {
        notChecked.push('rule scope-lowercase (this copy of the standard gives no pattern for it)');
      }
    }

    if (subject.trim() === '') findings.push('The subject is empty.');
  }

  const lengthRule = ruleValidator(standardConfig, 'subject-max-length');
  if (lengthRule) {
    checked.push('rule subject-max-length');
    if (!lengthRule.test(header)) {
      findings.push(`The subject line is ${header.length} characters, which breaks rule subject-max-length.`);
    }
  } else {
    notChecked.push('rule subject-max-length (this copy of the standard gives no pattern for it)');
  }

  notChecked.push('rule imperative-mood (the standard gives no machine-checkable pattern)');
  notChecked.push('rule no-mixed-changes and the commit language option');

  return { verdict: findings.length === 0 ? 'pass' : 'fail', findings, checked, notChecked };
}
