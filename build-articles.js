#!/usr/bin/env node
/**
 * Build articles/manifest.json from all .md files in articles/
 * Run after adding or editing article .md files:  node build-articles.js
 * Each .md file should have YAML frontmatter:
 *   ---
 *   title: Article Title
 *   date: 2026-03-10
 *   excerpt: Short description for cards.
 *   ---
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, 'articles');
const MANIFEST_PATH = path.join(ARTICLES_DIR, 'manifest.json');

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const [, front, body] = match;
  const meta = {};
  front.split('\n').forEach(function (line) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  });
  return { meta, body };
}

const files = fs.readdirSync(ARTICLES_DIR).filter(function (f) {
  return f.endsWith('.md') && f !== 'README.md';
});

const manifest = [];
files.forEach(function (file) {
  const slug = file.replace(/\.md$/, '');
  const filePath = path.join(ARTICLES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = parseFrontmatter(content);
  if (!parsed || !parsed.meta.title) {
    console.warn('Skipping ' + file + ' (missing frontmatter or title)');
    return;
  }
  manifest.push({
    slug: slug,
    file: file,
    title: parsed.meta.title,
    date: parsed.meta.date || '',
    excerpt: parsed.meta.excerpt || ''
  });
});

manifest.sort(function (a, b) {
  return (b.date || '').localeCompare(a.date || '');
});

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Wrote ' + manifest.length + ' articles to articles/manifest.json');
