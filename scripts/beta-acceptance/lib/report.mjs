/**
 * The report: Markdown for a person to read and paste back, JSON for a program to compare
 * (dev-platform XSPEC-469 R2 and R3).
 *
 * Standard library only.
 */

export const REPORT_SCHEMA = 1;

/** Exit codes of run.mjs. */
export const EXIT = { PASS: 0, FAIL: 1, ERROR: 2, NO_STEPS: 3 };

/**
 * @param {Array<{status: string, human?: object}>} results
 */
export function countResults(results) {
  const c = { planned: results.length, passed: 0, failed: 0, skipped: 0, humanConfirmed: 0, humanUnconfirmed: 0, executed: 0 };
  for (const r of results) {
    if (r.status === 'pass') c.passed += 1;
    else if (r.status === 'fail') c.failed += 1;
    else if (r.status === 'skip') c.skipped += 1;
    else if (r.status === 'human-confirmed') c.humanConfirmed += 1;
    else if (r.status === 'unconfirmed') c.humanUnconfirmed += 1;
    if (r.ran) c.executed += 1;
  }
  return c;
}

/**
 * The one place that decides what the run means.
 *  - any failed step                                  -> fail
 *  - nothing passed and nobody confirmed anything (zero steps,
 *    all skipped, everything waiting for a person)    -> no-steps. NEVER a pass: nothing was shown to work.
 *  - passed, but a person has not answered something   -> pass_with_unconfirmed
 *  - otherwise                                         -> pass
 */
export function judgeRun(counts) {
  if (counts.failed > 0) return { verdict: 'fail', exitCode: EXIT.FAIL };
  if (counts.passed + counts.humanConfirmed === 0) return { verdict: 'no-steps', exitCode: EXIT.NO_STEPS };
  if (counts.humanUnconfirmed > 0) return { verdict: 'pass_with_unconfirmed', exitCode: EXIT.PASS };
  return { verdict: 'pass', exitCode: EXIT.PASS };
}

export const VERDICT_TEXT = {
  pass: { en: 'PASS', zh: '通過' },
  pass_with_unconfirmed: { en: 'PASS (automated steps only; some manual items unconfirmed)', zh: '自動步驟通過；有人工項目尚未確認' },
  fail: { en: 'FAIL', zh: '失敗' },
  'no-steps': { en: 'NOTHING WAS TESTED (zero steps passed)', zh: '沒有測到任何東西（零個步驟通過），不算通過' },
  error: { en: 'COULD NOT RUN', zh: '無法執行' },
};

const STATUS_TEXT = {
  pass: 'pass 通過',
  fail: 'FAIL 失敗',
  skip: 'skip 略過',
  unconfirmed: 'unconfirmed 待人確認（未確認）',
  'human-confirmed': 'confirmed 人工確認',
};

/**
 * @returns {object} the JSON report
 */
export function buildReport({ startedAt, finishedAt, label, request, uds, install, environment, results, notes = [], error = null }) {
  const counts = countResults(results);
  const judged = error ? { verdict: 'error', exitCode: EXIT.ERROR } : judgeRun(counts);
  return {
    schema: REPORT_SCHEMA,
    tool: 'uds-beta-acceptance',
    startedAt,
    finishedAt,
    durationMs: new Date(finishedAt) - new Date(startedAt),
    label,
    verdict: judged.verdict,
    exitCode: judged.exitCode,
    error,
    request,
    uds,
    install,
    environment,
    counts,
    steps: results,
    notes,
  };
}

const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const fence = (text) => `\`\`\`text\n${String(text).replace(/```/g, "'''")}\n\`\`\``;

export function toMarkdown(report) {
  const e = report.environment || {};
  const v = VERDICT_TEXT[report.verdict] || { en: report.verdict, zh: report.verdict };
  const c = report.counts;
  const lines = [];
  lines.push(`# UDS beta acceptance report | 測試版驗收報告`);
  lines.push('');
  lines.push(`**Result | 結果：${v.en} — ${v.zh}**`);
  lines.push('');
  if (report.error) lines.push(`> Error | 錯誤：${report.error}`, '');
  lines.push('| | |', '|---|---|');
  lines.push(`| UDS version 版本 | \`${cell(report.uds && report.uds.version)}\` (asked for 要求：\`${cell(report.request && report.request.version)}\`) |`);
  lines.push(`| Install source 安裝來源 | ${cell(report.uds && report.uds.installKind)}${report.uds && report.uds.installKind === 'npm-registry' ? ' (the published package 已發布的套件)' : ' (**not** a published package 不是已發布的套件)'} |`);
  lines.push(`| Label 標籤 | ${cell(report.label)} |`);
  lines.push(`| OS 作業系統 | ${cell(e.platform)} — ${cell(e.os && e.os.type)} ${cell(e.os && e.os.release)} (${cell(e.os && e.os.arch)}); ${cell(e.os && e.os.version)} |`);
  lines.push(`| Shell 殼層 | ${cell(e.shell && e.shell.value)} (${cell(e.shell && e.shell.evidence)}) |`);
  lines.push(`| Node / npm | ${cell(e.node && e.node.version)} / ${cell(e.npm && e.npm.version)} |`);
  lines.push(`| Windows code page 編碼頁 | ${cell(e.windowsCodePage && e.windowsCodePage.value)} |`);
  lines.push(`| Started 開始 | ${cell(report.startedAt)} (${Math.round((report.durationMs || 0) / 1000)} s) |`);
  lines.push('');
  lines.push(`**Counts 數量**：planned ${c.planned}; passed ${c.passed}; failed ${c.failed}; skipped (other platform) ${c.skipped}; manual confirmed ${c.humanConfirmed}; **manual NOT confirmed ${c.humanUnconfirmed}** (not counted as passed 不計入通過)`);
  lines.push('');
  lines.push('## Steps | 各步驟', '');
  lines.push('| # | step 步驟 | result 結果 | exit |', '|---|---|---|---|');
  report.steps.forEach((s, i) => lines.push(`| ${i + 1} | \`${cell(s.id)}\` — ${cell(s.title)} | ${STATUS_TEXT[s.status] || s.status}${s.status === 'skip' && s.reason ? ` — ${cell(s.reason)}` : ''} | ${s.exitCode === null || s.exitCode === undefined ? '-' : s.exitCode} |`));
  const failed = report.steps.filter((s) => s.status === 'fail');
  if (failed.length) {
    lines.push('', '## Failed steps | 失敗的步驟', '');
    for (const s of failed) {
      lines.push(`### ${s.id} — ${s.title}`, '', `Command 指令：\`${s.command}\``, '');
      for (const f of s.failures) lines.push(`- ${f}`);
      if (s.output) lines.push('', fence(s.output));
      lines.push('');
    }
  }
  const pending = report.steps.filter((s) => s.status === 'unconfirmed');
  if (pending.length) {
    lines.push('', '## Waiting for a person | 待人確認（尚未確認，不計入通過）', '');
    for (const s of pending) lines.push(`- \`${s.id}\` — ${s.human ? `${s.human.prompt} | ${s.human.promptZh}` : s.title}`);
    lines.push('', 'Answer with `--answers <file>` (JSON: `{"step-id": "yes"|"no"}`) or run in a terminal and answer when asked. 用 `--answers <檔案>` 回答，或在終端機直接執行並依提示回答。');
  }
  const passed = report.steps.filter((s) => s.status === 'pass' || s.status === 'human-confirmed');
  if (passed.length) {
    lines.push('', '<details><summary>Output of the passed steps | 通過步驟的輸出摘要</summary>', '');
    for (const s of passed) lines.push(`**${s.id}** — \`${s.command}\``, '', fence(s.output || '(no output)'), '');
    lines.push('</details>');
  }
  if (report.notes && report.notes.length) {
    lines.push('', '## Notes | 備註', '');
    for (const n of report.notes) lines.push(`- ${n}`);
  }
  lines.push('');
  return lines.join('\n');
}
