---
source: ../../../core/virtual-organization-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 4694212aa518
status: current
---

# 虛擬組織標準

> **語言**: [English](../../../core/virtual-organization-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-29
**適用性**: 專案設置和 AI 工具配置
**範圍**: 通用 (Universal)
**業界標準**: ISO 12207 §6.2
**參考資料**: [iso.org](https://www.iso.org/standard/63712.html)
**ISO 12207 對應**: 組織專案賦能流程 (6.2)

---

## 目的

本標準將 AI 生態系統視為「虛擬組織」。定義如何將 AI 能力（Skills）、基礎設施和品質保證作為組織資產來管理，確保「虛擬人力」具備能力且符合規範。

---

## 1. 虛擬人力管理（人力資源）

在 Vibe Coding 中，「人力資源管理」即管理 AI 代理的能力。

### 1.1 技能管理
技能是虛擬員工的「資格」。

- **取得**：技能必須明確安裝（例如透過 `skills/` 目錄或插件）。
- **能力**：技能必須針對特定專案情境進行驗證。
- **角色定義**：代理應被指派「角色」（技能集合），而非作為通用代理。

| 角色 | 建議技能集 |
|------|-----------|
| **架構代理** | `system-design`、`diagram-generation`、`codebase-analysis` |
| **測試代理** | `test-runner`、`coverage-analyzer`、`mock-generator` |
| **重構代理** | `static-analysis`、`code-metrics`、`refactoring-patterns` |

### 1.2 入職（情境載入）
「入職」AI 代理意味著載入正確的情境和配置。
- **專案引導**：載入 `README.md`、架構文件和標準。
- **規範對齊**：載入 `core/ai-agreement-standards.md`。

---

## 2. 基礎設施管理（工具）

### 2.1 工具整合
AI 代理的「辦公環境」包含：
- **MCP Servers**：透過 Model Context Protocol 進行標準化整合。
- **API 存取**：安全管理金鑰與端點。
- **Sandbox**：用於執行程式碼的隔離環境（防止系統損壞）。

### 2.2 知識庫
AI 代理的「企業圖書館」：
- **向量資料庫**：用於大規模文件檢索。
- **程式碼片段庫**：可重用的程式碼模式與範本。

---

## 3. 品質管理系統（QMS）

### 3.1 自動化 Vibe 檢查
品質控制左移，納入生成過程之中。
- **生成前檢查**：代理是否理解任務？
- **生成後檢查**：程式碼能否編譯？測試是否通過？

### 3.2 幻覺監控
持續監控「缺陷率」（幻覺）：
- **偵測**：使用 `uds check` 與靜態分析。
- **修正**：更新 Context Contracts 以防止再次發生。

---

## 相關標準

- [測試標準](testing-standards.md)
- [提交規範](checkin-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-29 | 初始發布，對應 ISO 12207 賦能流程 |
