---
source: docs/user/GLOSSARY.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 术语表

> **语言**: [English](../../../../docs/user/GLOSSARY.md) | 简体中文

UDS 专属，或在 UDS 语境下有特定用法的术语。

---

## A

**AC（Acceptance Criterion，验收条件）**
一条可测试的陈述，定义一个功能何时算完成。以 Given-When-Then 或一般英文撰写。AC 记录在 Spec 文件中，并在测试里被引用。
_参见：`/atdd`、`/sdd`、`acceptance-test-driven-development` 标准_

**Activity（活动）**
在 DEC-051 四层分类模型中，Activity 是一个具名的工作流步骤（例如「编写失败的测试」、「执行回归测试」）。Activity 定义于 UDS 标准中，并由 Skill 执行。

**ADR（Architecture Decision Record，架构决策记录）**
记录一项重大技术决策的文件：上下文、考量过的选项、所选方案，以及后果。
_参见：`/adr`、`adr-standards` 标准_

**ATDD（Acceptance Test-Driven Development，验收测试驱动开发）**
一种实践做法：在开始实现前先定义验收条件，并编写测试来验证这些 AC。桥接 BDD 与 TDD。
_参见：`/atdd`_

---

## B

**BDD（Behavior-Driven Development，行为驱动开发）**
一种使用自然语言 Given-When-Then 场景来描述系统行为的开发实践。场景同时作为文档与测试规格。
_参见：`/bdd`、`behavior-driven-development` 标准_

**Bundle（Bundle 层）**
包含在 `npm install` 包中的 UDS 标准子集（供采用者使用）。与 Source 层不同——后者包含所有标准，含治理与维护工具。
_参见：DEC-045_

---

## C

**Core Standard（核心标准）**
位于 `core/`（以及 `.standards/*.md`）的 Markdown 文件，包含某个 UDS 标准完整、人类可读的版本。涵盖背后理由、边界情况、示例与参考资料。
_对比：AI Standard_

**AI Standard（AI 标准）**
位于 `.standards/`（以及 `ai/standards/`）的 `.ai.yaml` 文件，是 Core Standard 的 token 精简、为 AI 优化的编码。Skill 在执行时读取它。

---

## D

**DEC（Decision，决策）**
记录于 `dev-platform/cross-project/decisions/DEC-NNN-*.md` 的跨项目架构或产品决策。DEC 依序编号，追踪重大选择背后的「为什么」。

**Dual-Layer Architecture（双层架构）**
UDS 的两层设计：Core Standards（完整知识、人类可读）+ AI Standards（token 精简、机器可读）。Skill 使用 AI Standards；开发者阅读 Core Standards。

---

## S

**SDD（Spec-Driven Development，规格驱动开发）**
一种 UDS 实践做法：在写代码前先创建规格文件。Spec 定义背景、范围、验收条件与范围外项目。
_参见：`/sdd`、`spec-driven-development` 标准_

**Skill**
封装为 SKILL.md 文件的预建 AI 工作流。在 Claude Code 输入 `/<name>` 即可激活。Skill 运用 AI Standards 来实现 UDS 的活动。
_参见：[SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md)_

**Skill Budget（Skill 预算）**
Claude Code 的 context window 中保留来列出可用 skill 的比例。当有 54+ 个 skill 时，描述可能被截断。UDS 以 Tier 来管理这项预算。
_参见：DEC-061、[skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)_

**Skill Tier（Skill 分级，DEC-061）**
依使用频率对 skill 进行分类，借此控制列出行为：
- **Tier 1（Core）**：13 个 skill，每日使用，永远以描述列出
- **Tier 2（Advanced）**：27 个 skill，每周使用，默认以描述列出
- **Tier 3（Specialist）**：14 个 skill，事件驱动，默认仅列出名称（仍可通过 `/<name>` 调用）

**Standard（标准）**
涵盖某项特定实践（例如 commit 消息、API 设计、测试）的 UDS 准则文件。标准与技术、语言无关。每个标准同时存在为 Core Standard（`.md`）与 AI Standard（`.ai.yaml`）。

**Source（Source 层）**
完整的 UDS 仓库，包含所有标准、治理工具与维护脚本。是 Bundle 层的超集。
_参见：DEC-045_

---

## T

**TDD（Test-Driven Development，测试驱动开发）**
一种在实现代码前先编写测试的开发实践。RED-GREEN-REFACTOR 循环：写一个失败的测试 → 让它通过 → 重构。
_参见：`/tdd`、`test-driven-development` 标准_

---

## U

**UDS（Universal Development Standards，通用开发标准）**
本项目。一套与语言无关、与框架无关的软件开发质量汇集，含 125 个核心标准、54 个 AI skill 与 48 个斜线命令。

**UDS Manifest（`uds-manifest.json`）**
所有 UDS 标准与 skill 的机器可读索引。包含统计数据、skill 对命令的对照，以及分类归属。供 UDS CLI 与文档生成器使用。

---

## X

**XSPEC（Cross-Project Spec，跨项目规格）**
位于 `dev-platform/cross-project/specs/XSPEC-NNN-*.md` 的规格文件。用于影响多个子项目（UDS、VibeOps、telemetry）的功能，或新的 UDS 功能。
_依集中化政策（2026-04-22），所有新 spec 一律创建为 XSPEC。_

---

## 术语规范化（Canonical Forms，标准形式）

> 跨标准反复出现的术语与符号之单一真实来源（XSPEC-292 T6）。这些表格把**既有、刻意为之**的惯例明文化，让新标准对齐而非漂移。它们**不会**重新命名任何东西——多数看似「双重术语」的情况其实是依层级设计、各得其所（例如 JSON body 中的 `createdAt` 对比数据库字段的 `created_at` 是正确的，并非冲突）。

### 依层级的字段命名

同一个概念依其所在层级的惯例书写。跨越层级边界是一种转换，而非不一致。

| 层级 | 惯例 | 示例 |
|------|------|------|
| 结构化日志（JSON） | `snake_case` | `trace_id`、`request_id`、`http_method`、`db_table` |
| API JSON body | `camelCase` | `createdAt`、`firstName`、`httpStatus` |
| API 查询参数 | `snake_case` | `?sort_by=created_at` |
| URL 路径片段 | `kebab-case` | `/user-profiles` |
| HTTP header 名称 | `lowercase-hyphen` | `x-request-id`、`traceparent` |
| 数据库数据表／字段 | `snake_case`（单数数据表）| `user_account`、`created_at` |
| 代码标识符 | 语言原生 | `camelCase`（JS/TS）、`snake_case`（Python/Go）|

_标准：`logging-standards`、`api-design-standards`、`database-standards`。_

### 测试层级缩写

大写＝该术语；小写＝环境标识符。`IT` 永远指 Integration Testing（集成测试），绝非 Information Technology。

| 缩写 | 全称 | 典型环境 |
|------|------|----------|
| `UT` | Unit Testing（单元测试）| `local` |
| `IT` | Integration Testing（集成测试）| `local` / `ci` |
| `ST` | System Testing（系统测试）| `ci` / `sit` |
| `E2E` | End-to-End Testing（端到端测试）| `staging` |
| `AT` | Acceptance Testing（验收测试）| — |
| `UAT` | User Acceptance Testing（用户验收测试）| — |
| `SIT` | System Integration Testing（系统集成测试，该术语）；`sit` 是 SIT **环境** id | `ci` |

_标准：`testing`（testing-standards）、`test-governance`。_

### 状态：文字 vs 符号

**文字**是标准／机器可读的值；**符号**是可选的视觉呈现。两者成对，并非互相竞争。

| 标准文字 | 符号 | 领域 |
|----------|------|------|
| `covered` | ✅ | AC／测试覆盖 |
| `partial` | ⚠️ | AC／测试覆盖 |
| `uncovered` | ❌ | AC／测试覆盖（测试缺口）|
| `not_implemented` | 🚫 | AC（代码缺口，非测试缺口）|

_领域专属的生命周期各自维持独立的状态机——ADR（`Proposed → Accepted → Deprecated → Superseded`）、文档生命周期（`draft → active → archived`），以及上方的 AC 覆盖彼此不同，**不会**被合并。标准：`acceptance-criteria-traceability`、`adr-standards`、`documentation-structure`。_

---

## 另见

- [FAQ.md](FAQ.md) — 常见问题
- [SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md) — 所有 skill 与描述
- [GETTING-STARTED.md](GETTING-STARTED.md) — 首次设置
