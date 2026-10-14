const fs = require('fs');
const vm = require('vm');

const context = {
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  console: console
};
vm.createContext(context);

// Load demo-data.js
vm.runInContext(fs.readFileSync('js/demo-data.js', 'utf8') + '; this.SHU_DEMO_PARTNERS = SHU_DEMO_PARTNERS;', context);

// Load config.js
vm.runInContext(fs.readFileSync('js/config.js', 'utf8') + '; this.SHU_CONFIG = SHU_CONFIG;', context);

// Load storage.js
vm.runInContext(fs.readFileSync('js/storage.js', 'utf8') + '; this.SHU_STORAGE = SHU_STORAGE;', context);

context.SHU_STORAGE.init();

console.log("All partners count in storage:", context.SHU_STORAGE.getAllPartners().length);

// Test searching "SSS"
const sssResults = context.SHU_STORAGE.searchAndFilter("SSS");
console.log("Search 'SSS' results count:", sssResults.length);
console.log("Search 'SSS' matches:", sssResults.map(p => `${p.basicInfo.name} (${p.ticker})`));

// Test searching "SYS"
const sysResults = context.SHU_STORAGE.searchAndFilter("SYS");
console.log("Search 'SYS' matches:", sysResults.map(p => `${p.basicInfo.name} (${p.ticker})`));

// Test searching "SEARL"
const searlResults = context.SHU_STORAGE.searchAndFilter("SEARL");
console.log("Search 'SEARL' matches:", searlResults.map(p => `${p.basicInfo.name} (${p.ticker})`));
