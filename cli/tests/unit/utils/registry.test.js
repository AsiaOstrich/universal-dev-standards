import { describe, it, expect } from 'vitest';
import {
  loadRegistry,
  getAllStandards,
  getStandardsByLevel,
  getStandardsByCategory,
  getLevelInfo,
  getCategoryInfo,
  getRepositoryInfo,
  getSkillStandards,
  getReferenceStandards,
  getSkillFiles,
  getAllSkillNames
} from '../../../src/utils/registry.js';

describe('Registry Utils', () => {
  describe('loadRegistry', () => {
    it('should load the registry successfully', () => {
      const registry = loadRegistry();
      expect(registry).toBeDefined();
      expect(registry.standards).toBeInstanceOf(Array);
      expect(registry.categories).toBeDefined();
    });

    it('should cache the registry on subsequent calls', () => {
      const registry1 = loadRegistry();
      const registry2 = loadRegistry();
      expect(registry1).toBe(registry2);
    });
  });

  describe('getAllStandards', () => {
    it('should return all standards', () => {
      const standards = getAllStandards();
      expect(standards.length).toBeGreaterThan(0);
      expect(standards[0]).toHaveProperty('id');
      expect(standards[0]).toHaveProperty('name');
      expect(standards[0]).toHaveProperty('source');
      expect(standards[0]).toHaveProperty('category');
    });
  });

  describe('getStandardsByLevel (deprecated)', () => {
    it('should return all standards regardless of level parameter', () => {
      const all = getAllStandards();
      const level1 = getStandardsByLevel(1);
      const level2 = getStandardsByLevel(2);
      const level3 = getStandardsByLevel(3);
      expect(level1.length).toBe(all.length);
      expect(level2.length).toBe(all.length);
      expect(level3.length).toBe(all.length);
    });

    it('should be an alias for getAllStandards', () => {
      const all = getAllStandards();
      const byLevel = getStandardsByLevel(1);
      expect(byLevel).toEqual(all);
    });
  });

  describe('getStandardsByCategory', () => {
    it('should return only skill standards', () => {
      const skills = getStandardsByCategory('skill');
      expect(skills.every(s => s.category === 'skill')).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
    });

    it('should return only reference standards', () => {
      const refs = getStandardsByCategory('reference');
      expect(refs.every(s => s.category === 'reference')).toBe(true);
    });

    it('should return empty array for unknown category', () => {
      const unknown = getStandardsByCategory('nonexistent');
      expect(unknown).toEqual([]);
    });
  });

  describe('getLevelInfo (deprecated)', () => {
    it('should return stub info regardless of level parameter', () => {
      const info1 = getLevelInfo(1);
      const info2 = getLevelInfo(2);
      const info3 = getLevelInfo(3);
      const expected = { name: 'All Standards', nameZh: '全部標準', nameZhCn: '全部标准', description: 'All available standards' };
      expect(info1).toEqual(expected);
      expect(info2).toEqual(expected);
      expect(info3).toEqual(expected);
    });
  });

  describe('getCategoryInfo', () => {
    it('should return skill category info', () => {
      const info = getCategoryInfo('skill');
      expect(info.name).toBe('Skill');
      expect(info.description).toBeDefined();
    });

    it('should return undefined for unknown category', () => {
      const info = getCategoryInfo('nonexistent');
      expect(info).toBeUndefined();
    });
  });

  describe('getRepositoryInfo', () => {
    it('should return repository information', () => {
      const info = getRepositoryInfo();
      expect(info.standards).toBeDefined();
      expect(info.standards.version).toBeDefined();
      expect(info.skills).toBeDefined();
    });
  });

  describe('getSkillStandards', () => {
    it('should return only standards with skillName', () => {
      const skills = getSkillStandards();
      expect(skills.every(s => s.skillName)).toBe(true);
    });
  });

  describe('getReferenceStandards', () => {
    it('should return reference standards without skills', () => {
      const refs = getReferenceStandards();
      expect(refs.every(s => !s.skillName && s.category === 'reference')).toBe(true);
    });
  });

  describe('getSkillFiles', () => {
    it('should return skill files mapping', () => {
      const files = getSkillFiles();
      expect(files).toBeInstanceOf(Object);
      expect(files['ai-collaboration-standards']).toBeDefined();
    });
  });

  describe('getAllSkillNames', () => {
    it('should return array of skill names', () => {
      const names = getAllSkillNames();
      expect(names).toBeInstanceOf(Array);
      expect(names).toContain('ai-collaboration-standards');
      expect(names).toContain('commit-standards');
    });
  });
});
