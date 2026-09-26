import { readFileSync, writeFileSync } from 'node:fs';
const source = readFileSync('supabase/functions/dumpster-atlas/page.ts', 'utf8');
const match = source.match(/return `([\s\S]*?)`;\s*}/);
if (!match) throw new Error('Could not extract HTML template');
const api = 'https://nqcshihyfhthywpseilx.supabase.co/functions/v1/dumpster-atlas';
const site = 'https://anastaysia94-sudo.github.io/dumpsteratlas/';
// Evaluate the trusted, repository-owned template as JavaScript so escaped
// regexes and newline sequences match the HTML served by the Edge Function.
const html = Function('canonical', 'return `'+match[1]+'`;')(site)
  .replace("const endpoint=location.href.split('?')[0];", `const endpoint='${api}';`);
if (html.includes('${') || !html.includes('saveStop(r)')) throw new Error('Unresolved template or missing collector UI');
writeFileSync('docs/index.html', html);
console.log('Built docs/index.html for a static frontend host');
