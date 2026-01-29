# [SPEC-ROLLBACK-01] Workflow Rollback System / 工作流程回溯系統

**Priority**: P1
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-ROLLBACK-001
**Dependencies**: [CLI-AGENT-001 Agents & Workflows System]

---

## Summary / 摘要

The Workflow Rollback System provides automatic checkpointing and rollback capabilities for workflow execution. When a workflow step fails, the system can restore the project to a known good state, preventing partial changes from corrupting the codebase.

工作流程回溯系統為工作流程執行提供自動檢查點和回溯能力。當工作流程步驟失敗時，系統可以將專案恢復到已知良好狀態，防止部分變更破壞程式庫。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Partial Failures**: Workflow failures leave project in inconsistent state
2. **Manual Cleanup**: Developers must manually revert changes after errors
3. **Fear of Automation**: Users hesitate to use powerful workflows
4. **No Recovery Path**: No systematic way to undo workflow changes

### Solution / 解決方案

An automatic rollback system that:
- Creates checkpoints before each workflow step
- Detects failures and triggers rollback
- Restores project to pre-workflow state
- Provides manual rollback commands

---

## User Stories / 使用者故事

### US-1: Automatic Recovery

```
As a developer running a multi-step workflow,
I want the system to automatically rollback on failure,
So that my project isn't left in a broken state.

作為執行多步驟工作流程的開發者，
我想要系統在失敗時自動回溯，
讓我的專案不會處於損壞狀態。
```

### US-2: Manual Rollback

```
As a developer who ran a successful workflow,
I want to manually rollback if I'm unhappy with results,
So that I can undo changes I don't want.

作為執行成功工作流程的開發者，
我想要在對結果不滿意時手動回溯，
讓我可以撤銷不想要的變更。
```

### US-3: Checkpoint Inspection

```
As a developer debugging a workflow,
I want to see what checkpoints exist,
So that I can understand the workflow's progress.

作為除錯工作流程的開發者，
我想要看到存在哪些檢查點，
讓我了解工作流程的進度。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Automatic Checkpointing

**Given** a workflow starts execution
**When** each step begins
**Then**:
- Checkpoint is created before step execution
- Checkpoint includes: modified files, git state, timestamp
- Checkpoint is stored in `.uds/checkpoints/`

### AC-2: Failure Detection

**Given** a workflow step fails
**When** error is detected
**Then**:
- Error details are logged
- User is prompted: "Step failed. Rollback? [Y/n]"
- Rollback is executed if approved

### AC-3: Automatic Rollback

**Given** rollback is triggered
**When** restoration begins
**Then**:
- Files are restored to checkpoint state
- Git changes are reverted
- Success/failure message displayed
- Audit log updated

### AC-4: Manual Rollback

**Given** I run `uds workflow rollback`
**When** checkpoints exist
**Then**:
- List of available checkpoints shown
- Selected checkpoint is restored
- Confirmation required before execution

### AC-5: Checkpoint Management

**Given** checkpoints accumulate
**When** retention policy is applied
**Then**:
- Old checkpoints are pruned (default: 7 days)
- Last N checkpoints always kept (default: 5)
- Manual checkpoints never auto-deleted

### AC-6: Git Integration

**Given** workflow modifies Git state
**When** rollback is needed
**Then**:
- Uncommitted changes are stashed/restored
- Commits are reverted (if made during workflow)
- Branch state is restored

---

## Technical Design / 技術設計

### Checkpoint Structure / 檢查點結構

```
.uds/checkpoints/
├── workflow-feature-dev-2026-01-28-103000/
│   ├── manifest.json           # Checkpoint metadata
│   ├── files/                  # File snapshots
│   │   ├── src/
│   │   │   └── auth.js.bak
│   │   └── package.json.bak
│   └── git-state.json          # Git state (branch, HEAD, stash)
└── workflow-code-review-2026-01-28-110000/
    └── ...
```

### Checkpoint Manifest / 檢查點清單

```json
{
  "id": "workflow-feature-dev-2026-01-28-103000",
  "workflow": "feature-dev",
  "step": 2,
  "stepName": "implement-feature",
  "created": "2026-01-28T10:30:00Z",
  "files": [
    { "path": "src/auth.js", "hash": "abc123" },
    { "path": "package.json", "hash": "def456" }
  ],
  "git": {
    "branch": "feature/login",
    "head": "abc123def456",
    "dirty": true,
    "stash": "stash@{0}"
  },
  "type": "auto",
  "retainable": true
}
```

### Rollback Flow / 回溯流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Rollback Flow                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Workflow Execution                                                     │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ Step 1: Create Checkpoint                               │           │
│   │  • Snapshot modified files                              │           │
│   │  • Record git state                                     │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ Step 2: Execute Step                                    │           │
│   │  • Run agent/action                                     │           │
│   │  • Monitor for errors                                   │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ├── Success ──→ Continue to next step                            │
│        │                                                                │
│        └── Failure ──→ Trigger Rollback                                 │
│                            │                                            │
│                            ▼                                            │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ Rollback Process                                        │           │
│   │  1. Find last checkpoint                                │           │
│   │  2. Restore files from snapshot                         │           │
│   │  3. Restore git state                                   │           │
│   │  4. Clean up partial changes                            │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   Project Restored to Pre-Workflow State                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint Manager / 檢查點管理器

```javascript
// rollback/checkpoint-manager.js
export class CheckpointManager {
  constructor(projectRoot) {
    this.checkpointDir = path.join(projectRoot, '.uds', 'checkpoints');
  }

  async createCheckpoint(workflow, step, files) {
    const id = this.generateId(workflow, step);
    const manifest = {
      id,
      workflow,
      step: step.index,
      stepName: step.name,
      created: new Date().toISOString(),
      files: [],
      git: await this.captureGitState(),
      type: 'auto',
    };

    // Snapshot files
    for (const file of files) {
      const hash = await this.snapshotFile(id, file);
      manifest.files.push({ path: file, hash });
    }

    await this.saveManifest(id, manifest);
    return id;
  }

  async rollback(checkpointId) {
    const manifest = await this.loadManifest(checkpointId);

    // Restore files
    for (const file of manifest.files) {
      await this.restoreFile(checkpointId, file);
    }

    // Restore git state
    await this.restoreGitState(manifest.git);

    return { success: true, filesRestored: manifest.files.length };
  }
}
```

### CLI Commands / CLI 命令

```bash
# List checkpoints
uds workflow checkpoints
uds workflow checkpoints --workflow feature-dev

# Rollback to checkpoint
uds workflow rollback                    # Interactive selection
uds workflow rollback --latest           # Most recent checkpoint
uds workflow rollback --id <checkpoint-id>

# Create manual checkpoint
uds workflow checkpoint create --name "before-refactor"

# Clean old checkpoints
uds workflow checkpoints prune
uds workflow checkpoints prune --older-than 14d

# View checkpoint details
uds workflow checkpoint info <checkpoint-id>
```

### Configuration / 配置

```yaml
# .uds/config.yaml
rollback:
  enabled: true

  checkpointing:
    auto: true               # Create checkpoints automatically
    include-git: true        # Include git state
    max-file-size: 10MB      # Skip files larger than this

  retention:
    max-age: 7d              # Auto-delete after 7 days
    keep-last: 5             # Always keep last 5 checkpoints
    keep-manual: true        # Never delete manual checkpoints

  on-failure:
    prompt: true             # Ask before rollback
    auto-rollback: false     # Auto-rollback without asking
```

---

## Rollback Strategies / 回溯策略

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Full** | Restore all files to checkpoint | Major failure |
| **Partial** | Restore only failed step's files | Isolated error |
| **Git-only** | Only revert git changes | Code changes only |
| **Files-only** | Only restore files, keep git | Config changes |

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large file storage | Medium | Size limits, compression |
| Git conflicts on restore | Medium | Stash handling, conflict resolution |
| Incomplete rollback | High | Atomic operations, verification |

---

## Out of Scope / 範圍外

- Database rollback
- External service state
- Container state restoration
- Cross-machine rollback

---

## Sync Checklist

### Starting from System Spec
- [ ] Create checkpoint manager module
- [ ] Integrate with workflow executor
- [ ] Add rollback CLI commands
- [ ] Implement retention policy
- [ ] Update translations (zh-TW, zh-CN)

---

## References / 參考資料

- [Agents & Workflows System](./agents-workflows-system.md)
- [Git Stash Documentation](https://git-scm.com/docs/git-stash)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
