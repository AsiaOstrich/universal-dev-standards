/**
 * E2E: `uds mcp serve` answers tool calls that read the files UDS ships (dev-platform XSPEC-471 R4).
 *
 * `get_design_standards` reads `ai/standards/frontend-design-standards.ai.yaml` and `get_design_token` falls back to
 * `templates/DESIGN.md`, both from the folder that holds what UDS ships. That folder was computed four levels above
 * `cli/src/mcp/`, which is outside the repository (and outside an installed package), so both tools answered with ENOENT
 * in every installation. The unit tests of the server replace the file system, so they never saw it.
 *
 * Every test starts the real CLI (`node cli/bin/uds.js mcp serve`), writes JSON-RPC lines to its stdin and reads the
 * answers back from its stdout. The server ends by itself when its input ends.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/mcp/server.js   this.udsRepoRoot = options.udsRepoRoot || resolveUdsRepoRoot();
 */

import { it, expect, afterAll } from 'vitest';
import { spawn } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync, realpathSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

const BIN = resolve(import.meta.dirname, '../../bin/uds.js');
const dirs = [];
const newDir = () => {
  const d = realpathSync(mkdtempSync(join(tmpdir(), 'uds-mcp-')));
  dirs.push(d);
  return d;
};
afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

/** Start `uds mcp serve`, send each request as one line, close stdin, return the answers by id. */
function serve(requests, cwd) {
  return new Promise((done, fail) => {
    const home = newDir();
    const proc = spawn(process.execPath, [BIN, 'mcp', 'serve'], {
      cwd,
      env: { ...isolatedEnv(home, process.env), UDS_NO_UPDATE_CHECK: '1', FORCE_COLOR: '0' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d; });
    proc.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => { proc.kill('SIGKILL'); fail(new Error(`mcp serve did not end after its input ended\n${stdout}\n${stderr}`)); }, 60000);
    proc.on('close', (code) => {
      clearTimeout(timer);
      const answers = {};
      for (const line of stdout.split('\n').filter(Boolean)) {
        const msg = JSON.parse(line);
        answers[msg.id] = msg;
      }
      done({ code, answers, stderr });
    });
    proc.stdin.end(`${requests.map((r) => JSON.stringify(r)).join('\n')}\n`);
  });
}

const call = (id, name, args = {}) => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } });
const textOf = (answer) => answer.result.content[0].text;

it('uds mcp serve answers initialize and lists the three design tools', async () => {
  const { code, answers, stderr } = await serve([
    { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} },
    { jsonrpc: '2.0', id: 2, method: 'tools/list' },
  ], newDir());
  expect(code).toBe(0);
  expect(answers[1].result.serverInfo.name).toBe('uds-design-standards');
  expect(answers[2].result.tools.map((t) => t.name).sort()).toEqual(['get_design_standards', 'get_design_token', 'validate_design_token']);
  expect(stderr).toContain('UDS MCP Design Standards Server started');
});

it('uds mcp serve get_design_standards returns the shipped frontend design standard, not ENOENT', async () => {
  const { answers } = await serve([call(1, 'get_design_standards')], newDir());
  expect(answers[1].error, JSON.stringify(answers[1])).toBeUndefined();
  expect(textOf(answers[1])).toContain('id: frontend-design-standards');
});

it('uds mcp serve get_design_token returns the shipped DESIGN.md template when the project has none, and the project\'s own file when it has one', async () => {
  const bare = newDir();
  const withFile = newDir();
  writeFileSync(join(withFile, 'DESIGN.md'), '# DESIGN.md — acme\n\nPALETTE-MARKER-4471\n');
  const { answers } = await serve([
    call(1, 'get_design_token', { project_path: bare }),
    call(2, 'get_design_token', { project_path: withFile }),
  ], newDir());
  expect(answers[1].error, JSON.stringify(answers[1])).toBeUndefined();
  expect(textOf(answers[1])).toContain('This is the UDS DESIGN.md template');
  expect(textOf(answers[1])).toContain('DESIGN.md');
  expect(answers[2].error).toBeUndefined();
  expect(textOf(answers[2])).toContain('PALETTE-MARKER-4471');
  expect(textOf(answers[2])).not.toContain('This is the UDS DESIGN.md template');
});

it('uds mcp serve validate_design_token names the sections a DESIGN.md lacks', async () => {
  const dir = newDir();
  writeFileSync(join(dir, 'DESIGN.md'), '# DESIGN.md\n\n## Visual Theme\n\n## Typography\n\nversion 1\n');
  const { answers } = await serve([call(1, 'validate_design_token', { design_md_path: join(dir, 'DESIGN.md') })], dir);
  const verdict = JSON.parse(textOf(answers[1]));
  expect(verdict.valid).toBe(false);
  expect(verdict.missing_sections).toEqual(['color-palette', 'component-styling', 'layout-spacing', 'design-guidelines']);
});
