const fs = require('fs');
const rules = fs.readFileSync('scratch/chitchat_hero_rules.css', 'utf8');
console.log(rules);
