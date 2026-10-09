/**
 * The gate in front of a stable release (dev-platform XSPEC-471 R5).
 *
 * `scripts/bump-version.mjs` calls this when the version it is asked to set has no pre-release mark. It answers one question:
 * was the latest preview of this version accepted, from the published package, on Windows, macOS and Linux, and is every
 * feature wired? It never answers "yes" for something it could not look at: a missing file, a check that could not run,
 * a report it cannot read are each a reason to refuse, listed by name. All reasons are collected before it answers, so the
 * person fixes them in one go instead of running the bump five times.
 *
 * What it checks (each is one entry of `problems` when it does not hold):
 *   1. a preview of this version exists (the `## [x.y.z-beta.N]` headings of CHANGELOG.md and the version in cli/package.json),
 *   2. `reports/<that version>/` holds a report for each of Windows, macOS and Linux that came from the published package
 *      (`uds.installKind === 'npm-registry'`, same version: `eligibleReports` of lib/pre-release-doc.mjs, the rule the
 *      "Verified on" table uses, so the table and the gate cannot disagree). A report of `--local-bin`, `--source` or an
 *      injected installer is never counted; if it is all a platform has, the platform counts as missing and the report is named,
 *   3. for every platform, EVERY label (Windows runs from PowerShell, cmd and Git Bash) has an automatic-step failure count of 0.
 *      The newest run of each label stands for that label (`newestPerLabel`, also shared with the table); the worst label decides,
 *   4. `check-cli-coverage.mjs` and `check-steps.mjs` exit 0 (exit 2, "could not measure", is a refusal, not a pass),
 *   5. `coverage-baseline.json` is empty (R4 emptied it; the ratchet check lets a non-empty one pass, a stable release does not),
 *   6. no exemption in `steps.json` says it is "known broken" (R4: a step is not written to fit a broken feature; the feature is
 *      listed as an exemption that says so, and this gate holds the stable release back until it is fixed or removed).
 *
 * Not blocking, printed so nobody has to look for it: the manual (`human-*`) steps nobody confirmed, per platform; steps of the
 * current steps.json that the report does not contain (the report was made before they existed); report files that were not counted.
 *
 * "Latest published preview": CHANGELOG.md is the project's own release record, needs no network and gives the same answer on
 * every machine; cli/package.json is added because the bump runs from the commit that carries the preview's version. The highest
 * pre-release of the SAME x.y.z as the target counts. A target with no preview of its own (a patch released without one) is refused:
 * nothing was accepted for it. The reports folder alone could not decide this: a preview nobody ran the acceptance for would be
 * skipped over and an older, accepted one would stand in for it.
 *
 * Standard library only.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { parseChangelog } from './changelog.mjs';
import { eligibleReports, newestPerLabel, SEVERITY } from './pre-release-doc.mjs';

export const PLATFORMS = [['windows', 'Windows'], ['macos', 'macOS'], ['linux', 'Linux']];

/** `x.y.z` with no pre-release mark. */
export const isStableVersion = (v) => /^\d+\.\d+\.\d+$/.test(String(v));

const PRE = /^(\d+)\.(\d+)\.(\d+)-([0-9A-Za-z.]+)$/;

/** @returns {{ core: string, pre: string[] }|null} */
export function parsePreview(v) {
  const m = PRE.exec(String(v));
  return m ? { core: `${m[1]}.${m[2]}.${m[3]}`, pre: m[4].split('.') } : null;
}

/** semver precedence of two pre-release parts: numbers by value and below words, words by letters, fewer fields first. */
export function comparePre(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] === undefined) return -1;
    if (b[i] === undefined) return 1;
    const na = /^\d+$/.test(a[i]);
    const nb = /^\d+$/.test(b[i]);
    if (na && nb) { if (Number(a[i]) !== Number(b[i])) return Number(a[i]) - Number(b[i]); continue; }
    if (na !== nb) return na ? -1 : 1;
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

/**
 * The newest preview of the same x.y.z as `target`, from the CHANGELOG headings and the version in package.json.
 * @returns {{ version: string, from: string }|null}
 */
export function latestPreview({ target, changelogText, packageVersion }) {
  const core = String(target);
  const seen = new Map();
  for (const block of parseChangelog(changelogText)) if (parsePreview(block.version)) seen.set(block.version, 'CHANGELOG.md');
  if (packageVersion && parsePreview(packageVersion) && !seen.has(packageVersion)) seen.set(packageVersion, 'cli/package.json');
  const same = [...seen.keys()].filter((v) => parsePreview(v).core === core);
  if (!same.length) return null;
  same.sort((x, y) => comparePre(parsePreview(x).pre, parsePreview(y).pre));
  const version = same[same.length - 1];
  return { version, from: seen.get(version) };
}

/** Exemption reasons that say the feature is broken: R4's wording is "Known broken: ..."; the Chinese form is accepted too. */
export const KNOWN_BROKEN = /known[ -]broken|已知壞掉/i;

/** @returns {Array<{ what: string, reason: string }>} */
export function knownBrokenExemptions(doc) {
  return (doc.exemptions || [])
    .filter((x) => KNOWN_BROKEN.test(String(x.reason || '')))
    .map((x) => ({ what: x.command ? `command "${x.command}"` : x.option ? `option "${x.option}"` : x.step ? `step "${x.step}"` : `CHANGELOG entry "${x.changelog}"`, reason: String(x.reason) }));
}

const clip = (s, n = 140) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s));
const list = (items, n = 8) => (items.length > n ? `${items.slice(0, n).join(', ')} (+${items.length - n} more)` : items.join(', '));

/**
 * Judge the reports of one preview. Pure: the same inputs give the same answer.
 * @param {{ version: string, reports: Array<{ file: string, report: object }>, steps?: Array<{ id: string, platform?: string }> }} input
 */
export function judgeReports({ version, reports, steps = [] }) {
  const problems = [];
  const notes = [];
  const platforms = [];
  const manual = new Map(); // step id -> platform labels that left it unconfirmed
  const notRun = new Set(); // ids of steps.json that at least one counted report does not contain
  const eligible = eligibleReports(reports, version);
  const eligibleFiles = new Set(eligible.map((e) => e.file));
  const notCounted = reports.filter((r) => !eligibleFiles.has(r.file));
  for (const [key, label] of PLATFORMS) {
    const mine = eligible.filter(({ report }) => report.environment.platform === key);
    if (!mine.length) {
      const wrongKind = notCounted.filter(({ report }) => report && report.environment && report.environment.platform === key);
      const why = wrongKind.length
        ? ` — ${wrongKind.length} report(s) for ${label} exist but none came from the published package ${version} (${list(wrongKind.map(({ file, report }) => `${file}: ${report.uds ? `${report.uds.installKind} ${report.uds.version}` : 'no uds field'}`), 3)}) 有報告但都不是已發布套件`
        : '';
      problems.push(`${label}: no report for ${version} in reports/${version}/ 缺 ${label} 報告${why}`);
      platforms.push({ key, label, labels: [] });
      continue;
    }
    const labels = newestPerLabel(mine).sort((a, b) => (SEVERITY[a.report.verdict] ?? 1) - (SEVERITY[b.report.verdict] ?? 1));
    platforms.push({ key, label, labels: labels.map(({ file, report }) => ({ file, label: report.label || '(no label)', verdict: report.verdict, counts: report.counts })) });
    for (const { file, report } of labels) {
      const failedSteps = (report.steps || []).filter((s) => s.status === 'fail').map((s) => s.id);
      const failedCount = Math.max(failedSteps.length, Number(report.counts.failed) || 0);
      const bad = failedCount > 0 || !['pass', 'pass_with_unconfirmed'].includes(report.verdict) || !(report.counts.passed > 0);
      if (bad) {
        const detail = failedCount > 0
          ? `${failedCount} automatic step(s) failed 有 ${failedCount} 個自動步驟失敗${failedSteps.length ? `: ${list(failedSteps)}` : ''}`
          : `verdict is "${report.verdict}", ${report.counts.passed} step(s) passed 判定是「${report.verdict}」，通過 ${report.counts.passed} 步`;
        problems.push(`${label} [${report.label || 'no label'}] (${file}): ${detail}`);
      }
      for (const s of report.steps || []) if (s.status === 'unconfirmed') manual.set(s.id, [...new Set([...(manual.get(s.id) || []), label])]);
      const have = new Set((report.steps || []).map((s) => s.id));
      const missing = steps.filter((s) => !have.has(s.id) && (!s.platform || s.platform === 'all' || s.platform === key)).map((s) => s.id);
      for (const id of missing) notRun.add(id);
    }
  }
  if (notRun.size) notes.push(`${notRun.size} step(s) of the current steps.json are missing from at least one counted report: the report was made before they existed, so they have not run against a published package (first: ${list([...notRun], 4)}) 目前清單有 ${notRun.size} 步不在報告裡，尚未對已發布套件跑過`);
  for (const { file, report } of notCounted) {
    const platform = report && report.environment && report.environment.platform;
    if (PLATFORMS.some(([k]) => k === platform)) notes.push(`not counted: ${file} (${report.uds ? `${report.uds.installKind} ${report.uds.version}` : 'no uds field'}); only reports of the published package ${version} count 不計入`);
    else notes.push(`not counted: ${file} (not a readable report of a known platform) 不計入`);
  }
  return { problems, notes, platforms, manual: [...manual.entries()].map(([id, on]) => ({ id, platforms: on })) };
}

function readJson(file) {
  try {
    return { value: JSON.parse(readFileSync(file, 'utf-8')) };
  } catch (e) {
    return { error: e.message };
  }
}

/** The JSON reports of `reports/<version>/`; a file that is not JSON is returned as `{ file, report: null }` so it can be named. */
export function readReports(dir) {
  return readdirSync(dir).filter((n) => n.endsWith('.json')).sort().map((file) => {
    const r = readJson(join(dir, file));
    return { file, report: r.error ? null : r.value };
  });
}

const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));

function runCheck(root, script) {
  const r = spawnSync(process.execPath, [join(root, 'scripts', 'beta-acceptance', script)], { cwd: root, encoding: 'utf-8', timeout: 180000, env: cleanEnv() });
  const out = `${r.stdout || ''}${r.stderr || ''}`.trim();
  const lines = out.split('\n').filter(Boolean);
  const tail = lines.filter((l) => /FAIL|MISSING|NEW|must|CANNOT|gap|error/i.test(l)).slice(0, 12);
  return { code: r.status, signal: r.signal, error: r.error ? r.error.message : null, summary: (tail.length ? tail : lines.slice(-6)).join('\n    ') };
}

/**
 * Look at the repository under `root` and decide.
 * @param {{ root: string, target: string, run?: (root: string, script: string) => { code: number|null, error: string|null, summary: string } }} input
 * @returns {{ ok: boolean, preview: string|null, problems: string[], notes: string[], platforms: object[], manual: object[], checks: string[] }}
 */
export function evaluateStableGate({ root, target, run = runCheck }) {
  const problems = [];
  const notes = [];
  const checks = [];
  const accept = join(root, 'scripts', 'beta-acceptance');
  let platforms = [];
  let manual = [];

  let changelogText = '';
  try { changelogText = readFileSync(join(root, 'CHANGELOG.md'), 'utf-8'); } catch (e) { problems.push(`cannot read CHANGELOG.md, so the latest preview is unknown 讀不到 CHANGELOG.md: ${e.message}`); }
  const pkg = readJson(join(root, 'cli', 'package.json'));
  if (pkg.error) problems.push(`cannot read cli/package.json 讀不到 cli/package.json: ${pkg.error}`);
  const preview = latestPreview({ target, changelogText, packageVersion: pkg.value && pkg.value.version });

  const stepsRead = readJson(join(accept, 'steps.json'));
  if (stepsRead.error) problems.push(`cannot read scripts/beta-acceptance/steps.json 讀不到 steps.json: ${stepsRead.error}`);
  const doc = stepsRead.value || { steps: [], exemptions: [] };

  if (!preview) {
    if (!problems.length) problems.push(`no preview of ${target} (${target}-beta.N, -rc.N ...) in CHANGELOG.md or cli/package.json, so nothing was accepted for it. Publish a preview first, let the post-publish acceptance run, and fetch its reports. 沒有 ${target} 的預覽版可驗：先發預覽版、等發版後驗收跑完、再取回報告`);
  } else {
    checks.push(`latest preview of ${target}: ${preview.version} (from ${preview.from})`);
    const dir = join(accept, 'reports', preview.version);
    if (!existsSync(dir)) {
      problems.push(`scripts/beta-acceptance/reports/${preview.version}/ does not exist: no platform was reported for ${preview.version}. Run the post-publish acceptance for it, then: node scripts/beta-acceptance/fetch-ci-reports.mjs --version ${preview.version} 缺整個報告資料夾`);
      platforms = PLATFORMS.map(([key, label]) => ({ key, label, labels: [] }));
    } else {
      let reports = [];
      try { reports = readReports(dir); } catch (e) { problems.push(`cannot read ${dir}: ${e.message}`); }
      const judged = judgeReports({ version: preview.version, reports: reports.filter((r) => r.report), steps: doc.steps });
      for (const r of reports.filter((x) => !x.report)) judged.notes.push(`not counted: ${r.file} (not valid JSON) 不是有效的 JSON`);
      problems.push(...judged.problems);
      notes.push(...judged.notes);
      platforms = judged.platforms;
      manual = judged.manual;
    }
  }

  for (const script of ['check-cli-coverage.mjs', 'check-steps.mjs']) {
    const r = run(root, script);
    if (r.code === 0) checks.push(`${script}: green 綠`);
    else if (r.code === 2) problems.push(`${script} could not measure (exit 2): that is not a pass 無法量測，不算通過\n    ${r.summary}`);
    else problems.push(`${script} is red (exit ${r.code}${r.error ? `, ${r.error}` : ''}) 紅燈\n    ${r.summary}`);
  }

  const baseline = readJson(join(accept, 'coverage-baseline.json'));
  if (baseline.error) problems.push(`cannot read coverage-baseline.json 讀不到基準線: ${baseline.error}`);
  else {
    const left = [...(baseline.value.commands || []).map((c) => `command "${c}"`), ...(baseline.value.options || []).map((o) => `option "${o}"`)];
    if (left.length) problems.push(`coverage-baseline.json is not empty: ${left.length} command/option(s) still have no acceptance step (${list(left)}) 基準線不是空的`);
    else checks.push('coverage-baseline.json: empty 空');
  }

  const broken = knownBrokenExemptions(doc);
  if (broken.length) for (const b of broken) problems.push(`steps.json exempts ${b.what} as known broken 豁免寫明已知壞掉，修好或移除才能升正式版: "${clip(b.reason)}"`);
  else if (!stepsRead.error) checks.push('steps.json: no exemption says "known broken" 沒有「已知壞掉」的豁免');

  return { ok: problems.length === 0, preview: preview ? preview.version : null, problems, notes, platforms, manual, checks };
}

/** The text bump-version prints. */
export function formatGate(result, target) {
  const out = [];
  out.push(`  ${target} has no pre-release mark: the latest preview must have been accepted on Windows, macOS and Linux first.`);
  out.push(`  ${target} 是正式版：最近一個預覽版必須先在 Windows、macOS、Linux 三平台驗收過。`);
  out.push('');
  for (const c of result.checks) out.push(`  [OK] ${c}`);
  for (const p of result.platforms) {
    if (!p.labels.length) continue;
    for (const l of p.labels) out.push(`  [${['pass', 'pass_with_unconfirmed'].includes(l.verdict) && !l.counts.failed ? 'OK' : '!!'}] ${p.label} [${l.label}]: ${l.verdict}, ${l.counts.passed} passed / ${l.counts.failed} failed / ${l.counts.skipped} skipped`);
  }
  if (result.manual.length) {
    out.push('');
    out.push('  Manual steps nobody confirmed (they do not block the release) 未確認的人工步驟（不擋）:');
    for (const m of result.manual) out.push(`    - ${m.id} — ${m.platforms.join(', ')}`);
  }
  if (result.notes.length) {
    out.push('');
    out.push('  Notes 注意（不擋）:');
    for (const n of result.notes) out.push(`    - ${n}`);
  }
  if (!result.ok) {
    out.push('');
    out.push(`  REFUSED — ${result.problems.length} thing(s) missing or wrong 拒絕，缺或錯的共 ${result.problems.length} 項:`);
    result.problems.forEach((p, i) => out.push(`    ${i + 1}. ${p}`));
  }
  return out.join('\n');
}
