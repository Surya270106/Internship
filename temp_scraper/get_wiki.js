const https = require('https');

function getWikiImageUrl(filename) {
  return new Promise((resolve) => {
    https.get('https://commons.wikimedia.org/wiki/File:' + filename, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const m = data.match(/href="(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-zA-Z0-9\/_-]+\.(?:jpg|png|svg|webp))"/i);
        resolve(m ? m[1] : null);
      });
    });
  });
}

async function run() {
  const files = [
    'Samsung_Galaxy_S24_Ultra.jpg',
    'Samsung_Galaxy_S24_Ultra_with_retail_box,_front.jpg',
    'Google_Pixel_8_Pro.jpg',
    'Pixel_8_Pro_front.jpg',
    'Google_Pixel_8_Pro_front.png',
    'MacBook_Air_M2.jpg',
    'MacBook_Air_(M2).jpg',
    'MacBook_Air_M2_Silver.jpg',
    'Apple_Watch_Series_9.jpg',
    'Apple_Watch_Series_8.jpg',
    'Apple_Watch_Ultra.jpg',
    'Apple_Watch_Ultra_2.jpg',
    'IPad_Air_5.jpg',
    'IPad_Air_(5th_generation).jpg'
  ];
  for (const f of files) {
    const url = await getWikiImageUrl(f);
    if (url) console.log(f + ': ' + url);
  }
}
run();
