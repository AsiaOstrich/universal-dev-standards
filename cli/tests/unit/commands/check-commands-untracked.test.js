/**
 * P1 (second half) — "all intact" must be measured against what is installed.
 *
 * `checkCommandsIntegrity` walked `commandHashes` only. When the manifest lost
 * 48 of 51 entries (see tests/unit/reconciler/command-hashes-preserved.test.js)
 * it reported "✓ All command files intact (3 files)" while the same `uds check`
 * run printed "Commands: 51 installed" from a directory listing. Two numbers
 * measured from two sources, never compared — so the failure looked like a pass.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { checkCommandsIntegrity } from '../../../src/commands/check.js';
import { computeFileHash } from '../../../src/utils/hasher.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DIR = join(__dirname, '../../temp/check-commands-untracked');
const msg = {};

describe('P1: check notices commands that nothing tracks', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.opencode/command'), { recursive: true });
    for (const name of ['tracked', 'untracked-a', 'untracked-b']) {
      writeFileSync(join(TEST_DIR, '.opencode/command', `${name}.md`), `# ${name}\n`);
    }
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  const manifestTracking = (names) => ({
    commands: { installed: true, installations: [{ agent: 'opencode', level: 'project' }] },
    commandHashes: Object.fromEntries(
      names.map(n => [`opencode/${n}.md`, computeFileHash(join(TEST_DIR, '.opencode/command', `${n}.md`))])
    )
  });

  it('reports the installed files that no hash covers', () => {
    const status = checkCommandsIntegrity(manifestTracking(['tracked']), TEST_DIR, msg);

    expect(status.unchanged).toEqual(['opencode/tracked.md']);
    expect(status.untracked.sort()).toEqual(['opencode/untracked-a.md', 'opencode/untracked-b.md']);
  });

  it('says nothing about untracked files when every installed command is tracked', () => {
    const status = checkCommandsIntegrity(
      manifestTracking(['tracked', 'untracked-a', 'untracked-b']),
      TEST_DIR,
      msg
    );

    expect(status.untracked).toEqual([]);
    expect(status.unchanged).toHaveLength(3);
  });
});
