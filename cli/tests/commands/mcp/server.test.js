/**
 * Tests for UDS MCP Design Standards Server
 * Uses vi.mock('fs') to avoid real filesystem I/O
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock 'fs' module — must be declared before importing the module under test
// ---------------------------------------------------------------------------
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

import { readFileSync, existsSync } from 'fs';
import { McpServer } from '../../../src/mcp/server.js';

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------
const VALID_DESIGN_MD = `
# DESIGN.md — My Project

## 1. Visual Theme & Mood
Theme: Minimal

## 2. Color Palette
Primary: #0070f3

## 3. Typography
Font: Inter

## 4. Component Styling
Border-radius: 4px

## 5. Layout & Spacing
Grid: 8px

## 6. Design Guidelines
Keep it clean.

> **Version**: 1.0.0
`;

const INCOMPLETE_DESIGN_MD = `
# DESIGN.md — Incomplete Project

## 1. Visual Theme & Mood
Theme: Dark
`;

const UDS_TEMPLATE_MD = `# DESIGN.md — [專案名稱] 前端設計規格
> **版本**: 1.0.0
`;

const FRONTEND_STANDARDS_YAML = `id: frontend-design-standards
meta:
  version: "1.0.0"
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeServer() {
  return new McpServer({
    udsRoot: '/fake/project',
    udsRepoRoot: '/fake/uds-repo',
  });
}

function makeRequest(method, params = {}, id = 1) {
  return { jsonrpc: '2.0', id, method, params };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('McpServer', () => {
  let server;

  beforeEach(() => {
    vi.resetAllMocks();
    server = makeServer();
  });

  // -------------------------------------------------------------------------
  // 1. handleInitialize — protocolVersion and serverInfo
  // -------------------------------------------------------------------------
  it('handleInitialize returns correct protocolVersion', () => {
    const req = makeRequest('initialize');
    const res = server.handleInitialize(req);
    expect(res.result.protocolVersion).toBe('2024-11-05');
  });

  // -------------------------------------------------------------------------
  // 2. handleInitialize — capabilities contains tools
  // -------------------------------------------------------------------------
  it('handleInitialize includes tools capability and serverInfo', () => {
    const req = makeRequest('initialize');
    const res = server.handleInitialize(req);
    expect(res.result.capabilities).toHaveProperty('tools');
    expect(res.result.serverInfo.name).toBe('uds-design-standards');
  });

  // -------------------------------------------------------------------------
  // 3. handleToolsList — returns exactly 3 tools
  // -------------------------------------------------------------------------
  it('handleToolsList returns 3 tools with correct names', () => {
    const req = makeRequest('tools/list');
    const res = server.handleToolsList(req);
    expect(res.result.tools).toHaveLength(3);
    const names = res.result.tools.map((t) => t.name);
    expect(names).toContain('get_design_token');
    expect(names).toContain('get_design_standards');
    expect(names).toContain('validate_design_token');
  });

  // -------------------------------------------------------------------------
  // 4. handleToolsList — each tool has name, description, inputSchema
  // -------------------------------------------------------------------------
  it('handleToolsList tools each have name, description, inputSchema', () => {
    const req = makeRequest('tools/list');
    const res = server.handleToolsList(req);
    for (const tool of res.result.tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
    }
  });

  // -------------------------------------------------------------------------
  // 5. get_design_token — returns project DESIGN.md when it exists
  // -------------------------------------------------------------------------
  it('get_design_token returns project DESIGN.md content when file exists', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(VALID_DESIGN_MD);

    const req = makeRequest('tools/call', {
      name: 'get_design_token',
      arguments: { project_path: '/some/project' },
    });
    const res = server.handleToolsCall(req);

    expect(res.result.content[0].type).toBe('text');
    expect(res.result.content[0].text).toContain('Visual Theme');
  });

  // -------------------------------------------------------------------------
  // 6. get_design_token — returns UDS template when DESIGN.md not found
  // -------------------------------------------------------------------------
  it('get_design_token returns UDS template when DESIGN.md is missing', () => {
    existsSync.mockReturnValue(false);
    readFileSync.mockReturnValue(UDS_TEMPLATE_MD);

    const req = makeRequest('tools/call', {
      name: 'get_design_token',
      arguments: { project_path: '/no/design/md/here' },
    });
    const res = server.handleToolsCall(req);

    expect(res.result.content[0].text).toContain('UDS DESIGN.md template');
  });

  // -------------------------------------------------------------------------
  // 7. get_design_token — returns content array with type "text"
  // -------------------------------------------------------------------------
  it('get_design_token returns content array with type text', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(VALID_DESIGN_MD);

    const req = makeRequest('tools/call', {
      name: 'get_design_token',
      arguments: { project_path: '/some/project' },
    });
    const res = server.handleToolsCall(req);

    expect(Array.isArray(res.result.content)).toBe(true);
    expect(res.result.content[0]).toMatchObject({ type: 'text' });
  });

  // -------------------------------------------------------------------------
  // 8. get_design_standards — returns frontend-design-standards.ai.yaml
  // -------------------------------------------------------------------------
  it('get_design_standards returns YAML standards content', () => {
    readFileSync.mockReturnValue(FRONTEND_STANDARDS_YAML);

    const req = makeRequest('tools/call', {
      name: 'get_design_standards',
      arguments: {},
    });
    const res = server.handleToolsCall(req);

    expect(res.result.content[0].type).toBe('text');
    expect(res.result.content[0].text).toContain('frontend-design-standards');
  });

  // -------------------------------------------------------------------------
  // 9. validate_design_token — valid DESIGN.md returns valid=true, no missing
  // -------------------------------------------------------------------------
  it('validate_design_token returns valid=true for complete DESIGN.md', () => {
    readFileSync.mockReturnValue(VALID_DESIGN_MD);

    const req = makeRequest('tools/call', {
      name: 'validate_design_token',
      arguments: { design_md_path: '/some/project/DESIGN.md' },
    });
    const res = server.handleToolsCall(req);

    const parsed = JSON.parse(res.result.content[0].text);
    expect(parsed.valid).toBe(true);
    expect(parsed.missing_sections).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // 10. validate_design_token — missing sections returns valid=false + list
  // -------------------------------------------------------------------------
  it('validate_design_token returns valid=false with missing sections listed', () => {
    readFileSync.mockReturnValue(INCOMPLETE_DESIGN_MD);

    const req = makeRequest('tools/call', {
      name: 'validate_design_token',
      arguments: { design_md_path: '/some/project/DESIGN.md' },
    });
    const res = server.handleToolsCall(req);

    const parsed = JSON.parse(res.result.content[0].text);
    expect(parsed.valid).toBe(false);
    expect(parsed.missing_sections.length).toBeGreaterThan(0);
    expect(parsed.missing_sections).toContain('color-palette');
  });

  // -------------------------------------------------------------------------
  // 11. handleRequest — unknown method returns JSON-RPC error code -32601
  // -------------------------------------------------------------------------
  it('handleRequest returns -32601 error for unknown method', () => {
    const req = makeRequest('unknown/method');
    const res = server.handleRequest(req);
    expect(res.error.code).toBe(-32601);
  });

  // -------------------------------------------------------------------------
  // 12. handleRequest — malformed request (non-object) returns error
  // -------------------------------------------------------------------------
  it('handleRequest handles malformed non-object request gracefully', () => {
    const res = server.handleRequest(null);
    expect(res).toHaveProperty('error');
    expect(res.error.code).toBe(-32600);
  });
});
