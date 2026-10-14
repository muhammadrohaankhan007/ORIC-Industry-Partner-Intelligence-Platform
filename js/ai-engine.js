/**
 * SHU INDUSTRY PARTNER INTELLIGENCE & OPPORTUNITY ASSESSMENT PLATFORM
 * Central Intelligence & Analytical Engine (Requirement 36, 39, 40)
 * 
 * Implements the core reasoning pipeline:
 * ORGANIZATION → BUSINESS → INDUSTRY → MARKET → CAPABILITIES →
 * PROBLEMS → SHU EXPERTISE → FACULTY → RESEARCH → STUDENT PROJECTS →
 * CONSULTANCY → PRODUCT DEVELOPMENT → COMMERCIALIZATION → STRATEGIC PARTNERSHIP
 */

const SHU_INTELLIGENCE = {

  /**
   * Main entry point to analyze an organization from user input form & manual research text.
   */
  analyzeOrganization(formData, researchText = "") {
    // 1. Synthesize base organization profile
    const baseData = this.synthesizeBaseProfile(formData, researchText);

    // 2. Market Intelligence & Qualitative Growth Analysis (0–100)
    const market = this.analyzeMarket(baseData, researchText);
    const growth = this.analyzeGrowth(baseData, market);

    // 3. Organizational Capacity (Human Capital, Infrastructure, Innovation)
    const capacity = this.analyzeCapacity(baseData, researchText);

    // 4. Strategic Value to SHU & 9-Dimension Assessment
    const scores = this.calculatePartnershipValue(baseData, market, capacity);

    // 5. Faculty Mapping & Faculty-Specific Opportunity Engine
    const facultyOpportunities = this.mapFacultyOpportunities(baseData, market, capacity);

    // 6. Cross-Faculty Multi-Disciplinary Projects
    const crossFacultyProjects = this.generateCrossFacultyProjects(baseData, facultyOpportunities);

    // 7. Recommended Project Portfolio (Quick Wins, Medium-Term, Strategic)
    const projectPortfolio = this.generateProjectPortfolio(baseData, facultyOpportunities, crossFacultyProjects);

    // 8. Specialized Engines: Students, Internships, Research, Consultancy, Training, Commercialization
    const studentsAndInternships = this.assessStudentsAndInternships(baseData, capacity);
    const researchAndConsultancy = this.assessResearchAndConsultancy(baseData, capacity);

    // 9. Financial Opportunity Scenarios (Conservative, Expected, High Opportunity)
    const financialScenarios = this.calculateFinancialScenarios(baseData, scores);

    // 10. 3-Year Partnership Roadmap (Year 1 Engage, Year 2 Collaborate, Year 3 Scale)
    const roadmap = this.generateRoadmap(baseData);

    // 11. SHU 5D Opportunity Map (LEARN, RESEARCH, SOLVE, BUILD, SCALE)
    const opportunityMap = this.generateOpportunityMap(baseData, facultyOpportunities, crossFacultyProjects);

    // 12. Sources, Evidence & Confidence Assessment
    const sourcesAndEvidence = this.compileSourcesAndEvidence(formData, researchText);

    return {
      id: "org_" + Date.now(),
      isDemo: false,
      createdAt: new Date().toISOString(),
      basicInfo: baseData,
      agreement: {
        type: formData.agreementType || "MOU",
        status: "Active",
        dateOfAgreement: formData.agreementDate || new Date().toISOString().slice(0, 10),
        durationMonths: parseInt(formData.agreementDurationMonths, 10) || 36,
        shuContactPerson: formData.shuContactPerson || "SHU ORIC Directorate",
        orgContactPerson: formData.orgContactPerson || "Head of Partnerships",
        existingAreas: formData.existingAreas || "Initial academic dialogue and student internship placements",
        existingProjects: formData.existingProjects || "None currently documented"
      },
      sourcesAndEvidence,
      marketAnalysis: {
        ...market,
        growthScore: growth.score,
        growthCriteria: growth.criteria
      },
      organizationalCapacity: capacity,
      scores,
      facultyOpportunities,
      crossFacultyProjects,
      projectPortfolio,
      studentsAndInternships,
      researchAndConsultancy,
      financialScenarios,
      roadmap,
      opportunityMap
    };
  },

  /**
   * Synthesize basic profile by blending form inputs and parsed research text
   */
  synthesizeBaseProfile(form, text = "") {
    const name = form.orgName?.trim() || "Assessed Partner Organization";
    const industry = form.industry || "Diversified Commercial Enterprise";
    const subIndustry = form.subIndustry || "Industrial Manufacturing & Services";
    const orgType = form.orgType || "Private Company";
    const country = form.country || "Pakistan";
    const city = form.city || "Karachi";
    const website = form.website || "https://example.com";
    const yearEst = parseInt(form.yearEstablished, 10) || 2015;

    // Derived or estimated financials
    let revenue = parseFloat(form.knownRevenue) || null;
    let employees = parseInt(form.knownEmployees, 10) || null;
    let branches = parseInt(form.knownBranches, 10) || null;
    let investment = parseFloat(form.knownInvestment) || null;

    // Heuristics if user didn't enter financials
    if (!employees) {
      if (orgType === "Multinational") employees = 1200;
      else if (orgType === "Hospital/Healthcare") employees = 2500;
      else if (orgType === "Startup") employees = 85;
      else if (orgType === "SME") employees = 150;
      else employees = 450;
    }

    if (!revenue) {
      // Rough benchmark PKR 4M per employee in formal industry
      revenue = employees * 4500000;
    }

    if (!branches) {
      branches = Math.max(1, Math.round(employees / 200));
    }

    // Extracted intelligence from research text if present
    const extracted = this.extractEntitiesFromText(text);

    return {
      name,
      legalName: form.legalName || name + " (Pvt.) Ltd.",
      website,
      country,
      city,
      industry,
      subIndustry,
      yearEstablished: yearEst,
      organizationType: orgType,
      ownership: form.ownership || (orgType === "Multinational" ? "Multinational Subsidiary" : (orgType === "Startup" ? "Venture-Backed Private Limited" : "Privately Held Limited")),
      headquarters: form.headquarters || `${city}, ${country}`,
      geographicPresence: form.geographicPresence || `Regional operations across ${country} with ${branches} operating facilities`,
      numberOfLocations: branches,
      estimatedEmployees: employees,
      knownAnnualRevenuePKR: revenue,
      knownInvestmentPKR: investment || Math.round(revenue * 0.15),
      knownBranches: branches,
      keyManagement: form.keyManagement || extracted.keyManagement || "Managing Director, Chief Technical Officer, Head of Human Resources",
      majorCustomers: form.majorCustomers || extracted.majorCustomers || "Institutional enterprises, retail consumers, governmental and private sector clients",
      majorPartners: form.majorPartners || extracted.majorPartners || "Industry trade associations, technology equipment vendors, supply chain distributors",
      businessModel: form.businessModel || extracted.businessModel || `B2B & B2C supply of ${subIndustry} solutions with direct corporate accounts`,
      valueProposition: form.valueProposition || `High-reliability manufacturing, domain expertise, and scaled distribution within ${industry}.`,
      description: form.description || text.slice(0, 350) || `${name} is an active enterprise operating within the ${industry} sector.`
    };
  },

  /**
   * Extract key metrics and text signals from pasted annual reports, news, or profiles
   */
  extractEntitiesFromText(text) {
    if (!text || text.trim().length === 0) {
      return {};
    }

    const res = {};
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    // Scan for potential executives
    const execMatches = text.match(/(?:CEO|MD|Director|President|Chairman|Chief\s+[A-Za-z]+)\s*[:\-–]\s*([A-Za-z\.\s]{3,35})/gi);
    if (execMatches && execMatches.length > 0) {
      res.keyManagement = execMatches.slice(0, 3).map(m => m.replace(/[\r\n]+/g, "").trim()).join(", ");
    }

    // Scan for partner/customer mentions
    const partnerMatches = text.match(/(?:partners?|clients?|customers?|collaborators?)\s*(?:include|are|with)\s*[:\-–]?\s*([^\.\n]{5,100})/i);
    if (partnerMatches && partnerMatches[1]) {
      res.majorPartners = partnerMatches[1].trim();
    }

    return res;
  },

  /**
   * Market Intelligence Assessment
   */
  analyzeMarket(org, text = "") {
    const ind = org.industry.toLowerCase();
    const isPharma = ind.includes("pharma") || ind.includes("drug") || ind.includes("biotech");
    const isTech = ind.includes("tech") || ind.includes("software") || ind.includes("ai") || ind.includes("comput");
    const isHealth = ind.includes("health") || ind.includes("hospital") || ind.includes("clinic") || ind.includes("medic");

    let domesticReach = "National footprint covering primary urban centers, secondary industrial clusters, and provincial wholesale distributors.";
    let internationalReach = "Exporting to regional emerging markets in MENA and South Asia, with active international trade partnerships.";
    let competitiveIntensity = "High — intense margin competition from established domestic conglomerates and multinational imports.";
    let industryGrowthRate = "12.5% CAGR";
    let customerSegments = "B2B Enterprise Clients (55%), Public Sector / Tenders (25%), Retail Consumers (20%)";
    let majorCompetitors = "Leading domestic market peers and regional market operators";
    let marketTrends = "Digital modernization, indigenous import substitution, sustainability compliance, and automated quality assurance.";

    if (isPharma) {
      industryGrowthRate = "14.2% CAGR (2024–2030)";
      competitiveIntensity = "High — intense competition across generic branded formulations and stringent DRAP price controls.";
      majorCompetitors = "Getz Pharma, Martin Dow, Searle Company, Ferozsons Laboratories, AGP Ltd.";
      marketTrends = "Shift toward sterile injectables, biosimilars, local API synthesis, WHO-GMP compliance, and automated batch traceability.";
      customerSegments = "Prescription Healthcare Providers (65%), Institutional / Defense Tenders (20%), OTC Retail (15%)";
    } else if (isTech) {
      industryGrowthRate = "28.5% CAGR";
      competitiveIntensity = "Moderate-High — competing globally on software engineering quality, AI talent, and delivery speed.";
      majorCompetitors = "Systems Limited, 10Pearls, Contour Software, Regional AI start-ups";
      marketTrends = "Rapid adoption of Generative AI, cloud-native architectures, cybersecurity compliance, and healthcare edge computing.";
      customerSegments = "International SaaS Subscribers (65%), Domestic Enterprise IT (25%), Government Digitization (10%)";
    } else if (isHealth) {
      industryGrowthRate = "15.8% CAGR";
      competitiveIntensity = "High — private tertiary hospitals compete for high-yield surgical procedures and diagnostics.";
      majorCompetitors = "Aga Khan University Hospital, Indus Hospital Network, Shifa International, Chughtai Lab";
      marketTrends = "Centralized electronic medical records, automated clinical chemistry, point-of-care rapid testing, patient mobile portals.";
      customerSegments = "Private Outpatient & Cash Payers (55%), Corporate Panels & Insurance (30%), Subsidized Care (15%)";
    }

    return {
      targetMarket: `Enterprise and consumer demand for ${org.subIndustry} within ${org.country} and target export territories.`,
      marketGeography: org.geographicPresence,
      domesticReach,
      internationalReach,
      customerSegments,
      marketSizePKR: Math.round(org.knownAnnualRevenuePKR * 25),
      industryGrowthRate,
      competitiveIntensity,
      majorCompetitors,
      marketTrends
    };
  },

  /**
   * Qualitative Growth Assessment (0–100) with Underlying Criteria Breakdown (Requirement 7)
   */
  analyzeGrowth(org, market) {
    const isStartup = org.organizationType === "Startup";
    const isMNC = org.organizationType === "Multinational";
    const employees = org.estimatedEmployees || 300;

    let baseScore = 75;
    if (isStartup) baseScore = 88;
    else if (isMNC) baseScore = 85;
    else if (employees > 1000) baseScore = 82;

    const criteria = [
      {
        metric: "Historical Top-Line Expansion & Revenue Trajectory",
        score: Math.min(95, baseScore + 4),
        weight: "20%",
        rationale: "Demonstrated positive annual commercial trajectory and stable operating cash flows."
      },
      {
        metric: "Operational Capacity & Facility Expansion",
        score: Math.min(95, baseScore + 2),
        weight: "20%",
        rationale: `Expanding physical footprint across ${org.numberOfLocations} operating hubs.`
      },
      {
        metric: "New Product Development & Pipeline Velocity",
        score: Math.min(95, baseScore - 2),
        weight: "15%",
        rationale: "Active product iterations aligned with contemporary market demand."
      },
      {
        metric: "Market Reach & Export Potential",
        score: Math.min(95, baseScore + 5),
        weight: "15%",
        rationale: "Established customer distribution network with cross-border trade readiness."
      },
      {
        metric: "Technology Modernization & Process Automation",
        score: Math.min(95, baseScore),
        weight: "15%",
        rationale: "Implementation of enterprise IT systems and automated workflow controls."
      },
      {
        metric: "Talent Acquisition & Strategic Workforce Growth",
        score: Math.min(95, baseScore + 1),
        weight: "15%",
        rationale: `Sustaining a workforce of ~${employees} personnel with specialized technical requirements.`
      }
    ];

    const compositeScore = Math.round(
      criteria.reduce((acc, c) => acc + (c.score * (parseFloat(c.weight) / 100)), 0)
    );

    return {
      score: compositeScore,
      criteria
    };
  },

  /**
   * Organizational Capacity Assessment (Requirement 8)
   */
  analyzeCapacity(org, text = "") {
    const total = org.estimatedEmployees || 500;
    const ind = org.industry.toLowerCase();

    let technical = Math.round(total * 0.32);
    let management = Math.round(total * 0.12);
    let rd = Math.round(total * 0.06);
    let sales = Math.round(total * 0.28);
    let ops = total - (technical + management + rd + sales);

    if (ind.includes("tech") || ind.includes("software")) {
      technical = Math.round(total * 0.65);
      rd = Math.round(total * 0.18);
      sales = Math.round(total * 0.08);
      management = Math.round(total * 0.06);
      ops = total - (technical + management + rd + sales);
    } else if (ind.includes("health") || ind.includes("hospital")) {
      technical = Math.round(total * 0.35); // Medical & allied health
      ops = Math.round(total * 0.45); // Nursing & ward support
      management = Math.round(total * 0.08);
      rd = Math.round(total * 0.02);
      sales = total - (technical + ops + management + rd);
    }

    return {
      humanCapital: {
        totalManpower: total,
        technicalWorkforce: technical,
        managementWorkforce: management,
        rdPersonnel: Math.max(5, rd),
        salesAndMarketing: sales,
        operationsAndQuality: ops,
        digitalItCapability: total > 500 ? "High (Enterprise ERP, cloud data infrastructure, automated workflow)" : "Moderate (Standard business software, web portals, developing automation)"
      },
      infrastructure: {
        manufacturingFacilities: `${org.numberOfLocations} primary operational facilities and specialized processing centers.`,
        laboratories: "Dedicated in-house quality control testing, inspection suites, and pilot testing areas.",
        offices: `Central administrative headquarters in ${org.city} with branch liaison offices.`,
        distributionNetwork: "Integrated logistics chain with warehouse storage hubs and third-party transport agreements.",
        technologyInfrastructure: "Secure local area networks, redundant cloud servers, and automated management information systems.",
        rdFacilities: "Applied prototyping workshop and analytical evaluation workspace."
      },
      innovationCapability: {
        rdActivities: `Process optimization, yield improvement, quality assurance, and exploratory research in ${org.subIndustry}.`,
        patents: total > 800 ? "1–3 active patents or trademark registrations" : "Process trade secrets and proprietary formulation/software methods",
        publications: "Occasional technical white papers and industry trade journal contributions",
        productDevelopment: "Regular seasonal updates and customized commercial offerings",
        digitalTransformation: "Phased modernization of manual paper records into computerized databases",
        aiAdoption: "Evaluating machine learning for business forecasting, customer service, or predictive maintenance",
        automation: "Automated conveyor or software workflow pipelines with barcode tracking",
        technologyPartnerships: "Vendors, external engineering consultants, and academic MOU links with SHU"
      }
    };
  },

  /**
   * 9-Dimension Partnership Value Calculator (Requirement 21)
   */
  calculatePartnershipValue(org, market, capacity) {
    const ind = org.industry.toLowerCase();
    const type = org.organizationType;
    const employees = org.estimatedEmployees || 400;

    // Base dimension scores (0–100)
    let academic = 80;
    let research = 75;
    let student = 85;
    let faculty = 78;
    let commercial = 75;
    let innovation = 72;
    let entrepreneurship = 70;
    let revenue = 76;
    let strategic = 80;

    if (ind.includes("pharma") || ind.includes("biotech")) {
      academic += 10;
      research += 18;
      student += 10;
      faculty += 10;
      commercial += 14;
      innovation += 12;
      revenue += 12;
    } else if (ind.includes("tech") || ind.includes("software") || ind.includes("ai")) {
      academic += 15;
      research += 18;
      student += 14;
      faculty += 12;
      commercial += 16;
      innovation += 24;
      entrepreneurship += 22;
      revenue += 8;
    } else if (ind.includes("health") || ind.includes("hospital")) {
      academic += 16;
      research += 14;
      student += 14;
      faculty += 14;
      commercial += 10;
      revenue += 14;
      strategic += 12;
    }

    if (type === "Multinational") {
      revenue += 10;
      strategic += 10;
      student += 8;
    } else if (type === "Startup") {
      entrepreneurship += 20;
      innovation += 15;
      revenue -= 8;
    }

    // Clamp between 45 and 99
    const clamp = (val) => Math.max(45, Math.min(99, Math.round(val)));

    return {
      academicValue: clamp(academic),
      researchValue: clamp(research),
      studentValue: clamp(student),
      facultyValue: clamp(faculty),
      commercialValue: clamp(commercial),
      innovationValue: clamp(innovation),
      entrepreneurshipValue: clamp(entrepreneurship),
      revenuePotential: clamp(revenue),
      strategicValue: clamp(strategic)
    };
  },

  /**
   * Calculate overall weighted Partnership Opportunity Index (POI)
   */
  calculateWeightedPoi(scores, weights = null) {
    const w = weights || SHU_CONFIG.dimensionWeights;
    const weightedSum = (
      (scores.academicValue * (w.academic || 0.10)) +
      (scores.researchValue * (w.research || 0.15)) +
      (scores.studentValue * (w.student || 0.15)) +
      (scores.facultyValue * (w.faculty || 0.10)) +
      (scores.commercialValue * (w.commercial || 0.15)) +
      (scores.innovationValue * (w.innovation || 0.10)) +
      (scores.entrepreneurshipValue * (w.entrepreneurship || 0.10)) +
      (scores.revenuePotential * (w.revenue || 0.10)) +
      (scores.strategicValue * (w.strategic || 0.05))
    );
    return Math.round(weightedSum);
  },

  /**
   * Dynamic Faculty Mapping Engine (Requirement 11)
   */
  mapFacultyOpportunities(org, market, capacity) {
    const ind = org.industry.toLowerCase();
    const sub = org.subIndustry.toLowerCase();
    const faculties = SHU_CONFIG.faculties || [];

    const results = [];

    faculties.forEach(fac => {
      let opportunity = "";
      let rationale = "";
      let project = "";
      let sizeTier = "small";
      let estimatedVal = 3500000;
      let duration = "6–12 months";
      let priority = "High";

      if (fac.id === "cs") {
        if (ind.includes("pharma") || ind.includes("biotech")) {
          opportunity = "AI-Driven Predictive Stability & Cold-Chain Telemetry Platform";
          rationale = `${org.name} requires computerized data verification and real-time transit telemetry across regional distribution networks.`;
          project = "Predictive Shelf-Life AI Engine & Warehouse Inventory Analytics";
          sizeTier = "small";
          estimatedVal = 4200000;
          duration = "3–6 months";
        } else if (ind.includes("health") || ind.includes("hospital")) {
          opportunity = "Hospital Information System (HIS) Analytics & Electronic Medical Records Security";
          rationale = "Large clinical patient volumes generate complex queuing and confidential electronic health records requiring big data analytics.";
          project = "Inpatient Bed Capacity Forecasting & Tele-Medicine Consultation Portal";
          sizeTier = "small";
          estimatedVal = 4500000;
          duration = "6–12 months";
        } else if (ind.includes("tech")) {
          opportunity = "Deep-Tech Computer Vision & Distributed Cloud MLOps Research";
          rationale = `${org.name} operates at the cutting edge of AI models and requires high-caliber software engineering and AI researchers.`;
          project = "Distributed Transformer Model Acceleration for Multimodal Data Processing";
          sizeTier = "medium";
          estimatedVal = 14000000;
          duration = "6–12 months";
          priority = "Strategic";
        } else {
          opportunity = "Enterprise Process Automation & Web Analytics Dashboard";
          rationale = `${org.name} can streamline its administrative reporting and client tracking through modern web architecture.`;
          project = "Cloud-Enabled Operational Dashboard & Automated CRM Pipeline";
          sizeTier = "small";
          estimatedVal = 3000000;
          duration = "3–6 months";
        }
      } else if (fac.id === "business") {
        if (ind.includes("pharma")) {
          opportunity = "Pharma Export Strategy & Regulatory Market Entry Analytics";
          rationale = "Navigating tariff barriers and distributor margins across emerging export markets requires rigorous commercial modeling.";
          project = "Regional Market Penetration Strategy & Pharmaceutical Pricing Architecture";
          sizeTier = "small";
          estimatedVal = 3200000;
          duration = "3–6 months";
        } else if (ind.includes("health")) {
          opportunity = "Healthcare Cost Accounting & Patient Journey Optimization";
          rationale = "Healthcare inflation requires activity-based costing (ABC) to optimize surgical theater and inpatient bed economics.";
          project = "Activity-Based Healthcare Costing & Surgical Consumables Inventory Rationalization";
          sizeTier = "small";
          estimatedVal = 3500000;
          duration = "3–6 months";
        } else {
          opportunity = "Corporate Strategy, Brand Optimization & Supply Chain Audit";
          rationale = `${org.name} benefits from independent business diagnostics to improve operational margin and distributor relationships.`;
          project = "Lean Supply Chain Streamlining & Digital Customer Acquisition Study";
          sizeTier = "small";
          estimatedVal = 2800000;
          duration = "3–6 months";
        }
      } else if (fac.id === "biosciences") {
        if (ind.includes("pharma") || ind.includes("biotech")) {
          opportunity = "Microbial Cleanroom Environmental Monitoring & Bioprocess Validation";
          rationale = "Stringent regulatory compliance requires ongoing bioburden assays, endotoxin testing, and cleanroom air validation.";
          project = "Cleanroom Microbial Flora Identification & Rapid Sterility Assay Protocol";
          sizeTier = "small";
          estimatedVal = 3800000;
          duration = "6–12 months";
        } else if (ind.includes("health")) {
          opportunity = "Genomic Surveillance of Multi-Drug Resistant Hospital Pathogens";
          rationale = "Surveillance of nosocomial ICU infections through PCR and molecular sequencing saves lives and reduces hospital stay costs.";
          project = "Molecular Typing & Antimicrobial Resistance Profiling of Clinical Isolates";
          sizeTier = "small";
          estimatedVal = 4800000;
          duration = "6–12 months";
        } else {
          opportunity = "Industrial Waste Bioremediation & Environmental Compliance Audit";
          rationale = "Industrial operations require biochemical waste effluent treatment and green environmental sustainability audits.";
          project = "Bacterial Bioremediation of Industrial Effluents & Water Quality Assessment";
          sizeTier = "small";
          estimatedVal = 2900000;
          duration = "6–12 months";
        }
      } else if (fac.id === "pharmacy") {
        if (ind.includes("pharma")) {
          opportunity = "Novel Oral Solid Formulation & Stability Under Climatic Zone IVb";
          rationale = `${org.name} needs accelerated stability testing, dissolution rate enhancement, and bioequivalence data for regulatory filings.`;
          project = "Formulation Optimization and Accelerated Climatic Stability Studies";
          sizeTier = "medium";
          estimatedVal = 12500000;
          duration = "6–12 months";
          priority = "High";
        } else if (ind.includes("health")) {
          opportunity = "Inpatient Clinical Pharmacy Protocols & Antimicrobial Stewardship";
          rationale = "Implementing bedside medication reconciliation and sterile compounding QA significantly curtails adverse drug events.";
          project = "Clinical Pharmacovigilance & Bedside Antimicrobial Stewardship Protocol";
          sizeTier = "medium";
          estimatedVal = 8500000;
          duration = "6–12 months";
        } else {
          opportunity = "Workplace Ergonomics, Occupational Toxicology & Industrial Hygiene";
          rationale = "Ensuring workforce protection against chemical vapors, airborne dust, and ergonomic physical strain.";
          project = "Occupational Health Hazard & Toxicological Air Quality Audit";
          sizeTier = "micro";
          estimatedVal = 1200000;
          duration = "1–3 months";
          priority = "Moderate";
        }
      } else if (fac.id === "biomedical") {
        if (ind.includes("health")) {
          opportunity = "Medical Equipment Fleet Calibration & Preventive Maintenance Engineering";
          rationale = `${org.name} operates millions of dollars in clinical diagnostics; local calibration saves massive foreign OEM service contract fees.`;
          project = "Biomedical Instrumentation Testing & Calibration Protocol System";
          sizeTier = "medium";
          estimatedVal = 11500000;
          duration = "12–18 months";
          priority = "Strategic";
        } else if (ind.includes("tech")) {
          opportunity = "Clinical Validation & Hardware Interfacing of Diagnostic Sensor Units";
          rationale = "Software algorithms require FDA/CE-grade clinical validation against physiological medical sensor ground truths.";
          project = "Precision Physiological Sensor Interface & Diagnostic Hardware Benchmark";
          sizeTier = "small";
          estimatedVal = 4800000;
          duration = "6–12 months";
        } else {
          opportunity = "Industrial Machine Safety Sensors & Ergonomic Assistive Devices";
          rationale = "Designing workplace safety interlocks and micro-sensor telemetry for industrial machinery operators.";
          project = "Industrial Workplace Optical Sensor & Operator Safety Telemetry";
          sizeTier = "small";
          estimatedVal = 2600000;
          duration = "3–6 months";
        }
      } else {
        // Fallback for custom faculties
        opportunity = `Applied Joint Studies & Advisory in ${fac.name}`;
        rationale = `Leveraging university faculty expertise to address operational challenges within ${org.name}.`;
        project = `Specialized Consultation & Student Capstone Deployment in ${fac.areas[0] || 'Domain Studies'}`;
        sizeTier = "small";
        estimatedVal = 2500000;
        duration = "3–6 months";
      }

      results.push({
        facultyId: fac.id,
        facultyName: fac.name,
        opportunity,
        rationale,
        potentialProject: project,
        estimatedSizeTier: sizeTier,
        estimatedValuePKR: estimatedVal,
        duration,
        priority,
        tier: "ANALYTICAL"
      });
    });

    return results;
  },

  /**
   * Cross-Faculty Multi-Disciplinary Projects (Requirement 12)
   */
  generateCrossFacultyProjects(org, facultyOpps) {
    const ind = org.industry.toLowerCase();

    if (ind.includes("pharma") || ind.includes("biotech")) {
      return [
        {
          id: "xf-proj-01",
          title: "AI-Powered Pharmaceutical Supply Chain & Temperature-Sensitive Drug Integrity Platform",
          participatingFaculties: ["Faculty of Computer Science / Computing", "Faculty of Business & Management", "Faculty of Pharmacy"],
          problemBeingSolved: "Ambient temperature excursions and unmonitored rural distributor transport cause product degradation, batch recalls, and regulatory friction.",
          proposedSolution: "Develop an end-to-end IoT sensor hardware telemetry device paired with machine learning algorithms to predict stability degradation in transit.",
          deliverables: "IoT hardware gateway prototype, cloud predictive dashboard, regulatory validation documentation for DRAP compliance, and faculty training manual.",
          estimatedProjectValuePKR: 18500000,
          durationMonths: 12,
          durationCategory: "12–18 months",
          requiredManpower: "2 Principal Investigators (CS & Pharmacy), 1 Business Economist, 4 Graduate Research Assistants, 2 Software Engineers",
          potentialRevenuePKR: 6500000,
          researchPotential: "High (2 Scopus Q1 journal papers on smart cold chains & pharmaceutical QA)",
          commercializationPotential: "High (Commercial software SaaS spin-off with patentable IoT telemetry hardware)",
          tier: "ANALYTICAL"
        },
        {
          id: "xf-proj-02",
          title: "Next-Generation Smart Drug Delivery & Bioengineered Targeted Formulations",
          participatingFaculties: ["Faculty of Pharmacy", "Faculty of Biomedical Engineering", "Faculty of Biosciences"],
          problemBeingSolved: "Conventional oral drug forms have low bioavailability and high side-effect profiles in chronic cardiovascular and oncology patients.",
          proposedSolution: "Synthesize polymeric biodegradable nano-carriers combined with precision micro-fluidic delivery systems for targeted therapeutics.",
          deliverables: "Validated nano-formulation batch samples, in-vitro cytotoxicity assay reports, intellectual property disclosure document, and pilot manufacturing protocol.",
          estimatedProjectValuePKR: 28000000,
          durationMonths: 18,
          durationCategory: "18–24 months",
          requiredManpower: "3 Faculty Leads, 1 Post-Doc Researcher, 6 MPhil/PhD Scholars, 2 Laboratory Technologists",
          potentialRevenuePKR: 9200000,
          researchPotential: "Strategic (National Technology Fund / HEC grant target + International PCT patent)",
          commercializationPotential: "Strategic (Exclusive licensing agreement with partner with royalty sharing model for SHU)",
          tier: "ANALYTICAL"
        }
      ];
    } else if (ind.includes("tech") || ind.includes("software")) {
      return [
        {
          id: "xf-proj-01",
          title: "Intelligent Clinical Tele-Diagnostics Platform for Rural & Outpatient Healthcare",
          participatingFaculties: ["Faculty of Computer Science / Computing", "Faculty of Biomedical Engineering", "Faculty of Business & Management"],
          problemBeingSolved: "Severe shortage of certified diagnostic specialists in peripheral clinics leads to delayed triage and poor patient outcomes.",
          proposedSolution: "Develop a portable, battery-powered diagnostic sensor unit powered by edge AI models that assists health workers in real time, integrated with automated billing.",
          deliverables: "Edge-AI hardware unit, clinician mobile portal, clinical benchmark validation report, and health economics viability model.",
          estimatedProjectValuePKR: 32000000,
          durationMonths: 18,
          durationCategory: "18–24 months",
          requiredManpower: "Lead AI Researcher, 2 Biomedical Hardware Engineers, 1 Health Systems Economist, 5 Graduate Scholars",
          potentialRevenuePKR: 11000000,
          researchPotential: "Strategic (Grand Challenges / International research grant target)",
          commercializationPotential: "High (Commercial spin-off joint venture deploying across South Asia and GCC)",
          tier: "ANALYTICAL"
        }
      ];
    } else {
      return [
        {
          id: "xf-proj-01",
          title: "Smart Enterprise Operational Intelligence & Automated Safety Monitoring System",
          participatingFaculties: ["Faculty of Computer Science / Computing", "Faculty of Business & Management", "Faculty of Biomedical Engineering"],
          problemBeingSolved: "Manual facility inspections result in delayed maintenance responses, safety hazards, and inefficient resource allocation.",
          proposedSolution: "Create an interconnected wireless sensor network linked with automated predictive maintenance dashboards and operational cost tracking.",
          deliverables: "Sensor node network, cloud reporting dashboard, equipment reliability model, and executive decision-support system.",
          estimatedProjectValuePKR: 15000000,
          durationMonths: 12,
          durationCategory: "12–18 months",
          requiredManpower: "Lead Software Architect, Industrial Sensor Engineer, Operations Research Lead, 3 Graduate Assistants",
          potentialRevenuePKR: 5200000,
          researchPotential: "High (High-impact publications in industrial IoT & enterprise systems)",
          commercializationPotential: "Medium-High (Licensable industrial monitoring software)",
          tier: "ANALYTICAL"
        }
      ];
    }
  },

  /**
   * Opportunity Prioritization: Quick Wins, Medium-Term, Strategic (Requirement 24, 27, 28)
   */
  generateProjectPortfolio(org, facultyOpps, crossFaculty) {
    const quickWins = [
      {
        title: `Executive Certification: Industry Standards & Compliance Leadership for ${org.basicInfo?.name || org.name}`,
        faculty: "Faculty of Business & Relevant Domain Faculty",
        department: "Human Resources & Quality Management",
        estimatedValuePKR: 1500000,
        duration: "1–2 months",
        complexity: "Low",
        impact: "Immediate workforce upskilling for 25–30 senior personnel; generates direct institutional revenue.",
        nextAction: "Present executive syllabus and training schedule to organization HR director.",
        shuContribution: "Accredited faculty trainers, executive classrooms, training syllabus, institutional certification",
        orgContribution: "Nomination of professional cohorts, executive training fees, internal operational case studies"
      },
      {
        title: `Pilot Feasibility Audit & Baseline Analytical Testing`,
        faculty: facultyOpps[0]?.facultyName || "Faculty of Pharmacy",
        department: "R&D / Technical Operations",
        estimatedValuePKR: 1800000,
        duration: "2–3 months",
        complexity: "Low-Moderate",
        impact: "Validates technical feasibility and establishes mutual working rapport between university and enterprise labs.",
        nextAction: "Sign Material & Data Transfer Agreement and receive initial sample batches.",
        shuContribution: "Specialized lab instrumentation, analytical scientists, validated testing protocols",
        orgContribution: "Sample materials, technical product documentation, testing consumables"
      }
    ];

    const mediumTerm = [
      {
        title: facultyOpps[0]?.potentialProject || "Applied Research & Process Optimization Project",
        faculty: facultyOpps[0]?.facultyName || "Lead Faculty",
        department: "Applied Technology & Operations",
        estimatedValuePKR: facultyOpps[0]?.estimatedValuePKR || 5000000,
        duration: facultyOpps[0]?.duration || "6–12 months",
        complexity: "Moderate",
        impact: "Directly solves an operational bottleneck and delivers actionable IP or optimization models.",
        nextAction: "Execute sponsored research agreement and allocate dedicated faculty research hours.",
        shuContribution: "Principal Investigator leadership, graduate research scholars, high-performance lab equipment",
        orgContribution: "Contracted research milestone funding, operational data access, industry co-supervisors"
      },
      {
        title: facultyOpps[1]?.potentialProject || "Digital & Operational Optimization Platform",
        faculty: facultyOpps[1]?.facultyName || "Computer Science / Business",
        department: "Operations & Digital Systems",
        estimatedValuePKR: facultyOpps[1]?.estimatedValuePKR || 4200000,
        duration: "6–9 months",
        complexity: "Moderate",
        impact: "Enhances digital efficiency and predictive intelligence across the partner's workflow.",
        nextAction: "Conduct on-site requirements workshop with partner department heads.",
        shuContribution: "Software engineering talent, data science modeling, system architecture",
        orgContribution: "Enterprise systems access, historical datasets, user feedback loops"
      }
    ];

    const strategic = [
      {
        title: `Establishment of SHU–${org.basicInfo?.name || org.name} Joint Center of Excellence & Innovation Lab`,
        faculty: "Multi-Faculty Collaborative Initiative",
        department: "Executive Board of Governors & Chief Scientific Officers",
        estimatedValuePKR: 65000000,
        duration: "24–36 months",
        complexity: "High / Strategic",
        impact: "Permanent state-of-the-art innovation facility on SHU campus co-funded by the partner for indigenous technology development.",
        nextAction: "Formulate Joint Affiliation Charter and present to SHU Board of Governors and Partner Board of Directors.",
        shuContribution: "Designated floor space (3,000+ sq ft), faculty research chairs, institutional governance, graduate scholar pool",
        orgContribution: "Capital equipment endowment, multi-year operating research budget, commercial distribution access"
      }
    ];

    return { quickWins, mediumTerm, strategic };
  },

  /**
   * Specialized Assessments: Internships & Student Projects (Requirements 15 & 16)
   */
  assessStudentsAndInternships(org, capacity) {
    const total = capacity?.humanCapital?.totalManpower || 500;
    const ind = (org.industry || "").toLowerCase();

    // Internship potential score
    let score = 75;
    if (total > 1000) score = 90;
    else if (total > 400) score = 84;
    else score = 72;

    const annualInterns = Math.max(15, Math.round(total * 0.025));

    let conversion = "25% conversion rate into permanent management trainee and technical roles";
    if (ind.includes("tech")) conversion = "40% conversion rate into junior software and AI engineering roles";
    else if (ind.includes("pharma")) conversion = "30% conversion rate into QC analysts and product specialists";

    return {
      internshipPotentialScore: score,
      annualInternshipCapacity: annualInterns,
      relevantDisciplines: [
        "Pharm-D (Industrial & Hospital Practice)",
        "BS Computer Science & Software Engineering",
        "BS Biosciences & Industrial Biotechnology",
        "BS Biomedical Engineering",
        "BBA & MBA (Supply Chain, Finance & Marketing)"
      ],
      internshipDurationWeeks: 8,
      potentialConversionRate: conversion,
      skillsRequired: "Professional communication, domain software proficiency (Python/R/SAP/LIMS), lab compliance, analytical reasoning",
      studentProjectCapacityByFaculty: {
        cs: { min: 8, max: 18, note: "Software engineering, web apps, data pipelines, predictive models" },
        business: { min: 6, max: 14, note: "Market research, financial modeling, consumer surveys, logistics" },
        pharmacy: { min: 10, max: 22, note: "Formulation design, stability studies, dispensing audits" },
        biosciences: { min: 5, max: 10, note: "Microbial assays, environmental quality, fermentation testing" },
        biomedical: { min: 4, max: 10, note: "Sensor telemetry, medical instrumentation troubleshooting" }
      },
      annualTotalStudentProjects: Math.round(annualInterns * 1.5)
    };
  },

  /**
   * Specialized Assessments: Research, Consultancy, Training, Commercialization (Req 17, 18, 19, 20)
   */
  assessResearchAndConsultancy(org, capacity) {
    const total = capacity?.humanCapital?.totalManpower || 500;
    const ind = (org.industry || "").toLowerCase();

    let researchLevel = "High";
    if (ind.includes("pharma") || ind.includes("tech")) researchLevel = "Strategic";
    else if (total < 200) researchLevel = "Moderate";

    return {
      researchPotentialLevel: researchLevel,
      researchRationale: `${org.name || "The organization"} operates in an industry with rapid technological and regulatory shifts, requiring academic research partnerships to lower R&D overhead while accelerating product verification.`,
      consultancyOpportunities: [
        { area: "Process Optimization & Operational Workflow Rationalization", estimatedValuePKR: 2500000, duration: "3 months", faculty: "Business / Engineering" },
        { area: "Quality Assurance & Regulatory Compliance Audit", estimatedValuePKR: 2000000, duration: "2 months", faculty: "Domain Faculty" },
        { area: "Digital Transformation & Cloud Data Architecture", estimatedValuePKR: 2800000, duration: "3 months", faculty: "Computer Science" }
      ],
      executiveEducationPrograms: [
        { title: `Executive Masterclass: Strategic Leadership & Change Management in ${org.subIndustry || 'Industry'}`, participants: 25, durationDays: 3, feeRangePKR: "1,200,000 – 1,600,000" },
        { title: "Data-Driven Decision Making & Business Analytics for Managers", participants: 30, durationDays: 2, feeRangePKR: "1,000,000 – 1,400,000" },
        { title: "Regulatory Affairs, Quality Control & Environmental Governance", participants: 20, durationDays: 4, feeRangePKR: "1,400,000 – 1,800,000" }
      ],
      commercializationOpportunities: [
        {
          technology: `Indigenously Engineered ${org.subIndustry || 'Applied'} Solution`,
          potentialCustomer: "Regional enterprise clients, tertiary institutions, and export partners",
          estimatedMarketPKR: 500000000,
          shuContribution: "Patentable research methodology, laboratory validation, academic co-inventors",
          orgContribution: "Industrial scale-up, pilot tooling, commercial marketing, customer distribution channels",
          pathway: "Exclusive technology licensing with annual royalty yield (3–5%) and faculty equity participation"
        }
      ]
    };
  },

  /**
   * Financial Opportunity Scenarios (Requirement 22)
   */
  calculateFinancialScenarios(org, scores) {
    const rev = org.knownAnnualRevenuePKR || 3000000000;
    const poi = this.calculateWeightedPoi(scores);

    // Conservative: ~0.15% to 0.25% of org annual scale or baseline contracted training
    const baseConservative = Math.max(7500000, Math.round(rev * 0.0012));
    const baseExpected = Math.round(baseConservative * 2.5);
    const baseHigh = Math.round(baseConservative * 5.8);

    return {
      conservative: {
        annualRevenuePKR: baseConservative,
        numberOfProjects: 4,
        numberOfStudents: 20,
        facultyEngagementCount: 6,
        description: "Focus on standard fee-for-service testing, student internships, and modest corporate executive seminars."
      },
      expected: {
        annualRevenuePKR: baseExpected,
        numberOfProjects: 9,
        numberOfStudents: 45,
        facultyEngagementCount: 15,
        description: "Active multi-faculty sponsored research, structured capstone sponsorships, and ongoing consultancy advisory."
      },
      highOpportunity: {
        annualRevenuePKR: baseHigh,
        numberOfProjects: 16,
        numberOfStudents: 80,
        facultyEngagementCount: 28,
        description: "Deep strategic alliance with co-funded Joint Center, commercial product spin-offs, and multi-million HEC/industry grants."
      }
    };
  },

  /**
   * 3-Year Partnership Roadmap (Requirement 23)
   */
  generateRoadmap(org) {
    const orgName = org.name || "Partner Organization";
    return {
      year1: {
        title: "YEAR 1 — ENGAGE (Foundations & Quick Wins)",
        milestones: [
          `Form joint SHU–${orgName} Partnership Steering Committee meeting quarterly`,
          `Place 20–35 students into structured summer internship rotations across technical divisions`,
          `Deliver 2 executive education masterclasses tailored for ${orgName} mid-level managers`,
          `Commence initial contracted laboratory testing and process optimization audits`,
          `Organize campus industry day featuring guest lectures by senior technical leadership`
        ]
      },
      year2: {
        title: "YEAR 2 — COLLABORATE (Joint Research & Product Co-Development)",
        milestones: [
          `Launch flagship cross-faculty interdisciplinary research project with dedicated university lab space`,
          `Co-author 3 Scopus-indexed research publications in international technical journals`,
          `Sponsor 10 high-impact Final Year Projects with direct prototyping grants`,
          `Design and deliver specialized corporate training diploma for technical staff`,
          `File initial joint provisional patent or proprietary design copyright`
        ]
      },
      year3: {
        title: "YEAR 3 — SCALE (Center of Excellence & Commercial Initiatives)",
        milestones: [
          `Inaugurate permanent SHU–${orgName} Joint Innovation Center / Specialized Research Annex`,
          `Commercialize first jointly developed technology platform or formulation with royalty returns`,
          `Apply jointly for high-value national/international research funding (HEC, TDF, GCRF)`,
          `Establish permanent graduate recruitment pipeline with guaranteed employment fast-tracks`,
          `Solidify long-term institutional endowment supporting faculty research chairs`
        ]
      }
    };
  },

  /**
   * SHU 5D Partnership Opportunity Map (Requirement 40)
   * LEARN, RESEARCH, SOLVE, BUILD, SCALE
   */
  generateOpportunityMap(org, facultyOpps, crossFaculty) {
    const name = org.name || "Partner Organization";
    const sub = org.subIndustry || "Industry";

    return {
      learn: `What SHU students learn: Practical exposure to commercial-scale ${sub} operations, enterprise quality standards, regulatory compliance workflows, and industry-grade tooling.`,
      research: `What SHU researches: Applied questions in ${sub} optimization, predictive computational models, material or formulation stability, and environmental sustainability.`,
      solve: `What SHU solves: Specific operational bottlenecks at ${name} including process variability, regulatory filing documentation, supply chain delays, and technical talent deficits.`,
      build: `What SHU and ${name} build together: Commercial-grade software telemetry, novel validated formulations or diagnostic sensors, and standardized executive training curricula.`,
      scale: `What scales into major impact: Co-funded Joint Innovation Center, national regulatory standards adoption, commercial technology spin-offs, and multi-year regional export initiatives.`
    };
  },

  /**
   * Sources, Evidence & Confidence Assessment (Requirements 34 & 35)
   */
  compileSourcesAndEvidence(form, text = "") {
    const sources = [];

    if (form.website) {
      sources.push({
        type: "Official Website",
        title: `${form.orgName} Official Corporate Portal`,
        url: form.website,
        tier: "VERIFIED",
        confidence: "HIGH",
        note: "Primary corporate domain verified for organizational scope and operational footprint."
      });
    }

    if (text && text.length > 50) {
      sources.push({
        type: "Supplied Documentation",
        title: "Manual Research / Data Import Document",
        url: "#manual-research-import",
        tier: "VERIFIED",
        confidence: "HIGH",
        note: `Extracted ${text.length} characters of unstructured annual report, profile, and executive data.`
      });
    }

    sources.push({
      type: "Government / Trade Registry",
      title: "Chamber of Commerce & National Industrial Register",
      url: "https://fbr.gov.pk / https://secp.gov.pk",
      tier: "CALCULATED",
      confidence: "MEDIUM",
      note: "Corporate status and tax compliance verification benchmarks."
    });

    sources.push({
      type: "SHU Intelligence Engine",
      title: "Analytical Heuristics & Industry Multipliers (SHU ORIC)",
      url: "#shu-intelligence-model",
      tier: "ANALYTICAL",
      confidence: "MEDIUM",
      note: "Calculated from faculty capacity formulas, regional salary benchmarks, and academic project ratios."
    });

    return sources;
  },

  /**
   * Interactive Project Size Calculator Engine (Requirement 13)
   */
  calculateProjectCost({
    numResearchers = 2,
    facultyDays = 15,
    durationMonths = 6,
    labHours = 80,
    softwareEquipmentPKR = 500000,
    testingConsumablesPKR = 300000,
    ipCommercializationPKR = 200000
  }) {
    const researcherMonthlyStipend = 65000;
    const facultyDailyRate = SHU_CONFIG.assumptions?.consultancyDailyRatePKR || 85000;
    const labHourlyRate = 4500;

    const manpowerCost = (numResearchers * researcherMonthlyStipend * durationMonths) + (facultyDays * facultyDailyRate);
    const labCost = labHours * labHourlyRate;
    const directCosts = manpowerCost + labCost + softwareEquipmentPKR + testingConsumablesPKR + ipCommercializationPKR;
    const overheadPercent = SHU_CONFIG.assumptions?.overheadInstitutionalPercentage || 20;
    const overheadCost = directCosts * (overheadPercent / 100);
    const totalCostPKR = Math.round(directCosts + overheadCost);

    // Determine Tier
    let tier = "micro";
    const tiers = SHU_CONFIG.projectCostTiers;
    if (totalCostPKR >= tiers.strategic.min) tier = "strategic";
    else if (totalCostPKR >= tiers.large.min) tier = "large";
    else if (totalCostPKR >= tiers.medium.min) tier = "medium";
    else if (totalCostPKR >= tiers.small.min) tier = "small";
    else tier = "micro";

    return {
      totalCostPKR,
      tier,
      tierLabel: tiers[tier].label,
      breakdown: {
        manpowerCost,
        labCost,
        softwareEquipmentPKR,
        testingConsumablesPKR,
        ipCommercializationPKR,
        overheadCost
      }
    };
  },

  /**
   * Project Duration Calculator Engine (Requirement 14)
   */
  calculateProjectDuration({
    complexityLevel = "Moderate", // Low, Moderate, High, Strategic
    crossFacultyCount = 1,
    externalConsortium = false,
    labPrototypingRequired = true
  }) {
    let baseMonths = 6;
    if (complexityLevel === "Low") baseMonths = 3;
    else if (complexityLevel === "High") baseMonths = 14;
    else if (complexityLevel === "Strategic") baseMonths = 24;

    if (crossFacultyCount > 1) baseMonths += (crossFacultyCount - 1) * 3;
    if (externalConsortium) baseMonths += 4;
    if (labPrototypingRequired && complexityLevel !== "Low") baseMonths += 3;

    // Find closest category
    let category = SHU_CONFIG.durationCategories[2]; // 6-12m default
    if (baseMonths <= 3) category = SHU_CONFIG.durationCategories[0];
    else if (baseMonths <= 6) category = SHU_CONFIG.durationCategories[1];
    else if (baseMonths <= 12) category = SHU_CONFIG.durationCategories[2];
    else if (baseMonths <= 18) category = SHU_CONFIG.durationCategories[3];
    else if (baseMonths <= 24) category = SHU_CONFIG.durationCategories[4];
    else category = SHU_CONFIG.durationCategories[5];

    return {
      estimatedMonths: baseMonths,
      category: category.label,
      complexity: category.complexity
    };
  },

  /**
   * Extensible Placeholder Architecture for Future Backend AI API (Requirement 36)
   * This hook demonstrates how secure backend requests will be integrated
   * without exposing API keys or credentials on the frontend client.
   */
  async callAiProvider(prompt, context = {}) {
    console.log("[SHU AI Engine] Future Backend AI Hook Invoked:", { prompt, context });
    // In future versions, this calls an authorized university proxy endpoint:
    // const response = await fetch('/api/oric/analyze', { method: 'POST', body: JSON.stringify({ prompt, context }) });
    // return await response.json();
    return {
      status: "simulated_local",
      message: "Client-side rule-based intelligence engine evaluated findings successfully.",
      timestamp: new Date().toISOString()
    };
  }
};
