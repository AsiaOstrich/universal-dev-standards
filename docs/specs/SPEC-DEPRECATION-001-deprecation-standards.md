# [SPEC-DEPRECATION-001] Feature: Deprecation & Sunset Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Critical (P0)
- **Scope**: universal
- **Related**: `core/api-design-standards.md` (銜接), SPEC-TECHDEBT-001, SPEC-FF-001

## Overview

新增 `core/deprecation-standards.md` 核心標準，統一定義 API 版本退役、功能下架和系統退役的完整生命週期。涵蓋 Sunset 時間表、消費者通知、資料歸檔和依賴清理。

## Motivation

### 問題陳述

1. **API 退役無計畫** — 客戶突然發現 API 不可用，沒有遷移時間
2. **功能下架殘留** — 移除功能後留下死程式碼、孤立資料、斷裂連結
3. **系統退役無流程** — DNS 殘留、資料未歸檔、依賴服務未更新
4. **退役 = 覆蓋率最低的 SDLC 階段** — UDS 目前只有 30% 覆蓋率

## Requirements

### REQ-1: API Deprecation 流程

系統 SHALL 定義 API 版本退役的標準流程和時間表。

#### Scenario: Sunset 時間表
- **GIVEN** 團隊決定退役一個 API 版本
- **WHEN** 查閱 Sunset 時間表
- **THEN** 看到以下階段：

| 階段 | 時間點 | 動作 |
|------|--------|------|
| **Announce** | T-6 個月 | 宣布退役計畫，發布 Sunset 日期 |
| **Deprecate** | T-3 個月 | 標記為 deprecated，回應加入 Sunset header |
| **Migrate** | T-3 到 T-1 個月 | 主動協助消費者遷移，提供遷移指南 |
| **Warn** | T-1 個月 | 發送最終警告，回應加入倒數資訊 |
| **Sunset** | T | 停止服務，回傳 410 Gone |
| **Archive** | T+1 個月 | 歸檔文件和資料，移除基礎設施 |

#### Scenario: HTTP Deprecation Headers
- **GIVEN** API 版本進入 Deprecate 階段
- **WHEN** API 回應請求
- **THEN** 回應 MUST 包含以下 headers：
  ```
  Deprecation: true
  Sunset: Sat, 31 Dec 2026 23:59:59 GMT
  Link: <https://api.example.com/v3/docs>; rel="successor-version"
  ```

#### Scenario: 版本並行期
- **GIVEN** 新版本已發布
- **WHEN** 決定舊版本維護期
- **THEN** 舊版本 MUST 至少維護到以下較晚者：
  - 新版本 GA 後 6 個月
  - 最後一個活躍消費者遷移後 3 個月

### REQ-2: 消費者通知策略

系統 SHALL 定義退役時通知消費者的多管道策略。

#### Scenario: 通知管道矩陣
- **GIVEN** API 進入退役流程
- **WHEN** 通知消費者
- **THEN** 使用以下管道：

| 管道 | 時機 | 內容 |
|------|------|------|
| **CHANGELOG / Release Notes** | Announce 階段 | 退役計畫、Sunset 日期、遷移指南連結 |
| **API 回應 Header** | Deprecate 階段起 | Sunset header + successor-version |
| **Email / 通知** | Announce + Warn | 直接通知已知消費者 |
| **API 文件** | Announce 階段起 | 明顯標記 deprecated，指向新版本 |
| **Dashboard / 監控** | Deprecate 階段起 | 追蹤剩餘消費者數量 |

### REQ-3: Feature Sunset

系統 SHALL 定義功能下架的影響分析和執行清單。

#### Scenario: Feature Sunset 影響分析
- **GIVEN** 團隊決定移除某個功能
- **WHEN** 執行影響分析
- **THEN** 評估以下面向：

| 面向 | 檢查項 |
|------|--------|
| **使用率** | 過去 30 天有多少用戶使用此功能？ |
| **依賴** | 有哪些其他功能或服務依賴它？ |
| **資料** | 此功能有產生或管理特有資料嗎？需要遷移或歸檔嗎？ |
| **合約** | 有 SLA 或合約承諾此功能嗎？ |
| **替代** | 有替代方案嗎？用戶知道如何遷移嗎？ |

#### Scenario: Feature Sunset 執行清單
- **GIVEN** 影響分析完成，決定執行下架
- **WHEN** 使用執行清單
- **THEN** 逐項確認：
  - [ ] 通知受影響用戶（至少 30 天前）
  - [ ] 提供替代方案或遷移指南
  - [ ] 移除功能程式碼（不留死程式碼）
  - [ ] 移除相關 Feature Flag
  - [ ] 遷移或歸檔相關資料
  - [ ] 更新 API 文件和使用者文件
  - [ ] 設定 redirect（舊 URL → 替代功能或說明頁）
  - [ ] 更新 CHANGELOG

### REQ-4: 系統退役 (Decommission)

系統 SHALL 定義完整系統/服務退役的流程。

#### Scenario: 系統退役流程
- **GIVEN** 團隊決定退役一個系統/服務
- **WHEN** 查閱退役流程
- **THEN** 按以下階段執行：

| 階段 | 動作 | 驗證 |
|------|------|------|
| **1. 依賴分析** | 識別所有上游/下游依賴 | 依賴圖無紅色節點 |
| **2. 消費者遷移** | 協助所有消費者遷移到替代服務 | 流量降至 0 |
| **3. 資料歸檔** | 按合規要求歸檔資料 | 歸檔完整性驗證 |
| **4. DNS/Redirect** | 舊端點返回 410 或重導向 | 回應正確 |
| **5. 基礎設施清理** | 移除 server、DB、queue、storage | 資源釋放確認 |
| **6. 監控移除** | 移除告警、dashboard、runbook | 無孤立告警 |
| **7. 文件歸檔** | 標記文件為 archived | 文件索引更新 |

#### Scenario: 資料歸檔策略
- **GIVEN** 系統退役需要歸檔資料
- **WHEN** 查閱歸檔策略
- **THEN** 按以下規則：

| 資料類型 | 保留期限 | 歸檔方式 |
|----------|---------|---------|
| 使用者資料 | 依隱私法規（GDPR: 刪除, 其他: 5-7 年） | 加密冷儲存 |
| 交易記錄 | 依稅務/審計要求（通常 7 年） | 唯讀存檔 |
| 日誌 | 1 年 | 壓縮歸檔 |
| 設定/程式碼 | 永久（Git 已保留） | Git 歷史 |

### REQ-5: 退役指標

系統 SHALL 定義追蹤退役進度的指標。

#### Scenario: 退役進度追蹤
- **GIVEN** 退役流程進行中
- **WHEN** 查閱進度指標
- **THEN** 追蹤：

| 指標 | 定義 | 目標 |
|------|------|------|
| 消費者遷移率 | 已遷移 / 總消費者 | 100% at Sunset |
| 剩餘流量 | 被退役端點的請求數/天 | 0 at Sunset |
| 依賴清理率 | 已清理 / 總依賴 | 100% at Archive |
| 資料歸檔完成率 | 已歸檔 / 需歸檔 | 100% at Archive |

## Acceptance Criteria

- **AC-1**: Given API 退役, when 查閱流程, then 有 6 個階段的 Sunset 時間表（Announce→Deprecate→Migrate→Warn→Sunset→Archive）
- **AC-2**: Given API 回應, when 進入 Deprecate 階段, then 有 HTTP Deprecation/Sunset header 格式定義
- **AC-3**: Given 版本並行, when 查閱要求, then 舊版本維護期有量化定義（≥6 個月或消費者遷移後 3 個月）
- **AC-4**: Given 通知消費者, when 查閱管道, then 有至少 5 個通知管道（CHANGELOG/Header/Email/文件/Dashboard）
- **AC-5**: Given 功能下架, when 執行影響分析, then 有 5 個分析面向（使用率/依賴/資料/合約/替代）
- **AC-6**: Given 功能下架, when 使用執行清單, then 有至少 8 個檢查項
- **AC-7**: Given 系統退役, when 查閱流程, then 有 7 個階段的退役流程
- **AC-8**: Given 資料歸檔, when 查閱策略, then 有 4 種資料類型的保留期限
- **AC-9**: Given 退役進度, when 查閱指標, then 有 4 個追蹤指標

## Technical Design

### 文件結構

```
core/
├── deprecation-standards.md      ← 新建
├── api-design-standards.md       ← 現有，新增交叉引用
```

## Test Plan

- [ ] Sunset 時間表有 6 個階段
- [ ] HTTP headers 有格式定義
- [ ] 版本並行期有量化要求
- [ ] 通知管道有至少 5 個
- [ ] 影響分析有 5 個面向
- [ ] 執行清單有至少 8 項
- [ ] 系統退役有 7 個階段
- [ ] 資料歸檔有 4 種類型
- [ ] 退役指標有 4 個

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
