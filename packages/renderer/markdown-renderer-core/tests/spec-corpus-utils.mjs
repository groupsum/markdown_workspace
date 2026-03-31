import { readFileSync } from 'node:fs';

export function loadSpecFile(path) {
  return readFileSync(path, 'utf8');
}

export function parseSpecExamples(specText) {
  const lines = String(specText).split(/\r?\n/);
  const tests = [];
  for (let index = 0; index < lines.length; index += 1) {
    const openMatch = lines[index].match(/^`{10,}\s*example(?:\s+([^\s]+))?\s*$/);
    if (!openMatch) continue;
    const section = openMatch[1] ?? 'example';
    const markdown = [];
    const html = [];
    index += 1;
    while (index < lines.length && lines[index] !== '.') {
      markdown.push(lines[index]);
      index += 1;
    }
    index += 1;
    while (index < lines.length && !/^`{10,}\s*$/.test(lines[index])) {
      html.push(lines[index]);
      index += 1;
    }
    tests.push({
      id: tests.length + 1,
      section,
      markdown: markdown.join('\n').replace(/→/g, '\t'),
      html: html.join('\n').replace(/→/g, '\t'),
    });
  }
  return tests;
}

export function canonicalizeRenderedHtml(html) {
  return String(html)
    .trim()
    .replace(/^<div[^>]*>/, '')
    .replace(/<\/div>$/, '')
    .replace(/<pre><div[^>]*>[^<]*<\/div><div><code>/g, '<pre><code>')
    .replace(/<\/code><\/div><\/pre>/g, '</code></pre>')
    .replace(/\sclass="[^"]*"/g, '')
    .replace(/\sid="[^"]*"/g, '')
    .replace(/\sdata-[a-zA-Z0-9-]+="[^"]*"/g, '')
    .replace(/\saria-[a-zA-Z-]+="[^"]*"/g, '')
    .replace(/\starget="[^"]*"/g, '')
    .replace(/\srel="[^"]*"/g, '')
    .replace(/\sdisabled(="disabled")?/g, '')
    .replace(/\schecked(="checked")?/g, ' checked')
    .replace(/\s+\/?>/g, (match) => (match.includes('/>') ? ' />' : '>'))
    .replace(/>\n</g, '><')
    .replace(/<code>([\s\S]*?)<\/code>/g, (_m, code) => `<code>${String(code).replace(/\n$/, '')}</code>`)
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (_m, code) => `<pre><code>${String(code).replace(/\n$/, '')}</code></pre>`)
    .replace(/<br \/>\n/g, '<br />')
    .trim();
}

export function sampleFailures(failures, limit = 25) {
  return failures.slice(0, limit).map((failure) => ({
    id: failure.id,
    section: failure.section,
    markdown: failure.markdown.slice(0, 240),
    expected: failure.expected.slice(0, 240),
    actual: failure.actual.slice(0, 240),
  }));
}
