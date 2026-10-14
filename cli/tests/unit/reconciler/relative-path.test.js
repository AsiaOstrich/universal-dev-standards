/**
 * XSPEC-486 R4: the skill and command rows of `uds update --plan` and the error list of `--apply` name a file by a
 * project-relative path with `/`, also where the path was built with `\` (Windows). The Windows end-to-end tests that
 * were red on main since 289ff132 expected `.claude/skills/commit-standards` and `.gemini/commands/ac-coverage.toml`.
 * Windows is simulated here by building the path with `path.win32`; the CI run on windows-latest is the real proof.
 */
import { describe, it, expect } from 'vitest';
import path from 'path';
import { readFileSync } from 'fs';
import { projectRelative } from '../../../src/reconciler/relative-path.js';

describe('projectRelative (XSPEC-486 R4)', () => {
  it('a Windows path built with join gives the same text as on POSIX: parts separated by /', () => {
    const project = 'C:\\Users\\RUNNER~1\\AppData\\Local\\Temp\\proj';
    const skill = path.win32.join(project, '.claude', 'skills', 'commit-standards');
    const command = path.win32.join(project, '.gemini', 'commands', 'ac-coverage.toml');
    expect(skill).toContain('\\'); // control: the input really is a backslash path
    expect(projectRelative(project, skill, path.win32)).toBe('.claude/skills/commit-standards');
    expect(projectRelative(project, command, path.win32)).toBe('.gemini/commands/ac-coverage.toml');
  });

  it('a POSIX path is returned as it is', () => {
    expect(projectRelative('/tmp/proj', path.posix.join('/tmp/proj', '.claude', 'skills', 'x'), path.posix)).toBe('.claude/skills/x');
  });

  it('a backslash in a POSIX file name is a character of the name and is kept', () => {
    expect(projectRelative('/tmp/proj', '/tmp/proj/.claude/skills/a\\b', path.posix)).toBe('.claude/skills/a\\b');
  });

  it('a path outside the project is not made relative (a user-level folder stays absolute)', () => {
    expect(projectRelative('/tmp/proj', '/home/u/.claude/skills/x', path.posix)).toBe('/home/u/.claude/skills/x');
    expect(projectRelative('C:\\proj', 'C:\\Users\\u\\.claude\\skills\\x', path.win32)).toBe('C:\\Users\\u\\.claude\\skills\\x');
  });
});

// The two modules that name skill and command files must get their relative paths from the helper above. On macOS and
// Linux a hand-written `slice` gives the same text, so only a look at the source can tell; the windows-latest end-to-end
// job is what runs it for real.
describe('the reconciler names project files through projectRelative (XSPEC-486 R4)', () => {
  for (const file of ['desired-state-calculator.js', 'actual-state-scanner.js']) {
    it(`${file} delegates getRelativePath to projectRelative`, () => {
      const source = readFileSync(new URL(`../../../src/reconciler/${file}`, import.meta.url), 'utf-8');
      expect(source).toMatch(/import \{ projectRelative \} from '\.\/relative-path\.js';/);
      const body = source.match(/function getRelativePath\(projectPath, absPath\) \{([\s\S]*?)\n\}/)[1];
      expect(body).toContain('projectRelative(projectPath, absPath)');
      expect(body).not.toContain('slice');
    });
  }
});
