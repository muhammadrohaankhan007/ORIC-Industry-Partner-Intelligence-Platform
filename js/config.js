/**
 * SHU INDUSTRY PARTNER INTELLIGENCE & OPPORTUNITY ASSESSMENT PLATFORM
 * System Configuration & Default Settings
 */

const SHU_CONFIG = {
  // Institution branding
  institution: {
    name: "Salim Habib University",
    shortName: "SHU",
    division: "ORIC — Office of Research, Innovation & Commercialization",
    subTitle: "University–Industry Partnership Intelligence & Opportunity Assessment System",
    logoText: "SHU-ORIC",
    tagline: "Bridging Academia, Innovation & Industry Value"
  },

  // Data Integrity Classification Categories (Requirement 3)
  dataTiers: {
    VERIFIED: {
      label: "VERIFIED",
      code: "VERIFIED",
      description: "Information directly obtained from credible primary sources",
      className: "badge-verified",
      color: "#059669"
    },
    CALCULATED: {
      label: "CALCULATED",
      code: "CALCULATED",
      description: "Information mathematically derived from verified or known data",
      className: "badge-calculated",
      color: "#0284c7"
    },
    ESTIMATED: {
      label: "ESTIMATED",
      code: "ESTIMATED",
      description: "Reasonable estimates based on available evidence and benchmarks",
      className: "badge-estimated",
      color: "#d97706"
    },
    ANALYTICAL: {
      label: "ANALYTICAL",
      code: "ANALYTICAL",
      description: "Strategic conclusions & AI analytical assessments generated from intelligence engine",
      className: "badge-analytical",
      color: "#7c3aed"
    }
  },

  // Confidence Levels (Requirement 35)
  confidenceLevels: {
    HIGH: { label: "High Confidence", score: 90, className: "conf-high", color: "#10b981" },
    MEDIUM: { label: "Medium Confidence", score: 65, className: "conf-med", color: "#f59e0b" },
    LOW: { label: "Low Confidence", score: 35, className: "conf-low", color: "#ef4444" }
  },

  // Default Configurable SHU Faculties (Requirement 10)
  faculties: [
    {
      id: "cs",
      name: "Faculty of Computer Science / Computing",
      shortName: "Computing & CS",
      color: "#2563eb",
      areas: [
        "Artificial Intelligence & Machine Learning",
        "Data Science & Advanced Analytics",
        "Cybersecurity & Info Assurance",
        "Software Engineering & Cloud Systems",
        "Internet of Things (IoT) & Smart Devices",
        "Blockchain & Distributed Ledgers",
        "Business Intelligence & Automation",
        "Digital Transformation & Mobile Solutions"
      ]
    },
    {
      id: "business",
      name: "Faculty of Business & Management",
      shortName: "Business & Mgmt",
      color: "#0d9488",
      areas: [
        "Corporate Strategy & Business Modeling",
        "Digital Marketing & Brand Analytics",
        "Financial Engineering & Investment",
        "Human Resources & Org Development",
        "Supply Chain Management & Logistics",
        "Entrepreneurship & Corporate Incubation",
        "Business Analytics & Optimization",
        "International Business & Export Strategy",
        "ESG, Sustainability & CSR Governance",
        "Fintech & Digital Business Strategy"
      ]
    },
    {
      id: "biosciences",
      name: "Faculty of Biosciences",
      shortName: "Biosciences",
      color: "#16a34a",
      areas: [
        "Applied Biotechnology & Bioprocess",
        "Microbiology & Industrial Fermentation",
        "Molecular Biology & Genomics",
        "Food Biotechnology & Quality Assurance",
        "Environmental Biotechnology & Bioremediation",
        "Industrial Biotechnology & Enzymes",
        "Bioinformatics & Computational Biology",
        "Agricultural & Plant Biotechnology"
      ]
    },
    {
      id: "pharmacy",
      name: "Faculty of Pharmacy",
      shortName: "Pharmacy",
      color: "#d97706",
      areas: [
        "Pharmaceutical Formulation & Novel Drug Delivery",
        "Drug Discovery & Synthetic Chemistry",
        "Pharmacology & Toxicological Profiling",
        "Quality Control, QA & Analytical Chemistry",
        "Regulatory Affairs & Pharmacovigilance",
        "Clinical Research & Bioequivalence Studies",
        "Good Manufacturing Practice (GMP) Optimization",
        "Phytochemistry & Herbal Medicine Standardization"
      ]
    },
    {
      id: "biomedical",
      name: "Faculty of Biomedical Engineering",
      shortName: "Biomedical Eng",
      color: "#9333ea",
      areas: [
        "Medical Devices & Diagnostic Instrumentation",
        "Biomedical Instrumentation & Biosensors",
        "Medical Imaging Systems & Processing",
        "Rehabilitation Engineering & Assistive Tech",
        "Prosthetics, Orthotics & Biomaterials",
        "AI in Healthcare & Computer-Aided Diagnosis",
        "Digital Health Platforms & Telemedicine",
        "Medical Robotics & Minimally Invasive Systems"
      ]
    }
  ],

  // Project Size Tiers in PKR (Requirement 13)
  projectCostTiers: {
    micro: { label: "Micro", min: 250000, max: 1000000, color: "#64748b" },
    small: { label: "Small", min: 1000000, max: 5000000, color: "#0284c7" },
    medium: { label: "Medium", min: 5000000, max: 25000000, color: "#059669" },
    large: { label: "Large", min: 25000000, max: 100000000, color: "#d97706" },
    strategic: { label: "Strategic", min: 100000000, max: 500000000, color: "#7c3aed" }
  },

  // Project Duration Categories (Requirement 14)
  durationCategories: [
    { id: "1-3m", label: "1–3 months", complexity: "Low Complexity", defaultMonths: 2 },
    { id: "3-6m", label: "3–6 months", complexity: "Moderate Complexity", defaultMonths: 4.5 },
    { id: "6-12m", label: "6–12 months", complexity: "Significant Complexity", defaultMonths: 9 },
    { id: "12-18m", label: "12–18 months", complexity: "High Complexity", defaultMonths: 15 },
    { id: "18-24m", label: "18–24 months", complexity: "Advanced Interdisciplinary", defaultMonths: 21 },
    { id: "24m+", label: "24+ months", complexity: "Strategic Enterprise Program", defaultMonths: 30 }
  ],

  // Partnership Opportunity Index (POI) Dimension Default Weights (Requirement 21)
  dimensionWeights: {
    academic: 0.10,        // 10%
    research: 0.15,        // 15%
    student: 0.15,         // 15%
    faculty: 0.10,         // 10%
    commercial: 0.15,      // 15%
    innovation: 0.10,      // 10%
    entrepreneurship: 0.10,// 10%
    revenue: 0.10,         // 10%
    strategic: 0.05        // 5%
  },

  // Multi-Currency Exchange Rates relative to PKR base (Requirement 33)
  currencies: {
    PKR: { code: "PKR", symbol: "PKR ", rate: 1.0, isBase: true },
    USD: { code: "USD", symbol: "$", rate: 0.00357 }, // 1 USD ~ 280 PKR
    AED: { code: "AED", symbol: "AED ", rate: 0.0131 }, // 1 AED ~ 76.3 PKR
    GBP: { code: "GBP", symbol: "£", rate: 0.00281 }, // 1 GBP ~ 355.8 PKR
    EUR: { code: "EUR", symbol: "€", rate: 0.00327 }  // 1 EUR ~ 305.8 PKR
  },

  activeCurrency: "PKR",

  // Training & Consultancy Pricing Models (Requirement 18 & 19)
  assumptions: {
    executiveTrainingFeePerSeatPKR: 45000,
    consultancyDailyRatePKR: 85000,
    averageFypSponsorshipPKR: 350000,
    internshipMonthlyStipendPKR: 25000,
    overheadInstitutionalPercentage: 20
  }
};

/**
 * Currency Formatter Utility
 * Formats a PKR amount into the active currency with appropriate symbol and commas.
 */
function formatCurrency(amountInPKR, currencyCode = null) {
  if (amountInPKR === null || amountInPKR === undefined || isNaN(amountInPKR)) {
    return "N/A";
  }
  const currKey = currencyCode || (window.SHU_CONFIG ? window.SHU_CONFIG.activeCurrency : "PKR");
  const currency = (window.SHU_CONFIG && window.SHU_CONFIG.currencies[currKey]) || { symbol: "PKR ", rate: 1.0 };
  const converted = amountInPKR * currency.rate;

  if (currKey === "PKR") {
    if (converted >= 10000000) {
      return `${currency.symbol}${(converted / 10000000).toFixed(2)} Cr`;
    } else if (converted >= 100000) {
      return `${currency.symbol}${(converted / 100000).toFixed(2)} Lakh`;
    }
    return `${currency.symbol}${Math.round(converted).toLocaleString("en-PK")}`;
  }

  return `${currency.symbol}${Math.round(converted).toLocaleString("en-US")}`;
}

/**
 * Return badge HTML for Data Integrity classification
 */
function renderDataBadge(tierCode, customLabel = null) {
  const tier = (window.SHU_CONFIG && window.SHU_CONFIG.dataTiers[tierCode]) || {
    className: "badge-estimated",
    label: tierCode || "ESTIMATED",
    description: "Assessment estimate"
  };
  const label = customLabel || tier.label;
  return `<span class="data-badge ${tier.className}" title="${tier.description}">
    <span class="badge-dot"></span>${label}
  </span>`;
}

/**
 * Return badge HTML for Confidence Level
 */
function renderConfidenceBadge(confidence, reason = "") {
  const level = (window.SHU_CONFIG && window.SHU_CONFIG.confidenceLevels[confidence]) || {
    label: confidence || "Medium Confidence",
    className: "conf-med"
  };
  return `<span class="conf-badge ${level.className}" title="${reason ? 'Evidence Basis: ' + reason : level.label}">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ${level.label}
  </span>`;
}
