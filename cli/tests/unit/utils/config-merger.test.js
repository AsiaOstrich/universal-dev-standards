import { describe, it, expect } from 'vitest';
import { ConfigMerger } from '../../../src/utils/config-merger.js';

describe('ConfigMerger', () => {
  it('should perform simple flat merge', () => {
    const base = { a: 1, b: 2 };
    const override = { b: 3, c: 4 };
    const result = ConfigMerger.merge(base, override);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should perform deep merge of objects', () => {
    const base = {
      ui: { language: 'en', emoji: true },
      hitl: { threshold: 2 }
    };
    const override = {
      ui: { language: 'zh-TW' }
    };
    const result = ConfigMerger.merge(base, override);
    expect(result.ui.language).toBe('zh-TW');
    expect(result.ui.emoji).toBe(true);
    expect(result.hitl.threshold).toBe(2);
  });

  it('should replace arrays by default', () => {
    const base = { ignore: ['node_modules'] };
    const override = { ignore: ['dist'] };
    const result = ConfigMerger.merge(base, override);
    expect(result.ignore).toEqual(['dist']);
  });

  it('should append arrays when $append is used', () => {
    const base = { ignore: ['node_modules'] };
    const override = { 
      ignore: [{ $append: ['dist'] }] 
    };
    const result = ConfigMerger.merge(base, override);
    expect(result.ignore).toEqual(['node_modules', 'dist']);
  });

  it('should handle null or undefined gracefully', () => {
    expect(ConfigMerger.merge({ a: 1 }, null)).toEqual({ a: 1 });
    expect(ConfigMerger.merge(null, { b: 2 })).toEqual({ b: 2 });
  });
});
