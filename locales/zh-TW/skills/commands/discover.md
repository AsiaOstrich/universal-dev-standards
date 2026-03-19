---
source: ../../../../skills/commands/discover.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: discover
description: "[UDS] Assess project health, architecture, and risks before adding features"
argument-hint: "[feature area | 功能範圍]"
---

# 專案現況評估

> **Language**: [English](../../../../skills/commands/discover.md) | 繁體中文

在既有程式碼庫新增功能前的 Phase 0 評估。評估專案健康度、架構與風險。

## 用法

```bash
/discover [feature area]
```

## 評估維度

| 維度 | 檢查項目 |
|------|----------|
| **架構** | 模組結構、相依圖、進入點 |
| **相依性** | 過時套件、已知漏洞、授權風險 |
| **測試覆蓋率** | 現有測試、覆蓋率缺口、測試品質 |
| **安全性** | `npm audit` 結果、硬編碼密鑰、暴露端點 |
| **技術債** | TODO 標記、程式碼重複、複雜度熱點 |

## 工作流程

1. **掃描專案** - 讀取 package.json、目錄結構、設定檔
2. **分析架構** - 繪製模組、相依性和資料流
3. **檢查相依性** - 執行 `npm outdated`、`npm audit` 取得健康信號
4. **評估風險** - 識別複雜度熱點、缺失測試、安全問題
5. **產生報告** - 輸出健康分數與可執行的建議
6. **決定下一步** - 根據發現結果判定 GO / NO-GO / CONDITIONAL

## 範例

```bash
/discover                # 完整專案健康評估
/discover auth           # 聚焦評估 auth 相關模組
/discover payments       # 在新增支付功能前評估風險
```

## 輸出格式

```
Project Health Report
=====================
Overall Score: 7.2 / 10

| Dimension       | Score | Status  | Key Finding            |
|-----------------|-------|---------|------------------------|
| Architecture    | 8/10  | Good    | Clean module boundaries |
| Dependencies    | 6/10  | Warning | 5 outdated, 1 critical |
| Test Coverage   | 7/10  | Fair    | 72% line coverage      |
| Security        | 8/10  | Good    | No critical vulns      |
| Technical Debt  | 6/10  | Warning | 23 TODOs, 3 hotspots   |

Verdict: CONDITIONAL
Recommendations:
1. [HIGH] Update lodash to fix CVE-2024-XXXX
2. [MED]  Add tests for src/payments/ (0% coverage)
3. [LOW]  Resolve TODO backlog in src/utils/
```

## 後續步驟

完成評估後，典型的 brownfield 工作流程為：

1. `/discover` - 評估專案健康度（本指令）
2. `/reverse spec` - 逆向工程現有程式碼為規格
3. `/sdd` - 為新功能撰寫規格
4. `/tdd` 或 `/bdd` - 在測試保護下實作

## 參考

*   [專案探索技能](../project-discovery/SKILL.md)
*   [逆向工程標準](../../core/reverse-engineering-standards.md)
