const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const http = require('http');

const products = [
  'iPhone 15 Pro Max', 'iPhone 15', 'Samsung Galaxy S24 Ultra', 'Google Pixel 8 Pro', 'Nothing Phone (2)',
  'MacBook Pro 16" M3', 'MacBook Air 15" M3', 'Dell XPS 14', 'Razer Blade 16', 'Surface Laptop Studio 2',
  'AirPods Pro 2', 'AirPods Max', 'Sony WH-1000XM5', 'Bose QuietComfort Ultra', 'Sonos Era 300',
  'Apple Watch Ultra 2', 'Apple Watch Series 9', 'Oura Ring Gen3', 'Garmin Fenix 7 Pro', 'Whoop 4.0',
  'iPad Pro 13" M4', 'iPad Air M2', 'iPad mini', 'Samsung Galaxy Tab S9 Ultra', 'reMarkable 2',
  'iMac 24"', 'Mac Studio', 'Studio Display',
  'Magic Keyboard', 'Magic Mouse', 'Apple Pencil Pro', 'MagSafe Charger'
];

const downloadImage = (url, filepath) => new Promise((resolve, reject) => {
  if (!url) return resolve(false);
  const client = url.startsWith('https') ? https : http;
  const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode === 200) {
      res.pipe(fs.createWriteStream(filepath))
         .on('error', reject)
         .once('close', () => resolve(true));
    } else {
      res.resume();
      resolve(false);
    }
  });
  req.on('error', reject);
  req.setTimeout(5000, () => { req.destroy(); resolve(false); });
});

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

  for (let i = 0; i < products.length; i++) {
    const name = products[i];
    console.log(`Searching for: ${name}`);
    
    // Search Bing Images for the official product image with transparent or white background
    const query = encodeURIComponent(`"amazon" official product image ${name}`);
    await page.goto(`https://www.bing.com/images/search?q=${query}&qft=+filterui:photo-photo+filterui:bgcolor-white`, { waitUntil: 'domcontentloaded' });
    
    // Extract first few image URLs
    const imageUrls = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('a.iusc'));
      return imgs.slice(0, 5).map(a => {
        try {
          return JSON.parse(a.getAttribute('m')).murl;
        } catch(e) { return null; }
      }).filter(Boolean);
    });

    let success = false;
    let urlUsed = '';
    const filepath = `../public/images/img_${i}.jpg`;

    // Try downloading until one succeeds
    for (const url of imageUrls) {
      if (url.includes('amazon') || url.includes('apple') || url.includes('bestbuy') || url.includes('target')) {
        console.log(`  Trying highly relevant URL: ${url}`);
        success = await downloadImage(url, filepath).catch(() => false);
        if (success) {
          urlUsed = url;
          break;
        }
      }
    }

    if (!success) {
      for (const url of imageUrls) {
        console.log(`  Trying fallback URL: ${url}`);
        success = await downloadImage(url, filepath).catch(() => false);
        if (success) {
          urlUsed = url;
          break;
        }
      }
    }

    if (success) {
      console.log(`  -> Success: ${urlUsed}`);
    } else {
      console.log(`  -> Failed to find image for ${name}`);
    }

    // Small delay to avoid blocking
    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();
  console.log('Done downloading images from Bing.');
}

run().catch(console.error);
