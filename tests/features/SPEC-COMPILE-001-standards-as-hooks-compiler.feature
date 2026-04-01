# [Source: docs/specs/SPEC-COMPILE-001-standards-as-hooks-compiler.md]
# [Generated] BDD scenarios for Standards-as-Hooks compiler

@SPEC-COMPILE-001
Feature: Standards-as-Hooks 編譯器 (uds compile)
  As a developer using UDS
  I want to compile enforcement standards into hook configurations automatically
  So that installing standards equals enabling enforcement with zero configuration

  # --- REQ-1: 編譯器基類 ---

  @SPEC-COMPILE-001 @AC-4
  Scenario: 編譯器介面定義
    # [Source: SPEC-COMPILE-001:REQ-1:AC-4]
    Given a set of standards with enforcement fields
    When calling compile(standards) on a compiler
    Then it SHALL return a hook configuration object for the target platform

  @SPEC-COMPILE-001 @AC-4
  Scenario: 可擴展性 — 新 target 只需繼承
    # [Source: SPEC-COMPILE-001:REQ-1:AC-4]
    Given the base-compiler interface
    When adding a new target compiler
    Then it only needs to extend base-compiler and implement compile()

  # --- REQ-2: Claude Code 編譯器 ---

  @SPEC-COMPILE-001 @AC-1
  Scenario: 編譯 3 個 enforcement 標準
    # [Source: SPEC-COMPILE-001:REQ-2:AC-1]
    Given commit-message, security-standards, and logging standards with enforcement
    When running claude-code-compiler
    Then output SHALL contain PreToolUse, PostToolUse, and UserPromptSubmit hooks

  @SPEC-COMPILE-001 @AC-1
  Scenario: trigger 對應到正確的 hook event
    # [Source: SPEC-COMPILE-001:REQ-2:AC-1]
    Given enforcement.trigger is "PreToolUse"
    When compiled to Claude Code format
    Then it SHALL appear in hooks.PreToolUse array

  @SPEC-COMPILE-001 @AC-2
  Scenario: 無 enforcement 標準被忽略
    # [Source: SPEC-COMPILE-001:REQ-2:AC-2]
    Given a standard without an enforcement field
    When running the compiler
    Then that standard SHALL NOT appear in the output

  # --- REQ-3: Compile 命令 ---

  @SPEC-COMPILE-001 @AC-1
  Scenario: uds compile --target=claude-code
    # [Source: SPEC-COMPILE-001:REQ-3:AC-1]
    Given a project with UDS standards installed
    When I run "uds compile --target=claude-code"
    Then .claude/settings.json SHALL contain correct hook configurations

  @SPEC-COMPILE-001 @AC-1
  Scenario: uds compile --dry-run
    # [Source: SPEC-COMPILE-001:REQ-3:AC-1]
    Given a project with UDS standards installed
    When I run "uds compile --target=claude-code --dry-run"
    Then it SHALL display the configuration without writing files

  @SPEC-COMPILE-001 @AC-1
  Scenario: 未初始化的專案報錯
    # [Source: SPEC-COMPILE-001:REQ-3]
    Given a project without UDS initialization
    When I run "uds compile"
    Then it SHALL show an error prompting to run "uds init"

  # --- REQ-4: 向下相容 ---

  @SPEC-COMPILE-001 @AC-2
  Scenario: 只有 enforcement 標準被編譯
    # [Source: SPEC-COMPILE-001:REQ-4:AC-2]
    Given 78 standards where only 3 have enforcement fields
    When running compile
    Then only 3 standards SHALL be compiled and the rest ignored
