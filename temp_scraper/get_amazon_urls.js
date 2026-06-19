const https = require('https');
const fs = require('fs');

const products = [
  'iPhone 15 Pro Max', 'iPhone 15', 'Samsung Galaxy S24 Ultra', 'Google Pixel 8 Pro', 'Nothing Phone 2',
  'MacBook Pro 16 M3', 'MacBook Air 15 M3', 'Dell XPS 14', 'Razer Blade 16 laptop', 'Surface Laptop Studio 2',
  'AirPods Pro 2', 'AirPods Max', 'Sony WH-1000XM5', 'Bose QuietComfort Ultra earbuds', 'Sonos Era 300',
  'Apple Watch Ultra 2', 'Apple Watch Series 9', 'Oura Ring Gen3', 'Garmin Fenix 7 Pro', 'Whoop 4.0',
  'iPad Pro 13 M4', 'iPad Air M2', 'iPad mini', 'Samsung Galaxy Tab S9 Ultra', 'reMarkable 2',
  'iMac 24', 'Mac Studio', 'Studio Display',
  'Apple Magic Keyboard', 'Apple Magic Mouse', 'Apple Pencil Pro', 'MagSafe Charger'
];

async function getAmazonImage(name) {
  const q = encodeURIComponent('site:amazon.com "m.media-amazon.com/images/I/" ' + name);
  return new Promise((resolve) => {
    https.get('https://html.duckduckgo.com/html/?q=' + q, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const m = data.match(/m\.media-amazon\.com\/images\/I\/([^"']+)\.jpg/);
        if (m) resolve('https://m.media-amazon.com/images/I/' + m[1] + '._AC_SL1500_.jpg');
        else resolve(null);
      });
    });
  });
}

async function run() {
  const results = {};
  for (let i = 0; i < products.length; i++) {
    const url = await getAmazonImage(products[i]);
    console.log(products[i] + ': ' + url);
    if (url) results[i] = url;
    await new Promise(r => setTimeout(r, 1000));
  }
  fs.writeFileSync('amazon_urls.json', JSON.stringify(results, null, 2));
}
run();
