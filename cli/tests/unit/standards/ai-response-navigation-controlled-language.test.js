// Evidence for DEC-125-L3 (dev-platform XSPEC-449 R5): the controlled-language rule (R12)
// in the ai-response-navigation standard.
//
// What this test reads: the files UDS actually ships as the source of truth —
// core/ai-response-navigation.md, ai/standards/ai-response-navigation.ai.yaml and the two
// locale copies. NOT cli/bundled/ (a gitignored build product of prepack).
//
// What it guards, in plain words:
//   1. Rule 12 exists.
//   2. Its "keep the writer's hedges" clause is REQUIRED (not weakened to optional).
//   3. The standard does not ship an English word dictionary, and says plainly that the
//      ASD-STE100 dictionary does not apply to non-English text.
//   4. Rule 10 points to Rule 12.
//   5. The worked Chinese example really keeps its hedges in all three valid rewrites.
//
// Cutting the wire: change `priority: required` to optional on keep-uncertainty-markers, change
// "（Required）" in the 12.1 heading, delete the Rule 12 section, delete Rule 10's pointer, or paste
// an English dictionary table into Rule 12 — each makes the main test below fail.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';

const REPO = resolve(import.meta.dirname, '../../../..');
const read = (rel) => readFileSync(resolve(REPO, rel), 'utf-8');

const CORE_MD = 'core/ai-response-navigation.md';
const AI_YAML = 'ai/standards/ai-response-navigation.ai.yaml';
const ZH_TW = 'locales/zh-TW/core/ai-response-navigation.md';
const ZH_CN = 'locales/zh-CN/core/ai-response-navigation.md';

/** Text from the heading matching `startRe` up to (not including) the next boundary. */
function section(md, startRe, endRe) {
  const start = md.search(startRe);
  if (start === -1) return null;
  const rest = md.slice(start);
  // The heading line itself must not terminate the match, so look for the boundary after it.
  const afterHeading = rest.indexOf('\n') + 1;
  const end = rest.slice(afterHeading).search(endRe);
  return end === -1 ? rest : rest.slice(0, afterHeading + end);
}

const rule12 = (md) => section(md, /^### Rule 12:/m, /^(---$|### Rule 13)/m);
const rule10 = (md) => section(md, /^### Rule 10:/m, /^### Rule 11:/m);

/** Fenced code blocks, in order. */
function fencedBlocks(text) {
  return [...text.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1].trim());
}

/**
 * Does this text carry an English word dictionary (an approved/unapproved word table, or a long
 * run of bare word-list lines)? Prose that merely NAMES the dictionary in order to disclaim it
 * must not match, so this looks at shape, not at the word "dictionary".
 */
function looksLikeEnglishDictionary(text) {
  const lines = text.split('\n');

  // (a) A table whose header names an approved/unapproved/replacement column.
  const tableHeader = lines.some(
    (l) => /^\s*\|/.test(l) && /\b(approved|unapproved|not approved|preferred word|replace(ment)? with|allowed word)\b/i.test(l)
  );

  // (b) A run of >= 6 consecutive lines that are bare word entries: "word", "word | word",
  //     "word -> word", "- word", "- word: word". Prose and the principles table never look like this.
  const entry = /^\s*(?:[-*]\s+|\|\s*)?[A-Za-z][A-Za-z-]{1,24}(?:\s*(?:\||->|→|=>|:|–|-)\s*[A-Za-z][A-Za-z -]{0,30})?\s*\|?\s*$/;
  let run = 0;
  let longest = 0;
  for (const l of lines) {
    if (entry.test(l)) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return tableHeader || longest >= 6;
}

describe('ai-response-navigation R12: controlled language', () => {
  it('the controlled-language rule keeps hedges and does not require an English dictionary', () => {
    const md = read(CORE_MD);
    const doc = yaml.load(read(AI_YAML));
    const rules = doc.rules;

    // 1. Rule 12 exists, in the human-readable standard and in the AI-optimized one.
    const r12 = rule12(md);
    expect(r12, 'core md has a "### Rule 12:" section').not.toBeNull();
    expect(r12).toMatch(/Controlled Language/);
    const hedgeRule = rules.find((r) => r.id === 'keep-uncertainty-markers');
    const styleRule = rules.find((r) => r.id === 'controlled-language');
    expect(hedgeRule, 'yaml has keep-uncertainty-markers').toBeDefined();
    expect(styleRule, 'yaml has controlled-language').toBeDefined();

    // 2. "Keep the hedges" is REQUIRED in both places; the rest is not promoted to required.
    expect(hedgeRule.priority).toBe('required');
    expect(r12).toMatch(/^#### 12\.1 [^\n]*（Required）/m);
    expect(styleRule.priority).toBe('optional');
    expect(r12).toMatch(/^#### 12\.2 [^\n]*（Optional）/m);
    // The required clause must actually say not to turn uncertainty into certainty.
    expect(hedgeRule.instruction).toMatch(/do not turn an uncertain claim into a certain one/i);
    expect(r12).toMatch(/Do not turn an uncertain claim into a certain one/);

    // 3. No English dictionary, and an explicit statement that the STE dictionary does not apply
    //    to non-English text. Detector self-proof first: it must fire on a dictionary-shaped
    //    sample, otherwise "not found" below would prove nothing.
    const dictionarySample = [
      '| Approved word | Unapproved word |',
      '|---|---|',
      '| zorp | blik |',
      '| frum | glap |',
    ].join('\n');
    const wordListSample = ['zorp', 'blik', 'frum', 'glap', 'quen', 'vosk', 'drel'].join('\n');
    expect(looksLikeEnglishDictionary(dictionarySample)).toBe(true);
    expect(looksLikeEnglishDictionary(wordListSample)).toBe(true);
    expect(looksLikeEnglishDictionary(r12)).toBe(false);
    expect(looksLikeEnglishDictionary(hedgeRule.instruction + '\n' + styleRule.instruction)).toBe(false);
    expect(r12).toMatch(/ASD-STE100/);
    expect(r12).toMatch(/approved dictionary/i);
    expect(r12).toMatch(/do not apply\s+to Chinese or to other non-English text/i);
    expect(r12).toMatch(/ships \*\*no word list of any kind\*\*/);
    expect(styleRule.instruction).toMatch(/Do NOT use ASD-STE100's approved dictionary/);

    // 4. Rule 10 points to Rule 12 (markdown and yaml).
    const r10 = rule10(md);
    expect(r10, 'core md has a "### Rule 10:" section').not.toBeNull();
    expect(r10).toMatch(/Rule 12/);
    const r10yaml = rules.find((r) => r.id === 'plain-language-is-the-subject');
    expect(r10yaml.instruction).toMatch(/keep-uncertainty-markers/);

    // 5. The worked example: original, about 80%, strict, and one invalid rewrite. The three valid
    //    ones keep every hedge; the invalid one is the counter-example and lacks them.
    const exampleText = r12.slice(r12.indexOf('#### Example'));
    const blocks = fencedBlocks(exampleText);
    expect(blocks).toHaveLength(4);
    const [original, about80, strict, invalid] = blocks;
    for (const hedge of ['可能', '推斷', '尚未']) {
      expect(original, `original keeps ${hedge}`).toContain(hedge);
      expect(about80, `about-80% keeps ${hedge}`).toContain(hedge);
      expect(strict, `strict keeps ${hedge}`).toContain(hedge);
      expect(invalid, `invalid rewrite loses ${hedge}`).not.toContain(hedge);
    }
    // The sentences really got shorter, and the semicolon went away.
    const longest = (t) => Math.max(...t.split(/[。\n；]/).map((x) => x.length));
    expect(longest(about80)).toBeLessThan(longest(original));
    expect(longest(strict)).toBeLessThan(longest(original));
    expect(original).toContain('；');
    expect(about80).not.toContain('；');
    expect(strict).not.toContain('；');
  });

  it('the shipped copies agree: version, required clause in both locales, hedges kept in each locale example', () => {
    const md = read(CORE_MD);
    const doc = yaml.load(read(AI_YAML));
    const mdVersion = md.match(/^\*\*Version\*\*: (\S+)/m)[1];
    expect(doc.meta.version).toBe(mdVersion);
    // The self-adoption copy is a byte-for-byte copy of the shipped yaml.
    expect(read('.standards/ai-response-navigation.ai.yaml')).toBe(read(AI_YAML));

    const locales = [
      { path: ZH_TW, required: /^#### 12\.1 [^\n]*（必須）/m, optional: /^#### 12\.2 [^\n]*（選用）/m, inferred: '推斷' },
      { path: ZH_CN, required: /^#### 12\.1 [^\n]*（必须）/m, optional: /^#### 12\.2 [^\n]*（可选）/m, inferred: '推断' },
    ];
    for (const loc of locales) {
      const text = read(loc.path);
      expect(text, `${loc.path} source_version`).toMatch(new RegExp(`^source_version: ${mdVersion.replace(/\./g, '\\.')}$`, 'm'));
      const sec = section(text, /^### 規則 12：|^### 规则 12：/m, /^---$/m);
      expect(sec, `${loc.path} has Rule 12`).not.toBeNull();
      expect(sec).toMatch(loc.required);
      expect(sec).toMatch(loc.optional);
      expect(sec).toMatch(/ASD-STE100/);
      const blocks = fencedBlocks(sec.slice(sec.search(/^#### (範例|示例)/m)));
      expect(blocks).toHaveLength(4);
      for (const block of blocks.slice(0, 3)) {
        for (const hedge of ['可能', loc.inferred, '尚未']) expect(block).toContain(hedge);
      }
    }
  });
});
