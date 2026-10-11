---
source: ../../../../skills/documentation-guide/SKILL.md
source_version: 2.1.0
translation_version: 2.2.0
last_synced: 2026-10-11
source_hash: a23a49fa4b9c
status: current
description: |
  引导文档结构、内容需求与项目文档的最佳实践。
  Use when: 创建 README、撰写文档、规划 docs 目录、项目初始设置、技术文档。
  Not for: 从源代码机械式生成文档——请用 /docgen；变更日志条目——请用 /changelog。
  Keywords: README, docs, documentation, CONTRIBUTING, CHANGELOG, ARCHITECTURE, API docs, 文档, 说明文档, 技术文档.
---

# 文档指南

> **语言**: [English](../../../../skills/documentation-guide/SKILL.md) | 简体中文

**版本**: 2.1.0
**最后更新**: 2026-03-17
**适用范围**: Claude Code Skills

---

## 目的

本 Skill 提供项目文档的全面指导，包括：
- 文档结构和文件组织
- 按项目类型划分的内容需求
- 技术文档的撰写标准
- 常见文档类型的模板

---

## 快速参考（YAML 压缩格式）

```yaml
# === 项目类型 → 文档需求 ===
document_matrix:
  #           README  ARCH   API    DB     DEPLOY MIGRATE ADR    CHANGE CONTRIB
  new:        [REQ,   REQ,   if_app, if_app, REQ,   NO,     REC,   REQ,   REC]
  refactor:   [REQ,   REQ,   REQ,    REQ,    REQ,   REQ,    REQ,   REQ,   REC]
  migration:  [REQ,   REQ,   REQ,    REQ,    REQ,   REQ,    REQ,   REQ,   REC]
  maintenance:[REQ,   REC,   REC,    REC,    REC,   NO,     if_app, REQ,   if_app]
  # REQ=必要, REC=建议, if_app=如适用, NO=不需要

# === 文档金字塔 ===
pyramid:
  level_1: "README.md → 入口点，快速概览"
  level_2: "ARCHITECTURE.md → 系统概述"
  level_3: "API.md, DATABASE.md, DEPLOYMENT.md → 技术细节"
  level_4: "ADR/, MIGRATION.md, CHANGELOG.md → 变更历史"

# === 必要文件 ===
root_files:
  README.md: {required: true, purpose: "项目概述、快速入门"}
  CONTRIBUTING.md: {required: "recommended", purpose: "贡献指南"}
  CHANGELOG.md: {required: "recommended", purpose: "版本历史"}
  LICENSE: {required: "for OSS", purpose: "许可信息"}

docs_structure:
  INDEX.md: "文档索引"
  ARCHITECTURE.md: "系统架构"
  API.md: "API 文档"
  DATABASE.md: "数据库 schema"
  DEPLOYMENT.md: "部署指南"
  MIGRATION.md: "迁移计划（如适用）"
  ADR/: "架构决策记录"

# === 文件命名 ===
naming:
  root: "UPPERCASE.md (README.md, CONTRIBUTING.md, CHANGELOG.md)"
  docs: "lowercase-kebab-case.md (getting-started.md, api-reference.md)"

# === 质量标准 ===
quality:
  format:
    language: "英文（或项目指定）"
    encoding: "UTF-8"
    line_length: "建议 ≤120 字符"
    diagrams: "优先使用 Mermaid，其次 ASCII Art"
    links: "内部链接使用相对路径"
  maintenance:
    sync: "代码变更时更新文档"
    version: "顶部标示版本和日期"
    review: "文档纳入代码审查"
    periodic: "每季度检查文档是否过时"

# === DIÁTAXIS 分类 ===
diataxis:
  tutorial: "以学习为导向（getting-started.md）"
  how_to: "以任务为导向（deployment.md, migration.md）"
  reference: "以信息为导向（api-reference.md, CHANGELOG.md）"
  explanation: "以理解为导向（architecture.md, ADR/）"
  header: "加入 **Document Type**: Tutorial | How-to | Reference | Explanation"

# === LLM 发现 ===
llm_discovery:
  llms_txt: "位于项目根目录、供 LLM 检索的结构化索引"
  llms_full_txt: "可选的完整串接文档"
  when: "公开项目、公开 API、使用 AI 工具的项目"

# === 质量指标 ===
quality_metrics:
  leading: ["覆盖率 ≥90%", "新鲜度 ≤90 天", "链接健康度 100%", "示例有效性 100%"]
  lagging: ["支持工单减少", "上手时间", "与文档相关的 PR 评论"]
  tools: [markdown-link-check, lychee, remark-lint, vale, textstat]

# === ADR 增强 ===
adr_enhanced:
  new_fields: [Date, Deciders, Drivers, "supersedes/superseded-by"]
  lifecycle: "proposed → accepted → [deprecated | superseded]"
  decision_matrix: "影响 × 可逆性 → 是否需要 ADR？"

# === 翻译友好 ===
translation_friendly:
  rules: ["完整句子", "不用习语", "术语一致", "简单的主谓宾结构", "明确的指代"]
  glossary: "维护 glossary.md 以保持术语一致"
  status_tracking: "以 YAML frontmatter 记录 translation_status、source_version"
```

---

## 项目类型文档需求

### 文档需求矩阵

| 文档 | 新项目 | 重构 | 迁移 | 维护 |
|------|:------:|:----:|:----:|:----:|
| **README.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ✅ 必要 |
| **ARCHITECTURE.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ⚪ 建议 |
| **API.md** | ⚪ 如适用 | ✅ 必要 | ✅ 必要 | ⚪ 建议 |
| **DATABASE.md** | ⚪ 如适用 | ✅ 必要 | ✅ 必要 | ⚪ 建议 |
| **DEPLOYMENT.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ⚪ 建议 |
| **MIGRATION.md** | ❌ 不需要 | ✅ 必要 | ✅ 必要 | ❌ 不需要 |
| **ADR/** | ⚪ 建议 | ✅ 必要 | ✅ 必要 | ⚪ 如适用 |
| **CHANGELOG.md** | ✅ 必要 | ✅ 必要 | ✅ 必要 | ✅ 必要 |

### 项目类型快速参考

```
🆕 新项目     → README + ARCHITECTURE + DEPLOYMENT + CHANGELOG
🔄 重构       → 所有文档 + MIGRATION + ADR（记录“为何重构”）
🚚 迁移       → 所有文档 + MIGRATION（核心文档）+ 数据验证
🔧 维护       → README + CHANGELOG（依变更范围更新）
```

---

## 文档金字塔

```
                    ┌─────────────┐
                    │   README    │  ← 入口点，快速概览
                    ├─────────────┤
                 ┌──┴─────────────┴──┐
                 │   ARCHITECTURE    │  ← 系统概述
                 ├───────────────────┤
              ┌──┴───────────────────┴──┐
              │  API / DATABASE / DEPLOY │  ← 技术细节
              ├─────────────────────────┤
           ┌──┴─────────────────────────┴──┐
           │    ADR / MIGRATION / CHANGELOG │  ← 变更历史
           └───────────────────────────────┘
```

---

## 文档模板（YAML 压缩格式）

```yaml
# === README.md ===
readme:
  minimum:
    - "# 项目名称"
    - "简短的单行描述"
    - "## 安装"
    - "## 使用"
    - "## 许可"
  recommended:
    - "# 项目名称 + 徽章"
    - "## 功能（项目符号列表）"
    - "## 安装"
    - "## 快速入门 / 使用"
    - "## 文档（链接至 docs/）"
    - "## 贡献（链接至 CONTRIBUTING.md）"
    - "## 许可"

# === ARCHITECTURE.md ===
architecture:
  required:
    - system_overview: "目的、范围、主要功能"
    - architecture_diagram: "Mermaid 或 ASCII Art"
    - module_description: "职责、依赖"
    - technology_stack: "框架、语言、版本"
    - data_flow: "主要业务流程"
  recommended:
    - deployment_architecture: "生产环境拓扑"
    - design_decisions: "关键决策（或链接至 ADR）"

# === API.md ===
api:
  required:
    - api_overview: "版本、基础 URL、身份验证"
    - authentication: "Token 获取、过期时间"
    - endpoint_list: "所有 API 端点"
    - endpoint_specs: "请求/响应格式"
    - error_codes: "错误码和说明"
  recommended:
    - code_examples: "常见语言的示例"
    - rate_limiting: "API 调用频率限制"
  endpoint_format: |
    ### POST /api/v1/resource
    **请求**: | 字段 | 类型 | 必要 | 说明 |
    **响应**: | 字段 | 类型 | 说明 |
    **错误**: | 代码 | 说明 |

# === DATABASE.md ===
database:
  required:
    - db_overview: "类型、版本、连接信息"
    - er_diagram: "实体关系图"
    - table_list: "所有数据表及用途"
    - table_specs: "字段定义"
    - index_docs: "索引策略"
    - migration_scripts: "脚本位置"
  recommended:
    - backup_strategy: "频率、保留期限"
  table_format: |
    ### 数据表名称
    **字段**: | 字段 | 类型 | 可为空 | 默认值 | 说明 |
    **索引**: | 名称 | 字段 | 类型 |
    **关联**: | 关联表 | 连接字段 | 关系 |

# === DEPLOYMENT.md ===
deployment:
  required:
    - environment_requirements: "硬件、软件、网络"
    - installation_steps: "详细流程"
    - configuration: "配置文件参数"
    - verification: "确认部署成功"
    - troubleshooting: "常见问题和解决方案"
  recommended:
    - monitoring: "健康检查、日志位置"
    - scaling_guide: "水平/垂直扩展"

# === MIGRATION.md ===
migration:
  required:
    - overview: "目标、范围、时间表"
    - prerequisites: "必要准备工作"
    - migration_steps: "详细流程"
    - verification_checklist: "迁移后检查"
    - rollback_plan: "失败时的步骤"
    - backward_compatibility: "API/数据库兼容性"
  recommended:
    - partner_notification: "需通知的外部系统"

# === ADR（架构决策记录）===
adr:
  filename: "NNN-kebab-case-title.md（例如：001-use-postgresql.md）"
  required:
    - title: "决策名称"
    - status: "proposed | accepted | deprecated | superseded"
    - context: "为何需要此决策"
    - decision: "具体决策内容"
    - consequences: "影响（正面/负面）"
  recommended:
    - alternatives: "考虑过的其他选项"
```

---

## 文件位置标准

```
project-root/
├── README.md                    # 项目入口文档
├── CONTRIBUTING.md              # 贡献指南
├── CHANGELOG.md                 # 变更日志
├── LICENSE                      # 许可文件
└── docs/                        # 文档目录
    ├── INDEX.md                 # 文档索引
    ├── ARCHITECTURE.md          # 架构文档
    ├── API.md                   # API 文档
    ├── DATABASE.md              # 数据库文档
    ├── DEPLOYMENT.md            # 部署文档
    ├── MIGRATION.md             # 迁移文档（如需要）
    └── ADR/                     # 架构决策记录
        ├── 001-xxx.md
        └── ...
```

---

## README.md 必要章节

### 最小可行 README

```markdown
# 项目名称

简短的单行描述。

## 安装

```bash
npm install your-package
```

## 使用

```javascript
const lib = require('your-package');
lib.doSomething();
```

## 许可

MIT
```

### 建议的 README 章节

1. **项目名称与描述**
2. **徽章**（CI 状态、覆盖率、npm 版本）
3. **功能**（项目符号列表）
4. **安装**
5. **快速入门 / 使用**
6. **文档**（链接至 docs/）
7. **贡献**（链接至 CONTRIBUTING.md）
8. **许可**

---

## ADR 模板

```markdown
# ADR-001: [决策标题]

**日期**: YYYY-MM-DD
**状态**: proposed | accepted | deprecated | superseded
**决策者**: [参与人员列表]
**取代**: ADR-NNN（如适用）
**被取代于**: ADR-NNN（如适用）

## 驱动因素

- [关键因素 1]
- [关键因素 2]

## 背景
[为何需要此决策...]

## 决策
[具体决策内容...]

## 影响

### 正面
- 好处 1
- 好处 2

### 负面
- 缺点 1
- 缺点 2

## 考虑过的替代方案

### 方案 A：[名称]
- **优点**: ...
- **缺点**: ...
- **否决原因**: ...
```

**何时撰写 ADR**（影响 × 可逆性）：
- **高影响 + 难以逆转** → 必须撰写 ADR
- **高影响 + 容易逆转** → 可选
- **低影响 + 难以逆转** → 可选
- **低影响 + 容易逆转** → 不需要 ADR

---

## 文档审计检查清单

审查项目文档时：

```
□ README.md 存在且包含必要章节
□ 安装说明清楚且经过测试
□ 使用示例已提供且可运行
□ 已指定许可
□ ARCHITECTURE.md 存在（非简单项目）
□ API.md 存在（如有暴露 API）
□ DATABASE.md 存在（如使用数据库）
□ DEPLOYMENT.md 存在（已部署的项目）
□ 重大决策有对应的 ADR/
□ CHANGELOG.md 遵循 Keep a Changelog 格式
□ 所有内部链接正常
□ 图表是最新的
□ 无过时信息
```

---

## 配置检测

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的“Disabled Skills”区段
2. 检查 `CONTRIBUTING.md` 中的“Documentation Language”区段
3. 检查现有文档结构
4. 若未找到，**默认为英文**

### 首次设置

如果缺少文档：

1. 询问：“此项目没有完整的文档。应该使用哪种语言？(English / 中文)”
2. 判断项目类型（新项目/重构/迁移/维护）
3. 依矩阵创建必要文档
4. 建议在 `CONTRIBUTING.md` 中记录：

```markdown
## 文档标准

### 语言
此项目使用 **英文** 作为文档语言。

### 必要文档
根据项目类型，我们维护：
- README.md
- ARCHITECTURE.md
- DEPLOYMENT.md
- CHANGELOG.md
```

---

## 详细指南

完整标准请参阅：
- [文档撰写标准](../../../../core/documentation-writing-standards.md)
- [文档结构标准](../../../../core/documentation-structure.md)
- [README 模板](./readme-template.md)

---

## 下一步引导

`/docs-guide` 完成后，AI 助手应建议：

> **文档结构与需求已厘清。建议下一步：**
> - 执行 `/docs` 根据指南直接生成项目文档 ⭐ **推荐** — 立即将文档指南化为行动
> - 执行 `/changelog` 创建或更新 CHANGELOG.md — 确保变更历史完整
> - 执行 `/sdd` 将文档需求纳入规格驱动开发 — 确保文档与功能同步

---

## 相关标准

- [文档撰写标准](../../../../core/documentation-writing-standards.md) - 内容需求
- [文档结构标准](../../../../core/documentation-structure.md) - 文件组织
- [变更日志标准](../../../../core/changelog-standards.md) - CHANGELOG 格式
- [变更日志指南技能](../changelog-guide/SKILL.md) - CHANGELOG 技能

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.1.0 | 2026-03-17 | 新增：Diátaxis 分类、LLM 发现、质量指标、增强版 ADR 模板、翻译友好写作 |
| 2.0.0 | 2026-01-12 | 新增：项目类型矩阵、文档模板、文档金字塔 |
| 1.0.0 | 2025-12-24 | 初始版本 |

---

## 许可

本 Skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
