---
source: ../../../../skills/retrospective-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: "[UDS] 引導結構化的團隊回顧，支援 Sprint 和 Release 回顧"
name: retrospective
allowed-tools: Read, Write, Glob, Grep
scope: universal
argument-hint: "[sprint | release | actions | --technique starfish]"
---

# 回顧助手

> **語言**: [English](../../../../skills/retrospective-assistant/SKILL.md) | 繁體中文

引導結構化的團隊回顧，識別改善機會並追蹤行動項目。

## 工作流程

```
PREPARE ──► GATHER ──► ANALYZE ──► DECIDE ──► TRACK
  準備資料    蒐集意見    分析歸納    決定行動    追蹤落實
```

## 回顧類型

| 類型 | 時機 | 時長 | 焦點 |
|------|------|------|------|
| **Sprint** | 迭代結束 | 30-60 分鐘 | 流程、協作、工具 |
| **Release** | 發布後 | 60-90 分鐘 | 品質、指標、跨團隊 |

## 引導技法

| 技法 | 適用場景 | 結構 |
|------|---------|------|
| **Start-Stop-Continue** | 快速、預設 | 開始做 / 停止做 / 繼續做 |
| **Starfish** | 更細緻分析 | 更多 / 保持 / 減少 / 開始 / 停止 |
| **4Ls** | 團隊建設 | 喜歡 / 學到 / 缺少 / 渴望 |
| **Sailboat** | 視覺化、創意 | 風 / 錨 / 礁石 / 島嶼 |

## 指令

| 指令 | 說明 |
|------|------|
| `/retrospective` | 互動式 Sprint 回顧（預設） |
| `/retrospective sprint` | Sprint 回顧 |
| `/retrospective release` | Release 回顧（含指標） |
| `/retrospective actions` | 列出未完成行動項目 |
| `/retrospective --technique starfish` | 使用指定技法 |

## 行動項目追蹤規則

1. 每次回顧開始先檢視過去未完成項目
2. 每次回顧最多 3 項行動
3. 超過 2 個循環未完成須重新評估
4. 每項須有單一負責人

## 存放位置

```
docs/retrospectives/
├── RETRO-2026-03-15-sprint-12.md
├── RETRO-2026-03-26-release-v5.1.0.md
└── README.md
```

## 下一步引導

> **回顧完成。建議下一步：**
> - 執行 `/commit` 提交回顧報告
> - 執行 `/adr` 為架構決策建立記錄
> - 在 issue tracker 中追蹤行動項目
> - 排定下次回顧

## 參考

- 核心規範：[retrospective-standards.md](../../../../core/retrospective-standards.md)
- 詳細指南：[guide.md](./guide.md)
