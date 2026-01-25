# Generated from: docs/specs/cli/shared/error-handling.md
# Generator: /derive-bdd
# Generated at: 2026-01-25T00:00:00Z

@SHARED-09 @error-handling
Feature: Error Handling System
  The error handling system provides a hierarchy of error classes,
  error codes registry, and utility functions for consistent error
  creation, handling, and reporting across all CLI commands.

  # [Source: docs/specs/cli/shared/error-handling.md:AC-1]
  @AC-1 @error-classes
  Scenario Outline: Error classes correctly inherit and categorize
    Given the error class hierarchy is defined
    When a "<error_class>" instance is created
    Then name property equals "<name>"
    And category property equals "<category>"
    And it inherits from UDSError which inherits from Error

    Examples:
      | error_class      | name             | category   |
      | ManifestError    | ManifestError    | manifest   |
      | FileError        | FileError        | file       |
      | NetworkError     | NetworkError     | network    |
      | ValidationError  | ValidationError  | validation |
      | AIError          | AIError          | ai         |

  # [Source: docs/specs/cli/shared/error-handling.md:AC-2]
  @AC-2 @message-template
  Scenario: Error code message template parameter substitution
    Given error message templates with param placeholders
    When createError is called with "FILE_NOT_FOUND" and params path "/a.txt"
    Then the error message contains "/a.txt"

  @AC-2 @multiple-params
  Scenario: Multiple parameter substitution in error message
    Given error message templates with param placeholders
    When createError is called with "FILE_COPY_FAILED" and params source "a" and target "b"
    Then the error message contains both "a" and "b"

  @AC-2 @unknown-code
  Scenario: Unknown error codes return generic message
    Given no error message template exists for the code
    When createError is called with "UNKNOWN_CODE"
    Then the error message contains "Unknown error"

  # [Source: docs/specs/cli/shared/error-handling.md:AC-3]
  @AC-3 @async-handler
  Scenario: asyncErrorHandler returns result on success
    Given an async function that returns successfully
    When wrapped with asyncErrorHandler
    Then it returns the original result on success

  @AC-3 @async-handler-failure
  Scenario: asyncErrorHandler catches errors
    Given an async function that throws an error
    When wrapped with asyncErrorHandler
    Then it returns an object with success false on error

  @AC-3 @sync-handler
  Scenario: syncErrorHandler catches errors
    Given a sync function that throws an error
    When wrapped with syncErrorHandler
    Then it returns an object with success false on error

  @AC-3 @normalize-error
  Scenario: normalizeError converts regular Error to UDSError
    Given a regular JavaScript Error object
    When normalizeError is called
    Then it returns a UDSError with original message preserved

  # [Source: docs/specs/cli/shared/error-handling.md:AC-4]
  @AC-4 @result-pattern
  Scenario: Result pattern functions provide consistent structure
    Given the result pattern functions are available
    When success is called with data
    Then it returns object with success true and data property

  @AC-4 @success-no-data
  Scenario: Success without data omits data property
    Given the result pattern functions are available
    When success is called without data
    Then it returns object with success true and no data property

  @AC-4 @failure-result
  Scenario: Failure creates correct result structure
    Given the result pattern functions are available
    When failure is called with a message
    Then it returns object with success false and error message
    And details contains code OPERATION_FAILED by default

  @AC-4 @failure-custom-code
  Scenario: Failure with custom code
    Given the result pattern functions are available
    When failure is called with message and custom code
    Then details contains the provided custom code
