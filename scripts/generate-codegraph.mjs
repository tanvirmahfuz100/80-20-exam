/**
 * generate-codegraph.mjs
 *
 * Analyzes the 80-20-exam codebase to produce a dependency graph of src/.
 * Outputs:
 *   1. codegraph.json — machine-readable graph (imports, exports, adjacency)
 *   2. Updates CODEBASE.md sections with fresh module data
 *
 * Usage:
 *   node scripts/generate-codegraph.mjs
 *   node scripts/generate-codegraph.mjs --json-only   (skip CODEBASE.md update)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname, basename, extname, resolve } from 'path';

const ROOT = resolve(join(import.meta.dirname, '..'));
const SRC = join(ROOT, 'src');
const OUT_JSON = join(ROOT, 'codegraph.json');

// ─── File discovery ───

function findFiles(dir, pattern = /\.(ts|tsx|jsx)$/) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      results.push(...findFiles(full, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// ─── Import extraction ───

function extractImports(code, filePath) {
  const imports = [];
  const relDir = dirname(filePath);

  // Static imports: import ... from '...' or export { ... } from '...'
  // Handles: import x from, import { x } from, import type { x } from, import * as x from
  // Also: export { x } from, export type { x } from
  const staticRe = /(?:import|export)\s+(?:type\s+)?(?:(?:\{[^}]*\}|[^;{]+)\s+from\s+)?['"]([^'"]+)['"]\s*;?/g;
  let m;
  while ((m = staticRe.exec(code)) !== null) {
    const spec = m[1];
    if (spec.startsWith('.')) {
      imports.push({ type: 'local', spec, resolved: resolveLocal(spec, relDir) });
    } else if (!spec.startsWith('node:') && !spec.startsWith('/')) {
      imports.push({ type: 'external', spec, resolved: null });
    }
  }

  // Dynamic imports: import('...')
  const dynamicRe = /import\(['"]([^'"]+)['"]\)/g;
  while ((m = dynamicRe.exec(code)) !== null) {
    const spec = m[1];
    if (spec.startsWith('.')) {
      imports.push({ type: 'dynamic', spec, resolved: resolveLocal(spec, relDir) });
    }
  }

  return imports;
}

function resolveLocal(spec, relDir) {
  // Strip .jsx → .tsx (common in Vite projects)
  const cleanSpec = spec.replace(/\.jsx$/, '');
  const candidates = [
    cleanSpec + '.tsx',
    cleanSpec + '.ts',
    cleanSpec + '.jsx',
    join(cleanSpec, 'index.ts'),
    join(cleanSpec, 'index.tsx'),
    join(cleanSpec, 'index.jsx'),
    cleanSpec,
  ];
  for (const c of candidates) {
    const full = resolve(join(relDir, c));
    if (existsSync(full)) {
      let normal = relative(SRC, full).replace(/\\/g, '/');
      if (!normal.startsWith('.')) normal = './' + normal;
      return normal;
    }
  }
  return null;
}

// ─── Export extraction (named + default) ───

function extractExports(code) {
  const exports = [];

  // export default ...
  const defaultRe = /export\s+default\s+(function|class|const|let|var)\s+(\w+)/;
  const dMatch = code.match(defaultRe);
  if (dMatch) exports.push({ type: 'default', name: dMatch[2] });

  // export default <identifier>
  const defaultIdRe = /export\s+default\s+(\w+)\s*;/;
  const diMatch = code.match(defaultIdRe);
  if (diMatch) exports.push({ type: 'default', name: diMatch[1] });

  // export default class/function name
  const defaultClassRe = /export\s+default\s+(?:class|function)\s+(\w+)/;
  const dcMatch = code.match(defaultClassRe);
  if (dcMatch) exports.push({ type: 'default', name: dcMatch[1] });

  // export { ... }
  const namedGroupRe = /export\s+\{(.+?)\}\s*;?/g;
  let m;
  while ((m = namedGroupRe.exec(code)) !== null) {
    for (const part of m[1].split(',')) {
      const trimmed = part.trim().split(/\s+as\s+/)[0];
      if (trimmed) exports.push({ type: 'named', name: trimmed });
    }
  }

  // export function / export const / export class
  const namedRe = /export\s+(?:function|const|let|var|class|interface|type)\s+(\w+)/g;
  while ((m = namedRe.exec(code)) !== null) {
    exports.push({ type: 'named', name: m[1] });
  }

  return exports;
}

// ─── Barrel resolver ───

function resolveBarrel(filePath, graph) {
  const node = graph.nodes.get(filePath);
  if (!node || node.exports.length === 0) return;
  // If this is a barrel (re-exports from other files), follow them
  for (const imp of node.imports) {
    if (imp.resolved && imp.resolved.startsWith('./')) {
      const absPath = resolvedToAbs(imp.resolved, graph);
      if (absPath) {
        const target = graph.nodes.get(absPath);
        if (target && target.exports.length > 0 && !target.isBarrel) {
          node.reExports.push({ source: absPath, exports: target.exports });
        }
      }
    }
  }
}

// ─── Shared helper: convert relative resolved path to absolute ───

function resolvedToAbs(resolved, graph) {
  // resolved is like "./App.tsx" or "./components/Layout.tsx"
  // graph node keys are absolute paths
  for (const [fp] of graph.nodes) {
    const rel = relative(SRC, fp).replace(/\\/g, '/');
    if (resolved === './' + rel) return fp;
  }
  return null;
}

// ─── Main ───

function buildGraph() {
  const files = findFiles(SRC);
  const graph = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    summary: { totalFiles: 0, externalDeps: new Set(), filesWithIssues: [] },
    nodes: new Map(),
    edges: [],
    unusedFiles: [],
  };

  for (const filePath of files) {
    const code = readFileSync(filePath, 'utf-8');
    const relPath = relative(ROOT, filePath).replace(/\\/g, '/');
    const imports = extractImports(code, filePath);
    const exports = extractExports(code);

    graph.nodes.set(filePath, {
      relPath,
      imports,
      exports,
      reExports: [],
      isBarrel: exports.length > 0 && exports.every(e => e.type === 'named') && imports.some(i => i.type === 'local'),
    });

    for (const imp of imports) {
      if (imp.type === 'external') graph.summary.externalDeps.add(imp.spec);
    }
  }

  // Resolve re-exports (barrel files)
  for (const [fp, node] of graph.nodes) {
    resolveBarrel(fp, graph);
  }

  // Build edges + unused detection
  const importedFiles = new Set();
  for (const [fp, node] of graph.nodes) {
    for (const imp of node.imports) {
      if (imp.resolved && imp.resolved.startsWith('./')) {
        const absPath = resolvedToAbs(imp.resolved, graph);
        if (absPath && graph.nodes.has(absPath)) {
          const sourceRel = relative(ROOT, fp).replace(/\\/g, '/');
          const targetRel = relative(ROOT, absPath).replace(/\\/g, '/');
          graph.edges.push({ from: sourceRel, to: targetRel, type: imp.type });
          importedFiles.add(absPath);
        }
      }
    }
  }

  // Follow barrel re-exports: if an index file is imported, mark its re-exports as used
  function markReExports(fp) {
    const node = graph.nodes.get(fp);
    if (!node) return;
    for (const re of node.reExports) {
      if (re.source) {
        const absPath = resolve(ROOT, re.source);
        importedFiles.add(absPath);
        markReExports(absPath);
      }
    }
  }

  // Entry point is always used
  const entryPath = join(SRC, 'main.tsx');
  importedFiles.add(entryPath);
  markReExports(entryPath);

  for (const [fp] of graph.nodes) {
    if (importedFiles.has(fp)) {
      markReExports(fp);
    }
  }

  for (const [fp, node] of graph.nodes) {
    if (!importedFiles.has(fp) && !fp.includes('vite-env')) {
      graph.unusedFiles.push(node.relPath);
    }
  }

  graph.summary.totalFiles = files.length;
  graph.summary.externalDeps = [...graph.summary.externalDeps].sort();

  return graph;
}

function writeJson(graph) {
  const json = {
    generatedAt: graph.generatedAt,
    root: graph.root,
    summary: {
      totalFiles: graph.summary.totalFiles,
      totalEdges: graph.edges.length,
      externalDeps: graph.summary.externalDeps,
      unusedFiles: graph.unusedFiles,
    },
    edges: graph.edges,
    files: {},
  };

  for (const [fp, node] of graph.nodes) {
    json.files[node.relPath] = {
      imports: node.imports.map(i => ({
        type: i.type,
        spec: i.spec,
        resolved: i.resolved ? relative(ROOT, i.resolved).replace(/\\/g, '/') : null,
      })),
      exports: node.exports,
      reExports: node.reExports.map(r => ({
        source: r.source ? relative(ROOT, r.source).replace(/\\/g, '/') : null,
        exports: r.exports,
      })),
    };
  }

  writeFileSync(OUT_JSON, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`[codegraph] Wrote ${OUT_JSON}`);
  console.log(`[codegraph] ${graph.summary.totalFiles} files, ${graph.edges.length} edges, ${graph.unusedFiles.length} potentially unused files`);
}

function updateCodebaseMd(graph) {
  const mdPath = join(ROOT, 'CODEBASE.md');
  if (!existsSync(mdPath)) {
    console.log('[codegraph] CODEBASE.md not found, skipping update');
    return;
  }

  let md = readFileSync(mdPath, 'utf-8');

  // Update module dependency section
  const depSection = graph.generateDepGraphText();
  md = md.replace(
    /(## Module Import Graph\s*\n)([\s\S]*?)(?=\n## |$)/,
    `$1\`\`\`\n${depSection}\`\`\`\n\n`
  );

  writeFileSync(mdPath, md, 'utf-8');
  console.log('[codegraph] Updated CODEBASE.md with fresh import graph');
}

function generateDepGraphText(graph) {
  const lines = [];
  const entry = join(SRC, 'main.tsx');
  const visited = new Set();

  function walk(fp, depth = 0) {
    if (depth > 3 || visited.has(fp)) return;
    visited.add(fp);
    const node = graph.nodes.get(fp);
    if (!node) return;
    const indent = '  '.repeat(depth);
    const label = basename(fp);
    lines.push(`${indent}${label}`);
    for (const imp of node.imports) {
      if (imp.resolved && graph.nodes.has(imp.resolved) && !imp.resolved.includes('assets/')) {
        walk(imp.resolved, depth + 1);
      }
    }
  }

  walk(entry);
  return lines.join('\n');
}

function main() {
  const graph = buildGraph();
  graph.generateDepGraphText = () => generateDepGraphText(graph);

  writeJson(graph);

  const args = process.argv.slice(2);
  if (args.includes('--json-only')) {
    console.log('[codegraph] Skipping CODEBASE.md update (--json-only)');
  } else {
    updateCodebaseMd(graph);
  }

  // Report unused files
  if (graph.unusedFiles.length > 0) {
    console.log('\n[codegraph] Potentially unused files (no imports found):');
    for (const f of graph.unusedFiles) {
      console.log(`  - ${f}`);
    }
  }
}

main();
