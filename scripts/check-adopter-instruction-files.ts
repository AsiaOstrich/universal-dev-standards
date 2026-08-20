#!/usr/bin/env tsx
/**
 * Adopter Instruction File Checker — XSPEC-357 R7 ②
 * 採用者指令檔檢查器
 *
 * ── The gap this closes ────────────────────────────────────────────────────
 * `scripts/check-ai-agent-sync.sh` maps every agent to a file inside THIS
 * repository — `codex` to `integrations/codex/AGENTS.md`, and so on — and
 * checks that the repo's own template mentions the required rules. Adopters
 * never receive those templates. They receive whatever `uds init` writes.
 *
 * Measured 2026-08-18 (XSPEC-357 R7): the generated `AGENTS.md` was 5,667
 * bytes with 69 filename references and zero rule statements, while the
 * template being checked was a different 6,457-byte document. In the spec's
 * words: "a rule can be present for the checker and absent for every user,
 * with nothing going red."
 *
 * This checker runs `uds init` and looks at what comes out.
 *
 * ── What it deliberately does NOT assert ───────────────────────────────────
 * It does not assert that rule bodies are present, in any mode. They are not,
 * and they cannot be: `.standards/` holds 143 `.ai.yaml` files, ~970 KB,
 * roughly 248k tokens. Index mode shipping filenames instead of bodies is not
 * an oversight — at that size it is the only available shape.
 *
 * So the assertion is the honest one: the block must SAY it is an index and
 * instruct the reader to open the files, rather than presenting a list of
 * paths under a heading like "Standards Compliance Instructions" and letting
 * an agent conclude it has read the standards. Rule-body coverage is still
 * measured and printed on every run — with the arithmetic — so that "we do not
 * check for rule text" stays a stated position and never becomes a silent hole.
 *
 * ── Denominator, walked rather than typed ──────────────────────────────────
 * The files under test come from `manifest.integrations`, written by the
 * installer itself, not from a list in this file. Tools known to
 * SUPPORTED_AI_TOOLS but not installed are named and counted, so the gap
 * between "tools that exist" and "tools exercised" is visible rather than
 * implied by a passing run.
 *
 * ── Proving it is not vacuous ──────────────────────────────────────────────
 * `--self-test` generates a real project, confirms it assesses clean, then
 * mutates the generated artifacts on disk (strips the disclosure; strips the
 * marker block; empties a file) and confirms each mutation produces a finding
 * that names the file and the assertion. A checker that has never gone red is
 * indistinguishable from one that cannot.
 *
 * ── Known fidelity limits (stated, not hidden) ─────────────────────────────
 *  1. It exercises the working tree, not the npm tarball. When `cli/bundled/`
 *     exists locally it is read in preference to the repo root, so a local run
 *     and a CI run consume different inputs. The source actually used is
 *     printed on every run.
 *  2. It measures the file's CONTENT. Whether an agent then opens the
 *     standards is XSPEC-357's P7 probe, which needs a non-Claude judge and is
 *     not built. Nothing here should be read as evidence that it does.
 *
 * Usage:
 *   tsx scripts/check-adopter-instruction-files.ts             # run + report
 *   tsx scripts/check-adopter-instruction-files.ts --verbose   # per-file detail
 *   tsx scripts/check-adopter-instruction-files.ts --json      # machine-readable
 *   tsx scripts/check-adopter-instruction-files.ts --self-test # prove it goes red
 *
 * Exit codes (three states — "could not measure" is not a pass):
 *   0 — every scenario was generated and every assertion held
 *   1 — assertions failed; findings name the file and the assertion
 *   2 — could not measure: `uds init` failed, no manifest, temp dir unusable.
 *       NOT "no findings".
 *
 * Measured arms, 2026-08-20:
 *   green      — 5 scenarios, 33 adopter files, 0 findings                → exit 0
 *   red        — disclosure emission disabled in the generator; 35 findings
 *                across 4 of the 5 scenarios (minimal 11 = 8 disclosure +
 *                3 open-instruction, index 8, full 8, zh-tw 8), each naming its
 *                file and assertion, while the untouched universal-AGENTS.md
 *                scenario stayed at 0 — which is what a two-producer split
 *                looks like from the outside                          → exit 1
 *   unmeasured — `cli/bin/uds.js` moved aside                          → exit 2
 *   --self-test — 5/5 arms fired (1 green, 3 red, 1 unmeasurable)       → exit 0
 *
 * One limit on the exit-2 state, found while proving it: with TMPDIR pointing
 * at a nonexistent path, `tsx` dies in its own IPC setup before this file is
 * loaded, and node exits 1. Exit 2 covers causes this script can observe, not
 * every way the run can fail. Said here rather than left to be rediscovered.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const UDS_BIN = join(ROOT_DIR, 'cli', 'bin', 'uds.js');

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const CYAN = '\x1b[0;36m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

const argv = new Set(process.argv.slice(2));
const VERBOSE = argv.has('--verbose');
const JSON_OUTPUT = argv.has('--json');
const SELF_TEST = argv.has('--self-test');

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

/** An assertion that failed. `assertion` is the id an operator greps for. */
interface Finding {
  scenario: string;
  file: string;
  assertion: 'exists' | 'non-empty' | 'markers' | 'disclosure' | 'open-instruction';
  detail: string;
}

/** Something that stopped the measurement from happening at all. */
class Unmeasurable extends Error {}

interface FileReport {
  file: string;
  bytes: number;
  lines: number;
  standardsRefs: number;
  ruleHits: string[];
  language: 'en' | 'zh' | 'unknown';
}

interface ScenarioReport {
  name: string;
  args: string[];
  integrations: string[];
  files: FileReport[];
  findings: Finding[];
}

// ───────────────────────────────────────────────────────────────────────────
// The rule patterns `check-ai-agent-sync.sh` applies to the repo templates.
//
// Reproduced here to MEASURE the same thing against the adopter's copy, so the
// two numbers are directly comparable. They are never asserted on — see the
// header. If the .sh list changes, this list going stale costs a reported
// number, not a false pass.
// ───────────────────────────────────────────────────────────────────────────
const RULE_PATTERNS: ReadonlyArray<readonly [string, RegExp]> = [
  ['AH-001', /read.*file.*before|must.*read|MUST read files before|Evidence-Based/i],
  ['AH-002', /\[Source:|Source Attribution|cite.*source/i],
  ['AH-003', /\[Confirmed\]|\[Inferred\]|\[Assumption\]|\[Unknown\]|Certainty Classification/i],
  ['AH-004', /recommend.*option|Recommended.*choice|MUST.*recommend|explicitly state.*Recommended/i],
  ['SDD-001', /OpenSpec|Spec Kit|openspec\/|specs\/|\.speckit/i],
  ['SDD-002', /prioritize.*command|MUST prioritize|SDD.*Priority|Spec-Driven Development.*Priority/i],
  ['CMT-001', /type.*scope.*subject|<type>.*<scope>|Conventional Commits|feat.*fix.*docs/i],
];

// The disclosure, in both languages the generator emits. Matched loosely enough
// to survive rewording of the surrounding sentence, tightly enough that the
// pre-2026-08-18 wording ("Full standards available in the .standards/
// directory") does not satisfy it — that phrasing was measured leaving every
// file unopened, so a check it passes is a check that measures nothing.
const DISCLOSURE_PATTERNS: ReadonlyArray<readonly [string, RegExp]> = [
  ['en', /an index, not the standards/i],
  ['en', /NOT reproduced here/i],
  ['zh', /是索引，不是標準本文/],
  ['zh', /規則並未複製於此/],
];

// "Go and open the file", as opposed to "the files exist".
const OPEN_INSTRUCTION_PATTERNS: ReadonlyArray<RegExp> = [
  /open the relevant file under [`]?\.standards\//i,
  /Read a standard's own file to see what it requires/i,
  /you MUST read and follow the standards in [`]?\.standards\//i,
  /打開 [`]?\.standards\/[`]? 底下對應的檔案/,
  /要知道某標準要求什麼，讀它自己的檔案/,
  /必須讀取並遵守 [`]?\.standards\//,
];

const MARKER_START = /UDS:STANDARDS:START/;
const MARKER_END = /UDS:STANDARDS:END/;

// ───────────────────────────────────────────────────────────────────────────
// Generate: run the real `uds init` into a throwaway directory
// ───────────────────────────────────────────────────────────────────────────

/**
 * Every filename the installer can own, read from the installer's own registry
 * rather than typed out here. Doubles as the set of detection markers: with one
 * empty file at each path, `detectAITools()` selects every tool it knows.
 */
async function knownToolFiles(): Promise<Map<string, string>> {
  const constants = await import(join(ROOT_DIR, 'cli', 'src', 'core', 'constants.js'));
  const out = new Map<string, string>();
  for (const [tool, cfg] of Object.entries(constants.SUPPORTED_AI_TOOLS as Record<string, { file: string }>)) {
    out.set(tool, cfg.file);
  }
  return out;
}

function makeProjectDir(): string {
  try {
    return mkdtempSync(join(tmpdir(), 'uds-adopter-check-'));
  } catch (e) {
    throw new Unmeasurable(`cannot create a temp project directory: ${(e as Error).message}`);
  }
}

/**
 * Seed detection markers, then run `uds init`.
 * @param seedMarkers when false, no tool is detected and init takes the
 *        universal-AGENTS.md path instead — a genuinely different producer.
 */
async function generateProject(dir: string, args: string[], seedMarkers: boolean): Promise<void> {
  if (seedMarkers) {
    for (const file of (await knownToolFiles()).values()) {
      const target = join(dir, file);
      try {
        execFileSync('mkdir', ['-p', dirname(target)]);
        writeFileSync(target, '');
      } catch (e) {
        throw new Unmeasurable(`cannot seed marker ${file}: ${(e as Error).message}`);
      }
    }
  }

  if (!existsSync(UDS_BIN)) {
    throw new Unmeasurable(`uds entry point not found: ${UDS_BIN}`);
  }

  try {
    execFileSync(process.execPath, [UDS_BIN, 'init', '-y', ...args], {
      cwd: dir,
      stdio: 'pipe',
      encoding: 'utf8',
    });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message: string };
    throw new Unmeasurable(
      `\`uds init ${args.join(' ')}\` failed in ${dir}\n` +
        `${(err.stderr || err.stdout || err.message).trim().split('\n').slice(-8).join('\n')}`
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Assess: pure over a generated directory. Everything the self-test mutates
// goes through here, which is why the mutation arms are end-to-end.
// ───────────────────────────────────────────────────────────────────────────

function assessProject(dir: string, scenario: string, args: string[]): ScenarioReport {
  const manifestPath = join(dir, '.standards', 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Unmeasurable(`no manifest at ${manifestPath} — init produced nothing to assess`);
  }

  let manifest: { integrations?: string[]; generateAgentsMd?: boolean };
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    throw new Unmeasurable(`manifest is not readable JSON: ${(e as Error).message}`);
  }

  // Denominator comes from the installer's own record of what it wrote.
  const targets = [...(manifest.integrations ?? [])];
  // The universal summary is not listed under `integrations`, so it is added
  // explicitly — otherwise the one file the 2026-08-18 fix landed on would be
  // the one file this checker never looked at.
  if (manifest.generateAgentsMd && !targets.includes('AGENTS.md')) targets.push('AGENTS.md');

  if (targets.length === 0) {
    throw new Unmeasurable(
      `manifest lists no integrations and no AGENTS.md — nothing was generated to check`
    );
  }

  const findings: Finding[] = [];
  const files: FileReport[] = [];

  for (const rel of targets) {
    const abs = join(dir, rel);
    if (!existsSync(abs)) {
      findings.push({
        scenario,
        file: rel,
        assertion: 'exists',
        detail: 'manifest names this file but it is not on disk',
      });
      continue;
    }

    const content = readFileSync(abs, 'utf8');
    const bytes = statSync(abs).size;

    if (content.trim().length === 0) {
      findings.push({ scenario, file: rel, assertion: 'non-empty', detail: `${bytes} bytes, no content` });
      continue;
    }

    if (!MARKER_START.test(content) || !MARKER_END.test(content)) {
      findings.push({
        scenario,
        file: rel,
        assertion: 'markers',
        detail: 'no UDS:STANDARDS block — the file cannot be updated by `uds update`',
      });
    }

    const en = DISCLOSURE_PATTERNS.filter(([l]) => l === 'en').every(([, p]) => p.test(content));
    const zh = DISCLOSURE_PATTERNS.filter(([l]) => l === 'zh').every(([, p]) => p.test(content));
    if (!en && !zh) {
      findings.push({
        scenario,
        file: rel,
        assertion: 'disclosure',
        detail:
          'does not state that it is an index and that the rules are not reproduced in it — ' +
          'an agent reading only this file cannot tell it is holding a table of contents',
      });
    }

    if (!OPEN_INSTRUCTION_PATTERNS.some((p) => p.test(content))) {
      findings.push({
        scenario,
        file: rel,
        assertion: 'open-instruction',
        detail:
          'never instructs the reader to open a file under `.standards/` — describing where ' +
          'the standards live asks for nothing',
      });
    }

    files.push({
      file: rel,
      bytes,
      lines: content.split('\n').length,
      standardsRefs: (content.match(/\.standards\//g) ?? []).length,
      ruleHits: RULE_PATTERNS.filter(([, p]) => p.test(content)).map(([id]) => id),
      language: en ? 'en' : zh ? 'zh' : 'unknown',
    });
  }

  return { name: scenario, args, integrations: targets, files, findings };
}

// ───────────────────────────────────────────────────────────────────────────
// Self-test — mutate the real artifact and require the checker to notice
// ───────────────────────────────────────────────────────────────────────────

async function selfTest(): Promise<number> {
  console.log(`${BLUE}${BOLD}Self-test — does this checker actually go red?${NC}`);
  console.log(
    `${DIM}Each arm generates a real project, breaks one thing in what \`uds init\` wrote,${NC}`
  );
  console.log(`${DIM}and requires a finding naming that file and that assertion.${NC}\n`);

  const dir = makeProjectDir();
  let failures = 0;

  const report = (ok: boolean, name: string, got: string) => {
    console.log(
      `  ${ok ? `${GREEN}[FIRED]${NC}` : `${RED}[DID NOT FIRE]${NC}`} ${name}\n` +
        `          ${DIM}${got}${NC}`
    );
    if (!ok) failures++;
  };

  try {
    await generateProject(dir, ['--content-mode', 'index'], true);

    // Arm 0 — the green arm. Without it the red arms prove nothing: a checker
    // that finds a problem in every input is as useless as one that never does.
    const clean = assessProject(dir, 'self-test/clean', []);
    report(
      clean.findings.length === 0,
      'unmodified `uds init` output assesses clean',
      `${clean.integrations.length} files, ${clean.findings.length} findings`
    );

    const target = join(dir, 'CLAUDE.md');
    const pristine = readFileSync(target, 'utf8');

    // Arm 1 — the disclosure is removed. This is the exact regression the
    // 2026-08-18 fix guards against, re-introduced on purpose.
    writeFileSync(
      target,
      pristine
        .replace(/^>? ?\*?\*?This block is an index[\s\S]*?standards\.\n/m, '')
        .replace(/^>? ?\*?\*?這個區塊是索引[\s\S]*?沒有採用標準。\n/m, '')
    );
    const m1 = assessProject(dir, 'self-test/no-disclosure', []);
    report(
      m1.findings.some((f) => f.file === 'CLAUDE.md' && f.assertion === 'disclosure'),
      'disclosure stripped from CLAUDE.md',
      m1.findings.length === 0
        ? 'no findings at all'
        : m1.findings.map((f) => `${f.file}/${f.assertion}`).join(', ')
    );

    // Arm 2 — marker block gone. `uds update` silently stops managing the file.
    writeFileSync(target, pristine.replace(/UDS:STANDARDS:START/g, 'X').replace(/UDS:STANDARDS:END/g, 'X'));
    const m2 = assessProject(dir, 'self-test/no-markers', []);
    report(
      m2.findings.some((f) => f.file === 'CLAUDE.md' && f.assertion === 'markers'),
      'UDS marker block removed from CLAUDE.md',
      m2.findings.map((f) => `${f.file}/${f.assertion}`).join(', ') || 'no findings at all'
    );

    // Arm 3 — the file is emptied. Distinguishes "checked and passed" from
    // "there was nothing to check".
    writeFileSync(target, '');
    const m3 = assessProject(dir, 'self-test/empty', []);
    report(
      m3.findings.some((f) => f.file === 'CLAUDE.md' && f.assertion === 'non-empty'),
      'CLAUDE.md emptied',
      m3.findings.map((f) => `${f.file}/${f.assertion}`).join(', ') || 'no findings at all'
    );

    // Arm 4 — the third state. An unmeasurable run must not look like a pass.
    writeFileSync(target, pristine);
    rmSync(join(dir, '.standards', 'manifest.json'));
    let unmeasurable = false;
    try {
      assessProject(dir, 'self-test/no-manifest', []);
    } catch (e) {
      unmeasurable = e instanceof Unmeasurable;
    }
    report(unmeasurable, 'manifest deleted → raises Unmeasurable (exit 2, not exit 0)', `${unmeasurable}`);
  } catch (e) {
    console.log(`\n${RED}Self-test could not run: ${(e as Error).message}${NC}`);
    return 2;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  console.log('');
  if (failures > 0) {
    console.log(`${RED}${BOLD}✗ ${failures} arm(s) did not behave as required.${NC}`);
    console.log(`${RED}  Until they do, a clean run of this checker means nothing.${NC}\n`);
    return 1;
  }
  console.log(`${GREEN}${BOLD}✓ All 5 arms behaved as required — green, three reds, one unmeasurable.${NC}\n`);
  return 0;
}

// ───────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────

/** Which tree `uds init` actually read standards from. Different in CI. */
function standardsSource(): string {
  const bundled = join(ROOT_DIR, 'cli', 'bundled');
  if (existsSync(bundled)) {
    const n = readdirSync(bundled).length;
    return `cli/bundled/ (${n} top-level entries) — takes priority over the repo root; ` +
      `this is a prepack artifact and is absent in a clean checkout`;
  }
  return 'repo root (core/, ai/, locales/) — cli/bundled/ is absent';
}

async function main(): Promise<number> {
  if (SELF_TEST) return selfTest();

  const scenarios: Array<{ name: string; args: string[]; seed: boolean }> = [
    { name: 'content-mode=minimal', args: ['--content-mode', 'minimal'], seed: true },
    { name: 'content-mode=index', args: ['--content-mode', 'index'], seed: true },
    { name: 'content-mode=full', args: ['--content-mode', 'full'], seed: true },
    // No markers seeded: no tool is detected, so init writes the universal
    // AGENTS.md summary instead. Different function, different output — and for
    // AGENTS.md the two are mutually exclusive, so checking one never covers
    // the other.
    { name: 'no-tool-detected (universal AGENTS.md)', args: ['--content-mode', 'index'], seed: false },
    { name: 'locale=zh-tw', args: ['--content-mode', 'index', '--locale', 'zh-tw'], seed: true },
  ];

  const reports: ScenarioReport[] = [];
  const dirs: string[] = [];
  const byScenarioDir = new Map<string, string>();

  try {
    for (const s of scenarios) {
      const dir = makeProjectDir();
      dirs.push(dir);
      byScenarioDir.set(s.name, dir);
      await generateProject(dir, s.args, s.seed);
      reports.push(assessProject(dir, s.name, s.args));
    }
  } catch (e) {
    if (e instanceof Unmeasurable) {
      for (const d of dirs) rmSync(d, { recursive: true, force: true });
      if (JSON_OUTPUT) {
        console.log(JSON.stringify({ status: 'unmeasurable', reason: e.message }, null, 2));
      } else {
        console.log(`\n${RED}${BOLD}✗ Could not measure.${NC}`);
        console.log(`${RED}${e.message}${NC}`);
        console.log(
          `${YELLOW}This is exit 2, not exit 0. Nothing was checked; do not read this as a pass.${NC}\n`
        );
      }
      return 2;
    }
    throw e;
  }

  // Index vs full — reported because the names promise a difference.
  let indexVsFull = 'not compared';
  const idx = byScenarioDir.get('content-mode=index');
  const full = byScenarioDir.get('content-mode=full');
  if (idx && full) {
    const r = reports.find((x) => x.name === 'content-mode=index')!;
    const differing = r.integrations.filter((rel) => {
      const a = join(idx, rel);
      const b = join(full, rel);
      if (!existsSync(a) || !existsSync(b)) return true;
      return readFileSync(a, 'utf8') !== readFileSync(b, 'utf8');
    });
    indexVsFull =
      differing.length === 0
        ? `byte-identical across all ${r.integrations.length} files`
        : `${differing.length}/${r.integrations.length} files differ: ${differing.join(', ')}`;
  }

  const allFindings = reports.flatMap((r) => r.findings);
  const known = await knownToolFiles();
  const exercised = new Set(reports.flatMap((r) => r.integrations));
  const notExercised = [...known.entries()].filter(([, f]) => !exercised.has(f));

  for (const d of dirs) rmSync(d, { recursive: true, force: true });

  if (JSON_OUTPUT) {
    console.log(
      JSON.stringify(
        {
          status: allFindings.length === 0 ? 'pass' : 'fail',
          standardsSource: standardsSource(),
          scenarios: reports.map((r) => ({
            name: r.name,
            files: r.files,
            findings: r.findings,
          })),
          notAsserted: {
            ruleBodies:
              'rule text is never asserted — .standards/ is ~248k tokens and cannot be inlined',
            agentBehaviour: 'whether an agent opens the files is XSPEC-357 P7, not built',
            npmTarball: 'the working tree is exercised, not the published package',
          },
          indexVsFull,
          toolsNotExercised: notExercised.map(([t, f]) => ({ tool: t, file: f })),
        },
        null,
        2
      )
    );
    return allFindings.length === 0 ? 0 : 1;
  }

  console.log('');
  console.log('==========================================');
  console.log('  Adopter Instruction File Checker');
  console.log('  採用者指令檔檢查器');
  console.log('==========================================');
  console.log('');
  console.log(
    `${DIM}Checks what \`uds init\` writes, not this repo's integrations/ templates.${NC}`
  );
  console.log(`${DIM}Standards read from: ${standardsSource()}${NC}`);
  console.log('');

  for (const r of reports) {
    const bad = r.findings.length;
    console.log(
      `${CYAN}${BOLD}${r.name}${NC} ${DIM}(uds init -y ${r.args.join(' ')})${NC} — ` +
        `${r.integrations.length} adopter file(s)`
    );
    if (VERBOSE) {
      for (const f of r.files) {
        console.log(
          `    ${DIM}${f.file.padEnd(36)} ${String(f.bytes).padStart(6)}b  ` +
            `${String(f.lines).padStart(4)}L  .standards/ refs=${String(f.standardsRefs).padStart(3)}  ` +
            `lang=${f.language}  rule-keyword hits=${f.ruleHits.length}/7${NC}`
        );
      }
    }
    if (bad === 0) {
      console.log(`  ${GREEN}✓ all assertions hold${NC}`);
    } else {
      for (const f of r.findings) {
        console.log(`  ${RED}[FAIL]${NC} ${BOLD}${f.file}${NC} — ${f.assertion}`);
        console.log(`         ${DIM}${f.detail}${NC}`);
      }
    }
    console.log('');
  }

  // ── The stated non-assertions. Printed on every run, pass or fail. ────────
  const allFiles = reports.flatMap((r) => r.files);
  const totalHits = allFiles.reduce((a, f) => a + f.ruleHits.length, 0);
  const maxHits = allFiles.length * RULE_PATTERNS.length;
  const withAnyRule = allFiles.filter((f) => f.ruleHits.length > 0).length;

  console.log('------------------------------------------');
  console.log(`${BOLD}What this checker does NOT check${NC}`);
  console.log('------------------------------------------');
  console.log(
    `  ${YELLOW}Rule bodies — not asserted, by design.${NC}\n` +
      `    Measured anyway: ${totalHits}/${maxHits} rule-keyword hits across ${allFiles.length} ` +
      `adopter file(s);\n` +
      `    ${withAnyRule}/${allFiles.length} carry any rule keyword at all.\n` +
      `    Inlining is not an option: .standards/ is ~143 .ai.yaml files, ~248k tokens.\n` +
      `    The same patterns score 6-7/7 against integrations/*/ templates in\n` +
      `    check-ai-agent-sync.sh — that gap IS the finding, and it is not a defect to fix.`
  );
  console.log(
    `  ${YELLOW}Agent behaviour — not measurable here.${NC}\n` +
      `    Whether an agent opens .standards/ after reading this file is XSPEC-357 P7.\n` +
      `    That probe needs a non-Claude judge and is not built. A pass here is not it.`
  );
  console.log(
    `  ${YELLOW}The published package — not exercised.${NC}\n` +
      `    This runs the working tree. \`npm pack\` output is checked elsewhere.`
  );
  console.log(`  ${YELLOW}index vs full:${NC} ${indexVsFull}`);
  if (notExercised.length > 0) {
    console.log(
      `  ${YELLOW}Tools known but not exercised (${notExercised.length}/${known.size}):${NC} ` +
        notExercised.map(([t, f]) => `${t} (${f})`).join(', ')
    );
    console.log(`    ${DIM}Not auto-detected by detectAITools(), so \`uds init -y\` never selects them.${NC}`);
  }
  console.log('');

  console.log('==========================================');
  if (allFindings.length > 0) {
    console.log(`${RED}${BOLD}✗ ${allFindings.length} finding(s) across ${reports.length} scenario(s)${NC}`);
    console.log('');
    return 1;
  }
  console.log(
    `${GREEN}${BOLD}✓ ${allFiles.length} adopter file(s) across ${reports.length} scenario(s) — all assertions hold${NC}`
  );
  console.log(
    `${DIM}  Verify this is not vacuous: tsx scripts/check-adopter-instruction-files.ts --self-test${NC}`
  );
  console.log('');
  return 0;
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(`${RED}Internal error: ${(e as Error).stack ?? e}${NC}`);
    process.exit(2);
  }
);
