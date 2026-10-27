// check-logging-standard.mjs as Claude Code runs it: a PostToolUse/Write hook that gets
// the payload on stdin. Claude Code shows a PostToolUse hook's stderr to the model only
// on exit 2; the hook used to exit 1, a non-blocking hook error the model never sees.
//
// Every case spawns the real script with the payload shape Claude Code sends and reads
// back the exit code and stderr.

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const SCRIPT = join(import.meta.dirname, '..', '..', '..', '..', 'scripts', 'hooks', 'check-logging-standard.mjs');

const run = (stdin, argv = []) => {
  const r = spawnSync(process.execPath, [SCRIPT, ...argv], { input: stdin, encoding: 'utf8', timeout: 10000 });
  return { status: r.status, stderr: r.stderr };
};

const write = (content, extra = {}) =>
  JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: 'src/a.ts', content, ...extra } });

describe('check-logging-standard as a Claude Code PostToolUse hook', () => {
  it('console.log in the written content: exit 2 and the message reaches stderr', () => {
    const r = run(write('console.log("debug");'));
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('Unstructured logging detected');
  });

  it('console.log in the new_string of an Edit: exit 2', () => {
    const stdin = JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: 'src/a.ts', old_string: 'x', new_string: 'console.warn("w");' } });
    expect(run(stdin).status).toBe(2);
  });

  it('structured logging: exit 0, silent', () => {
    const r = run(write('logger.info({ event: "startup" });'));
    expect(r.status).toBe(0);
    expect(r.stderr).toBe('');
  });

  it('console.log only in another payload field: exit 0 (the written content is what is judged)', () => {
    const r = run(write('const x = 1;', { old_string: 'console.log("old")' }));
    expect(r.status).toBe(0);
  });

  it('raw code on stdin and in argv are judged as the code', () => {
    expect(run('console.log("x")').status).toBe(2);
    expect(run('', ['console.log("x")']).status).toBe(2);
    expect(run('const x = 1;').status).toBe(0);
  });

  it('empty stdin: exit 0', () => {
    expect(run('').status).toBe(0);
  });
});
