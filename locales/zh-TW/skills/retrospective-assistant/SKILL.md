---
name: retrospective-assistant
source: ../../../../skills/retrospective-assistant/SKILL.md
source_version: 1.0.0
source_hash: 9c883f05ad7b
translation_version: 1.0.0
last_synced: 2026-06-01
status: current
description: "[UDS] 引導 Sprint 與 Release 週期的結構化團隊回顧"
---

# 回顧助手

> **語言**: [English](../../../../skills/retrospective-assistant/SKILL.md) | 繁體中文

引導結構化的團隊回顧，識別改善機會並追蹤行動項目。支援 Sprint 和 Release 回顧類型，提供多種引導技法。

## 工作流程

```
PREPARE ──► GATHER ──► ANALYZE ──► DECIDE ──► TRACK
  準備資料    蒐集意見    分析歸納    決定行動    追蹤落實
```

### 階段 1：PREPARE（準備）

從 git log、指標和 issue tracker 蒐集數據作為討論基礎。

### 階段 2：GATHER（蒐集）

使用結構化技法蒐集團隊觀點。

### 階段 3：ANALYZE（分析）

分組歸納並識別模式。

### 階段 4：DECIDE（決定）

選出前 1-3 項改善作為行動項目。

### 階段 5：TRACK（追蹤）

檢視過去的行動項目並追蹤新項目。

## 回顧類型

| 類型 | 時機 | 時長 | 焦點 |
|------|------|------|------|
| **Sprint** | 迭代結束 | 30-60 分鐘 | 流程、協作、工具 |
| **Release** | 發布之後 | 60-90 分鐘 | 品質、指標、跨團隊 |

## 引導技法

| 技法 | 適用場景 | 結構 |
|------|---------|------|
| **Start-Stop-Continue** | 快速、預設 | 開始 / 停止 / 繼續 |
| **Starfish** | 細緻分析 | 更多 / 保持 / 減少 / 開始 / 停止 |
| **4Ls** | 團隊建立 | 喜歡 / 學到 / 缺少 / 渴望 |
| **Sailboat** | 視覺化、創意 | 風 / 錨 / 礁石 / 島嶼 |

## 指令

| 指令 | 說明 |
|------|------|
| `/retrospective` | 互動式 Sprint 回顧（預設） |
| `/retrospective sprint` | Sprint 回顧 |
| `/retrospective release` | Release 回顧（含指標） |
| `/retrospective actions` | 列出未完成行動項目 |
| `/retrospective --technique starfish` | 使用指定技法 |

## 行動項目格式

| 欄位 | 說明 |
|------|------|
| **Action** | 具體描述 |
| **Owner** | 單一負責人 |
| **Due Date** | 預計完成日 |
| **Status** | Open → In Progress → Done |

### 追蹤規則

1. 每次回顧**開始**先檢視未完成項目
2. 每次回顧最多 **3 項**行動項目
3. 陳舊項目（超過 2 個循環未完成）須重新評估
4. 每項須有**單一負責人**

## 存放

```
docs/retrospectives/
├── RETRO-2026-03-15-sprint-12.md
├── RETRO-2026-03-26-release-v5.1.0.md
└── README.md    # 索引（選用）
```

## 與其他技能的整合

| 技能 | 整合方式 |
|------|---------|
| `/metrics` | 將指標數據引入 Release 回顧 |
| `/incident` | 事故後建議進行團隊回顧 |
| `/adr` | 識別架構問題時建議建立 ADR |
| `/commit` | 以 `docs(retro):` 提交回顧報告 |

## 下一步引導

`/retrospective` 完成後：

> **回顧完成。建議下一步：**
> - 提交回顧報告：`/commit`
> - 為識別的架構決策建立 ADR：`/adr`
> - 在 issue tracker 中追蹤行動項目
> - 排定下次回顧

## AI 代理行為

當呼叫 `/retrospective` 時：

1. **確認類型** — Sprint（預設）或 Release
2. **蒐集數據** — 掃描 git log，檢查 `docs/retrospectives/` 中過去的行動項目
3. **引導技法** — 預設使用 Start-Stop-Continue，或使用指定技法
4. **產生報告** — 寫入 `docs/retrospectives/RETRO-YYYY-MM-DD-[type].md`
5. **檢視過去項目** — 檢查先前回顧中未完成的行動項目
6. **提供下一步** — 顯示上方引導

當呼叫 `/retrospective actions` 時：
1. 掃描 `docs/retrospectives/` 中所有回顧檔案
2. 解析各檔案中的行動項目
3. 以表格顯示未完成／進行中的項目

## 參考

- 核心規範：[retrospective-standards.md](../../core/retrospective-standards.md)
- 詳細指南：[guide.md](./guide.md)
