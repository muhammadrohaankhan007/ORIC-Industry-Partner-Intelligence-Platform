/**
 * Project-to-Industry Intelligence Platform - Export Module
 * Supports Excel (.xlsx), CSV, and Print/PDF generation (Requirement 11 & 18)
 */

class ExportManager {
  /**
   * Export 1: Comprehensive Project Details Excel (.xlsx)
   * Contains all 20+ granular details for every project
   */
  exportDetailedProjectsExcel(projects = []) {
    if (typeof XLSX === 'undefined') {
      alert('SheetJS (XLSX) library is required for Excel export.');
      return;
    }

    if (!projects || projects.length === 0) {
      alert('No projects available to export.');
      return;
    }

    const rows = projects.map((p, idx) => {
      const a = p.analysis || {};
      const delivStr = Array.isArray(a.deliverables) 
        ? a.deliverables.map((d, i) => `${i + 1}. ${d}`).join('\r\n')
        : (a.deliverables || '');

      return {
        'Project ID': p.id || `PRJ-${String(idx + 1).padStart(3, '0')}`,
        'Course Code': p.courseCode || a.courseCode || '',
        'Course Title': p.courseTitle || a.courseTitle || '',
        'Student Name': p.studentName || '',
        'Department': p.department || '',
        'Faculty': p.faculty || '',
        'Supervisor': p.supervisor || '',
        'Original Project Title': p.originalTitle || a.originalTitle || '',
        'Refined Project Title': a.refinedTitle || '',
        'Problem Being Addressed': a.problem || '',
        'Proposed Solution': a.proposedSolution || '',
        'Project Deliverables (3-7)': delivStr,
        'Expected Outputs / Outcomes': a.expectedOutcome || '',
        'Industry Sector': a.industrySector || '',
        'Industry Application / Use Case': a.industryApplication || '',
        'Potential Industry Customer / User': a.potentialCustomer || '',
        'Potential Industry Partner': a.potentialIndustryPartner || '',
        'Commercialization Potential': a.commercializationPotential || '',
        'Commercialization Routes': Array.isArray(a.commercializationRoute) ? a.commercializationRoute.join(', ') : (a.commercializationRoute || ''),
        'UN SDG Alignment': Array.isArray(a.sdgAlignment) ? a.sdgAlignment.join('; ') : (a.sdgAlignment || ''),
        'Faculty / Domain Expertise': a.domainExpertise || '',
        'Industry Validation Required': a.industryValidationRequired || '',
        'ORIC Classification': a.oricPotential || '',
        'Status': p.status || 'Processed',
        'Abstract': p.abstract || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 14 }, { wch: 25 }, { wch: 20 }, { wch: 24 }, { wch: 18 }, { wch: 20 },
      { wch: 36 }, { wch: 40 }, { wch: 45 }, { wch: 45 }, { wch: 55 }, { wch: 40 }, { wch: 20 },
      { wch: 35 }, { wch: 30 }, { wch: 30 }, { wch: 22 }, { wch: 25 }, { wch: 30 }, { wch: 30 },
      { wch: 15 }, { wch: 28 }, { wch: 12 }, { wch: 50 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Project Details');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `ORIC_Comprehensive_Project_Details_${dateStr}.xlsx`);
  }

  /**
   * Export 2: Main Executive Portfolio Summary Excel (.xlsx)
   * Multi-sheet workbook: Project Catalog, Course Benchmarks, Industry Matrix
   */
  exportMainExecutiveSummaryExcel(projects = []) {
    if (typeof XLSX === 'undefined') {
      alert('SheetJS (XLSX) library is required for Excel export.');
      return;
    }

    if (!projects || projects.length === 0) {
      alert('No projects available to export.');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Catalog
    const catalogRows = projects.map((p, idx) => {
      const a = p.analysis || {};
      return {
        '#': idx + 1,
        'Project ID': p.id || `PRJ-${String(idx + 1).padStart(3, '0')}`,
        'Course Code': p.courseCode || '',
        'Course Title': p.courseTitle || '',
        'Student Name': p.studentName || '',
        'Department': p.department || '',
        'Refined Project Title': a.refinedTitle || p.originalTitle || '',
        'Industry Sector': a.industrySector || 'Pharmaceuticals',
        'Commercialization Rating': a.commercializationPotential || 'Medium',
        'Deliverables Count': Array.isArray(a.deliverables) ? a.deliverables.length : 0,
        'Key UN SDG': Array.isArray(a.sdgAlignment) && a.sdgAlignment.length > 0 ? a.sdgAlignment[0] : 'SDG 3',
        'ORIC Readiness': a.oricPotential || 'Applied Research'
      };
    });
    const wsCatalog = XLSX.utils.json_to_sheet(catalogRows);
    wsCatalog['!cols'] = [
      { wch: 6 }, { wch: 12 }, { wch: 14 }, { wch: 25 }, { wch: 20 }, { wch: 24 },
      { wch: 45 }, { wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 32 }, { wch: 28 }
    ];
    XLSX.utils.book_append_sheet(workbook, wsCatalog, 'Project Catalog');

    // Sheet 2: Course Benchmarking
    const courseMap = {};
    projects.forEach(p => {
      const key = (p.courseCode || 'PHM507') + ' - ' + (p.courseTitle || 'Medicinal Chemistry');
      if (!courseMap[key]) {
        courseMap[key] = {
          'Course Code': p.courseCode || 'PHM507',
          'Course Title': p.courseTitle || 'Medicinal Chemistry',
          'Department': p.department || 'Pharmaceutical Chemistry',
          'Total Projects': 0,
          'Industry Aligned Projects': 0,
          'High Commercialization': 0,
          'Startup Opportunities': 0,
          'Applied Research Focus': 0
        };
      }
      const c = courseMap[key];
      c['Total Projects']++;
      const a = p.analysis || {};
      if (a.industrySector && a.industrySector !== 'Academic Only') c['Industry Aligned Projects']++;
      if (a.commercializationPotential === 'High') c['High Commercialization']++;
      if ((a.commercializationRoute || []).includes('Startup') || (a.oricPotential || '').includes('Startup')) c['Startup Opportunities']++;
      if ((a.oricPotential || '').includes('Research') || a.commercializationPotential === 'Primarily Academic') c['Applied Research Focus']++;
    });

    const wsCourse = XLSX.utils.json_to_sheet(Object.values(courseMap));
    wsCourse['!cols'] = [
      { wch: 14 }, { wch: 26 }, { wch: 24 }, { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(workbook, wsCourse, 'Course Benchmarks');

    // Sheet 3: Industry Matrix
    const sectorMap = {};
    projects.forEach(p => {
      const s = (p.analysis && p.analysis.industrySector) || 'Pharmaceuticals';
      sectorMap[s] = (sectorMap[s] || 0) + 1;
    });
    const sectorRows = Object.entries(sectorMap).map(([sector, count]) => ({
      'Industry Sector': sector,
      'Project Count': count,
      'Portfolio Share (%)': Math.round((count / projects.length) * 100) + '%'
    }));
    const wsSectors = XLSX.utils.json_to_sheet(sectorRows);
    wsSectors['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, wsSectors, 'Industry Sector Matrix');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `ORIC_Main_Executive_Portfolio_Summary_${dateStr}.xlsx`);
  }

  // Alias for backward compatibility
  exportToExcel(projects = []) {
    this.exportDetailedProjectsExcel(projects);
  }

  /**
   * Export all processed projects to CSV
   */
  exportToCSV(projects = []) {
    if (!projects || projects.length === 0) {
      alert('No projects available to export.');
      return;
    }

    const headers = [
      'Course Code',
      'Course Title',
      'Original Project Title',
      'Refined Project Title',
      'Abstract',
      'Problem',
      'Proposed Solution',
      'Deliverables',
      'Industry Sector',
      'Industry Application',
      'Potential Customer',
      'Potential Partner',
      'Commercialization Potential',
      'Commercialization Route',
      'SDG',
      'Expected Outcome',
      'Domain Expertise',
      'Industry Validation Required',
      'ORIC Potential',
      'Status'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      let s = val.toString().replace(/"/g, '""');
      return `"${s}"`;
    };

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += headers.join(',') + '\n';

    projects.forEach(p => {
      const a = p.analysis || {};
      const delivStr = Array.isArray(a.deliverables) 
        ? a.deliverables.map((d, i) => `${i + 1}. ${d}`).join(' | ')
        : (a.deliverables || '');

      const row = [
        escapeCsv(p.courseCode || a.courseCode || ''),
        escapeCsv(p.courseTitle || a.courseTitle || ''),
        escapeCsv(p.originalTitle || a.originalTitle || ''),
        escapeCsv(a.refinedTitle || ''),
        escapeCsv(p.abstract || ''),
        escapeCsv(a.problem || ''),
        escapeCsv(a.proposedSolution || ''),
        escapeCsv(delivStr),
        escapeCsv(a.industrySector || ''),
        escapeCsv(a.industryApplication || ''),
        escapeCsv(a.potentialCustomer || ''),
        escapeCsv(a.potentialIndustryPartner || ''),
        escapeCsv(a.commercializationPotential || ''),
        escapeCsv(Array.isArray(a.commercializationRoute) ? a.commercializationRoute.join('; ') : ''),
        escapeCsv(Array.isArray(a.sdgAlignment) ? a.sdgAlignment.join('; ') : ''),
        escapeCsv(a.expectedOutcome || ''),
        escapeCsv(a.domainExpertise || ''),
        escapeCsv(a.industryValidationRequired || ''),
        escapeCsv(a.oricPotential || ''),
        escapeCsv(p.status || 'Processed')
      ];

      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ORIC_Project_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export unedited original raw dataset (Data Safety requirement)
   */
  exportOriginalDataset(originalList = []) {
    if (!originalList || originalList.length === 0) {
      alert('No original dataset loaded.');
      return;
    }

    if (typeof XLSX === 'undefined') {
      alert('SheetJS (XLSX) library is required for Excel export.');
      return;
    }

    const rows = originalList.map(item => ({
      'ID': item.id,
      'Student Name': item.studentName || '',
      'Faculty': item.faculty || '',
      'Department': item.department || '',
      'Course Code': item.courseCode || '',
      'Course Title': item.courseTitle || '',
      'Supervisor': item.supervisor || '',
      'Original Project Title': item.originalTitle || '',
      'Abstract': item.abstract || '',
      'Validation Status': item.validationErrors && item.validationErrors.length > 0 ? item.validationErrors.join('; ') : 'Valid'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Original Unedited Data');

    XLSX.writeFile(workbook, `Original_Dataset_Raw_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Trigger browser print for printable project briefs / executive dossiers
   */
  printReport() {
    window.print();
  }
}

window.exportManager = new ExportManager();
