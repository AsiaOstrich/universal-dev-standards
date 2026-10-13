/**
 * MCP server: ping, and a failed tool answered as an isError result (XSPEC-482 R14c).
 */
import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { tmpdir } from 'os';
import { McpServer } from '../../../src/mcp/server.js';

const server = new McpServer({ udsRepoRoot: join(tmpdir(), 'uds-test-no-such-root') });

describe('McpServer', () => {
  it('answers ping with an empty result and no error', () => {
    expect(server.handleRequest({ jsonrpc: '2.0', id: 7, method: 'ping' })).toEqual({ jsonrpc: '2.0', id: 7, result: {} });
  });

  it('a tool that throws answers a result with isError and the reason, not a JSON-RPC error', () => {
    const res = server.handleRequest({ jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'get_design_standards', arguments: {} } });
    expect(res.error).toBeUndefined();
    expect(res.result.isError).toBe(true);
    expect(res.result.content[0].type).toBe('text');
    expect(res.result.content[0].text).toContain('ENOENT');
  });

  it('an unknown tool and an unknown method are still protocol errors, and a notification still gets no answer', () => {
    expect(server.handleRequest({ jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name: 'nope' } }).error.code).toBe(-32601);
    expect(server.handleRequest({ jsonrpc: '2.0', id: 10, method: 'nope' }).error.code).toBe(-32601);
    expect(server.handleRequest({ jsonrpc: '2.0', method: 'notifications/initialized' })).toBeNull();
  });
});
