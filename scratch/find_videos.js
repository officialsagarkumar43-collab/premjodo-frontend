const https = require('https');
const fs = require('fs');

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'PremJodoApp/1.0 (https://premjodo.com; adarsh@premjodo.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getFileInfo(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'PremJodoApp/1.0 (https://premjodo.com; adarsh@premjodo.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const queries = [
    'Wikitongues Hindi speaking',
    'Wikitongues Indian speaking',
    'Wikitongues Bengali speaking',
    'Wikitongues Tamil speaking',
    'Wikitongues Marathi speaking',
    'Wikitongues female speaking Indian',
    'Wikitongues female speaking Hindi'
  ];

  for (const q of queries) {
    const res = await searchCommons(q);
    console.log(`=== Query: ${q} ===`);
    if (res.query && res.query.search) {
      for (const item of res.query.search.slice(0, 5)) {
        console.log(`- ${item.title}`);
        const info = await getFileInfo(item.title);
        const pages = info.query.pages;
        for (const pid in pages) {
          if (pages[pid].imageinfo && pages[pid].imageinfo[0]) {
            const ii = pages[pid].imageinfo[0];
            console.log(`   URL: ${ii.url} (${(ii.size / 1024 / 1024).toFixed(2)} MB, ${ii.mime})`);
          }
        }
      }
    }
  }
}

main().catch(console.error);
