// [XSPEC adopter-report Q5] TDD tests for the shared marker-location logic.
// These were written and run RED (failing to import a not-yet-existing
// module) before marker-locator.js was created.
import { describe, it, expect } from 'vitest';
import { locateMarkerBlock, tryLocateMarkerBlock, AmbiguousMarkerError, UnclosedMarkerError } from '../../../src/utils/marker-locator.js';

const MD_MARKERS = {
  start: '<!-- UDS:STANDARDS:START -->',
  end: '<!-- UDS:STANDARDS:END -->'
};

describe('locateMarkerBlock', () => {
  it('finds a normal single marker pair', () => {
    const content = 'before\n<!-- UDS:STANDARDS:START -->\nBODY\n<!-- UDS:STANDARDS:END -->\nafter';
    const block = locateMarkerBlock(content, MD_MARKERS);
    expect(block).not.toBeNull();
    expect(content.substring(block.startIdx + MD_MARKERS.start.length, block.endIdx).trim()).toBe('BODY');
    expect(block.startLine).toBe(2);
    expect(block.endLine).toBe(4);
  });

  it('returns null when there are no markers at all', () => {
    expect(locateMarkerBlock('nothing here', MD_MARKERS)).toBeNull();
  });

  // Issue #297: half a marker pair is a damaged block, not a missing one.
  it('throws UnclosedMarkerError (an AmbiguousMarkerError) for START with no END, naming the line', () => {
    const content = 'a\nb\n<!-- UDS:STANDARDS:START -->\nBODY';
    expect(() => locateMarkerBlock(content, MD_MARKERS)).toThrow(UnclosedMarkerError);
    expect(() => locateMarkerBlock(content, MD_MARKERS)).toThrow(AmbiguousMarkerError);
    expect(() => locateMarkerBlock(content, MD_MARKERS)).toThrow(/on line 3 has no matching/);
  });

  it('throws UnclosedMarkerError for END with no START', () => {
    const content = 'BODY\n<!-- UDS:STANDARDS:END -->';
    expect(() => locateMarkerBlock(content, MD_MARKERS)).toThrow(/on line 2 has no matching .* before it/);
  });

  it('throws UnclosedMarkerError when END comes before START', () => {
    const content = '<!-- UDS:STANDARDS:END -->\nBODY\n<!-- UDS:STANDARDS:START -->';
    expect(() => locateMarkerBlock(content, MD_MARKERS)).toThrow(/on line 1 comes before/);
  });

  it('tryLocateMarkerBlock reports an unclosed block through the return value', () => {
    const result = tryLocateMarkerBlock('<!-- UDS:STANDARDS:START -->\nBODY', MD_MARKERS);
    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(UnclosedMarkerError);
  });

  it('ignores the marker text when it appears mid-line as prose (Q5 core bug)', () => {
    // This is exactly UDS's own CLAUDE.md: a sentence that explains the
    // marker syntax by quoting it verbatim, followed later by the real block.
    const content = [
      '那段文字提到 `<!-- UDS:STANDARDS:START -->` 這個標記的用途。',
      'some user content that must survive',
      '<!-- UDS:STANDARDS:START -->',
      'REAL BODY',
      '<!-- UDS:STANDARDS:END -->'
    ].join('\n');
    const block = locateMarkerBlock(content, MD_MARKERS);
    expect(block).not.toBeNull();
    expect(content.substring(0, block.startIdx)).toContain('some user content that must survive');
    expect(content.substring(block.startIdx + MD_MARKERS.start.length, block.endIdx).trim()).toBe('REAL BODY');
  });

  it('ignores marker text inside a fenced code block', () => {
    const content = [
      '```',
      '<!-- UDS:STANDARDS:START -->',
      '<!-- UDS:STANDARDS:END -->',
      '```',
      'user content here',
      '<!-- UDS:STANDARDS:START -->',
      'REAL BODY',
      '<!-- UDS:STANDARDS:END -->'
    ].join('\n');
    const block = locateMarkerBlock(content, MD_MARKERS);
    expect(block).not.toBeNull();
    expect(content.substring(0, block.startIdx)).toContain('user content here');
    expect(content.substring(block.startIdx + MD_MARKERS.start.length, block.endIdx).trim()).toBe('REAL BODY');
  });

  it('throws AmbiguousMarkerError with line numbers when two real START markers exist', () => {
    const content = [
      '<!-- UDS:STANDARDS:START -->',
      'first',
      '<!-- UDS:STANDARDS:END -->',
      'gap',
      '<!-- UDS:STANDARDS:START -->',
      'second',
      '<!-- UDS:STANDARDS:END -->'
    ].join('\n');
    let caught;
    try {
      locateMarkerBlock(content, MD_MARKERS);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AmbiguousMarkerError);
    expect(caught.lines).toEqual([1, 5]);
  });

  it('throws AmbiguousMarkerError with line numbers when two real END markers exist', () => {
    const content = [
      '<!-- UDS:STANDARDS:START -->',
      'body',
      '<!-- UDS:STANDARDS:END -->',
      'gap',
      '<!-- UDS:STANDARDS:END -->'
    ].join('\n');
    let caught;
    try {
      locateMarkerBlock(content, MD_MARKERS);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AmbiguousMarkerError);
    expect(caught.lines).toEqual([3, 5]);
  });

  it('treats a marker with leading/trailing whitespace on its own line as valid', () => {
    const content = '  <!-- UDS:STANDARDS:START -->  \nBODY\n<!-- UDS:STANDARDS:END -->';
    const block = locateMarkerBlock(content, MD_MARKERS);
    expect(block).not.toBeNull();
  });
});

describe('tryLocateMarkerBlock', () => {
  it('returns {ok:true, block} for a normal file', () => {
    const content = '<!-- UDS:STANDARDS:START -->\nBODY\n<!-- UDS:STANDARDS:END -->';
    const result = tryLocateMarkerBlock(content, MD_MARKERS);
    expect(result.ok).toBe(true);
    expect(result.block).not.toBeNull();
  });

  it('returns {ok:false, error} instead of throwing when ambiguous', () => {
    const content = [
      '<!-- UDS:STANDARDS:START -->', 'a', '<!-- UDS:STANDARDS:END -->',
      '<!-- UDS:STANDARDS:START -->', 'b', '<!-- UDS:STANDARDS:END -->'
    ].join('\n');
    const result = tryLocateMarkerBlock(content, MD_MARKERS);
    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(AmbiguousMarkerError);
  });
});
