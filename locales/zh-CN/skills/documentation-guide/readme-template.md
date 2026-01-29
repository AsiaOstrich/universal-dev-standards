---
source: skills/documentation-guide/readme-template.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# README 範本与最佳实踐

> **语言**: [English](../../../../skills/documentation-guide/readme-template.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供撰写 README 文件的範本和最佳实踐。

---

## README 章节參考

### 必要章节（最小需求）

| 章节 | 目的 | 必要 |
|---------|---------|:--------:|
| 项目名称 | 識别 | ✅ |
| 描述 | 功能说明 | ✅ |
| 安裝 | 安裝方式 | ✅ |
| 使用 | 使用方式 | ✅ |
| 授权 | 法律条款 | ✅ |

### 建议章节

| 章节 | 目的 | 何时包含 |
|---------|---------|-----------------|
| Badges | 状态指標 | CI、npm、覆蓋率 |
| 功能 | 主要能力 | 多功能项目 |
| 快速開始 | 快速上手 | 複雜设置 |
| API 參考 | 技術文件 | 函式庫/API |
| 配置 | 设置选项 | 可配置工具 |
| 貢獻 | 如何協助 | 開源项目 |
| 变更记录 | 版本歷程 | 版本化项目 |
| FAQ | 常見問題 | 面向使用者的项目 |
| 致謝 | 感謝名单 | 社群项目 |

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

### 标准 README

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

## 章节細节

### 项目名称与描述

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

如果適用，包含多个套件管理器：

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

**良好** - 展示真实使用案例：
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

## 常見错误

### ❌ 過於模糊

```markdown
# Project

A project for doing things.

## Install

Install it.

## Use

Use it.
```

### ❌ 没有範例

```markdown
# JSON Parser

A JSON parser library.

See API docs for usage.
```

### ❌ 信息過时

```markdown
## Requirements

- Node.js 8+  ← 過时
- npm 5+      ← 過时

## Installation

```bash
npm install old-package-name  ← 错误的套件名称
```
```

### ❌ 連結失效

```markdown
See [documentation](docs/old-path.md) for more info.  ← 連結不存在
```

---

## README 品质检查清单

- [ ] 项目名称清楚说明
- [ ] 用 1-2 句話解釋目的
- [ ] 安裝说明完整
- [ ] 使用範例确实可运作
- [ ] 所有連結都已验证有效
- [ ] 版本需求准确
- [ ] 授权清楚说明
- [ ] 提供联络/支援信息（面向使用者的项目）

---

## 相关标准

- [Documentation Structure Reference](./documentation-structure.md)
- [Documentation Writing Standards](../../core/documentation-writing-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
