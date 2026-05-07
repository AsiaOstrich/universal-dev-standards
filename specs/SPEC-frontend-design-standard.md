# SPEC: Frontend Design Standards — UDS 內部實作規格

> **狀態**: Completed
> **來源 XSPEC**: [XSPEC-026](https://github.com/AsiaOstrich/dev-platform/cross-project/specs/XSPEC-026-frontend-design-standards.md) Phase 1
> **依據**: DEC-029（awesome-design-md，MIT），DEC-030（OpenAI Frontend Guide）
> **負責子專案**: universal-dev-standards

---

## 目標

在 UDS 新增前端設計標準，定義：
1. DESIGN.md 的 9 段必填結構
2. 語義色彩 5 個必要 token
3. 字體角色 4 個
4. 間距比例（8px 基底，7 個步進值）
5. UI 硬性約束與 anti-pattern 清單
6. DESIGN.md 模板供使用者填寫

---

## 實作產物

| 產物 | 路徑 | 狀態 |
|------|------|------|
| 核心標準（Markdown）| `core/frontend-design-standards.md` | Completed |
| AI 優化標準（YAML）| `ai/standards/frontend-design-standards.ai.yaml` | Completed |
| DESIGN.md 模板 | `templates/DESIGN.md` | Completed |

---

## 驗收標準對照

| AC ID | 說明 | 產物 | 狀態 |
|-------|------|------|------|
| AC-1.1 | `frontend-design-standards.ai.yaml` 存在於 UDS 標準目錄 | `ai/standards/frontend-design-standards.ai.yaml` | PASS |
| AC-1.2 | 標準定義 DESIGN.md 的 9 段結構，每段有名稱、類型、是否必填、說明 | `ai/standards/frontend-design-standards.ai.yaml` > `design_md_sections` | PASS |
| AC-1.3 | 語義色彩的 5 個必要 token 有明確名稱規範 | `ai/standards/frontend-design-standards.ai.yaml` > `semantic_color_tokens.required` | PASS |
| AC-1.4 | 反模式清單至少包含 5 條禁止事項（實際包含 8 條） | `ai/standards/frontend-design-standards.ai.yaml` > `anti_patterns` | PASS |
| AC-1.5 | DESIGN.md 模板存在於適當位置 | `templates/DESIGN.md` | PASS |

---

## 注意事項

- 所有標準僅新增，未修改任何現有標準
- 授權：MIT（與 UDS 一致）
- `uds-manifest.json` 和 README 的更新已包含在本任務外（後續統一更新）
- Phase 2 和 Phase 3 為採用層獨立子專案任務
