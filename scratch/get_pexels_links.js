const fs = require('fs');

async function getPexelsLinks(query) {
  const url = 'https://www.pexels.com/search/videos/' + encodeURIComponent(query) + '/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const videoPageMatches = [...html.matchAll(/\/video\/[a-z0-9\-]+-(\d+)\//g)].map(m => m[0]);
  console.log(query, 'video pages:', Array.from(new Set(videoPageMatches)).slice(0, 5));
  
  // Also check if there are direct video sources in data attributes or json
  const dataVideoMatches = [...html.matchAll(/data-src=["']([^"']+\.mp4[^"']*)["']/g)].map(m => m[1]);
  console.log('data-src:', dataVideoMatches.slice(0, 3));
}

getPexelsLinks('indian woman video call');
getPexelsLinks('indian man video call');
