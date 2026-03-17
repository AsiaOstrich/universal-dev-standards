---
source: ../../../core/documentation-structure.md
source_version: 1.5.0
translation_version: 1.5.0
last_synced: 2026-03-17
status: current
---

> **语言**: [English](../../../core/documentation-structure.md) | [简体中文](../../zh-TW/core/documentation-structure.md) | 简体中文

# 文档结构标准

**版本**: 1.5.0
**最后更新**: 2026-03-17
**适用范围**: 所有需要文档的软件项目

---

## 目的

本标准定义项目文档的组织结构和命名规范，确保文档的一致性和可发现性。

---

## 目录结构

### 推荐结构

```
project/
├── README.md              # 项目概述
├── CHANGELOG.md           # 版本变更记录
├── CONTRIBUTING.md        # 贡献指南
├── LICENSE                # 许可证
├── docs/
│   ├── getting-started.md # 快速入门
│   ├── installation.md    # 安装指南
│   ├── configuration.md   # 配置说明
│   ├── specs/             # 规格文档
│   │   ├── README.md      # 规格索引
│   │   ├── system/        # 系统设计规格
│   │   └── {component}/   # 组件规格
│   ├── api/               # API 文档
│   │   └── README.md
│   ├── guides/            # 使用指南
│   │   └── README.md
│   └── architecture/      # 架构文档
│       └── README.md
└── examples/              # 示例代码
    └── README.md
```

---

## 文件命名

### 规范

| 规则 | 示例 |
|------|------|
| 使用小写字母 | getting-started.md |
| 使用连字符分隔 | api-reference.md |
| 有意义的名称 | configuration.md |
| 避免特殊字符 | ❌ api_v2(new).md |

### 常用文件名

| 文件 | 用途 |
|------|------|
| README.md | 目录/项目说明 |
| CHANGELOG.md | 版本变更 |
| CONTRIBUTING.md | 贡献指南 |
| LICENSE | 许可证 |
| SECURITY.md | 安全政策 |
| CODE_OF_CONDUCT.md | 行为准则 |

---

## README 模板

### 基本结构

```markdown
# 项目名称

简短描述项目用途。

## 功能

- 功能 1
- 功能 2

## 安装

```bash
npm install package-name
```

## 使用

```javascript
const pkg = require('package-name');
pkg.doSomething();
```

## 文档

详细文档请参阅 [docs/](docs/)。

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
```

---

## Markdown 风格

### 标题

```markdown
# 一级标题（仅用于文档标题）
## 二级标题
### 三级标题
```

### 代码块

````markdown
```javascript
const example = 'code';
```
````

### 链接

```markdown
[显示文本](url)
[相对链接](../other-doc.md)
```

---

## 快速参考卡

### 必要文件

| 文件 | 必要性 |
|------|-------|
| README.md | 必要 |
| LICENSE | 必要 |
| CHANGELOG.md | 推荐 |
| CONTRIBUTING.md | 推荐 |

### 命名检查清单

- [ ] 使用小写字母
- [ ] 使用连字符分隔单词
- [ ] 名称描述内容
- [ ] 无特殊字符

---

## 规格文档

### 目的

规格文档定义**实作前**的设计与实作细节。

| 类型 | 目的 | 位置 |
|------|------|------|
| **规格** | 定义要建什么及如何建 | `docs/specs/` |
| **文档** | 说明建了什么 | `docs/` |

### 规格目录结构

```
docs/specs/
├── README.md               # 规格索引
├── system/                 # 系统设计规格
└── {component}/            # 组件规格
    ├── design/             # 设计规格
    └── {module}/           # 实作规格
```

---

## 开发中间产物（工作文件）

开发过程会产生不属于正式文件但需要可被发现的中间文件。这些「工作文件」存放在 `docs/working/` 中，并有定义的生命周期。

### 目录结构

```
docs/working/
├── README.md                 # 索引与生命周期规则
├── brainstorms/              # YYYY-MM-DD-topic.md
├── investigations/           # 技术调查与研究
├── rfcs/                     # RFC-NNN-title.md
├── meeting-notes/            # 会议记录
└── poc/                      # 概念验证文件
    └── {poc-name}/
        └── README.md         # 发现、结论、后续步骤
```

### 状态头部（必需）

每份工作文件必须包含状态头部：

```markdown
---
status: draft | active | graduated | archived
created: YYYY-MM-DD
author: 姓名
graduated-to: path/to/formal-doc.md  # 若已毕业
---
```

### 生命周期管理

| 文件类型 | 目录 | 保留期限 | 毕业路径 |
|---------|------|---------|---------|
| **头脑风暴** | `brainstorms/` | 活跃 6 个月 | → 规格（`docs/specs/`）或丢弃 |
| **技术调查** | `investigations/` | 直到解决 | → ADR（`docs/ADR/`）或知识库 |
| **RFC** | `rfcs/` | 直到决定 | → ADR（`docs/ADR/`）若被接受 |
| **会议记录** | `meeting-notes/` | 12 个月 | → 归档或丢弃 |
| **POC** | `poc/` | 直到功能决策 | → 功能实现或丢弃 |

### 毕业流程

1. 将工作文件状态更新为 `graduated`
2. 在头部加入 `graduated-to: path/to/formal-doc.md`
3. 在适当位置创建正式文件
4. 保留工作文件作为历史参考（不要删除）

### 命名惯例

| 类型 | 格式 | 示例 |
|------|------|------|
| 头脑风暴 | `YYYY-MM-DD-topic.md` | `2026-03-04-caching-strategy.md` |
| 技术调查 | `YYYY-MM-DD-topic.md` | `2026-03-04-oom-root-cause.md` |
| RFC | `RFC-NNN-title.md` | `RFC-001-api-versioning.md` |
| 会议记录 | `YYYY-MM-DD-topic.md` | `2026-03-04-sprint-planning.md` |
| POC | `{poc-name}/README.md` | `redis-caching/README.md` |

---

## 扩展文件类型矩阵

本矩阵扩展上方的文件需求矩阵，包含所有文件类型及其标准位置。

### 代码相关文件

| 文件类型 | 位置 | 说明 |
|---------|------|------|
| API 参考 | `docs/api-reference.md` | 建议自动生成 |
| 架构概览 | `docs/architecture.md` | 高级系统设计 |
| ADR | `docs/ADR/NNN-title.md` | 架构决策记录 |
| 规格 | `docs/specs/` | 规格文件 |
| 疑难排解 | `docs/troubleshooting.md` | 常见问题与解决方案 |
| 流程图 | `docs/flows/` | 流程与数据流 |
| 架构图 | `docs/diagrams/` | 可视化架构（.mmd、.puml） |

### 工作文件

| 文件类型 | 位置 | 说明 |
|---------|------|------|
| 头脑风暴 | `docs/working/brainstorms/` | 日期前缀、生命周期管理 |
| 技术调查 | `docs/working/investigations/` | 技术研究报告 |
| RFC | `docs/working/rfcs/` | 请求评论，编号管理 |
| 会议记录 | `docs/working/meeting-notes/` | 日期前缀记录 |
| POC 报告 | `docs/working/poc/` | 每个 POC 一个子目录 |

### 项目级别文件

| 文件类型 | 位置 | 说明 |
|---------|------|------|
| README | 根目录 `/` | 大写，必需 |
| CONTRIBUTING | 根目录 `/` | 大写 |
| CHANGELOG | 根目录 `/` | 大写，Keep a Changelog 格式 |
| LICENSE | 根目录 `/` | 大写，无扩展名 |
| SECURITY | 根目录 `/` | 大写，安全策略 |
| 快速入门 | `docs/getting-started.md` | 快速入门指南 |
| 部署指南 | `docs/deployment.md` | 部署说明 |

---

## 相关标准

- [API 文档标准](api-documentation-standards.md)
- [变更日志标准](changelog-standards.md)
- [规格驱动开发](spec-driven-development.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.4.0 | 2026-03-04 | 新增：开发中间产物（docs/working/）目录与生命周期管理、扩展文件类型矩阵 |
| 1.3.0 | 2026-01-24 | 新增规格文档标准 |
| 1.0.0 | 2025-12-30 | 初始版本 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
