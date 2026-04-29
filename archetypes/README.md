# Flow Archetypes（流程原型）

> **分類依據**: [DEC-052](../../../dev-platform/cross-project/decisions/DEC-052-flow-archetype-layer.md)
> **四層模型**: Standards → Skills → **Flows（含 Archetype）** → Adapters（DEC-051）

Flow Archetype 是 Flows 層的 sub-classification，把多條 verb-flow 編排成一個「使用者旅程」。

## Verb-flow vs Archetype-flow

| 分類 | 檔案格式 | 位置 | 定義 |
|------|---------|------|------|
| **Verb-flow** | `*.flow.yaml` | `flows/` | 單一動作的序列編排（如 tdd, commit） |
| **Archetype-flow** | `*.archetype.yaml` | `archetypes/` | 使用者旅程的編排，引用多條 verb-flow |

## 現有 Archetype 清單

| Archetype | ID | 起點 | 主要對標工具 |
|-----------|-----|------|-------------|
| [正向需求驅動](forward-requirements.archetype.yaml) | `forward-requirements` | 自然語言需求 | Copilot Workspace |
| [UI-first Vibe Coding](ui-first.archetype.yaml) | `ui-first` | screenshot / Figma | Lovable / Bolt.new / v0 |
| [逆向工程](reverse-engineering.archetype.yaml) | `reverse-engineering` | 既有程式碼倉 | Sourcegraph Cody |

## Schema

Archetype YAML 必須符合 [archetype.schema.json](archetype.schema.json)。

## 命名規則

- 檔名：`<archetype-id>.archetype.yaml`
- archetype id：kebab-case 英文
- 必須包含 `name.zh`（繁體中文）和 `name.en`（英文）
