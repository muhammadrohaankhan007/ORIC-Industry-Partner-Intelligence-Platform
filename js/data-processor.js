/**
 * Project-to-Industry Intelligence Platform - Data Processor
 * Handles Excel/CSV parsing, smart column mapping, data validation & data safety.
 */

class DataProcessor {
  constructor() {
    this.rawFileData = null; // Unprocessed sheet matrix
    this.detectedHeaders = [];
    this.columnMapping = {
      courseCode: -1,
      courseTitle: -1,
      projectTitle: -1,
      abstract: -1,
      studentName: -1,
      faculty: -1,
      department: -1,
      supervisor: -1
    };
  }

  /**
   * Parse uploaded file (XLSX, XLS, CSV)
   * @param {File} file
   * @returns {Promise<Object>} { headers, rows, filename }
   */
  async parseSpreadsheetFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS (XLSX) library is not loaded.');
          }

          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          if (!rows || rows.length < 2) {
            throw new Error('The uploaded spreadsheet contains insufficient data.');
          }

          // Determine header row: check row 0 and row 1
          let headerRowIndex = 0;
          let headers = rows[0].map(h => (h || '').toString().trim());

          // If row 0 contains mostly empty or short keys, check row 1
          const nonEmptyHeaders = headers.filter(h => h.length > 0);
          if (rows.length > 1 && nonEmptyHeaders.length < 3) {
            headerRowIndex = 1;
            headers = rows[1].map(h => (h || '').toString().trim());
          }

          this.rawFileData = rows;
          this.headerRowIndex = headerRowIndex;
          this.detectedHeaders = headers;

          // Auto-guess column mappings
          this.autoMapColumns(headers, rows);

          resolve({
            filename: file.name,
            totalRows: rows.length - (headerRowIndex + 1),
            headers,
            sampleRows: rows.slice(headerRowIndex + 1, headerRowIndex + 4),
            mapping: this.columnMapping
          });
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Automatically detect column indices by matching common synonyms
   */
  autoMapColumns(headers, rows) {
    this.columnMapping = {
      courseCode: -1,
      courseTitle: -1,
      projectTitle: -1,
      abstract: -1,
      studentName: -1,
      faculty: -1,
      department: -1,
      supervisor: -1
    };

    const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    headers.forEach((h, idx) => {
      const norm = normalize(h);
      if (this.columnMapping.courseCode === -1 && (norm.includes('coursecode') || norm.includes('ccode') || norm === 'courseid')) {
        this.columnMapping.courseCode = idx;
      } else if (this.columnMapping.courseTitle === -1 && (norm.includes('coursetitle') || norm.includes('cname') || norm === 'course')) {
        this.columnMapping.courseTitle = idx;
      } else if (this.columnMapping.projectTitle === -1 && (norm.includes('projecttitle') || norm.includes('titleofproject') || norm.includes('projectname') || norm === 'title')) {
        this.columnMapping.projectTitle = idx;
      } else if (this.columnMapping.abstract === -1 && (norm.includes('abstract') || norm.includes('summary') || norm.includes('description') || norm.includes('details'))) {
        this.columnMapping.abstract = idx;
      } else if (this.columnMapping.studentName === -1 && (norm.includes('student') || norm.includes('firstname') || norm.includes('studentname') || norm.includes('author'))) {
        this.columnMapping.studentName = idx;
      } else if (this.columnMapping.faculty === -1 && (norm.includes('faculty') || norm.includes('facultyname') || norm.includes('school'))) {
        this.columnMapping.faculty = idx;
      } else if (this.columnMapping.department === -1 && (norm.includes('department') || norm.includes('dept'))) {
        this.columnMapping.department = idx;
      } else if (this.columnMapping.supervisor === -1 && (norm.includes('supervisor') || norm.includes('advisor') || norm.includes('mentor'))) {
        this.columnMapping.supervisor = idx;
      }
    });

    // If abstract column wasn't matched in row 0 headers, inspect row 1 or row content
    if (this.columnMapping.abstract === -1 && rows && rows.length > 2) {
      if (rows[1] && rows[1].some(c => (c || '').toString().toLowerCase().includes('abstract'))) {
        rows[1].forEach((c, idx) => {
          if ((c || '').toString().toLowerCase().includes('abstract')) {
            this.columnMapping.abstract = idx;
          }
        });
      } else {
        // Find column with the longest text average
        let bestCol = -1;
        let maxLen = 0;
        for (let col = 0; col < headers.length; col++) {
          let sum = 0;
          let count = 0;
          for (let r = 2; r < Math.min(rows.length, 12); r++) {
            const val = (rows[r] && rows[r][col] ? rows[r][col].toString() : '');
            sum += val.length;
            count++;
          }
          if (count > 0 && sum / count > maxLen && sum / count > 80) {
            maxLen = sum / count;
            bestCol = col;
          }
        }
        if (bestCol !== -1 && bestCol !== this.columnMapping.projectTitle) {
          this.columnMapping.abstract = bestCol;
        }
      }
    }
  }

  /**
   * Apply mapping and validate the raw dataset before processing
   * Conforms to Requirement 18 (Data Safety & Validation)
   */
  applyMappingAndValidate(mapping) {
    if (!this.rawFileData) {
      throw new Error('No dataset loaded.');
    }

    this.columnMapping = { ...this.columnMapping, ...mapping };
    const rows = this.rawFileData;
    const startIndex = (this.headerRowIndex || 0) + 1;

    const originalDataset = [];
    const validationIssues = {
      missingCourseCode: [],
      missingCourseTitle: [],
      missingProjectTitle: [],
      missingAbstract: [],
      shortAbstract: [],
      duplicates: [],
      invalidRows: []
    };

    const seenTitles = new Map();

    for (let i = startIndex; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0) continue;

      const courseCode = mapping.courseCode !== -1 && r[mapping.courseCode] ? r[mapping.courseCode].toString().trim() : '';
      const courseTitle = mapping.courseTitle !== -1 && r[mapping.courseTitle] ? r[mapping.courseTitle].toString().trim() : '';
      const projectTitle = mapping.projectTitle !== -1 && r[mapping.projectTitle] ? r[mapping.projectTitle].toString().trim() : '';
      const abstract = mapping.abstract !== -1 && r[mapping.abstract] ? r[mapping.abstract].toString().trim() : '';
      const studentName = mapping.studentName !== -1 && r[mapping.studentName] ? r[mapping.studentName].toString().trim() : 'Student Researcher';
      const faculty = mapping.faculty !== -1 && r[mapping.faculty] ? r[mapping.faculty].toString().trim() : 'Pharmacy';
      const department = mapping.department !== -1 && r[mapping.department] ? r[mapping.department].toString().trim() : 'Pharmaceutical Sciences';
      const supervisor = mapping.supervisor !== -1 && r[mapping.supervisor] ? r[mapping.supervisor].toString().trim() : 'Faculty Supervisor';

      const rowId = 'PRJ-' + String(originalDataset.length + 1).padStart(3, '0');
      const item = {
        id: rowId,
        rowIndex: i + 1,
        courseCode,
        courseTitle,
        originalTitle: projectTitle,
        abstract,
        studentName,
        faculty,
        department,
        supervisor,
        validationErrors: []
      };

      // Check validation rules
      let hasError = false;
      if (!projectTitle && !abstract) {
        validationIssues.invalidRows.push(i + 1);
        continue; // Skip entirely empty rows
      }

      if (!courseCode) {
        validationIssues.missingCourseCode.push(rowId);
        item.validationErrors.push('Missing Course Code');
      }
      if (!courseTitle) {
        validationIssues.missingCourseTitle.push(rowId);
        item.validationErrors.push('Missing Course Title');
      }
      if (!projectTitle) {
        validationIssues.missingProjectTitle.push(rowId);
        item.validationErrors.push('Missing Project Title');
        hasError = true;
      }
      if (!abstract) {
        validationIssues.missingAbstract.push(rowId);
        item.validationErrors.push('Missing Abstract');
      } else if (abstract.length < 35) {
        validationIssues.shortAbstract.push(rowId);
        item.validationErrors.push('Very short abstract (<35 chars)');
      }

      // Check duplicates
      const titleKey = projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (titleKey && seenTitles.has(titleKey)) {
        validationIssues.duplicates.push({ rowId, originalRowId: seenTitles.get(titleKey) });
        item.validationErrors.push(`Duplicate title of ${seenTitles.get(titleKey)}`);
      } else if (titleKey) {
        seenTitles.set(titleKey, rowId);
      }

      originalDataset.push(item);
    }

    return {
      originalDataset,
      validationIssues,
      totalCount: originalDataset.length,
      issueCount: Object.values(validationIssues).reduce((acc, arr) => acc + arr.length, 0)
    };
  }
}

window.dataProcessor = new DataProcessor();
