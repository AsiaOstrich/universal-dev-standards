# [SPEC-VIBE-01] Vibe Coding Integration / Vibe Coding 整合

**Priority**: P0
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-VIBE-001
**Dependencies**: [SPEC-HITL-01 HITL Protocol, SPEC-CASCADE-01 Cascading Config]

---

## Summary / 摘要

Vibe Coding Integration enables UDS to work seamlessly in natural language-driven development workflows. Rather than being a "linter that interrupts," UDS becomes an "Intent Navigator" and "Quality Gatekeeper" that operates in the background, ensuring quality without disrupting developer flow.

Vibe Coding 整合使 UDS 能在自然語言驅動的開發工作流程中無縫運作。UDS 不再是「打斷工作流程的 linter」，而是成為在背景運作的「意圖導航員」和「品質守門員」，在不干擾開發者流程的情況下確保品質。

---

## Motivation / 動機

### Industry Context (2026) / 產業背景

> "Vibe Coding is not just a trend—it's the new default. Developers expect to describe intent, not write boilerplate."

1. **Natural Language Development**: Developers increasingly use prompts like "build me a login page" instead of writing code manually
2. **AI-First Workflows**: Claude Code, Cursor, Copilot have normalized AI-assisted development
3. **Speed Over Ceremony**: Startups and prototypes prioritize velocity over formal specifications
4. **Risk of Technical Debt**: Without guardrails, vibe coding produces unmaintainable code

### Problem Statement / 問題陳述

If UDS remains a "strict standards enforcer," it will be perceived as:
- An obstacle to velocity
- Incompatible with modern AI workflows
- Outdated in the 2026 development landscape

如果 UDS 仍是「嚴格的規範執行者」，它將被視為：
- 速度的障礙
- 與現代 AI 工作流程不相容
- 在 2026 年開發環境中過時

### Solution / 解決方案

Transform UDS positioning:

**From**: 規範檢查者 (Linter)
**To**: 意圖導航員 (Intent Navigator) + 品質守門員 (Quality Gatekeeper)

> **"Guardrails for Velocity"** — UDS enables speed by preventing the chaos that slows teams down later.

---

## User Stories / 使用者故事

### US-1: Invisible Quality Assurance

```
As a developer doing vibe coding,
I want UDS to run quality checks in the background,
So that I get a clean codebase without interrupting my flow.

作為進行 vibe coding 的開發者，
我想要 UDS 在背景執行品質檢查，
讓我在不中斷流程的情況下獲得乾淨的程式庫。
```

### US-2: Micro-Spec Generation

```
As a developer describing a feature in natural language,
I want the AI to generate a micro-spec before coding,
So that I can confirm intent before implementation.

作為用自然語言描述功能的開發者，
我想要 AI 在編碼前生成微規格，
讓我在實作前確認意圖。
```

### US-3: Post-Session Cleanup

```
As a developer completing a vibe coding session,
I want UDS to auto-apply refactoring standards,
So that my quick prototype doesn't become permanent tech debt.

作為完成 vibe coding 會話的開發者，
我想要 UDS 自動套用重構規範，
讓我的快速原型不會變成永久技術債。
```

### US-4: Snapshot Verification

```
As a developer building UI components,
I want to verify behavior via screenshots instead of unit tests,
So that I can validate quickly during prototyping.

作為建立 UI 元件的開發者，
我想要透過截圖而非單元測試驗證行為，
讓我在原型階段能快速驗證。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Micro-Spec Generation

**Given** the user provides a natural language feature request
**When** the AI begins implementation
**Then**:
- A micro-spec (5-10 lines) is generated in UDS format
- **Confirmation Strategy**:
  - *Terminal Mode*: User is prompted via Inquirer CLI (best for shell users)
  - *Chat Mode* (Recommended for Cursor/Windsurf): Spec is output to stdout; AI tool reads it and asks user in-chat "Shall I proceed?" to maintain flow
- Spec is stored in `specs/` directory with format `SPEC-XXX-slug.md` for traceability

**Micro-Spec Format**:
```markdown
## Micro-Spec: Login Page

**Intent**: Create a login page with email/password authentication
**Scope**: frontend only, no backend changes
**Acceptance**:
- [ ] Email input with validation
- [ ] Password input with show/hide toggle
- [ ] "Forgot password" link
- [ ] Form submission to /api/auth/login

**Confirmed**: [Yes/No/Skip]
```

### AC-2: Background Quality Sweep

**Given** a vibe coding session ends (detected by 30s inactivity or explicit `/done`)
**When** the Auto-Sweep is enabled in config
**Then**:
- Refactoring standards are applied automatically
- Console.log statements are removed
- Dead code is flagged
- Type annotations are suggested (if TypeScript)
- Summary report is displayed

### AC-3: Snapshot Verification Mode

**Given** UI components are created during vibe coding
**When** verification is triggered
**Then**:
- Screenshot of component is captured
- User can approve/reject visually
- Approval is logged as acceptance criteria met
- Failed snapshots are logged for manual review

### AC-4: Vibe Mode Toggle

**Given** a project has UDS configured
**When** I run `uds configure --vibe-mode`
**Then**:
- Strict linting is relaxed
- Micro-specs become optional (not blocking)
- Auto-sweep runs at session end (not during)
- HITL prompts are minimized

### AC-5: Standards Injection (Context Optimization)

**Given** Vibe Mode is enabled
**When** AI generates code
**Then**:
- **Context Injection Strategy**:
  - CLI compresses relevant `core/*.md` standards into token-optimized summaries (reducing context cost)
  - *Cursor*: Dynamically updates `.cursorrules` or generates specific instruction blocks
  - *Claude Code*: Injects via system prompt or MCP resource
- UDS standards are injected as soft constraints
- AI is guided but not forced to follow standards
- Violations are logged but not blocking
- End-of-session report shows violation count

---

## Technical Design / 技術設計

### Vibe Coding Pipeline / Vibe Coding 流水線

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Vibe Coding Pipeline                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Natural Language Intent                                                │
│   "Build me a login page with OAuth"                                    │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 1. Micro-Spec Generation (optional)                     │           │
│   │    • Parse intent → structured spec                     │           │
│   │    • User confirms (Chat or Terminal)                   │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 2. AI Code Generation                                   │           │
│   │    • UDS standards injected as soft constraints         │           │
│   │    • Code generated based on intent                     │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 3. Background Monitoring                                │           │
│   │    • Track violations (non-blocking)                    │           │
│   │    • Log for end-of-session report                      │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 4. Session End (Auto-Sweep)                             │           │
│   │    • Apply refactoring standards                        │           │
│   │    • Remove debug code                                  │           │
│   │    • Generate compliance report                         │           │
│   │    • Archive/Promote Micro-Specs                        │           │
│   └────────────────────────────────────────────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Micro-Spec Lifecycle / 微規格生命週期

1.  **Creation**: Generated in `specs/` directory with format `SPEC-XXX-slug.md` (Draft status).
2.  **Active**: Used during the Vibe Session as the source of truth.
3.  **Cleanup (Auto-Sweep)**:
    *   **Ephemeral (Default)**: If the code is simple/prototyping, the spec is archived to `specs/archive/`.
    *   **Promote**: If the user flags it as important (or via config), it is converted to a formal spec in `docs/specs/` and linked to the implementation.

### Configuration / 配置

```yaml
# .uds/config.yaml
vibe-coding:
  enabled: true

  micro-specs:
    generate: true
    require-confirmation: false  # Skip confirmation prompts
    storage: specs/  # Default: specs/, configurable via specs.path

  auto-sweep:
    enabled: true
    trigger: session-end  # or 'manual', 'commit-hook'
    actions:
      - remove-console-logs
      - flag-dead-code
      - suggest-types
      - apply-formatting

  snapshot-verification:
    enabled: true
    storage: .uds/snapshots/

  standards-injection:
    mode: soft  # 'soft' = suggest, 'strict' = enforce
    priority:
      - security-standards
      - error-handling
      - naming-conventions
```

### File Structure / 檔案結構

```
project/
├── .uds/
│   ├── config.yaml          # Vibe coding configuration
│   ├── snapshots/           # Visual verification snapshots
│   │   └── login-page-v1.png
│   └── reports/             # Auto-sweep reports
│       └── 2026-01-28-session.md
└── specs/                   # Generated micro-specs (default location)
    ├── SPEC-001-login.md
    ├── SPEC-002-dashboard.md
    └── archive/             # Archived specs
```

### CLI Commands / CLI 命令

```bash
# Enable vibe mode
uds configure --vibe-mode

# Toggle vibe mode off
uds configure --vibe-mode=off

# Manual sweep (apply cleanup)
uds sweep

# View session report
uds report --last-session

# Generate micro-spec from description
uds spec "Build a dashboard with charts"
```

---

## Integration Points / 整合點

### With AI Tools / 與 AI 工具整合

| AI Tool | Integration Method |
|---------|-------------------|
| Claude Code | Skill injection, hook integration |
| Cursor | .cursorrules injection |
| Copilot | Instructions file injection |
| Windsurf | Rules injection |

### With Existing Standards / 與現有規範整合

| Standard | Vibe Mode Behavior |
|----------|-------------------|
| `commit-message-guide.md` | Applied at commit time, not during vibe |
| `testing-standards.md` | Relaxed during prototype, enforced pre-merge |
| `code-review-checklist.md` | Applied during PR, not during vibe |
| `refactoring-standards.md` | Applied during auto-sweep |

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vibe mode produces unmaintainable code | High | Auto-sweep at session end, PR enforcement |
| Users never leave vibe mode | Medium | Metrics tracking, team policy support |
| Standards become optional | Medium | Strict mode for production branches |
| Micro-spec fatigue | Low | Make confirmations optional |

---

## Out of Scope / 範圍外

- Real-time AI model fine-tuning
- Custom AI model training on vibe patterns
- Multi-user collaborative vibe sessions
- IDE-specific plugin development

---

## Sync Checklist

### Starting from System Spec
- [ ] Create `/vibe` skill for Claude Code
- [ ] Create vibe-coding configuration schema
- [ ] Update CLI configure command
- [ ] Update translations (zh-TW, zh-CN)
- [ ] Create auto-sweep utility module

---

## References / 參考資料

- [Thoughtworks: Vibe Coding Practices](https://www.thoughtworks.com/)
- [Martin Fowler: AI-Assisted Development](https://martinfowler.com/)
- [UDS Refactoring Standards](../../core/refactoring-standards.md)
- [HITL Protocol Spec](./hitl-protocol.md)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
