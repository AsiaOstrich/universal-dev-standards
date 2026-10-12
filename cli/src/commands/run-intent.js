/**
 * run-intent command — uds run <intent>
 * Unified proxy: resolves intent to actual command via command-router
 * XSPEC-029
 */
import chalk from 'chalk';
import { execSync } from 'child_process';
import { resolveCommand } from '../core/command-router.js';
import { truncatedYamlValueLine } from '../core/project-config.js';

const KNOWN_INTENTS = ['test', 'lint', 'build', 'security'];

export async function runIntentCommand(intent, options = {}) {
  const projectPath = process.cwd();

  if (!intent) {
    console.log(chalk.yellow('使用方式: uds run <intent>'));
    console.log(chalk.gray(`可用 intent: ${KNOWN_INTENTS.join(', ')}`));
    console.log(chalk.gray('自訂 intent 可在 uds.project.yaml 的 custom: 區塊定義'));
    return;
  }

  // T12 input validation (XSPEC-292 §9): intent is a config key lookup —
  // restrict to a safe charset to reject malformed/injection-style input.
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(intent)) {
    console.error(chalk.red(`✗ intent 格式無效: "${intent}"`));
    console.log(chalk.gray('  intent 僅可含小寫字母、數字、- 與 _（例: test, lint, build）'));
    process.exit(1);
    return;
  }

  let resolved;
  try {
    resolved = resolveCommand(intent, projectPath);
  } catch (err) {
    console.error(chalk.red(`✗ 讀取 uds.project.yaml 失敗：${err.message}`));
    process.exit(1);
  }

  if (!resolved) {
    console.log();
    console.log(chalk.yellow(`⚠️  無法解析 intent "${intent}" 的執行命令`));
    console.log();
    console.log(chalk.gray('解決方式：'));
    console.log(chalk.gray('  1. 執行 uds configure 建立 uds.project.yaml'));
    console.log(chalk.gray('  2. 或在專案根目錄建立含 test:/lint: target 的 Makefile'));
    console.log(chalk.gray('  3. 或手動建立 uds.project.yaml：'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('     version: "1"'));
    console.log(chalk.gray('     commands:'));
    console.log(chalk.gray(`       ${intent}: <your command here>`));
    console.log();
    process.exit(1);
  }

  const sourceLabel = {
    'uds.project.yaml': chalk.green('uds.project.yaml'),
    'convention-runner': chalk.cyan('Makefile/justfile'),
  }[resolved.source] ?? chalk.gray(`fallback:${resolved.source.split(':')[1] ?? resolved.source}`);

  console.log();
  console.log(`${chalk.bold('uds run')} ${chalk.cyan(intent)}  ${chalk.gray('←')} ${sourceLabel}`);
  console.log(chalk.gray(`$ ${resolved.command}`));
  console.log();

  // XSPEC-475 R5(c): YAML ends an unquoted value at a space followed by `#`. When that leaves a command with an unclosed
  // quote, say so before running, in a dry run and a real run alike, so a command cut short is seen instead of discovered
  // from its error. A command that ends in a plain comment is complete and is not reported.
  const cutLine = resolved.source === 'uds.project.yaml' ? truncatedYamlValueLine(projectPath, intent, resolved.command) : null; // wire:run-truncated-value
  if (cutLine) {
    console.log(chalk.yellow(`⚠ uds.project.yaml 第 ${cutLine} 行：${intent} 的值在「空白加 #」處被 YAML 截斷，留下的指令引號不成對。`));
    console.log(chalk.yellow('  請用引號包住整個值（例如 \'...\' 或 "..."），讓 # 留在指令裡。'));
    console.log();
  }

  if (options.dryRun) {
    console.log(chalk.yellow('(dry-run mode — 未實際執行)'));
    return;
  }

  try {
    execSync(resolved.command, { stdio: 'inherit', cwd: projectPath });
  } catch (err) {
    process.exit(err.status ?? 1);
  }
}
