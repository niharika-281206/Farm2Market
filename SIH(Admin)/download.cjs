const https = require('https');
const fs = require('fs');

https.get('https://raw.githubusercontent.com/udit-001/india-maps-data/master/geojson/india.geojson', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('public/india.geojson', data);
    console.log('Downloaded India geojson successfully');
  });
});
