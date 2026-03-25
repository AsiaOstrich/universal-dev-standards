# Generated from: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md
# Generator: /derive-bdd
# Generated at: 2026-03-25T00:00:00Z

@SPEC-RELEASE-01 @manual-deployment
Feature: Manual Deployment Release Mode
  Projects without CI/CD pipelines can manage their version lifecycle
  through UDS using RC (Release Candidate) versioning with Build Manifest
  for full traceability from packaging to testing to production deployment.

  # ============================================================
  # AC-1: Release Mode Configuration
  # [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md:AC-1]
  # ============================================================

  @AC-1 @release-config @init
  Scenario: Interactive init displays release mode options
    Given the user runs "uds init" interactively
    When the workflow reaches the release mode selection step
    Then the system displays three options:
      | Option          | Description              |
      | ci-cd           | CI/CD 自動發布            |
      | manual          | 手動打包部署              |
      | hybrid          | 混合模式                 |
    And the user selects "manual"
    And ".standards/release-config.yaml" is generated with "mode: manual"

  @AC-1 @release-config @config
  Scenario: Switch release mode on existing project
    Given the project has been initialized with "mode: ci-cd"
    When the user runs "uds config release-mode"
    Then the system displays the current mode "ci-cd"
    And allows switching to "manual"
    And ".standards/release-config.yaml" is updated to "mode: manual"

  @AC-8 @release-config @non-interactive
  Scenario: Non-interactive init defaults to ci-cd mode
    Given the user runs "uds init --yes"
    When the workflow completes automatically
    Then ".standards/release-config.yaml" is generated with "mode: ci-cd"

  # ============================================================
  # AC-2: RC Version Lifecycle - Create
  # [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md:AC-2]
  # ============================================================

  @AC-2 @rc-lifecycle @start
  Scenario: Create RC version in manual mode
    Given ".standards/release-config.yaml" is set to "mode: manual"
    And the codebase is ready for release
    When the user runs "/release start 1.2.0-rc.1"
    Then version files are updated to "1.2.0-rc.1"
    And Git tag "v1.2.0-rc.1" is created
    And the system prompts the user to run the build/packaging command

  @AC-2 @rc-lifecycle @iterate
  Scenario: Iterate RC after test failure
    Given "v1.2.0-rc.1" was deployed to staging and failed testing
    And the bug has been fixed
    When the user runs "/release start 1.2.0-rc.2"
    Then version files are updated to "1.2.0-rc.2"
    And Git tag "v1.2.0-rc.2" is created

  # ============================================================
  # AC-3: RC Promotion to Stable
  # [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md:AC-3]
  # ============================================================

  @AC-3 @rc-lifecycle @promote
  Scenario: Promote RC to stable version
    Given "v1.2.0-rc.2" has passed testing on staging
    When the user runs "/release promote 1.2.0"
    Then version files are updated to "1.2.0" on the same commit as rc.2
    And Git tag "v1.2.0" is created
    And the system records "promoted_from: 1.2.0-rc.2"
    And the system prompts the user to rebuild or run the promote script

  # ============================================================
  # AC-4: Build Manifest
  # [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md:AC-4]
  # ============================================================

  @AC-4 @build-manifest @generate
  Scenario: Generate build manifest
    Given the package has been built
    When the user runs "uds release manifest"
    Then "build-manifest.json" is generated containing:
      | Field       | Description                |
      | version     | Current version string     |
      | commit      | Current Git commit hash    |
      | build_date  | ISO 8601 timestamp         |
      | builder     | Current Git user name      |
      | checksum    | SHA-256 of the artifact    |

  @AC-4 @build-manifest @verify
  Scenario: Verify manifest before production deployment
    Given a "build-manifest.json" exists with commit "a1b2c3d"
    And Git tag "v1.2.0" points to commit "a1b2c3d"
    When the user runs "uds release verify"
    Then the system confirms commit hash matches the Git tag
    And displays the staging test result for this version

  # ============================================================
  # AC-5: Deployment Tracking
  # [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md:AC-5]
  # ============================================================

  @AC-5 @deployment-tracking @staging
  Scenario: Record staging deployment
    Given "v1.2.0-rc.1" has been deployed to the staging server
    When the user runs "/release deploy staging"
    Then "deployments.yaml" records: version, environment, date, deployer

  @AC-5 @deployment-tracking @test-result
  Scenario: Record test result for staging deployment
    Given a staging deployment record exists for "v1.2.0-rc.1"
    When the user runs "/release deploy staging --result passed"
    Then the corresponding record in "deployments.yaml" is updated with result "passed"

  @AC-5 @deployment-tracking @production
  Scenario: Record production deployment
    Given "v1.2.0" has been deployed to the production server
    When the user runs "/release deploy production"
    Then "deployments.yaml" records the production deployment

  # ============================================================
  # AC-6: Production Deployment Warning
  # [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md:AC-6]
  # ============================================================

  @AC-6 @deployment-tracking @warning
  Scenario: Warn when deploying to production without staging pass
    Given "v1.2.0" has NOT been marked as "passed" on staging
    When the user runs "/release deploy production"
    Then the system displays a warning that staging verification is missing
    And still allows the deployment if the user confirms

  # ============================================================
  # AC-7: CI/CD Mode Backward Compatibility
  # [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md:AC-7]
  # ============================================================

  @AC-7 @backward-compatibility
  Scenario: CI/CD mode behavior is unchanged
    Given ".standards/release-config.yaml" is set to "mode: ci-cd"
    When the user runs "/release"
    Then the behavior is identical to the existing release workflow
    And no manual-mode prompts or options appear

  @AC-7 @backward-compatibility @no-config
  Scenario: Missing config defaults to CI/CD mode
    Given ".standards/release-config.yaml" does not exist
    When the user runs "/release"
    Then the system defaults to CI/CD mode behavior
    And the behavior is identical to the existing release workflow
