/**
 * uds mcp - MCP server subcommands for AI tool integration
 */

import { McpServer } from '../mcp/server.js';

/**
 * Register the `mcp` command group on the given Commander program
 * @param {import('commander').Command} program
 */
export function mcpCommand(program) {
  const mcp = program
    .command('mcp')
    .description('MCP server commands for AI tool integration');

  mcp
    .command('serve')
    .description('Start MCP Design Standards Server (stdio transport)')
    .option('--root <path>', 'UDS standards root path', process.cwd())
    .action((options) => {
      const server = new McpServer({ udsRoot: options.root });
      server.start();
      // Log to stderr only — stdout is reserved for MCP JSON-RPC messages
      process.stderr.write('UDS MCP Design Standards Server started (stdio)\n');
    });
}
