import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { basename, resolve } from 'path';
import { calculateDesiredState } from '../../../src/reconciler/desired-state-calculator.js';

// XSPEC-483 R1: the desired state of a `format: both` manifest holds both copies of every standard and option.
// The registry is read straight from its JSON file, so the expected names do not come from the code under test.
const registry = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../standards-registry.json'), 'utf-8'));
const standards = registry.standards.filter((s) => s.category === 'reference' || s.category === 'skill');
const sourceOf = (source, format) => (typeof source === 'string' ? source : source?.[format] || source?.human || null);
const namesIn = (formats) => new Set(
  standards.flatMap((s) => formats.map((f) => sourceOf(s.source, f))).filter(Boolean).map((p) => `.standards/${basename(p)}`)
);

const manifestFor = (format) => ({
  version: '3.4.0',
  format,
  standards: standards.map((s) => s.id),
  options: { workflow: 'github-flow', output_language: 'english' },
  extensions: [],
  integrations: [],
  aiTools: [],
  skills: { installations: [] },
  commands: { installations: [] }
});

describe('calculateDesiredState with the manifest format', () => {
  it('expects the AI and the human copy of every standard for both', () => {
    const state = calculateDesiredState('/nowhere', manifestFor('both'));
    const wanted = namesIn(['ai', 'human']);
    expect([...state.standards.keys()].sort()).toEqual([...wanted].sort());
    expect([...state.standards.keys()].filter((p) => p.endsWith('.ai.yaml')).length).toBeGreaterThan(50);
    expect([...state.standards.keys()].filter((p) => p.endsWith('.md')).length).toBeGreaterThan(50);
  });

  it('tags each expected file with the format of its own copy, so a rewrite takes the right source', () => {
    const state = calculateDesiredState('/nowhere', manifestFor('both'));
    for (const [path, entry] of state.standards) {
      expect(entry.metadata.format, path).toBe(path.endsWith('.ai.yaml') ? 'ai' : 'human');
    }
  });

  it('expects both copies of each selected option for both', () => {
    const state = calculateDesiredState('/nowhere', manifestFor('both'));
    expect([...state.options.keys()].sort()).toEqual([
      '.standards/options/english.ai.yaml',
      '.standards/options/english.md',
      '.standards/options/github-flow.ai.yaml',
      '.standards/options/github-flow.md'
    ]);
  });

  it('still expects one copy per standard for ai and for human', () => {
    const ai = calculateDesiredState('/nowhere', manifestFor('ai'));
    expect([...ai.standards.keys()].sort()).toEqual([...namesIn(['ai'])].sort());
    expect([...ai.options.keys()].sort()).toEqual(['.standards/options/english.ai.yaml', '.standards/options/github-flow.ai.yaml']);

    const human = calculateDesiredState('/nowhere', manifestFor('human'));
    expect([...human.standards.keys()].sort()).toEqual([...namesIn(['human'])].sort());
    expect([...human.options.keys()].sort()).toEqual(['.standards/options/english.md', '.standards/options/github-flow.md']);
  });
});
