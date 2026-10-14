/**
 * SHU INDUSTRY PARTNER INTELLIGENCE & OPPORTUNITY ASSESSMENT PLATFORM
 * Main Application Coordinator & UI Controller
 */

const SHU_APP = {
  currentView: "viewDashboard",
  activePartner: null,

  /**
   * Application Initialization
   */
  init() {
    console.log("Initializing SHU Industry Partner Intelligence Platform...");

    // 1. Initialize Storage and default data
    SHU_STORAGE.init();

    // 2. Initialize Live PSX Market Data Engine
    if (typeof SHU_LIVE_PSX !== "undefined") {
      SHU_LIVE_PSX.init();
      SHU_LIVE_PSX.subscribe(() => {
        this.updateLivePsxDisplay();
      });
    }

    // 3. Load active partner
    this.activePartner = SHU_STORAGE.getActivePartner();

    // 4. Setup Navigation & UI event listeners
    this.setupNavigation();
    this.setupHeaderActions();
    this.setupPartnerDropdown();
    this.setupPsxTickerMarquee();
    this.setupDatabaseFilters();
    this.setupCalculators();
    this.setupForms();
    this.setupAdminSettings();

    // 5. Render initial view
    this.renderActivePartner();
    this.navigateTo(this.currentView);
  },

  /**
   * Setup Navigation Links
   */
  setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = link.getAttribute("data-view");
        if (targetView) {
          this.navigateTo(targetView);
          // Close mobile sidebar if open
          document.querySelector(".app-sidebar")?.classList.remove("open");
        }
      });
    });

    // Mobile sidebar toggle
    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".app-sidebar");
    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
      });
    }
  },

  /**
   * Switch View
   */
  navigateTo(viewId) {
    this.currentView = viewId;

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("data-view") === viewId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Show active section
    document.querySelectorAll(".view-section").forEach(sec => {
      if (sec.id === viewId) {
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
      }
    });

    // Render view-specific content if needed
    if (viewId === "viewDashboard") {
      this.renderDashboard();
    } else if (viewId === "viewComparison") {
      this.renderComparisonView();
    } else if (viewId === "viewDatabase") {
      this.renderDatabaseTable();
    } else if (viewId === "viewFacultyHeatmap") {
      this.renderHeatmap();
    } else if (viewId === "viewSettings") {
      this.loadSettingsForm();
    }

    // Scroll main viewport to top
    const mainViewport = document.querySelector(".app-main");
    if (mainViewport) mainViewport.scrollTop = 0;
  },

  /**
   * Setup Header Actions (Partner select, currency, theme, generate report)
   */
  setupHeaderActions() {
    // Partner Dropdown in Header
    const select = document.getElementById("headerPartnerSelect");
    if (select) {
      select.addEventListener("change", (e) => {
        const id = e.target.value;
        if (id) {
          SHU_STORAGE.setActivePartnerId(id);
          this.activePartner = SHU_STORAGE.getActivePartner();
          this.renderActivePartner();
          this.showToast(`Switched active partner to: ${this.activePartner?.basicInfo?.name}`);
        }
      });
    }

    // Currency Switcher Buttons
    document.querySelectorAll(".currency-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".currency-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const curr = btn.getAttribute("data-curr");
        SHU_CONFIG.activeCurrency = curr;
        this.renderActivePartner();
        this.showToast(`Currency updated to ${curr}`);
      });
    });

    // Theme Toggle (Light / Dark)
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        const next = current === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        themeBtn.innerHTML = next === "dark" ?
          `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light` :
          `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark`;
        // Re-render active charts with updated theme colors
        this.renderCharts();
      });
    }

    // Generate Executive Report Button
    const reportBtn = document.getElementById("btnGenerateExecutiveReport");
    if (reportBtn) {
      reportBtn.addEventListener("click", () => {
        this.openReportModal();
      });
    }

    // Modal Close handlers
    document.querySelectorAll(".modal-close-trigger").forEach(el => {
      el.addEventListener("click", () => {
        document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
      });
    });

    // Report Export Buttons
    document.getElementById("btnExportWord")?.addEventListener("click", () => {
      SHU_REPORTS.exportToWord(this.activePartner);
      this.showToast("Word document download initiated.");
    });
    document.getElementById("btnExportJson")?.addEventListener("click", () => {
      SHU_REPORTS.exportToJson(this.activePartner);
      this.showToast("JSON assessment file downloaded.");
    });
    document.getElementById("btnExportCsv")?.addEventListener("click", () => {
      SHU_REPORTS.exportToCsv(this.activePartner);
      this.showToast("CSV opportunity matrix downloaded.");
    });
    document.getElementById("btnPrintPdf")?.addEventListener("click", () => {
      SHU_REPORTS.triggerPrint();
    });

    // Live PSX Sync Button
    const syncBtn = document.getElementById("btnSyncLivePsx");
    if (syncBtn) {
      syncBtn.addEventListener("click", async () => {
        syncBtn.style.opacity = "0.7";
        const svgIcon = syncBtn.querySelector("svg");
        if (svgIcon) svgIcon.classList.add("spin-animation");
        try {
          if (typeof SHU_LIVE_PSX !== "undefined") {
            const res = await SHU_LIVE_PSX.syncAll();
            this.updateLivePsxDisplay();
            this.renderDatabaseTable();
            this.showToast(`🟢 PSX Live Data Synced: ${res.count} active tickers updated at ${res.timestamp}`);
          }
        } catch (e) {
          console.error("PSX sync error:", e);
        } finally {
          syncBtn.style.opacity = "1";
          if (svgIcon) svgIcon.classList.remove("spin-animation");
        }
      });
    }
  },

  /**
   * Populate Partner Dropdown in Top Header (Picture 3 Fix)
   * Lists a wide range of PSX-listed and premier partner enterprises grouped by sector
   */
  setupPartnerDropdown() {
    const select = document.getElementById("headerPartnerSelect");
    if (!select) return;
    const partners = SHU_STORAGE.getAllPartners();
    const activeId = SHU_STORAGE.getActivePartnerId();

    // Grouping by Sector for clean dropdown navigation (Picture 3 Fix)
    const groups = {
      "🏢 Pharmaceuticals & Healthcare (PSX)": [],
      "💻 Technology, Software & AI (PSX)": [],
      "🧪 Chemicals, Synthetics & Polymers (PSX)": [],
      "🏦 Commercial Banking & FinTech (PSX)": [],
      "🌐 Conglomerates, Energy & Agri (PSX)": [],
      "📋 Other Partner Organizations": []
    };

    partners.forEach(p => {
      const ind = (p.basicInfo?.industry || "").toLowerCase();
      const sub = (p.basicInfo?.subIndustry || "").toLowerCase();
      if (ind.includes("pharma") || ind.includes("health") || sub.includes("pharma") || sub.includes("hospital")) {
        groups["🏢 Pharmaceuticals & Healthcare (PSX)"].push(p);
      } else if (ind.includes("tech") || ind.includes("digital") || ind.includes("hardware") || sub.includes("software") || sub.includes("cloud") || sub.includes("automation")) {
        groups["💻 Technology, Software & AI (PSX)"].push(p);
      } else if (ind.includes("chem") || ind.includes("synthetic") || sub.includes("polymer") || sub.includes("chlor")) {
        groups["🧪 Chemicals, Synthetics & Polymers (PSX)"].push(p);
      } else if (ind.includes("bank") || ind.includes("financ") || sub.includes("banking") || sub.includes("sukuk")) {
        groups["🏦 Commercial Banking & FinTech (PSX)"].push(p);
      } else if (ind.includes("conglomerate") || ind.includes("agri") || sub.includes("fertilizer") || sub.includes("energy")) {
        groups["🌐 Conglomerates, Energy & Agri (PSX)"].push(p);
      } else {
        groups["📋 Other Partner Organizations"].push(p);
      }
    });

    let html = '';
    for (const [groupTitle, orgs] of Object.entries(groups)) {
      if (orgs.length > 0) {
        html += `<optgroup label="${groupTitle}">`;
        orgs.forEach(p => {
          const tickerText = p.ticker ? `${p.ticker} — ` : '';
          const name = p.basicInfo?.name || 'Untitled Organization';
          const agreementTag = p.agreement?.type ? `(${p.agreement.type})` : (p.isPsxListed ? '(PSX Listed)' : '');
          html += `<option value="${p.id}" ${p.id === activeId ? 'selected' : ''}>
            ${tickerText}${name} ${agreementTag}
          </option>`;
        });
        html += `</optgroup>`;
      }
    }

    select.innerHTML = html;
  },

  /**
   * Setup Live Pakistan Stock Exchange Ticker Marquee
   */
  setupPsxTickerMarquee() {
    const track = document.getElementById("psxTickerTrack");
    if (!track || typeof SHU_LIVE_PSX === "undefined") return;

    const quotes = SHU_LIVE_PSX.getAllQuotes();
    track.innerHTML = quotes.map(q => {
      const isUp = q.change >= 0;
      const arrow = isUp ? "▲" : "▼";
      const changeClass = isUp ? "psx-ticker-up" : "psx-ticker-down";
      const sign = isUp ? "+" : "";

      return `
        <span class="psx-ticker-item" title="${q.name} (PSX: ${q.ticker}) | Day High: ₨${q.dayHigh} | Day Low: ₨${q.dayLow} | Vol: ${q.volume.toLocaleString()}" onclick="SHU_APP.selectByTicker('${q.ticker}')">
          <span class="psx-ticker-symbol">${q.ticker}</span>
          <span class="psx-ticker-price">₨${q.price.toFixed(2)}</span>
          <span class="${changeClass}">${arrow} ${sign}${q.changePercent.toFixed(2)}%</span>
        </span>
      `;
    }).join('');
  },

  /**
   * Update all Live PSX indicators across views
   */
  updateLivePsxDisplay() {
    this.setupPsxTickerMarquee();
    if (this.currentView === "viewDatabase") {
      this.renderDatabaseTable();
    }
  },

  /**
   * Quick select partner by PSX ticker
   */
  selectByTicker(ticker) {
    const partners = SHU_STORAGE.getAllPartners();
    const match = partners.find(p => p.ticker === ticker);
    if (match) {
      this.selectPartner(match.id);
    } else {
      this.navigateTo("viewDatabase");
      const searchInp = document.getElementById("dbSearchInput");
      if (searchInp) {
        searchInp.value = ticker;
        this.renderDatabaseTable();
      }
    }
  },

  /**
   * Render the entire active partner data across all panels
   */
  renderActivePartner() {
    const p = this.activePartner;
    if (!p) return;

    // 1. Watermark banner (Requirement 38)
    const watermarkBanner = document.getElementById("demoWatermarkBanner");
    if (watermarkBanner) {
      if (p.isDemo) {
        watermarkBanner.style.display = "flex";
        watermarkBanner.innerHTML = `<span><strong>DEMO DATA — NOT REAL ORGANIZATIONS:</strong> Simulated university assessment demonstrating sector-specific faculty opportunities.</span>`;
      } else {
        watermarkBanner.style.display = "none";
      }
    }

    // 2. Render Header active partner label & badge
    const headerName = document.getElementById("headerActivePartnerName");
    if (headerName) headerName.textContent = p.basicInfo?.name || "Partner";

    // 3. Render Dashboard
    this.renderDashboard();

    // 4. Render Profile View
    this.renderProfileView();

    // 5. Render Market & Growth View
    this.renderMarketGrowthView();

    // 6. Render Capacity View
    this.renderCapacityView();

    // 7. Render Strategic Fit View
    this.renderStrategicFitView();

    // 8. Render Faculty Mapping View & Heatmap
    this.renderFacultyMappingView();
    this.renderHeatmap();

    // 9. Render Cross-Faculty Projects
    this.renderCrossFacultyView();

    // 10. Render Recommended Project Portfolio
    this.renderPortfolioView();

    // 11. Render Specialized Panels (Students, Research, Consultancy, Training, Commercialization)
    this.renderSpecializedViews();

    // 12. Render Financial Scenarios View
    this.renderFinancialView();

    // 13. Render 3-Year Roadmap & 5D Opportunity Map
    this.renderRoadmapView();

    // 14. Render Sources & Evidence List
    this.renderSourcesView();
  },

  /**
   * Render Dashboard (Requirement 25)
   */
  renderDashboard() {
    const p = this.activePartner;
    if (!p) return;

    const b = p.basicInfo || {};
    const a = p.agreement || {};
    const s = p.scores || {};
    const poi = SHU_INTELLIGENCE.calculateWeightedPoi(s);
    const fin = p.financialScenarios || {};
    const stu = p.studentsAndInternships || {};
    const rc = p.researchAndConsultancy || {};

    // Header card
    const orgName = document.getElementById("dashOrgName");
    if (orgName) {
      const quoteBadge = (p.ticker && typeof SHU_LIVE_PSX !== "undefined") ? SHU_LIVE_PSX.formatQuoteBadge(p.ticker) : '';
      orgName.innerHTML = `${b.name} ${quoteBadge}`;
    }

    const orgInd = document.getElementById("dashOrgIndustry");
    if (orgInd) orgInd.textContent = b.industry;

    const orgStatus = document.getElementById("dashOrgStatus");
    if (orgStatus) orgStatus.textContent = `${a.type} • ${a.status || 'Active'}`;

    // KPI Cards
    this.setElText("kpiPoiValue", `${poi}/100`);
    this.setElText("kpiExpectedRevenue", formatCurrency(fin.expected?.annualRevenuePKR));
    this.setElText("kpiInternshipCount", `${stu.annualInternshipCapacity || 30} Seats`);
    this.setElText("kpiStudentProjects", `${stu.annualTotalStudentProjects || 45} FYPs`);
    this.setElText("kpiResearchPotential", rc.researchPotentialLevel || "High");
    this.setElText("kpiWorkforceScale", `${b.estimatedEmployees?.toLocaleString() || 500} Staff`);
    this.setElText("kpiGrowthScore", `${p.marketAnalysis?.growthScore || 85}/100`);
    this.setElText("kpiCrossProjects", `${p.crossFacultyProjects?.length || 2} Major`);

    // Render Charts
    this.renderCharts();
  },

  /**
   * Render Chart.js Visualizations (Requirement 25)
   */
  renderCharts() {
    if (!this.activePartner || typeof Chart === "undefined") return;

    // 1. Radar Chart: SHU Partnership Potential (9 Dimensions)
    SHU_CHARTS.renderRadarChart("chartRadarPartnership", this.activePartner.scores || {});

    // 2. Bar Chart: Faculty Opportunity Index
    SHU_CHARTS.renderFacultyBarChart("chartFacultyOpportunities", this.activePartner.facultyOpportunities || []);

    // 3. Donut Chart: Opportunity Distribution
    SHU_CHARTS.renderOpportunityDonutChart("chartOpportunityDonut", this.activePartner);

    // 4. Financial Scenarios Chart
    if (document.getElementById("chartScenariosBar")) {
      SHU_CHARTS.renderScenarioChart("chartScenariosBar", this.activePartner.financialScenarios || {});
    }
  },

  /**
   * Render Organization Profile View (Requirement 6)
   */
  renderProfileView() {
    const b = this.activePartner?.basicInfo || {};
    const a = this.activePartner?.agreement || {};

    this.setElText("profOrgName", b.name);
    this.setElText("profLegalName", b.legalName);
    this.setElText("profHq", b.headquarters);
    this.setElText("profEstablished", b.yearEstablished);
    this.setElText("profOwnership", b.ownership);
    this.setElText("profIndustry", `${b.industry} (${b.subIndustry})`);
    this.setElText("profEmployees", b.estimatedEmployees?.toLocaleString());
    this.setElText("profRevenue", formatCurrency(b.knownAnnualRevenuePKR));
    this.setElText("profBranches", `${b.knownBranches} operating hubs`);
    this.setElText("profPresence", b.geographicPresence);
    this.setElText("profManagement", b.keyManagement);
    this.setElText("profCustomers", b.majorCustomers);
    this.setElText("profPartners", b.majorPartners);
    this.setElText("profBusinessModel", b.businessModel);
    this.setElText("profValueProp", b.valueProposition);
    this.setElText("profDescription", b.description);

    // Agreement details
    this.setElText("profAgType", a.type);
    this.setElText("profAgDate", a.dateOfAgreement);
    this.setElText("profAgDuration", `${a.durationMonths} Months`);
    this.setElText("profShuContact", a.shuContactPerson);
    this.setElText("profOrgContact", a.orgContactPerson);
    this.setElText("profExistingAreas", a.existingAreas);
  },

  /**
   * Render Market & Growth View (Requirement 7)
   */
  renderMarketGrowthView() {
    const m = this.activePartner?.marketAnalysis || {};

    this.setElText("mktTarget", m.targetMarket);
    this.setElText("mktDomestic", m.domesticReach);
    this.setElText("mktInternational", m.internationalReach);
    this.setElText("mktSegments", m.customerSegments);
    this.setElText("mktGrowthRate", m.industryGrowthRate);
    this.setElText("mktCompetitive", m.competitiveIntensity);
    this.setElText("mktCompetitors", m.majorCompetitors);
    this.setElText("mktTrends", m.marketTrends);
    this.setElText("mktScoreNumber", `${m.growthScore || 85}/100`);

    // Render underlying growth criteria table
    const tbody = document.getElementById("growthCriteriaTableBody");
    if (tbody) {
      tbody.innerHTML = (m.growthCriteria || []).map(c => `
        <tr>
          <td><strong>${c.metric}</strong></td>
          <td><span class="score-pill">${c.score}/100</span></td>
          <td>${c.weight}</td>
          <td>${c.rationale}</td>
          <td>${renderDataBadge("ANALYTICAL")}</td>
        </tr>
      `).join('');
    }
  },

  /**
   * Render Organizational Capacity View (Requirement 8)
   */
  renderCapacityView() {
    const c = this.activePartner?.organizationalCapacity || {};
    const hc = c.humanCapital || {};
    const inf = c.infrastructure || {};
    const inn = c.innovationCapability || {};

    this.setElText("capTotalManpower", hc.totalManpower?.toLocaleString());
    this.setElText("capTechnicalWorkforce", hc.technicalWorkforce?.toLocaleString());
    this.setElText("capManagementWorkforce", hc.managementWorkforce?.toLocaleString());
    this.setElText("capRdPersonnel", hc.rdPersonnel?.toLocaleString());
    this.setElText("capSalesWorkforce", hc.salesAndMarketing?.toLocaleString());
    this.setElText("capOpsWorkforce", hc.operationsAndQuality?.toLocaleString());
    this.setElText("capDigitalCapability", hc.digitalItCapability);

    this.setElText("capFacilities", inf.manufacturingFacilities);
    this.setElText("capLabs", inf.laboratories);
    this.setElText("capOffices", inf.offices);
    this.setElText("capLogistics", inf.distributionNetwork);
    this.setElText("capTechInfra", inf.technologyInfrastructure);
    this.setElText("capRdFacilities", inf.rdFacilities);

    this.setElText("capRdActivities", inn.rdActivities);
    this.setElText("capPatents", inn.patents);
    this.setElText("capPublications", inn.publications);
    this.setElText("capProductDev", inn.productDevelopment);
    this.setElText("capAiAdoption", inn.aiAdoption);
    this.setElText("capAutomation", inn.automation);
    this.setElText("capTechPartnerships", inn.technologyPartnerships);
  },

  /**
   * Render Strategic Fit & 9 Dimensions (Requirement 9 & 21)
   */
  renderStrategicFitView() {
    const s = this.activePartner?.scores || {};
    const poi = SHU_INTELLIGENCE.calculateWeightedPoi(s);

    this.setElText("dimPoiOverall", `${poi}/100`);
    this.setElText("dimScoreAcademic", `${s.academicValue}/100`);
    this.setElText("dimScoreResearch", `${s.researchValue}/100`);
    this.setElText("dimScoreStudent", `${s.studentValue}/100`);
    this.setElText("dimScoreFaculty", `${s.facultyValue}/100`);
    this.setElText("dimScoreCommercial", `${s.commercialValue}/100`);
    this.setElText("dimScoreInnovation", `${s.innovationValue}/100`);
    this.setElText("dimScoreEntrepreneurship", `${s.entrepreneurshipValue}/100`);
    this.setElText("dimScoreRevenue", `${s.revenuePotential}/100`);
    this.setElText("dimScoreStrategic", `${s.strategicValue}/100`);
  },

  /**
   * Render Faculty Mapping Table (Requirement 11)
   */
  renderFacultyMappingView() {
    const fo = this.activePartner?.facultyOpportunities || [];
    const tbody = document.getElementById("facultyOpportunitiesTableBody");
    if (!tbody) return;

    tbody.innerHTML = fo.map(f => `
      <tr>
        <td><strong>${f.facultyName}</strong></td>
        <td>${f.opportunity}</td>
        <td><small>${f.rationale}</small></td>
        <td><em>${f.potentialProject}</em></td>
        <td><span class="calc-tier-badge">${f.estimatedSizeTier.toUpperCase()} (${formatCurrency(f.estimatedValuePKR)})</span></td>
        <td>${f.duration}</td>
        <td><strong>${f.priority}</strong></td>
        <td>${renderDataBadge(f.tier || "ANALYTICAL")}</td>
      </tr>
    `).join('');
  },

  /**
   * Render Faculty Opportunity Heatmap (Requirement 26)
   */
  renderHeatmap() {
    const container = document.getElementById("facultyHeatmapContainer");
    if (!container) return;

    const ind = (this.activePartner?.basicInfo?.industry || "").toLowerCase();
    const faculties = SHU_CONFIG.faculties || [];

    // Dynamically calculate intensity level for each cell
    const categories = [
      { id: "research", label: "Sponsored Research" },
      { id: "consultancy", label: "Industry Consultancy" },
      { id: "studentProjects", label: "Student FYPs & Capstones" },
      { id: "internships", label: "Student Internships & Clerkships" },
      { id: "training", label: "Executive Education & Training" }
    ];

    const getIntensity = (catId, facId) => {
      if (ind.includes("pharma")) {
        if (facId === "pharmacy") return "Strategic";
        if (facId === "biosciences") return "High";
        if (facId === "cs" && catId !== "training") return "High";
        if (facId === "business" && catId === "consultancy") return "High";
        if (catId === "studentProjects" || catId === "internships") return "High";
        return "Medium";
      } else if (ind.includes("tech")) {
        if (facId === "cs") return "Strategic";
        if (facId === "biomedical") return "High";
        if (catId === "studentProjects" || catId === "internships") return "Strategic";
        if (facId === "business") return "High";
        return "Medium";
      } else if (ind.includes("health")) {
        if (facId === "pharmacy" || facId === "biomedical") return "Strategic";
        if (facId === "biosciences") return "High";
        if (catId === "internships") return "Strategic";
        return "High";
      }
      return "Medium";
    };

    let html = `
      <table class="heatmap-table">
        <thead>
          <tr>
            <th style="text-align:left; width: 220px;">Opportunity Domain</th>
            ${faculties.map(f => `<th>${f.shortName || f.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    categories.forEach(cat => {
      html += `<tr><td class="row-label">${cat.label}</td>`;
      faculties.forEach(fac => {
        const intensity = getIntensity(cat.id, fac.id);
        const cssClass = intensity === "Strategic" ? "heat-strategic" : (intensity === "High" ? "heat-high" : (intensity === "Medium" ? "heat-medium" : "heat-low"));
        html += `<td class="heat-cell ${cssClass}" title="${cat.label} with ${fac.name}: ${intensity} Potential">${intensity}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  },

  /**
   * Render Cross-Faculty Multi-Disciplinary Projects (Requirement 12)
   */
  renderCrossFacultyView() {
    const xf = this.activePartner?.crossFacultyProjects || [];
    const container = document.getElementById("crossFacultyProjectsList");
    if (!container) return;

    if (xf.length === 0) {
      container.innerHTML = `<p class="text-muted">No cross-faculty projects generated.</p>`;
      return;
    }

    container.innerHTML = xf.map((x, i) => `
      <div class="xf-project-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--shu-navy-dark);">${i + 1}. ${x.title}</h3>
            <div class="xf-faculties-pills">
              ${x.participatingFaculties.map(fac => `<span class="xf-pill">${fac}</span>`).join('')}
            </div>
          </div>
          <div>${renderDataBadge(x.tier || "ANALYTICAL")}</div>
        </div>
        <p style="margin-bottom: 0.5rem;"><strong>Problem Being Solved:</strong> ${x.problemBeingSolved}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Proposed Solution:</strong> ${x.proposedSolution}</p>
        <p style="margin-bottom: 0.75rem;"><strong>Key Deliverables:</strong> ${x.deliverables}</p>
        <div class="xf-specs-grid">
          <div><strong>Estimated Value:</strong><br><span class="text-emerald font-weight-bold">${formatCurrency(x.estimatedProjectValuePKR)}</span></div>
          <div><strong>Duration:</strong><br>${x.durationMonths} Months (${x.durationCategory})</div>
          <div><strong>Manpower Needed:</strong><br>${x.requiredManpower}</div>
          <div><strong>Potential Revenue to SHU:</strong><br><span class="text-blue font-weight-bold">${formatCurrency(x.potentialRevenuePKR)}</span></div>
          <div><strong>Commercialization:</strong><br>${x.commercializationPotential}</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render Recommended Project Portfolio (Requirement 24, 27, 28)
   */
  renderPortfolioView() {
    const p = this.activePartner?.projectPortfolio || {};

    const renderList = (items, containerId) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      if (!items || items.length === 0) {
        container.innerHTML = `<p class="text-muted">No projects in this category.</p>`;
        return;
      }
      container.innerHTML = items.map(item => `
        <div class="card-panel" style="margin-bottom: 1rem; border-left: 4px solid var(--shu-blue-primary);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.title}</h4>
            <span class="calc-tier-badge">${formatCurrency(item.estimatedValuePKR)} • ${item.duration}</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>Department & Faculty:</strong> ${item.department} (${item.faculty})</p>
          <p style="font-size: 0.85rem; margin-bottom: 0.5rem;"><strong>Expected Impact:</strong> ${item.impact}</p>
          <p style="font-size: 0.85rem; color: var(--shu-emerald-base); margin-bottom: 0.75rem;"><strong>Next Immediate Action:</strong> ${item.nextAction}</p>
          <div style="background: var(--bg-surface-alt); padding: 0.75rem; border-radius: 6px; font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div><strong>SHU Contribution:</strong><br>${item.shuContribution}</div>
            <div><strong>Partner Contribution:</strong><br>${item.orgContribution}</div>
          </div>
        </div>
      `).join('');
    };

    renderList(p.quickWins, "portfolioQuickWinsList");
    renderList(p.mediumTerm, "portfolioMediumTermList");
    renderList(p.strategic, "portfolioStrategicList");
  },

  /**
   * Render Specialized Views (Students, Research, Consultancy, Commercialization)
   */
  renderSpecializedViews() {
    const p = this.activePartner;
    const stu = p?.studentsAndInternships || {};
    const rc = p?.researchAndConsultancy || {};

    // Internships & Students
    this.setElText("stuInternshipScore", `${stu.internshipPotentialScore}/100`);
    this.setElText("stuAnnualCapacity", `${stu.annualInternshipCapacity} Students`);
    this.setElText("stuConversionRate", stu.potentialConversionRate);
    this.setElText("stuSkillsRequired", stu.skillsRequired);

    const capContainer = document.getElementById("stuCapacityByFaculty");
    if (capContainer) {
      capContainer.innerHTML = Object.entries(stu.studentProjectCapacityByFaculty || {}).map(([key, item]) => `
        <div class="kpi-card" style="padding: 0.85rem;">
          <div class="kpi-title">${key.toUpperCase()} FACULTY</div>
          <div class="kpi-value" style="font-size: 1.3rem;">${item.min}–${item.max} FYPs</div>
          <div class="kpi-sub">${item.note}</div>
        </div>
      `).join('');
    }

    // Research & Consultancy
    this.setElText("resPotentialLevel", rc.researchPotentialLevel);
    this.setElText("resRationale", rc.researchRationale);

    const consultList = document.getElementById("consultancyOpportunitiesList");
    if (consultList) {
      consultList.innerHTML = (rc.consultancyOpportunities || []).map(co => `
        <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${co.area}</strong><br>
            <small class="text-muted">Faculty: ${co.faculty} • Duration: ${co.duration}</small>
          </div>
          <div class="text-emerald" style="font-weight: 700;">${formatCurrency(co.estimatedValuePKR)}</div>
        </div>
      `).join('');
    }

    const trainList = document.getElementById("trainingProgramsList");
    if (trainList) {
      trainList.innerHTML = (rc.executiveEducationPrograms || []).map(tp => `
        <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${tp.title}</strong><br>
            <small class="text-muted">${tp.participants} Participants • ${tp.durationDays} Days</small>
          </div>
          <div class="text-blue" style="font-weight: 700;">${tp.feeRangePKR} PKR</div>
        </div>
      `).join('');
    }

    const commList = document.getElementById("commercializationList");
    if (commList) {
      commList.innerHTML = (rc.commercializationOpportunities || []).map(cm => `
        <div class="card-panel" style="margin-bottom: 1rem; border-left: 4px solid var(--shu-gold-primary);">
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem;">${cm.technology}</h4>
          <p style="font-size: 0.85rem; margin-bottom: 0.5rem;"><strong>Target Customer:</strong> ${cm.potentialCustomer} (Est. Market: ${formatCurrency(cm.estimatedMarketPKR)})</p>
          <p style="font-size: 0.85rem; margin-bottom: 0.5rem;"><strong>Commercial Pathway:</strong> ${cm.pathway}</p>
          <div style="background: var(--bg-surface-alt); padding: 0.75rem; border-radius: 6px; font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div><strong>SHU Contribution:</strong><br>${cm.shuContribution}</div>
            <div><strong>Partner Contribution:</strong><br>${cm.orgContribution}</div>
          </div>
        </div>
      `).join('');
    }
  },

  /**
   * Render Financial Scenarios View (Requirement 22)
   */
  renderFinancialView() {
    const fin = this.activePartner?.financialScenarios || {};

    const fillScenario = (key, prefix) => {
      const data = fin[key] || {};
      this.setElText(`${prefix}Revenue`, formatCurrency(data.annualRevenuePKR));
      this.setElText(`${prefix}Projects`, `${data.numberOfProjects} Projects`);
      this.setElText(`${prefix}Students`, `${data.numberOfStudents} Students`);
      this.setElText(`${prefix}Faculty`, `${data.facultyEngagementCount} Leads`);
      this.setElText(`${prefix}Desc`, data.description);
    };

    fillScenario("conservative", "scenCons");
    fillScenario("expected", "scenExp");
    fillScenario("highOpportunity", "scenHigh");

    // Render Scenarios Bar Chart if chart container exists
    if (document.getElementById("chartScenariosBar")) {
      SHU_CHARTS.renderScenarioChart("chartScenariosBar", fin);
    }
  },

  /**
   * Render 3-Year Roadmap View & 5D Opportunity Map (Requirement 23 & 40)
   */
  renderRoadmapView() {
    const r = this.activePartner?.roadmap || {};
    const om = this.activePartner?.opportunityMap || {};

    const fillYear = (yearKey, listId) => {
      const list = document.getElementById(listId);
      if (!list) return;
      const data = r[yearKey] || {};
      list.innerHTML = (data.milestones || []).map(m => `
        <div class="roadmap-milestone-item">
          <span class="rm-dot"></span>
          <span>${m}</span>
        </div>
      `).join('');
    };

    fillYear("year1", "roadmapYear1Milestones");
    fillYear("year2", "roadmapYear2Milestones");
    fillYear("year3", "roadmapYear3Milestones");

    // 5D Map
    this.setElText("dim5dLearn", om.learn);
    this.setElText("dim5dResearch", om.research);
    this.setElText("dim5dSolve", om.solve);
    this.setElText("dim5dBuild", om.build);
    this.setElText("dim5dScale", om.scale);
  },

  /**
   * Render Sources & Evidence View (Requirement 34 & 35)
   */
  renderSourcesView() {
    const sources = this.activePartner?.sourcesAndEvidence || [];
    const container = document.getElementById("sourcesAndEvidenceList");
    if (!container) return;

    container.innerHTML = sources.map(s => `
      <div style="padding: 0.85rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${s.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${s.note}</div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          ${renderDataBadge(s.tier)}
          ${renderConfidenceBadge(s.confidence)}
        </div>
      </div>
    `).join('');
  },

  /**
   * Setup Interactive Project Size & Duration Calculators (Requirement 13 & 14)
   */
  setupCalculators() {
    const updateProjectCalc = () => {
      const numResearchers = parseInt(document.getElementById("calcResearchers")?.value || "2", 10);
      const facultyDays = parseInt(document.getElementById("calcFacultyDays")?.value || "15", 10);
      const durationMonths = parseInt(document.getElementById("calcDurationMonths")?.value || "6", 10);
      const labHours = parseInt(document.getElementById("calcLabHours")?.value || "80", 10);
      const equipPKR = parseFloat(document.getElementById("calcEquipCost")?.value || "500000");

      this.setElText("lblResearchers", numResearchers);
      this.setElText("lblFacultyDays", facultyDays);
      this.setElText("lblDurationMonths", durationMonths);
      this.setElText("lblLabHours", labHours);

      const result = SHU_INTELLIGENCE.calculateProjectCost({
        numResearchers,
        facultyDays,
        durationMonths,
        labHours,
        softwareEquipmentPKR: equipPKR
      });

      this.setElText("calcResultCost", formatCurrency(result.totalCostPKR));
      this.setElText("calcResultTier", `${result.tierLabel} Tier`);

      this.setElText("calcCostManpower", formatCurrency(result.breakdown.manpowerCost));
      this.setElText("calcCostLab", formatCurrency(result.breakdown.labCost));
      this.setElText("calcCostEquip", formatCurrency(result.breakdown.softwareEquipmentPKR));
      this.setElText("calcCostOverhead", formatCurrency(result.breakdown.overheadCost));
    };

    // Sliders event listeners
    ["calcResearchers", "calcFacultyDays", "calcDurationMonths", "calcLabHours", "calcEquipCost"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", updateProjectCalc);
    });

    updateProjectCalc();
  },

  /**
   * Setup Forms (Input form and manual research import)
   */
  setupForms() {
    const form = document.getElementById("partnerAssessmentForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAssessmentFormSubmit();
      });
    }

    // Manual research mode sample filler
    document.getElementById("btnFillSamplePharma")?.addEventListener("click", () => {
      this.fillSampleForm(0);
    });
    document.getElementById("btnFillSampleTech")?.addEventListener("click", () => {
      this.fillSampleForm(1);
    });
    document.getElementById("btnFillSampleHealth")?.addEventListener("click", () => {
      this.fillSampleForm(2);
    });
  },

  /**
   * Fill sample form inputs
   */
  fillSampleForm(demoIndex) {
    const sample = SHU_DEMO_PARTNERS[demoIndex];
    if (!sample) return;
    const b = sample.basicInfo;
    const a = sample.agreement;

    this.setVal("inpOrgName", b.name);
    this.setVal("inpWebsite", b.website);
    this.setVal("inpCountry", b.country);
    this.setVal("inpCity", b.city);
    this.setVal("inpIndustry", b.industry);
    this.setVal("inpSubIndustry", b.subIndustry);
    this.setVal("inpYearEstablished", b.yearEstablished);
    this.setVal("inpOrgType", b.organizationType);
    this.setVal("inpAgreementType", a.type);
    this.setVal("inpAgreementDate", a.dateOfAgreement);
    this.setVal("inpAgreementDuration", a.durationMonths);
    this.setVal("inpShuContact", a.shuContactPerson);
    this.setVal("inpOrgContact", a.orgContactPerson);
    this.setVal("inpExistingAreas", a.existingAreas);
    this.setVal("inpRevenue", b.knownAnnualRevenuePKR);
    this.setVal("inpEmployees", b.estimatedEmployees);
    this.setVal("inpBranches", b.knownBranches);
    this.setVal("inpDescription", b.description);

    this.showToast(`Loaded sample parameters from: ${b.name}`);
  },

  /**
   * Handle "ANALYZE ORGANIZATION" Form Submission
   */
  handleAssessmentFormSubmit() {
    const orgName = document.getElementById("inpOrgName")?.value.trim();
    if (!orgName) {
      alert("Please enter the Organization Name.");
      return;
    }

    const formData = {
      orgName,
      website: document.getElementById("inpWebsite")?.value.trim(),
      country: document.getElementById("inpCountry")?.value.trim(),
      city: document.getElementById("inpCity")?.value.trim(),
      industry: document.getElementById("inpIndustry")?.value.trim(),
      subIndustry: document.getElementById("inpSubIndustry")?.value.trim(),
      yearEstablished: document.getElementById("inpYearEstablished")?.value,
      orgType: document.getElementById("inpOrgType")?.value,
      agreementType: document.getElementById("inpAgreementType")?.value,
      agreementDate: document.getElementById("inpAgreementDate")?.value,
      agreementDurationMonths: document.getElementById("inpAgreementDuration")?.value,
      shuContactPerson: document.getElementById("inpShuContact")?.value.trim(),
      orgContactPerson: document.getElementById("inpOrgContact")?.value.trim(),
      existingAreas: document.getElementById("inpExistingAreas")?.value.trim(),
      knownRevenue: document.getElementById("inpRevenue")?.value,
      knownEmployees: document.getElementById("inpEmployees")?.value,
      knownBranches: document.getElementById("inpBranches")?.value,
      description: document.getElementById("inpDescription")?.value.trim()
    };

    const researchText = document.getElementById("inpManualResearchText")?.value || "";

    // Show loading state
    const submitBtn = document.getElementById("btnAnalyzeOrg");
    const originalText = submitBtn ? submitBtn.innerHTML : "ANALYZE ORGANIZATION";
    if (submitBtn) {
      submitBtn.innerHTML = `
        <svg class="spin-animation" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        Analyzing Strategic Intelligence...
      `;
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      try {
        const assessment = SHU_INTELLIGENCE.analyzeOrganization(formData, researchText);
        SHU_STORAGE.savePartner(assessment);
        this.activePartner = assessment;

        this.setupPartnerDropdown();
        this.renderActivePartner();
        this.navigateTo("viewDashboard");
        this.showToast(`Assessment complete for ${assessment.basicInfo?.name}!`);
      } catch (err) {
        console.error("Analysis Error:", err);
        alert("Failed to analyze organization: " + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }
    }, 600);
  },

  /**
   * Render Comparison View (Requirement 30)
   */
  renderComparisonView() {
    const container = document.getElementById("comparisonMatrixContainer");
    if (!container) return;

    const allPartners = SHU_STORAGE.getAllPartners();
    let compIds = SHU_STORAGE.getComparisonIds();

    if (compIds.length === 0 && allPartners.length > 0) {
      compIds = [allPartners[0].id];
      SHU_STORAGE.setComparisonIds(compIds);
    }

    const comparedPartners = allPartners.filter(p => compIds.includes(p.id));

    // Multi-selector checkboxes
    const selectorBox = document.getElementById("comparisonPartnerSelector");
    if (selectorBox) {
      selectorBox.innerHTML = allPartners.map(p => `
        <label style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; margin-right: 1rem; cursor: pointer;">
          <input type="checkbox" value="${p.id}" ${compIds.includes(p.id) ? 'checked' : ''} class="comp-checkbox">
          ${p.basicInfo?.name}
        </label>
      `).join('');

      selectorBox.querySelectorAll(".comp-checkbox").forEach(cb => {
        cb.addEventListener("change", (e) => {
          SHU_STORAGE.toggleComparisonId(e.target.value);
          this.renderComparisonView();
        });
      });
    }

    if (comparedPartners.length === 0) {
      container.innerHTML = `<p class="text-muted">Select at least one organization to view the comparison matrix.</p>`;
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 220px;">Assessment Dimension</th>
            ${comparedPartners.map(p => `<th><strong>${p.basicInfo?.name}</strong><br><small class="text-muted">${p.agreement?.type || 'MOU'}</small></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Industry & Sector</strong></td>
            ${comparedPartners.map(p => `<td>${p.basicInfo?.industry}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Partnership Opportunity Index (POI)</strong></td>
            ${comparedPartners.map(p => `<td><strong style="color: var(--shu-blue-primary); font-size: 1.1rem;">${SHU_INTELLIGENCE.calculateWeightedPoi(p.scores || {})}/100</strong></td>`).join('')}
          </tr>
          <tr>
            <td><strong>Expected Annual SHU Revenue</strong></td>
            ${comparedPartners.map(p => `<td class="text-emerald"><strong>${formatCurrency(p.financialScenarios?.expected?.annualRevenuePKR)}</strong></td>`).join('')}
          </tr>
          <tr>
            <td><strong>Annual Student Internships</strong></td>
            ${comparedPartners.map(p => `<td>${p.studentsAndInternships?.annualInternshipCapacity || 25} Students</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Annual Student Projects (FYPs)</strong></td>
            ${comparedPartners.map(p => `<td>${p.studentsAndInternships?.annualTotalStudentProjects || 35} Projects</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Research Potential Rating</strong></td>
            ${comparedPartners.map(p => `<td><strong>${p.researchAndConsultancy?.researchPotentialLevel || 'High'}</strong></td>`).join('')}
          </tr>
          <tr>
            <td><strong>Growth Potential Score</strong></td>
            ${comparedPartners.map(p => `<td>${p.marketAnalysis?.growthScore || 80}/100</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Workforce Scale</strong></td>
            ${comparedPartners.map(p => `<td>${p.basicInfo?.estimatedEmployees?.toLocaleString() || 500} personnel</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Top Cross-Faculty Project</strong></td>
            ${comparedPartners.map(p => `<td>${p.crossFacultyProjects?.[0]?.title || 'Multi-faculty Project'}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  },

  /**
   * Setup Database Search, Industry/Status Filters and Quick Sector Pills
   */
  setupDatabaseFilters() {
    const searchInp = document.getElementById("dbSearchInput");
    const indFilter = document.getElementById("dbFilterIndustry");
    const statFilter = document.getElementById("dbFilterStatus");

    searchInp?.addEventListener("input", () => this.renderDatabaseTable());
    indFilter?.addEventListener("change", () => this.renderDatabaseTable());
    statFilter?.addEventListener("change", () => this.renderDatabaseTable());

    // Sector Filter Pills (Picture 1 Enhancement)
    document.querySelectorAll("#dbSectorPills .sector-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#dbSectorPills .sector-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        const sector = pill.getAttribute("data-sector");
        if (sector === "all") {
          if (indFilter) indFilter.value = "all";
          if (searchInp) searchInp.value = "";
        } else if (sector === "pharma") {
          if (indFilter) indFilter.value = "Pharma";
          if (searchInp) searchInp.value = "";
        } else if (sector === "tech") {
          if (indFilter) indFilter.value = "Tech";
          if (searchInp) searchInp.value = "";
        } else if (sector === "chem") {
          if (indFilter) indFilter.value = "Chemical";
          if (searchInp) searchInp.value = "";
        } else if (sector === "bank") {
          if (indFilter) indFilter.value = "Banking";
          if (searchInp) searchInp.value = "";
        } else if (sector === "conglomerate") {
          if (indFilter) indFilter.value = "Conglomerate";
          if (searchInp) searchInp.value = "";
        }
        this.renderDatabaseTable();
      });
    });
  },

  /**
   * Render Database Table (Requirement 31 & Live PSX Data Integration)
   */
  renderDatabaseTable() {
    const tbody = document.getElementById("databaseTableBody");
    if (!tbody) return;

    const query = document.getElementById("dbSearchInput")?.value || "";
    const ind = document.getElementById("dbFilterIndustry")?.value || "all";
    const stat = document.getElementById("dbFilterStatus")?.value || "all";

    const filtered = SHU_STORAGE.searchAndFilter(query, ind, stat);
    const activeId = SHU_STORAGE.getActivePartnerId();

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-muted" style="text-align:center; padding: 2.5rem;">
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.5rem;">
              No matching organizations found for "${query}"
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              Try searching by stock ticker (e.g. <strong>SYS</strong>, <strong>SEARL</strong>, <strong>ABOT</strong>, <strong>HBL</strong>, <strong>MEBL</strong>, <strong>FEROZ</strong>) or click one of the quick sector filter pills above.
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const poi = SHU_INTELLIGENCE.calculateWeightedPoi(p.scores || {});
      const isActive = p.id === activeId;
      const quoteBadge = (typeof SHU_LIVE_PSX !== "undefined") ? SHU_LIVE_PSX.formatQuoteBadge(p.ticker) : (p.ticker ? `PSX: ${p.ticker}` : '-');

      return `
        <tr style="${isActive ? 'background: rgba(0, 90, 156, 0.07);' : ''}">
          <td>
            <strong>${p.basicInfo?.name}</strong> ${isActive ? '<span class="data-badge badge-calculated">ACTIVE</span>' : ''}<br>
            <small class="text-muted">${p.basicInfo?.city}, Pakistan ${p.ticker ? `• PSX: ${p.ticker}` : ''}</small>
          </td>
          <td>${quoteBadge}</td>
          <td>
            <div style="font-size: 0.85rem; font-weight: 600;">${p.basicInfo?.industry}</div>
            <small class="text-muted">${p.basicInfo?.subIndustry ? p.basicInfo.subIndustry.slice(0, 50) + '...' : ''}</small>
          </td>
          <td><span class="calc-tier-badge">${p.agreement?.type || 'MOU'}</span></td>
          <td><strong style="color: var(--shu-blue-primary); font-size: 1rem;">${poi}/100</strong></td>
          <td><span class="text-emerald font-weight-bold">${formatCurrency(p.financialScenarios?.expected?.annualRevenuePKR)}</span></td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 700;" onclick="SHU_APP.selectPartner('${p.id}')">Assess</button>
              ${!p.isDemo ? `<button class="btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; color: #dc2626;" onclick="SHU_APP.deletePartner('${p.id}')">Delete</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  selectPartner(id) {
    SHU_STORAGE.setActivePartnerId(id);
    this.activePartner = SHU_STORAGE.getActivePartner();
    this.setupPartnerDropdown();
    this.renderActivePartner();
    this.renderDatabaseTable();
    this.showToast(`Selected: ${this.activePartner?.basicInfo?.name}`);
  },

  deletePartner(id) {
    if (confirm("Are you sure you want to delete this assessment record?")) {
      SHU_STORAGE.deletePartner(id);
      this.activePartner = SHU_STORAGE.getActivePartner();
      this.setupPartnerDropdown();
      this.renderActivePartner();
      this.renderDatabaseTable();
      this.showToast("Record deleted.");
    }
  },

  /**
   * Setup Admin Settings View (Requirement 32)
   */
  setupAdminSettings() {
    document.getElementById("btnSaveAdminSettings")?.addEventListener("click", () => {
      // Save custom weights
      const weights = {
        academic: parseFloat(document.getElementById("setWeightAcademic")?.value || "10") / 100,
        research: parseFloat(document.getElementById("setWeightResearch")?.value || "15") / 100,
        student: parseFloat(document.getElementById("setWeightStudent")?.value || "15") / 100,
        faculty: parseFloat(document.getElementById("setWeightFaculty")?.value || "10") / 100,
        commercial: parseFloat(document.getElementById("setWeightCommercial")?.value || "15") / 100,
        innovation: parseFloat(document.getElementById("setWeightInnovation")?.value || "10") / 100,
        entrepreneurship: parseFloat(document.getElementById("setWeightEntrepreneurship")?.value || "10") / 100,
        revenue: parseFloat(document.getElementById("setWeightRevenue")?.value || "10") / 100,
        strategic: parseFloat(document.getElementById("setWeightStrategic")?.value || "5") / 100
      };

      SHU_CONFIG.dimensionWeights = weights;
      localStorage.setItem(SHU_STORAGE.KEYS.CONFIG_SETTINGS, JSON.stringify({ dimensionWeights: weights }));
      this.renderDashboard();
      this.showToast("Admin settings and scoring weights saved!");
    });

    document.getElementById("btnExportDbJson")?.addEventListener("click", () => {
      SHU_STORAGE.exportDatabaseToJson();
    });

    document.getElementById("btnResetDbDefaults")?.addEventListener("click", () => {
      if (confirm("Reset all partners and settings back to original demonstration defaults?")) {
        SHU_STORAGE.resetToDefaults();
      }
    });

    // Import JSON handler
    const fileInput = document.getElementById("inpImportJsonFile");
    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = SHU_STORAGE.importDatabaseFromJson(event.target.result);
        if (result.success) {
          this.init();
          this.showToast(`Imported ${result.count} organization records successfully!`);
        } else {
          alert("Import failed: " + result.error);
        }
      };
      reader.readAsText(file);
    });
  },

  loadSettingsForm() {
    const w = SHU_CONFIG.dimensionWeights || {};
    this.setVal("setWeightAcademic", Math.round((w.academic || 0.1) * 100));
    this.setVal("setWeightResearch", Math.round((w.research || 0.15) * 100));
    this.setVal("setWeightStudent", Math.round((w.student || 0.15) * 100));
    this.setVal("setWeightFaculty", Math.round((w.faculty || 0.1) * 100));
    this.setVal("setWeightCommercial", Math.round((w.commercial || 0.15) * 100));
    this.setVal("setWeightInnovation", Math.round((w.innovation || 0.1) * 100));
    this.setVal("setWeightEntrepreneurship", Math.round((w.entrepreneurship || 0.1) * 100));
    this.setVal("setWeightRevenue", Math.round((w.revenue || 0.1) * 100));
    this.setVal("setWeightStrategic", Math.round((w.strategic || 0.05) * 100));
  },

  /**
   * Open Executive Report Modal (Requirement 29)
   */
  openReportModal() {
    const modal = document.getElementById("reportModal");
    const container = document.getElementById("reportModalContent");
    if (!modal || !container || !this.activePartner) return;

    container.innerHTML = SHU_REPORTS.generateReportHtml(this.activePartner);
    modal.classList.add("open");
  },

  /**
   * Helper: Set text content of element safely
   */
  setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? "";
  },

  /**
   * Helper: Set input value safely
   */
  setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  },

  /**
   * Toast notification display
   */
  showToast(message) {
    const toast = document.getElementById("appToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
};

// Auto-run on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  SHU_APP.init();
});
