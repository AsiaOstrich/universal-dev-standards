# [SPEC-KT-001] Feature: Knowledge Transfer Standards

- **Status**: Archived
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `core/documentation-lifecycle.md` (銜接), SPEC-RUNBOOK-001 (銜接)

## Overview

新增 `core/knowledge-transfer-standards.md` 核心標準，定義 Onboarding 路線圖、Handoff 流程、Bus Factor 評估和 Code Tour 機制。確保知識不隨人員流動而消失。

## Motivation

### 問題陳述

1. **新人上手慢** — 缺乏結構化的 Onboarding 路線圖
2. **知識集中** — 關鍵知識只在少數人腦中（Bus Factor = 1）
3. **交接不完整** — 人員離職時交接靠口頭，遺漏大量隱性知識
4. **程式碼迷宮** — 大型 codebase 沒有導覽，新人不知從何看起

## Requirements

### REQ-1: Onboarding 路線圖

系統 SHALL 定義新成員的結構化 Onboarding 流程。

#### Scenario: 30 天 Onboarding 路線圖
- **GIVEN** 新成員加入團隊
- **WHEN** 查閱 Onboarding 路線圖
- **THEN** 看到以下時間表：

| 週次 | 主題 | 目標 | 產出 |
|------|------|------|------|
| **Week 1** | 環境與文化 | 開發環境設定完成、了解團隊規範 | 成功建置並執行專案 |
| **Week 2** | 架構與程式碼 | 了解系統架構、關鍵路徑 | 完成 Code Tour |
| **Week 3** | 流程與工具 | 了解 CI/CD、部署、監控流程 | 完成第一個 PR |
| **Week 4** | 獨立貢獻 | 獨立完成一個小任務 | Buddy 評估通過 |

#### Scenario: Onboarding 清單範本
- **GIVEN** 新成員第一天
- **WHEN** 使用 Onboarding 清單
- **THEN** 清單包含：

| 類別 | 項目 |
|------|------|
| **帳號存取** | Git、CI/CD、監控、雲端、通訊工具 |
| **環境設定** | 開發環境、IDE、VPN、資料庫存取 |
| **文件閱讀** | README、架構文件、API 文件、CLAUDE.md |
| **會議安排** | 與 Buddy 1:1、團隊介紹、架構概覽 |
| **首要任務** | Good First Issue、Code Tour 完成 |

### REQ-2: Handoff 流程

系統 SHALL 定義人員離職或轉調時的知識交接流程。

#### Scenario: Handoff 清單
- **GIVEN** 成員即將離開團隊
- **WHEN** 使用 Handoff 清單
- **THEN** 逐項完成：

| 項目 | 說明 | 時間 |
|------|------|------|
| **負責領域清單** | 列出所有負責的模組、服務、流程 | 離職前 4 週 |
| **隱性知識記錄** | 文件化「只有我知道」的操作、技巧、陷阱 | 離職前 3 週 |
| **進行中工作交接** | 未完成的任務、PR、事故追蹤 | 離職前 2 週 |
| **帳號與權限移轉** | 轉移 owner 權限、API key 輪替 | 離職前 1 週 |
| **Runbook 更新** | 確認相關 Runbook 是否需要更新 | 離職前 1 週 |
| **Buddy 配對** | 指定接手人並進行 pair session | 離職前 2 週 |

#### Scenario: 知識記錄格式
- **GIVEN** 成員記錄隱性知識
- **WHEN** 使用標準格式
- **THEN** 每條記錄包含：
  - **主題**：什麼知識
  - **情境**：什麼情況下需要
  - **步驟**：具體怎麼做
  - **陷阱**：常見的坑和注意事項
  - **相關資源**：連結到程式碼、文件、Runbook

### REQ-3: Bus Factor 評估

系統 SHALL 定義識別和緩解知識集中風險的方法。

#### Scenario: Bus Factor 評估方法
- **GIVEN** 團隊想評估知識集中風險
- **WHEN** 執行 Bus Factor 評估
- **THEN** 對每個關鍵領域評估：

| 指標 | 定義 | 風險等級 |
|------|------|---------|
| **知道的人數** | 能獨立處理該領域的人數 | 1 人 = 高風險, 2 人 = 中, 3+ = 低 |
| **文件完整度** | 該領域的文件覆蓋率 | < 30% = 高, 30-70% = 中, > 70% = 低 |
| **最後知識分享** | 上次有人學習該領域是多久前 | > 6 月 = 高, 3-6 月 = 中, < 3 月 = 低 |

#### Scenario: 知識擴散計畫
- **GIVEN** 發現 Bus Factor = 1 的領域
- **WHEN** 制定擴散計畫
- **THEN** 選擇以下策略：

| 策略 | 說明 | 適用 |
|------|------|------|
| **Pair Programming** | 專家和學習者一起工作 | 複雜邏輯、特殊技巧 |
| **Tech Talk** | 專家向團隊分享 | 架構決策、設計理念 |
| **文件化** | 將隱性知識寫成文件或 Runbook | 操作流程、部署步驟 |
| **Code Review 輪替** | 讓不同人 review 不同領域 | 程式碼理解 |
| **On-call 輪替** | 讓不同人值班不同服務 | 維運知識 |

### REQ-4: Code Tour

系統 SHALL 定義程式碼導覽的建立和維護方式。

#### Scenario: Code Tour 內容
- **GIVEN** 團隊為 codebase 建立 Code Tour
- **WHEN** 查閱 Code Tour 標準
- **THEN** Tour 包含以下路線：

| 路線 | 涵蓋 | 目標讀者 |
|------|------|---------|
| **Quick Start** | 入口點、主要配置、啟動流程 | 所有新人 |
| **Request Flow** | 一個請求從入口到回應的完整路徑 | 後端開發者 |
| **Data Flow** | 資料從建立到儲存到查詢的路徑 | 資料相關開發者 |
| **Deploy Flow** | 程式碼從 PR 到生產的完整路徑 | 需要部署的人 |
| **Key Decisions** | 重要架構決策及其 ADR | 需要了解「為什麼」的人 |

#### Scenario: Code Tour 維護
- **GIVEN** 程式碼變更影響了 Code Tour 路線
- **WHEN** 評估是否需要更新
- **THEN** 按以下規則：
  - 入口點/路由變更 → MUST 更新 Tour
  - 內部重構（介面不變） → 不需更新
  - 新增主要功能 → SHOULD 新增 Tour 路線

## Acceptance Criteria

- **AC-1**: Given 新成員, when 查閱 Onboarding, then 有 4 週的路線圖（Week 1-4 各有主題/目標/產出）
- **AC-2**: Given 新成員第一天, when 使用清單, then 有 5 個類別的 Onboarding 檢查項（帳號/環境/文件/會議/任務）
- **AC-3**: Given 成員離職, when 使用 Handoff 清單, then 有至少 6 個交接項目含時間表
- **AC-4**: Given 記錄隱性知識, when 使用格式, then 每條記錄有 5 個欄位（主題/情境/步驟/陷阱/資源）
- **AC-5**: Given 評估風險, when 執行 Bus Factor 評估, then 有 3 個指標（人數/文件/分享）各含風險等級
- **AC-6**: Given Bus Factor = 1, when 制定擴散計畫, then 有至少 5 種策略（Pair/Talk/文件/Review/On-call）
- **AC-7**: Given codebase, when 建立 Code Tour, then 有至少 5 條路線（Quick Start/Request/Data/Deploy/Decisions）
- **AC-8**: Given 程式碼變更, when 評估 Tour 更新, then 有 MUST/SHOULD/不需更新 三種判斷規則

## Technical Design

### 文件結構

```
core/
├── knowledge-transfer-standards.md  ← 新建
├── documentation-lifecycle.md       ← 現有，新增交叉引用
```

## Test Plan

- [ ] Onboarding 路線圖有 4 週定義
- [ ] Onboarding 清單有 5 個類別
- [ ] Handoff 清單有至少 6 個項目
- [ ] 知識記錄有 5 個欄位
- [ ] Bus Factor 有 3 個指標含風險等級
- [ ] 擴散策略有至少 5 種
- [ ] Code Tour 有至少 5 條路線
- [ ] Tour 更新有三種判斷規則

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
