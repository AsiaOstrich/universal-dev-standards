---
source: ../../../../skills/incident-response-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: "[UDS] 引導事故回應、根因分析和事後檢討文件撰寫"
name: incident
allowed-tools: Read, Write, Grep, Glob
scope: universal
argument-hint: "[incident description or severity | 事故描述或嚴重程度]"
---

# 事故回應助手

> **語言**: [English](../../../../skills/incident-response-assistant/SKILL.md) | 繁體中文

引導結構化的事故回應流程，從偵測到事後檢討。

## 嚴重程度分類

| 等級 | 名稱 | 標準 | 回應時間 |
|------|------|------|----------|
| **SEV-1** | 重大 | 全面服務中斷、資料遺失 | 立即（< 15 分鐘） |
| **SEV-2** | 高 | 主要功能降級、部分中斷 | < 30 分鐘 |
| **SEV-3** | 中 | 次要功能受影響、有替代方案 | < 4 小時 |
| **SEV-4** | 低 | 外觀問題、最小用戶影響 | 下一個工作日 |

## 回應工作流程

```
DETECT ──► TRIAGE ──► MITIGATE ──► RESOLVE ──► POST-MORTEM
偵測         分級        緩解          解決         事後檢討
```

### 1. Detect — 偵測事故
監控告警、使用者回報、錯誤量飆升。

### 2. Triage — 分級嚴重程度
指定嚴重等級、識別事故指揮官（IC）。

### 3. Mitigate — 緩解影響
套用暫時修復：回滾、功能開關、流量切換。

### 4. Resolve — 永久修復
根因分析、實作正確修復、部署。

### 5. Post-Mortem — 事後檢討
記錄時間軸、影響範圍、根因、行動項目。

## 事後檢討模板

```markdown
## 事後檢討：[事故標題]
**日期**: YYYY-MM-DD  |  **嚴重程度**: SEV-N  |  **持續時間**: Xh Ym

### 時間軸
| 時間 | 事件 |
|------|------|
| HH:MM | 告警觸發 |
| HH:MM | 指派事故指揮官 |
| HH:MM | 套用緩解措施 |
| HH:MM | 解決 |

### 影響
- 受影響用戶數：N
- 營收影響：$N
- SLA 違反：是/否

### 根本原因
[根本原因描述]

### 行動項目
| 行動 | 負責人 | 截止日期 | 優先級 |
|------|--------|----------|--------|
| [修復] | @name | YYYY-MM-DD | P0 |
```

## 溝通模板

```
[SEV-N] [服務名稱] — [簡短描述]
狀態：調查中 / 緩解中 / 已解決
影響：[誰受到影響及如何影響]
下次更新：[時間]
```

## 使用方式

- `/incident` - 顯示完整事故回應指南
- `/incident "API 500 errors"` - 特定事故引導回應
- `/incident --post-mortem` - 產生事後檢討模板
- `/incident --sev1` - SEV-1 快速回應清單

## 下一步引導

`/incident` 完成後，AI 助手應建議：

> **事故回應指引已提供。建議下一步：**
> - 執行 `/commit` 建立修復提交
> - 執行 `/review` 審查修復變更
> - 執行 `/docs` 更新文件
> - 執行 `/security` 檢查安全影響

## 參考

- 核心規範：[deployment-standards.md](../../../../core/deployment-standards.md)
- 核心規範：[logging.md](../../../../core/logging.md)
