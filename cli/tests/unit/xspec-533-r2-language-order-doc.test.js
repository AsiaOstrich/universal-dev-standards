/**
 * The language resolution order that core/ai-instruction-standards.md (and its two translations) tell adopters
 * must be the order the CLI really uses (dev-platform XSPEC-533 R2). The order in the CLI itself is pinned by
 * tests/e2e/xspec-533-r2-*.test.js, which run the real commands; this test pins the document to the same order,
 * so the document cannot say "UDS_LOCALE, then en" again after `~/.udsrc` took a place in the chain.
 *
 * Each list item is matched by the token the CLI actually reads. The expected sequences are written out here from
 * the e2e tests' findings, not computed from the document.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const REPO = join(import.meta.dirname, '..', '..', '..');

const DOCS = {
  canonical: 'core/ai-instruction-standards.md',
  'zh-TW': 'locales/zh-TW/core/ai-instruction-standards.md',
  'zh-CN': 'locales/zh-CN/core/ai-instruction-standards.md'
};

// What each numbered item names, in the order the CLI reads it.
const INIT_YES_ORDER = ['--locale', '.uds/install.yaml', '~/.udsrc', 'UDS_LOCALE', 'en'];
const UPDATE_ORDER = ['--locale', '.uds/install.yaml', 'UDS_LOCALE', 'display_language', '~/.udsrc', 'en']; // no LANG: update does not read it
const TOKENS = ['--locale', '.uds/install.yaml', '~/.udsrc', 'UDS_LOCALE', 'display_language', 'LANG', 'Fallback'];

/** The numbered lists that follow the "uds init -y" and "uds update" lead-ins inside the order section. */
function orderLists(text) {
  const start = text.search(/Locale 解析优先顺序|Locale 解析優先順序|Locale resolution order/);
  expect(start, 'the order section is missing').toBeGreaterThan(-1);
  const lines = text.slice(start).split('\n');
  const lists = {};
  let current = null;
  for (const line of lines.slice(1)) {
    if (/^\*\*(?!Locale)/.test(line) || /^###? /.test(line)) break; // the next paragraph or heading ends the section
    const lead = line.match(/^`(uds (?:init -y|update))`/);
    if (lead) { current = lead[1]; lists[current] = []; continue; }
    const item = line.match(/^\d+\. (.*)$/);
    if (item && current) lists[current].push(item[1]);
  }
  return lists;
}

/** The first token the item names (the one the CLI reads at that step); a "Fallback" item is the default, en. */
function tokenOf(item) {
  const found = TOKENS
    .filter((tok) => item.includes(tok))
    .sort((x, y) => item.indexOf(x) - item.indexOf(y))[0];
  return found === 'Fallback' ? 'en' : found;
}

describe('the documented language resolution order is the order the CLI uses (XSPEC-533 R2)', () => {
  for (const [name, rel] of Object.entries(DOCS)) {
    it(`${name}: uds init -y lists --locale, install.yaml, ~/.udsrc, UDS_LOCALE (then LANG), en`, () => {
      const lists = orderLists(readFileSync(join(REPO, rel), 'utf-8'));
      expect(lists['uds init -y'], rel).toBeDefined();
      // Item 4 names UDS_LOCALE first, then LANG; both are one step of the chain.
      expect(lists['uds init -y'].map(tokenOf), rel).toEqual(INIT_YES_ORDER);
      expect(lists['uds init -y'][3], rel).toMatch(/UDS_LOCALE[\s\S]*LANG/);
    });

    it(`${name}: uds update lists the project's recorded language before ~/.udsrc, and no LANG`, () => {
      const lists = orderLists(readFileSync(join(REPO, rel), 'utf-8'));
      expect(lists['uds update'], rel).toBeDefined();
      expect(lists['uds update'].map(tokenOf), rel).toEqual(UPDATE_ORDER);
    });
  }
});
