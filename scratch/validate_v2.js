const fs = require('fs');
const vm = require('vm');

console.log("===============================================================================");
console.log("SHU PARTNERSHIP PLATFORM — V2 LIVE PSX & SEARCH INTEGRATION VALIDATION");
console.log("===============================================================================");

// Mock browser environment
const domElements = {};
function mockElement(id) {
  if (!domElements[id]) {
    domElements[id] = {
      id,
      innerHTML: '',
      textContent: '',
      value: '',
      classList: {
        add() {},
        remove() {},
        toggle() {},
        contains() { return false; }
      },
      style: {},
      addEventListener() {},
      querySelectorAll() { return []; },
      querySelector() { return null; },
      setAttribute() {},
      getAttribute() { return null; }
    };
  }
  return domElements[id];
}

const context = {
  window: {},
  document: {
    addEventListener(event, fn) { /* mock DOMContentLoaded */ },
    getElementById: (id) => mockElement(id),
    querySelectorAll: (sel) => [],
    querySelector: (sel) => mockElement('query_' + sel),
    documentElement: mockElement('html'),
    body: mockElement('body'),
    createElement: (tag) => mockElement('tag_' + tag)
  },
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  console: console,
  setTimeout: (fn) => fn(),
  setInterval: () => 1,
  clearInterval: () => {},
  Chart: class { constructor() {} destroy() {} update() {} },
  Blob: class {},
  URL: { createObjectURL: () => 'blob://test' }
};
context.window = context;
context.document.defaultView = context;

vm.createContext(context);

// Load files with globalThis assignment
const files = [
  { file: 'js/config.js', prop: 'SHU_CONFIG' },
  { file: 'js/demo-data.js', prop: 'SHU_DEMO_PARTNERS' },
  { file: 'js/storage.js', prop: 'SHU_STORAGE' },
  { file: 'js/live-psx-service.js', prop: 'SHU_LIVE_PSX' },
  { file: 'js/ai-engine.js', prop: 'SHU_INTELLIGENCE' },
  { file: 'js/charts.js', prop: 'SHU_CHARTS' },
  { file: 'js/reports.js', prop: 'SHU_REPORTS' },
  { file: 'js/app.js', prop: 'SHU_APP' }
];

let allPassed = true;
for (const { file, prop } of files) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const res = vm.runInContext(code + (prop ? `; this.${prop} = ${prop};` : ''), context);
    console.log(`[PASS] Script loaded & parsed without errors: ${file}`);
  } catch (err) {
    console.error(`[FAIL] Error loading ${file}:`, err);
    allPassed = false;
  }
}

// 2. Test Storage Initialization & PSX Partners Count
try {
  context.SHU_STORAGE.init();
  const partners = context.SHU_STORAGE.getAllPartners();
  console.log(`[TEST 1] Storage loaded ${partners.length} verified partner enterprises (Expected >= 20)`);
  if (partners.length >= 20) {
    console.log(`[PASS] PSX catalog expanded to ${partners.length} companies.`);
  } else {
    console.error(`[FAIL] Only ${partners.length} partners loaded.`);
    allPassed = false;
  }
} catch (e) {
  console.error("[FAIL] Storage initialization error:", e);
  allPassed = false;
}

// 3. Test Picture 1 Query: Search "SSS"
try {
  const sssMatches = context.SHU_STORAGE.searchAndFilter("SSS");
  console.log(`[TEST 2] Search query 'SSS' returned ${sssMatches.length} matching organizations`);
  console.log("Matches:", sssMatches.map(p => `${p.basicInfo.name} [Ticker: ${p.ticker}]`));
  const hasSystems = sssMatches.some(p => p.ticker === 'SYS' || p.basicInfo.name.includes("Systems"));
  if (hasSystems) {
    console.log("[PASS] 'SSS' successfully resolves to Systems Limited (PSX: SYS)!");
  } else {
    console.error("[FAIL] 'SSS' did not match Systems Limited.");
    allPassed = false;
  }
} catch (e) {
  console.error("[FAIL] Search 'SSS' error:", e);
  allPassed = false;
}

// 4. Test PSX Ticker Searches: "SYS", "SEARL", "ABOT", "HBL", "LCI", "MEBL"
const testTickers = ["SYS", "SEARL", "ABOT", "HBL", "LCI", "MEBL"];
for (const t of testTickers) {
  const matches = context.SHU_STORAGE.searchAndFilter(t);
  if (matches.length > 0 && matches.some(p => p.ticker === t)) {
    console.log(`[PASS] Ticker search '${t}' matched ${matches[0].basicInfo.name}`);
  } else {
    console.error(`[FAIL] Ticker search '${t}' failed.`);
    allPassed = false;
  }
}

// 5. Test Live PSX Service Quotes & Sync
try {
  context.SHU_LIVE_PSX.init();
  const searlQuote = context.SHU_LIVE_PSX.getQuote("SEARL");
  console.log(`[TEST 3] Live PSX Quote for SEARL: PKR ${searlQuote.price} (${searlQuote.changePercent}%) | Vol: ${searlQuote.volume}`);
  const sysQuote = context.SHU_LIVE_PSX.getQuote("SYS");
  console.log(`[TEST 3] Live PSX Quote for SYS: PKR ${sysQuote.price} (${sysQuote.changePercent}%) | Vol: ${sysQuote.volume}`);

  const syncResult = context.SHU_LIVE_PSX.syncAll();
  console.log("[PASS] Live PSX Market Sync executed successfully.");
} catch (e) {
  console.error("[FAIL] Live PSX service error:", e);
  allPassed = false;
}

// 6. Test App Initialization & Header Dropdown
try {
  context.SHU_APP.init();
  const selectMock = domElements["headerPartnerSelect"];
  if (selectMock && selectMock.innerHTML.includes("<optgroup") && selectMock.innerHTML.includes("SEARL —")) {
    console.log("[PASS] Header Dropdown correctly populated with categorized <optgroup> sections and PSX tickers!");
  } else {
    console.error("[FAIL] Header Dropdown did not have expected optgroup or tickers.");
    allPassed = false;
  }
} catch (e) {
  console.error("[FAIL] App init error:", e);
  allPassed = false;
}

// 7. Verify index.html contains necessary markup
const html = fs.readFileSync('index.html', 'utf8');
const checks = [
  { name: "Live PSX Ticker Marquee", needle: 'id="psxTickerMarqueeBar"' },
  { name: "Sync Live PSX Button", needle: 'id="btnSyncLivePsx"' },
  { name: "Header PSX Status", needle: 'class="header-psx-status"' },
  { name: "Sector Filter Pills", needle: 'id="dbSectorPills"' },
  { name: "Live PSX Script Tag", needle: 'src="js/live-psx-service.js"' }
];

for (const check of checks) {
  if (html.includes(check.needle)) {
    console.log(`[PASS] index.html contains ${check.name}`);
  } else {
    console.error(`[FAIL] index.html missing ${check.name}`);
    allPassed = false;
  }
}

console.log("===============================================================================");
if (allPassed) {
  console.log("ALL TESTS PASSED — 100% SUCCESSFUL VALIDATION!");
} else {
  console.log("SOME CHECKS FAILED — REVIEW OUTPUT ABOVE");
  process.exit(1);
}
console.log("===============================================================================");
