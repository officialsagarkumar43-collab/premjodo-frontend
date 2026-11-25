const https = require('https');

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'PremJodoApp/1.0 (https://premjodo.com; contact@premjodo.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function getFileInfo(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'PremJodoApp/1.0 (https://premjodo.com; contact@premjodo.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const titles = [
    'Wikitongues Sathi speaking',
    'Wikitongues Sylvia speaking Khasi',
    'Wikitongues speaking Hindi',
    'Wikitongues speaking Punjabi',
    'Wikitongues speaking Gujarati'
  ];
  for (const t of titles) {
    const res = await searchCommons(t);
    if (res.query && res.query.search) {
      for (const item of res.query.search) {
        if (item.title.endsWith('.webm') || item.title.endsWith('.mp4')) {
          const info = await getFileInfo(item.title);
          for (const k in info.query.pages) {
            const ii = info.query.pages[k].imageinfo?.[0];
            if (ii) console.log(`${item.title} -> ${ii.url} (${(ii.size/1024/1024).toFixed(1)}MB)`);
          }
        }
      }
    }
  }
}

run().catch(console.error);
