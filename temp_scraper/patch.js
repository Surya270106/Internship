const fs = require('fs');

async function run() {
  const productsContent = fs.readFileSync('src/data/products.js', 'utf8');
  const downloaded = JSON.parse(fs.readFileSync('temp_scraper/downloaded.json'));

  // replace every image: '...' with image: '/images/img_X.jpg' or the placeholder
  let newContent = productsContent;
  let matchIdx = 0;
  
  newContent = newContent.replace(/image: 'https:\/\/m\.media-amazon\.com[^']+'/g, () => {
    const val = `image: '${downloaded[matchIdx].image}'`;
    matchIdx++;
    return val;
  });

  fs.writeFileSync('src/data/products.js', newContent);
  console.log('Replaced ' + matchIdx + ' images in products.js');
}

run();
