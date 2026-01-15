---
source: skills/claude-code/refactoring-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-12
status: current
name: refactoring-assistant
description: |
  引導重構决策和大規模程序码改进。
  使用时机：重構程序码、遺留系统現代化、技術債、重写决策。
  关鍵字：refactor, rewrite, legacy, strangler, technical debt, 重構, 重写, 技術債.
---

# 重構助手

> **语言**: [English](../../../../../skills/claude-code/refactoring-assistant/SKILL.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2026-01-12
**適用範圍**: Claude Code Skills

---

## 目的

本技能提供重構与重写的决策框架、大規模重構模式，以及技術債管理。

---

## 快速參考（YAML 壓縮格式）

```yaml
# === 决策：重構 vs 重写 ===
decision_tree:
  - q: "程序码在生产環境运行？"
    n: "→ 考慮重写（風險較低）"
    y: next
  - q: "了解程序码的功能？"
    n: "→ 先写特徵测试"
    y: next
  - q: "测试覆蓋率 >60%？"
    n: "→ 先補测试"
    y: next
  - q: "核心架構可修復？"
    n: "→ Strangler Fig 模式"
    y: "→ 增量重構 ✓"

comparison_matrix:
  favor_refactor: [大型程序庫, 良好测试, 业务关鍵, 团队熟悉, 架構健全, 时间緊迫, 低風險]
  favor_rewrite: [小型獨立, 無测试, 可容忍停机, 無人熟悉, 架構有缺陷, 时间充裕, 較高風險]

# === 警告：第二系统效应 ===
rewrite_antipatterns:
  - "加入原本没有的功能"
  - "为未來彈性過度抽象"
  - "忽略現有系统的經驗教訓"
quote: "第二个系统是一个人设计過最危險的系统。— Fred Brooks"

# === 規模：重構策略 ===
scales:
  small:
    duration: "5-15 分鐘"
    scope: "单一方法/类别"
    techniques: [提取方法, 重新命名, 內联变數, 替换魔術數字]
  medium:
    duration: "數小时到數天"
    scope: "一个功能/模組"
    checklist: [定義範圍, 識别入口点, "覆蓋率>80%", 增量提交, 与团队溝通]
  large:
    duration: "數周到數月"
    scope: "多个模組/系统"
    patterns: [strangler_fig, branch_by_abstraction, parallel_change]

# === 模式：大規模重構 ===
strangler_fig:
  phases:
    1_攔截: "请求 → 外觀 → 舊系统(100%)"
    2_迁移: "请求 → 外觀 → [新系统(功能A), 舊系统(其餘)]"
    3_完成: "请求 → 新系统(100%) [舊系统除役]"

branch_by_abstraction:
  steps:
    1: "客户端 → 抽象层(界面) → 舊实作"
    2: "客户端 → 抽象层 → [舊实作, 新实作(切换)]"
    3: "客户端 → 新实作 [移除舊实作]"

expand_migrate_contract:
  phases:
    expand: "新增新的，保留舊的，新程序用新的，舊程序仍可用"
    migrate: "更新所有客户端使用新的，验证，数据迁移"
    contract: "移除舊的，清理，更新文件"

# === 遺留程序码：策略 ===
legacy:
  definition: "没有测试的程序码（不論年齡）"
  dilemma: "安全修改需要测试 → 加测试需要修改程序码"
  solution: "使用安全技術先加测试"

characterization_tests:
  purpose: "捕捉現有行为（非验证正确性）"
  process:
    1: "呼叫要理解的程序码"
    2: "写预期会失败的斷言"
    3: "执行，觀察实际結果"
    4: "更新斷言以匹配实际行为"
    5: "重複直到涵蓋需要修改的行为"

# === 技術債管理 ===
quadrant: # Martin Fowler
  prudent_deliberate: "我們知道这是債务"
  reckless_deliberate: "没时间做设计"
  prudent_inadvertent: "現在知道应該怎麼做了"
  reckless_inadvertent: "什麼是分层？"

priority:
  high: {criteria: "阻塞开发，頻繁出錯", action: "立即处理"}
  medium: {criteria: "拖慢开发，增加複雜度", action: "規划到下个迭代"}
  low: {criteria: "小麻煩，影響局部", action: "有机会就处理"}
```

---

## 配置偵测

### 偵测順序

1. 检查 `CONTRIBUTING.md` 中的「停用技能」區段
2. 检查 `CONTRIBUTING.md` 中的「重構标准」區段
3. 如果未找到，**预设使用标准重構实踐**

---

## 详细指南

完整标准請參阅：
- [重構标准](../../../core/refactoring-standards.md)

---

## 相关标准

- [重構标准](../../../core/refactoring-standards.md) - 核心标准
- [测试驅动开发](../../../core/test-driven-development.md) - TDD 重構阶段
- [程序码审查检查清单](../../../core/code-review-checklist.md) - 重構 PR 审查
- [簽入标准](../../../core/checkin-standards.md) - 提交前要求
- [TDD 助手](../tdd-assistant/SKILL.md) - TDD 工作流程

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-12 | 初始發布 |

---

## 授权

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
