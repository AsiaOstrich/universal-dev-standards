# [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
# [Generated] BDD scenarios for core standard hooks

@SPEC-HOOKS-001
Feature: 核心標準 Hook 實作
  As a developer using UDS
  I want automatic enforcement hooks for commit-message, security, and logging standards
  So that non-compliant behavior is caught before it enters the codebase

  # --- REQ-1: Commit Message 驗證 Hook ---

  @SPEC-HOOKS-001 @AC-2
  Scenario: 合規的 commit message 通過驗證
    # [Source: SPEC-HOOKS-001:REQ-1:AC-2]
    Given validate-commit-msg.js hook script exists
    When I run it with input "feat(core): add hook support"
    Then the exit code SHALL be 0

  @SPEC-HOOKS-001 @AC-2
  Scenario: 不合規的 commit message 被攔截
    # [Source: SPEC-HOOKS-001:REQ-1:AC-2]
    Given validate-commit-msg.js hook script exists
    When I run it with input "bad message"
    Then the exit code SHALL be 1
    And the output SHALL contain an error hint

  @SPEC-HOOKS-001 @AC-2
  Scenario: 支援所有標準 commit type
    # [Source: SPEC-HOOKS-001:REQ-1:AC-2]
    Given validate-commit-msg.js hook script exists
    When I run it with each valid type: feat, fix, docs, chore, test, refactor, style, perf, ci, build, revert
    Then each SHALL pass with exit code 0

  # --- REQ-2: 危險命令偵測 Hook ---

  @SPEC-HOOKS-001 @AC-3
  Scenario: 偵測強制刪除命令
    # [Source: SPEC-HOOKS-001:REQ-2:AC-3]
    Given check-dangerous-cmd.js hook script exists
    When I run it with input containing "rm -rf /"
    Then the exit code SHALL be 1
    And the output SHALL contain a warning message

  @SPEC-HOOKS-001 @AC-3
  Scenario: 安全命令通過
    # [Source: SPEC-HOOKS-001:REQ-2:AC-3]
    Given check-dangerous-cmd.js hook script exists
    When I run it with input "ls -la"
    Then the exit code SHALL be 0

  @SPEC-HOOKS-001 @AC-3
  Scenario: npm test 通過安全檢查
    # [Derived: SPEC-HOOKS-001:REQ-2:AC-3]
    Given check-dangerous-cmd.js hook script exists
    When I run it with input "npm test"
    Then the exit code SHALL be 0

  # --- REQ-3: 結構化日誌檢查 Hook ---

  @SPEC-HOOKS-001 @AC-5
  Scenario: 非結構化日誌被標記
    # [Source: SPEC-HOOKS-001:REQ-3]
    Given check-logging-standard.js hook script exists
    When I run it against code containing 'console.log("debug info")'
    Then the exit code SHALL be 1
    And the output SHALL suggest using structured logging

  @SPEC-HOOKS-001 @AC-5
  Scenario: 結構化日誌通過檢查
    # [Source: SPEC-HOOKS-001:REQ-3]
    Given check-logging-standard.js hook script exists
    When I run it against code using JSON-format logger
    Then the exit code SHALL be 0

  # --- REQ-4: Hook 安裝模組 ---

  @SPEC-HOOKS-001 @AC-1
  Scenario: 首次安裝 — 無既有 settings.json
    # [Source: SPEC-HOOKS-001:REQ-4:AC-1]
    Given the target project has no .claude/settings.json
    When hooks-installer.js runs
    Then a new .claude/settings.json SHALL be created
    And it SHALL contain 3 hook configurations

  @SPEC-HOOKS-001 @AC-1
  Scenario: 合併安裝 — 既有 settings.json
    # [Source: SPEC-HOOKS-001:REQ-4:AC-1]
    Given the target project has an existing .claude/settings.json with custom settings
    When hooks-installer.js runs
    Then the hook configurations SHALL be merged into the existing file
    And the custom settings SHALL be preserved

  @SPEC-HOOKS-001 @AC-1
  Scenario: 冪等安裝
    # [Source: SPEC-HOOKS-001:REQ-4:AC-1]
    Given hooks have already been installed once
    When hooks-installer.js runs again
    Then no duplicate hook configurations SHALL be created

  # --- REQ-5: Init 命令整合 ---

  @SPEC-HOOKS-001 @AC-1
  Scenario: uds init --with-hooks 安裝 hook 配置
    # [Source: SPEC-HOOKS-001:REQ-5:AC-1]
    Given a new project directory
    When I run "uds init --with-hooks -y"
    Then .claude/settings.json SHALL exist
    And it SHALL contain PreToolUse, PostToolUse, and UserPromptSubmit hooks

  @SPEC-HOOKS-001 @AC-1
  Scenario: uds init 預設不安裝 hook
    # [Source: SPEC-HOOKS-001:REQ-5:AC-1]
    Given a new project directory
    When I run "uds init -y" without --with-hooks
    Then .claude/settings.json SHALL NOT contain hook configurations

  # --- REQ-6: Hook 統計記錄 ---

  @SPEC-HOOKS-001 @AC-4
  Scenario: 記錄 hook 執行統計含 hook_type 欄位
    # [Source: SPEC-HOOKS-001:REQ-6:AC-4]
    Given hookStats is enabled in .uds/config.json
    When any hook script finishes execution
    Then appendHookStat() SHALL record a hook_type field
    And hook_type SHALL be one of: "commit-msg", "security", "logging"

  # --- REQ-7: 標準 YAML enforcement 區塊 ---

  @SPEC-HOOKS-001 @AC-5
  Scenario: commit-message.ai.yaml 包含 enforcement 區塊
    # [Source: SPEC-HOOKS-001:REQ-7]
    Given the commit-message.ai.yaml standard file
    When I read the enforcement section
    Then it SHALL contain hook_script, trigger, and severity fields

  @SPEC-HOOKS-001 @AC-5
  Scenario: security-standards.ai.yaml 包含 enforcement 區塊
    # [Source: SPEC-HOOKS-001:REQ-7]
    Given the security-standards.ai.yaml standard file
    When I read the enforcement section
    Then it SHALL contain hook_script, trigger, and severity fields

  @SPEC-HOOKS-001 @AC-5
  Scenario: logging.ai.yaml 包含 enforcement 區塊
    # [Source: SPEC-HOOKS-001:REQ-7]
    Given the logging.ai.yaml standard file
    When I read the enforcement section
    Then it SHALL contain hook_script, trigger, and severity fields
