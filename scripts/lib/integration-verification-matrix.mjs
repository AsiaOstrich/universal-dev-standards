/**
 * Integration verification matrix: one row per tool, five cells, each with a date and an evidence path.
 * (dev-platform XSPEC-357 R8)
 *
 * Pure functions, no file access of their own, so the same code serves three callers and they cannot disagree:
 *   - scripts/check-integration-liveness.ts   validates the data and the three READMEs
 *   - scripts/generate-integration-matrix.mjs writes docs/reference/INTEGRATION-VERIFICATION-MATRIX.md
 *   - cli/tests/unit/scripts/integration-verification-matrix.test.js
 *
 * The data lives in integrations/REGISTRY.json, `agents.<id>.verification.matrix`. The tool's overall
 * `verification.status` is NOT a second opinion: it is derived from the five cells, and a stored value that
 * differs from the derived one is an error. "Verified" in the README means all five cells passed.
 */

/** The five things R8 asks of every tool, in the order README and the matrix page show them. */
export const CELLS = [
  { key: 'install', mark: '①', title: 'Install', question: '`uds init` writes the UDS standards block into the file this tool reads' },
  { key: 'agentReads', mark: '②', title: 'Agent reads it', question: 'the tool opens the standards it is pointed to (the P7 probe)' },
  { key: 'followsInTask', mark: '③', title: 'Follows it in a task', question: 'the tool applies the standards in a real task (the R4 probes)' },
  { key: 'violationDetected', mark: '④', title: 'Violation detected', question: 'UDS itself catches a change that violates an installed standard, such as a malformed commit message (`uds check`, a commit-msg hook)' },
  { key: 'afterUpdate', mark: '⑤', title: 'Still fine after update', question: 'after `uds update` the tool\'s file is still correct' }
];

export const CELL_STATUSES = ['verified', 'unverified', 'expired', 'failed'];
export const SHELF_LIFE_DAYS = 90; // XSPEC-357 OQ2

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_ICON = { verified: '✅', unverified: '🔬', expired: '⌛', failed: '❌' };

/**
 * The tool's overall status from its five cells.
 * verified only when all five are verified; one failed cell makes it failed; then expired; otherwise unverified.
 * @param {Record<string, {status?: string}> | undefined} matrix
 * @returns {'verified'|'unverified'|'expired'|'failed'}
 */
export function deriveStatus(matrix) {
  const statuses = CELLS.map((c) => matrix?.[c.key]?.status);
  if (statuses.every((s) => s === 'verified')) return 'verified';
  if (statuses.includes('failed')) return 'failed';
  if (statuses.includes('expired')) return 'expired';
  return 'unverified';
}

/**
 * What the README's Verified column shows for one tool. Same text in all three READMEs: the marks and dates are
 * language-neutral. ✅ only when all five cells passed; otherwise the icon of the overall status followed by the
 * cells that did pass, grouped by date, so a partial result is visible without being mistaken for a full one.
 *   ✅ 2026-11-17                        all five passed (the oldest date, because freshness is bounded by it)
 *   🔬 ①④⑤ 2026-11-17 · ③ 2026-07-23     three passed on one day, one on another
 *   🔬 —                                 nothing has passed
 * @param {{ matrix?: Record<string, {status?: string, date?: string}> }} verification
 */
export function renderVerifiedCell(verification) {
  const matrix = verification?.matrix;
  const status = deriveStatus(matrix);
  const passed = CELLS.filter((c) => matrix?.[c.key]?.status === 'verified' && matrix[c.key].date);
  if (status === 'verified') {
    const oldest = passed.map((c) => matrix[c.key].date).sort()[0];
    return `${STATUS_ICON.verified} ${oldest}`;
  }
  const icon = STATUS_ICON[status];
  if (passed.length === 0) return `${icon} —`;
  const byDate = new Map();
  for (const c of passed) {
    const d = matrix[c.key].date;
    byDate.set(d, (byDate.get(d) || '') + c.mark);
  }
  const groups = [...byDate.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([d, marks]) => `${marks} ${d}`);
  return `${icon} ${groups.join(' · ')}`;
}

/**
 * Everything wrong with one tool's verification record. Empty array = fine.
 * @param {string} agentId
 * @param {any} verification
 * @param {{ exists: (relPath: string) => boolean, today: Date, shelfLifeDays?: number }} ctx
 * @returns {string[]}
 */
export function validateVerification(agentId, verification, ctx) {
  const problems = [];
  const shelf = ctx.shelfLifeDays ?? SHELF_LIFE_DAYS;
  const v = verification;
  if (!v) return [`${agentId} has no verification field (a tool with nothing recorded is "unverified", not absent)`];

  const matrix = v.matrix;
  if (!matrix || typeof matrix !== 'object') {
    return [`${agentId}.verification.matrix is missing: every live tool carries the five cells, each verified or with the reason it is not`];
  }
  for (const key of Object.keys(matrix)) {
    if (!CELLS.some((c) => c.key === key)) problems.push(`${agentId}.verification.matrix has an unknown cell "${key}"`);
  }

  for (const cell of CELLS) {
    const where = `${agentId}.verification.matrix.${cell.key}`;
    const c = matrix[cell.key];
    if (!c || typeof c !== 'object') {
      problems.push(`${where} is missing`);
      continue;
    }
    if (!CELL_STATUSES.includes(c.status)) {
      problems.push(`${where}.status is "${c.status}", must be one of ${CELL_STATUSES.join(', ')}`);
      continue;
    }
    if (c.status === 'verified') {
      // A verification is a claim about the outside world. Without a date and a file a reader can open, it is only a sentence.
      for (const k of ['date', 'evidence']) if (!c[k]) problems.push(`${where} claims verified but has no ${k}`);
      if (c.date && !DATE.test(c.date)) problems.push(`${where}.date "${c.date}" is not YYYY-MM-DD`);
      if (c.evidence && !ctx.exists(c.evidence)) problems.push(`${where}.evidence points at "${c.evidence}", which does not exist`);
      if (cell.key === 'followsInTask' && !c.toolVersion) problems.push(`${where} claims verified but has no toolVersion`);
      // AC-8.2: the result of a task probe must not stand in for "the agent read the standards".
      if (cell.key === 'agentReads' && !(Array.isArray(c.probes) && c.probes.includes('P7'))) {
        problems.push(`${where} claims verified but names no P7 probe run: another cell's result cannot stand in for it`);
      }
      if (c.date && DATE.test(c.date)) {
        const age = Math.floor((ctx.today.getTime() - new Date(c.date).getTime()) / 86_400_000);
        if (age > shelf) problems.push(`${where} was verified ${age} days ago (shelf life ${shelf}); set it to "expired" and re-run`);
      }
    } else {
      if (!c.reason || typeof c.reason !== 'string') {
        // "Not verified" is only honest with its reason: not installed, probe not written, no entry in init.
        problems.push(`${where} is ${c.status} but gives no reason`);
      }
      // A cell that is only partly covered may point at the tests that cover that part. It stays not verified.
      if (c.partialEvidence && !ctx.exists(c.partialEvidence)) {
        problems.push(`${where}.partialEvidence points at "${c.partialEvidence}", which does not exist`);
      }
    }
  }

  const derived = deriveStatus(matrix);
  if (v.status !== derived) {
    problems.push(`${agentId}.verification.status is "${v.status}" but its five cells add up to "${derived}"; the overall status is derived, never set by hand`);
  }
  return problems;
}

/**
 * What a README's support table currently shows in the Verified column for one tool (footnote marks removed),
 * or null when the table has no row for it. The row is found by the tool's bolded display name, as the status
 * check does; the Verified column is the third.
 * @param {string} readmeText
 * @param {string} toolName
 */
export function verifiedCellInReadme(readmeText, toolName) {
  const escaped = toolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const row = readmeText.match(new RegExp(`^\\|\\s*\\*\\*${escaped}\\*\\*\\s*\\|(.*)$`, 'm'));
  if (!row) return null;
  return (row[1].split('|')[1] ?? '').replace(/<sup>.*?<\/sup>/g, '').trim();
}

const cellText = (c) => {
  if (!c) return '—';
  const icon = STATUS_ICON[c.status] ?? '?';
  return c.status === 'verified' || c.status === 'expired' || c.status === 'failed' ? `${icon} ${c.date ?? ''}`.trim() : `${icon} not verified`;
};

/**
 * The matrix page. `registry` is the parsed integrations/REGISTRY.json.
 * @param {any} registry
 * @returns {string} Markdown, ending in a newline
 */
export function renderMatrixPage(registry) {
  const live = Object.entries(registry.agents).filter(([, a]) => a.tier !== 'tool' && !a.deprecated);
  const fullyVerified = live.filter(([, a]) => deriveStatus(a.verification?.matrix) === 'verified').length;
  const out = [];
  out.push('# Integration verification matrix');
  out.push('');
  out.push('<!-- GENERATED from integrations/REGISTRY.json by scripts/generate-integration-matrix.mjs. Do not edit by hand:');
  out.push('     `npm run check:liveness` fails when this file no longer matches the registry. -->');
  out.push('');
  out.push('**Spec**: XSPEC-357 R8 · **Procedure**: [INTEGRATION-VERIFICATION.md](INTEGRATION-VERIFICATION.md)');
  out.push('');
  out.push(`${live.length} live tools; **${fullyVerified} of them passed all five cells.** The README's Verified column shows ✅ only for a tool whose five cells all passed; every other tool shows 🔬 plus the cells that did pass.`);
  out.push('');
  out.push('## The five cells');
  out.push('');
  for (const c of CELLS) out.push(`- **${c.mark} ${c.title}**: ${c.question}.`);
  out.push('');
  out.push('A cell is ✅ with the date it was run, 🔬 not verified (with the reason below), ⌛ expired, or ❌ failed. Nothing is filled in on the strength of another cell: for example ③ never stands in for ②.');
  out.push('');
  out.push('## Matrix');
  out.push('');
  out.push(`| Tool | ${CELLS.map((c) => `${c.mark} ${c.title}`).join(' | ')} |`);
  out.push(`| :--- | ${CELLS.map(() => ':---').join(' | ')} |`);
  for (const [, a] of live) {
    const m = a.verification?.matrix;
    out.push(`| **${a.name}** | ${CELLS.map((c) => cellText(m?.[c.key])).join(' | ')} |`);
  }
  out.push('');
  // Text that several tools carry word for word (cell 4 is one shared result, "not installed" is one reason) is printed
  // once, not once per tool. The text of a cell is its note when verified, its reason when not.
  const textOf = (cell) => (cell.status === 'verified' ? cell.note : cell.reason);
  const textCount = new Map();
  for (const [, a] of live) {
    for (const c of CELLS) {
      const cell = a.verification?.matrix?.[c.key];
      const t = cell && textOf(cell);
      if (t) textCount.set(`${c.key}\n${t}`, (textCount.get(`${c.key}\n${t}`) || 0) + 1);
    }
  }
  const shared = CELLS.flatMap((c) => [...textCount.entries()].filter(([k, n]) => n > 1 && k.startsWith(`${c.key}\n`)).map(([k]) => ({ cell: c, text: k.slice(c.key.length + 1) })));
  if (shared.length > 0) {
    out.push('## Notes and reasons that apply to several tools');
    out.push('');
    for (const { cell, text } of shared) out.push(`- ${cell.mark} ${cell.title}: ${text}`);
    out.push('');
  }
  out.push('## Evidence and reasons, per tool');
  out.push('');
  for (const [id, a] of live) {
    const m = a.verification?.matrix ?? {};
    out.push(`### ${a.name} (\`${id}\`)`);
    out.push('');
    for (const c of CELLS) {
      const cell = m[c.key];
      if (!cell) {
        out.push(`- ${c.mark} ${c.title}: no record`);
        continue;
      }
      const t = textOf(cell);
      const isShared = t && textCount.get(`${c.key}\n${t}`) > 1;
      if (cell.status === 'verified') {
        const extra = [cell.toolVersion, cell.udsVersion && `UDS ${cell.udsVersion}`].filter(Boolean).join(', ');
        const note = t ? (isShared ? ' (see the shared note above)' : `. ${t}`) : '';
        out.push(`- ${c.mark} ${c.title}: ✅ ${cell.date}, evidence \`${cell.evidence}\`${extra ? ` (${extra})` : ''}${note}`);
      } else {
        const partial = cell.partialEvidence ? ` Partial evidence: \`${cell.partialEvidence}\`.` : '';
        out.push(`- ${c.mark} ${c.title}: ${STATUS_ICON[cell.status]} ${cell.status}. ${isShared ? 'See the shared reason above.' : cell.reason}${partial}`);
      }
    }
    out.push('');
  }
  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}
