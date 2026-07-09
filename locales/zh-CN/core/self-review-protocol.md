---
source: ../../../core/self-review-protocol.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-07-09
source_hash: 35603d9b6211
status: current
---

# Self-Review Protocol（自我审查协议）

> **语言**: [English](../../../core/self-review-protocol.md) | [繁體中文](../../zh-TW/core/self-review-protocol.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-07-09
**适用范围**: 所有软件项目（新建、重构、迁移、维护）
**范围**: partial
**业界标准**: ISO/IEC 25010（文档可维护性）、IEEE 1063-2001（软件用户文档）
**参考**: 受 Google Engineering Practices 代码审查实践启发；专为大型 markdown 对象编辑特化

---

## 目的

本标准规范大型 markdown 编辑**commit 前**必跑 **self-review**，捕捉内部 cross-reference 不一致 — 这类问题惯性被内部推理忽略，但完整 re-read 一次即可 surface。

**与其他标准的关系**：
- 与 [code-review.md](code-review-checklist.md) 互补（后者涵盖代码变更）
- 与 [documentation-writing-standards.md](documentation-writing-standards.md) 互补（后者涵盖内容创作）
- 本标准专注于**大型 markdown 文档**（DEC、ADR、XSPEC、SKILL.md、规格文档、runbook 等）的**编辑后验证**

---

## 背景

多次 Claude 辅助编辑 session（如 `dev-platform/.claude/skills/eval-source/SKILL.md` v1.1.0 → v1.1.1、v1.2.0 → v1.2.1）观察到一致模式：**每次大型 markdown 编辑都引入 3-6 处小型内部不一致**，内部推理看不出来，但完整 re-read 立刻 surface。

这些不一致归纳为 **6 大类**，且固定触发后续 patch commit。在 commit 前加入强制 re-read 步骤后，此模式消失（eval-source v1.3.0 为首次无 patch follow-up 的 SKILL.md 变更）。第 7 大类（语言与术语一致性）为后续因不同动机（跨对话 AI 输出漂移，非原始 patch 周期模式）新增，详见下方。

---

## 触发条件

| 变更规模 | 是否必跑 self-review？ |
|---|---|
| commit 修改 **> 50 行** markdown | **必跑** |
| commit 修改 ≤ 50 行 markdown | 可选（小修常无 cross-ref 风险）|
| 纯 code / config 变更 | 不适用（另有 lint / test / code review）|

适用文件类型：
- ADR（架构决策记录）
- 跨项目规格（XSPEC）与 SDD Delta
- SKILL.md（Claude Code 自定义 skill）
- ARCHITECTURE.md、API.md、DEPLOYMENT.md、MIGRATION.md 等长型项目文档
- Runbook、playbook
- README.md（修改主要 section 时）

---

## 7 类常见内部不一致

### 1. Diagram / Flow 与 step list 不同步
**示例**：工作流程图 7 格但文档实际定义 8 步骤
**检查**：数每个 diagram 节点数量 vs `## Step N:` / `## N.` heading

### 2. Changelog 引用编号错位
**示例**：Changelog 写「Step 1 新增 X」但 X 实际在 Step 0
**检查**：对每条 changelog 描述，grep 其引用的 anchor 位置

### 3. 计数错位
**示例**：文档说「自我审计 4 题」但实际 list 有 7 题
**检查**：grep 「N 题」「N 列」「N 点」等明确数字并对照实际 count

### 4. Stale 模板
**示例**：commit 模板写死 `Claude Sonnet 4.6` 但实际模型随环境变动
**检查**：找硬编码的模型名、工具版本、日期；改为 placeholder 或更新

### 5. 错误工具 / 命令引用
**示例**：建议用 `claude --version` 取得模型名，但该命令只显示 CLI 版本
**检查**：对每个提及的 CLI 命令做 mental check 或 `which X` / `--help` 验证

### 6. Placeholder 与 rule 不对齐
**示例**：example 写「D1/D2/D3」但 rule 明说 D3 不强制，且当前案例正好把 D3 降为后续追踪
**检查**：example 中每个具体值是否与当前 rule 一致；example 不应与最新案例经验矛盾

### 7. 语言与术语一致性
**示例**：双语文档某段落中英文夹杂，或日文假名/韩文谚文混入简体中文段落；或同一份文档内「XSPEC」「gate」「pipeline」等项目惯用术语写法不一致
**检查**：扫描非目标语言文字是否出现在非预期段落（如日文假名 U+3040–U+30FF、韩文谚文 U+AC00–U+D7A3 混入简体中文段落）、同段落语言混杂、以及同一文件内既有惯用术语拼法是否一致

---

## 流程

1. **edit 完成后、commit 前**，用 file-reading 工具重新读过**完整文件**（不只 diff）
2. 依上方 7 类逐项对照
3. **发现问题** → 直接 Edit 修补后再 commit（同一 commit 包含修正，不要分开 ship）
4. **若已 commit 才发现** → 新增 patch commit（如 v1.2.1 对 v1.2.0）

---

## 记录格式（按文件类型）

### SKILL.md
在 frontmatter 附近 changelog 追加一行：
```
> **v{X.Y.(Z+1)} Self-review pass {YYYY-MM-DD}**：找到 {N} 处 issue，{M} 处于同 commit 修正；或「0 issues found」
```

### ADR / DEC
在 `## 后续追踪` 表格新增一行：
```
| Self-review pass | 本 DEC | ✅ YYYY-MM-DD (7 类无 issue) |
```

### XSPEC SDD Delta
在「不改动清单」section（如 §N.6）后追加：
```
> Self-review pass: YYYY-MM-DD (7 类无 issue)
```

### Commit message body
最后一行附：
```
Self-review (protocol v1.1.0): N issues found, M applied in same commit / 0 found.
```

---

## 与其他审查实践的区别

| 实践 | 涵盖面向 | 触发时机 |
|---|---|---|
| **Code Review**（[code-review.md](code-review-checklist.md)）| 代码正确性、设计、安全 | code PR merge 前 |
| **内容自我审计**（如 eval-source skill 7 题）| 内容完整性（是否包含所有必要 section）| 每次文档产出 |
| **Self-Review Protocol**（本标准）| 内部 cross-reference 一致性（形式，非内容）| 大型 markdown 编辑后、commit 前 |
| **同侪审查** | 独立视角、blast radius 评估 | 重要变更 |

三层审查互补：
- **内容审计** 问：*是否包含所有必要的部分？*
- **Self-review** 问：*包含的部分内部一致吗？*
- **同侪审查** 问：*从另一个角度看，这个变更合理吗？*

---

## 反模式

1. **因为「diff 看起来不大」就跳过 self-review** — 大文件的小 diff 常引入其他位置的 cross-ref 错误
2. **只 review diff 而非整文件** — cross-ref 错误可能在未变动的 section 中（引用了已变动内容）
3. **记录 protocol 但不执行** — 纪律在于实践，不在于文档本身
4. **把 self-review 当 peer review 的替代品** — self-review 抓不一致，不抓设计缺陷

---

## 验证

采纳本标准的验证方式：

- **Patch commit 比例**：采纳后，同一对象 `v1.X.0 → v1.X.1` 后续 patch 比例应显著下降（eval-source 从 v1.3.0 前的 100% 降至之后的 0%）
- **Issue surface 时间**：self-review 抓到的 issue（pre-commit）vs 下一个 reader 抓到的 issue（post-commit）— 前者应上升、后者应下降

---

## 实践案例

- **dev-platform** `eval-source` skill v1.3.0 — 首次 SKILL.md 变更在 commit 前 self-review pass（commit `6b45c5d`）；前有两次 patch 周期（v1.1.0→v1.1.1 3 处、v1.2.0→v1.2.1 6 处）促成本标准诞生

---

## Self-Review Pass

> Self-review pass: 2026-05-26 (6 类无 issue；本标准首稿同步 self-review)
> Self-review pass: 2026-07-09（7 类无 issue —— 依 XSPEC-324 新增第 7 类「语言与术语一致性」）
