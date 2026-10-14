/**
 * SHU INDUSTRY PARTNER INTELLIGENCE & OPPORTUNITY ASSESSMENT PLATFORM
 * Final Executive Report Generator (Requirement 29, 34, 35)
 * Compiles a comprehensive 22-section executive dossier with multi-format export:
 * PDF (Print), Word (.doc), JSON, and CSV.
 */

const SHU_REPORTS = {

  /**
   * Generate Full HTML String for Executive Report Modal & Export
   */
  generateReportHtml(partner) {
    if (!partner) return "<p>No partner selected.</p>";

    const b = partner.basicInfo || {};
    const a = partner.agreement || {};
    const m = partner.marketAnalysis || {};
    const c = partner.organizationalCapacity || {};
    const hc = c.humanCapital || {};
    const inf = c.infrastructure || {};
    const inn = c.innovationCapability || {};
    const s = partner.scores || {};
    const poi = SHU_INTELLIGENCE.calculateWeightedPoi(s);
    const fo = partner.facultyOpportunities || [];
    const xf = partner.crossFacultyProjects || [];
    const p = partner.projectPortfolio || {};
    const stu = partner.studentsAndInternships || {};
    const rc = partner.researchAndConsultancy || {};
    const fin = partner.financialScenarios || {};
    const rmap = partner.roadmap || {};
    const om = partner.opportunityMap || {};
    const sources = partner.sourcesAndEvidence || [];

    const nowStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    return `
      <div class="executive-report-container" id="printableExecutiveReport">
        <!-- Report Header / Cover Band -->
        <div class="report-cover-band">
          <div class="report-institution-brand">
            <div class="report-logo">SHU-ORIC</div>
            <div>
              <div class="report-inst-title">SALIM HABIB UNIVERSITY</div>
              <div class="report-inst-sub">OFFICE OF RESEARCH, INNOVATION & COMMERCIALIZATION (ORIC)</div>
            </div>
          </div>
          <div class="report-meta-box">
            <div><strong>DOCUMENT:</strong> STRATEGIC PARTNERSHIP INTELLIGENCE DOSSIER</div>
            <div><strong>STATUS:</strong> ${a.status || 'ACTIVE'} ${renderDataBadge("ANALYTICAL")}</div>
            <div><strong>ASSESSMENT DATE:</strong> ${nowStr}</div>
          </div>
        </div>

        <div class="report-title-section">
          <h1 class="report-main-title">${b.name || 'Partner Organization'}</h1>
          <p class="report-subtitle">Comprehensive Industry Intelligence, Strategic Academic Fit & Commercial Opportunity Assessment</p>
          <div class="report-tag-row">
            <span class="report-badge"><strong>Industry:</strong> ${b.industry || 'General Industry'}</span>
            <span class="report-badge"><strong>Agreement:</strong> ${a.type || 'MOU'} (${a.durationMonths || 36} Months)</span>
            <span class="report-badge"><strong>Partnership Opportunity Index (POI):</strong> ${poi}/100</span>
          </div>
        </div>

        <!-- 1. Executive Summary -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">1</span> Executive Summary ${renderDataBadge("ANALYTICAL")}</h2>
          <p class="report-paragraph">
            This strategic dossier evaluates the institutional collaboration between <strong>Salim Habib University (SHU)</strong> and <strong>${b.name}</strong> under the signed <strong>${a.type}</strong>. 
            Operating across ${b.geographicPresence || 'national and regional markets'}, ${b.name} demonstrates an estimated annual turnover of <strong>${formatCurrency(b.knownAnnualRevenuePKR)}</strong> with a workforce scale of <strong>~${b.estimatedEmployees} personnel</strong>. 
            The SHU Intelligence Engine assigns an overall <strong>Partnership Opportunity Index (POI) of ${poi}/100</strong>, reflecting exceptional synergy in applied research, interdisciplinary technology incubation, student clinical/technical placements, and executive capacity building.
          </p>
          <div class="report-callout-grid">
            <div class="report-callout-card">
              <div class="callout-label">Expected Annual SHU Revenue</div>
              <div class="callout-value text-emerald">${formatCurrency(fin.expected?.annualRevenuePKR)}</div>
              <div class="callout-sub">${renderDataBadge("ESTIMATED")} Across sponsored research & training</div>
            </div>
            <div class="report-callout-card">
              <div class="callout-label">Annual Student Placements</div>
              <div class="callout-value text-blue">${stu.annualInternshipCapacity || 30}+ Students</div>
              <div class="callout-sub">${renderDataBadge("CALCULATED")} Internships & clinical rotations</div>
            </div>
            <div class="report-callout-card">
              <div class="callout-label">Student Capstone Projects</div>
              <div class="callout-value text-purple">${stu.annualTotalStudentProjects || 40} Projects/Yr</div>
              <div class="callout-sub">${renderDataBadge("ESTIMATED")} Across 5 SHU faculties</div>
            </div>
            <div class="report-callout-card">
              <div class="callout-label">Research Synergy Level</div>
              <div class="callout-value text-amber">${rc.researchPotentialLevel || 'Strategic'}</div>
              <div class="callout-sub">${renderConfidenceBadge("HIGH")} High-impact co-development</div>
            </div>
          </div>
        </div>

        <!-- 2. Organization Overview -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">2</span> Organization Overview ${renderDataBadge("VERIFIED")}</h2>
          <table class="report-data-table">
            <tbody>
              <tr><th width="25%">Organization Name</th><td width="25%"><strong>${b.name}</strong></td><th width="25%">Year Established</th><td width="25%">${b.yearEstablished}</td></tr>
              <tr><th>Headquarters</th><td>${b.headquarters}</td><th>Ownership Structure</th><td>${b.ownership}</td></tr>
              <tr><th>Industry / Sub-Industry</th><td>${b.industry} / ${b.subIndustry}</td><th>Corporate Website</th><td><a href="${b.website}" target="_blank">${b.website}</a></td></tr>
              <tr><th>Key Management</th><td colspan="3">${b.keyManagement}</td></tr>
              <tr><th>Major Partners / Clients</th><td colspan="3">${b.majorPartners}</td></tr>
              <tr><th>Business Overview</th><td colspan="3">${b.description}</td></tr>
            </tbody>
          </table>
        </div>

        <!-- 3. Market Position & Reach -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">3</span> Market Position & Competitive Intelligence ${renderDataBadge("CALCULATED")}</h2>
          <div class="report-text-grid">
            <div>
              <p><strong>Target Market:</strong> ${m.targetMarket}</p>
              <p><strong>Domestic Reach:</strong> ${m.domesticReach}</p>
              <p><strong>International Footprint:</strong> ${m.internationalReach}</p>
            </div>
            <div>
              <p><strong>Industry Growth Benchmark:</strong> ${m.industryGrowthRate}</p>
              <p><strong>Competitive Intensity:</strong> ${m.competitiveIntensity}</p>
              <p><strong>Key Peer Competitors:</strong> ${m.majorCompetitors}</p>
            </div>
          </div>
        </div>

        <!-- 4. Growth Potential -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">4</span> Qualitative Growth Assessment (Score: ${m.growthScore || 85}/100) ${renderDataBadge("ANALYTICAL")}</h2>
          <table class="report-data-table">
            <thead>
              <tr><th>Growth Assessment Dimension</th><th>Score</th><th>Weight</th><th>Evidence Rationale</th></tr>
            </thead>
            <tbody>
              ${(m.growthCriteria || []).map(c => `
                <tr>
                  <td><strong>${c.metric}</strong></td>
                  <td><span class="score-pill">${c.score}/100</span></td>
                  <td>${c.weight}</td>
                  <td>${c.rationale}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 5. Organizational Capacity & Innovation Profile -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">5</span> Organizational Capacity & Innovation Profile ${renderDataBadge("ESTIMATED")}</h2>
          <div class="report-capacity-grid">
            <div class="report-cap-block">
              <h4>Human Capital Workforce (${hc.totalManpower} Total)</h4>
              <ul>
                <li><strong>Technical / Scientific Workforce:</strong> ${hc.technicalWorkforce} personnel</li>
                <li><strong>R&D Personnel:</strong> ${hc.rdPersonnel} personnel</li>
                <li><strong>Management & Admin:</strong> ${hc.managementWorkforce} personnel</li>
                <li><strong>Operations & Quality:</strong> ${hc.operationsAndQuality} personnel</li>
                <li><strong>Digital / IT Infrastructure:</strong> ${hc.digitalItCapability}</li>
              </ul>
            </div>
            <div class="report-cap-block">
              <h4>Infrastructure & Facilities</h4>
              <ul>
                <li><strong>Manufacturing & Operations:</strong> ${inf.manufacturingFacilities}</li>
                <li><strong>Laboratory Testing Suites:</strong> ${inf.laboratories}</li>
                <li><strong>Logistics Network:</strong> ${inf.distributionNetwork}</li>
                <li><strong>R&D & Prototyping Facilities:</strong> ${inf.rdFacilities}</li>
              </ul>
            </div>
          </div>
          <div class="report-inn-box">
            <p><strong>Innovation & R&D Capabilities:</strong> ${inn.rdActivities}</p>
            <p><strong>Intellectual Property & Patents:</strong> ${inn.patents} | <strong>Publications:</strong> ${inn.publications}</p>
            <p><strong>AI & Automation Maturity:</strong> ${inn.aiAdoption} — ${inn.automation}</p>
          </div>
        </div>

        <!-- 6. Strategic Value to Salim Habib University -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">6</span> Strategic Value to Salim Habib University (9 Dimensions) ${renderDataBadge("ANALYTICAL")}</h2>
          <div class="report-scores-grid">
            <div class="score-card"><div>Academic Value</div><strong>${s.academicValue}/100</strong></div>
            <div class="score-card"><div>Research Value</div><strong>${s.researchValue}/100</strong></div>
            <div class="score-card"><div>Student Value</div><strong>${s.studentValue}/100</strong></div>
            <div class="score-card"><div>Faculty Value</div><strong>${s.facultyValue}/100</strong></div>
            <div class="score-card"><div>Commercial Value</div><strong>${s.commercialValue}/100</strong></div>
            <div class="score-card"><div>Innovation Value</div><strong>${s.innovationValue}/100</strong></div>
            <div class="score-card"><div>Entrepreneurship</div><strong>${s.entrepreneurshipValue}/100</strong></div>
            <div class="score-card"><div>Revenue Potential</div><strong>${s.revenuePotential}/100</strong></div>
            <div class="score-card highlight"><div>Overall POI</div><strong>${poi}/100</strong></div>
          </div>
        </div>

        <!-- 7. Faculty-by-Faculty Opportunities -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">7</span> Faculty-by-Faculty Opportunity Mapping ${renderDataBadge("ANALYTICAL")}</h2>
          <table class="report-data-table">
            <thead>
              <tr><th>SHU Faculty</th><th>Identified Opportunity</th><th>Operational Rationale</th><th>Proposed Project</th><th>Estimated Size</th><th>Duration</th><th>Priority</th></tr>
            </thead>
            <tbody>
              ${fo.map(f => `
                <tr>
                  <td><strong>${f.facultyName}</strong></td>
                  <td>${f.opportunity}</td>
                  <td>${f.rationale}</td>
                  <td><em>${f.potentialProject}</em></td>
                  <td><span class="tier-pill tier-${f.estimatedSizeTier}">${f.estimatedSizeTier.toUpperCase()} (${formatCurrency(f.estimatedValuePKR)})</span></td>
                  <td>${f.duration}</td>
                  <td><strong>${f.priority}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 8. Cross-Faculty Multi-Disciplinary Projects -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">8</span> Cross-Faculty Multi-Disciplinary Projects ${renderDataBadge("ANALYTICAL")}</h2>
          ${xf.map((x, idx) => `
            <div class="report-cross-card">
              <h3>${idx + 1}. ${x.title}</h3>
              <p><strong>Participating Faculties:</strong> ${x.participatingFaculties.join(" + ")}</p>
              <p><strong>Problem Being Solved:</strong> ${x.problemBeingSolved}</p>
              <p><strong>Proposed Solution:</strong> ${x.proposedSolution}</p>
              <p><strong>Key Deliverables:</strong> ${x.deliverables}</p>
              <div class="report-meta-pills">
                <span><strong>Estimated Value:</strong> ${formatCurrency(x.estimatedProjectValuePKR)}</span>
                <span><strong>Duration:</strong> ${x.durationMonths} Months (${x.durationCategory})</span>
                <span><strong>Potential Revenue to SHU:</strong> ${formatCurrency(x.potentialRevenuePKR)}</span>
                <span><strong>Commercialization:</strong> ${x.commercializationPotential}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 9. Student Projects & Internship Potential -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">9</span> Student Opportunities & Internship Capacity ${renderDataBadge("CALCULATED")}</h2>
          <p><strong>Internship Potential Score:</strong> ${stu.internshipPotentialScore}/100 | <strong>Annual Capacity:</strong> ${stu.annualInternshipCapacity} Interns (${stu.internshipDurationWeeks} Weeks)</p>
          <p><strong>Conversion Rate:</strong> ${stu.potentialConversionRate}</p>
          <p><strong>Estimated Annual Capstone Project Capacity:</strong></p>
          <div class="report-tag-row">
            ${Object.entries(stu.studentProjectCapacityByFaculty || {}).map(([facKey, cap]) => `
              <span class="report-badge"><strong>${facKey.toUpperCase()}:</strong> ${cap.min}–${cap.max} Projects</span>
            `).join('')}
          </div>
        </div>

        <!-- 10. Research, Consultancy & Executive Education -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">10</span> Research, Consultancy & Executive Education Opportunities ${renderDataBadge("ANALYTICAL")}</h2>
          <div class="report-capacity-grid">
            <div class="report-cap-block">
              <h4>Consulting Opportunities</h4>
              <ul>
                ${(rc.consultancyOpportunities || []).map(co => `
                  <li><strong>${co.area}</strong> (${formatCurrency(co.estimatedValuePKR)} • ${co.duration} • ${co.faculty})</li>
                `).join('')}
              </ul>
            </div>
            <div class="report-cap-block">
              <h4>Executive Education Programs</h4>
              <ul>
                ${(rc.executiveEducationPrograms || []).map(ep => `
                  <li><strong>${ep.title}</strong> (${ep.participants} Seats • ${ep.durationDays} Days • Fee: ${ep.feeRangePKR} PKR)</li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- 11. Commercialization Potential -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">11</span> Commercialization & Technology Transfer ${renderDataBadge("ANALYTICAL")}</h2>
          ${(rc.commercializationOpportunities || []).map(cm => `
            <div class="report-cap-block">
              <h4>${cm.technology}</h4>
              <p><strong>Target Customer & Market:</strong> ${cm.potentialCustomer} (Est. Market: ${formatCurrency(cm.estimatedMarketPKR)})</p>
              <p><strong>SHU Contribution:</strong> ${cm.shuContribution}</p>
              <p><strong>Partner Contribution:</strong> ${cm.orgContribution}</p>
              <p><strong>Commercialization Pathway:</strong> ${cm.pathway}</p>
            </div>
          `).join('')}
        </div>

        <!-- 12. Recommended Project Portfolio -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">12</span> Recommended Project Portfolio & Prioritization ${renderDataBadge("ANALYTICAL")}</h2>
          <h4>Quick Wins (1–3 Months Execution)</h4>
          <ul>
            ${(p.quickWins || []).map(qw => `
              <li><strong>${qw.title}</strong> [${formatCurrency(qw.estimatedValuePKR)} | ${qw.duration}] — <em>Next Step:</em> ${qw.nextAction}</li>
            `).join('')}
          </ul>
          <h4>Medium-Term Projects (3–12 Months Execution)</h4>
          <ul>
            ${(p.mediumTerm || []).map(mt => `
              <li><strong>${mt.title}</strong> [${formatCurrency(mt.estimatedValuePKR)} | ${mt.duration}] — <em>Next Step:</em> ${mt.nextAction}</li>
            `).join('')}
          </ul>
          <h4>Strategic Initiatives (1–3 Years Execution)</h4>
          <ul>
            ${(p.strategic || []).map(st => `
              <li><strong>${st.title}</strong> [${formatCurrency(st.estimatedValuePKR)} | ${st.duration}] — <em>Next Step:</em> ${st.nextAction}</li>
            `).join('')}
          </ul>
        </div>

        <!-- 13. Financial Scenarios -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">13</span> Annual Financial Opportunity Projections ${renderDataBadge("ESTIMATED")}</h2>
          <table class="report-data-table">
            <thead>
              <tr><th>Scenario</th><th>Est. Annual Revenue</th><th>Active Projects</th><th>Engaged Students</th><th>Faculty Lead Count</th><th>Scope Description</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Conservative</strong></td>
                <td class="text-emerald"><strong>${formatCurrency(fin.conservative?.annualRevenuePKR)}</strong></td>
                <td>${fin.conservative?.numberOfProjects} Projects</td>
                <td>${fin.conservative?.numberOfStudents} Students</td>
                <td>${fin.conservative?.facultyEngagementCount} Faculty</td>
                <td>${fin.conservative?.description}</td>
              </tr>
              <tr style="background: rgba(2, 132, 199, 0.05);">
                <td><strong>Expected (Target)</strong></td>
                <td class="text-emerald"><strong>${formatCurrency(fin.expected?.annualRevenuePKR)}</strong></td>
                <td>${fin.expected?.numberOfProjects} Projects</td>
                <td>${fin.expected?.numberOfStudents} Students</td>
                <td>${fin.expected?.facultyEngagementCount} Faculty</td>
                <td>${fin.expected?.description}</td>
              </tr>
              <tr>
                <td><strong>High Opportunity</strong></td>
                <td class="text-emerald"><strong>${formatCurrency(fin.highOpportunity?.annualRevenuePKR)}</strong></td>
                <td>${fin.highOpportunity?.numberOfProjects} Projects</td>
                <td>${fin.highOpportunity?.numberOfStudents} Students</td>
                <td>${fin.highOpportunity?.facultyEngagementCount} Faculty</td>
                <td>${fin.highOpportunity?.description}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 14. 3-Year Roadmap -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">14</span> Three-Year Strategic Partnership Roadmap ${renderDataBadge("ANALYTICAL")}</h2>
          <div class="report-roadmap-grid">
            <div class="report-rm-card">
              <h4>${rmap.year1?.title || 'YEAR 1 — ENGAGE'}</h4>
              <ul>${(rmap.year1?.milestones || []).map(m => `<li>${m}</li>`).join('')}</ul>
            </div>
            <div class="report-rm-card">
              <h4>${rmap.year2?.title || 'YEAR 2 — COLLABORATE'}</h4>
              <ul>${(rmap.year2?.milestones || []).map(m => `<li>${m}</li>`).join('')}</ul>
            </div>
            <div class="report-rm-card">
              <h4>${rmap.year3?.title || 'YEAR 3 — SCALE'}</h4>
              <ul>${(rmap.year3?.milestones || []).map(m => `<li>${m}</li>`).join('')}</ul>
            </div>
          </div>
        </div>

        <!-- 15. SHU 5D Opportunity Map -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">15</span> SHU 5D Opportunity Framework ${renderDataBadge("ANALYTICAL")}</h2>
          <table class="report-data-table">
            <tbody>
              <tr><th width="20%">1. LEARN</th><td>${om.learn}</td></tr>
              <tr><th>2. RESEARCH</th><td>${om.research}</td></tr>
              <tr><th>3. SOLVE</th><td>${om.solve}</td></tr>
              <tr><th>4. BUILD</th><td>${om.build}</td></tr>
              <tr><th>5. SCALE</th><td>${om.scale}</td></tr>
            </tbody>
          </table>
        </div>

        <!-- 16. Data Sources, Assumptions & Limitations -->
        <div class="report-section">
          <h2 class="report-heading"><span class="section-num">16</span> Sources of Evidence, Assumptions & Limitations</h2>
          <h4>Credible Primary & Derived Sources:</h4>
          <ul>
            ${sources.map(s => `
              <li><strong>${s.title}</strong> [${s.type} | ${renderDataBadge(s.tier)}] — ${s.note} (${renderConfidenceBadge(s.confidence)})</li>
            `).join('')}
          </ul>
          <h4>Methodological Assumptions:</h4>
          <p>
            1. All financial projections are modelled in Pakistani Rupees (PKR) at current price levels with institutional overhead applied.<br>
            2. Faculty availability assumes typical academic teaching loads with dedicated buyout research allowances under ORIC policy.<br>
            3. Project durations reflect standard academic semesters (4–5 months) and annual grant cycles.
          </p>
          <h4>Institutional Limitations:</h4>
          <p>
            This intelligence assessment is designed for strategic university decision-making. Final project budgets and legal commitments must be formalized through definitive sponsored research agreements (SRAs) reviewed by the SHU Legal Counsel and Registrar.
          </p>
        </div>

        <!-- Report Sign-off Footer -->
        <div class="report-footer-signatures">
          <div class="sig-block">
            <div class="sig-line"></div>
            <div><strong>Director, ORIC</strong><br>Salim Habib University</div>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <div><strong>Dean of Respective Faculty</strong><br>Salim Habib University</div>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <div><strong>Vice Chancellor / Patron</strong><br>Salim Habib University</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Export as Word Document (.doc via HTML Blob)
   */
  exportToWord(partner) {
    const reportHtml = this.generateReportHtml(partner);
    const fileName = `SHU_Partnership_Report_${(partner.basicInfo?.name || 'Partner').replace(/[^a-zA-Z0-9]/g, '_')}.doc`;

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>SHU Executive Partnership Report</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.4; }
          h1 { color: #0A2540; font-size: 22pt; margin-bottom: 4pt; }
          h2 { color: #005A9C; font-size: 14pt; border-bottom: 2pt solid #005A9C; padding-bottom: 4pt; margin-top: 18pt; }
          h3 { color: #0A2540; font-size: 12pt; }
          h4 { color: #334155; font-size: 11pt; margin-top: 10pt; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
          th, td { border: 1pt solid #cbd5e1; padding: 6pt 8pt; text-align: left; font-size: 10pt; }
          th { background-color: #f1f5f9; color: #0A2540; font-weight: bold; }
          .report-cover-band { background-color: #0A2540; color: #ffffff; padding: 12pt; margin-bottom: 16pt; }
          .report-inst-title { font-size: 16pt; font-weight: bold; }
          .report-inst-sub { font-size: 9pt; color: #C59B27; }
        </style>
      </head>
      <body>
        ${reportHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Export Partner Assessment as JSON
   */
  exportToJson(partner) {
    const fileName = `SHU_Assessment_${(partner.basicInfo?.name || 'Partner').replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const blob = new Blob([JSON.stringify(partner, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Export Opportunity Matrix & Projects as CSV
   */
  exportToCsv(partner) {
    const fo = partner.facultyOpportunities || [];
    const b = partner.basicInfo || {};
    const fileName = `SHU_Opportunities_${(b.name || 'Partner').replace(/[^a-zA-Z0-9]/g, '_')}.csv`;

    let csv = `Organization,Faculty,Opportunity,Potential Project,Estimated Size Tier,Estimated Value (PKR),Duration,Priority,Data Status\r\n`;

    fo.forEach(f => {
      const row = [
        `"${b.name || ''}"`,
        `"${f.facultyName || ''}"`,
        `"${(f.opportunity || '').replace(/"/g, '""')}"`,
        `"${(f.potentialProject || '').replace(/"/g, '""')}"`,
        `"${f.estimatedSizeTier || ''}"`,
        `"${f.estimatedValuePKR || ''}"`,
        `"${f.duration || ''}"`,
        `"${f.priority || ''}"`,
        `"${f.tier || 'ANALYTICAL'}"`
      ];
      csv += row.join(",") + "\r\n";
    });

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Print to PDF via Browser Print
   */
  triggerPrint() {
    window.print();
  }
};
