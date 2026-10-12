---
source: ../../../../skills/commands/requirement.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: ae753f750fe7
---

---
description: [UDS] 遵循 INVEST 標準撰寫用戶故事與需求
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[feature name or description | 功能名稱或描述]"
---

# 需求助手

> **Language**: [English](../../../../skills/commands/requirement.md) | 繁體中文

撰寫結構良好的用戶故事和需求文件，遵循 INVEST 標準。

## 工作流程

1. **了解背景** - 收集功能相關資訊
2. **識別利害關係人** - 誰會從這個功能受益？
3. **撰寫用戶故事** - 遵循標準格式
4. **定義驗收標準** - 具體、可測試的條件
5. **INVEST 驗證** - 檢查品質標準

## 用戶故事格式

```markdown
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria

- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

## INVEST 標準

| 標準 | 說明 |
|------|------|
| **I**ndependent | 可獨立開發 |
| **N**egotiable | 可協商細節 |
| **V**aluable | 提供用戶價值 |
| **E**stimable | 可估算工作量 |
| **S**mall | 適合單一迭代 |
| **T**estable | 有明確測試標準 |

## 使用方式

- `/requirement` - 互動式需求撰寫精靈
- `/requirement user login` - 為特定功能撰寫需求
- `/requirement "users can export data"` - 根據描述撰寫

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/requirement` | 詢問使用者要定義的功能，開始互動式需求撰寫 |
| `/requirement <feature>` | 以指定功能為目標，開始收集資訊 |
| `/requirement "description"` | 從描述中提取需求，產生用戶故事 |

### 互動腳本

1. 收集功能描述和使用者角色
2. 引導定義 As a / I want / So that
3. 引導定義 Acceptance Criteria（GWT 格式）
4. 以 INVEST 標準逐項驗證

**決策：INVEST 驗證結果**
- IF 全部通過 → 展示完整需求文件
- IF 有項目未通過 → 指出哪些未通過，建議修改方式

🛑 **STOP**: 展示需求文件後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 需求文件產生後 | 確認內容正確並寫入 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 使用者描述過於模糊 | 提出具體問題釐清範圍 |
| AC 無法用 GWT 格式表達 | 協助轉換，展示轉換建議 |

## 參考

- 完整標準：[requirement-assistant](../requirement-assistant/SKILL.md)
- 核心指南：[requirements-standards](../../core/requirement-engineering.md)
