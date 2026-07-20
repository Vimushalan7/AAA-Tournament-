const https = require('https');
const fs = require('fs');

https.get('https://html.duckduckgo.com/html/?q=shimada+hayato+free+fire+transparent+png', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find image URLs in the html
    const matches = [...data.matchAll(/src="(\/\/external-content\.duckduckgo\.com\/iu\/\?u=[^"]+)"/g)];
    if (matches.length > 0) {
      const imgUrl = 'https:' + matches[0][1].replace(/&amp;/g, '&');
      console.log('Found image:', imgUrl);
      
      // Download the image
      https.get(imgUrl, (imgRes) => {
        const file = fs.createWriteStream('public/avatars/hayato.png');
        imgRes.pipe(file);
        file.on('finish', () => {
          console.log('Successfully downloaded Hayato from duckduckgo external content');
          process.exit(0);
        });
      });
    } else {
      console.log('No external images found.');
      process.exit(1);
    }
  });
});
