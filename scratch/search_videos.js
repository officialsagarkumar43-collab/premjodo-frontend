const fs = require('fs');

async function searchPexels(query) {
  try {
    const url = 'https://www.pexels.com/search/videos/' + encodeURIComponent(query) + '/';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    // Search for video files:
    const matches = [...html.matchAll(/https:\/\/videos\.pexels\.com\/video-files\/[^"'\s<>]+\.(?:mp4|webm)/g)].map(m => m[0]);
    console.log(query, 'matches:', Array.from(new Set(matches)).slice(0, 5));
    return Array.from(new Set(matches));
  } catch (err) {
    console.error('Error searching:', err.message);
    return [];
  }
}

async function run() {
  await searchPexels('indian woman talking video call');
  await searchPexels('indian man talking video call');
}

run();
