import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @inquirer/prompts
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
}));

// Mock chalk to pass through
vi.mock('chalk', () => {
  const passthrough = (s) => s;
  passthrough.red = passthrough;
  passthrough.green = passthrough;
  passthrough.yellow = passthrough;
  passthrough.cyan = passthrough;
  passthrough.gray = passthrough;
  passthrough.bold = passthrough;
  return { default: passthrough };
});

import { select } from '@inquirer/prompts';
import { quickstartCommand, WORKFLOWS } from '../../src/commands/quickstart.js';

describe('quickstartCommand', () => {
  let consoleSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should export WORKFLOWS array with at least 3 entries', () => {
    // Assert
    expect(Array.isArray(WORKFLOWS)).toBe(true);
    expect(WORKFLOWS.length).toBeGreaterThanOrEqual(3);
    for (const w of WORKFLOWS) {
      expect(w).toHaveProperty('name');
      expect(w).toHaveProperty('description');
      expect(w).toHaveProperty('steps');
      expect(w.steps.length).toBeGreaterThan(0);
    }
  });

  it('should display interactive menu and show selected workflow steps', async () => {
    // Arrange — user selects first workflow
    select.mockResolvedValue(0);

    // Act
    await quickstartCommand();

    // Assert — select was called with choices
    expect(select).toHaveBeenCalledTimes(1);
    const selectArg = select.mock.calls[0][0];
    expect(selectArg.choices.length).toBeGreaterThanOrEqual(3);

    // Assert — workflow steps are printed
    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain(WORKFLOWS[0].name);
    // Should contain step commands
    for (const step of WORKFLOWS[0].steps) {
      expect(output).toContain(step.cmd);
    }
  });

  it('should display steps for each selectable workflow', async () => {
    // Test second workflow
    select.mockResolvedValue(1);

    await quickstartCommand();

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain(WORKFLOWS[1].name);
    for (const step of WORKFLOWS[1].steps) {
      expect(output).toContain(step.cmd);
    }
  });

  it('should show step numbers', async () => {
    // Arrange
    select.mockResolvedValue(0);

    // Act
    await quickstartCommand();

    // Assert — step numbers (1., 2., etc.) are present
    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('1.');
    expect(output).toContain('2.');
  });
});
