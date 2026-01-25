# Generated from: docs/specs/cli/publishing/npm-release.md
# Generator: /derive-bdd
# Generated at: 2026-01-25T00:00:00Z

@PUBLISH-00 @npm-release
Feature: npm Release Automation
  The release system automatically detects version type,
  assigns correct npm tags, runs pre-release checks,
  and handles rollback for failed releases.

  # [Source: docs/specs/cli/publishing/npm-release.md:AC-1]
  @AC-1 @version-detection
  Scenario Outline: Automatic version type detection
    Given a version string "<version>" from package.json
    When version type detection is performed
    Then it is detected as "<type>"
    And the npm tag is "<tag>"

    Examples:
      | version       | type   | tag     |
      | 3.2.1-beta.1  | beta   | @beta   |
      | 3.2.1-alpha.5 | alpha  | @alpha  |
      | 3.2.1-rc.2    | rc     | @rc     |
      | 3.2.1         | stable | @latest |
      | 3.2.0         | stable | @latest |

  # [Source: docs/specs/cli/publishing/npm-release.md:AC-2]
  @AC-2 @npm-tag-assignment
  Scenario Outline: Correct npm tag assignment on publish
    Given a detected version type "<type>"
    When npm publish is executed
    Then the command uses "--tag <tag>" flag
    And npm view dist-tags shows correct assignment

    Examples:
      | type   | tag    |
      | beta   | beta   |
      | alpha  | alpha  |
      | rc     | rc     |
      | stable | latest |

  # [Source: docs/specs/cli/publishing/npm-release.md:AC-3]
  @AC-3 @prerelease-checks
  Scenario: Pre-release checks all pass before publish
    Given a release is triggered
    When the publish workflow runs
    Then all 7 pre-release checks are executed
    And if any check fails then publish is aborted
    And failure reason is clearly reported
    And no partial publish state occurs

  @AC-3 @check-failure
  Scenario: Pre-release check failure aborts publish
    Given a release is triggered
    And one of the pre-release checks fails
    When the publish workflow runs
    Then the publish step is not executed
    And the failure is reported with details

  # [Source: docs/specs/cli/publishing/npm-release.md:AC-4]
  @AC-4 @rollback-dist-tag
  Scenario: Rollback via dist-tag reassignment
    Given a published release needs tag correction
    When npm dist-tag add is executed with correct tag
    Then the tag is successfully reassigned
    And npm view shows updated tags

  @AC-4 @rollback-deprecate
  Scenario: Rollback via deprecation
    Given a published release needs to be deprecated
    When npm deprecate is executed with a message
    Then the version is marked as deprecated
    And users see the deprecation message on install

  @AC-4 @rollback-unpublish
  Scenario: Rollback via unpublish within 72 hours
    Given a published release needs to be removed
    And it was published less than 72 hours ago
    When npm unpublish is executed
    Then the version is removed from registry
