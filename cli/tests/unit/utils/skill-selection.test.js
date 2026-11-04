/**
 * Unit tests for the one function that decides which skills a project gets (issue #298).
 *
 * The e2e file (`tests/e2e/optional-skills-298.test.js`) proves the product entry; these pin the rules of
 * the function itself and its two callers (the installer and the reconciler's desired state), with the
 * expected sets written out by hand.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { selectSkillNames, resolveSkillName, isOptionalSkill, OPTIONAL_SKILLS, readSkillChoices } from '../../../src/utils/skill-selection.js';
import { installSkillsToMultipleAgents, getAvailableSkillNames } from '../../../src/utils/skills-installer.js';

const SHIPPED = ['commit-standards', 'open-work-assistant', 'tdd-assistant'];

describe('selectSkillNames', () => {
  it('drops the optional skill when the project chose nothing (and when it has no manifest)', () => {
    expect(selectSkillNames({ shipped: SHIPPED })).toEqual(['commit-standards', 'tdd-assistant']);
    expect(selectSkillNames({ shipped: SHIPPED, manifest: { skills: {} } })).toEqual(['commit-standards', 'tdd-assistant']);
  });

  it('keeps the optional skill the project asked for', () => {
    const manifest = { skills: { extra: ['open-work-assistant'] } };
    expect(selectSkillNames({ shipped: SHIPPED, manifest })).toEqual(SHIPPED);
  });

  it('drops any skill the project excluded, optional or not, and exclusion beats extra', () => {
    expect(selectSkillNames({ shipped: SHIPPED, manifest: { skills: { excluded: ['commit-standards'] } } }))
      .toEqual(['tdd-assistant']);
    expect(selectSkillNames({ shipped: SHIPPED, manifest: { skills: { extra: ['open-work-assistant'], excluded: ['open-work-assistant'] } } }))
      .toEqual(['commit-standards', 'tdd-assistant']);
  });

  it('ignores names it does not ship and values that are not names', () => {
    const manifest = { skills: { extra: ['no-such-skill', 7, null], excluded: 'commit-standards' } };
    expect(selectSkillNames({ shipped: SHIPPED, manifest })).toEqual(['commit-standards', 'tdd-assistant']);
    expect(readSkillChoices(manifest).excluded.size).toBe(0); // a string is not a list
  });
});

describe('resolveSkillName', () => {
  it('takes the folder name or the skill name', () => {
    const shipped = getAvailableSkillNames();
    expect(resolveSkillName('open-work-assistant', shipped)).toEqual({ folder: 'open-work-assistant' });
    expect(resolveSkillName('open-work', shipped)).toEqual({ folder: 'open-work-assistant' });
    expect(resolveSkillName('commit', shipped)).toEqual({ folder: 'commit-standards' });
    expect(resolveSkillName('  tdd  ', shipped)).toEqual({ folder: 'tdd-assistant' });
  });

  it('refuses an unknown name and lists the ones that work', () => {
    const shipped = getAvailableSkillNames();
    const res = resolveSkillName('nope', shipped);
    expect(res.error).toBe('unknown');
    expect(res.available).toContain('open-work (open-work-assistant)');
    expect(res.available).toContain('plan'); // a skill whose name equals its folder is listed once, bare
  });
});

describe('the optional list', () => {
  it('names only skills that exist, and starts with open-work-assistant', () => {
    expect(Object.keys(OPTIONAL_SKILLS)).toEqual(['open-work-assistant']);
    expect(getAvailableSkillNames()).toContain('open-work-assistant');
    expect(isOptionalSkill('open-work-assistant')).toBe(true);
    expect(isOptionalSkill('commit-standards')).toBe(false);
    expect(isOptionalSkill('toString')).toBe(false); // not an inherited property
  });
});

describe('the installer asks the same function (skillNames = null)', () => {
  let project;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'uds-test-298-unit-'));
    mkdirSync(join(project, '.standards'), { recursive: true });
  });

  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
  });

  const writeChoices = (skills) => writeFileSync(join(project, '.standards', 'manifest.json'), JSON.stringify({
    version: '3.5.0',
    upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '0.0.1', installed: '2026-01-01' },
    format: 'ai',
    contentMode: 'index',
    standards: [],
    extensions: [],
    skills: { installed: true, installations: [{ agent: 'claude-code', level: 'project' }], ...skills }
  }));
  const skillDir = (folder) => join(project, '.claude', 'skills', folder);

  it('installs the default set: everything shipped except the optional skill', async () => {
    const result = await installSkillsToMultipleAgents([{ agent: 'claude-code', level: 'project' }], null, project, 'en');
    expect(result.success).toBe(true);
    expect(existsSync(skillDir('commit-standards'))).toBe(true);
    expect(existsSync(skillDir('open-work-assistant'))).toBe(false);
  });

  it('honours the manifest on disk: the excluded skill is not written, the extra optional one is', async () => {
    writeChoices({ extra: ['open-work-assistant'], excluded: ['commit-standards'] });
    await installSkillsToMultipleAgents([{ agent: 'claude-code', level: 'project' }], null, project, 'en');
    expect(existsSync(skillDir('commit-standards'))).toBe(false);
    expect(existsSync(skillDir('open-work-assistant'))).toBe(true);
  });

  it('an explicit list is installed as given (the reconciler passes the set its plan chose)', async () => {
    writeChoices({ excluded: ['commit-standards'] });
    await installSkillsToMultipleAgents([{ agent: 'claude-code', level: 'project' }], ['commit-standards'], project, 'en');
    expect(existsSync(skillDir('commit-standards'))).toBe(true);
  });

  it('keeps updating an optional skill that is already in the folder', async () => {
    mkdirSync(skillDir('open-work-assistant'), { recursive: true });
    writeFileSync(join(skillDir('open-work-assistant'), 'SKILL.md'), '---\nname: open-work\n---\nold text\n');
    await installSkillsToMultipleAgents([{ agent: 'claude-code', level: 'project' }], null, project, 'en');
    expect(readFileSync(join(skillDir('open-work-assistant'), 'SKILL.md'), 'utf8')).not.toContain('old text');
  });
});
