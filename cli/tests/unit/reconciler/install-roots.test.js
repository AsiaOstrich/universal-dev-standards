/**
 * XSPEC-454 R1 — what a --skills / --commands step backs up: what UDS ships, in the project, and nothing else.
 */

import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { installRoots, stepWritePaths } from '../../../src/reconciler/install-roots.js';
import { getAvailableSkillNames, getAvailableCommandNames } from '../../../src/utils/skills-installer.js';

const project = join(process.cwd(), 'tmp-project-for-install-roots');

describe('install-roots', () => {
  it('lists each project-level skills folder as a directory and the user-level one as outside the project', () => {
    const { dirs, outside } = installRoots(project, [{ agent: 'claude-code', level: 'project' }, { agent: 'opencode', level: 'user' }], 'skills');
    expect(dirs).toEqual(['.claude/skills']);
    expect(outside).toHaveLength(1);
    expect(outside[0].reason).toMatch(/shared by every project/);
  });

  it('skips marketplace installs (nothing on disk) and accepts plain agent names', () => {
    expect(installRoots(project, [{ agent: 'claude-code', level: 'marketplace' }], 'skills').dirs).toEqual([]);
    expect(installRoots(project, ['opencode'], 'commands').dirs).toEqual(['.opencode/command']);
  });

  it('backs up the shipped skill folders and the bookkeeping file, not the folder as a whole, so an adopter\'s own skill is never written back', () => {
    const { paths } = stepWritePaths(project, [{ agent: 'claude-code', level: 'project' }], 'skills');
    expect(paths).toContain('.claude/skills/.manifest.json');
    expect(paths).not.toContain('.claude/skills');
    const shipped = getAvailableSkillNames();
    expect(shipped.length).toBeGreaterThan(20);
    for (const name of shipped) expect(paths).toContain(`.claude/skills/${name}`);
    expect(paths.filter((p) => p.includes('my-own'))).toEqual([]);
    expect(paths).toHaveLength(shipped.length + 1);
  });

  it('does the same for commands: one path per shipped command file', () => {
    const { paths } = stepWritePaths(project, [{ agent: 'opencode', level: 'project' }], 'commands');
    const shipped = getAvailableCommandNames();
    expect(shipped.length).toBeGreaterThan(20);
    expect(paths).toContain('.opencode/command/.manifest.json');
    for (const name of shipped) expect(paths).toContain(`.opencode/command/${name}.md`);
  });
});
