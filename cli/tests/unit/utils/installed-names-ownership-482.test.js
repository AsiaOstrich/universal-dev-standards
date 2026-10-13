/**
 * The ownership-only name test the "Everything is up to date" branch of `uds update --apply` relies on (XSPEC-456 R4 kept
 * through XSPEC-482 R6): no disk test, so a project with no skills folder at all still loses the names UDS cannot vouch for.
 */
import { describe, it, expect } from 'vitest';
import { pruneForeignSkillNames, pruneForeignCommandNames } from '../../../src/utils/installed-names-ownership.js';

const shipped = (n, prefix) => new Set(Array.from({ length: n }, (_, i) => `${prefix}${i}`));

describe('pruneForeignSkillNames without a disk test', () => {
  it('drops a name UDS does not ship and `_shared`, keeps every shipped name, and returns what it dropped sorted', () => {
    const real = shipped(60, 'skill-');
    const manifest = { skills: { names: ['skill-3', '_shared', 'retired-skill', 'skill-1'] } };
    expect(pruneForeignSkillNames(manifest, '', { shipped: real })).toEqual(['_shared', 'retired-skill']);
    expect(manifest.skills.names).toEqual(['skill-3', 'skill-1']);
  });

  it('writes nothing and returns [] when every name is shipped', () => {
    const real = shipped(60, 'skill-');
    const manifest = { skills: { names: ['skill-2', 'skill-9'] } };
    expect(pruneForeignSkillNames(manifest, '', { shipped: real })).toEqual([]);
    expect(manifest.skills.names).toEqual(['skill-2', 'skill-9']);
  });

  it('does nothing when the shipped list looks unreadable (a handful of names), instead of dropping everything', () => {
    const manifest = { skills: { names: ['skill-1', 'x'] } };
    expect(pruneForeignSkillNames(manifest, '', { shipped: new Set(['skill-1']) })).toEqual([]);
    expect(manifest.skills.names).toEqual(['skill-1', 'x']);
  });
});

describe('pruneForeignCommandNames without a disk test', () => {
  it('drops a command UDS does not ship and keeps the rest', () => {
    const real = shipped(40, 'cmd-');
    const manifest = { commands: { names: ['cmd-1', 'retired-command'] } };
    expect(pruneForeignCommandNames(manifest, '', { shipped: real })).toEqual(['retired-command']);
    expect(manifest.commands.names).toEqual(['cmd-1']);
  });
});
