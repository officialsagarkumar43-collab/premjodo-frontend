const fs = require('fs');

const html = fs.readFileSync('scratch/chitchat_refunds.html', 'utf8');

// Strip tags or extract main content
const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
const content = mainMatch ? mainMatch[1] : html;

// Simple text cleaner
const text = content
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<header[\s\S]*?<\/header>/gi, '')
  .replace(/<footer[\s\S]*?<\/footer>/gi, '')
  .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
  .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
  .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
  .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
  .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\n\s+\n/g, '\n\n')
  .trim();

console.log(text.slice(0, 3000));
fs.writeFileSync('scratch/chitchat_refunds_parsed.txt', text);
