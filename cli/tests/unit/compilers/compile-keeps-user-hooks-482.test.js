/**
 * compileStandards merges into .claude/settings.json instead of replacing, writes the documented string matcher, and
 * leaves out a standard whose hook script is not in the project (XSPEC-482 R4).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { compileStandards } from '../../../src/commands/compile.js';
import { ClaudeCodeCompiler } from '../../../src/compilers/claude-code-compiler.js';

let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'uds-test-compile-'));
  mkdirSync(join(dir, '.standards'), { recursive: true });
  mkdirSync(join(dir, '.claude'), { recursive: true });
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const standard = (id, enforcement) => writeFileSync(join(dir, '.standards', `${id}.ai.yaml`), `standard:\n  id: ${id}\nenforcement:\n${enforcement}\n`);
const script = (rel) => { mkdirSync(join(dir, 'scripts', 'hooks'), { recursive: true }); writeFileSync(join(dir, rel), '// hook\n'); };
const settings = () => JSON.parse(readFileSync(join(dir, '.claude', 'settings.json'), 'utf-8'));

describe('the compiler writes the string matcher Claude Code documents', () => {
  it('an object matcher is reduced to its tool name', () => {
    const { hooks } = new ClaudeCodeCompiler().compile([
      { id: 'logging', enforcement: { hook_script: 'scripts/hooks/a.mjs', trigger: 'PostToolUse', matcher: { tool: 'Write', path: 'src/**/*.ts' } } },
      { id: 'sec', enforcement: { hook_script: 'scripts/hooks/b.mjs', trigger: 'PreToolUse', matcher: { tool: 'Bash' } } },
      { id: 'commit', enforcement: { hook_script: 'scripts/hooks/c.mjs', trigger: 'PreToolUse', matcher: 'Bash' } },
      { id: 'stop', enforcement: { hook_script: 'scripts/hooks/d.mjs', trigger: 'Stop', matcher: '' } }
    ]);
    expect(hooks.PostToolUse[0].matcher).toBe('Write');
    expect(hooks.PreToolUse.map((e) => e.matcher)).toEqual(['Bash', 'Bash']);
    expect(hooks.Stop[0].matcher).toBe('');
  });
});

describe('compileStandards into an existing settings.json', () => {
  it("keeps the user's own hooks, on the same event and on others", () => {
    standard('security', '  hook_script: scripts/hooks/check-dangerous-cmd.mjs\n  trigger: PreToolUse\n  matcher: Bash');
    script('scripts/hooks/check-dangerous-cmd.mjs');
    const mine = { matcher: 'Edit', hooks: [{ type: 'command', command: 'echo mine' }] };
    const mineBash = { matcher: 'Bash', hooks: [{ type: 'command', command: 'echo mine-bash' }] };
    writeFileSync(join(dir, '.claude', 'settings.json'), JSON.stringify({ hooks: { PreToolUse: [mine, mineBash], SessionStart: [mine] }, permissions: { allow: ['Bash(ls)'] } }));

    const r = compileStandards(dir, { target: 'claude-code' });
    expect(r).toMatchObject({ success: true, compiledCount: 1 });
    const s = settings();
    expect(s.hooks.PreToolUse).toContainEqual(mine);
    expect(s.hooks.PreToolUse).toContainEqual(mineBash);
    expect(s.hooks.PreToolUse).toContainEqual({ matcher: 'Bash', hooks: [{ type: 'command', command: 'node scripts/hooks/check-dangerous-cmd.mjs' }] });
    expect(s.hooks.SessionStart).toEqual([mine]);
    expect(s.permissions).toEqual({ allow: ['Bash(ls)'] });
  });

  it('compiling twice writes the UDS entry once', () => {
    standard('security', '  hook_script: scripts/hooks/check-dangerous-cmd.mjs\n  trigger: PreToolUse\n  matcher: Bash');
    script('scripts/hooks/check-dangerous-cmd.mjs');
    compileStandards(dir, { target: 'claude-code' });
    compileStandards(dir, { target: 'claude-code' });
    expect(settings().hooks.PreToolUse).toHaveLength(1);
  });

  it('an entry an earlier compile wrote with an object matcher becomes the string form, not a second entry', () => {
    standard('security', '  hook_script: scripts/hooks/check-dangerous-cmd.mjs\n  trigger: PreToolUse\n  matcher:\n    tool: Bash');
    script('scripts/hooks/check-dangerous-cmd.mjs');
    writeFileSync(join(dir, '.claude', 'settings.json'), JSON.stringify({ hooks: { PreToolUse: [{ matcher: { tool: 'Bash' }, hooks: [{ type: 'command', command: 'node scripts/hooks/check-dangerous-cmd.mjs' }] }] } }));
    compileStandards(dir, { target: 'claude-code' });
    expect(settings().hooks.PreToolUse).toEqual([{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node scripts/hooks/check-dangerous-cmd.mjs' }] }]);
  });

  it('a standard whose hook script is not in the project is left out, named, and writes no settings entry', () => {
    standard('security', '  hook_script: scripts/hooks/check-dangerous-cmd.mjs\n  trigger: PreToolUse\n  matcher: Bash');
    const r = compileStandards(dir, { target: 'claude-code' });
    expect(r.compiledCount).toBe(0);
    expect(r.skipped).toEqual([{ id: 'security', why: 'hook script not found: scripts/hooks/check-dangerous-cmd.mjs' }]);
    expect(existsSync(join(dir, '.claude', 'settings.json'))).toBe(false);
  });
});
