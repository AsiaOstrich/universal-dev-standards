# [SPEC-NEW-INTEGRATIONS-BATCH-01] New AI Tool Integrations: Aider and Continue.dev

**Priority**: P2
**Status**: Implemented
**Last Updated**: 2026-03-24
**Feature ID**: INT-BATCH-001
**Dependencies**: integrations/REGISTRY.json

---

## Summary / 摘要

Add integration support for two popular AI coding tools: Aider (terminal-based AI pair programming) and Continue.dev (VS Code AI extension). Each integration includes AGENTS.md (AI agent rules) and README.md (setup guide), and is registered in REGISTRY.json.

新增兩個熱門 AI 編碼工具的整合支援：Aider（終端機 AI 配對程式設計）和 Continue.dev（VS Code AI 擴充）。每個整合包含 AGENTS.md（AI 代理規則）和 README.md（設定指南），並在 REGISTRY.json 中註冊。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. UDS supports 12 AI tools but lacks integration for Aider and Continue.dev, both with growing market share.
2. Aider is the leading open-source terminal AI coding agent; Continue.dev is a popular VS Code AI extension.
3. Users of these tools cannot easily adopt UDS standards in their workflows.

### Solution / 解決方案

Create integration files following the existing pattern (matching Cline, Cursor, etc.):
- `integrations/aider/AGENTS.md` — AI agent rules for Aider
- `integrations/aider/README.md` — Setup guide
- `integrations/continue-dev/AGENTS.md` — AI agent rules for Continue.dev
- `integrations/continue-dev/README.md` — Setup guide
- Update `integrations/REGISTRY.json` with both entries

---

## Acceptance Criteria / 驗收條件

### AC-1: Aider Integration Files

**Given** the Aider integration is added
**When** its files are examined
**Then** `integrations/aider/AGENTS.md` contains UDS standard rules (anti-hallucination, SDD, commit standards, workflow enforcement) adapted for Aider's `.aider.conf.yml` configuration, and `integrations/aider/README.md` contains setup instructions.

### AC-2: Continue.dev Integration Files

**Given** the Continue.dev integration is added
**When** its files are examined
**Then** `integrations/continue-dev/AGENTS.md` contains UDS standard rules adapted for Continue.dev's context providers and system message configuration, and `integrations/continue-dev/README.md` contains setup instructions.

### AC-3: REGISTRY.json Updated

**Given** both integrations are added
**When** `integrations/REGISTRY.json` is read
**Then** it contains entries for `aider` and `continue-dev` with `tier: "partial"`, `supportsAgents: true`.

### AC-4: Valid JSON

**Given** REGISTRY.json is updated
**When** it is parsed
**Then** it is valid JSON with no syntax errors.

---

## Technical Design / 技術設計

### File Structure

```
integrations/
├── aider/
│   ├── AGENTS.md       # AI agent rules
│   └── README.md       # Setup guide
├── continue-dev/
│   ├── AGENTS.md       # AI agent rules
│   └── README.md       # Setup guide
└── REGISTRY.json       # Updated with both entries
```

### Registry Entry Format

```json
{
  "name": "aider",
  "displayName": "Aider",
  "tier": "partial",
  "supportsAgents": true,
  "supportsSkills": false
}
```

---

## Test Plan / 測試計畫

- [ ] Verify all 4 files exist
- [ ] Verify REGISTRY.json is valid JSON
- [ ] Verify `check-ai-agent-sync.sh` passes

---

## Implementation Status / 實作狀態

✅ Implemented on 2026-03-24. Created 4 integration files and updated REGISTRY.json.
