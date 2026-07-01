#!/usr/bin/env tsx
/**
 * @fileoverview Local Graphify generator for the KnowledgeBase.
 * Generates a JSON graph and a markdown summary without changing src/.
 */

import * as fs from 'fs';
import * as path from 'path';

type GraphNode = {
  id: string;
  title: string;
  type: 'document' | 'manifest' | 'report';
  filePath: string;
};

type GraphEdge = {
  from: string;
  to: string;
  relation: string;
};

type GraphOutput = {
  generatedAt: string;
  sourceRoot: string;
  summary: {
    nodes: number;
    edges: number;
    documents: number;
    manifests: number;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
};

type ParsedFrontmatter = {
  [key: string]: string;
};

/**
 * Returns the KnowledgeBase root path.
 */
const getKnowledgeBaseRoot = (): string => path.join(process.cwd(), 'KnowledgeBase');

/**
 * Returns the Graphify root path.
 */
const getGraphifyRoot = (): string => path.join(getKnowledgeBaseRoot(), 'Graphify');

/**
 * Returns Graphify output path.
 */
const getGraphifyOutputRoot = (): string => path.join(getGraphifyRoot(), 'output');

/**
 * Returns whether a file should be ignored.
 */
const shouldIgnoreFile = (fileName: string): boolean =>
  fileName === 'local-graph.json' ||
  fileName === 'local-graph.md' ||
  fileName === 'local-graph-viewer.html' ||
  fileName === 'dashboard-regression-raw.json' ||
  fileName.startsWith('.');

/**
 * Returns whether a relative path should be skipped from source graph scanning.
 */
const shouldIgnoreRelativePath = (relativePath: string): boolean => {
  const normalized = relativePath.replaceAll('\\', '/');

  return (
    normalized.startsWith('Graphify/output/') ||
    normalized.startsWith('Graphify/viewer/') ||
    normalized.startsWith('Reports/')
  );
};

/**
 * Recursively walks a directory for KnowledgeBase files.
 */
const walkKnowledgeBase = (directoryPath: string): string[] => {
  const entries = fs.readdirSync(directoryPath).sort((left, right) => left.localeCompare(right));
  const discoveredFiles: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry);
    const relativePath = path.relative(getKnowledgeBaseRoot(), fullPath);

    if (shouldIgnoreRelativePath(relativePath) || shouldIgnoreFile(entry)) {
      continue;
    }

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      discoveredFiles.push(...walkKnowledgeBase(fullPath));
      continue;
    }

    if (stats.isFile()) {
      discoveredFiles.push(fullPath);
    }
  }

  return discoveredFiles;
};

/**
 * Reads all files in the KnowledgeBase tree.
 */
const readKnowledgeFiles = (): string[] => {
  return walkKnowledgeBase(getKnowledgeBaseRoot());
};

/**
 * Parses YAML-like frontmatter from a markdown file.
 */
const parseFrontmatter = (content: string): ParsedFrontmatter => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return {};
  }

  const lines = match[1].split('\n');
  const result: ParsedFrontmatter = {};

  for (const line of lines) {
    const trimmed = line.trim();
    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    result[key] = value;
  }

  return result;
};

/**
 * Derives a title from markdown content.
 */
const getMarkdownTitle = (content: string, fallbackFileName: string): string => {
  const frontmatter = parseFrontmatter(content);
  if (frontmatter.title) {
    return frontmatter.title;
  }

  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  return fallbackFileName.replace(/[-_.]/g, ' ');
};

/**
 * Parses the root knowledge manifest file.
 */
const parseManifest = (content: string): {
  title: string;
  id: string;
  files: string[];
} => {
  const lines = content.split('\n');
  const result = {
    title: 'Knowledge Manifest',
    id: 'kb.manifest',
    files: [] as string[],
  };

  let inFiles = false;
  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('name:')) {
      result.title = trimmed.slice('name:'.length).trim().replace(/^['"]|['"]$/g, '');
      result.id = `kb.${result.title.toLowerCase().replace(/[^a-z0-9]+/g, '.')}`;
      continue;
    }

    if (trimmed.startsWith('id:')) {
      result.id = trimmed.slice('id:'.length).trim().replace(/^['"]|['"]$/g, '');
      continue;
    }

    if (trimmed.startsWith('files:')) {
      inFiles = true;
      continue;
    }

    if (inFiles) {
      if (!trimmed.startsWith('- ')) {
        if (trimmed.length > 0 && !trimmed.startsWith('#')) {
          inFiles = false;
        }
        continue;
      }

      const value = trimmed.slice(2).trim().replace(/^['"]|['"]$/g, '');
      result.files.push(value);
    }
  }

  return result;
};

/**
 * Builds a graph from the current KnowledgeBase files.
 */
const buildGraph = (): GraphOutput => {
  const knowledgeBaseRoot = getKnowledgeBaseRoot();
  const files = readKnowledgeFiles();
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (fileName.endsWith('.md')) {
      const frontmatter = parseFrontmatter(content);
      const id = frontmatter.id || `kb.${fileName.replace(/\.md$/, '').replace(/[^a-z0-9]+/gi, '.')}`;
      const title = getMarkdownTitle(content, fileName);

      nodes.push({
        id,
        title,
        type: 'document',
        filePath: path.relative(process.cwd(), filePath),
      });

      if (frontmatter.manifestRef) {
        edges.push({
          from: id,
          to: frontmatter.manifestRef,
          relation: 'described-by',
        });
      }
      continue;
    }

    if (fileName.endsWith('.skill.yaml')) {
      const manifest = parseManifest(content);
      const manifestId = manifest.id;

      nodes.push({
        id: manifestId,
        title: manifest.title,
        type: 'manifest',
        filePath: path.relative(process.cwd(), filePath),
      });

      for (const linkedFile of manifest.files) {
        const normalized = path.normalize(path.join(knowledgeBaseRoot, linkedFile));
        if (fs.existsSync(normalized)) {
          edges.push({
            from: manifestId,
            to: path.relative(process.cwd(), normalized),
            relation: 'indexes',
          });
        }
      }
    }
  }

  const reportNode: GraphNode = {
    id: 'kb.local.graph.report',
    title: 'Local Graph Report',
    type: 'report',
    filePath: 'KnowledgeBase/Graphify/output/local-graph.md',
  };
  nodes.push(reportNode);

  return {
    generatedAt: new Date().toISOString(),
    sourceRoot: 'KnowledgeBase',
    summary: {
      nodes: nodes.length,
      edges: edges.length,
      documents: nodes.filter(node => node.type === 'document').length,
      manifests: nodes.filter(node => node.type === 'manifest').length,
    },
    nodes,
    edges,
  };
};

/**
 * Writes the graph output to disk.
 */
const writeGraph = (graph: GraphOutput): void => {
  const outputRoot = getGraphifyOutputRoot();
  const viewerRoot = path.join(getGraphifyRoot(), 'viewer');

  if (!fs.existsSync(outputRoot)) {
    fs.mkdirSync(outputRoot, { recursive: true });
  }

  if (!fs.existsSync(viewerRoot)) {
    fs.mkdirSync(viewerRoot, { recursive: true });
  }

  const jsonPath = path.join(outputRoot, 'local-graph.json');
  const mdPath = path.join(outputRoot, 'local-graph.md');
  const viewerJsonPath = path.join(viewerRoot, 'local-graph.json');
  const viewerDataJsPath = path.join(viewerRoot, 'local-graph-data.js');

  const graphJson = `${JSON.stringify(graph, null, 2)}\n`;
  fs.writeFileSync(jsonPath, graphJson, 'utf-8');
  fs.writeFileSync(viewerJsonPath, graphJson, 'utf-8');
  fs.writeFileSync(viewerDataJsPath, `window.__KB_GRAPH__ = ${graphJson};\n`, 'utf-8');

  const markdown = [
    '# Local Graph',
    '',
    `Generated at: ${graph.generatedAt}`,
    `Nodes: ${graph.summary.nodes}`,
    `Edges: ${graph.summary.edges}`,
    '',
    '## Nodes',
    '',
    '| ID | Type | Title | File |',
    '| --- | --- | --- | --- |',
    ...graph.nodes.map(node => `| ${node.id} | ${node.type} | ${node.title} | ${node.filePath} |`),
    '',
    '## Edges',
    '',
    '| From | Relation | To |',
    '| --- | --- | --- |',
    ...graph.edges.map(edge => `| ${edge.from} | ${edge.relation} | ${edge.to} |`),
    '',
  ].join('\n');

  fs.writeFileSync(mdPath, markdown, 'utf-8');
};

/**
 * Prints graph summary.
 */
const printStatus = (graph: GraphOutput): void => {
  console.log('\n📊 Local Graph Status');
  console.log('='.repeat(60));
  console.log(`Generated: ${graph.generatedAt}`);
  console.log(`Source root: ${graph.sourceRoot}`);
  console.log(`Nodes: ${graph.summary.nodes}`);
  console.log(`Edges: ${graph.summary.edges}`);
  console.log(`Documents: ${graph.summary.documents}`);
  console.log(`Manifests: ${graph.summary.manifests}`);
  console.log('='.repeat(60));
  console.log('Graph files:');
  console.log(' - KnowledgeBase/Graphify/output/local-graph.json');
  console.log(' - KnowledgeBase/Graphify/output/local-graph.md');
  console.log('='.repeat(60));
}

/**
 * Main execution.
 */
const main = (): void => {
  const command = process.argv[2] ?? 'sync';
  const graph = buildGraph();

  writeGraph(graph);

  if (command === 'status') {
    printStatus(graph);
    return;
  }

  if (command === 'sync') {
    printStatus(graph);
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
};

main();
