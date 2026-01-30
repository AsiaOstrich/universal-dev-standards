import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ora from 'ora';
import { initCommand } from '../../src/commands/init.js';
import * as copier from '../../src/utils/copier.js';
import * as manifest from '../../src/core/manifest.js';
import * as prompts from '../../src/prompts/init.js';
import * as integrationPrompts from '../../src/prompts/integrations.js';
import * as messages from '../../src/i18n/messages.js';
import * as detector from '../../src/utils/detector.js';
import * as registry from '../../src/utils/registry.js';
import * as github from '../../src/utils/github.js';
import * as skillsInstaller from '../../src/utils/skills-installer.js';
import * as integrationGenerator from '../../src/utils/integration-generator.js';
import * as hasher from '../../src/utils/hasher.js';
import * as agentPaths from '../../src/config/ai-agent-paths.js';

// Mock everything!
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
vi.mock('../../src/utils/copier.js');
vi.mock('../../src/core/manifest.js');
vi.mock('../../src/prompts/init.js');
vi.mock('../../src/prompts/integrations.js');
vi.mock('../../src/i18n/messages.js');
vi.mock('../../src/utils/detector.js');
vi.mock('../../src/utils/registry.js');
vi.mock('../../src/utils/github.js');
vi.mock('../../src/utils/skills-installer.js');
vi.mock('../../src/utils/integration-generator.js');
vi.mock('../../src/utils/hasher.js');
vi.mock('../../src/config/ai-agent-paths.js');

describe('Init Command Interactive', () => {
  // Mock process.exit to avoid exiting the test process
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Ora
    vi.mocked(ora).mockReturnValue({
      start: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis(),
      warn: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis(),
    });

    // Mock Detector
    vi.mocked(detector.detectAll).mockReturnValue({
      languages: {}, frameworks: {}, aiTools: { claudeCode: true }
    });

    // Mock Messages with Proxy for robustness
    vi.mocked(messages.t).mockImplementation(() => {
      const handler = {
        get: (target, prop) => {
          if (typeof prop === 'string' && !(prop in target)) {
            return `[${prop}]`; // Return key name for missing keys
          }
          return target[prop];
        }
      };
      
      const initMessages = {
        title: 'Init', 
        detectingProject: 'Detecting...', 
        analysisComplete: 'Done', 
        initializedSuccess: 'Success', 
        filesCopied: 'Copied {count} files', 
        manifestCreated: 'Created', 
        nextSteps: 'Next', 
        reviewDirectory: 'Review', 
        addToVcs: 'Add', 
        runCheck: 'Check',
        // Critical ones used in replace()
        copiedStandards: 'Copied {count} standards',
        copiedExtensions: 'Copied {count} extensions',
        generatedIntegrations: 'Generated {count} integrations',
        installedSkills: 'Installed {count} skills to {locations}',
        installedSkillsWithErrors: 'Installed {count} skills with {errors} errors',
        installedCommands: 'Installed {count} commands',
        skillsInstalledTo: 'Skills installed to {locations}',
        skillsInstallTo: 'Install skills to {location}',
        skillsUsingExisting: 'Using existing skills in {location}',
        restartAgent: 'Restart {tools}',
        
        // Others
        configSummary: 'Summary',
        standardsScope: 'Scope',
        standardsScopeLean: 'Lean',
        standardsScopeComplete: 'Full',
        contentModeLabel: 'Content Mode',
        contentModeFull: 'Full',
        contentModeIndex: 'Index',
        contentModeMinimal: 'Minimal',
        languages: 'Languages',
        frameworks: 'Frameworks',
        integrations: 'Integrations',
        skillsLabel: 'Skills',
        skillsMarketplace: 'Marketplace',
        skillsUsingMarketplace: 'Using Marketplace',
        proceedInstall: 'Proceed?',
        installCancelled: 'Cancelled',
        copyingStandards: 'Copying standards...',
        copyingExtensions: 'Copying extensions...',
        generatingIntegrations: 'Generating integrations...',
        generatingClaudeMd: 'Generating CLAUDE.md...',
        generatedClaudeMd: 'Generated CLAUDE.md',
        couldNotGenerateClaudeMd: 'Failed CLAUDE.md',
        installingSkills: 'Installing skills...',
        errorsOccurred: '{count} errors occurred',
        gitWorkflow: 'Git Workflow',
        mergeStrategy: 'Merge Strategy',
        commitLanguage: 'Commit Language',
        testLevels: 'Test Levels',
        aiTools: 'AI Tools',
        skillsStatus: 'Skills Status',
        skillsMarketplaceInstalled: 'Marketplace Installed',
        projectLevel: 'Project Level',
        userLevel: 'User Level',
        noSkillsDetected: 'No Skills Detected'
      };
      
      return {
        commands: { 
          init: new Proxy(initMessages, handler), 
          common: { 
            version: 'Version', 
            level: 'Level', 
            format: 'Format', 
            aiTools: 'AI Tools', 
            none: 'None', 
            methodology: 'Methodology',
            total: 'Total'
          } 
        }
      };
    });
    vi.mocked(messages.detectLanguage).mockReturnValue('en');

    // Mock Registry
    vi.mocked(registry.getStandardsByLevel).mockReturnValue([]);
    vi.mocked(registry.getRepositoryInfo).mockReturnValue({
      standards: { version: '1.0.0' }, skills: { version: '1.0.0' }
    });
    
    // Mock Agent Paths
    vi.mocked(agentPaths.getAgentConfig).mockReturnValue({ supportsSkills: true, skills: true });
    vi.mocked(agentPaths.getAgentDisplayName).mockReturnValue('Claude Code');
    vi.mocked(agentPaths.getSkillsDirForAgent).mockReturnValue('/mock/skills');
    vi.mocked(agentPaths.getCommandsDirForAgent).mockReturnValue('/mock/commands');

    // Mock Prompts (The Decision Tree)
    vi.mocked(prompts.promptDisplayLanguage).mockResolvedValue('en');
    vi.mocked(prompts.promptAITools).mockResolvedValue(['claude-code']);
    vi.mocked(prompts.handleAgentsMdSharing).mockImplementation((tools) => tools);
    vi.mocked(prompts.promptSkillsInstallLocation).mockResolvedValue([
      { agent: 'claude-code', level: 'marketplace' }
    ]);
    vi.mocked(prompts.promptCommandsInstallation).mockResolvedValue([]);
    vi.mocked(prompts.promptStandardsScope).mockResolvedValue('minimal');
    vi.mocked(prompts.promptLevel).mockResolvedValue(1);
    vi.mocked(prompts.promptFormat).mockResolvedValue('ai');
    vi.mocked(prompts.promptStandardOptions).mockResolvedValue({});
    vi.mocked(prompts.promptLanguage).mockResolvedValue([]);
    vi.mocked(prompts.promptFramework).mockResolvedValue([]);
    vi.mocked(prompts.promptContentMode).mockResolvedValue('minimal');
    vi.mocked(prompts.promptConfirm).mockResolvedValue(true);
    
    // Mock Integration Prompts
    vi.mocked(integrationPrompts.promptIntegrationConfig).mockResolvedValue({});

    // Mock Skills Installer
    vi.mocked(skillsInstaller.installSkillsToMultipleAgents).mockResolvedValue({
      installations: [], totalErrors: 0, totalInstalled: 0, allFileHashes: {}
    });
    vi.mocked(skillsInstaller.installCommandsToMultipleAgents).mockResolvedValue({
      installations: [], totalErrors: 0, totalInstalled: 0, allFileHashes: {}
    });

    // Mock Integration Generator
    vi.mocked(integrationGenerator.writeIntegrationFile).mockReturnValue({ success: true, path: 'MOCK' });
    vi.mocked(integrationGenerator.integrationFileExists).mockReturnValue(false);

    // Mock Hasher
    vi.mocked(hasher.computeFileHash).mockReturnValue({ hash: 'abc', size: 123 });
  });

  afterEach(() => {
    mockExit.mockClear();
  });

  it('should write manifest with Level 1 config', async () => {
    // Act
    await initCommand({});

    // Assert
    expect(manifest.writeManifest).toHaveBeenCalled();
    const manifestCall = vi.mocked(manifest.writeManifest).mock.calls[0][0];
    expect(manifestCall.level).toBe(1);
    expect(manifestCall.aiTools).toEqual(['claude-code']);
  });
});
