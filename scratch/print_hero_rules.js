const fs = require('fs');
const css = fs.readFileSync('scratch/hero-illu-extracted.css', 'utf8');

// Extract all rules mentioning hero-illu
const rules = css.match(/[^\{\}]*hero-illu[^\{\}]*\{[^\}]*\}/g) || [];
console.log('Total hero-illu rules:', rules.length);
fs.writeFileSync('scratch/chitchat_hero_rules.css', rules.join('\n\n'));
console.log('Sample rules:\n', rules.slice(0, 15).join('\n\n'));
