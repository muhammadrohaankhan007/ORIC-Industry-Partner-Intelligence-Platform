/**
 * Project-to-Industry Intelligence Platform - Faculty & Course Intelligence
 * Analyzes curriculum hierarchy: Faculty → Department → Course → Projects (Requirement 16)
 */

class CourseAnalyticsController {
  constructor() {
    this.hierarchy = {};
  }

  /**
   * Build hierarchy and metrics from projects
   * @param {Array} projectsList
   */
  analyze(projectsList = []) {
    const tree = {};

    projectsList.forEach(p => {
      const faculty = p.faculty || 'Faculty of Pharmacy';
      const dept = p.department || 'Pharmaceutical Chemistry';
      const courseKey = (p.courseCode || 'PHM507') + ' - ' + (p.courseTitle || 'Medicinal Chemistry');

      if (!tree[faculty]) tree[faculty] = {};
      if (!tree[faculty][dept]) tree[faculty][dept] = {};
      if (!tree[faculty][dept][courseKey]) {
        tree[faculty][dept][courseKey] = {
          code: p.courseCode,
          title: p.courseTitle,
          totalProjects: 0,
          industryAligned: 0,
          commercializationOps: 0,
          startupOps: 0,
          researchOps: 0,
          projects: []
        };
      }

      const cData = tree[faculty][dept][courseKey];
      cData.totalProjects++;
      cData.projects.push(p);

      if (p.processed && p.analysis) {
        const a = p.analysis;
        const comm = a.commercializationPotential || '';
        const routes = a.commercializationRoute || [];
        const oric = (a.oricPotential || '').toLowerCase();

        if (a.industrySector && a.industrySector !== 'Academic Only') {
          cData.industryAligned++;
        }
        if (comm === 'High' || comm === 'Medium') {
          cData.commercializationOps++;
        }
        if (routes.includes('Startup') || oric.includes('startup')) {
          cData.startupOps++;
        }
        if (comm === 'Primarily Academic' || oric.includes('research')) {
          cData.researchOps++;
        }
      }
    });

    this.hierarchy = tree;
    this.render();
  }

  /**
   * Render Faculty & Course Analysis tables and ORIC recommendations
   */
  render() {
    const container = document.getElementById('facultyCourseAnalysisContainer');
    if (!container) return;

    if (Object.keys(this.hierarchy).length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding: 3rem 1.5rem;">
          <h3 class="text-muted" style="margin-bottom: 0.5rem;">No Curriculum Data Available</h3>
          <p class="text-sm text-muted">Load the Pharmacy dataset or upload a spreadsheet to analyze faculty, departments, and course alignment.</p>
        </div>
      `;
      return;
    }

    let html = '';

    Object.entries(this.hierarchy).forEach(([faculty, depts]) => {
      html += `
        <div class="card" style="margin-bottom: 1.75rem;">
          <div class="card-header" style="background: var(--bg-muted); margin: -1.25rem -1.25rem 1.25rem -1.25rem; padding: 1rem 1.25rem; border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
            <div>
              <span class="badge badge-academic" style="margin-bottom: 0.35rem;">FACULTY</span>
              <h2 class="card-title" style="font-size: 1.25rem;">${faculty}</h2>
            </div>
            <span class="text-xs text-muted font-mono">${Object.keys(depts).length} Departments</span>
          </div>
      `;

      Object.entries(depts).forEach(([dept, courses]) => {
        html += `
          <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                ${dept}
              </h3>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Course Code & Title</th>
                    <th class="text-center">Total Projects</th>
                    <th class="text-center">Industry Aligned</th>
                    <th class="text-center">Commercialization Ops</th>
                    <th class="text-center">Startup Opportunities</th>
                    <th class="text-center">Research Ops</th>
                    <th>ORIC Curriculum Strategic Insight</th>
                  </tr>
                </thead>
                <tbody>
        `;

        Object.entries(courses).forEach(([courseKey, cData]) => {
          const indPct = cData.totalProjects > 0 ? Math.round((cData.industryAligned / cData.totalProjects) * 100) : 0;
          let insight = '';
          let badgeClass = 'badge-medium';

          if (cData.startupOps > 3) {
            insight = '🔥 High startup potential. Recommend connecting course with university tech incubator / ORIC seed grant.';
            badgeClass = 'badge-high';
          } else if (indPct > 60) {
            insight = '💼 Strong industrial relevance. Partner with regional pharma manufacturers for joint Capstone sponsorships.';
            badgeClass = 'badge-high';
          } else if (cData.researchOps > cData.commercializationOps) {
            insight = '🔬 Fundamental research focus. Encourage faculty to add IP / patentability screening modules.';
            badgeClass = 'badge-academic';
          } else {
            insight = '📈 Good foundation. Recommend industry expert guest lectures to elevate commercial readiness.';
          }

          html += `
            <tr>
              <td>
                <div class="font-bold" style="color: var(--primary);">${cData.code || 'N/A'}</div>
                <div class="text-sm font-semibold">${cData.title || 'Course Project'}</div>
              </td>
              <td class="text-center font-mono font-bold">${cData.totalProjects}</td>
              <td class="text-center">
                <span class="badge ${indPct > 50 ? 'badge-high' : 'badge-low'} font-mono">${cData.industryAligned} (${indPct}%)</span>
              </td>
              <td class="text-center font-mono font-bold" style="color: #059669;">${cData.commercializationOps}</td>
              <td class="text-center font-mono font-bold" style="color: #d97706;">${cData.startupOps}</td>
              <td class="text-center font-mono font-bold" style="color: #2563eb;">${cData.researchOps}</td>
              <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 320px;">
                ${insight}
              </td>
            </tr>
          `;
        });

        html += `
                </tbody>
              </table>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    });

    container.innerHTML = html;
  }
}

window.courseAnalyticsController = new CourseAnalyticsController();
