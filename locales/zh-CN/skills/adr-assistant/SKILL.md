---
source: ../../../../skills/adr-assistant/SKILL.md
source_version: 1.0.0
source_hash: 7d8bf5944cf4
translation_version: 1.0.0
last_synced: 2026-06-01
status: current
description: |
  [UDS] 创建、管理和追踪架构决策记录（ADR）。
  使用时机：架构决策、技术选型、设计取舍、模式选择。
  关键字：ADR, architecture decision, decision record, 架构决策, 决策记录。
---

# 架构决策记录助手

> **语言**: [English](../../../../skills/adr-assistant/SKILL.md) | 简体中文

创建、管理和追踪架构决策记录。捕捉重大技术决策的背景、选项和理由。

## 工作流程

```
CAPTURE ──► ANALYZE ──► DECIDE ──► RECORD ──► LINK
  捕捉背景    分析选项    做出决策    记录 ADR    建立链接
```

### 阶段 1：CAPTURE | 捕捉背景

识别驱动决策的背景与约束条件。

| 步骤 | 动作 |
|------|------|
| 1 | 识别问题或机会 |
| 2 | 列出约束条件（时间、预算、团队技能） |
| 3 | 定义决策驱动因素 |

### 阶段 2：ANALYZE | 分析选项

至少探索 2 个选项，列出优缺点。

| 步骤 | 动作 |
|------|------|
| 1 | 头脑风暴候选方案 |
| 2 | 根据决策驱动因素评估各方案 |
| 3 | 记录各方案优缺点 |

### 阶段 3：DECIDE | 做出决策

选择最佳方案并阐述理由。

### 阶段 4：RECORD | 记录 ADR

依照标准模板生成 ADR 文件。

### 阶段 5：LINK | 建立链接

与相关工件（规格、PR、代码）建立交叉引用。

## 快速参考

### 何时撰写 ADR

| 撰写 ADR | 不需要 ADR |
|----------|-----------|
| 框架/库选择 | 例行性依赖更新 |
| API 合约或数据格式 | 现有架构内的 Bug 修复 |
| 部署策略变更 | 代码风格决策 |
| 建立新模式 | 琐碎的实现选择 |

**经验法则**：如果 6 个月后有人可能会问「为什么？」，就写一份 ADR。

### 状态生命周期

```
Proposed ──► Accepted ──► Deprecated
                │
                └──► Superseded by ADR-NNN
```

| 状态 | 说明 |
|------|------|
| **Proposed** | 讨论中，尚未决定 |
| **Accepted** | 已接受，应遵循 |
| **Deprecated** | 不再适用 |
| **Superseded** | 已被新 ADR 取代 |

### 模板摘要

```markdown
# ADR-NNN: [决策标题]

- Status: [Proposed | Accepted | Deprecated | Superseded]
- Date: YYYY-MM-DD
- Deciders: [参与决策者]
- Technical Story: [SPEC-ID 或 Issue]

## Context（背景）
## Decision Drivers（决策驱动因素）
## Considered Options（考虑的选项）
## Decision Outcome（决策结果）
### Consequences（后果：Good / Bad / Neutral）
## Links（相关链接）
```

### 存放位置

```
docs/adr/
├── ADR-001-short-description.md
├── ADR-002-short-description.md
└── README.md    # 索引（可选）
```

## 指令

| 指令 | 说明 |
|------|------|
| `/adr` | 交互式创建 ADR |
| `/adr create` | 创建新 ADR |
| `/adr list` | 列出所有 ADR 及状态 |
| `/adr search [关键字]` | 依关键字搜索 ADR |
| `/adr supersede [ADR-NNN]` | 取代现有 ADR |
| `/adr review` | 审查过期的 ADR |

## 与其他技能的集成

| 技能 | 集成方式 |
|------|---------|
| `/sdd` | 在技术设计中引用 ADR；重大决策时建议创建 ADR |
| `/code-review` | 代码审查时引用 ADR 作为设计依据 |
| `/commit` | 提交时在 footer 加入 ADR 编号 |
| `/brainstorm` | 头脑风暴结果作为 ADR 选项分析输入 |

## 质量检查清单

| 检查项 | 标准 |
|--------|------|
| ☐ 背景 | 清楚说明问题 |
| ☐ 选项 | 至少考虑 2 个选项 |
| ☐ 驱动因素 | 决策驱动因素明确列出 |
| ☐ 后果 | 包含正面与负面结果 |
| ☐ 链接 | 相关工件已引用 |

## 下一步引导

`/adr` 完成后，AI 助手应建议：

> **ADR 已创建。建议下一步：**
> - 执行 `/sdd` 创建规格（若决策需要实现）
> - 执行 `/commit` 提交 ADR 文件
> - 更新相关规格以引用此 ADR
> - 若状态为 `Proposed`，分享给团队审查

## AI 代理行为

当用户调用 `/adr` 时，AI 助手必须：

1. **检查现有 ADR** — 搜索 `docs/adr/` 以确定下一个 ADR 编号
2. **交互式引导** — 逐步询问背景、驱动因素和选项
3. **生成文件** — 将 ADR 写入 `docs/adr/ADR-NNN-title.md`
4. **建议链接** — 识别相关规格或 ADR 以建立交叉引用
5. **提供下一步** — 显示上方的下一步引导

当用户调用 `/adr list` 时：
1. 扫描 `docs/adr/` 目录
2. 解析每个 ADR 文件的状态
3. 以表格显示：编号、标题、状态、日期

当用户调用 `/adr supersede [ADR-NNN]` 时：
1. 读取现有 ADR
2. 引导创建新 ADR
3. 将旧 ADR 状态更新为 `Superseded by ADR-NNN`
4. 在新 ADR 中加入 `Supersedes ADR-NNN`

## 参考

- 核心规范：[adr-standards.md](../../../../core/adr-standards.md)
- 详细指南：[guide.md](./guide.md)
