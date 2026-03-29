---
source: ../../../../skills/adr-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: "[UDS] 建立、管理和追蹤架構決策記錄（ADR）"
name: adr
allowed-tools: Read, Write, Glob, Grep
scope: universal
argument-hint: "[create | list | supersede ADR-NNN | 決策主題]"
---

# 架構決策記錄助手

> **語言**: [English](../../../../skills/adr-assistant/SKILL.md) | 繁體中文

建立、管理和追蹤架構決策記錄。捕捉重大技術決策的背景、選項和理由。

## 工作流程

```
CAPTURE ──► ANALYZE ──► DECIDE ──► RECORD ──► LINK
  捕捉背景    分析選項    做出決策    記錄 ADR    建立連結
```

### 階段 1：CAPTURE | 捕捉背景

識別驅動決策的背景與限制條件。

| 步驟 | 動作 |
|------|------|
| 1 | 識別問題或機會 |
| 2 | 列出限制條件（時間、預算、團隊技能） |
| 3 | 定義決策驅動因素 |

### 階段 2：ANALYZE | 分析選項

至少探索 2 個選項，列出優缺點。

| 步驟 | 動作 |
|------|------|
| 1 | 腦力激盪候選方案 |
| 2 | 根據決策驅動因素評估各方案 |
| 3 | 記錄各方案優缺點 |

### 階段 3：DECIDE | 做出決策

選擇最佳方案並闡述理由。

### 階段 4：RECORD | 記錄 ADR

依照標準模板產生 ADR 檔案。

### 階段 5：LINK | 建立連結

與相關工件（規格、PR、程式碼）建立交叉引用。

## 快速參考

### 何時撰寫 ADR

| 撰寫 ADR | 不需要 ADR |
|----------|-----------|
| 框架/函式庫選擇 | 例行性依賴更新 |
| API 合約或資料格式 | 現有架構內的 Bug 修復 |
| 部署策略變更 | 程式碼風格決策 |
| 建立新模式 | 瑣碎的實作選擇 |

**經驗法則**：如果 6 個月後有人可能會問「為什麼？」，就寫一份 ADR。

### 狀態生命週期

```
Proposed ──► Accepted ──► Deprecated
                │
                └──► Superseded by ADR-NNN
```

| 狀態 | 說明 |
|------|------|
| **Proposed** | 討論中，尚未決定 |
| **Accepted** | 已接受，應遵循 |
| **Deprecated** | 不再適用 |
| **Superseded** | 已被新 ADR 取代 |

### 模板摘要

```markdown
# ADR-NNN: [決策標題]

- Status: [Proposed | Accepted | Deprecated | Superseded]
- Date: YYYY-MM-DD
- Deciders: [參與決策者]
- Technical Story: [SPEC-ID 或 Issue]

## Context（背景）
## Decision Drivers（決策驅動因素）
## Considered Options（考慮的選項）
## Decision Outcome（決策結果）
### Consequences（後果：Good / Bad / Neutral）
## Links（相關連結）
```

### 存放位置

```
docs/adr/
├── ADR-001-short-description.md
├── ADR-002-short-description.md
└── README.md    # 索引（可選）
```

## 指令

| 指令 | 說明 |
|------|------|
| `/adr` | 互動式建立 ADR |
| `/adr create` | 建立新 ADR |
| `/adr list` | 列出所有 ADR 及狀態 |
| `/adr search [關鍵字]` | 依關鍵字搜尋 ADR |
| `/adr supersede [ADR-NNN]` | 取代現有 ADR |
| `/adr review` | 審查過期的 ADR |

## 與其他技能的整合

| 技能 | 整合方式 |
|------|---------|
| `/sdd` | 在技術設計中引用 ADR；重大決策時建議建立 ADR |
| `/review` | 程式碼審查時引用 ADR 作為設計依據 |
| `/commit` | 提交時在 footer 加入 ADR 編號 |
| `/brainstorm` | 腦力激盪結果作為 ADR 選項分析輸入 |

## 品質檢查清單

| 檢查項目 | 標準 |
|----------|------|
| ☐ 背景 | 清楚說明問題 |
| ☐ 選項 | 至少考慮 2 個選項 |
| ☐ 驅動因素 | 決策驅動因素明確列出 |
| ☐ 後果 | 包含正面與負面結果 |
| ☐ 連結 | 相關工件已引用 |

## 下一步引導

`/adr` 完成後，AI 助手應建議：

> **ADR 已建立。建議下一步：**
> - 執行 `/sdd` 建立規格（若決策需要實作）
> - 執行 `/commit` 提交 ADR 檔案
> - 更新相關規格以引用此 ADR
> - 若狀態為 `Proposed`，分享給團隊審查

## 參考

- 核心規範：[adr-standards.md](../../../../core/adr-standards.md)
- 詳細指南：[guide.md](./guide.md)
