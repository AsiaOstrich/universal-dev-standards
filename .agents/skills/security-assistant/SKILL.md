---
name: security
source: ../../../../skills/security-assistant/SKILL.md
source_version: 1.1.0
translation_version: 1.2.0
last_synced: 2026-11-28
source_hash: d43d13d774e2
status: current
scope: universal
description: |
  引導安全審查與弱點評估，遵循 OWASP 標準。
  Use when: 安全稽核、弱點檢查、安全程式碼審查、威脅建模。
  Not for: 自動化的相依套件、CVE 與機密掃描——請用 /scan；處理正在發生的資安事件——請用 /incident。
  Keywords: security, OWASP, vulnerability, authentication, authorization, 資訊安全, 弱點, 認證, 授權, 威脅建模.
allowed-tools: Read, Grep, Glob, Bash(uds security check-findings:*)
argument-hint: "[module or file to audit | 要審計的模組或檔案]"
---

# 安全審計助手

> **語言**: [English](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/skills/security-assistant/SKILL.md) | 繁體中文

引導系統化的安全審查，遵循 OWASP Top 10 和業界最佳實踐。

## 快速檢查清單 — OWASP Top 10 預防

| ID | 風險 | 預防措施 |
|----|------|----------|
| A01 | 存取控制失效 | 最小權限原則，預設拒絕 |
| A02 | 加密失敗 | 使用強加密演算法，保護金鑰 |
| A03 | 注入攻擊 | 參數化查詢、輸入驗證 |
| A04 | 不安全設計 | 威脅建模、安全設計模式 |
| A05 | 安全配置錯誤 | 強化預設值、最小權限 |
| A06 | 易受攻擊的元件 | 追蹤相依套件、定期修補 |
| A07 | 認證失敗 | 多因素認證、強密碼策略 |
| A08 | 資料完整性失敗 | 驗證簽章、使用可信來源 |
| A09 | 日誌記錄失敗 | 記錄安全事件、監控告警 |
| A10 | SSRF | 驗證 URL、限制對外流量 |

## 安全審查工作流程

```
SCOPE ──► SCAN ──► VERIFY ──► ANALYZE ──► REPORT
```

### 1. Scope — 定義審計範圍
識別目標模組、資料流和信任邊界。

### 2. Scan — 識別漏洞
檢查程式碼的 OWASP Top 10 模式、檢查相依套件、檢視配置。

### 3. Verify — 驗證：試圖推翻每個發現
掃描產生的每個候選發現，都交給**沒有參與發現的驗證者**。只由發現者自己裁決的發現，只是被提出，不是被驗證（[verification-evidence](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/verification-evidence.md) VE-013）。

- **誰來驗證**：沒有參與掃描的全新 agent、子代理或人。只給它主張、位置與程式碼，**不給發現者的推理**。以這樣的立場開場：「這不是你寫的發現，試著從原始碼推翻它。」
- **沒有獨立驗證者**：該發現維持 `unverified`，不得自己確認自己的發現。
- **只有三種狀態**：

| 狀態 | 意義 | 可帶嚴重度？ |
|------|------|--------------|
| `confirmed` | 驗證者試圖推翻而失敗，並留下證據 | **可以 —— 唯一可帶嚴重度的狀態** |
| `unverified` | 尚無驗證者裁決，或驗證者無法判斷 | **不可以** |
| `refuted` | 驗證者證明該發現不成立 | **不可以** |

被推翻的發現**保留**並寫明理由，下次審查才不會換個說法再提一次。待驗證的發現既不算通過，也不算不存在。

### 4. Analyze — 評估風險
只對**已確認**的發現，依嚴重程度（Critical/High/Medium/Low）和可利用性分類。其他狀態的發現不排序。

### 5. Report — 記錄發現
產出可行動的發現報告，附帶修復建議，採用下方的結構化格式，並在交出前跑檢查。審查只有兩種結束方式：**`all_verified`**（沒有發現停在 `unverified`），或 **`incomplete`** 並寫明原因。不得半途停下而不說明。

## 發現報告格式

```json
{
  "scope": "src/auth",
  "completion": "incomplete",
  "incomplete_reason": "F-2 had no separate verifier",
  "findings": [
    { "id": "F-1", "title": "SQL built by string concatenation", "location": "src/auth/login.js:42",
      "discovered_by": "scan", "status": "confirmed", "severity": "high",
      "verified_by": "verifier-1", "evidence": "req.body.user reaches db.exec unescaped",
      "remediation": "Use a parameterized query" },
    { "id": "F-2", "title": "Weak password hash", "location": "src/auth/hash.js:8",
      "discovered_by": "scan", "status": "unverified",
      "pending_reason": "no separate verifier was available" },
    { "id": "F-3", "title": "Reflected XSS", "location": "src/ui/view.js:15",
      "discovered_by": "scan", "status": "refuted",
      "verified_by": "verifier-1", "refutation_reason": "the template escapes this output" }
  ]
}
```

各狀態的欄位契約：

- `confirmed`：`severity`（critical / high / medium / low）、`verified_by`、`evidence`；`remediation` 選填。
- `unverified`：`pending_reason`。**不得有 `severity`。**
- `refuted`：`verified_by`、`refutation_reason`。**不得有 `severity`，也不得有 `remediation`。**
- `verified_by` 必須與 `discovered_by` 不同。`completion` 是 `all_verified` 或 `incomplete`；`incomplete` 需要 `incomplete_reason`。

**只有「已確認」的發現可以帶嚴重度（SF-002）。**

### 跑檢查

```
uds security check-findings findings.json
uds security check-findings - <<'EOF'   # 或由標準輸入傳入
{ ...報告... }
EOF
```

結束碼 `0`：報告符合契約。`1`：不符合（逐筆點名），修正後才能交出。`2`：檢查無法判斷（檔案不存在或不是 JSON），**2 不算通過**。檢查只判斷報告的**形狀**，不判斷發現是否為真，也不判斷驗證者是否真的不知道發現過程；那一部分取決於你怎麼執行驗證階段。

## 嚴重程度分類

只適用於 `confirmed` 的發現。

| 等級 | 標準 |
|------|------|
| **Critical** | 遠端程式碼執行、資料洩漏 |
| **High** | 認證繞過、權限提升 |
| **Medium** | 資訊洩漏、CSRF |
| **Low** | 缺少 Header、冗長錯誤訊息 |

## 使用方式

```
/security                - 完整安全審查
/security src/auth       - 審計特定模組
/security --owasp        - OWASP Top 10 重點審查
```

## 下一步引導

`/security` 完成後，AI 助手應建議：

> **安全審查完成。建議下一步：**
> - 執行 `/checkin` 確認修復符合提交規範 ⭐ **推薦**
> - 執行 `/code-review` 進行程式碼審查
> - 執行 `/commit` 提交安全修復
> - 檢查相依套件更新 → `npm audit` 或 `pip audit`

## 參考

- 核心規範：[security-standards.md](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/security-standards.md)
- 誰可以裁決一項主張：[verification-evidence.md](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/verification-evidence.md)（VE-013 至 VE-020）

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-23 | 初始版本 |
| 1.1.0 | 2026-11-28 | 新增驗證階段（沒有參與發現的驗證者；確認／待驗證／推翻；只有確認可帶嚴重度）、結構化發現報告與 `uds security check-findings` |

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/security`](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/skills/commands/security.md#ai-agent-behavior--ai-代理行為)

## 授權

CC BY 4.0 — 文件內容
