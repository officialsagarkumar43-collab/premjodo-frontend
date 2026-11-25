const fs = require('fs');
const html = fs.readFileSync('scratch/chitchat.html', 'utf8');

const svgIdx = html.indexOf('clipPath id="hi-');
console.log('SVG Defs:\n', html.slice(svgIdx - 200, svgIdx + 1200));

// Also let's inspect the entire <div class="hero-illu"> element
const illuIdx = html.indexOf('class="hero-illu"');
const endIdx = html.indexOf('</section>', illuIdx);
console.log('Hero illu snippet length:', endIdx - illuIdx);
fs.writeFileSync('scratch/chitchat_illu_dom.html', html.slice(illuIdx, endIdx));
