const fs = require('fs');
const html = fs.readFileSync('scratch/chitchat.html', 'utf8');

// Find style tags or extract classes with hero-illu
const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
let allCss = styleMatches.map(m => m[1]).join('\n');

const cssLines = allCss.split('\n');
const matched = [];
let capturing = false;
let depth = 0;

for (let line of cssLines) {
  if (line.includes('hero-illu')) {
    capturing = true;
  }
  if (capturing) {
    matched.push(line);
    if (line.includes('{')) depth += (line.match(/\{/g) || []).length;
    if (line.includes('}')) depth -= (line.match(/\}/g) || []).length;
    if (depth <= 0 && matched.length > 3) {
      capturing = false;
    }
  }
}

fs.writeFileSync('scratch/chitchat-hero.css', matched.join('\n'));
console.log('Saved scratch/chitchat-hero.css, lines:', matched.length);

// Also look for link rel="stylesheet"
const linkMatches = [...html.matchAll(/href=["']([^"']+\.css)["']/g)].map(m => m[1]);
console.log('External CSS links:', linkMatches);
