/**
 * Context Chunker Utility (RLM-inspired)
 *
 * Provides intelligent chunking of code and text content for large context handling.
 * Based on RLM (Recursive Language Model) principles for optimal AI processing.
 *
 * Key features:
 * - Semantic-aware chunking (preserves code structure)
 * - Configurable overlap for context continuity
 * - Metadata generation for chunk tracking
 *
 * @version 1.0.0
 */

/**
 * Default configuration for context chunking
 */
export const DEFAULT_CONFIG = {
  maxChunkSize: 50000,    // Maximum tokens per chunk
  overlap: 500,           // Token overlap between chunks
  mode: 'adaptive',       // full | chunked | adaptive
  analysisPattern: 'hierarchical'  // hierarchical | parallel | sequential
};

/**
 * Token estimation ratio (characters to tokens)
 * Average ratio for code is ~4 characters per token
 */
const CHARS_PER_TOKEN = 4;

/**
 * Estimate token count for a string
 * @param {string} text - Text to estimate
 * @returns {number} Estimated token count
 */
export function estimateTokens(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate character count from token count
 * @param {number} tokens - Token count
 * @returns {number} Estimated character count
 */
export function tokensToChars(tokens) {
  return tokens * CHARS_PER_TOKEN;
}

/**
 * Semantic boundary markers for different content types
 */
const BOUNDARY_PATTERNS = {
  // JavaScript/TypeScript
  js: [
    /^(?:export\s+)?(?:async\s+)?function\s+\w+/m,           // function declarations
    /^(?:export\s+)?class\s+\w+/m,                           // class declarations
    /^(?:export\s+)?const\s+\w+\s*=\s*(?:async\s+)?\(/m,    // arrow function exports
    /^(?:export\s+)?(?:default\s+)?{/m,                      // object exports
    /^\/\*\*[\s\S]*?\*\//m,                                  // JSDoc blocks
    /^\/\/\s*={3,}/m,                                        // section dividers
  ],
  // Python
  py: [
    /^(?:async\s+)?def\s+\w+/m,                              // function definitions
    /^class\s+\w+/m,                                         // class definitions
    /^@\w+/m,                                                // decorators
    /^#{3,}/m,                                               // section comments
    /^"""[\s\S]*?"""/m,                                      // docstrings
  ],
  // Go
  go: [
    /^func\s+(?:\([^)]+\)\s+)?\w+/m,                         // function definitions
    /^type\s+\w+\s+struct/m,                                 // struct definitions
    /^type\s+\w+\s+interface/m,                              // interface definitions
    /^\/\/\s*-{3,}/m,                                        // section dividers
  ],
  // Markdown
  md: [
    /^#{1,6}\s+/m,                                           // headings
    /^---+$/m,                                               // horizontal rules
    /^```/m,                                                 // code blocks
  ],
  // Generic fallback
  generic: [
    /^\s*$/m,                                                // empty lines
    /^[/#*-]{3,}/m,                                          // dividers
  ]
};

/**
 * Detect content type from file extension or content
 * @param {string} content - Content to analyze
 * @param {string} [filename] - Optional filename for extension-based detection
 * @returns {string} Content type key
 */
export function detectContentType(content, filename = '') {
  // Extension-based detection
  const ext = filename.split('.').pop()?.toLowerCase();
  const extMap = {
    'js': 'js', 'mjs': 'js', 'jsx': 'js', 'ts': 'js', 'tsx': 'js',
    'py': 'py', 'pyw': 'py',
    'go': 'go',
    'md': 'md', 'markdown': 'md'
  };

  if (ext && extMap[ext]) {
    return extMap[ext];
  }

  // Content-based detection
  if (content.includes('function ') || content.includes('const ') || content.includes('import ')) {
    return 'js';
  }
  if (content.includes('def ') || content.includes('import ') && content.includes(':')) {
    return 'py';
  }
  if (content.includes('func ') || content.includes('package ')) {
    return 'go';
  }
  if (content.match(/^#{1,6}\s+/m)) {
    return 'md';
  }

  return 'generic';
}

/**
 * Find semantic boundary positions in content
 * @param {string} content - Content to analyze
 * @param {string} contentType - Content type key
 * @returns {number[]} Array of character positions where boundaries occur
 */
export function findSemanticBoundaries(content, contentType = 'generic') {
  const patterns = BOUNDARY_PATTERNS[contentType] || BOUNDARY_PATTERNS.generic;
  const boundaries = new Set([0]); // Always include start

  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern.source, 'gm');
    while ((match = regex.exec(content)) !== null) {
      boundaries.add(match.index);
      // Prevent infinite loop on zero-length matches (e.g., /^\s*$/gm matching empty lines)
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }
  }

  // Sort and return as array
  return Array.from(boundaries).sort((a, b) => a - b);
}

/**
 * Find the best split point near target position
 * @param {string} content - Content to split
 * @param {number} targetPos - Target character position
 * @param {number[]} boundaries - Pre-computed boundary positions
 * @param {number} tolerance - How far to search from target (in characters)
 * @returns {number} Best split position
 */
function findBestSplitPoint(content, targetPos, boundaries, tolerance = 2000) {
  // Find boundaries within tolerance range
  const minPos = Math.max(0, targetPos - tolerance);
  const maxPos = Math.min(content.length, targetPos + tolerance);

  const candidateBoundaries = boundaries.filter(b => b >= minPos && b <= maxPos);

  if (candidateBoundaries.length === 0) {
    // No semantic boundaries found, fall back to line boundary
    const lineEnd = content.lastIndexOf('\n', targetPos);
    if (lineEnd > minPos) {
      return lineEnd + 1;
    }
    return targetPos;
  }

  // Find the boundary closest to target
  let bestBoundary = candidateBoundaries[0];
  let minDistance = Math.abs(bestBoundary - targetPos);

  for (const boundary of candidateBoundaries) {
    const distance = Math.abs(boundary - targetPos);
    if (distance < minDistance) {
      minDistance = distance;
      bestBoundary = boundary;
    }
  }

  return bestBoundary;
}

/**
 * Create metadata for a chunk
 * @param {string} chunk - Chunk content
 * @param {number} index - Chunk index
 * @param {number} startPos - Start position in original content
 * @param {number} endPos - End position in original content
 * @param {number} totalChunks - Total number of chunks
 * @param {string} contentType - Content type
 * @returns {Object} Chunk metadata
 */
function createChunkMetadata(chunk, index, startPos, endPos, totalChunks, contentType) {
  const lines = chunk.split('\n');
  const firstLine = lines[0]?.trim() || '';
  const lastLine = lines[lines.length - 1]?.trim() || '';

  return {
    index,
    totalChunks,
    startPosition: startPos,
    endPosition: endPos,
    tokenEstimate: estimateTokens(chunk),
    lineCount: lines.length,
    contentType,
    preview: {
      first: firstLine.substring(0, 100),
      last: lastLine.substring(0, 100)
    },
    // Detect if chunk starts/ends with incomplete structures
    continuity: {
      startsWithIncomplete: /^[^{[(]*[}\])]/.test(chunk),
      endsWithIncomplete: /[{[(][^}\])]*$/.test(chunk)
    }
  };
}

/**
 * Chunk content using adaptive strategy
 * @param {string} content - Content to chunk
 * @param {Object} [config] - Configuration options
 * @param {number} [config.maxChunkSize=50000] - Maximum tokens per chunk
 * @param {number} [config.overlap=500] - Token overlap between chunks
 * @param {string} [filename] - Optional filename for type detection
 * @returns {Object} Chunking result with chunks and metadata
 */
export function chunkContent(content, config = {}, filename = '') {
  const { maxChunkSize = DEFAULT_CONFIG.maxChunkSize, overlap = DEFAULT_CONFIG.overlap } = config;

  // Handle empty content
  if (!content || typeof content !== 'string') {
    return {
      chunks: [],
      metadata: {
        totalChunks: 0,
        totalTokens: 0,
        contentType: 'unknown',
        mode: 'empty'
      }
    };
  }

  const totalTokens = estimateTokens(content);
  const contentType = detectContentType(content, filename);

  // If content fits in one chunk, return as-is
  if (totalTokens <= maxChunkSize) {
    return {
      chunks: [{
        content,
        metadata: createChunkMetadata(content, 0, 0, content.length, 1, contentType)
      }],
      metadata: {
        totalChunks: 1,
        totalTokens,
        contentType,
        mode: 'full'
      }
    };
  }

  // Calculate chunking parameters
  const maxChunkChars = tokensToChars(maxChunkSize);
  const overlapChars = tokensToChars(overlap);
  const boundaries = findSemanticBoundaries(content, contentType);

  const chunks = [];
  let currentPos = 0;
  let chunkIndex = 0;

  while (currentPos < content.length) {
    // Calculate target end position
    const targetEnd = currentPos + maxChunkChars;

    // Find best split point
    let endPos;
    if (targetEnd >= content.length) {
      endPos = content.length;
    } else {
      endPos = findBestSplitPoint(content, targetEnd, boundaries);
    }

    // Extract chunk
    const chunk = content.substring(currentPos, endPos);
    const metadata = createChunkMetadata(chunk, chunkIndex, currentPos, endPos, -1, contentType); // -1 placeholder

    chunks.push({
      content: chunk,
      metadata
    });

    // Move position (with overlap)
    currentPos = Math.max(currentPos + 1, endPos - overlapChars);
    chunkIndex++;

    // Safety check to prevent infinite loops
    if (chunkIndex > 1000) {
      break;
    }
  }

  // Update total chunks count in metadata
  for (const chunk of chunks) {
    chunk.metadata.totalChunks = chunks.length;
  }

  return {
    chunks,
    metadata: {
      totalChunks: chunks.length,
      totalTokens,
      contentType,
      mode: 'chunked',
      config: { maxChunkSize, overlap }
    }
  };
}

/**
 * Chunk multiple files with dependency awareness
 * @param {Array<{path: string, content: string}>} files - Files to chunk
 * @param {Object} [config] - Configuration options
 * @returns {Object} Chunking result for all files
 */
export function chunkFiles(files, config = {}) {
  const results = {
    files: [],
    metadata: {
      totalFiles: files.length,
      totalChunks: 0,
      totalTokens: 0
    }
  };

  for (const file of files) {
    const result = chunkContent(file.content, config, file.path);
    results.files.push({
      path: file.path,
      ...result
    });
    results.metadata.totalChunks += result.metadata.totalChunks;
    results.metadata.totalTokens += result.metadata.totalTokens;
  }

  return results;
}

/**
 * Determine optimal chunking mode based on content
 * @param {string} content - Content to analyze
 * @param {Object} [config] - Configuration options
 * @returns {Object} Recommended configuration
 */
export function recommendChunkingMode(content, config = {}) {
  const totalTokens = estimateTokens(content);
  const { maxChunkSize = DEFAULT_CONFIG.maxChunkSize } = config;

  if (totalTokens <= maxChunkSize) {
    return {
      mode: 'full',
      reason: 'Content fits in single chunk',
      estimatedChunks: 1
    };
  }

  const contentType = detectContentType(content);
  const boundaries = findSemanticBoundaries(content, contentType);
  const boundaryDensity = boundaries.length / (content.length / 1000); // per 1000 chars

  if (boundaryDensity > 5) {
    return {
      mode: 'adaptive',
      analysisPattern: 'parallel',
      reason: 'High structure density allows parallel processing',
      estimatedChunks: Math.ceil(totalTokens / maxChunkSize)
    };
  }

  return {
    mode: 'chunked',
    analysisPattern: 'sequential',
    reason: 'Low structure density requires sequential processing',
    estimatedChunks: Math.ceil(totalTokens / maxChunkSize)
  };
}

/**
 * Merge chunk results back together
 * @param {Array<{content: string, metadata: Object}>} chunks - Chunks to merge
 * @param {Object} [options] - Merge options
 * @param {boolean} [options.removeDuplicates=true] - Remove overlapping content
 * @returns {string} Merged content
 */
export function mergeChunks(chunks, options = {}) {
  const { removeDuplicates = true } = options;

  if (!chunks || chunks.length === 0) {
    return '';
  }

  if (chunks.length === 1) {
    return chunks[0].content;
  }

  if (!removeDuplicates) {
    return chunks.map(c => c.content).join('\n');
  }

  // Smart merge: detect and remove overlapping content
  let result = chunks[0].content;

  for (let i = 1; i < chunks.length; i++) {
    const current = chunks[i].content;
    const overlap = findOverlap(result, current);

    if (overlap > 0) {
      result += current.substring(overlap);
    } else {
      result += '\n' + current;
    }
  }

  return result;
}

/**
 * Find overlapping content between two strings
 * @param {string} prev - Previous content
 * @param {string} next - Next content
 * @returns {number} Number of overlapping characters at the junction
 */
function findOverlap(prev, next) {
  const maxCheck = Math.min(prev.length, next.length, 5000); // Limit check size

  for (let len = maxCheck; len > 0; len--) {
    const tail = prev.substring(prev.length - len);
    if (next.startsWith(tail)) {
      return len;
    }
  }

  return 0;
}

export default {
  DEFAULT_CONFIG,
  estimateTokens,
  tokensToChars,
  detectContentType,
  findSemanticBoundaries,
  chunkContent,
  chunkFiles,
  recommendChunkingMode,
  mergeChunks
};
