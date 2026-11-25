async function main() {
  try {
    const res = await fetch('https://www.chitchat.gg/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('HTML length:', html.length);
    
    // Check keywords
    const keywords = ['Chloe', 'Jacob', 'Music', 'Travel', 'Gaming', 'London', 'where you from', 'mp4', 'webm', 'gif'];
    keywords.forEach(k => {
      console.log('Includes ' + k + ':', html.includes(k));
    });

    // Find script tags
    const scriptMatches = [...html.matchAll(/src=["'](\/_next\/static\/[^"']+\.js)["']/g)].map(m => m[1]);
    console.log('Next.js script chunks:', scriptMatches);

    // Save html for deeper inspection
    require('fs').writeFileSync('scratch/chitchat.html', html);
    console.log('Saved scratch/chitchat.html');
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
main();
