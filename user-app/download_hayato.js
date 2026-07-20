const https = require('https');
const fs = require('fs');

const url = 'https://toppng.com/uploads/preview/shimada-hayato-free-fire-115809794073d84wsqvok.png';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream('public/avatars/hayato.png');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download complete');
      process.exit(0);
    });
  } else {
    console.log('Failed with status: ' + res.statusCode);
    if (res.headers.location) {
      console.log('Redirect: ' + res.headers.location);
    }
    process.exit(1);
  }
}).on('error', (e) => {
  console.error(e);
  process.exit(1);
});
