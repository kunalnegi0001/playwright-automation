#!/usr/bin/env tsx
/**
 * @fileoverview Validates KnowledgeBase files and local graph readiness.
 */

import * as fs from 'fs';
import * as path from 'path';

type ValidationIssue = {
  file: string;
  message: string;
};

/**
 * Returns the KnowledgeBase root path.
 */
const getKnowledgeBaseRoot = (): string => path.join(process.cwd(), 'KnowledgeBase');

/**
 * Recursively walks KnowledgeBase for files.
 */
const readFiles = (): string[] => {
  const root = getKnowledgeBaseRoot();

  const walk = (directoryPath: string): string[] => {
    const entries = fs.readdirSync(directoryPath).sort((left, right) => left.localeCompare(right));
    const discoveredFiles: string[] = [];

    for (const entry of entries) {
      if (entry.startsWith('local-graph.')) {
        continue;
      }

      const fullPath = path.join(directoryPath, entry);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        discoveredFiles.push(...walk(fullPath));
        continue;
      }

      if (stats.isFile()) {
        discoveredFiles.push(fullPath);
      }
    }

    return discoveredFiles;
  };

  return walk(root);
};

/**
 * Extracts frontmatter from markdown.
 */
const getFrontmatterValue = (content: string, key: string): string | undefined => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return undefined;
  }

  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(`${key}:`)) {
      continue;
    }

    return trimmed.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '');
  }

  return undefined;
};

/**
 * Validates KnowledgeBase links.
 */
const validate = (): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const root = getKnowledgeBaseRoot();
  const files = readFiles();
  const manifestPath = path.join(root, 'knowledge-manifest.skill.yaml');

  if (!fs.existsSync(manifestPath)) {
    issues.push({
      file: 'KnowledgeBase',
      message: 'Missing knowledge-manifest.skill.yaml',
    });
  }

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    if (relativePath.startsWith(path.join('KnowledgeBase', 'Reports'))) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    if (fileName.endsWith('.md')) {
      if (fileName === 'README.md') {
        continue;
      }

      const manifestRef = getFrontmatterValue(content, 'manifestRef');
      if (!manifestRef) {
        issues.push({
          file: fileName,
          message: 'Missing manifestRef frontmatter',
        });
        continue;
      }

      const manifestRefPath = path.join(process.cwd(), manifestRef);
      if (!fs.existsSync(manifestRefPath)) {
        issues.push({
          file: fileName,
          message: `Referenced manifest does not exist: ${manifestRef}`,
        });
      }
    }
  }

  return issues;
};

/**
 * Main execution.
 */
const main = (): void => {
  const issues = validate();

  if (issues.length === 0) {
    console.log('✅ KnowledgeBase validation passed');
    process.exit(0);
  }

  console.error('❌ KnowledgeBase validation failed');
  for (const issue of issues) {
    console.error(`- ${issue.file}: ${issue.message}`);
  }
  process.exit(1);
};

main();
