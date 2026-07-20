const https = require('https');
https.get('https://freefire.fandom.com/wiki/Hayato', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<meta property="og:image" content="([^"]+)"/);
    if (match) console.log('Found:', match[1]);
    else console.log('Not found');
  });
}).on('error', console.error);
