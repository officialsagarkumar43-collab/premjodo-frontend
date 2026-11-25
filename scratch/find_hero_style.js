const fs = require('fs');
const html = fs.readFileSync('scratch/chitchat.html', 'utf8');

// Search for 'hero-illu' in style tags
const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
console.log('Total style tags:', styleMatches.length);

styleMatches.forEach((m, idx) => {
  if (m[1].includes('hero-illu')) {
    console.log('Style tag #' + idx + ' has hero-illu! Length:', m[1].length);
    fs.writeFileSync('scratch/hero-illu-extracted.css', m[1]);
  }
});
