const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'www.google.com',
  path: '/search?tbm=isch&q=free+fire+hayato+png',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Google image thumbnails are often in inline script tags as base64
    const b64Regex = /data:image\/(?:jpeg|png|webp);base64,([a-zA-Z0-9+/=]+)/g;
    const matches = [...data.matchAll(b64Regex)];
    
    if (matches.length > 0) {
      // Pick the second one (usually the first is a logo or something, or pick the first big one)
      // Actually let's just pick the first one that is reasonably large (at least 1000 characters)
      const validMatches = matches.filter(m => m[1].length > 1000);
      if (validMatches.length > 0) {
        const base64Data = validMatches[0][1];
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync('public/avatars/hayato.png', buffer);
        console.log('Successfully saved Google Image thumbnail for Hayato!');
      } else {
        console.log('No large base64 images found.');
      }
    } else {
      console.log('No base64 images found.');
    }
  });
}).on('error', console.error);
