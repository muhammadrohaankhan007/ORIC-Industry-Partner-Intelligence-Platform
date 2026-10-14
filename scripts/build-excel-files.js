global.window = global;
global.localStorage = { getItem: () => null, setItem: () => null };

const fs = require('fs');
const xlsx = require('xlsx');

// Load preloaded data and AI engine
const preloadedCode = fs.readFileSync('js/preloaded-data.js', 'utf8');
eval(preloadedCode);
const projects = global.PRELOADED_PHARMACY_PROJECTS;

const aiEngineCode = fs.readFileSync('js/ai-engine.js', 'utf8');
eval(aiEngineCode);

console.log('Analyzing', projects.length, 'projects for master Excel generation...');
const analyzed = projects.map(p => {
  const a = global.aiEngine.generateBuiltinAnalysis(p);
  return { ...p, analysis: a, processed: true, status: 'Processed' };
});

// ============================================================================
// 1. Detailed Projects Workbook (All Details Listed)
// ============================================================================
const detailedRows = analyzed.map((p, idx) => {
  const a = p.analysis;
  const delivs = Array.isArray(a.deliverables) ? a.deliverables.map((d, i) => (i + 1) + '. ' + d).join('\r\n') : a.deliverables;
  return {
    'Project ID': p.id,
    'Course Code': p.courseCode,
    'Course Title': p.courseTitle,
    'Student Name': p.studentName,
    'Department': p.department,
    'Faculty': p.faculty,
    'Supervisor': p.supervisor,
    'Original Project Title': p.originalTitle,
    'Refined Project Title': a.refinedTitle,
    'Problem Being Addressed': a.problem,
    'Proposed Solution': a.proposedSolution,
    'Project Deliverables (3-7)': delivs,
    'Expected Outputs / Outcomes': a.expectedOutcome,
    'Industry Sector': a.industrySector,
    'Industry Application / Use Case': a.industryApplication,
    'Potential Industry Customer / User': a.potentialCustomer,
    'Potential Industry Partner': a.potentialIndustryPartner,
    'Commercialization Potential': a.commercializationPotential,
    'Commercialization Routes': Array.isArray(a.commercializationRoute) ? a.commercializationRoute.join(', ') : '',
    'UN SDG Alignment': Array.isArray(a.sdgAlignment) ? a.sdgAlignment.join('; ') : '',
    'Faculty / Domain Expertise': a.domainExpertise,
    'Industry Validation Required': a.industryValidationRequired,
    'ORIC Classification': a.oricPotential,
    'Abstract': p.abstract
  };
});

const wbDetailed = xlsx.utils.book_new();
const wsDetailed = xlsx.utils.json_to_sheet(detailedRows);
wsDetailed['!cols'] = [
  { wch: 12 }, { wch: 14 }, { wch: 25 }, { wch: 20 }, { wch: 24 }, { wch: 18 }, { wch: 20 },
  { wch: 36 }, { wch: 40 }, { wch: 45 }, { wch: 45 }, { wch: 55 }, { wch: 40 }, { wch: 20 },
  { wch: 35 }, { wch: 30 }, { wch: 30 }, { wch: 22 }, { wch: 25 }, { wch: 30 }, { wch: 30 },
  { wch: 15 }, { wch: 28 }, { wch: 50 }
];
xlsx.utils.book_append_sheet(wbDetailed, wsDetailed, 'All Project Details');
xlsx.writeFile(wbDetailed, 'ORIC_Comprehensive_Project_Details.xlsx');
console.log('Successfully created: ORIC_Comprehensive_Project_Details.xlsx');

// ============================================================================
// 2. Main Executive Summary Workbook (Total Projects Listed in Excel Format)
// ============================================================================
const wbMain = xlsx.utils.book_new();

// Sheet 1: Project Catalog
const catalogRows = analyzed.map((p, idx) => {
  const a = p.analysis;
  return {
    '#': idx + 1,
    'Project ID': p.id,
    'Course Code': p.courseCode,
    'Course Title': p.courseTitle,
    'Student Name': p.studentName,
    'Department': p.department,
    'Refined Project Title': a.refinedTitle,
    'Industry Sector': a.industrySector,
    'Commercialization Rating': a.commercializationPotential,
    'Deliverables Count': Array.isArray(a.deliverables) ? a.deliverables.length : 0,
    'Key UN SDG': Array.isArray(a.sdgAlignment) && a.sdgAlignment.length > 0 ? a.sdgAlignment[0] : 'SDG 3',
    'ORIC Readiness': a.oricPotential
  };
});
const wsCatalog = xlsx.utils.json_to_sheet(catalogRows);
wsCatalog['!cols'] = [
  { wch: 6 }, { wch: 12 }, { wch: 14 }, { wch: 25 }, { wch: 20 }, { wch: 24 },
  { wch: 45 }, { wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 32 }, { wch: 28 }
];
xlsx.utils.book_append_sheet(wbMain, wsCatalog, 'Project Catalog');

// Sheet 2: Executive Course Benchmarking
const courseMap = {};
analyzed.forEach(p => {
  const key = p.courseCode + ' - ' + p.courseTitle;
  if (!courseMap[key]) {
    courseMap[key] = {
      'Course Code': p.courseCode,
      'Course Title': p.courseTitle,
      'Department': p.department,
      'Total Projects': 0,
      'Industry Aligned Projects': 0,
      'High Commercialization': 0,
      'Startup Opportunities': 0,
      'Applied Research Focus': 0
    };
  }
  const c = courseMap[key];
  c['Total Projects']++;
  const a = p.analysis;
  if (a.industrySector && a.industrySector !== 'Academic Only') c['Industry Aligned Projects']++;
  if (a.commercializationPotential === 'High') c['High Commercialization']++;
  if ((a.commercializationRoute || []).includes('Startup') || (a.oricPotential || '').includes('Startup')) c['Startup Opportunities']++;
  if ((a.oricPotential || '').includes('Research') || a.commercializationPotential === 'Primarily Academic') c['Applied Research Focus']++;
});

const wsCourse = xlsx.utils.json_to_sheet(Object.values(courseMap));
wsCourse['!cols'] = [
  { wch: 14 }, { wch: 26 }, { wch: 24 }, { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 22 }
];
xlsx.utils.book_append_sheet(wbMain, wsCourse, 'Course Benchmarks');

// Sheet 3: Industry Sector Breakdown
const sectorMap = {};
analyzed.forEach(p => {
  const s = p.analysis.industrySector || 'Other';
  sectorMap[s] = (sectorMap[s] || 0) + 1;
});
const sectorRows = Object.entries(sectorMap).map(([sector, count]) => ({
  'Industry Sector': sector,
  'Project Count': count,
  'Portfolio Share (%)': Math.round((count / analyzed.length) * 100) + '%'
}));
const wsSectors = xlsx.utils.json_to_sheet(sectorRows);
wsSectors['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }];
xlsx.utils.book_append_sheet(wbMain, wsSectors, 'Industry Sector Matrix');

xlsx.writeFile(wbMain, 'ORIC_Main_Executive_Portfolio_Summary.xlsx');
console.log('Successfully created: ORIC_Main_Executive_Portfolio_Summary.xlsx');
