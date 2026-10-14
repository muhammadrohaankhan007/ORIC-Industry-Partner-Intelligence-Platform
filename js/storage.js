/**
 * SHU INDUSTRY PARTNER INTELLIGENCE & OPPORTUNITY ASSESSMENT PLATFORM
 * Storage & Database Persistence Layer (Requirement 31)
 * Manages LocalStorage, filtering, active partner tracking, and JSON import/export.
 */

const SHU_STORAGE = {
  KEYS: {
    PARTNERS: "shu_intelligence_partners_v3",
    ACTIVE_ID: "shu_intelligence_active_id_v3",
    CONFIG_FACULTIES: "shu_intelligence_custom_faculties_v3",
    CONFIG_SETTINGS: "shu_intelligence_settings_v3",
    COMPARISON_LIST: "shu_intelligence_comparison_ids_v3"
  },

  /**
   * Initialize LocalStorage with default demo partners if not present
   */
  init() {
    try {
      const existingStr = localStorage.getItem(this.KEYS.PARTNERS);
      if (!existingStr) {
        // Populate with all verified PSX demo data
        this.saveAllPartners(SHU_DEMO_PARTNERS);
        this.setActivePartnerId(SHU_DEMO_PARTNERS[0].id);
      } else {
        // Merge demo partners so all new PSX companies are always present
        try {
          const existing = JSON.parse(existingStr);
          const existingMap = new Map(existing.map(p => [p.id, p]));
          let changed = false;

          for (const dp of SHU_DEMO_PARTNERS) {
            if (!existingMap.has(dp.id)) {
              existing.push(dp);
              changed = true;
            } else {
              const current = existingMap.get(dp.id);
              if (dp.ticker && !current.ticker) {
                current.ticker = dp.ticker;
                changed = true;
              }
            }
          }

          if (changed) {
            this.saveAllPartners(existing);
          }

          const activeId = this.getActivePartnerId();
          if (!activeId || !existing.some(p => p.id === activeId)) {
            this.setActivePartnerId(existing[0]?.id || SHU_DEMO_PARTNERS[0].id);
          }
        } catch (err) {
          this.saveAllPartners(SHU_DEMO_PARTNERS);
          this.setActivePartnerId(SHU_DEMO_PARTNERS[0].id);
        }
      }

      // Load custom faculties if stored
      const savedFaculties = localStorage.getItem(this.KEYS.CONFIG_FACULTIES);
      if (savedFaculties) {
        SHU_CONFIG.faculties = JSON.parse(savedFaculties);
      }

      // Load custom settings if stored
      const savedSettings = localStorage.getItem(this.KEYS.CONFIG_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.dimensionWeights) SHU_CONFIG.dimensionWeights = parsed.dimensionWeights;
        if (parsed.projectCostTiers) SHU_CONFIG.projectCostTiers = parsed.projectCostTiers;
        if (parsed.activeCurrency) SHU_CONFIG.activeCurrency = parsed.activeCurrency;
        if (parsed.currencies) SHU_CONFIG.currencies = parsed.currencies;
        if (parsed.assumptions) SHU_CONFIG.assumptions = parsed.assumptions;
      }
    } catch (e) {
      console.warn("LocalStorage initialization warning:", e);
    }
  },

  /**
   * Get all partner records
   */
  getAllPartners() {
    try {
      const data = localStorage.getItem(this.KEYS.PARTNERS);
      return data ? JSON.parse(data) : [...SHU_DEMO_PARTNERS];
    } catch (e) {
      console.error("Failed to read partners from storage:", e);
      return [...SHU_DEMO_PARTNERS];
    }
  },

  /**
   * Save entire partners array
   */
  saveAllPartners(partnersArray) {
    try {
      localStorage.setItem(this.KEYS.PARTNERS, JSON.stringify(partnersArray));
      return true;
    } catch (e) {
      console.error("Failed to save partners to storage:", e);
      return false;
    }
  },

  /**
   * Get single partner by ID
   */
  getPartnerById(id) {
    const partners = this.getAllPartners();
    return partners.find(p => p.id === id) || null;
  },

  /**
   * Save or update a single partner assessment
   */
  savePartner(partnerData) {
    const partners = this.getAllPartners();
    const index = partners.findIndex(p => p.id === partnerData.id);

    if (index >= 0) {
      // Update existing
      partners[index] = partnerData;
    } else {
      // Insert new at the top
      partners.unshift(partnerData);
    }

    this.saveAllPartners(partners);
    this.setActivePartnerId(partnerData.id);
    return partnerData;
  },

  /**
   * Delete a partner by ID
   */
  deletePartner(id) {
    let partners = this.getAllPartners();
    partners = partners.filter(p => p.id !== id);
    this.saveAllPartners(partners);

    const activeId = this.getActivePartnerId();
    if (activeId === id) {
      if (partners.length > 0) {
        this.setActivePartnerId(partners[0].id);
      } else {
        localStorage.removeItem(this.KEYS.ACTIVE_ID);
      }
    }
    return partners;
  },

  /**
   * Get active partner ID
   */
  getActivePartnerId() {
    try {
      return localStorage.getItem(this.KEYS.ACTIVE_ID) || (SHU_DEMO_PARTNERS[0] ? SHU_DEMO_PARTNERS[0].id : null);
    } catch (e) {
      return null;
    }
  },

  /**
   * Set active partner ID
   */
  setActivePartnerId(id) {
    try {
      localStorage.setItem(this.KEYS.ACTIVE_ID, id);
    } catch (e) {
      console.error("Failed to set active partner id:", e);
    }
  },

  /**
   * Get currently active partner object
   */
  getActivePartner() {
    const activeId = this.getActivePartnerId();
    if (!activeId) return null;
    return this.getPartnerById(activeId) || this.getAllPartners()[0] || null;
  },

  /**
   * Search and filter partners (Requirement 31 & PSX Search Engine)
   */
  searchAndFilter(query = "", industry = "all", status = "all") {
    let partners = this.getAllPartners();

    if (query && query.trim() !== "") {
      const rawQ = query.trim().toLowerCase();
      const tokens = rawQ.split(/\s+/).filter(Boolean);

      // Alias mapping for common abbreviations, tickers, and sectors
      const ALIASES = {
        "sss": ["sys", "systems", "searl", "searle"],
        "sys": ["systems", "sys"],
        "searl": ["searle", "searl"],
        "searle": ["searle", "searl"],
        "abot": ["abbott", "abot"],
        "abbott": ["abbott", "abot"],
        "feroz": ["ferozsons", "feroz"],
        "ferozsons": ["ferozsons", "feroz"],
        "shfa": ["shifa", "shfa"],
        "shifa": ["shifa", "shfa"],
        "ici": ["lucky core", "lci", "ici"],
        "lci": ["lucky core", "lci", "ici"],
        "gsk": ["glaxo", "glaxosmithkline"],
        "glaxo": ["glaxo", "glaxosmithkline"],
        "citl": ["citi pharma", "citl"],
        "highnoon": ["highnoon", "hnl"],
        "agp": ["agp"],
        "hbl": ["habib bank", "hbl"],
        "mebl": ["meezan bank", "mebl", "meezan"],
        "meezan": ["meezan bank", "mebl", "meezan"],
        "mcb": ["mcb bank", "mcb"],
        "avn": ["avanceon", "avn"],
        "airlink": ["air link", "airlink"],
        "octopus": ["octopus digital", "octopus"],
        "netsol": ["netsol", "netsol technologies"],
        "engro": ["engro", "epcl"],
        "epcl": ["engro polymer", "epcl"],
        "ffc": ["fauji fertilizer", "ffc", "sona"],
        "pharma": ["pharmaceutical", "pharmacy", "medicine"],
        "pharmacy": ["pharmaceutical", "pharmacy", "medicine"],
        "tech": ["technology", "software", "computing", "ai", "cloud", "digital"],
        "it": ["technology", "software", "computing", "ai", "digital"],
        "bank": ["commercial banking", "finance", "fintech", "financial"],
        "banking": ["commercial banking", "finance", "fintech", "financial"],
        "chem": ["chemical", "synthetics", "polymers"],
        "chemical": ["chemical", "synthetics", "polymers"]
      };

      // Build list of active search terms
      let searchTerms = [rawQ, ...tokens];
      if (ALIASES[rawQ]) {
        searchTerms.push(...ALIASES[rawQ]);
      }
      tokens.forEach(t => {
        if (ALIASES[t]) searchTerms.push(...ALIASES[t]);
      });

      partners = partners.filter(p => {
        const ticker = (p.ticker || "").toLowerCase();
        const name = (p.basicInfo?.name || "").toLowerCase();
        const legalName = (p.basicInfo?.legalName || "").toLowerCase();
        const ind = (p.basicInfo?.industry || "").toLowerCase();
        const subInd = (p.basicInfo?.subIndustry || "").toLowerCase();
        const city = (p.basicInfo?.city || "").toLowerCase();
        const desc = (p.basicInfo?.description || "").toLowerCase();
        const contact = (p.agreement?.shuContactPerson || "").toLowerCase();

        // Combined searchable metadata
        const combined = `${ticker} ${name} ${legalName} ${ind} ${subInd} ${city} ${contact} ${desc}`;

        // Match if any search term is contained
        return searchTerms.some(term => {
          if (!term || term.length === 0) return false;
          // Direct ticker equality or inclusion
          if (ticker && (ticker === term || ticker.includes(term) || term.includes(ticker))) return true;
          // Text inclusion in combined metadata
          return combined.includes(term);
        });
      });
    }

    if (industry && industry !== "all") {
      const indQuery = industry.toLowerCase();
      partners = partners.filter(p => {
        const pInd = (p.basicInfo?.industry || "").toLowerCase();
        const pSub = (p.basicInfo?.subIndustry || "").toLowerCase();
        return pInd.includes(indQuery) || pSub.includes(indQuery);
      });
    }

    if (status && status !== "all") {
      const statQuery = status.toLowerCase();
      partners = partners.filter(p => {
        const pStat = (p.agreement?.status || "").toLowerCase();
        const pType = (p.agreement?.type || "").toLowerCase();
        return pStat === statQuery || pType.toLowerCase().includes(statQuery);
      });
    }

    return partners;
  },

  /**
   * Comparison List IDs management
   */
  getComparisonIds() {
    try {
      const data = localStorage.getItem(this.KEYS.COMPARISON_LIST);
      return data ? JSON.parse(data) : [SHU_DEMO_PARTNERS[0]?.id, SHU_DEMO_PARTNERS[1]?.id].filter(Boolean);
    } catch (e) {
      return [];
    }
  },

  setComparisonIds(ids) {
    try {
      localStorage.setItem(this.KEYS.COMPARISON_LIST, JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to save comparison IDs:", e);
    }
  },

  toggleComparisonId(id) {
    const ids = this.getComparisonIds();
    const index = ids.indexOf(id);
    if (index >= 0) {
      ids.splice(index, 1);
    } else {
      if (ids.length >= 4) {
        alert("You can compare up to 4 partner organizations simultaneously.");
        return ids;
      }
      ids.push(id);
    }
    this.setComparisonIds(ids);
    return ids;
  },

  /**
   * Export all database as formatted JSON file
   */
  exportDatabaseToJson() {
    const payload = {
      exportDate: new Date().toISOString(),
      institution: SHU_CONFIG.institution,
      partners: this.getAllPartners(),
      customFaculties: SHU_CONFIG.faculties,
      customSettings: {
        dimensionWeights: SHU_CONFIG.dimensionWeights,
        projectCostTiers: SHU_CONFIG.projectCostTiers,
        currencies: SHU_CONFIG.currencies,
        assumptions: SHU_CONFIG.assumptions
      }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SHU_Partnership_Intelligence_DB_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Import database from JSON string
   */
  importDatabaseFromJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.partners || !Array.isArray(parsed.partners)) {
        throw new Error("Invalid format: 'partners' array is required.");
      }

      this.saveAllPartners(parsed.partners);
      if (parsed.partners.length > 0) {
        this.setActivePartnerId(parsed.partners[0].id);
      }

      if (parsed.customFaculties && Array.isArray(parsed.customFaculties)) {
        SHU_CONFIG.faculties = parsed.customFaculties;
        localStorage.setItem(this.KEYS.CONFIG_FACULTIES, JSON.stringify(parsed.customFaculties));
      }

      if (parsed.customSettings) {
        localStorage.setItem(this.KEYS.CONFIG_SETTINGS, JSON.stringify(parsed.customSettings));
        Object.assign(SHU_CONFIG, parsed.customSettings);
      }

      return { success: true, count: parsed.partners.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Reset database back to default demonstration partners
   */
  resetToDefaults() {
    this.saveAllPartners(SHU_DEMO_PARTNERS);
    this.setActivePartnerId(SHU_DEMO_PARTNERS[0].id);
    localStorage.removeItem(this.KEYS.CONFIG_FACULTIES);
    localStorage.removeItem(this.KEYS.CONFIG_SETTINGS);
    window.location.reload();
  }
};
