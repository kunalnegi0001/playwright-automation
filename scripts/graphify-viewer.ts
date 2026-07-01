#!/usr/bin/env tsx
/**
 * @fileoverview Local browser viewer for the KnowledgeBase graph.
 */

import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { URL } from 'url';

const port = Number(process.env.KB_GRAPH_PORT ?? 4177);
const graphifyRoot = path.join(process.cwd(), 'KnowledgeBase', 'Graphify');
const viewerPath = path.join(graphifyRoot, 'viewer', 'local-graph-viewer.html');
const graphPath = path.join(graphifyRoot, 'output', 'local-graph.json');
const viewerGraphJsonPath = path.join(graphifyRoot, 'viewer', 'local-graph.json');
const viewerGraphDataJsPath = path.join(graphifyRoot, 'viewer', 'local-graph-data.js');

/**
 * Reads a file with fallback.
 */
const readFileSafe = (filePath: string, fallback = ''): string => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return fallback;
  }
};

/**
 * Returns the browser viewer HTML.
 */
const getViewerHtml = (): string => {
  const html = readFileSafe(viewerPath);
  if (html) {
    return html;
  }

  return '<!doctype html><html><body><h1>KnowledgeBase graph viewer not found</h1></body></html>';
};

/**
 * Returns the graph JSON.
 */
const getGraphJson = (): string => readFileSafe(graphPath, '{"summary":{"nodes":0,"edges":0,"documents":0,"manifests":0},"nodes":[],"edges":[]}');

/**
 * Serves the local graph viewer.
 */
const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url ?? '/', `http://localhost:${port}`);

  if (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getViewerHtml());
    return;
  }

  if (requestUrl.pathname === '/graph.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(getGraphJson());
    return;
  }

  if (requestUrl.pathname === '/local-graph.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(readFileSafe(viewerGraphJsonPath, getGraphJson()));
    return;
  }

  if (requestUrl.pathname === '/local-graph-data.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    res.end(readFileSafe(viewerGraphDataJsPath, 'window.__KB_GRAPH__ = null;\n'));
    return;
  }

  if (requestUrl.pathname === '/local-graph.md') {
    const markdown = readFileSafe(path.join(graphifyRoot, 'output', 'local-graph.md'));
    res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
    res.end(markdown);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

/**
 * Logs a startup banner.
 */
const logStartup = (): void => {
  console.log('\n🗺️  KnowledgeBase Graph Viewer');
  console.log('='.repeat(60));
  console.log(`URL: http://localhost:${port}`);
  console.log('JSON: /graph.json');
  console.log('Markdown: /local-graph.md');
  console.log('='.repeat(60));
  console.log('Press Ctrl+C to stop the viewer.\n');
};

server.listen(port, () => {
  logStartup();
});

server.on('error', error => {
  if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
    console.error(`Use another port, e.g. KB_GRAPH_PORT=${port + 1} pnpm kb:graphify:view`);
    process.exit(1);
  }

  console.error('Failed to start graph viewer:', error);
  process.exit(1);
});
