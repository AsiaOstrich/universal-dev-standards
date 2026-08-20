#!/usr/bin/env node
/**
 * llms.txt Generator and Drift Gate — XSPEC-385
 * llms.txt 產生器與漂移閘門
 *
 * ── Why this is generated and not written ──────────────────────────────────
 * PR #179 proposed a hand-written `llms.txt`. It was declined on 2026-08-20,
 * and the reason is the rule XSPEC-385 exists to state: a hand-written
 * llms.txt is a second copy of the project's own description with no check
 * and no expiry date. It is right on the day it is merged and quietly wrong
 * afterwards, and nothing goes red in between. The counts, the version, the
 * standards list and the integration list all drift, and the file keeps
 * looking authoritative while it does.
 *
 * So the content is derived from the sources that already have to be correct,
 * and `--check` is the clock: it re-renders from those sources and fails if
 * the committed `llms.txt` differs by so much as a byte.
 *
 * ── Sources of truth ───────────────────────────────────────────────────────
 *   uds-manifest.json          project name, version, the 150 standards
 *   core/<id>.md               each standard's real H1 title
 *   skills/<id>/SKILL.md       the 55 skills and their description lines
 *   integrations/REGISTRY.json the AI agent integrations and their tiers
 *   cli/package.json           repository URL, homepage, license
 *
 * Nothing here is typed by hand except the section headings and the framing
 * sentences, and those are asserted against the sources where they carry a
 * number.
 *
 * ── Two places this deliberately disagrees with a source ───────────────────
 *  1. **Skills come from the filesystem, not from `uds-manifest.json`.** The
 *     manifest lists 64 skill entries and 9 of them have no
 *     `skills/<id>/SKILL.md`: forward-derivation, methodology-system,
 *     ac-coverage-assistant, process-automation, plus the five container
 *     directories agents/ ai/ commands/ tools/ workflows/. Generating from the
 *     manifest would emit 9 links to files that do not exist — publishing dead
 *     links into the one file whose whole purpose is to be followed by a
 *     machine. Measured 2026-08-20; the mismatch is reported on every run
 *     rather than silently worked around.
 *  2. **Standards come from the manifest AND core/, cross-checked.** These two
 *     agree exactly today (150 = 150, no orphans in either direction), so the
 *     generator asserts the bijection and refuses to render if it ever breaks.
 *     A disagreement there means one of them is wrong, and guessing which is
 *     how a generator starts producing confident nonsense.
 *
 * ── The defect in PR #179 that is explicitly designed against ──────────────
 * Its `## Pages` block listed "Repository" and "Homepage/Docs" as two entries
 * pointing at the same URL — `cli/package.json`'s `homepage` is the
 * `repository.url` with `#readme` on the end. Both are still fed in here, on
 * purpose, and `dedupeLinks()` collapses them by normalised URL (fragment,
 * trailing slash and `.git` suffix stripped). The number collapsed is printed
 * on every run, so the dedupe is visible rather than assumed, and the
 * self-test asserts that this specific collision is caught.
 *
 * ── No date stamp, on purpose ──────────────────────────────────────────────
 * `scripts/generated-doc-stamp.ts` records what a volatile "Last regenerated"
 * line did to `check-skill-index.ts`: it fired on every commit and never once
 * on real content, and the habit it taught was to regenerate without reading
 * the diff. This file carries the version, which changes when something
 * changed, and no date, which changes when nothing did.
 *
 * ── Flags ──────────────────────────────────────────────────────────────────
 *   node scripts/generate-llms-txt.mjs              # write llms.txt
 *   node scripts/generate-llms-txt.mjs --check      # fail if it has drifted
 *   node scripts/generate-llms-txt.mjs --self-test  # prove --check goes red
 *   node scripts/generate-llms-txt.mjs --stdout     # render to stdout only
 *
 * An unknown flag is a hard error (exit 2), never a silent no-op.
 *
 * ── Exit codes (three states — "could not measure" is NOT a pass) ───────────
 *   0 — generated, or --check found the committed file identical
 *   1 — --check found drift (or the file is missing)
 *   2 — could not render: a source is missing/unparseable, an id has no file,
 *       the manifest/core bijection is broken, or an unknown flag was passed
 *
 * ── Measured arms, 2026-08-20 (all at the process level, not in-process) ───
 *   generate   — 150 standards, 55 skills, 14 integrations, 11 doc links
 *                (1 deduped: "Homepage" collapsed into "README"), v6.8.0,
 *                256 lines                                             → rc 0
 *   green      — --check immediately after generating                  → rc 0
 *   red        — `## Skills (55)` hand-edited to `(999)`; --check named
 *                line 176 with both spellings                          → rc 1
 *   red        — llms.txt deleted; --check said so rather than skipping → rc 1
 *   unmeasured — uds-manifest.json moved aside                         → rc 2
 *   unmeasured — --bogus                                               → rc 2
 *   --self-test — 6/6 arms fired
 *
 * The integration count is 14, not the 15 directories under integrations/:
 * `verification/` holds probe baselines, not an agent, and is absent from
 * REGISTRY.json's `agents`. Counting directories would have inflated it —
 * which is why the number comes from the registry.
 *
 * ── Release coupling, stated rather than discovered ────────────────────────
 * The rendered file carries the version from `uds-manifest.json`, and
 * `scripts/bump-version.mjs` rewrites that version without regenerating
 * anything. So the first `--check` after a version bump WILL fail, by design:
 * that is the clock doing its job. The fix is one command,
 * `npm run docs:llms-txt`, and the failure message says so.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_PATH = join(ROOT_DIR, 'llms.txt');

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

/** Something that stopped the render from happening at all. */
class Unrenderable extends Error {}

// ───────────────────────────────────────────────────────────────────────────
// Argument parsing — unknown flags are rejected, not ignored
// ───────────────────────────────────────────────────────────────────────────

const KNOWN_FLAGS = new Set(['--check', '--self-test', '--stdout', '--help']);

function parseArgs(argv) {
  const opts = { check: false, selfTest: false, stdout: false };
  for (const a of argv) {
    if (!KNOWN_FLAGS.has(a)) {
      throw new Unrenderable(
        `unknown flag \`${a}\`.\nKnown flags: ${[...KNOWN_FLAGS].join(', ')}\n` +
          `Rejected rather than ignored: a flag that is quietly dropped makes a run that ` +
          `generated nothing look exactly like a run that generated everything.`
      );
    }
    if (a === '--check') opts.check = true;
    else if (a === '--self-test') opts.selfTest = true;
    else if (a === '--stdout') opts.stdout = true;
    else if (a === '--help') {
      console.log('Usage: node scripts/generate-llms-txt.mjs [--check] [--self-test] [--stdout]');
      process.exit(0);
    }
  }
  return opts;
}

// ───────────────────────────────────────────────────────────────────────────
// Source loading — every read fails loudly
// ───────────────────────────────────────────────────────────────────────────

function readJson(relPath) {
  const abs = join(ROOT_DIR, relPath);
  if (!existsSync(abs)) throw new Unrenderable(`source not found: ${relPath}`);
  try {
    return JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    throw new Unrenderable(`source is not readable JSON: ${relPath} — ${e.message}`);
  }
}

function readTextOrThrow(relPath) {
  const abs = join(ROOT_DIR, relPath);
  if (!existsSync(abs)) throw new Unrenderable(`source not found: ${relPath}`);
  return readFileSync(abs, 'utf8');
}

/** First level-1 heading of a markdown file. */
function h1Of(relPath) {
  const line = readTextOrThrow(relPath)
    .split('\n')
    .find((l) => l.startsWith('# '));
  if (!line) throw new Unrenderable(`no level-1 heading in ${relPath} — cannot title it`);
  return line.slice(2).trim();
}

/** The frontmatter `description:` block of a SKILL.md, first sentence only. */
function skillSummary(relPath) {
  const lines = readTextOrThrow(relPath).split('\n');
  if (lines[0]?.trim() !== '---') return null;
  const end = lines.slice(1).findIndex((l) => l.trim() === '---');
  if (end === -1) return null;
  const fm = lines.slice(1, end + 1);
  const i = fm.findIndex((l) => /^description:/.test(l));
  if (i === -1) return null;
  for (let j = i + 1; j < fm.length; j++) {
    const t = fm[j].trim();
    if (t === '') continue;
    if (!/^\s/.test(fm[j])) break;
    return t.replace(/^\[UDS\]\s*/, '');
  }
  return null;
}

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Link dedupe — the PR #179 defect, designed against
// ───────────────────────────────────────────────────────────────────────────

/** Strip fragment, query, trailing slash and `.git` so two spellings of one page collide. */
export function normaliseUrl(url) {
  return url
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

/**
 * Collapse links that point at the same page, keeping the first spelling.
 * @returns {{ links: Array, dropped: Array }}
 */
export function dedupeLinks(links) {
  const seen = new Map();
  const dropped = [];
  for (const link of links) {
    const key = normaliseUrl(link.url);
    if (seen.has(key)) {
      dropped.push({ ...link, collidesWith: seen.get(key).title });
      continue;
    }
    seen.set(key, link);
  }
  return { links: [...seen.values()], dropped };
}

// ───────────────────────────────────────────────────────────────────────────
// Render
// ───────────────────────────────────────────────────────────────────────────

function renderLink({ title, url, note }) {
  return `- [${title}](${url})${note ? `: ${note}` : ''}`;
}

/**
 * Build the whole file plus the stats needed to report on it.
 * Pure over the repo contents — the self-test relies on that.
 */
export function render() {
  const manifest = readJson('uds-manifest.json');
  const registry = readJson('integrations/REGISTRY.json');
  const pkg = readJson('cli/package.json');

  const version = manifest.version;
  if (!version) throw new Unrenderable('uds-manifest.json has no version');

  const repoUrl = (pkg.repository?.url ?? '')
    .replace(/^git\+/, '')
    .replace(/\.git$/, '');
  if (!repoUrl) throw new Unrenderable('cli/package.json has no repository.url');
  const blob = `${repoUrl}/blob/main`;

  // ── Standards: manifest and core/ must agree, or we refuse to render ─────
  const coreDir = join(ROOT_DIR, 'core');
  if (!isDir(coreDir)) throw new Unrenderable('core/ is not a directory');
  const coreIds = readdirSync(coreDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
  const manifestIds = (manifest.standards ?? []).map((s) => s.id).sort();

  const missingFiles = manifestIds.filter((id) => !coreIds.includes(id));
  const orphanFiles = coreIds.filter((id) => !manifestIds.includes(id));
  if (missingFiles.length > 0 || orphanFiles.length > 0) {
    throw new Unrenderable(
      `uds-manifest.json and core/ disagree, so neither can be trusted as the list:\n` +
        `  in manifest but no core/<id>.md (${missingFiles.length}): ${missingFiles.join(', ') || '-'}\n` +
        `  in core/ but not in manifest (${orphanFiles.length}): ${orphanFiles.join(', ') || '-'}\n` +
        `Fix the disagreement rather than picking a side here.`
    );
  }

  const levelById = new Map((manifest.standards ?? []).map((s) => [s.id, s.level]));
  const standards = coreIds.map((id) => ({
    title: h1Of(`core/${id}.md`),
    url: `${blob}/core/${id}.md`,
    note: `\`${id}\`, level ${levelById.get(id) ?? '?'}`,
  }));

  // ── Skills: walked from disk, because the manifest lists 9 that are gone ──
  const skillsDir = join(ROOT_DIR, 'skills');
  if (!isDir(skillsDir)) throw new Unrenderable('skills/ is not a directory');
  const skillIds = readdirSync(skillsDir)
    .filter((e) => existsSync(join(skillsDir, e, 'SKILL.md')))
    .sort();
  if (skillIds.length === 0) throw new Unrenderable('skills/ holds no SKILL.md — nothing to list');

  const skills = skillIds.map((id) => ({
    title: id,
    url: `${blob}/skills/${id}/SKILL.md`,
    note: skillSummary(`skills/${id}/SKILL.md`),
  }));

  const manifestSkillIds = (manifest.skills ?? []).map((s) => s.id);
  const staleSkillEntries = manifestSkillIds.filter((id) => !skillIds.includes(id));

  // ── Integrations ─────────────────────────────────────────────────────────
  const agents = Object.entries(registry.agents ?? {});
  if (agents.length === 0) throw new Unrenderable('integrations/REGISTRY.json lists no agents');
  const integrations = agents
    .map(([key, a]) => ({
      title: a.name ?? key,
      url: a.instructionFile ? `${blob}/${a.instructionFile}` : `${blob}/integrations/${key}`,
      note: `tier ${a.tier ?? 'unknown'}${a.supportsSkills ? ', skills' : ''}${a.supportsAgents ? ', agents' : ''}`,
    }))
    .sort((x, y) => x.title.localeCompare(y.title));

  // ── Documentation links. `repository.url` and `homepage` are BOTH fed in
  //    on purpose: they are the collision PR #179 shipped as two entries. ───
  const rawDocLinks = [
    { title: 'README', url: repoUrl, note: 'what UDS is, install, and the adoption flow' },
    ...(pkg.homepage ? [{ title: 'Homepage', url: pkg.homepage, note: 'project homepage' }] : []),
    { title: 'Getting Started', url: `${blob}/docs/user/GETTING-STARTED.md`, note: 'first adoption, start here' },
    { title: 'User Manual', url: `${blob}/docs/USER-MANUAL.md`, note: 'full CLI and workflow reference' },
    { title: 'Cheatsheet', url: `${blob}/docs/user/CHEATSHEET.md`, note: 'single-page quick reference' },
    { title: 'FAQ', url: `${blob}/docs/user/FAQ.md`, note: 'common questions' },
    { title: 'Glossary', url: `${blob}/docs/user/GLOSSARY.md`, note: 'terms used across the standards' },
    { title: 'Feature Reference', url: `${blob}/docs/reference/FEATURE-REFERENCE.md`, note: 'every feature, generated' },
    { title: 'Standards Reference', url: `${blob}/docs/STANDARDS-REFERENCE.md`, note: 'the standards catalogue' },
    { title: 'Skills Index', url: `${blob}/docs/user/SKILLS-INDEX.md`, note: 'generated index of skills' },
    { title: 'Commands Index', url: `${blob}/docs/user/COMMANDS-INDEX.md`, note: 'generated index of slash commands' },
    { title: 'Troubleshooting', url: `${blob}/docs/user/TROUBLESHOOTING.md`, note: 'when adoption goes wrong' },
  ];
  const { links: docLinks, dropped } = dedupeLinks(rawDocLinks);

  // Every local doc link must resolve to a file that exists. A dead link in
  // the one file meant to be followed by a machine is worse than no file.
  for (const l of docLinks) {
    if (!l.url.startsWith(blob)) continue;
    const rel = l.url.slice(blob.length + 1);
    if (!existsSync(join(ROOT_DIR, rel))) {
      throw new Unrenderable(`documentation link points at a file that does not exist: ${rel}`);
    }
  }

  const optional = [
    { title: 'CHANGELOG', url: `${blob}/CHANGELOG.md`, note: 'release history' },
    { title: 'CONTRIBUTING', url: `${blob}/CONTRIBUTING.md`, note: 'how to propose a change' },
    { title: 'LICENSE', url: `${blob}/LICENSE`, note: 'CC BY 4.0 for docs, MIT for code' },
    { title: 'SECURITY', url: `${blob}/SECURITY.md`, note: 'reporting a vulnerability' },
  ];

  const out = [];
  out.push(`# ${manifest.project ?? 'Universal Development Standards'}`);
  out.push('');
  out.push(
    `> A library of development standards for AI-assisted software work: ` +
      `${standards.length} standards published in Markdown for people and token-optimised YAML for agents, ` +
      `${skills.length} agent skills, and integrations for ${integrations.length} AI coding tools. Version ${version}.`
  );
  out.push('');
  out.push(
    `UDS is a standards library, not a runtime. It ships no server and no orchestrator: ` +
      `a project adopts it with the \`uds\` CLI, which installs the standards it selects into ` +
      `\`.standards/\` and writes instruction files for whichever AI tools that project uses. ` +
      `Documentation is licensed CC BY 4.0 and code MIT, so both are free to reuse.`
  );
  out.push('');
  out.push(
    `This file is generated by \`scripts/generate-llms-txt.mjs\` from uds-manifest.json, ` +
      `core/, skills/, integrations/REGISTRY.json and cli/package.json. Do not edit it by hand — ` +
      `\`npm run check:llms-txt\` re-renders from those sources and fails if this file has drifted.`
  );
  out.push('');
  out.push('## Documentation');
  out.push('');
  for (const l of docLinks) out.push(renderLink(l));
  out.push('');
  out.push(`## Core standards (${standards.length})`);
  out.push('');
  for (const l of standards) out.push(renderLink(l));
  out.push('');
  out.push(`## Skills (${skills.length})`);
  out.push('');
  for (const l of skills) out.push(renderLink(l));
  out.push('');
  out.push(`## AI agent integrations (${integrations.length})`);
  out.push('');
  for (const l of integrations) out.push(renderLink(l));
  out.push('');
  out.push('## Optional');
  out.push('');
  for (const l of optional) out.push(renderLink(l));
  out.push('');

  return {
    content: out.join('\n'),
    stats: {
      standards: standards.length,
      skills: skills.length,
      integrations: integrations.length,
      docLinks: docLinks.length,
      deduped: dropped,
      staleSkillEntries,
      version,
    },
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Self-test
// ───────────────────────────────────────────────────────────────────────────

function selfTest() {
  console.log(`${BLUE}${BOLD}Self-test — does --check actually go red?${NC}`);
  console.log(`${DIM}A gate that has never failed is indistinguishable from one that cannot.${NC}\n`);

  let failures = 0;
  const report = (ok, name, got) => {
    console.log(
      `  ${ok ? `${GREEN}[FIRED]${NC}` : `${RED}[DID NOT FIRE]${NC}`} ${name}\n          ${DIM}${got}${NC}`
    );
    if (!ok) failures++;
  };

  const hadFile = existsSync(OUTPUT_PATH);
  const original = hadFile ? readFileSync(OUTPUT_PATH, 'utf8') : null;

  try {
    const { content } = render();

    // Arm 0 — green. Written content must compare identical to itself.
    writeFileSync(OUTPUT_PATH, content);
    report(
      compare(content, readFileSync(OUTPUT_PATH, 'utf8')).identical,
      'freshly generated file compares identical',
      'no differing line'
    );

    // Arm 1 — one byte changed. The commonest real drift is a hand edit.
    writeFileSync(OUTPUT_PATH, content + 'x');
    const d1 = compare(content, readFileSync(OUTPUT_PATH, 'utf8'));
    report(!d1.identical, 'one byte appended → drift detected', d1.firstDiff ?? 'none');

    // Arm 2 — a line edited in the middle, not at the end.
    const lines = content.split('\n');
    const idx = lines.findIndex((l) => l.startsWith('## Core standards'));
    const mutated = [...lines];
    mutated[idx] = '## Core standards (9999)';
    writeFileSync(OUTPUT_PATH, mutated.join('\n'));
    const d2 = compare(content, readFileSync(OUTPUT_PATH, 'utf8'));
    report(
      !d2.identical && d2.firstDiff?.includes('9999'),
      'a count edited by hand → drift detected and the line named',
      d2.firstDiff ?? 'none'
    );

    // Arm 3 — file deleted. Missing must be a failure, not a skip.
    unlinkSync(OUTPUT_PATH);
    let missingIsFailure = false;
    try {
      missingIsFailure = runCheck(content) === 1;
    } catch {
      missingIsFailure = false;
    }
    report(missingIsFailure, 'llms.txt deleted → --check returns 1, not 0', `${missingIsFailure}`);

    // Arm 4 — dedupe actually collapses the PR #179 collision.
    const collision = dedupeLinks([
      { title: 'Repository', url: 'https://github.com/AsiaOstrich/universal-dev-standards' },
      { title: 'Homepage/Docs', url: 'https://github.com/AsiaOstrich/universal-dev-standards#readme' },
    ]);
    report(
      collision.links.length === 1 && collision.dropped.length === 1,
      'the PR #179 collision (repo URL vs repo URL#readme) collapses to one entry',
      `${collision.links.length} kept, ${collision.dropped.length} dropped`
    );

    // Arm 5 — unknown flag is rejected rather than ignored.
    let rejected = false;
    try {
      parseArgs(['--not-a-real-flag']);
    } catch (e) {
      rejected = e instanceof Unrenderable;
    }
    report(rejected, 'unknown flag → rejected (exit 2), not silently ignored', `${rejected}`);
  } catch (e) {
    console.log(`\n${RED}Self-test could not run: ${e.message}${NC}`);
    return 2;
  } finally {
    if (original !== null) writeFileSync(OUTPUT_PATH, original);
    else if (existsSync(OUTPUT_PATH)) unlinkSync(OUTPUT_PATH);
  }

  console.log('');
  if (failures > 0) {
    console.log(`${RED}${BOLD}✗ ${failures} arm(s) did not behave as required.${NC}\n`);
    return 1;
  }
  console.log(`${GREEN}${BOLD}✓ All 6 arms behaved as required — 1 green, 3 drift reds, 1 dedupe, 1 flag rejection.${NC}\n`);
  return 0;
}

/** First differing line between expected and actual, for a message that names it. */
function compare(expected, actual) {
  if (expected === actual) return { identical: true, firstDiff: null };
  const e = expected.split('\n');
  const a = actual.split('\n');
  for (let i = 0; i < Math.max(e.length, a.length); i++) {
    if (e[i] !== a[i]) {
      return {
        identical: false,
        firstDiff:
          `line ${i + 1}\n    expected: ${JSON.stringify(e[i] ?? '<end of file>')}\n` +
          `    committed: ${JSON.stringify(a[i] ?? '<end of file>')}`,
      };
    }
  }
  return { identical: false, firstDiff: 'files differ in trailing content only' };
}

function runCheck(content) {
  if (!existsSync(OUTPUT_PATH)) return 1;
  return compare(content, readFileSync(OUTPUT_PATH, 'utf8')).identical ? 0 : 1;
}

// ───────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`\n${RED}${BOLD}✗ Could not render.${NC}\n${RED}${e.message}${NC}\n`);
    return 2;
  }

  if (opts.selfTest) return selfTest();

  let rendered;
  try {
    rendered = render();
  } catch (e) {
    if (e instanceof Unrenderable) {
      console.error(`\n${RED}${BOLD}✗ Could not render llms.txt.${NC}`);
      console.error(`${RED}${e.message}${NC}`);
      console.error(
        `${YELLOW}This is exit 2, not exit 0. Nothing was checked; do not read this as a pass.${NC}\n`
      );
      return 2;
    }
    throw e;
  }

  const { content, stats } = rendered;

  if (opts.stdout) {
    process.stdout.write(content);
    return 0;
  }

  const summary =
    `${stats.standards} standards, ${stats.skills} skills, ${stats.integrations} integrations, ` +
    `${stats.docLinks} doc links (${stats.deduped.length} deduped), v${stats.version}`;

  if (opts.check) {
    if (!existsSync(OUTPUT_PATH)) {
      console.error(`\n${RED}${BOLD}✗ llms.txt does not exist.${NC}`);
      console.error(`${YELLOW}Run: npm run docs:llms-txt${NC}\n`);
      return 1;
    }
    const diff = compare(content, readFileSync(OUTPUT_PATH, 'utf8'));
    if (!diff.identical) {
      console.error(`\n${RED}${BOLD}✗ llms.txt has drifted from its sources.${NC}`);
      console.error(`${RED}  First difference at ${diff.firstDiff}${NC}`);
      console.error(
        `\n${YELLOW}Run: npm run docs:llms-txt${NC}\n` +
          `${DIM}If this appeared right after a version bump, that is the intended behaviour —${NC}\n` +
          `${DIM}the file carries the version, so bumping it is a real change to this file.${NC}\n`
      );
      return 1;
    }
    console.log(`${GREEN}✓ llms.txt matches its sources${NC} ${DIM}(${summary})${NC}`);
    reportSideFindings(stats);
    return 0;
  }

  writeFileSync(OUTPUT_PATH, content);
  console.log(`${GREEN}✓ Wrote llms.txt${NC} ${DIM}(${summary})${NC}`);
  for (const d of stats.deduped) {
    console.log(`  ${DIM}deduped: "${d.title}" → same page as "${d.collidesWith}" (${d.url})${NC}`);
  }
  reportSideFindings(stats);
  return 0;
}

/** Things noticed while rendering that are not this script's to fix. */
function reportSideFindings(stats) {
  if (stats.staleSkillEntries.length > 0) {
    console.log(
      `  ${YELLOW}note:${NC} uds-manifest.json lists ${stats.staleSkillEntries.length} skill id(s) ` +
        `with no skills/<id>/SKILL.md, so they are not listed here:`
    );
    console.log(`    ${DIM}${stats.staleSkillEntries.join(', ')}${NC}`);
    console.log(
      `    ${DIM}Generating from the manifest instead would emit that many dead links.${NC}`
    );
  }
}

try {
  process.exit(main());
} catch (e) {
  console.error(`${RED}Internal error: ${e.stack ?? e}${NC}`);
  process.exit(2);
}
