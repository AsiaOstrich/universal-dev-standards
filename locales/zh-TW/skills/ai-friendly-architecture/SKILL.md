---
source: ../../../../skills/ai-friendly-architecture/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
scope: uds-specific
description: |
  設計 AI 友善架構，包含明確模式、分層文件和語義邊界。
  使用時機：為 AI 協作規劃專案結構、優化程式碼庫以利 AI 分析、設定 AI 上下文。
  關鍵字：architecture, AI-friendly, context, modules, documentation layers, .ai-context.yaml, 架構, AI 友善, 上下文.
---

# AI 友善架構指南

> **語言**: [English](../../../../skills/ai-friendly-architecture/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-25
**適用範圍**: Claude Code Skills

---

> **核心標準**: 本技能實作 [AI 友善架構](../../core/ai-friendly-architecture.md)。完整方法論文件請參閱核心標準。

## 目的

本技能協助設計專案架構，透過明確模式、分層文件和語義邊界，最大化 AI 協作效能。

## 快速參考

### 核心原則

| 原則 | 描述 | 效益 |
|------|------|------|
| **明確優於隱含** | 明確記錄行為 | AI 無需猜測即可理解 |
| **分層上下文** | 多層級文件 | 依任務提供適當細節 |
| **語義邊界** | 清晰的模組邊界 | 獨立分析 |
| **可發現結構** | 自我說明的結構 | 快速定位 |

### 上下文層級

| 層級 | Token 預算 | 內容 |
|------|------------|------|
| **L1: 快速參考** | < 500 | 單行說明、API 簽章、入口點 |
| **L2: 詳細** | < 5,000 | 完整 API 文件、使用範例 |
| **L3: 範例** | 無限制 | 完整實作、邊界案例 |

### 建議結構

```
project/
├── .ai-context.yaml          # AI 上下文配置
├── docs/
│   ├── QUICK-REF.md          # 第 1 層文件
│   └── ARCHITECTURE.md       # 第 2 層文件
├── src/
│   └── auth/
│       ├── index.ts          # 入口點與模組標頭
│       ├── QUICK-REF.md      # 模組快速參考
│       └── README.md         # 模組文件
└── CLAUDE.md                 # AI 指令檔案
```

## 模組標頭範本

```javascript
/**
 * ═══════════════════════════════════════════════════════════
 * 模組: [模組名稱]
 * ═══════════════════════════════════════════════════════════
 *
 * 目的: [單句描述]
 *
 * 相依性:
 *   - [dep1]: [原因]
 *   - [dep2]: [原因]
 *
 * 匯出:
 *   - [function1](params): [描述]
 *   - [function2](params): [描述]
 *
 * 配置:
 *   - [CONFIG_VAR]: [描述]
 *
 * ═══════════════════════════════════════════════════════════
 */
```

## 詳細指南

完整標準請參閱：
- [AI 友善架構標準](../../core/ai-friendly-architecture.md)

### AI 優化格式（Token 效率）

AI 助手可使用 YAML 格式檔案以減少 Token 使用：
- 基礎標準：`ai/standards/ai-friendly-architecture.ai.yaml`

## .ai-context.yaml 配置

```yaml
# .ai-context.yaml - AI 上下文配置
version: 1.0.0

project:
  name: my-project
  type: web-app  # web-app | library | cli | api | monorepo
  primary-language: typescript

modules:
  - name: auth
    path: src/auth/
    entry: index.ts
    description: 驗證與授權
    dependencies: [database, crypto]
    priority: high

  - name: api
    path: src/api/
    entry: routes.ts
    description: REST API 端點
    dependencies: [auth, database]
    priority: high

analysis-hints:
  entry-points:
    - src/main.ts
    - src/index.ts
  ignore-patterns:
    - node_modules
    - dist
    - "*.test.ts"
  architecture-type: layered

documentation:
  quick-ref: docs/QUICK-REF.md
  detailed: docs/ARCHITECTURE.md
  examples: docs/examples/
```

## 上下文優先順序指南

| 優先級 | 內容類型 | 原因 |
|--------|----------|------|
| 1 | 入口點 | 應用程式結構 |
| 2 | .ai-context.yaml | 模組地圖和相依性 |
| 3 | QUICK-REF 檔案 | 快速 API 理解 |
| 4 | 修改的檔案 | 與任務直接相關 |
| 5 | 相依鏈 | 變更的上下文 |

## 應避免的反模式

| 反模式 | 問題 | 解決方案 |
|--------|------|----------|
| **魔術字串** | AI 無法追蹤常數 | 帶文件的型別常數 |
| **隱式路由** | 隱藏行為 | 明確路由映射 |
| **全域狀態** | 不可預測的相依性 | 依賴注入 |
| **循環相依** | 上下文混亂 | 階層式相依 |
| **單體檔案** | 上下文溢出 | 專注的模組 |

## 實作檢查清單

### 快速開始（< 1 小時）

- [ ] 建立 `.ai-context.yaml` 含模組清單
- [ ] 在專案根目錄新增 `QUICK-REF.md`
- [ ] 在 README 中記錄入口點
- [ ] 為主要檔案新增模組標頭

### 標準實作（< 1 天）

- [ ] 完成 `.ai-context.yaml` 配置
- [ ] 為每個主要模組新增 `QUICK-REF.md`
- [ ] 記錄所有公開 API 及型別資訊
- [ ] 為大型檔案新增區段分隔

---

## 配置偵測

本技能支援專案特定配置。

### 偵測順序

1. 檢查是否存在 `.ai-context.yaml`
2. 檢查是否存在 `QUICK-REF.md` 檔案
3. 若未找到，**建議建立 AI 友善結構**

### 首次設定

若未找到配置：

1. 建議：「此專案尚未為 AI 協作進行配置。是否要設定 AI 友善結構？」
2. 建立 `.ai-context.yaml` 範本
3. 在專案根目錄建立 `QUICK-REF.md`

---

## 相關標準

- [AI 友善架構](../../core/ai-friendly-architecture.md) - 核心架構標準
- [專案結構](../../core/project-structure.md) - 目錄組織
- [文件結構](../../core/documentation-structure.md) - 文件分層
- [反幻覺](../../core/anti-hallucination.md) - AI 準確性標準

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-25 | 初始發布 |

---

## 授權

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
