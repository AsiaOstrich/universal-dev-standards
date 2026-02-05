---
source: ../../../../skills/documentation-guide/readme-template.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# README 範本與最佳實踐

> **語言**: [English](../../../../skills/documentation-guide/readme-template.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供撰寫 README 檔案的範本和最佳實踐。

---

## README 章節參考

### 必要章節（最小需求）

| 章節 | 目的 | 必要 |
|---------|---------|:--------:|
| 專案名稱 | 識別 | ✅ |
| 描述 | 功能說明 | ✅ |
| 安裝 | 安裝方式 | ✅ |
| 使用 | 使用方式 | ✅ |
| 授權 | 法律條款 | ✅ |

### 建議章節

| 章節 | 目的 | 何時包含 |
|---------|---------|-----------------|
| Badges | 狀態指標 | CI、npm、覆蓋率 |
| 功能 | 主要能力 | 多功能專案 |
| 快速開始 | 快速上手 | 複雜設定 |
| API 參考 | 技術文件 | 函式庫/API |
| 配置 | 設定選項 | 可配置工具 |
| 貢獻 | 如何協助 | 開源專案 |
| 變更記錄 | 版本歷程 | 版本化專案 |
| FAQ | 常見問題 | 面向使用者的專案 |
| 致謝 | 感謝名單 | 社群專案 |

---

## README 範本

### 最小 README

```markdown
# Project Name

Brief description of what this project does.

## Installation

```bash
npm install project-name
```

## Usage

```javascript
const lib = require('project-name');
lib.doSomething();
```

## License

MIT
```

### 標準 README

```markdown
# Project Name

Brief description of what this project does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install project-name
```

## Usage

```javascript
const { feature } = require('project-name');

// Basic usage
feature.doSomething();

// With options
feature.doSomething({ option: 'value' });
```

## Documentation

See [docs/](docs/) for detailed documentation.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT - see [LICENSE](LICENSE)
```

### 完整 README

```markdown
# Project Name

[![CI Status](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
[![npm version](https://badge.fury.io/js/project-name.svg)](https://www.npmjs.com/package/project-name)
[![Coverage](https://codecov.io/gh/org/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/org/repo)

Brief description of what this project does and why it exists.

## Features

- **Fast**: 10x faster than alternatives
- **Simple**: Easy to learn API
- **Extensible**: Plugin architecture
- **Type-safe**: Full TypeScript support

## Installation

### npm

```bash
npm install project-name
```

### yarn

```bash
yarn add project-name
```

### pnpm

```bash
pnpm add project-name
```

## Quick Start

```javascript
const { Client } = require('project-name');

const client = new Client({ apiKey: 'your-key' });

const result = await client.doSomething();
console.log(result);
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Configuration](docs/configuration.md)
- [Examples](examples/)

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | - | Your API key |
| `timeout` | number | 30000 | Request timeout in ms |
| `retries` | number | 3 | Number of retry attempts |

## Examples

See the [examples/](examples/) directory for complete examples:

- [Basic Usage](examples/basic/)
- [Advanced Features](examples/advanced/)
- [Integration](examples/integration/)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/org/repo.git
cd repo
npm install
npm test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## FAQ

### How do I do X?

Answer to common question.

### Why does Y happen?

Explanation of behavior.

## Support

- [GitHub Issues](https://github.com/org/repo/issues)
- [Documentation](https://docs.example.com)
- [Discord](https://discord.gg/example)

## Acknowledgments

- [Library A](https://example.com) - Used for X
- [Person B](https://github.com/person) - Initial idea

## License

MIT - see [LICENSE](LICENSE) for details.
```

---

## 章節細節

### 專案名稱與描述

**良好**:
```markdown
# FastJSON

A blazing-fast JSON parser for Node.js with streaming support.
```

**不良**:
```markdown
# my-project

This is a project.
```

### Badges

常見徽章：
```markdown
[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
[![npm](https://img.shields.io/npm/v/package.svg)](https://www.npmjs.com/package/package)
[![Coverage](https://codecov.io/gh/org/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/org/repo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
```

### 安裝

如果適用，包含多個套件管理器：

```markdown
## Installation

### npm
```bash
npm install package-name
```

### yarn
```bash
yarn add package-name
```
```

### 使用範例

**良好** - 展示真實使用案例：
```markdown
## Usage

```javascript
const { parseJSON } = require('fast-json');

// Parse a JSON file
const data = parseJSON('./config.json');
console.log(data.settings);

// Parse with options
const strictData = parseJSON('./data.json', { strict: true });
```
```

**不良** - 過於抽象：
```markdown
## Usage

```javascript
const lib = require('lib');
lib.func();
```
```

### 配置表格

```markdown
## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 30000 | Request timeout (ms) |
| `retries` | number | 3 | Max retry attempts |
| `debug` | boolean | false | Enable debug logging |
```

---

## 常見錯誤

### ❌ 過於模糊

```markdown
# Project

A project for doing things.

## Install

Install it.

## Use

Use it.
```

### ❌ 沒有範例

```markdown
# JSON Parser

A JSON parser library.

See API docs for usage.
```

### ❌ 資訊過時

```markdown
## Requirements

- Node.js 8+  ← 過時
- npm 5+      ← 過時

## Installation

```bash
npm install old-package-name  ← 錯誤的套件名稱
```
```

### ❌ 連結失效

```markdown
See [documentation](docs/old-path.md) for more info.  ← 連結不存在
```

---

## README 品質檢查清單

- [ ] 專案名稱清楚說明
- [ ] 用 1-2 句話解釋目的
- [ ] 安裝說明完整
- [ ] 使用範例確實可運作
- [ ] 所有連結都已驗證有效
- [ ] 版本需求準確
- [ ] 授權清楚說明
- [ ] 提供聯絡/支援資訊（面向使用者的專案）

---

## 相關標準

- [Documentation Structure Reference](./documentation-structure.md)
- [Documentation Writing Standards](../../core/documentation-writing-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：標準章節（目的、相關標準、版本歷史、授權） |

---

## 授權

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
