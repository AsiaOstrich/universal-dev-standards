# [Source: docs/specs/SPEC-TELEMETRY-001-hook-telemetry.md]
# [Generated] BDD scenarios for hook telemetry (UDS scope only)

@SPEC-TELEMETRY-001
Feature: 跨系統 Telemetry 統一 — Hook 執行遙測與採用率報告
  As a developer using UDS enforcement hooks
  I want hook execution telemetry recorded and analyzed
  So that I can measure standard adoption rates and hook performance

  # --- REQ-1: Telemetry Wrapper ---

  @SPEC-TELEMETRY-001 @AC-1
  Scenario: 記錄成功的 hook 執行
    # [Source: SPEC-TELEMETRY-001:REQ-1:AC-1]
    Given a hook script that exits with code 0
    When telemetry-wrapper completes recording
    Then telemetry.jsonl SHALL contain a record with result "pass"

  @SPEC-TELEMETRY-001 @AC-1
  Scenario: 記錄失敗的 hook 執行
    # [Source: SPEC-TELEMETRY-001:REQ-1:AC-1]
    Given a hook script that exits with code 1
    When telemetry-wrapper completes recording
    Then telemetry.jsonl SHALL contain a record with result "fail"

  @SPEC-TELEMETRY-001 @AC-1
  Scenario: 記錄執行耗時
    # [Source: SPEC-TELEMETRY-001:REQ-1:AC-1]
    Given a hook script that takes 120ms to execute
    When telemetry-wrapper records the result
    Then the record SHALL contain duration_ms close to 120

  @SPEC-TELEMETRY-001 @AC-1
  Scenario: 遙測記錄包含必要欄位
    # [Source: SPEC-TELEMETRY-001:REQ-1:AC-1]
    Given telemetry-wrapper records one execution
    When reading the record
    Then it SHALL contain timestamp, standard_id, hook_type, result, duration_ms

  # --- REQ-2: Report 命令 ---

  @SPEC-TELEMETRY-001 @AC-2
  Scenario: 產出採用率報告
    # [Source: SPEC-TELEMETRY-001:REQ-2:AC-2]
    Given telemetry.jsonl contains multiple records
    When I run "uds report"
    Then it SHALL show execution count, pass rate, and average duration per standard

  @SPEC-TELEMETRY-001 @AC-2
  Scenario: 無遙測數據
    # [Source: SPEC-TELEMETRY-001:REQ-2:AC-2]
    Given telemetry.jsonl does not exist
    When I run "uds report"
    Then it SHALL show a message indicating no telemetry data

  # --- REQ-3: Rotation ---

  @SPEC-TELEMETRY-001 @AC-5
  Scenario: 檔案超過大小限制時自動截斷
    # [Source: SPEC-TELEMETRY-001:REQ-3:AC-5]
    Given telemetry.jsonl exceeds 2MB
    When a new record is appended
    Then the file SHALL be truncated to keep the newer half
