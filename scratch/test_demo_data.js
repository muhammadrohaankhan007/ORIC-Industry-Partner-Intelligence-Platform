const fs = require('fs');
const content = fs.readFileSync('js/demo-data.js', 'utf8');
const vm = require('vm');
const context = {};
vm.createContext(context);
const result = vm.runInContext(content + '; SHU_DEMO_PARTNERS;', context);

console.log("SHU_DEMO_PARTNERS count:", result.length);
console.log("Tickers:", result.map(p => p.ticker || p.basicInfo.name));
