---
description: |
  Generate usage documentation from project sources | 從專案來源產生使用說明文件
allowed-tools: Read, Write, Glob, Grep, Bash(node:*)
argument-hint: "[--lang <en|zh-TW|zh-CN>] [--cheatsheet|--reference] | [語言選項] [格式選項]"
---

# /generate-docs

Generate comprehensive usage documentation based on `.usage-docs.yaml` configuration.

從專案來源自動產生完整的使用說明文件。

## Workflow | 工作流程

1. **Check configuration** | **檢查配置**
   - Read `.usage-docs.yaml` for source definitions
   - 讀取 `.usage-docs.yaml` 取得來源定義

2. **Scan sources** | **掃描來源**
   - CLI commands, skills, slash commands, agents, workflows, standards, scripts
   - CLI 指令、技能、斜線命令、代理、工作流程、核心規範、腳本

3. **Generate documents** | **產生文件**
   - FEATURE-REFERENCE.md (detailed) | FEATURE-REFERENCE.md（詳細版）
   - CHEATSHEET.md (quick reference) | CHEATSHEET.md（速查表）

4. **Output for each language** | **輸出各語言版本**
   - English, Traditional Chinese, Simplified Chinese
   - 英文、繁體中文、簡體中文

## Usage | 使用方式

| Command | Description | 說明 |
|---------|-------------|------|
| `/generate-docs` | Generate all documentation | 產生所有文件 |
| `/generate-docs --lang en` | Generate English only | 僅產生英文版 |
| `/generate-docs --lang zh-TW` | Generate Traditional Chinese | 產生繁體中文版 |
| `/generate-docs --cheatsheet` | Generate cheatsheet only | 僅產生速查表 |
| `/generate-docs --reference` | Generate reference only | 僅產生參考手冊 |
| `/generate-docs --check` | Check if update needed | 檢查是否需要更新 |

## Output Files | 輸出檔案

| Language | Path | 路徑 |
|----------|------|------|
| English | `docs/FEATURE-REFERENCE.md`, `docs/CHEATSHEET.md` | |
| 繁體中文 | `locales/zh-TW/docs/FEATURE-REFERENCE.md`, `locales/zh-TW/docs/CHEATSHEET.md` | |
| 简体中文 | `locales/zh-CN/docs/FEATURE-REFERENCE.md`, `locales/zh-CN/docs/CHEATSHEET.md` | |

## Quick Commands | 快速指令

```bash
# Generate all
node scripts/generate-usage-docs.mjs

# Check sync status
./scripts/check-usage-docs-sync.sh

# Fix if out of sync
./scripts/check-usage-docs-sync.sh --fix
```

## Example Interaction | 互動範例

```
User: /generate-docs

AI: I'll generate the usage documentation for your project.

Running: node scripts/generate-usage-docs.mjs

📊 Scanned 113 features:
- 9 CLI commands
- 24 slash commands
- 24 skills
- 5 agents
- 5 workflows
- 23 core standards
- 20 scripts

✅ Generated 6 documents:
- docs/FEATURE-REFERENCE.md
- docs/CHEATSHEET.md
- locales/zh-TW/docs/FEATURE-REFERENCE.md
- locales/zh-TW/docs/CHEATSHEET.md
- locales/zh-CN/docs/FEATURE-REFERENCE.md
- locales/zh-CN/docs/CHEATSHEET.md
```

## Reference | 參考

- Full skill guide: [docs-generator SKILL](../docs-generator/SKILL.md)
- Configuration: `.usage-docs.yaml`

---

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
