/**
 * One-line summaries `uds update` prints, kept apart from the command so what they say can be tested
 * without running an update.
 *
 * @module utils/update-summary
 */

const agentOf = (inst) => (typeof inst === 'string' ? inst : inst.agent);

/**
 * "Updated N commands for M AI tools: <where>" (XSPEC-454 R4).
 *
 * The number of tools and the number of commands are different numbers and are filled into different
 * slots. The summary used to reuse `commandsUpdated`, a message worded "N AI tools" in every language,
 * and feed it the command-file count: one OpenCode install printed "Updated Commands for 51 AI tools".
 *
 * @param {Object} msg - `t().commands.update`
 * @param {Array<string|{agent: string}>} installations - The targets the commands went to
 * @param {{ totalInstalled: number }} result - The installer's result
 * @param {string} locations - Already-formatted list of where they went
 * @returns {string}
 */
export function commandsUpdatedMessage(msg, installations, result, locations) {
  const tools = new Set((installations || []).map(agentOf)).size;
  return (msg.commandsUpdatedCounts || 'Updated {commands} commands for {tools} AI tool(s): {locations}')
    .replace('{tools}', tools)
    .replace('{commands}', result.totalInstalled)
    .replace('{locations}', locations);
}
