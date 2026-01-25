# Generated from: docs/specs/cli/shared/i18n-system.md
# Generator: /derive-bdd
# Generated at: 2026-01-25T00:00:00Z

@SHARED-08 @i18n
Feature: i18n Message System
  The i18n system provides multi-language support for all CLI messages,
  enabling seamless language switching between English, Traditional Chinese,
  and Simplified Chinese.

  # [Source: docs/specs/cli/shared/i18n-system.md:AC-1]
  @AC-1 @language-switch
  Scenario: Language setting switches all messages
    Given the i18n system is initialized with default language English
    When setLanguage is called with "zh-tw"
    Then getLanguage returns "zh-tw"
    And t function returns Traditional Chinese messages object
    And all subsequent msg calls return Traditional Chinese strings

  # [Source: docs/specs/cli/shared/i18n-system.md:AC-2]
  @AC-2 @nested-path
  Scenario: msg function correctly handles nested path lookup
    Given messages are structured with nested objects
    When msg is called with "commands.init.title"
    Then the function traverses messages[lang].commands.init.title
    And returns the correct localized string
    And returns undefined for non-existent paths

  # [Source: docs/specs/cli/shared/i18n-system.md:AC-3]
  @AC-3 @fallback
  Scenario: Missing key returns fallback gracefully
    Given a message key exists in English but not in the current language
    When t function is called with a non-existent language code
    Then the system falls back to English messages object
    And no errors are thrown
    And partial paths return undefined without crashing

  # [Source: docs/specs/cli/shared/i18n-system.md:AC-4]
  @AC-4 @language-detection
  Scenario Outline: detectLanguage handles locale formats correctly
    Given various locale format inputs
    When detectLanguage is called with "<locale>"
    Then it returns "<expected>"

    Examples:
      | locale | expected |
      | zh-tw  | zh-tw    |
      | zh-cn  | zh-cn    |
      | null   | en       |

  @AC-4 @environment-detection
  Scenario: detectLanguage checks environment variables
    Given no explicit locale is provided
    And environment variable LANG is set to "zh_TW.UTF-8"
    When detectLanguage is called with null
    Then it returns "zh-tw"
