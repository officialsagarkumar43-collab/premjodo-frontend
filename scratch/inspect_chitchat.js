const fs = require('fs');

console.log('hero-1.mp4 size:', fs.statSync('public/videos/hero-1.mp4').size);
console.log('hero-2.mp4 size:', fs.statSync('public/videos/hero-2.mp4').size);
console.log('hero-1.webp size:', fs.statSync('public/videos/hero-1.webp').size);
console.log('hero-2.webp size:', fs.statSync('public/videos/hero-2.webp').size);
console.log('avatar size:', fs.statSync('public/images/chitchat-avatar.webp').size);
console.log('photo size:', fs.statSync('public/images/chitchat-photo.webp').size);
