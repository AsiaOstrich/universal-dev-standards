/**
 * AI Agent Sync Tests
 * AI Agent 同步測試
 *
 * Tests for the AI Agent integration registry and sync rules.
 * 測試 AI Agent 整合註冊表和同步規則。
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..', '..', '..');
const REGISTRY_PATH = join(ROOT_DIR, 'integrations', 'REGISTRY.json');

let registry;

beforeAll(() => {
  const content = readFileSync(REGISTRY_PATH, 'utf-8');
  registry = JSON.parse(content);
});

describe('AI Agent Registry', () => {
  describe('Structure Validation', () => {
    it('should have required top-level fields', () => {
      expect(registry).toHaveProperty('$schema');
      expect(registry).toHaveProperty('version');
      expect(registry).toHaveProperty('agents');
      expect(registry).toHaveProperty('tiers');
      expect(registry).toHaveProperty('syncRules');
    });

    it('should have version in semver format', () => {
      expect(registry.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have lastUpdated in ISO date format', () => {
      expect(registry.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Agents Configuration', () => {
    it('should define at least 5 AI agents', () => {
      const agentCount = Object.keys(registry.agents).length;
      expect(agentCount).toBeGreaterThanOrEqual(5);
    });

    it('each agent should have required properties', () => {
      for (const [agentId, agent] of Object.entries(registry.agents)) {
        expect(agent, `Agent ${agentId}`).toHaveProperty('name');
        expect(agent, `Agent ${agentId}`).toHaveProperty('tier');
        expect(agent, `Agent ${agentId}`).toHaveProperty('integrationFiles');
        expect(Array.isArray(agent.integrationFiles)).toBe(true);
      }
    });

    it('each agent should have a valid tier', () => {
      const validTiers = Object.keys(registry.tiers);
      for (const [agentId, agent] of Object.entries(registry.agents)) {
        expect(validTiers, `Agent ${agentId} tier "${agent.tier}"`).toContain(agent.tier);
      }
    });

    it('complete tier agents should have instruction files', () => {
      for (const [agentId, agent] of Object.entries(registry.agents)) {
        if (agent.tier === 'complete') {
          expect(agent.instructionFile, `Agent ${agentId}`).toBeTruthy();
        }
      }
    });
  });

  describe('Tiers Configuration', () => {
    it('should define standard tiers', () => {
      expect(registry.tiers).toHaveProperty('complete');
      expect(registry.tiers).toHaveProperty('partial');
      expect(registry.tiers).toHaveProperty('minimal');
    });

    it('each tier should have required properties', () => {
      for (const [tierId, tier] of Object.entries(registry.tiers)) {
        expect(tier, `Tier ${tierId}`).toHaveProperty('name');
        expect(tier, `Tier ${tierId}`).toHaveProperty('description');
        expect(tier, `Tier ${tierId}`).toHaveProperty('requiredRules');
        expect(Array.isArray(tier.requiredRules)).toBe(true);
      }
    });

    it('complete tier should require more rules than partial', () => {
      const completeRules = registry.tiers.complete.requiredRules.length;
      const partialRules = registry.tiers.partial.requiredRules.length;
      expect(completeRules).toBeGreaterThanOrEqual(partialRules);
    });

    it('partial tier should require more rules than minimal', () => {
      const partialRules = registry.tiers.partial.requiredRules.length;
      const minimalRules = registry.tiers.minimal.requiredRules.length;
      expect(partialRules).toBeGreaterThanOrEqual(minimalRules);
    });
  });

  describe('Sync Rules Configuration', () => {
    it('should define Anti-Hallucination rules', () => {
      expect(registry.syncRules).toHaveProperty('AH-001');
      expect(registry.syncRules).toHaveProperty('AH-002');
      expect(registry.syncRules).toHaveProperty('AH-003');
      expect(registry.syncRules).toHaveProperty('AH-004');
    });

    it('should define SDD rules', () => {
      expect(registry.syncRules).toHaveProperty('SDD-001');
      expect(registry.syncRules).toHaveProperty('SDD-002');
    });

    it('should define Commit Format rules', () => {
      expect(registry.syncRules).toHaveProperty('CMT-001');
    });

    it('each rule should have required properties', () => {
      for (const [ruleId, rule] of Object.entries(registry.syncRules)) {
        expect(rule, `Rule ${ruleId}`).toHaveProperty('id');
        expect(rule, `Rule ${ruleId}`).toHaveProperty('name');
        expect(rule, `Rule ${ruleId}`).toHaveProperty('description');
        expect(rule, `Rule ${ruleId}`).toHaveProperty('severity');
        expect(rule, `Rule ${ruleId}`).toHaveProperty('patterns');
        expect(Array.isArray(rule.patterns)).toBe(true);
        expect(rule.patterns.length).toBeGreaterThan(0);
      }
    });

    it('each rule should have valid severity', () => {
      const validSeverities = ['error', 'warning'];
      for (const [ruleId, rule] of Object.entries(registry.syncRules)) {
        expect(validSeverities, `Rule ${ruleId} severity`).toContain(rule.severity);
      }
    });

    it('error severity rules should be in AH-001, AH-002, SDD-001', () => {
      expect(registry.syncRules['AH-001'].severity).toBe('error');
      expect(registry.syncRules['AH-002'].severity).toBe('error');
      expect(registry.syncRules['SDD-001'].severity).toBe('error');
    });

    it('rule patterns should be valid regex', () => {
      for (const [ruleId, rule] of Object.entries(registry.syncRules)) {
        for (const pattern of rule.patterns) {
          expect(() => new RegExp(pattern, 'i'), `Rule ${ruleId} pattern "${pattern}"`).not.toThrow();
        }
      }
    });
  });

  describe('Tier-Rule Consistency', () => {
    it('all required rules in tiers should exist in syncRules', () => {
      for (const [tierId, tier] of Object.entries(registry.tiers)) {
        for (const ruleId of tier.requiredRules) {
          expect(registry.syncRules, `Rule ${ruleId} required by ${tierId}`).toHaveProperty(ruleId);
        }
      }
    });

    it('complete tier should require all critical rules', () => {
      const completeRules = registry.tiers.complete.requiredRules;
      expect(completeRules).toContain('AH-001');
      expect(completeRules).toContain('AH-002');
      expect(completeRules).toContain('SDD-001');
    });
  });
});

describe('Integration File Existence', () => {
  // Skip agents that are planned or tools
  const excludedTiers = ['planned', 'tool'];

  it('integration files should exist for active agents', () => {
    for (const [agentId, agent] of Object.entries(registry.agents)) {
      if (excludedTiers.includes(agent.tier)) {
        continue; // Skip planned/tool agents
      }

      if (agent.instructionFile) {
        const filePath = join(ROOT_DIR, agent.instructionFile);
        expect(existsSync(filePath), `File for ${agentId}: ${agent.instructionFile}`).toBe(true);
      }
    }
  });
});

describe('Rule Pattern Matching', () => {
  const testContent = {
    'AH-001': 'You must read files before analyzing them.',
    'AH-002': '[Source: Code] path/to/file:123',
    'AH-003': 'Use tags: [Confirmed], [Inferred], [Assumption], [Unknown]',
    'AH-004': 'You MUST explicitly state a "Recommended" choice',
    'SDD-001': 'Check for OpenSpec or Spec Kit integration',
    'SDD-002': 'You MUST prioritize using these commands',
    'CMT-001': 'Format: <type>(<scope>): <subject>'
  };

  it('AH-001 pattern should match evidence-based content', () => {
    const patterns = registry.syncRules['AH-001'].patterns;
    const content = testContent['AH-001'];
    const matched = patterns.some(p => new RegExp(p, 'i').test(content));
    expect(matched).toBe(true);
  });

  it('AH-002 pattern should match source attribution content', () => {
    const patterns = registry.syncRules['AH-002'].patterns;
    const content = testContent['AH-002'];
    const matched = patterns.some(p => new RegExp(p, 'i').test(content));
    expect(matched).toBe(true);
  });

  it('AH-003 pattern should match certainty classification content', () => {
    const patterns = registry.syncRules['AH-003'].patterns;
    const content = testContent['AH-003'];
    const matched = patterns.some(p => new RegExp(p, 'i').test(content));
    expect(matched).toBe(true);
  });

  it('AH-004 pattern should match recommendation content', () => {
    const patterns = registry.syncRules['AH-004'].patterns;
    const content = testContent['AH-004'];
    const matched = patterns.some(p => new RegExp(p, 'i').test(content));
    expect(matched).toBe(true);
  });

  it('SDD-001 pattern should match SDD tool content', () => {
    const patterns = registry.syncRules['SDD-001'].patterns;
    const content = testContent['SDD-001'];
    const matched = patterns.some(p => new RegExp(p, 'i').test(content));
    expect(matched).toBe(true);
  });

  it('SDD-002 pattern should match SDD priority content', () => {
    const patterns = registry.syncRules['SDD-002'].patterns;
    const content = testContent['SDD-002'];
    const matched = patterns.some(p => new RegExp(p, 'i').test(content));
    expect(matched).toBe(true);
  });

  it('CMT-001 pattern should match commit format content', () => {
    const patterns = registry.syncRules['CMT-001'].patterns;
    const content = testContent['CMT-001'];
    const matched = patterns.some(p => new RegExp(p, 'i').test(content));
    expect(matched).toBe(true);
  });
});
