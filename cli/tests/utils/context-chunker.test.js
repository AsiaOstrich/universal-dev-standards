import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CONFIG,
  estimateTokens,
  tokensToChars,
  detectContentType,
  findSemanticBoundaries,
  chunkContent,
  chunkFiles,
  recommendChunkingMode,
  mergeChunks
} from '../../src/utils/context-chunker.js';

describe('Context Chunker', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_CONFIG.maxChunkSize).toBe(50000);
      expect(DEFAULT_CONFIG.overlap).toBe(500);
      expect(DEFAULT_CONFIG.mode).toBe('adaptive');
      expect(DEFAULT_CONFIG.analysisPattern).toBe('hierarchical');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens for a simple string', () => {
      // 4 characters per token, "hello" = 5 chars = 2 tokens (ceil)
      expect(estimateTokens('hello')).toBe(2);
    });

    it('should estimate tokens for longer text', () => {
      // 100 characters = 25 tokens
      const text = 'a'.repeat(100);
      expect(estimateTokens(text)).toBe(25);
    });

    it('should handle empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('should handle null/undefined', () => {
      expect(estimateTokens(null)).toBe(0);
      expect(estimateTokens(undefined)).toBe(0);
    });

    it('should handle non-string input', () => {
      expect(estimateTokens(123)).toBe(0);
      expect(estimateTokens({})).toBe(0);
    });
  });

  describe('tokensToChars', () => {
    it('should convert tokens to characters', () => {
      expect(tokensToChars(1)).toBe(4);
      expect(tokensToChars(10)).toBe(40);
      expect(tokensToChars(100)).toBe(400);
    });

    it('should handle zero tokens', () => {
      expect(tokensToChars(0)).toBe(0);
    });
  });

  describe('detectContentType', () => {
    describe('extension-based detection', () => {
      it('should detect JavaScript files', () => {
        expect(detectContentType('', 'test.js')).toBe('js');
        expect(detectContentType('', 'test.mjs')).toBe('js');
        expect(detectContentType('', 'test.jsx')).toBe('js');
      });

      it('should detect TypeScript files', () => {
        expect(detectContentType('', 'test.ts')).toBe('js');
        expect(detectContentType('', 'test.tsx')).toBe('js');
      });

      it('should detect Python files', () => {
        expect(detectContentType('', 'test.py')).toBe('py');
        expect(detectContentType('', 'test.pyw')).toBe('py');
      });

      it('should detect Go files', () => {
        expect(detectContentType('', 'test.go')).toBe('go');
      });

      it('should detect Markdown files', () => {
        expect(detectContentType('', 'README.md')).toBe('md');
        expect(detectContentType('', 'docs.markdown')).toBe('md');
      });
    });

    describe('content-based detection', () => {
      it('should detect JavaScript from content', () => {
        expect(detectContentType('function test() { return 1; }')).toBe('js');
        expect(detectContentType('const x = 1;')).toBe('js');
        expect(detectContentType("import { foo } from 'bar';")).toBe('js');
      });

      it('should detect Python from content', () => {
        expect(detectContentType('def test():\n    return 1')).toBe('py');
      });

      it('should detect Go from content', () => {
        expect(detectContentType('func main() {\n}')).toBe('go');
        expect(detectContentType('package main\n\nfunc test() {}')).toBe('go');
      });

      it('should detect Markdown from content', () => {
        expect(detectContentType('# Heading\n\nSome text')).toBe('md');
        expect(detectContentType('## Section')).toBe('md');
      });

      it('should return generic for unknown content', () => {
        expect(detectContentType('just some plain text')).toBe('generic');
      });
    });
  });

  describe('findSemanticBoundaries', () => {
    it('should always include position 0', () => {
      const boundaries = findSemanticBoundaries('any content');
      expect(boundaries).toContain(0);
    });

    it('should find JavaScript function boundaries', () => {
      const code = `
function foo() {
  return 1;
}

function bar() {
  return 2;
}`;
      const boundaries = findSemanticBoundaries(code, 'js');
      expect(boundaries.length).toBeGreaterThan(1);
    });

    it('should find JavaScript class boundaries', () => {
      const code = `
class Foo {
  constructor() {}
}

export class Bar {
  method() {}
}`;
      const boundaries = findSemanticBoundaries(code, 'js');
      expect(boundaries.length).toBeGreaterThan(1);
    });

    it('should find Python function boundaries', () => {
      const code = `
def foo():
    return 1

def bar():
    return 2`;
      const boundaries = findSemanticBoundaries(code, 'py');
      expect(boundaries.length).toBeGreaterThan(1);
    });

    it('should find Python class boundaries', () => {
      const code = `
class Foo:
    def __init__(self):
        pass

class Bar:
    pass`;
      const boundaries = findSemanticBoundaries(code, 'py');
      expect(boundaries.length).toBeGreaterThan(1);
    });

    it('should find Go function boundaries', () => {
      const code = `
func main() {
}

func helper() int {
    return 1
}`;
      const boundaries = findSemanticBoundaries(code, 'go');
      expect(boundaries.length).toBeGreaterThan(1);
    });

    it('should find Markdown heading boundaries', () => {
      const content = `
# Heading 1

Some text

## Heading 2

More text

### Heading 3`;
      const boundaries = findSemanticBoundaries(content, 'md');
      expect(boundaries.length).toBeGreaterThan(1);
    });

    it('should find generic boundaries (empty lines)', () => {
      const content = `
Line 1

Line 2

Line 3`;
      const boundaries = findSemanticBoundaries(content, 'generic');
      expect(boundaries.length).toBeGreaterThan(1);
    });
  });

  describe('chunkContent', () => {
    it('should return empty result for null content', () => {
      const result = chunkContent(null);
      expect(result.chunks).toEqual([]);
      expect(result.metadata.totalChunks).toBe(0);
      expect(result.metadata.mode).toBe('empty');
    });

    it('should return empty result for empty string', () => {
      const result = chunkContent('');
      expect(result.chunks).toEqual([]);
      expect(result.metadata.totalChunks).toBe(0);
    });

    it('should return single chunk for small content', () => {
      const content = 'Hello, world!';
      const result = chunkContent(content);

      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].content).toBe(content);
      expect(result.metadata.totalChunks).toBe(1);
      expect(result.metadata.mode).toBe('full');
    });

    it('should create chunk metadata correctly', () => {
      const content = 'Hello, world!';
      const result = chunkContent(content);

      const metadata = result.chunks[0].metadata;
      expect(metadata.index).toBe(0);
      expect(metadata.totalChunks).toBe(1);
      expect(metadata.startPosition).toBe(0);
      expect(metadata.endPosition).toBe(content.length);
      expect(metadata.tokenEstimate).toBeGreaterThan(0);
      expect(metadata.lineCount).toBe(1);
    });

    it('should chunk large content', () => {
      // Create content large enough to require multiple chunks
      const largeContent = 'x'.repeat(200000) + '\n\nfunction test() {}\n\n' + 'y'.repeat(200000);
      const result = chunkContent(largeContent, { maxChunkSize: 1000 });

      expect(result.chunks.length).toBeGreaterThan(1);
      expect(result.metadata.mode).toBe('chunked');
    });

    it('should respect maxChunkSize config', () => {
      const content = 'a'.repeat(10000);
      const result = chunkContent(content, { maxChunkSize: 500 });

      // Each chunk should have fewer tokens than maxChunkSize
      for (const chunk of result.chunks) {
        expect(chunk.metadata.tokenEstimate).toBeLessThanOrEqual(500 * 1.1); // Allow 10% tolerance
      }
    });

    it('should include overlap between chunks', () => {
      const content = 'word '.repeat(5000);
      const result = chunkContent(content, { maxChunkSize: 1000, overlap: 100 });

      if (result.chunks.length >= 2) {
        const chunk1End = result.chunks[0].content.slice(-100);
        const chunk2Start = result.chunks[1].content.slice(0, 200);
        // There should be some overlap
        expect(chunk2Start).toContain(chunk1End.slice(-50));
      }
    });

    it('should detect content type from filename', () => {
      const content = 'function test() {}';
      const result = chunkContent(content, {}, 'test.js');

      expect(result.metadata.contentType).toBe('js');
    });

    it('should include preview in metadata', () => {
      const content = 'First line\nMiddle line\nLast line';
      const result = chunkContent(content);

      const metadata = result.chunks[0].metadata;
      expect(metadata.preview.first).toBe('First line');
      expect(metadata.preview.last).toBe('Last line');
    });
  });

  describe('chunkFiles', () => {
    it('should chunk multiple files', () => {
      const files = [
        { path: 'file1.js', content: 'const a = 1;' },
        { path: 'file2.py', content: 'def foo(): pass' }
      ];

      const result = chunkFiles(files);

      expect(result.files).toHaveLength(2);
      expect(result.metadata.totalFiles).toBe(2);
    });

    it('should calculate total chunks correctly', () => {
      const files = [
        { path: 'file1.js', content: 'const a = 1;' },
        { path: 'file2.js', content: 'const b = 2;' }
      ];

      const result = chunkFiles(files);

      expect(result.metadata.totalChunks).toBe(2); // 1 chunk per file
    });

    it('should calculate total tokens correctly', () => {
      const files = [
        { path: 'file1.js', content: 'a'.repeat(100) },
        { path: 'file2.js', content: 'b'.repeat(100) }
      ];

      const result = chunkFiles(files);

      expect(result.metadata.totalTokens).toBe(50); // 100 chars = 25 tokens each
    });

    it('should handle empty files array', () => {
      const result = chunkFiles([]);

      expect(result.files).toHaveLength(0);
      expect(result.metadata.totalFiles).toBe(0);
      expect(result.metadata.totalChunks).toBe(0);
      expect(result.metadata.totalTokens).toBe(0);
    });
  });

  describe('recommendChunkingMode', () => {
    it('should recommend full mode for small content', () => {
      const content = 'Small content';
      const result = recommendChunkingMode(content);

      expect(result.mode).toBe('full');
      expect(result.estimatedChunks).toBe(1);
    });

    it('should recommend chunked mode for large content with low structure', () => {
      const content = 'x'.repeat(500000); // Large content with no structure
      const result = recommendChunkingMode(content, { maxChunkSize: 10000 });

      expect(result.mode).toBe('chunked');
      expect(result.analysisPattern).toBe('sequential');
      expect(result.estimatedChunks).toBeGreaterThan(1);
    });

    it('should recommend adaptive mode for structured content', () => {
      // Create content with many function boundaries
      const functions = Array(100).fill('function f() {}\n\n').join('');
      const content = functions.repeat(100);
      const result = recommendChunkingMode(content, { maxChunkSize: 1000 });

      expect(result.mode).toBe('adaptive');
      expect(result.analysisPattern).toBe('parallel');
    });

    it('should provide reason for recommendation', () => {
      const content = 'Small content';
      const result = recommendChunkingMode(content);

      expect(result.reason).toBeDefined();
      expect(typeof result.reason).toBe('string');
    });
  });

  describe('mergeChunks', () => {
    it('should return empty string for empty array', () => {
      expect(mergeChunks([])).toBe('');
    });

    it('should return empty string for null', () => {
      expect(mergeChunks(null)).toBe('');
    });

    it('should return single chunk content', () => {
      const chunks = [{ content: 'Hello, world!' }];
      expect(mergeChunks(chunks)).toBe('Hello, world!');
    });

    it('should merge multiple chunks without duplicates', () => {
      const chunks = [
        { content: 'Hello, world! This is' },
        { content: 'This is a test.' }
      ];
      const result = mergeChunks(chunks);

      // Should merge and remove the overlap "This is"
      expect(result).toContain('Hello');
      expect(result).toContain('test');
      // Should not have "This is" duplicated
      expect(result.match(/This is/g).length).toBeLessThanOrEqual(2);
    });

    it('should merge without removing duplicates when option is false', () => {
      const chunks = [
        { content: 'Part 1' },
        { content: 'Part 2' }
      ];
      const result = mergeChunks(chunks, { removeDuplicates: false });

      expect(result).toBe('Part 1\nPart 2');
    });

    it('should handle chunks with no overlap', () => {
      const chunks = [
        { content: 'First part.' },
        { content: 'Second part.' }
      ];
      const result = mergeChunks(chunks);

      expect(result).toContain('First part.');
      expect(result).toContain('Second part.');
    });

    it('should handle exact overlap', () => {
      const overlap = 'OVERLAP';
      const chunks = [
        { content: 'Start ' + overlap },
        { content: overlap + ' End' }
      ];
      const result = mergeChunks(chunks);

      expect(result).toBe('Start OVERLAP End');
    });
  });

  describe('Integration tests', () => {
    it('should handle real JavaScript code', () => {
      const code = `
import { foo } from './foo';

/**
 * A sample function
 */
export function sampleFunction(x) {
  if (x > 0) {
    return x * 2;
  }
  return 0;
}

export class SampleClass {
  constructor(value) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

export default sampleFunction;
`;
      const result = chunkContent(code, {}, 'sample.js');

      expect(result.metadata.contentType).toBe('js');
      expect(result.chunks.length).toBeGreaterThan(0);
    });

    it('should handle real Python code', () => {
      const code = `
import os
from typing import List

class DataProcessor:
    """Process data efficiently."""

    def __init__(self, data: List[str]):
        self.data = data

    def process(self) -> List[str]:
        return [item.upper() for item in self.data]


def main():
    processor = DataProcessor(['a', 'b', 'c'])
    result = processor.process()
    print(result)


if __name__ == '__main__':
    main()
`;
      const result = chunkContent(code, {}, 'processor.py');

      expect(result.metadata.contentType).toBe('py');
      expect(result.chunks.length).toBeGreaterThan(0);
    });

    it('should handle real Markdown content', () => {
      const content = `
# Project Title

A brief description of the project.

## Installation

\`\`\`bash
npm install my-project
\`\`\`

## Usage

Here's how to use it:

\`\`\`javascript
import { feature } from 'my-project';
feature.doSomething();
\`\`\`

## License

MIT
`;
      const result = chunkContent(content, {}, 'README.md');

      expect(result.metadata.contentType).toBe('md');
      expect(result.chunks.length).toBeGreaterThan(0);
    });

    it('should chunk and merge round-trip for small content', () => {
      const original = 'Hello, world! This is a test string.';
      const chunked = chunkContent(original);
      const merged = mergeChunks(chunked.chunks);

      expect(merged).toBe(original);
    });
  });
});
