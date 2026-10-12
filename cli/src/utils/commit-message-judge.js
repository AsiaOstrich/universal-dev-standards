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

/**
 * `type(scope)!: subject` - scope and the breaking-change mark are optional.
 * // implements XSPEC-475 R1
 * The type is any run of letters (any script) and digits, not only ASCII: the traditional-chinese option file
 * allows types like 新增 and 修正. Whether the word is an ALLOWED type is decided afterwards, from the option
 * files; the header shape only says where the type is.
 */
const HEADER = /^(?<type>\p{L}[\p{L}\p{N}-]*)(?:\((?<scope>[^()]*)\))?(?<bang>!)?: (?<subject>\S.*)$/u;

/**
 * Lowercase rules (`scope-lowercase`) are about letters that HAVE a case. A Chinese character has no
 * lowercase form, so it can neither pass nor break the rule. Each such letter is replaced with a lowercase
 * stand-in before the standard's own pattern is applied, so the pattern stays the single source of the rule.
 * // implements XSPEC-475 R1
 */
function withUncasedLettersAsLowercase(text) {
  return text.replace(/\p{L}/gu, (ch) => (ch.toLowerCase() === ch.toUpperCase() ? 'a' : ch));
}

/** Compare dotted numeric versions ("1.0.0" < "2.0.0"); a missing or non-numeric part counts as 0. */
function compareVersions(a, b) {
  const part = (v) => String(v ?? '0').split(/[.-]/).map((n) => Number.parseInt(n, 10) || 0);
  const [x, y] = [part(a), part(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

/**
 * The commit types the project's installed option files allow. An option file belongs to this standard when
 * its `meta.parent` is `commit-message`. Installed projects keep option files flat in `.standards/options/`
 * (`english.ai.yaml`); a checkout of UDS itself nests them (`.standards/options/commit-message/`). Both are read.
 * @param {string} standardsDir - `<project>/.standards`
 * @param {{ shippedRoot?: string|null }} [opts] - the folder holding the option files this CLI ships (`<root>/ai/options/commit-message/`)
 * @returns {{ types: string[], source: string, stale: Array<{id: string, installed: string, shipped: string}> }}
 */
export function allowedCommitTypes(standardsDir, { shippedRoot = null } = {}) {
  const found = new Set();
  const stale = [];
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
        // XSPEC-475 R7: an installed option file that is OLDER than the one this CLI ships is judged by the shipped one, and
        // the caller is told. After a CLI upgrade and before `uds update --apply` the installed file still has the old rules
        // (traditional-chinese 1.0.0 listed Chinese types), and judging by it gave the opposite of the current answer without a word.
        let rules = doc;
        const shippedFile = shippedRoot && doc.id ? path.join(shippedRoot, 'ai', 'options', 'commit-message', `${doc.id}.ai.yaml`) : null;
        if (shippedFile && fs.existsSync(shippedFile)) {
          const shipped = yaml.load(fs.readFileSync(shippedFile, 'utf-8'));
          if (compareVersions(doc.meta.version, shipped?.meta?.version) < 0) { // [mutation-anchor:installed-option-older]
            rules = shipped;
            stale.push({ id: doc.id, installed: String(doc.meta.version ?? 'unknown'), shipped: String(shipped.meta.version) });
          }
        }
        for (const entry of rules.types || []) {
          if (entry && typeof entry.type === 'string') found.add(entry.type);
        }
      } catch {
        // an unreadable option file contributes nothing
      }
    }
  }
  if (found.size === 0) return { types: FALLBACK_TYPES, source: 'the Conventional Commits set, because no commit-message option file is installed', stale };
  return { types: [...found], source: stale.length > 0 ? ".standards/options, with the CLI's current rules for the option file(s) listed as out of date" : '.standards/options', stale };
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
 * @returns {{ verdict: 'pass' | 'fail', findings: string[], checked: string[], notChecked: string[], notes: string[] }}
 */
export function judgeCommitMessage(standardConfig, input, { standardsDir, shippedRoot = null }) {
  const findings = [];
  const checked = [];
  const notChecked = [];
  const notes = [];

  const header = String(input).replace(/\r\n/g, '\n').split('\n')[0];
  const match = HEADER.exec(header);

  checked.push('header format <type>(<scope>): <subject>');
  if (!match) {
    findings.push('The first line is not in the form <type>(<scope>): <subject> (scope is optional).');
  } else {
    const { type, scope, subject } = match.groups;
    const { types, source, stale } = allowedCommitTypes(standardsDir, { shippedRoot });
    for (const o of stale) {
      notes.push(`The installed option file "${o.id}" is version ${o.installed}, older than the ${o.shipped} this CLI ships, so this message was judged by the CLI's current rules. Run \`uds update --apply\` to bring the installed option file up to date.`);
    }

    checked.push(`type is one of: ${types.join(', ')} (from ${source})`);
    if (!types.includes(type)) {
      findings.push(`Type "${type}" is not one of: ${types.join(', ')}.${/[^\u0020-\u007E]/.test(type)
        ? ' The type must be an English word from that list; only the subject may be Chinese (for example `feat(api): 新增部門端點`).'
        : ''}`);
    }

    if (scope !== undefined) {
      const scopeRule = ruleValidator(standardConfig, 'scope-lowercase');
      if (scopeRule) {
        checked.push('rule scope-lowercase');
        if (scope === '' || !scopeRule.test(withUncasedLettersAsLowercase(scope))) {
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

  return { verdict: findings.length === 0 ? 'pass' : 'fail', findings, checked, notChecked, notes };
}
