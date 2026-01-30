Feature: CLI Initialization Interaction
  As a developer
  I want to initialize UDS in my project
  So that I can adopt development standards interactively

  Background:
    Given I am in a clean project directory
    And UDS is not yet initialized

  # Category 1: Entry Points
  Scenario: Interactive Mode Default
    When I run "uds init"
    Then I should see the display language prompt first

  Scenario: Non-Interactive Mode
    When I run "uds init --yes"
    Then I should skip all prompts
    And I should see the success summary directly

  Scenario: Already Initialized
    Given a project with existing ".standards/manifest.json"
    When I run "uds init"
    Then I should see "Project already initialized" warning
    And the process should exit

  # Category 3: Display Language
  Scenario: Select English
    When I select "English" as display language
    Then subsequent prompts should be in English

  Scenario: Select Traditional Chinese
    When I select "繁體中文" as display language
    Then subsequent prompts should be in Traditional Chinese
    And the "zh-tw" locale extension should be installed

  # Category 4: AI Tools Selection
  Scenario: No Tools Selected
    When I uncheck all AI tools
    Then I should see "No AI tools selected" error
    And the process should exit

  Scenario: Select Claude Code Only
    When I select only "Claude Code"
    Then I should proceed to Skills installation prompt

  Scenario: Select Tools Without Skills Support
    When I select only "Cursor"
    Then I should skip Skills installation prompt
    And I should proceed to Standards Scope prompt

  # Category 5: Skills Installation
  Scenario: Install Skills to Project
    Given I selected "Claude Code"
    When I select "Project Level" for skills location
    Then skills should be configured for installation to ".claude/skills/"

  Scenario: Marketplace Only
    Given I selected "Claude Code"
    When I select "Marketplace" for skills location
    Then skills installation should be skipped
    And skills status should be set to "installed"

  # Category 7: Adoption Level
  Scenario: Level 1 Selection (Essential)
    When I select Level "1"
    Then I should skip "Git Workflow" prompt
    And I should skip "Test Levels" prompt
    And the adoption level should be set to 1

  Scenario: Level 2 Selection (Recommended)
    When I select Level "2"
    Then I should see "Git Workflow" prompt
    And I should see "Test Levels" prompt
    And the adoption level should be set to 2

  # Category 15: Cancellation
  Scenario: User Cancels at Confirmation
    Given I have answered all prompts
    When I answer "No" to "Proceed with installation?"
    Then I should see "Installation cancelled"
    And no files should be written

  # Category 20: End-to-End Flows
  Scenario: Happy Path Level 1
    When I select "English"
    And I select "Claude Code"
    And I select "Marketplace" skills
    And I select "Minimal" scope
    And I select Level "1"
    And I select "AI" format
    And I confirm installation
    Then a manifest should be created with level 1
    And only reference standards should be copied

  Scenario: Happy Path Level 3 Full
    When I select "English"
    And I select "Claude Code"
    And I select "Project" skills
    And I select "Full" scope
    And I select Level "3"
    And I select "Both" formats
    And I select "Unit Testing" and "Integration Testing"
    And I confirm installation
    Then a manifest should be created with level 3
    And all standards should be copied in both formats
