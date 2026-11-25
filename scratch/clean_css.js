const fs = require('fs');
const rules = fs.readFileSync('scratch/chitchat_hero_rules.css', 'utf8');

// Clean data-astro attributes and organize nicely
const cleanCss = rules.replace(/\[data-astro-cid-[^\]]+\]/g, '');
fs.writeFileSync('scratch/chitchat_clean.css', cleanCss);
console.log('Saved scratch/chitchat_clean.css');
