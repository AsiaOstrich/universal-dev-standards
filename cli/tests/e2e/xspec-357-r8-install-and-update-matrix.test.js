/**
 * E2E: XSPEC-357 R8 compatibility matrix, cells 1 (install) and 5 (after update).
 *
 * README says UDS supports 11 AI tools. This file turns two of the five things R8 asks of each tool into evidence a
 * maintainer can re-run:
 *
 *   1 install   `uds init` writes the UDS standards block into the file that tool reads, and that block names
 *                 standards that really are on disk. Read back from the file, not "the file exists".
 *   5 update    on a project set up by an older UDS (older version marker, and a block that predates a standard),
 *                 `uds update` brings the block back, keeps the adopter's own lines, and advances the version marker.
 *
 * The other three cells are not here: 2 needs the P7 probe, 3 needs the tool installed, and 4 is only partly covered
 * (xspec-357-r8-violation-detected.test.js).
 *
 * How a tool is chosen: `uds init --yes` selects tools by what it finds in the project, so each test plants the
 * marker a real adopter of that tool already has (their own rules file, with a line of their own in it). Planting a
 * file with only the adopter's line means "the file exists" is true before init runs: only the UDS block, which
 * init writes, can make the assertions pass.
 *
 * Expected file names and block markers are written out below, not imported from the CLI. A table read from the code
 * it checks would pass when the code is wrong in the same way.
 *
 * Wires that make these red when cut (one line of CLI source each; see the report for the measured run):
 *   cli/src/utils/integration-generator.js   writeFileSync(filePath, content);          (writeIntegrationFile: the block is never written)
 *   cli/src/commands/init.js                 const generateAgentsMd / generateAgentsMd  (the universal AGENTS.md: Aider)
 *   cli/src/commands/update.js               "Syncing integration files..." step       (the update never refreshes the block)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, mkdir } from 'fs/promises';
import {
  runNonInteractive,
  runCommand,
  createTempDir,
  cleanupTempDir,
  setupTestDir,
  fileExists
} from '../utils/cli-runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(__dirname, '../../../integrations/REGISTRY.json');

const BLOCK = {
  markdown: ['<!-- UDS:STANDARDS:START -->', '<!-- UDS:STANDARDS:END -->'],
  plaintext: ['# === UDS:STANDARDS:START ===', '# === UDS:STANDARDS:END ===']
};
const USER_LINE = 'MY OWN TEAM RULE: keep this line';
const OLD_VERSION = '5.0.0';
const NEWER_STANDARD = '.standards/commit-message.ai.yaml';

/**
 * One row per live AI tool in integrations/REGISTRY.json (a guard test below keeps the two lists equal).
 *   plant   files the adopter already has; this is how `uds init --yes` learns which tool is in use
 *   target  the file that tool reads, which must end up holding the UDS block
 *   aiTool  what the manifest must record for it, or null when init cannot name this tool at all
 */
const TOOLS = [
  { id: 'claude-code', plant: ['CLAUDE.md'], target: 'CLAUDE.md', format: 'markdown', aiTool: 'claude-code' },
  { id: 'opencode', plant: ['AGENTS.md'], target: 'AGENTS.md', format: 'markdown', aiTool: 'opencode' },
  { id: 'codex', plant: ['AGENTS.md'], target: 'AGENTS.md', format: 'markdown', aiTool: 'codex' },
  { id: 'cursor', plant: ['.cursorrules'], target: '.cursorrules', format: 'plaintext', aiTool: 'cursor' },
  { id: 'cline', plant: ['.clinerules'], target: '.clinerules', format: 'plaintext', aiTool: 'cline' },
  { id: 'windsurf', plant: ['.windsurfrules'], target: '.windsurfrules', format: 'plaintext', aiTool: 'windsurf' },
  {
    id: 'copilot',
    plant: ['.github/copilot-instructions.md'],
    target: '.github/copilot-instructions.md',
    format: 'markdown',
    aiTool: 'copilot'
  },
  { id: 'antigravity', plant: ['.agents/AGENTS.md'], target: '.agents/AGENTS.md', format: 'markdown', aiTool: 'antigravity' },
  // Roo Code reads a rules folder: the adopter's own rule file is planted, UDS adds its own file beside it.
  {
    id: 'roo-code',
    plant: ['.roo/rules/my-team-rules.md'],
    target: '.roo/rules/uds-standards.md',
    format: 'markdown',
    aiTool: 'roo-code',
    adopterFile: '.roo/rules/my-team-rules.md'
  },
  // Aider has no tool-specific path in `uds init` (it is not detected and not in the tool checklist). The file
  // REGISTRY.json names for it is AGENTS.md, which init writes for every project by default. So this row proves
  // "the file Aider is told to read carries the block", and it cannot prove that Aider support exists in init.
  { id: 'aider', plant: [], target: 'AGENTS.md', format: 'markdown', aiTool: null, universalAgentsMd: true }
];

/** Tools in the registry that `uds init` cannot select. Their cells 1 and 5 cannot be shown; see the pin below. */
const NO_INIT_ENTRY = ['continue-dev'];

/** The live AI assistants in the registry: not SDD tools (tier "tool"), not discontinued. */
async function liveRegistryIds() {
  const registry = JSON.parse(await readFile(REGISTRY, 'utf8'));
  return Object.entries(registry.agents)
    .filter(([, a]) => a.tier !== 'tool' && a.deprecated !== true)
    .map(([id]) => id);
}

async function plant(dir, tool) {
  for (const rel of tool.plant) {
    const full = join(dir, rel);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, `${USER_LINE}\n`);
  }
}

/** A project of an adopter of `tool`, set up by the real `uds init --yes`. */
async function initProject(dir, tool) {
  await setupTestDir(dir, {});
  await plant(dir, tool);
  const init = await runNonInteractive({}, dir, 120000);
  expect(init.timedOut, 'uds init did not finish').toBe(false);
  expect(init.exitCode, `uds init failed:\n${init.stdout}\n${init.stderr}`).toBe(0);
}

const lf = (text) => text.replace(/\r\n/g, '\n');

/** The text between the UDS markers, or null when the file has no complete block. */
function blockOf(content, format) {
  const [start, end] = BLOCK[format];
  const s = content.indexOf(start);
  const e = content.indexOf(end);
  if (s === -1 || e === -1 || e < s) return null;
  return content.slice(s, e + end.length);
}

const standardRefs = (block) => [...new Set(block.match(/\.standards\/[A-Za-z0-9._/-]+\.ai\.yaml/g) || [])];

/**
 * Read the tool's file back and assert what "the standards are installed for this tool" means:
 * a complete UDS block, naming standards, every one of which exists in the project, around the adopter's own text.
 */
async function expectBlockInstalled(dir, tool, why) {
  const full = join(dir, tool.target);
  expect(await fileExists(full), `${why}: ${tool.target} was not written`).toBe(true);
  const content = lf(await readFile(full, 'utf8'));
  const block = blockOf(content, tool.format);
  expect(block, `${why}: ${tool.target} has no complete UDS block (start and end marker)`).not.toBeNull();
  const refs = standardRefs(block);
  expect(refs.length, `${why}: the block in ${tool.target} names no standard`).toBeGreaterThan(0);
  expect(refs, `${why}: the block names the commit-message standard`).toContain(NEWER_STANDARD);
  for (const ref of refs) {
    expect(await fileExists(join(dir, ref)), `${why}: ${tool.target} names ${ref}, which is not in the project`).toBe(true);
  }
  return { content, block, refs };
}

async function readManifest(dir) {
  return JSON.parse(await readFile(join(dir, '.standards/manifest.json'), 'utf8'));
}

describe('XSPEC-357 R8 matrix cells 1 install and 5 after update, from the uds init and uds update entry', () => {
  let dir;

  beforeEach(async () => {
    dir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(dir);
  });

  it('guard: this file has a row for every live tool in integrations/REGISTRY.json, and no row for a tool that is not there', async () => {
    const live = await liveRegistryIds();
    expect(live.length, 'the registry listing itself must work: a count of zero would pass the comparison below').toBeGreaterThan(8);
    const covered = [...TOOLS.map((t) => t.id), ...NO_INIT_ENTRY].sort();
    expect(covered).toEqual([...live].sort());
  });

  describe.each(TOOLS)('$id', (tool) => {
    it(`cell 1 install: uds init writes the UDS block into ${tool.target}, and every standard that block names is on disk`, async () => {
      await initProject(dir, tool);

      const { content } = await expectBlockInstalled(dir, tool, 'after uds init');

      // The adopter's own text is still there: for a file they already had, init merged into it.
      if (tool.plant.length > 0 && !tool.adopterFile) {
        expect(content, 'the adopter\'s own line was kept').toContain(USER_LINE);
      }
      if (tool.adopterFile) {
        expect(await readFile(join(dir, tool.adopterFile), 'utf8'), 'the adopter\'s own rule file was not touched').toContain(USER_LINE);
      }

      // What the CLI recorded about this tool must agree with what is on disk.
      const manifest = await readManifest(dir);
      if (tool.aiTool) {
        expect(manifest.aiTools, 'the manifest records the tool').toContain(tool.aiTool);
      } else {
        expect(manifest.aiTools ?? [], 'init could not name this tool, so the manifest must not claim it').not.toContain(tool.id);
      }
    }, 120000);

    it(`cell 5 after update: on an older install whose block lacks a standard, uds update puts it back in ${tool.target} and keeps the adopter's lines`, async () => {
      await initProject(dir, tool);

      // Make the project look like one an older UDS set up: an older version marker, and a block that predates
      // the commit-message standard. Both are what `uds update` exists to fix.
      const manifestPath = join(dir, '.standards/manifest.json');
      const manifest = await readManifest(dir);
      manifest.upstream = { ...manifest.upstream, version: OLD_VERSION };
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const targetPath = join(dir, tool.target);
      const before = lf(await readFile(targetPath, 'utf8'));
      expect(before, 'fixture: init put the commit-message standard in the block').toContain(NEWER_STANDARD);
      const stale = before.split('\n').filter((line) => !line.includes(NEWER_STANDARD)).join('\n');
      await writeFile(targetPath, stale);
      expect(await readFile(targetPath, 'utf8'), 'fixture: the stale block really lacks it').not.toContain(NEWER_STANDARD);

      const update = await runCommand('update', { yes: true, offline: true }, dir, 120000);
      expect(update.timedOut, 'uds update did not finish').toBe(false);
      expect(update.exitCode, `uds update failed:\n${update.stdout}\n${update.stderr}`).toBe(0);

      const { content } = await expectBlockInstalled(dir, tool, 'after uds update');
      if (tool.plant.length > 0 && !tool.adopterFile) {
        expect(content, 'the adopter\'s own line survived the update').toContain(USER_LINE);
      }
      if (tool.adopterFile) {
        expect(await readFile(join(dir, tool.adopterFile), 'utf8'), 'the adopter\'s own rule file survived the update').toContain(USER_LINE);
      }
      expect((await readManifest(dir)).upstream.version, 'the version marker moved forward').not.toBe(OLD_VERSION);
    }, 180000);
  });

  // Continue.dev is in REGISTRY.json as a live tool, but `uds init` cannot select it: it is not in the tool checklist and
  // detectAITools() has no marker for it. README tells adopters its configuration is `.continue/config.json`; init never
  // writes that. This pins the gap, so the matrix records cells 1 and 5 for it as not verified with this test as the reason.
  // It turns red the day init learns about the tool, which is the moment the matrix cell should be re-recorded.
  describe.each(NO_INIT_ENTRY)('%s', (id) => {
    it('uds init has no entry for this tool: it writes no config of its own for it and the manifest does not name it, so cells 1 and 5 are not verified', async () => {
      await setupTestDir(dir, {});
      await mkdir(join(dir, '.continue'), { recursive: true });
      await writeFile(join(dir, '.continue/config.json'), '{"models": []}\n');
      const init = await runNonInteractive({}, dir, 120000);
      expect(init.exitCode, `${init.stdout}\n${init.stderr}`).toBe(0);

      const manifest = await readManifest(dir);
      expect(manifest.aiTools ?? []).not.toContain(id);
      expect(JSON.parse(await readFile(join(dir, '.continue/config.json'), 'utf8')), 'the adopter\'s own Continue.dev config was left alone').toEqual({ models: [] });
      expect(await fileExists(join(dir, 'continue-dev.md')), 'nothing was written under a made-up name either').toBe(false);
    }, 120000);
  });
});
