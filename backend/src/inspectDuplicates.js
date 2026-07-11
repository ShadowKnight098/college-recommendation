const fs = require('fs');
const colleges = JSON.parse(fs.readFileSync('colleges.json', 'utf8'));

const codes = {};
const duplicates = [];

colleges.forEach((c, idx) => {
  if (codes[c.code]) {
    duplicates.push({ code: c.code, indices: [codes[c.code].idx, idx], names: [codes[c.code].name, c.institute] });
  } else {
    codes[c.code] = { idx, name: c.institute };
  }
});

console.log('Total colleges:', colleges.length);
console.log('Duplicates found:', duplicates);
