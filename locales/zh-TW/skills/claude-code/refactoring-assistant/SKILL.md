---
name: refactoring-assistant
description: |
  引導重構決策和大規模程式碼改進。
  使用時機：重構程式碼、遺留系統現代化、技術債、重寫決策。
  關鍵字：refactor, rewrite, legacy, strangler, technical debt, 重構, 重寫, 技術債.
---

# 重構助手

> **語言**: [English](../../../../../skills/claude-code/refactoring-assistant/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-12
**適用範圍**: Claude Code Skills

---

## 目的

本技能提供重構與重寫的決策框架、大規模重構模式，以及技術債管理。

---

## 快速參考（YAML 壓縮格式）

```yaml
# === 決策：重構 vs 重寫 ===
decision_tree:
  - q: "程式碼在生產環境運行？"
    n: "→ 考慮重寫（風險較低）"
    y: next
  - q: "了解程式碼的功能？"
    n: "→ 先寫特徵測試"
    y: next
  - q: "測試覆蓋率 >60%？"
    n: "→ 先補測試"
    y: next
  - q: "核心架構可修復？"
    n: "→ Strangler Fig 模式"
    y: "→ 增量重構 ✓"

comparison_matrix:
  favor_refactor: [大型程式庫, 良好測試, 業務關鍵, 團隊熟悉, 架構健全, 時間緊迫, 低風險]
  favor_rewrite: [小型獨立, 無測試, 可容忍停機, 無人熟悉, 架構有缺陷, 時間充裕, 較高風險]

# === 警告：第二系統效應 ===
rewrite_antipatterns:
  - "加入原本沒有的功能"
  - "為未來彈性過度抽象"
  - "忽略現有系統的經驗教訓"
quote: "第二個系統是一個人設計過最危險的系統。— Fred Brooks"

# === 規模：重構策略 ===
scales:
  small:
    duration: "5-15 分鐘"
    scope: "單一方法/類別"
    techniques: [提取方法, 重新命名, 內聯變數, 替換魔術數字]
  medium:
    duration: "數小時到數天"
    scope: "一個功能/模組"
    checklist: [定義範圍, 識別入口點, "覆蓋率>80%", 增量提交, 與團隊溝通]
  large:
    duration: "數週到數月"
    scope: "多個模組/系統"
    patterns: [strangler_fig, branch_by_abstraction, parallel_change]

# === 模式：大規模重構 ===
strangler_fig:
  phases:
    1_攔截: "請求 → 外觀 → 舊系統(100%)"
    2_遷移: "請求 → 外觀 → [新系統(功能A), 舊系統(其餘)]"
    3_完成: "請求 → 新系統(100%) [舊系統除役]"

branch_by_abstraction:
  steps:
    1: "客戶端 → 抽象層(介面) → 舊實作"
    2: "客戶端 → 抽象層 → [舊實作, 新實作(切換)]"
    3: "客戶端 → 新實作 [移除舊實作]"

expand_migrate_contract:
  phases:
    expand: "新增新的，保留舊的，新程式用新的，舊程式仍可用"
    migrate: "更新所有客戶端使用新的，驗證，資料遷移"
    contract: "移除舊的，清理，更新文件"

# === 遺留程式碼：策略 ===
legacy:
  definition: "沒有測試的程式碼（不論年齡）"
  dilemma: "安全修改需要測試 → 加測試需要修改程式碼"
  solution: "使用安全技術先加測試"

characterization_tests:
  purpose: "捕捉現有行為（非驗證正確性）"
  process:
    1: "呼叫要理解的程式碼"
    2: "寫預期會失敗的斷言"
    3: "執行，觀察實際結果"
    4: "更新斷言以匹配實際行為"
    5: "重複直到涵蓋需要修改的行為"

# === 技術債管理 ===
quadrant: # Martin Fowler
  prudent_deliberate: "我們知道這是債務"
  reckless_deliberate: "沒時間做設計"
  prudent_inadvertent: "現在知道應該怎麼做了"
  reckless_inadvertent: "什麼是分層？"

priority:
  high: {criteria: "阻塞開發，頻繁出錯", action: "立即處理"}
  medium: {criteria: "拖慢開發，增加複雜度", action: "規劃到下個迭代"}
  low: {criteria: "小麻煩，影響局部", action: "有機會就處理"}
```

---

## 配置偵測

### 偵測順序

1. 檢查 `CONTRIBUTING.md` 中的「停用技能」區段
2. 檢查 `CONTRIBUTING.md` 中的「重構標準」區段
3. 如果未找到，**預設使用標準重構實踐**

---

## 詳細指南

完整標準請參閱：
- [重構標準](../../../core/refactoring-standards.md)

---

## 相關標準

- [重構標準](../../../core/refactoring-standards.md) - 核心標準
- [測試驅動開發](../../../core/test-driven-development.md) - TDD 重構階段
- [程式碼審查檢查清單](../../../core/code-review-checklist.md) - 重構 PR 審查
- [簽入標準](../../../core/checkin-standards.md) - 提交前要求
- [TDD 助手](../tdd-assistant/SKILL.md) - TDD 工作流程

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-12 | 初始發布 |

---

## 授權

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
