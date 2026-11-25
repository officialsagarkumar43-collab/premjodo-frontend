const fs = require('fs');

console.log('guy size:', fs.statSync('public/videos/hero-guy.webm').size);
console.log('girl size:', fs.statSync('public/videos/hero-girl.webm').size);
