/**
 * Project-to-Industry Intelligence Platform - Dashboard & Visual Analytics
 * Renders high-impact interactive visual charts and real-time ORIC portfolio metrics.
 */

class DashboardController {
  constructor() {
    this.stats = {
      totalProjects: 0,
      processedCount: 0,
      coursesCount: 0,
      facultiesCount: 0,
      industryAligned: 0,
      highCommercialization: 0,
      startupPotential: 0,
      researchPotential: 0,
      socialImpact: 0,
      sectorBreakdown: {},
      commBreakdown: { High: 0, Medium: 0, Low: 0, 'Primarily Academic': 0, 'Primarily Social Impact': 0 },
      sdgBreakdown: {},
      courseBreakdown: {}
    };
  }

  /**
   * Recalculate stats from processed projects dataset
   * @param {Array} projectsList - List of processed projects
   */
  updateStats(projectsList = []) {
    const total = projectsList.length;
    const courses = new Set();
    const faculties = new Set();
    let industryAligned = 0;
    let highComm = 0;
    let startupCount = 0;
    let researchCount = 0;
    let socialCount = 0;
    let processedCount = 0;

    const sectorMap = {};
    const commMap = { High: 0, Medium: 0, Low: 0, 'Primarily Academic': 0, 'Primarily Social Impact': 0 };
    const sdgMap = {};
    const courseMap = {};

    projectsList.forEach(p => {
      if (p.courseCode) courses.add(p.courseCode);
      if (p.faculty) faculties.add(p.faculty);
      if (p.courseTitle && !courseMap[p.courseTitle]) {
        courseMap[p.courseTitle] = { code: p.courseCode, count: 0 };
      }
      if (p.courseTitle) courseMap[p.courseTitle].count++;

      if (p.processed && p.analysis) {
        processedCount++;
        const a = p.analysis;

        // Sector breakdown
        const sector = a.industrySector || 'Other';
        sectorMap[sector] = (sectorMap[sector] || 0) + 1;

        // Industry alignment
        if (sector && sector !== 'Academic Only') {
          industryAligned++;
        }

        // Commercialization
        const comm = a.commercializationPotential || 'Medium';
        if (commMap[comm] !== undefined) {
          commMap[comm]++;
        } else {
          commMap[comm] = (commMap[comm] || 0) + 1;
        }

        if (comm === 'High') highComm++;
        if (comm === 'Primarily Social Impact') socialCount++;

        // Startup & ORIC categorization
        const routes = a.commercializationRoute || [];
        const oric = (a.oricPotential || '').toLowerCase();
        if (routes.includes('Startup') || oric.includes('startup')) {
          startupCount++;
        }
        if (oric.includes('research') || comm === 'Primarily Academic') {
          researchCount++;
        }

        // SDGs
        const sdgs = a.sdgAlignment || [];
        sdgs.forEach(s => {
          sdgMap[s] = (sdgMap[s] || 0) + 1;
        });
      }
    });

    this.stats = {
      totalProjects: total,
      processedCount,
      coursesCount: courses.size || 1,
      facultiesCount: faculties.size || 1,
      industryAligned,
      highCommercialization: highComm,
      startupPotential: startupCount,
      researchPotential: researchCount,
      socialImpact: socialCount,
      sectorBreakdown: sectorMap,
      commBreakdown: commMap,
      sdgBreakdown: sdgMap,
      courseBreakdown: courseMap
    };

    this.renderKPIs();
    this.renderCharts();
  }

  /**
   * Render top KPI cards
   */
  renderKPIs() {
    const s = this.stats;
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('kpiTotalProjects', s.totalProjects);
    setText('kpiCourses', s.coursesCount);
    setText('kpiIndustryAligned', s.industryAligned);
    setText('kpiHighComm', s.highCommercialization);
    setText('kpiStartup', s.startupPotential);
    setText('kpiResearch', s.researchPotential);
    setText('kpiSocialImpact', s.socialImpact);

    // Update nav badge count
    setText('navProjectCount', s.totalProjects);
  }

  /**
   * Render all dashboard charts
   */
  renderCharts() {
    this.renderIndustrySectorsChart();
    this.renderCommercializationDonut();
    this.renderSDGGrid();
    this.renderCourseDistributionChart();
  }

  /**
   * 1. Industry Sectors Horizontal Bar Chart
   */
  renderIndustrySectorsChart() {
    const container = document.getElementById('chartIndustrySectors');
    if (!container) return;

    const entries = Object.entries(this.stats.sectorBreakdown).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      container.innerHTML = `<div class="text-center text-muted" style="padding: 2.5rem 0;">No processed projects yet. Load data and start processing to view industry sector distribution.</div>`;
      return;
    }

    const maxVal = Math.max(...entries.map(e => e[1])) || 1;
    let html = '<div class="bar-chart">';
    entries.forEach(([sector, count]) => {
      const pct = Math.round((count / maxVal) * 100);
      html += `
        <div class="bar-item">
          <div class="bar-label-group">
            <span>${sector}</span>
            <span class="font-mono text-muted">${count} projects</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * 2. Commercialization Donut SVG Chart
   */
  renderCommercializationDonut() {
    const container = document.getElementById('chartCommercialization');
    if (!container) return;

    const comm = this.stats.commBreakdown;
    const total = Object.values(comm).reduce((a, b) => a + b, 0);

    if (total === 0) {
      container.innerHTML = `<div class="text-center text-muted" style="padding: 2.5rem 0;">No commercialization ratings calculated yet.</div>`;
      return;
    }

    const colors = {
      High: '#10b981',
      Medium: '#f59e0b',
      Low: '#64748b',
      'Primarily Academic': '#3b82f6',
      'Primarily Social Impact': '#8b5cf6'
    };

    // Calculate SVG donut segments
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;
    let svgSegments = '';

    Object.entries(comm).forEach(([label, val]) => {
      if (val === 0) return;
      const pct = val / total;
      const strokeDash = pct * circumference;
      const offset = circumference - accumulatedAngle;
      const color = colors[label] || '#94a3b8';

      svgSegments += `
        <circle cx="100" cy="100" r="${radius}"
          fill="transparent"
          stroke="${color}"
          stroke-width="26"
          stroke-dasharray="${strokeDash} ${circumference}"
          stroke-dashoffset="${-accumulatedAngle}"
          style="transition: stroke-dasharray 0.6s ease;"
        />
      `;
      accumulatedAngle += strokeDash;
    });

    let legendHtml = '<div style="display: flex; flex-direction: column; gap: 0.5rem; justify-content: center;">';
    Object.entries(comm).forEach(([label, val]) => {
      const pct = Math.round((val / total) * 100);
      const color = colors[label] || '#94a3b8';
      legendHtml += `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; font-size: 0.85rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; display: inline-block;"></span>
            <span>${label}</span>
          </div>
          <span class="font-mono font-bold">${val} <span class="text-muted text-xs">(${pct}%)</span></span>
        </div>
      `;
    });
    legendHtml += '</div>';

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 1.5rem;">
        <div style="position: relative; width: 170px; height: 170px;">
          <svg viewBox="0 0 200 200" style="transform: rotate(-90deg); width: 100%; height: 100%;">
            ${svgSegments}
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span class="font-bold text-2xl font-mono">${total}</span>
            <span class="text-xs text-muted">Projects</span>
          </div>
        </div>
        ${legendHtml}
      </div>
    `;
  }

  /**
   * 3. SDG Alignment Grid
   */
  renderSDGGrid() {
    const container = document.getElementById('chartSDGAlignment');
    if (!container) return;

    const sdgMap = this.stats.sdgBreakdown;
    const entries = Object.entries(sdgMap).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      container.innerHTML = `<div class="text-center text-muted" style="padding: 2.5rem 0;">No SDG alignments mapped yet.</div>`;
      return;
    }

    const sdgColorMap = {
      'SDG 3': '#4c9f38',
      'SDG 4': '#c5192d',
      'SDG 8': '#a21942',
      'SDG 9': '#fd6925',
      'SDG 11': '#fd9d24',
      'SDG 12': '#bf8b2e',
      'SDG 13': '#3f7e44',
      'SDG 14': '#0a97d9',
      'SDG 17': '#19486a'
    };

    let html = '<div class="sdg-grid">';
    entries.forEach(([sdgText, count]) => {
      const match = sdgText.match(/SDG\s*(\d+)/i);
      const num = match ? 'SDG ' + match[1] : 'SDG';
      const name = sdgText.replace(/SDG\s*\d+\s*[—\-–]\s*/i, '');
      const color = sdgColorMap[num] || '#2563eb';

      html += `
        <div class="sdg-badge-tile" style="background-color: ${color};">
          <span class="sdg-tile-number">${num}</span>
          <span class="sdg-tile-count">${count}</span>
          <span class="sdg-tile-name">${name}</span>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * 4. Course Distribution Bar Chart
   */
  renderCourseDistributionChart() {
    const container = document.getElementById('chartCourseDistribution');
    if (!container) return;

    const entries = Object.entries(this.stats.courseBreakdown).sort((a, b) => b[1].count - a[1].count);
    if (entries.length === 0) {
      container.innerHTML = `<div class="text-center text-muted" style="padding: 2.5rem 0;">No course breakdown available.</div>`;
      return;
    }

    const maxVal = Math.max(...entries.map(e => e[1].count)) || 1;
    let html = '<div class="bar-chart">';
    entries.slice(0, 6).forEach(([title, data]) => {
      const pct = Math.round((data.count / maxVal) * 100);
      html += `
        <div class="bar-item">
          <div class="bar-label-group">
            <span><strong class="font-mono text-xs" style="color: var(--primary);">${data.code || ''}</strong> - ${title}</span>
            <span class="font-mono text-muted">${data.count} projects</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }
}

window.dashboardController = new DashboardController();
