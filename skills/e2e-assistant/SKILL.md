---
name: e2e
scope: partial
description: "[UDS] Generate E2E test skeletons from BDD scenarios"
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*)
argument-hint: "[feature file or --analyze | .feature 檔案或 --analyze]"
status: experimental
---

# E2E Assistant | E2E 助手

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

Generate E2E test skeletons from BDD `.feature` scenarios, with framework detection and coverage gap analysis.

從 BDD `.feature` 場景生成 E2E 測試骨架，支援框架偵測與覆蓋差距分析。

## Workflow | 工作流程

```
/derive bdd → .feature 場景
    ↓
/e2e → 分析 AC 適用性 → 偵測框架 → 參考既有模式 → 生成骨架
    ↓
手動執行驗證
```

## Modes | 模式

### 1. Generation Mode (Default) | 生成模式（預設）

Analyze BDD scenarios, classify AC suitability, detect framework, and generate E2E test skeletons.

分析 BDD 場景、分類 AC 適用性、偵測框架、生成 E2E 測試骨架。

### 2. Analysis Mode (--analyze) | 分析模式

Scan coverage gaps between BDD features and existing E2E tests.

掃描 BDD feature 與既有 E2E 測試之間的覆蓋差距。

## AC Classification | AC 分類

| Category | Condition | Example |
|----------|-----------|---------|
| `e2e-suitable` | Multi-step user flow or UI interaction | Login → Action → Verify |
| `integration-suitable` | Cross-component without UI | API call → DB write |
| `unit-suitable` | Pure logic or computation | Sort, validate, format |

## Supported Frameworks | 支援框架

| Ecosystem | Framework | Auto-detected | Detection signal |
|-----------|-----------|:------------:|----------|
| JavaScript | Playwright | ✅ | `@playwright/test` in package.json |
| JavaScript | Cypress | ✅ | `cypress` dep + config file |
| JavaScript | Vitest | ✅ | `vitest` dep + e2e directory |
| JavaScript | WebdriverIO | ❌ Manual | listed in SUPPORTED_FRAMEWORKS |
| Python | pytest-playwright | ✅ | `pytest-playwright` in requirements |
| Python | Selenium + pytest | ✅ | `selenium` in requirements |
| Python | Robot Framework | ✅ | `robotframework` in requirements |
| Python | Behave | ✅ | `behave` in requirements |
| Go | chromedp | ✅ | `chromedp` in go.mod |
| Go | rod | ✅ | `rod` in go.mod |
| Java | Selenium WebDriver | ✅ | `selenium-java` in pom.xml / build.gradle |
| Java | Playwright for Java | ✅ | `playwright` in pom.xml / build.gradle |
| Java | Gauge | ✅ | `gauge-java` in pom.xml / build.gradle |
| Ruby | Capybara | ✅ | `capybara` in Gemfile |
| Ruby | Watir | ✅ | `watir` in Gemfile |
| C# | Playwright for .NET | ❌ Manual | not yet auto-detected |
| C# | Selenium WebDriver | ❌ Manual | not yet auto-detected |

## Usage | 使用方式

```
/e2e <feature-file>            - Generate E2E skeleton from BDD scenarios
/e2e <spec-file>               - Delegate to /derive e2e for SDD specs
/e2e --analyze                 - Scan all features for E2E coverage gaps
/e2e --analyze <feature-file>  - Analyze specific feature's AC suitability
```

## Next Steps Guidance | 下一步引導

After `/e2e` completes, the AI assistant should suggest:

> **E2E 骨架已生成。建議下一步 / E2E skeleton generated. Suggested next steps:**
> - 執行 `/tdd` 填入 `[TODO]` 標記的測試實作 ⭐ **Recommended / 推薦** — Implement test logic
> - 執行 `/checkin` 品質關卡（若功能完成）— Quality gates (if feature complete)
> - 執行 `/e2e --analyze` 檢查整體 E2E 覆蓋狀況 — Check overall E2E coverage

## Reference | 參考

- Spec: [SPEC-E2E-001](../../docs/specs/skills/SPEC-E2E-001-e2e-skill.md)
- Core standard: [testing-standards.md](../../core/testing-standards.md)
- Utilities: `cli/src/utils/e2e-analyzer.js`, `cli/src/utils/e2e-detector.js`

## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/e2e`](../commands/e2e.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/e2e`](../commands/e2e.md#ai-agent-behavior--ai-代理行為)
