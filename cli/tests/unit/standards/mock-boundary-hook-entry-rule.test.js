// The blocking-hook rule in core/mock-boundary.md (H1-H3 and the per-host block-signal table),
// read back from the files an adopter actually receives: the standard, its .ai.yaml, and the
// cross-reference in turn-completion-integrity. Nothing here is a mock; it reads the real files
// and the real CI gate (scripts/check-hook-entry-tests.mjs), so a wording change in one place
// that leaves the others saying something else turns this red.
//
// What it guards (each case names the way it fails):
//   - the rule and the table exist in BOTH the human text and the .ai.yaml, with the same version
//     (mock-boundary.md read 1.1.0 while its .ai.yaml read 1.2.0 for the same content);
//   - every row of the table carries a source, or says "not found" (no unsourced cell);
//   - the Claude Code PreToolUse row says exit 2 and says exit 1 does not block, and that is the
//     contract the CI gate holds UDS's own hooks to (EVENT_CONTRACT.PreToolUse === 'exit2');
//   - the Stop-type contracts stay in ONE place: turn-completion-integrity does not repeat the
//     PreToolUse table, mock-boundary does not repeat the Stop table, and each points at the other.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';
import { EVENT_CONTRACT } from '../../../../scripts/check-hook-entry-tests.mjs';

const ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const read = (rel) => readFileSync(join(ROOT, ...rel.split('/')), 'utf8');

const MOCK_MD = read('core/mock-boundary.md');
const TCI_MD = read('core/turn-completion-integrity.md');
const MOCK_YAML = load(read('ai/standards/mock-boundary.ai.yaml'));
const TCI_YAML = load(read('ai/standards/turn-completion-integrity.ai.yaml'));

const mdVersion = (md) => /^\*\*Version\*\*: (\S+)/m.exec(md)?.[1];

/** Rows of the table under "What each host reads as", as arrays of trimmed cells. */
function hostTableRows() {
  const start = MOCK_MD.indexOf('### What each host reads as');
  expect(start, 'the host table heading is in mock-boundary.md').toBeGreaterThan(-1);
  const after = MOCK_MD.slice(start);
  const end = after.indexOf('\n### ', 5);
  const lines = after.slice(0, end === -1 ? undefined : end).split('\n').filter((l) => l.startsWith('|'));
  // header, separator, then data rows; split on unescaped pipes that are not inside backticks
  return lines.slice(2).map((l) => l.replace(/^\||\|$/g, '').split(/ \| /).map((c) => c.trim()));
}

describe('blocking-hook rule in mock-boundary', () => {
  it('has the same version in the standard and in its .ai.yaml', () => {
    expect(mdVersion(MOCK_MD)).toBe(String(MOCK_YAML.meta.version));
  });

  it('states H1 as MUST with its three parts, in the text and in the .ai.yaml', () => {
    expect(MOCK_MD).toMatch(/\*\*H1 \(MUST\)\.\*\*/);
    expect(MOCK_MD).toMatch(/Runs the hook as a separate process/);
    expect(MOCK_MD).toMatch(/Sends the host's own payload on stdin/);
    expect(MOCK_MD).toMatch(/Asserts the signal the host reads/);
    const h1 = MOCK_YAML.blocking_hooks.rules.h1_host_entry_test;
    expect(h1.level).toBe('MUST');
    expect(h1.does_not_count.join(' ')).toMatch(/imports and calls an internal function/);
    expect(h1.does_not_count.join(' ')).toMatch(/non-zero/);
  });

  it('keeps the counter-example (0 of 26) and the rm -fr / miss in both files', () => {
    for (const text of [MOCK_MD, JSON.stringify(MOCK_YAML.blocking_hooks.counter_example)]) {
      expect(text).toMatch(/0 of 26|blocked 0|host blocked 0/);
      expect(text).toContain('rm -fr /');
    }
  });

  it('gives every row of the host table a source, and "not found" where the host is silent', () => {
    const rows = hostTableRows();
    expect(rows.length).toBeGreaterThanOrEqual(9);
    for (const cells of rows) {
      expect(cells, `row has host | event | blocks | does not block | source: ${cells[0]}`).toHaveLength(5);
      const [host, , blocks, , source] = cells;
      const unsurveyed = /^Cursor/.test(host);
      if (unsurveyed) expect(blocks).toMatch(/not found/);
      else expect(source, `${host} row needs a source`).toMatch(/[a-z]+\.[a-z]+\/|same page|same$/i);
    }
    for (const entry of MOCK_YAML.blocking_hooks.host_block_signals) {
      expect(entry.source, `${entry.host}/${entry.event}`).toBeTruthy();
    }
  });

  it('says Claude Code blocks PreToolUse on exit 2 and that exit 1 does not, the contract the CI gate enforces', () => {
    const claude = MOCK_YAML.blocking_hooks.host_block_signals.find((e) => e.host === 'claude-code' && e.event === 'PreToolUse');
    expect(claude.blocks).toMatch(/^exit 2/);
    expect(claude.does_not_block).toMatch(/including 1/);
    expect(EVENT_CONTRACT.PreToolUse).toBe('exit2');
    expect(EVENT_CONTRACT.UserPromptSubmit).toBe('exit2');
  });

  it('does not assume Claude Code\'s exit 2 for Antigravity, whose official page is silent on exit codes', () => {
    const agy = MOCK_YAML.blocking_hooks.host_block_signals.find((e) => e.host === 'antigravity-cli');
    expect(agy.does_not_block).toMatch(/not found/);
    expect(agy.does_not_block).toMatch(/do not assume Claude Code's exit 2/);
    expect(agy.blocks).toContain('toolCall');
  });
});

describe('the block signals are written in one place', () => {
  it('keeps the PreToolUse table out of turn-completion-integrity and points to mock-boundary', () => {
    expect(TCI_MD).not.toContain('permissionDecision');
    expect(TCI_MD).toContain('(mock-boundary.md)');
    expect(TCI_YAML.meta.related).toContain('mock-boundary');
  });

  it('keeps the Stop table out of mock-boundary and points to turn-completion-integrity', () => {
    expect(MOCK_MD).not.toContain('.codex/hooks.json');
    expect(MOCK_MD).not.toContain('.agents/hooks.json');
    expect(MOCK_MD).toContain('(turn-completion-integrity.md)');
    expect(MOCK_YAML.meta.related).toContain('turn-completion-integrity');
  });

  it('keeps turn-completion-integrity at the same version in the text and in the .ai.yaml', () => {
    expect(mdVersion(TCI_MD)).toBe(String(TCI_YAML.meta.version));
  });
});

// ---------------------------------------------------------------------------------------------
// Cell by cell. The host table is a set of claims about other people's software. A cell that
// says "not found" must keep saying it (and must not grow an exit-code claim nobody read in the
// host's docs); a cell that was found must keep its key fact. The same expectations are applied
// to the table in core/mock-boundary.md AND to host_block_signals in the .ai.yaml, so editing one
// copy alone turns this red. The locale copies are held to the "not found" cells by position.
// ---------------------------------------------------------------------------------------------

const plain = (s) => String(s).replace(/\*\*/g, '').replace(/`/g, '');

/** The core table as { host, event, blocks, doesNot, source } with markdown emphasis removed. */
const MD_ROWS = hostTableRows().map(([host, event, blocks, doesNot, source]) => ({
  host: plain(host), event: plain(event), blocks: plain(blocks), doesNot: plain(doesNot), source: plain(source),
}));
const HOST_LABEL = {
  'claude-code': 'Claude Code', codex: 'Codex', 'gemini-cli': 'Gemini CLI',
  'antigravity-cli': 'Antigravity CLI', 'cursor-and-others': 'Cursor',
};
const YAML_ROWS = MOCK_YAML.blocking_hooks.host_block_signals.map((e) => ({
  host: HOST_LABEL[e.host], event: String(e.event), blocks: plain(e.blocks ?? ''), doesNot: plain(e.does_not_block ?? ''), source: plain(e.source ?? ''),
}));

const find = (rows, host, event) => rows.find((r) => r.host.startsWith(host) && r.event.startsWith(event));

// Clauses that legitimately mention an exit code inside a "not found" cell: they say what NOT to assume.
const ALLOWED_EXIT_MENTIONS = [
  /do not assume Claude Code's exit 2( applies)?/i,
  /a third-party [^.]*?not official[^.]*/i,
];
const withoutAllowedMentions = (s) => ALLOWED_EXIT_MENTIONS.reduce((t, re) => t.replace(re, ''), s);
const EXIT_CLAIM = /exit\s*(?:code\s*)?\d|exit\s+\d|non-?zero|any other code/i;

/** [host, event, field, phrase that must stay, kind of claim that must not appear around it] */
const NOT_FOUND_CELLS = [
  ['Antigravity CLI', 'PreToolUse', 'doesNot', 'exit-code semantics: not found'],
  ['Codex', 'PreToolUse', 'doesNot', 'other non-zero exit codes: not found'],
  ['Codex', 'UserPromptSubmit', 'doesNot', 'other non-zero exit codes: not found'],
  ['Codex', 'PermissionRequest', 'doesNot', 'exit 2 for this event: not found'],
];

/** [host, event, field, facts that must stay in that cell] */
const FOUND_CELLS = [
  ['Claude Code', 'PreToolUse', 'blocks', ['exit 2', '"permissionDecision":"deny"']],
  ['Claude Code', 'PreToolUse', 'doesNot', ['including 1', 'non-blocking', 'onFailure: "block"']],
  ['Claude Code', 'PreToolUse', 'source', ['code.claude.com/docs/en/hooks']],
  ['Claude Code', 'UserPromptSubmit', 'blocks', ['exit 2', '"decision":"block"']],
  ['Claude Code', 'PostToolUse', 'blocks', ['cannot block', 'already ran']],
  ['Codex', 'PreToolUse', 'blocks', ['exit 2', '"permissionDecision":"deny"']],
  ['Codex', 'PreToolUse', 'doesNot', ['is ignored']],
  ['Codex', 'PreToolUse', 'source', ['developers.openai.com/codex/hooks']],
  ['Codex', 'UserPromptSubmit', 'blocks', ['exit 2', '"decision":"block"']],
  ['Codex', 'PermissionRequest', 'blocks', ['"behavior":"deny"']],
  ['Gemini CLI', 'BeforeTool', 'blocks', ['exit 2', '"decision":"deny"']],
  ['Gemini CLI', 'BeforeTool', 'doesNot', ['warning']],
  ['Gemini CLI', 'BeforeTool', 'source', ['geminicli.com/docs/hooks/reference']],
  ['Gemini CLI', 'BeforeAgent', 'blocks', ['exit 2', 'aborts the turn']],
  ['Antigravity CLI', 'PreToolUse', 'blocks', ['"decision":"deny"', 'toolCall.name', 'toolCall.args']],
  ['Antigravity CLI', 'PreToolUse', 'doesNot', ["do not assume claude code's exit 2", 'not official']],
  ['Antigravity CLI', 'PreToolUse', 'source', ['antigravity.google/docs/hooks']],
];

describe.each([
  ['core/mock-boundary.md host table', MD_ROWS],
  ['mock-boundary.ai.yaml host_block_signals', YAML_ROWS],
])('%s, cell by cell', (_where, rows) => {
  it.each(NOT_FOUND_CELLS)('%s %s keeps "not found" in %s ("%s") and claims no exit code beside it', (host, event, field, phrase) => {
    const row = find(rows, host, event);
    expect(row, `${host} / ${event} row exists`).toBeDefined();
    const cell = row[field];
    expect(cell).toContain(phrase);
    const rest = withoutAllowedMentions(cell.replace(phrase, ''));
    expect(rest, 'an exit-code claim next to a "not found" cell').not.toMatch(EXIT_CLAIM);
  });

  it('keeps the unsurveyed hosts as "not found" with no signal claimed', () => {
    const row = find(rows, 'Cursor', 'any');
    expect(row).toBeDefined();
    expect(row.blocks).toMatch(/not found/);
    expect(row.doesNot || 'not found').toMatch(/not found/);
    expect(`${row.blocks} ${row.doesNot}`).not.toMatch(/exit\s*\d|decision|deny|block"/i);
  });

  it.each(FOUND_CELLS)('%s %s keeps its key facts in %s', (host, event, field, facts) => {
    const row = find(rows, host, event);
    expect(row, `${host} / ${event} row exists`).toBeDefined();
    for (const fact of facts) expect(row[field].toLowerCase()).toContain(fact.toLowerCase());
  });
});

describe('the two copies of the table agree', () => {
  it('lists the same host and event rows in the same order', () => {
    const key = (r) => `${r.host.split(' ').slice(0, 2).join(' ').replace(/ and$/, '')}|${r.event}`;
    expect(YAML_ROWS.map(key)).toEqual(MD_ROWS.map(key));
  });

  it('says "not found" in the same cells', () => {
    MD_ROWS.forEach((m, i) => {
      for (const field of ['blocks', 'doesNot']) {
        expect(/not found/.test(YAML_ROWS[i][field]), `${m.host} / ${m.event} / ${field}`).toBe(/not found/.test(m[field]));
      }
    });
  });
});

describe.each([
  ['zh-TW', 'locales/zh-TW/core/mock-boundary.md'],
  ['zh-CN', 'locales/zh-CN/core/mock-boundary.md'],
])('%s translation of the host table', (_loc, rel) => {
  const lines = read(rel).split('\n');
  const head = lines.findIndex((l) => /^\| (宿主) \| /.test(l));
  expect(head, 'the host table is in the translation').toBeGreaterThan(-1);
  const rows = [];
  for (let i = head + 2; i < lines.length && lines[i].startsWith('|'); i += 1) {
    rows.push(lines[i].replace(/^\||\|$/g, '').split(/ \| /).map((c) => c.trim()));
  }

  it('has the same number of rows as the English table', () => {
    expect(rows).toHaveLength(MD_ROWS.length);
  });

  it('says 未查到 exactly where the English table says "not found", and nowhere else', () => {
    MD_ROWS.forEach((m, i) => {
      const [, , blocks, doesNot] = rows[i];
      expect(/未查到/.test(blocks), `${m.host} / ${m.event} / blocks`).toBe(/not found/.test(m.blocks));
      expect(/未查到/.test(doesNot), `${m.host} / ${m.event} / does not block`).toBe(/not found/.test(m.doesNot));
    });
  });
});
