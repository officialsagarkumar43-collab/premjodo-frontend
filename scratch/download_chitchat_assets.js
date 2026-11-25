const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}: ${res.statusMessage}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Downloaded ${dest} (${fs.statSync(dest).size} bytes)`);
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const assets = [
    { url: 'https://www.chitchat.gg/videos/hero-1.mp4', dest: 'public/videos/hero-1.mp4' },
    { url: 'https://www.chitchat.gg/videos/hero-2.mp4', dest: 'public/videos/hero-2.mp4' },
    { url: 'https://www.chitchat.gg/videos/hero-1.webp', dest: 'public/videos/hero-1.webp' },
    { url: 'https://www.chitchat.gg/videos/hero-2.webp', dest: 'public/videos/hero-2.webp' },
  ];

  for (const a of assets) {
    try {
      console.log(`Downloading ${a.url}...`);
      await download(a.url, a.dest);
    } catch (e) {
      console.error(e.message);
    }
  }

  // Also check woman-selfie and chat-photo-night from scratch/chitchat.html
  const html = fs.readFileSync('scratch/chitchat.html', 'utf8');
  const matchAvatar = html.match(/src="(\/_astro\/woman-selfie[^"]+)"/);
  if (matchAvatar) {
    console.log('Downloading avatar:', matchAvatar[1]);
    await download('https://www.chitchat.gg' + matchAvatar[1], 'public/images/chitchat-avatar.webp');
  }
  const matchPhoto = html.match(/src="(\/_astro\/chat-photo-night[^"]+)"/);
  if (matchPhoto) {
    console.log('Downloading photo:', matchPhoto[1]);
    await download('https://www.chitchat.gg' + matchPhoto[1], 'public/images/chitchat-photo.webp');
  }
}

run().catch(console.error);
