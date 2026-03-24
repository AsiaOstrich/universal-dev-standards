---
source: ../../../../skills/commands/ci-cd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide CI/CD pipeline design, configuration and optimization"
allowed-tools: Read, Grep, Glob
argument-hint: "[pipeline config or stage | Pipeline 配置或階段]"
---

# CI/CD 助手

引導 CI/CD 管線設計、配置和優化。

## 工作流程

```
BUILD ──► TEST ──► ANALYZE ──► DEPLOY ──► VERIFY
```

## 使用方式

- `/ci-cd` - 開始互動式管線設計
- `/ci-cd github-actions` - 為指定平台設計
- `/ci-cd --optimize` - 優化現有管線
- `/ci-cd build` - 聚焦建置階段

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/ci-cd` | 偵測現有 CI 配置（`.github/workflows/`、`.gitlab-ci.yml` 等），展示狀態或開始設計 |
| `/ci-cd <platform>` | 為指定平台設計管線 |
| `/ci-cd --optimize` | 分析現有管線，提出優化建議 |
| `/ci-cd <stage>` | 聚焦特定階段（build/test/deploy） |

### Interaction Script | 互動腳本

1. 偵測專案技術棧和現有 CI 配置
2. 依據需求設計或優化管線

**決策：現有配置**
- IF 已有 CI 配置 → 分析現狀，建議優化
- IF 無 CI 配置 → 引導從頭設計
- IF `--optimize` → 直接進入優化分析

3. 逐階段設計（BUILD→TEST→ANALYZE→DEPLOY→VERIFY）
4. 展示完整管線配置

🛑 **STOP**: 配置展示後等待使用者確認寫入

### Stop Points | 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 管線設計完成後 | 確認配置正確並寫入 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 無法偵測 CI 平台 | 列出支援的平台供選擇 |
| 現有配置語法錯誤 | 報告錯誤位置，建議修正 |

## 參考

- 完整標準：[ci-cd-assistant](../ci-cd-assistant/SKILL.md)
