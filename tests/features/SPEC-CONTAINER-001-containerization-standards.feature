# [Source: docs/specs/SPEC-CONTAINER-001-containerization-standards.md]
# [Generated] BDD scenarios for containerization standards content verification

@SPEC-CONTAINER-001
Feature: Containerization Standards
  As a developer
  I want a comprehensive containerization standard covering Dockerfile best practices, security, tagging, and registry management
  So that container images are consistent, secure, and traceable

  # --- REQ-1: Base Image Selection ---

  @SPEC-CONTAINER-001 @AC-1
  Scenario: Base image selection defines 4 principles
    # [Source: SPEC-CONTAINER-001:REQ-1:AC-1]
    Given the containerization-standards.md standard exists
    When I read the "Base Image Selection" section
    Then it SHALL define the principle of using official images
    And it SHALL define the principle of using slim/alpine variants
    And it SHALL define the principle of pinning exact versions
    And it SHALL define the principle of regular updates

  # --- REQ-1: Layer Optimization ---

  @SPEC-CONTAINER-001 @AC-2
  Scenario: Layer optimization defines at least 5 principles
    # [Source: SPEC-CONTAINER-001:REQ-1:AC-2]
    Given the containerization-standards.md standard exists
    When I read the "Layer Optimization" section
    Then it SHALL define the principle of ordering layers by change frequency
    And it SHALL define the principle of merging RUN instructions
    And it SHALL define the principle of cleaning temporary files
    And it SHALL define the principle of using .dockerignore
    And it SHALL define the principle of precise COPY instructions

  # --- REQ-2: Multi-stage Build ---

  @SPEC-CONTAINER-001 @AC-3
  Scenario: Multi-stage build defines builder and production stages
    # [Source: SPEC-CONTAINER-001:REQ-2:AC-3]
    Given the containerization-standards.md standard exists
    When I read the "Multi-stage Build" section
    Then it SHALL define the builder stage purpose and contents
    And it SHALL define the production stage purpose and contents
    And it SHALL describe dev vs production image separation strategy

  # --- REQ-3: Image Security ---

  @SPEC-CONTAINER-001 @AC-4
  Scenario: Security checklist has at least 6 items
    # [Source: SPEC-CONTAINER-001:REQ-3:AC-4]
    Given the containerization-standards.md standard exists
    When I read the "Security Checklist" section
    Then it SHALL require non-root execution
    And it SHALL require no known vulnerabilities
    And it SHALL require no hardcoded secrets
    And it SHALL require minimal privileges (ports)
    And it SHALL require read-only filesystem where possible
    And it SHALL require no unnecessary tools in production

  # --- REQ-3: Vulnerability Scanning ---

  @SPEC-CONTAINER-001 @AC-5
  Scenario: Vulnerability scanning defines 3-tier handling
    # [Source: SPEC-CONTAINER-001:REQ-3:AC-5]
    Given the containerization-standards.md standard exists
    When I read the "Vulnerability Scanning" section
    Then it SHALL define Critical vulnerability handling as pipeline block
    And it SHALL define High vulnerability handling as warning with ticket
    And it SHALL define Medium/Low vulnerability handling as logging

  # --- REQ-4: Image Tagging ---

  @SPEC-CONTAINER-001 @AC-6
  Scenario: Tagging strategy defines 4 tag types and prohibits latest in production
    # [Source: SPEC-CONTAINER-001:REQ-4:AC-6]
    Given the containerization-standards.md standard exists
    When I read the "Image Tagging Strategy" section
    Then it SHALL define semantic version tag type
    And it SHALL define commit SHA tag type
    And it SHALL define branch tag type
    And it SHALL define environment tag type
    And it SHALL prohibit using latest tag in production

  # --- REQ-5: Registry Management ---

  @SPEC-CONTAINER-001 @AC-7
  Scenario: Registry cleanup defines 5 retention rules
    # [Source: SPEC-CONTAINER-001:REQ-5:AC-7]
    Given the containerization-standards.md standard exists
    When I read the "Registry Management" section
    Then it SHALL define retention for semantic version tags
    And it SHALL define retention for environment tags
    And it SHALL define retention for branch tags
    And it SHALL define retention for commit SHA tags
    And it SHALL define retention for dangling (untagged) images

  # --- REQ-6: .dockerignore ---

  @SPEC-CONTAINER-001 @AC-8
  Scenario: .dockerignore template has at least 10 items
    # [Source: SPEC-CONTAINER-001:REQ-6:AC-8]
    Given the containerization-standards.md standard exists
    When I read the ".dockerignore" section
    Then it SHALL list at least 10 recommended ignore items
    And it SHALL include .git, node_modules, .env, and test directories
