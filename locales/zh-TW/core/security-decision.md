---
source: ../../../core/security-decision.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: dac1cdefe950
status: current
---

# 安全決策標準

> **語言**: [English](../../../core/security-decision.md) | 繁體中文

> **來源**: XSPEC-037 | **借鑑自**: claude-code-book Ch.4

## 概述

安全決策標準定義三態決策模型（`deny` / `ask` / `allow`），並以鐵律規範優先級：**deny 永遠勝出**，無論來源的優先級為何。這表示低優先級使用者設定中的 `deny`，會覆蓋高優先級政策設定中的 `allow`。

## 三態

| 決策 | 優先級 | 行為 |
|------|--------|------|
| `deny` | 1（最高） | 立即阻擋，不再進一步評估 |
| `ask` | 2 | 暫停並請求使用者確認 |
| `allow` | 3（最低） | 允許操作繼續 |

## 仲裁規則

```
if any rule has deny → final decision: deny
else if any rule has ask → final decision: ask
else → final decision: allow
```

**不變式**：deny 勝出不受來源優先級影響。

## CI 模式

在非互動（CI/CD）環境中，`ask` 視同 `deny` — 由於沒有提供人工確認的機制，操作必須被阻擋。

## projectSettings 信任半徑

來自 `projectSettings`（`.adoption/` 類型目錄）的設定，會被排除於安全敏感操作之外，以防止惡意 repository 注入：

**來自 projectSettings 而被阻擋的操作**：
- 將 `requiresUserConfirmation` 設為 `false`
- 將記憶體路徑重定向到專案目錄外
- 將工具白名單擴充超出 userSettings 範圍
- 將 deny 規則降級為 allow

日誌：`[WARN] projectSettings security override rejected: {operation}`

## 介面

```typescript
type SecurityDecision = "deny" | "ask" | "allow";

interface SecurityDecisionRule {
  source: string;        // user | project | policy | builtin
  decision: SecurityDecision;
  reason?: string;
}

function arbitrate(rules: SecurityDecisionRule[]): SecurityDecision {
  if (rules.some(r => r.decision === "deny")) return "deny";
  if (rules.some(r => r.decision === "ask")) return "ask";
  return "allow";
}
```

## 參考資料

- AI 最佳化版本：[ai/standards/security-decision.ai.yaml](../../../ai/standards/security-decision.ai.yaml)
- XSPEC-037：跨專案規格
- 借鑑自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.4 四階段權限管線


**Scope**: universal
