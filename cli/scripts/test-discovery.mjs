#!/usr/bin/env node

/**
 * UDS 測試發現與執行工具
 * 專為 AI Agent 設計的測試導航器
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TESTS_DIR = join(__dirname, '..', 'tests');

class TestDiscovery {
  constructor() {
    this.testFiles = [];
    this.testCategories = {
      unit: { path: 'unit', description: '單元測試', files: [] },
      utils: { path: 'utils', description: '工具測試', files: [] },
      commands: { path: 'commands', description: '命令測試', files: [] },
      prompts: { path: 'prompts', description: '提示測試', files: [] },
      e2e: { path: 'e2e', description: '端到端測試', files: [] }
    };
  }

  /**
   * 發現所有測試文件
   */
  discoverTests() {
    this.scanDirectory(TESTS_DIR);
    this.categorizeTests();
    this.analyzeTestCounts();
    return this.getTestSummary();
  }

  /**
   * 掃描測試目錄
   */
  scanDirectory(dir) {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && item !== 'node_modules') {
        this.scanDirectory(fullPath);
      } else if (item.endsWith('.test.js')) {
        this.testFiles.push({
          path: fullPath,
          relative: fullPath.replace(TESTS_DIR + '/', ''),
          name: item,
          category: this.determineCategory(fullPath)
        });
      }
    }
  }

  /**
   * 確定測試類別
   */
  determineCategory(filePath) {
    if (filePath.includes('/unit/')) return 'unit';
    if (filePath.includes('/e2e/')) return 'e2e';
    if (filePath.includes('/commands/')) return 'commands';
    if (filePath.includes('/prompts/')) return 'prompts';
    if (filePath.includes('/utils/')) return 'utils';
    return 'other';
  }

  /**
   * 分類測試文件
   */
  categorizeTests() {
    for (const testFile of this.testFiles) {
      const category = testFile.category;
      if (this.testCategories[category]) {
        this.testCategories[category].files.push(testFile);
      }
    }
  }

  /**
   * 分析測試數量
   */
  analyzeTestCounts() {
    for (const category of Object.values(this.testCategories)) {
      let totalTests = 0;
      for (const file of category.files) {
        try {
          const content = readFileSync(file.path, 'utf8');
          const testCount = (content.match(/(describe|it|test)\(/g) || []).length;
          file.testCount = testCount;
          totalTests += testCount;
        } catch (error) {
          file.testCount = 0;
        }
      }
      category.totalTests = totalTests;
      category.totalFiles = category.files.length;
    }
  }

  /**
   * 獲取測試摘要
   */
  getTestSummary() {
    const summary = {
      totalFiles: this.testFiles.length,
      totalTests: 0,
      categories: {}
    };

    for (const [key, category] of Object.entries(this.testCategories)) {
      summary.categories[key] = {
        description: category.description,
        fileCount: category.totalFiles,
        testCount: category.totalTests,
        files: category.files.map(f => ({
          name: f.name,
          path: f.relative,
          testCount: f.testCount
        }))
      };
      summary.totalTests += category.totalTests;
    }

    return summary;
  }

  /**
   * 生成執行命令
   */
  generateExecutionCommands(scenario = 'development') {
    const commands = {
      development: this.getDevelopmentCommands(),
      full: this.getFullCommands(),
      category: this.getCategoryCommands(),
      specific: this.getSpecificCommands()
    };
    return commands[scenario] || commands.development;
  }

  /**
   * 開發階段命令（快速）
   */
  getDevelopmentCommands() {
    return {
      quick: 'npm test -- tests/unit/ tests/utils/ tests/commands/ tests/prompts/',
      unitOnly: 'npm test -- tests/unit/ tests/utils/',
      commandsOnly: 'npm test -- tests/commands/',
      promptsOnly: 'npm test -- tests/prompts/',
      description: '快速開發循環 - 排除耗時的 E2E 測試',
      estimatedTime: '< 6 秒完成 1,619 個測試'
    };
  }

  /**
   * 完整測試命令
   */
  getFullCommands() {
    return {
      all: 'npm test',
      unit: 'npm test -- tests/unit/ tests/utils/ tests/commands/ tests/prompts/',
      e2e: 'npm run test:e2e',
      description: '完整測試套件 - 包含所有 2,931 個測試',
      estimatedTime: '59+ 分鐘（E2E 測試需要用戶終端執行）',
      e2eWarning: 'E2E 測試在背景執行會超時，建議在用戶終端中執行'
    };
  }

  /**
   * 分類測試命令
   */
  getCategoryCommands() {
    const commands = {};
    for (const [key, category] of Object.entries(this.testCategories)) {
      if (category.files.length > 0) {
        const paths = category.files.map(f => f.relative).join(' ');
        commands[key] = `npm test -- ${paths}`;
      }
    }
    return commands;
  }

  /**
   * 特定場景命令
   */
  getSpecificCommands() {
    return {
      coreChanges: 'npm test -- tests/unit/core/ tests/unit/utils/ tests/commands/',
      commandChanges: 'npm test -- tests/commands/ tests/e2e/',
      promptChanges: 'npm test -- tests/prompts/ tests/e2e/init-flow.test.js',
      installerChanges: 'npm test -- tests/unit/utils/*installer*.test.js tests/e2e/',
      description: '根據變更類型選擇對應的測試組合'
    };
  }

  /**
   * 格式化輸出測試信息
   */
  formatOutput(summary) {
    let output = '\n🎯 UDS CLI 測試發現報告\n';
    output += '=' .repeat(50) + '\n\n';
    
    output += `📊 總覽：\n`;
    output += `   總文件數：${summary.totalFiles} 份\n`;
    output += `   總測試數：${summary.totalTests} 個\n\n`;

    for (const [key, category] of Object.entries(summary.categories)) {
      if (category.fileCount > 0) {
        output += `📂 ${category.description} (${category.fileCount} 份文件，${category.testCount} 個測試)\n`;
        
        // 按測試數量排序
        const sortedFiles = category.files.sort((a, b) => b.testCount - a.testCount);
        
        for (const file of sortedFiles.slice(0, 5)) { // 只顯示前 5 個最大的文件
          output += `   ├─ ${file.name} (${file.testCount} 個測試)\n`;
        }
        
        if (category.files.length > 5) {
          output += `   └─ ... 還有 ${category.files.length - 5} 個文件\n`;
        }
        output += '\n';
      }
    }

    return output;
  }

  /**
   * 執行測試並返回結果
   */
  async executeTests(command, timeout = 300000) {
    try {
      const result = execSync(command, {
        cwd: TESTS_DIR,
        encoding: 'utf8',
        timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      return { success: true, output: result };
    } catch (error) {
      return {
        success: false,
        output: error.stdout || error.message,
        error: error.stderr || error.message
      };
    }
  }
}

/**
 * CLI 介面
 */
async function main() {
  const discovery = new TestDiscovery();
  const args = process.argv.slice(2);

  // 發現測試
  const summary = discovery.discoverTests();
  
  // 輸出格式化報告
  console.log(discovery.formatOutput(summary));

  // 根據參數執行不同操作
  const command = args[0];
  
  switch (command) {
    case 'run':
    case 'execute':
      const scenario = args[1] || 'development';
      const commands = discovery.generateExecutionCommands(scenario);
      console.log('\n🚀 執行命令：');
      
      if (scenario === 'development') {
        console.log(`\n${commands.description}`);
        console.log(`預估時間：${commands.estimatedTime}`);
        console.log(`\n執行：${commands.quick}`);
        
        const result = await discovery.executeTests(commands.quick);
        console.log(result.output);
        
        if (!result.success) {
          console.log('❌ 測試執行失敗');
          process.exit(1);
        }
      } else {
        console.log(JSON.stringify(commands, null, 2));
      }
      break;
      
    case 'commands':
      const scenarioType = args[1] || 'development';
      const execCommands = discovery.generateExecutionCommands(scenarioType);
      console.log('\n📋 可用命令：');
      console.log(JSON.stringify(execCommands, null, 2));
      break;
      
    case 'json':
      console.log(JSON.stringify(summary, null, 2));
      break;
      
    case 'help':
      console.log(`
🎯 UDS 測試發現工具

用法：
  node test-discovery.js [命令] [選項]

命令：
  run [scenario]     - 執行測試 (development, full, category, specific)
  commands [scenario] - 顯示執行命令
  json              - 輸出 JSON 格式
  help              - 顯示此幫助

範例：
  node test-discovery.js run development  # 快速開發測試
  node test-discovery.js commands full    # 顯示完整測試命令
  node test-discovery.js json             # JSON 格式輸出
`);
      break;
      
    default:
      // 默認顯示發現報告
      break;
  }
}

// 如果直接執行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TestDiscovery };