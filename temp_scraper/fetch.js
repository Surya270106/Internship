const google = require('googlethis');
const fs = require('fs');

const products = [
  'iPhone 15 Pro Max', 'iPhone 15', 'Samsung Galaxy S24 Ultra', 'Google Pixel 8 Pro', 'Nothing Phone (2)',
  'MacBook Pro 16" (M3 Max)', 'MacBook Air 15" (M3)', 'Dell XPS 14', 'Razer Blade 16', 'Surface Laptop Studio 2',
  'AirPods Pro (2nd generation)', 'AirPods Max', 'Sony WH-1000XM5', 'Bose QuietComfort Ultra', 'Sonos Era 300',
  'Apple Watch Ultra 2', 'Apple Watch Series 9', 'Oura Ring Gen3', 'Garmin Fenix 7 Pro', 'Whoop 4.0',
  'iPad Pro 13" (M4)', 'iPad Air (M2)', 'iPad mini', 'Samsung Galaxy Tab S9 Ultra', 'reMarkable 2',
  'iMac 24"', 'Mac Studio', 'Studio Display',
  'Magic Keyboard', 'Magic Mouse', 'Apple Pencil Pro', 'MagSafe Charger'
];

async function run() {
  const results = [];
  
  for (const name of products) {
    try {
      console.log(`Searching for: ${name}`);
      
      // Get images
      const images = await google.image(`${name} transparent background`, { safe: false });
      // Find a clean, high quality image from a reputable source if possible
      let imageUrl = null;
      if (images && images.length > 0) {
        const cleanImg = images.find(img => 
          img.url.includes('amazon') || 
          img.url.includes('apple') || 
          img.url.includes('media-amazon') || 
          img.url.endsWith('.png') || 
          img.url.endsWith('.jpg')
        );
        imageUrl = cleanImg ? cleanImg.url : images[0].url;
      }

      // Get purchase link
      const search = await google.search(`buy ${name} amazon`, { safe: false });
      let buyUrl = null;
      if (search && search.results.length > 0) {
        const amazonLink = search.results.find(r => r.url.includes('amazon.com'));
        buyUrl = amazonLink ? amazonLink.url : search.results[0].url;
      }

      results.push({
        name,
        image: imageUrl || '',
        url: buyUrl || ''
      });
      
      // Sleep slightly to avoid rate limit
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`Error with ${name}: ${err.message}`);
      results.push({ name, image: '', url: '' });
    }
  }

  fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
  console.log('Done!');
}

run();
