#!/usr/bin/env python3
"""
Split bilingual markdown files into separate English and Chinese versions.
將雙語 markdown 檔案分離為獨立的英文和中文版本。

Usage:
    python split-bilingual.py <input_file> <en_output> <zh_output>
"""

import re
import sys
from pathlib import Path
from datetime import datetime

def extract_english(content: str) -> str:
    """Extract English content from bilingual markdown."""
    lines = content.split('\n')
    result = []
    skip_next_chinese = False
    i = 0

    while i < len(lines):
        line = lines[i]

        # Skip pure Chinese lines (lines that are mostly Chinese characters)
        if is_chinese_line(line) and not is_mixed_important(line):
            i += 1
            continue

        # Handle bilingual headers like "## Purpose | 目的"
        if '|' in line and is_bilingual_header(line):
            # Keep only English part
            parts = line.split('|')
            result.append(parts[0].strip())
            i += 1
            continue

        # Handle inline Chinese in tables (keep structure, translate headers)
        if line.strip().startswith('|') and contains_chinese(line):
            # Process table row - keep if it has useful English content
            result.append(clean_table_row(line))
            i += 1
            continue

        # Skip lines that are Chinese translations of previous content
        if line.strip() and is_chinese_line(line):
            i += 1
            continue

        result.append(line)
        i += 1

    return '\n'.join(result)

def extract_chinese(content: str, source_path: str, version: str) -> str:
    """Extract Chinese content from bilingual markdown."""
    lines = content.split('\n')
    result = []

    # Add translation metadata header
    today = datetime.now().strftime('%Y-%m-%d')
    metadata = f"""---
source: {source_path}
source_version: {version}
translation_version: {version}
last_synced: {today}
status: current
---

"""
    result.append(metadata.strip())
    result.append('')

    i = 0
    while i < len(lines):
        line = lines[i]

        # Handle bilingual headers - keep Chinese part
        if '|' in line and is_bilingual_header(line):
            parts = line.split('|')
            if len(parts) >= 2:
                chinese_part = parts[1].strip()
                # Preserve heading level
                heading_match = re.match(r'^(#+)\s*', line)
                if heading_match:
                    result.append(f"{heading_match.group(1)} {chinese_part}")
                else:
                    result.append(chinese_part)
            i += 1
            continue

        # Skip pure English lines that have a Chinese equivalent following
        if is_english_line(line) and not is_code_or_example(line):
            # Check if next non-empty line is Chinese
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and is_chinese_line(lines[j]):
                # Skip English, will pick up Chinese
                i += 1
                continue

        # Keep Chinese content
        if is_chinese_line(line) or is_code_or_example(line) or is_structural(line):
            result.append(line)

        i += 1

    return '\n'.join(result)

def is_chinese_line(line: str) -> bool:
    """Check if line contains significant Chinese characters."""
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', line))
    total_chars = len(re.sub(r'\s', '', line))
    if total_chars == 0:
        return False
    return chinese_chars / total_chars > 0.3

def is_english_line(line: str) -> bool:
    """Check if line is primarily English."""
    if not line.strip():
        return False
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', line))
    return chinese_chars == 0 or chinese_chars < 3

def is_bilingual_header(line: str) -> bool:
    """Check if line is a bilingual header like '## Purpose | 目的'."""
    if '|' not in line:
        return False
    parts = line.split('|')
    if len(parts) != 2:
        return False
    return re.match(r'^#+\s*', line) and contains_chinese(parts[1])

def contains_chinese(text: str) -> bool:
    """Check if text contains any Chinese characters."""
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def is_code_or_example(line: str) -> bool:
    """Check if line is code or example content."""
    stripped = line.strip()
    return (stripped.startswith('```') or
            stripped.startswith('//') or
            stripped.startswith('#') and not stripped.startswith('##') or
            stripped.startswith('│') or
            stripped.startswith('├') or
            stripped.startswith('└') or
            stripped.startswith('┌') or
            stripped.startswith('─'))

def is_structural(line: str) -> bool:
    """Check if line is structural (empty, list marker, etc.)."""
    stripped = line.strip()
    return (not stripped or
            stripped.startswith('-') or
            stripped.startswith('*') or
            stripped.startswith('|') or
            stripped == '---')

def is_mixed_important(line: str) -> bool:
    """Check if line has mixed content that should be kept."""
    # Keep lines with important formatting
    return '✅' in line or '❌' in line or '⚠️' in line

def clean_table_row(line: str) -> str:
    """Clean table row, keeping English content."""
    return line

def get_version(content: str) -> str:
    """Extract version from content."""
    match = re.search(r'\*\*Version\*\*:\s*(\d+\.\d+\.\d+)', content)
    if match:
        return match.group(1)
    return "1.0.0"

def add_language_switcher_en(content: str, zh_path: str) -> str:
    """Add language switcher to English version."""
    lines = content.split('\n')
    # Find first heading and insert after
    for i, line in enumerate(lines):
        if line.startswith('#') and not line.startswith('##'):
            lines.insert(i + 1, '')
            lines.insert(i + 2, f'> **Language**: English | [繁體中文]({zh_path})')
            break
    return '\n'.join(lines)

def add_language_switcher_zh(content: str, en_path: str) -> str:
    """Add language switcher to Chinese version."""
    lines = content.split('\n')
    # Find end of metadata (---) and insert after first heading
    in_metadata = False
    for i, line in enumerate(lines):
        if line.strip() == '---':
            if in_metadata:
                in_metadata = False
                continue
            else:
                in_metadata = True
                continue
        if not in_metadata and line.startswith('#') and not line.startswith('##'):
            lines.insert(i + 1, '')
            lines.insert(i + 2, f'> **語言**: [English]({en_path}) | 繁體中文')
            break
    return '\n'.join(lines)

def main():
    if len(sys.argv) < 4:
        print("Usage: python split-bilingual.py <input_file> <en_output> <zh_output>")
        print("       python split-bilingual.py --test <input_file>")
        sys.exit(1)

    if sys.argv[1] == '--test':
        input_file = Path(sys.argv[2])
        content = input_file.read_text(encoding='utf-8')
        version = get_version(content)
        print(f"Version found: {version}")
        print(f"Total lines: {len(content.split(chr(10)))}")

        # Count Chinese vs English lines
        lines = content.split('\n')
        chinese_lines = sum(1 for l in lines if is_chinese_line(l))
        english_lines = sum(1 for l in lines if is_english_line(l) and l.strip())
        print(f"Chinese lines: {chinese_lines}")
        print(f"English lines: {english_lines}")
        return

    input_file = Path(sys.argv[1])
    en_output = Path(sys.argv[2])
    zh_output = Path(sys.argv[3])

    content = input_file.read_text(encoding='utf-8')
    version = get_version(content)

    # Calculate relative paths for language switcher
    en_to_zh = str(zh_output.relative_to(en_output.parent))
    zh_to_en = str(en_output.relative_to(zh_output.parent))

    # For files in different directories, use proper relative path
    # e.g., core/file.md -> locales/zh-TW/core/file.md

    en_content = extract_english(content)
    en_content = add_language_switcher_en(en_content, f"../../locales/zh-TW/{en_output.parent.name}/{en_output.name}")

    zh_content = extract_chinese(content, f"../../../{en_output.parent.name}/{en_output.name}", version)
    zh_content = add_language_switcher_zh(zh_content, f"../../../{en_output.parent.name}/{en_output.name}")

    # Ensure output directories exist
    en_output.parent.mkdir(parents=True, exist_ok=True)
    zh_output.parent.mkdir(parents=True, exist_ok=True)

    en_output.write_text(en_content, encoding='utf-8')
    zh_output.write_text(zh_content, encoding='utf-8')

    print(f"Created: {en_output} ({len(en_content)} chars)")
    print(f"Created: {zh_output} ({len(zh_content)} chars)")

if __name__ == '__main__':
    main()
