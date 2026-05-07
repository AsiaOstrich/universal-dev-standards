/**
 * UDS Flow Command — SPEC-FLOW-001
 *
 * CLI 命令：管理自訂 SDLC 流程（create/list/validate/diff/export/import）。
 *
 * @deprecated XSPEC-095 (2026-04-28): Runtime relocated to adoption layer.
 *   The list/validate/diff operations are adoption-layer responsibility:
 *   adoption layers must implement equivalent flow management commands
 *   in their own toolchain.
 *
 *   棄用理由：UDS 專注於活動定義；流程編排由採用層承擔（XSPEC-086 /
 *   DEC-049 — orchestration runtime moved to adoption layer 2026-04-28）。
 *   UDS 5.x 仍維持本命令可用（向後相容），UDS 6.0.0 將移除。
 *   建議遷移：實作於採用層工具鏈。
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import yaml from 'js-yaml';
import { parseFlow } from '../flow/flow-parser.js';
import { listFlows, validateFlowById, diffFlows } from '../flow/flow-commands.js';
import { exportBundle, importBundle, validateBundle } from '../flow/flow-bundler.js';

/**
 * 從互動式回答建立 Flow 物件。
 * @param {object} answers - 互動式回答
 * @param {string} answers.id - Flow ID
 * @param {string} answers.name - Flow 名稱
 * @param {string|null} answers.base - 繼承的 base flow ID
 * @param {Array<{id, name, commands}>} answers.stages - Stages 定義
 * @returns {object} Flow 物件（可序列化為 YAML）
 */
export function buildFlowFromAnswers(answers) {
  const flow = {
    id: answers.id,
    name: answers.name
  };

  if (answers.base) {
    flow.extends = answers.base;
  }

  if (answers.stages && answers.stages.length > 0) {
    flow.stages = answers.stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      steps: stage.commands.map(cmd => ({
        command: cmd,
        required: true
      }))
    }));
  }

  flow.config = {
    enforcement: 'suggest',
    allow_skip_optional: true,
    state_persistence: true,
    gate_timeout: 30
  };

  return flow;
}

/**
 * 載入所有可用 flows（built-in + custom）。
 * @param {string} projectPath - 專案根目錄
 * @returns {object[]} Flow 物件陣列
 */
export function loadAllFlows(projectPath) {
  const flows = [];

  // Built-in flows from .standards/flows/
  const builtInDir = join(projectPath, '.standards', 'flows');
  if (existsSync(builtInDir)) {
    for (const file of readdirSync(builtInDir).filter(f => f.endsWith('.flow.yaml'))) {
      try {
        const content = readFileSync(join(builtInDir, file), 'utf-8');
        const flow = parseFlow(content);
        flow._source = 'built-in';
        flows.push(flow);
      } catch {
        // Skip invalid files
      }
    }
  }

  // Custom flows from .uds/flows/
  const customDir = join(projectPath, '.uds', 'flows');
  if (existsSync(customDir)) {
    for (const file of readdirSync(customDir).filter(f => f.endsWith('.flow.yaml'))) {
      try {
        const content = readFileSync(join(customDir, file), 'utf-8');
        const flow = parseFlow(content);
        flow._source = 'custom';
        flows.push(flow);
      } catch {
        // Skip invalid files
      }
    }
  }

  return flows;
}

/**
 * CLI action: uds flow create
 */
export async function flowCreateCommand(options) {
  const inquirer = await import('inquirer');
  const projectPath = process.cwd();

  const answers = await inquirer.default.prompt([
    { type: 'input', name: 'id', message: 'Flow ID (kebab-case):', validate: v => /^[a-z0-9-]+$/.test(v) || '必須為 kebab-case' },
    { type: 'input', name: 'name', message: 'Flow 名稱:' },
    { type: 'list', name: 'base', message: '繼承自哪個預設流程？', choices: ['(從零開始)', 'sdd', 'tdd', 'bdd'], filter: v => v === '(從零開始)' ? null : v }
  ]);

  // 如果從零開始，收集 stages
  if (!answers.base) {
    answers.stages = [];
    let addMore = true;
    while (addMore) {
      const stage = await inquirer.default.prompt([
        { type: 'input', name: 'id', message: 'Stage ID:' },
        { type: 'input', name: 'name', message: 'Stage 名稱:' },
        { type: 'input', name: 'commands', message: '命令（逗號分隔，如 /sdd,/tdd）:' }
      ]);
      answers.stages.push({
        id: stage.id,
        name: stage.name,
        commands: stage.commands.split(',').map(c => c.trim())
      });
      const cont = await inquirer.default.prompt([
        { type: 'confirm', name: 'more', message: '繼續新增 stage？', default: false }
      ]);
      addMore = cont.more;
    }
  } else {
    answers.stages = [];
  }

  const flow = buildFlowFromAnswers(answers);
  const outputDir = join(projectPath, '.uds', 'flows');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, `${flow.id}.flow.yaml`);
  writeFileSync(outputPath, yaml.dump(flow, { lineWidth: -1 }));
  console.log(`✅ 流程已建立：${outputPath}`);
}

/**
 * CLI action: uds flow list
 */
export function flowListCommand() {
  const flows = loadAllFlows(process.cwd());
  const listed = listFlows(flows);

  if (listed.length === 0) {
    console.log('沒有找到任何流程定義。');
    return;
  }

  console.log('\n可用的流程：');
  for (const f of listed) {
    const ext = f.extends ? ` (extends: ${f.extends})` : '';
    console.log(`  ${f.id} [${f.label}] — ${f.stageCount} stages${ext}`);
  }
  console.log('');
}

/**
 * CLI action: uds flow validate <id>
 */
export function flowValidateCommand(id) {
  const flows = loadAllFlows(process.cwd());
  const registry = Object.fromEntries(flows.map(f => [f.id, f]));
  const result = validateFlowById(id, registry, { availableCommands: [] });

  if (result.valid) {
    console.log(`✅ 流程 "${id}" 驗證通過`);
  } else {
    console.log(`❌ 流程 "${id}" 有 ${result.errors.length} 個問題：`);
    for (const err of result.errors) {
      console.log(`  - ${err.message}`);
    }
  }
}

/**
 * CLI action: uds flow diff <a> <b>
 */
export function flowDiffCommand(idA, idB) {
  const flows = loadAllFlows(process.cwd());
  const registry = Object.fromEntries(flows.map(f => [f.id, f]));

  if (!registry[idA]) { console.log(`❌ 流程 "${idA}" 不存在`); return; }
  if (!registry[idB]) { console.log(`❌ 流程 "${idB}" 不存在`); return; }

  const diff = diffFlows(registry[idA], registry[idB]);

  console.log(`\n比較 ${idA} → ${idB}：`);
  if (diff.stages.added.length) console.log(`  新增 stages: ${diff.stages.added.join(', ')}`);
  if (diff.stages.removed.length) console.log(`  移除 stages: ${diff.stages.removed.join(', ')}`);
  for (const mod of diff.steps.modified) {
    if (mod.added.length) console.log(`  ${mod.stageId}: 新增 steps ${mod.added.join(', ')}`);
    if (mod.removed.length) console.log(`  ${mod.stageId}: 移除 steps ${mod.removed.join(', ')}`);
  }
  if (!diff.stages.added.length && !diff.stages.removed.length && !diff.steps.modified.length) {
    console.log('  （無差異）');
  }
  console.log('');
}

/**
 * CLI action: uds flow export <id>
 */
export function flowExportCommand(id, options) {
  const flows = loadAllFlows(process.cwd());
  const flow = flows.find(f => f.id === id);
  if (!flow) { console.log(`❌ 流程 "${id}" 不存在`); return; }

  const bundle = exportBundle(flow, {});
  const outputPath = options.output || `${id}.bundle.yaml`;
  writeFileSync(outputPath, yaml.dump(bundle, { lineWidth: -1 }));
  console.log(`✅ Bundle 已匯出：${outputPath}`);
}

/**
 * CLI action: uds flow import <file>
 */
export function flowImportCommand(file, options) {
  const content = readFileSync(file, 'utf-8');
  const bundle = yaml.load(content);
  const flows = loadAllFlows(process.cwd());
  const existingIds = flows.map(f => f.id);

  const result = importBundle(bundle, { existingFlowIds: existingIds });

  if (result.conflicts.length > 0 && !options.force) {
    console.log(`⚠️ 衝突：${result.conflicts.join(', ')} 已存在。使用 --force 覆寫。`);
    return;
  }

  const outputDir = join(process.cwd(), '.uds', 'flows');
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  writeFileSync(join(outputDir, `${result.flow.id}.flow.yaml`), yaml.dump(result.flow, { lineWidth: -1 }));

  const gatesDir = join(process.cwd(), '.uds', 'gates');
  if (result.gates.length > 0) {
    if (!existsSync(gatesDir)) mkdirSync(gatesDir, { recursive: true });
    for (const gate of result.gates) {
      writeFileSync(join(gatesDir, `${gate.id}.gate.yaml`), yaml.dump(gate, { lineWidth: -1 }));
    }
  }

  console.log(`✅ 已匯入流程 "${result.flow.id}" 和 ${result.gates.length} 個閘門`);
}
