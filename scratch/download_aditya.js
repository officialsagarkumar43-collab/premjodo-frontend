const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'PremJodoApp/1.0 (https://premjodo.com; contact@premjodo.com)' } }, (res) => {
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
  console.log("Downloading Aditya...");
  await download("https://upload.wikimedia.org/wikipedia/commons/6/69/WIKITONGUES-_Aditya_speaking_Marwari.webm", "public/videos/hero-guy.webm");
  console.log("Downloading Felicia / Indian female speaker...");
  await download("https://upload.wikimedia.org/wikipedia/commons/e/e8/Felicia_Shackleton_Speaking_Anglo-Indian_Tamil.webm", "public/videos/hero-girl.webm");
  console.log("Done!");
}

run().catch(console.error);
