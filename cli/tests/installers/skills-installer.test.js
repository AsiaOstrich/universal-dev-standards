import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ora from 'ora';
import { installSkills } from '../../src/installers/skills-installer.js';
import * as skillsInstallerUtils from '../../src/utils/skills-installer.js';
import * as github from '../../src/utils/github.js';

vi.mock('ora');
vi.mock('chalk', () => ({
  default: {
    bold: (s) => s,
    gray: (s) => s,
    green: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    red: (s) => s,
  }
}));
vi.mock('../../src/utils/skills-installer.js');
vi.mock('../../src/utils/github.js');
vi.mock('../../src/config/ai-agent-paths.js', () => ({
  getAgentDisplayName: vi.fn((agent) => agent),
  getSkillsDirForAgent: vi.fn(() => '/mock/dir'),
  getCommandsDirForAgent: vi.fn(() => '/mock/cmd/dir')
}));

describe('Skills Installer', () => {
  let mockSpinner;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSpinner = {
      start: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis(),
      warn: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis(),
    };
    vi.mocked(ora).mockReturnValue(mockSpinner);

    vi.mocked(skillsInstallerUtils.installSkillsToMultipleAgents).mockResolvedValue({
      installations: [], totalInstalled: 0, totalErrors: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should install skills when needsInstall is true', async () => {
    const config = {
      needsInstall: true,
      skillsInstallations: [{ agent: 'claude-code', level: 'project' }]
    };
    const messages = { installingSkills: 'Installing...', installedSkills: 'Done' };
    const results = { skills: [], errors: [], skillHashes: {} };

    await installSkills(config, '/project', messages, results);

    expect(skillsInstallerUtils.installSkillsToMultipleAgents).toHaveBeenCalled();
    expect(mockSpinner.succeed).toHaveBeenCalled();
  });

  it('should skip installation when needsInstall is false', async () => {
    const config = { needsInstall: false };
    const messages = {};
    const results = { skills: [] };

    await installSkills(config, '/project', messages, results);

    expect(skillsInstallerUtils.installSkillsToMultipleAgents).not.toHaveBeenCalled();
  });
});
