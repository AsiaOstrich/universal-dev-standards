---
source: ../../../../skills/ci-cd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: "[UDS] 引導 CI/CD 管線設計、配置和優化"
name: ci-cd
allowed-tools: Read, Grep, Glob
scope: universal
argument-hint: "[pipeline config or stage | Pipeline 配置或階段]"
---

# CI/CD 管線助手

> **語言**: [English](../../../../skills/ci-cd-assistant/SKILL.md) | 繁體中文

引導 CI/CD 管線設計，遵循業界最佳實踐與 DORA 指標。

## 管線階段參考

```
BUILD ──► TEST ──► ANALYZE ──► DEPLOY ──► VERIFY
建置       測試      分析         部署       驗證
```

| 階段 | 用途 | 關鍵活動 |
|------|------|----------|
| **Build** | 編譯與打包 | 安裝相依、編譯、產出成品 |
| **Test** | 品質驗證 | 單元、整合、端對端測試 |
| **Analyze** | 程式碼品質 | 程式碼檢查、安全掃描、覆蓋率 |
| **Deploy** | 發布到環境 | 預備環境 → 正式環境部署 |
| **Verify** | 部署後驗證 | 冒煙測試、健康檢查、監控 |

## DORA 指標快速參考

| 指標 | 菁英 | 高 | 中 | 低 |
|------|------|-----|-----|-----|
| **部署頻率** | 隨需（每日多次） | 每週至每月 | 每月至半年 | > 6 個月 |
| **變更前置時間** | < 1 小時 | 1 天至 1 週 | 1 至 6 個月 | > 6 個月 |
| **MTTR** | < 1 小時 | < 1 天 | 1 天至 1 週 | > 6 個月 |
| **變更失敗率** | 0–15% | 16–30% | 16–30% | > 30% |

## 最佳實踐檢查清單

- [ ] **快速失敗** — 先執行最快的檢查（lint → 單元 → 整合 → E2E）
- [ ] **快取相依** — 在執行之間快取 `node_modules`、`.m2`、pip cache
- [ ] **平行作業** — 將測試套件分散到平行執行器
- [ ] **不可變成品** — 建置一次，將相同成品部署到所有環境
- [ ] **環境一致** — 保持預備環境與正式環境一致
- [ ] **密鑰管理** — 絕不寫死密鑰；使用 vault/環境變數
- [ ] **分支保護** — 要求 CI 通過才能合併
- [ ] **回滾策略** — 部署失敗時自動回滾

## 平台專屬提示

| 平台 | 快取 | 平行化 | 密鑰 | 備註 |
|------|------|--------|------|------|
| **GitHub Actions** | `actions/cache` | `matrix` 策略 | `secrets.*` | 使用 reusable workflows |
| **GitLab CI** | `cache:` 關鍵字 | `parallel:` 關鍵字 | CI/CD Variables | 使用 `include:` 模組化 |
| **Jenkins** | Stash/unstash | `parallel {}` 區塊 | Credentials plugin | 使用 shared libraries |

## 使用方式

- `/ci-cd` - 顯示完整管線指引
- `/ci-cd github-actions` - GitHub Actions 專屬提示
- `/ci-cd --optimize` - 管線優化建議
- `/ci-cd build` - 建置階段最佳實踐

## 下一步引導

`/ci-cd` 完成後，AI 助手應建議：

> **管線指引已提供。建議下一步：**
> - 執行 `/deploy` 設定部署策略
> - 執行 `/security` 檢查管線安全
> - 執行 `/testing` 設計測試策略
> - 執行 `/commit` 建立規範化提交

## 參考

- 核心規範：[pipeline-integration-standards.md](../../../../core/pipeline-integration-standards.md)
- 核心規範：[deployment-standards.md](../../../../core/deployment-standards.md)
