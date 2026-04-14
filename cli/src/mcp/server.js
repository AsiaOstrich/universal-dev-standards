/**
 * UDS MCP Design Standards Server
 * Implements MCP (Model Context Protocol) stdio transport using JSON-RPC 2.0
 * No external MCP SDK required — uses Node.js standard library only
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// UDS standards root (relative to this file: cli/src/mcp/server.js → repo root is ../../../../)
const UDS_REPO_ROOT = resolve(__dirname, '../../../../');

/**
 * Required DESIGN.md sections per frontend-design-standards.
 * Each entry maps a section id (used in validation output) to a search pattern
 * that should appear in the document (case-insensitive).
 */
const REQUIRED_DESIGN_SECTIONS = [
  { id: 'visual-theme',      pattern: /visual[\s\-&]+theme/i },
  { id: 'color-palette',     pattern: /color[\s\-&]+palette/i },
  { id: 'typography',        pattern: /typography/i },
  { id: 'component-styling', pattern: /component[\s\-&]+styling/i },
  { id: 'layout-spacing',    pattern: /layout[\s\S]{0,10}spacing/i },
  { id: 'design-guidelines', pattern: /design[\s\S]{0,20}guidelines/i },
];

export class McpServer {
  constructor(options = {}) {
    this.udsRoot = options.udsRoot || process.cwd();
    // For reading UDS bundled files, always use UDS_REPO_ROOT
    this.udsRepoRoot = options.udsRepoRoot || UDS_REPO_ROOT;
  }

  /**
   * Start the MCP server — listens on stdin, writes to stdout
   */
  start() {
    let buffer = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in buffer
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const request = JSON.parse(trimmed);
          const response = this.handleRequest(request);
          if (response !== null && response !== undefined) {
            process.stdout.write(JSON.stringify(response) + '\n');
          }
        } catch (e) {
          // JSON parse error
          const errorResponse = {
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32700,
              message: 'Parse error',
              data: e.message,
            },
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    });

    process.stdin.on('end', () => {
      // Process any remaining buffered content
      if (buffer.trim()) {
        try {
          const request = JSON.parse(buffer.trim());
          const response = this.handleRequest(request);
          if (response !== null && response !== undefined) {
            process.stdout.write(JSON.stringify(response) + '\n');
          }
        } catch {
          // Ignore final incomplete message
        }
      }
    });
  }

  /**
   * Route a JSON-RPC 2.0 request to the appropriate handler
   * @param {object} request
   * @returns {object|null} JSON-RPC response (null for notifications)
   */
  handleRequest(request) {
    if (!request || typeof request !== 'object') {
      return {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32600, message: 'Invalid Request' },
      };
    }

    const { method, id } = request;

    // Notifications (no id) do not get a response
    if (id === undefined) return null;

    switch (method) {
      case 'initialize':
        return this.handleInitialize(request);
      case 'tools/list':
        return this.handleToolsList(request);
      case 'tools/call':
        return this.handleToolsCall(request);
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        };
    }
  }

  /**
   * Handle MCP initialize request
   */
  handleInitialize(request) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'uds-design-standards',
          version: '1.0.0',
        },
      },
    };
  }

  /**
   * Handle tools/list request — return available tools
   */
  handleToolsList(request) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools: [
          {
            name: 'get_design_token',
            description:
              'Get the DESIGN.md content for a project, or return the UDS DESIGN.md template if not found',
            inputSchema: {
              type: 'object',
              properties: {
                project_path: {
                  type: 'string',
                  description: 'Absolute or relative path to the project root',
                },
              },
              required: ['project_path'],
            },
          },
          {
            name: 'get_design_standards',
            description:
              'Get the UDS frontend design standards (frontend-design-standards.ai.yaml)',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'validate_design_token',
            description:
              'Validate a DESIGN.md file against UDS frontend design standards',
            inputSchema: {
              type: 'object',
              properties: {
                design_md_path: {
                  type: 'string',
                  description: 'Path to the DESIGN.md file to validate',
                },
              },
              required: ['design_md_path'],
            },
          },
        ],
      },
    };
  }

  /**
   * Handle tools/call request — dispatch to specific tool implementation
   * @param {object} request
   * @returns {object} JSON-RPC response
   */
  handleToolsCall(request) {
    const { id, params } = request;
    const toolName = params?.name;
    const args = params?.arguments || {};

    try {
      let toolResult;

      switch (toolName) {
        case 'get_design_token':
          toolResult = this._getDesignToken(args);
          break;
        case 'get_design_standards':
          toolResult = this._getDesignStandards();
          break;
        case 'validate_design_token':
          toolResult = this._validateDesignToken(args);
          break;
        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Unknown tool: ${toolName}`,
            },
          };
      }

      return {
        jsonrpc: '2.0',
        id,
        result: toolResult,
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: err.message,
        },
      };
    }
  }

  /**
   * Tool: get_design_token
   * Returns DESIGN.md content from the project, or UDS template if not found
   */
  _getDesignToken({ project_path }) {
    const projectPath = resolve(project_path);
    const designMdPath = join(projectPath, 'DESIGN.md');

    let text;
    let isTemplate = false;

    if (existsSync(designMdPath)) {
      text = readFileSync(designMdPath, 'utf8');
    } else {
      // Graceful fallback: return UDS template
      const templatePath = join(this.udsRepoRoot, 'templates', 'DESIGN.md');
      text = readFileSync(templatePath, 'utf8');
      isTemplate = true;
    }

    const prefix = isTemplate
      ? '<!-- This is the UDS DESIGN.md template. No DESIGN.md was found at the specified project path. -->\n\n'
      : '';

    return {
      content: [
        {
          type: 'text',
          text: prefix + text,
        },
      ],
    };
  }

  /**
   * Tool: get_design_standards
   * Returns the UDS frontend-design-standards.ai.yaml content
   */
  _getDesignStandards() {
    const standardsPath = join(
      this.udsRepoRoot,
      'ai',
      'standards',
      'frontend-design-standards.ai.yaml'
    );
    const text = readFileSync(standardsPath, 'utf8');

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  }

  /**
   * Tool: validate_design_token
   * Validates a DESIGN.md file against required sections
   */
  _validateDesignToken({ design_md_path }) {
    const filePath = resolve(design_md_path);
    const content = readFileSync(filePath, 'utf8');

    const missingSections = [];
    const warnings = [];

    for (const section of REQUIRED_DESIGN_SECTIONS) {
      if (!section.pattern.test(content)) {
        missingSections.push(section.id);
      }
    }

    // Optional: warn if no version info found
    if (!/version/i.test(content)) {
      warnings.push('No version information found in DESIGN.md');
    }

    const valid = missingSections.length === 0;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              valid,
              missing_sections: missingSections,
              warnings,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
