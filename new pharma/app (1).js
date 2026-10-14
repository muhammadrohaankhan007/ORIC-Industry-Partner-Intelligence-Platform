/**
 * SHU Industry Partner Intelligence & Opportunity Assessment Platform
 * Complete Application Logic
 * Version 1.0 - Manual Research Mode with Rule-Based Analysis
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    organizations: [],
    settings: {
        faculties: [],
        costRanges: [],
        weights: {},
        currency: 'PKR',
        exchangeRates: {}
    },
    currentDashboardOrg: null,
    selectedComparison: []
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadFromStorage();
    updateHomeStats();
});

function initializeApp() {
    // Initialize default settings
    AppState.settings.faculties = getDefaultFaculties();
    AppState.settings.costRanges = getDefaultCostRanges();
    AppState.settings.weights = getDefaultWeights();
    AppState.settings.exchangeRates = getDefaultExchangeRates();

    // Render settings UI
    renderFacultiesList();
    renderCostRanges();
    renderWeightSliders();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchView(e.target.dataset.view);
        });
    });

    // Settings button
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        switchView('settings');
    });

    // Assessment tabs
    document.querySelectorAll('.assessment-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTabs(e.target.dataset.tab);
        });
    });

    // Settings tabs
    document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchSettingsTabs(e.target.dataset.tab);
        });
    });

    // Analysis button
    document.getElementById('analyzeBtn')?.addEventListener('click', analyzeOrganization);

    // Comparison
    document.getElementById('doComparisonBtn')?.addEventListener('click', generateComparison);

    // Data management
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
    document.getElementById('importDataBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        AppState.organizations = data;
                        saveToStorage();
                        alert('Data imported successfully!');
                        renderOrganizationsList();
                        updateHomeStats();
                    } catch (error) {
                        alert('Error parsing file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    });

    document.getElementById('loadDemoBtn')?.addEventListener('click', loadDemoData);
    document.getElementById('clearDataBtn')?.addEventListener('click', () => {
        if (confirm('Are you sure? This will delete all saved data.')) {
            AppState.organizations = [];
            saveToStorage();
            alert('All data cleared');
            renderOrganizationsList();
            updateHomeStats();
        }
    });

    // Modal close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('show');
        });
    });

    // Org search and filter
    document.getElementById('searchOrg')?.addEventListener('input', renderOrganizationsList);
    document.getElementById('filterIndustry')?.addEventListener('change', renderOrganizationsList);
    document.getElementById('filterStatus')?.addEventListener('change', renderOrganizationsList);

    // Report print/export
    document.getElementById('printReportBtn')?.addEventListener('click', () => {
        window.print();
    });

    document.getElementById('exportJsonReportBtn')?.addEventListener('click', () => {
        const org = AppState.currentDashboardOrg;
        if (org) {
            const dataStr = JSON.stringify(org, null, 2);
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr));
            element.setAttribute('download', `${org.orgName}_assessment.json`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    });

    // Add faculty button
    document.getElementById('addFacultyBtn')?.addEventListener('click', addNewFaculty);

    // Default currency change
    document.getElementById('defaultCurrency')?.addEventListener('change', (e) => {
        AppState.settings.currency = e.target.value;
        saveToStorage();
    });
}

// ============================================
// VIEW MANAGEMENT
// ============================================

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    // Show selected view
    document.getElementById(`view-${viewName}`)?.classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Initialize view-specific content
    if (viewName === 'organizations') {
        updateIndustryFilter();
        renderOrganizationsList();
    } else if (viewName === 'comparison') {
        renderComparisonSelectors();
    } else if (viewName === 'home') {
        updateHomeStats();
    }
}

function switchTabs(tabName) {
    document.querySelectorAll(`#tab-${tabName.split('-')[0]}-info, #tab-${tabName.split('-')[1]}-info, #tab-${tabName.split('-')[2]}-info, #tab-research-data`).forEach(t => {
        t?.classList.remove('active');
    });
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) {
        tabEl.classList.add('active');
    }
    document.querySelectorAll('.assessment-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
}

function switchSettingsTabs(tabName) {
    document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.settings-tabs + div, .settings-tabs + div + div').forEach(tab => {
        tab?.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`)?.classList.add('active');
}

// ============================================
// ORGANIZATION ANALYSIS ENGINE
// ============================================

function analyzeOrganization() {
    // Collect form data
    const formData = collectFormData();

    // Validation
    if (!formData.orgName || !formData.orgCountry || !formData.orgIndustry || !formData.orgType || !formData.agreementType) {
        alert('Please fill in all required fields marked with *');
        return;
    }

    // Create assessment ID
    formData.id = Date.now();
    formData.createdDate = new Date().toISOString();
    formData.status = getPartnershipStatus(formData.agreementType);

    // Run analysis
    formData.analysis = {
        organizationProfile: analyzeOrganizationProfile(formData),
        marketAnalysis: analyzeMarketPosition(formData),
        growthAnalysis: analyzeGrowthPotential(formData),
        capacityAnalysis: analyzeOrganizationalCapacity(formData),
        innovationAnalysis: analyzeInnovationCapability(formData),
        facultyOpportunities: mapFacultyOpportunities(formData),
        crossFacultyProjects: identifyCrossFacultyProjects(formData),
        projectsAndInternships: calculateProjectsAndInternships(formData),
        researchPotential: assessResearchPotential(formData),
        consultancyPotential: assessConsultancyPotential(formData),
        trainingPotential: assessTrainingPotential(formData),
        commercializationPotential: assessCommercializationPotential(formData),
        partnershipValue: calculatePartnershipValue(formData),
        financialEstimate: estimateFinancialOpportunity(formData),
        roadmap: generate3YearRoadmap(formData)
    };

    // Save organization
    AppState.organizations.push(formData);
    saveToStorage();

    // Display report
    displayAssessmentReport(formData);

    // Reset form
    resetAssessmentForm();
    updateHomeStats();
}

function collectFormData() {
    return {
        orgName: document.getElementById('orgName').value,
        orgWebsite: document.getElementById('orgWebsite').value,
        orgCountry: document.getElementById('orgCountry').value,
        orgCity: document.getElementById('orgCity').value,
        orgIndustry: document.getElementById('orgIndustry').value,
        orgSubIndustry: document.getElementById('orgSubIndustry').value,
        orgYearEstablished: parseInt(document.getElementById('orgYearEstablished').value) || null,
        orgType: document.getElementById('orgType').value,
        agreementType: document.getElementById('agreementType').value,
        agreementDate: document.getElementById('agreementDate').value,
        agreementDuration: parseInt(document.getElementById('agreementDuration').value) || 12,
        shuContact: document.getElementById('shuContact').value,
        orgContact: document.getElementById('orgContact').value,
        existingCollaboration: document.getElementById('existingCollaboration').value,
        orgRevenue: parseInt(document.getElementById('orgRevenue').value) || null,
        orgEmployees: parseInt(document.getElementById('orgEmployees').value) || null,
        orgBranches: parseInt(document.getElementById('orgBranches').value) || null,
        orgInvestment: parseInt(document.getElementById('orgInvestment').value) || null,
        orgDescription: document.getElementById('orgDescription').value,
        existingProjects: document.getElementById('existingProjects').value,
        websiteInfo: document.getElementById('websiteInfo').value,
        financialInfo: document.getElementById('financialInfo').value,
        newsInfo: document.getElementById('newsInfo').value,
        linkedinInfo: document.getElementById('linkedinInfo').value
    };
}

function analyzeOrganizationProfile(data) {
    const yearsInOperation = data.orgYearEstablished ? new Date().getFullYear() - data.orgYearEstablished : null;

    return {
        name: data.orgName,
        headquarters: `${data.orgCity || 'Not specified'}, ${data.orgCountry}`,
        yearEstablished: data.orgYearEstablished,
        yearsInOperation: yearsInOperation,
        type: data.orgType,
        industry: data.orgIndustry,
        subIndustry: data.orgSubIndustry,
        employees: data.orgEmployees,
        employeeCategory: categorizeEmployees(data.orgEmployees),
        revenue: data.orgRevenue,
        revenueCategory: categorizeRevenue(data.orgRevenue),
        website: data.orgWebsite,
        description: data.orgDescription,
        confidence: getConfidenceLevel(data),
        sources: extractSources(data)
    };
}

function analyzeMarketPosition(data) {
    const industryKeywords = data.orgIndustry.toLowerCase();
    const isPharmaceutical = industryKeywords.includes('pharma') || industryKeywords.includes('pharmaceutical');
    const isIT = industryKeywords.includes('it') || industryKeywords.includes('tech') || industryKeywords.includes('software');
    const isHealthcare = industryKeywords.includes('healthcare') || industryKeywords.includes('hospital') || industryKeywords.includes('medical');
    const isFinance = industryKeywords.includes('bank') || industryKeywords.includes('finance') || industryKeywords.includes('investment');

    return {
        targetMarket: extractMarketSegments(data),
        domesticReach: data.orgCountry === 'Pakistan' ? 'Pakistan primary' : `${data.orgCountry} primary, Pakistan secondary`,
        internationalReach: data.orgType === 'Multinational' ? 'Yes - Multiple countries' : data.orgWebsite ? 'Possible' : 'Not specified',
        marketPosition: getMarketPosition(data),
        competitiveIntensity: assessCompetitiveIntensity(data),
        majorCompetitors: identifyCompetitors(data),
        marketTrends: identifyMarketTrends(data),
        confidence: 'Medium',
        reasoning: 'Based on organizational type, size, and available information'
    };
}

function analyzeGrowthPotential(data) {
    let growthScore = 50; // baseline
    let criteria = {};

    // Revenue information
    if (data.orgRevenue) {
        criteria.revenueData = { present: true, score: 10 };
        growthScore += 10;
    }

    // Recent establishment or expansion
    if (data.orgYearEstablished && new Date().getFullYear() - data.orgYearEstablished < 10) {
        criteria.recentGrowth = { present: true, score: 15 };
        growthScore += 15;
    }

    // Multiple branches
    if (data.orgBranches && data.orgBranches > 1) {
        criteria.expansion = { present: true, score: 10, branches: data.orgBranches };
        growthScore += 10;
    }

    // News/market info present
    if (data.newsInfo && data.newsInfo.length > 20) {
        criteria.marketActivity = { present: true, score: 10 };
        growthScore += 10;
    }

    // Investment activity
    if (data.orgInvestment) {
        criteria.investment = { present: true, score: 15, amount: data.orgInvestment };
        growthScore += 15;
    }

    // Multinational type
    if (data.orgType === 'Multinational') {
        criteria.international = { present: true, score: 10 };
        growthScore += 10;
    }

    growthScore = Math.min(100, growthScore);

    return {
        growthScore: growthScore,
        scoreInterpretation: getGrowthInterpretation(growthScore),
        criteria: criteria,
        historyicalGrowth: data.financialInfo ? 'Data provided - analyze manually' : 'Not specified',
        expansionIndicators: identifyExpansionIndicators(data),
        confidence: 'Medium',
        disclaimer: 'Estimates based on available organizational data'
    };
}

function analyzeOrganizationalCapacity(data) {
    return {
        humanCapital: {
            estimatedManpower: data.orgEmployees || 'Not specified',
            category: categorizeEmployees(data.orgEmployees),
            technicalCapacity: assessTechnicalCapacity(data),
            managementCapacity: assessManagementCapacity(data)
        },
        infrastructure: {
            branches: data.orgBranches || 'Not specified',
            officePresence: data.orgCity ? 'Confirmed - ' + data.orgCity : 'Not specified',
            facilities: extractFacilitiesInfo(data)
        },
        technologyCapability: {
            website: data.orgWebsite ? 'Yes' : 'Not specified',
            digitalTransformation: assessDigitalCapability(data),
            aiAdoption: assessAIAdoption(data)
        }
    };
}

function analyzeInnovationCapability(data) {
    let innovationScore = 50;

    if (data.linkedinInfo && data.linkedinInfo.length > 50) innovationScore += 10;
    if (data.orgType === 'Startup') innovationScore += 20;
    if (data.newsInfo && data.newsInfo.includes('innovation')) innovationScore += 10;
    if (data.orgIndustry.toLowerCase().includes('tech')) innovationScore += 15;

    return {
        innovationScore: Math.min(100, innovationScore),
        rAndDActivities: extractRandDInfo(data),
        digitalization: assessDigitalization(data),
        technologyAdoption: assessTechAdoption(data),
        confidence: 'Medium',
        methodology: 'Rule-based assessment from supplied data'
    };
}

// ============================================
// FACULTY MAPPING ENGINE
// ============================================

function mapFacultyOpportunities(data) {
    const faculties = AppState.settings.faculties;
    const opportunities = [];

    faculties.forEach(faculty => {
        const facultyOpps = assessFacultyFit(data, faculty);
        if (facultyOpps.opportunities.length > 0) {
            opportunities.push({
                faculty: faculty.name,
                researchAreas: faculty.researchAreas,
                opportunities: facultyOpps.opportunities,
                rationale: facultyOpps.rationale,
                priorityLevel: facultyOpps.priority,
                estimatedProjectValue: facultyOpps.estimatedValue,
                potentialStudents: facultyOpps.studentPotential
            });
        }
    });

    return opportunities.sort((a, b) => {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
    });
}

function assessFacultyFit(data, faculty) {
    const industry = data.orgIndustry.toLowerCase();
    const subIndustry = data.orgSubIndustry.toLowerCase();
    const description = (data.orgDescription + data.websiteInfo + data.linkedinInfo).toLowerCase();

    let opportunities = [];
    let rationale = '';
    let priority = 'Low';
    let estimatedValue = 0;
    let studentPotential = 0;

    // Computer Science / Computing
    if (faculty.name.includes('Computer Science') || faculty.name.includes('Computing')) {
        if (industry.includes('tech') || industry.includes('software') || industry.includes('digital')) {
            opportunities.push('AI/ML Implementation', 'Data Analytics', 'Software Development');
            rationale = 'Technology-based organization with clear CS engagement opportunities';
            priority = 'High';
            estimatedValue = 5000000;
            studentPotential = 15;
        } else if (industry.includes('pharma') || industry.includes('healthcare')) {
            opportunities.push('Digital Health Platform', 'ERP Optimization', 'Data Analytics');
            rationale = 'Healthcare sector benefits from digital transformation and data analysis';
            priority = 'Medium';
            estimatedValue = 3000000;
            studentPotential = 10;
        } else if (industry.includes('bank') || industry.includes('finance')) {
            opportunities.push('FinTech Solutions', 'Cybersecurity', 'Data Analytics');
            rationale = 'Financial institutions need advanced IT solutions';
            priority = 'High';
            estimatedValue = 5000000;
            studentPotential = 12;
        } else {
            opportunities.push('Digital Transformation', 'Process Automation');
            rationale = 'Any organization can benefit from digital solutions';
            priority = 'Medium';
            estimatedValue = 2000000;
            studentPotential = 8;
        }
    }

    // Business & Management
    if (faculty.name.includes('Business') || faculty.name.includes('Management')) {
        if (data.orgEmployees && data.orgEmployees > 100) {
            opportunities.push('Strategy Consulting', 'HR Development', 'Business Analytics');
            priority = 'High';
            estimatedValue = 3000000;
            studentPotential = 10;
            rationale = 'Larger organizations need business development and strategy support';
        } else {
            opportunities.push('Entrepreneurship Support', 'Market Analysis');
            priority = 'Medium';
            estimatedValue = 1500000;
            studentPotential = 6;
            rationale = 'Business expertise applicable across sectors';
        }
    }

    // Pharmacy
    if (faculty.name.includes('Pharmacy')) {
        if (industry.includes('pharma') || industry.includes('drug') || industry.includes('pharmaceutical')) {
            opportunities.push('Drug Development', 'Formulation Research', 'Quality Assurance', 'Regulatory Affairs');
            priority = 'High';
            estimatedValue = 8000000;
            studentPotential = 12;
            rationale = 'Direct alignment with pharmaceutical industry';
        } else if (industry.includes('healthcare') || industry.includes('hospital')) {
            opportunities.push('Pharmaceutical Services', 'Drug Information');
            priority = 'Medium';
            estimatedValue = 2000000;
            studentPotential = 5;
            rationale = 'Healthcare organizations need pharmaceutical expertise';
        }
    }

    // Biosciences
    if (faculty.name.includes('Biosciences')) {
        if (industry.includes('biotech') || industry.includes('bio') || industry.includes('pharma')) {
            opportunities.push('Biotechnology Research', 'Microbiology', 'Molecular Biology');
            priority = 'High';
            estimatedValue = 5000000;
            studentPotential = 8;
            rationale = 'Life sciences organizations need biological research support';
        } else if (industry.includes('agri') || industry.includes('food')) {
            opportunities.push('Food Biotechnology', 'Environmental Biotech');
            priority = 'Medium';
            estimatedValue = 2000000;
            studentPotential = 6;
            rationale = 'Agriculture and food sectors benefit from biotechnology';
        }
    }

    // Biomedical Engineering
    if (faculty.name.includes('Biomedical') || faculty.name.includes('Medical Engineering')) {
        if (industry.includes('medical') || industry.includes('device') || industry.includes('healthcare')) {
            opportunities.push('Medical Device Development', 'Digital Health Solutions', 'Diagnostic Technology');
            priority = 'High';
            estimatedValue = 6000000;
            studentPotential = 10;
            rationale = 'Medical sector needs biomedical engineering expertise';
        }
    }

    return { opportunities, rationale, priority, estimatedValue, studentPotential };
}

function identifyCrossFacultyProjects(data) {
    const projects = [];
    const industry = data.orgIndustry.toLowerCase();

    // Pharmaceutical + AI Platform
    if (industry.includes('pharma')) {
        projects.push({
            title: 'AI Drug Discovery & Development Platform',
            faculties: ['Computer Science', 'Pharmacy', 'Biosciences'],
            problem: 'Long drug development cycles and high costs',
            solution: 'AI-powered drug candidate screening and optimization',
            deliverables: ['AI Model', 'Testing Framework', 'Documentation'],
            estimatedValue: 10000000,
            duration: '12-18 months',
            requiredManpower: 6,
            researchPotential: 'High',
            commercializationPotential: 'Strategic'
        });

        projects.push({
            title: 'Smart Pharmaceutical Supply Chain',
            faculties: ['Computer Science', 'Business', 'Pharmacy'],
            problem: 'Inefficient drug distribution and counterfeiting',
            solution: 'Blockchain + IoT based supply chain tracking',
            deliverables: ['Tracking System', 'Blockchain Implementation'],
            estimatedValue: 8000000,
            duration: '9-12 months',
            requiredManpower: 5,
            researchPotential: 'Medium',
            commercializationPotential: 'High'
        });
    }

    // Healthcare + Digital Platform
    if (industry.includes('healthcare') || industry.includes('hospital')) {
        projects.push({
            title: 'Digital Health Management Platform',
            faculties: ['Computer Science', 'Biomedical Engineering', 'Business'],
            problem: 'Fragmented patient data and poor coordination',
            solution: 'Integrated digital health platform with analytics',
            deliverables: ['Platform', 'Mobile App', 'Analytics Dashboard'],
            estimatedValue: 7000000,
            duration: '10-14 months',
            requiredManpower: 5,
            researchPotential: 'High',
            commercializationPotential: 'High'
        });
    }

    // General cross-faculty
    projects.push({
        title: `Innovation & Digital Transformation Program for ${data.orgName}`,
        faculties: ['Computer Science', 'Business', 'Biomedical Engineering'],
        problem: 'Need for comprehensive organizational modernization',
        solution: 'Structured digital transformation consulting and implementation',
        deliverables: ['Strategy', 'Implementation Plan', 'Training'],
        estimatedValue: 5000000,
        duration: '6-12 months',
        requiredManpower: 4,
        researchPotential: 'Medium',
        commercializationPotential: 'Medium'
    });

    return projects.slice(0, 4); // Return top 4 opportunities
}

// ============================================
// PROJECT & OPPORTUNITY CALCULATIONS
// ============================================

function calculateProjectsAndInternships(data) {
    const employees = data.orgEmployees || 50;
    const organizationType = data.orgType;

    // Internship potential based on size
    let annualInternships = 0;
    if (employees < 50) annualInternships = 3;
    else if (employees < 200) annualInternships = 8;
    else if (employees < 500) annualInternships = 15;
    else if (employees < 1000) annualInternships = 25;
    else annualInternships = 40;

    // Student project potential by faculty
    const studentProjects = {
        'Computer Science': Math.ceil((employees / 100) * 12),
        'Business': Math.ceil((employees / 100) * 8),
        'Pharmacy': industry.includes('pharma') ? Math.ceil((employees / 100) * 10) : 3,
        'Biosciences': industry.includes('bio') ? Math.ceil((employees / 100) * 8) : 2,
        'Biomedical Engineering': industry.includes('medical') ? Math.ceil((employees / 100) * 10) : 3
    };

    return {
        internshipPotential: {
            annualInternships: annualInternships,
            relevantDisciplines: ['All faculties'],
            duration: '3-6 months',
            conversionToPermanent: '30-40%',
            skillsRequired: extractSkillsRequired(data),
            scoreLabel: 'Internship Opportunity Score: ' + assessInternshipScore(employees)
        },
        studentProjects: {
            byFaculty: studentProjects,
            totalAnnualCapacity: Object.values(studentProjects).reduce((a, b) => a + b, 0),
            projectTypes: ['Final Year Projects', 'Capstone Projects', 'Research Projects', 'Case Studies'],
            estimatedValue: calculateStudentProjectValue(studentProjects)
        }
    };
}

function assessResearchPotential(data) {
    let researchScore = 'Moderate';
    let confidence = 'Medium';

    if (data.orgIndustry.toLowerCase().includes('pharma')) {
        researchScore = 'Strategic';
    } else if (data.orgType === 'Multinational' || (data.orgEmployees && data.orgEmployees > 500)) {
        researchScore = 'High';
    } else if (data.orgInvestment) {
        researchScore = 'High';
    } else if (data.newsInfo && data.newsInfo.includes('research')) {
        researchScore = 'High';
    }

    return {
        collaborationPotential: researchScore,
        opportunities: [
            'Sponsored Research',
            'Industry-funded Research',
            'Joint Publications',
            'Technology Development',
            'Joint Laboratories'
        ],
        estimatedAnnualValue: researchScore === 'Strategic' ? 8000000 : researchScore === 'High' ? 5000000 : 2000000,
        confidence: confidence,
        reasoning: 'Based on organizational size, investment, and industry sector'
    };
}

function assessConsultancyPotential(data) {
    const consultancyAreas = [];
    const industry = data.orgIndustry.toLowerCase();

    if (data.orgEmployees && data.orgEmployees > 100) {
        consultancyAreas.push('Strategy Consulting', 'HR Development', 'Organizational Change');
    }

    if (industry.includes('tech') || industry.includes('digital')) {
        consultancyAreas.push('Digital Transformation', 'IT Systems Optimization', 'Cybersecurity');
    }

    if (industry.includes('pharma') || industry.includes('healthcare')) {
        consultancyAreas.push('Regulatory Compliance', 'Quality Systems', 'Clinical Research');
    }

    if (industry.includes('bank') || industry.includes('finance')) {
        consultancyAreas.push('Risk Management', 'Compliance', 'Data Privacy');
    }

    consultancyAreas.push('Supply Chain Optimization', 'Process Improvement');

    return {
        consultancyAreas: consultancyAreas.slice(0, 6),
        estimatedProjectSize: data.orgEmployees > 500 ? '5M - 20M PKR' : data.orgEmployees > 100 ? '2M - 8M PKR' : '500K - 2M PKR',
        estimatedDuration: '3-12 months',
        facultyInvolvement: 2,
        revenuePerProject: data.orgEmployees > 500 ? '7000000-12000000' : '2000000-5000000',
        annualConsultancyPotential: 'TBD - depends on project portfolio'
    };
}

function assessTrainingPotential(data) {
    const trainingPrograms = [];
    const employees = data.orgEmployees || 50;

    trainingPrograms.push('Leadership Development', 'Digital Transformation', 'Innovation & Entrepreneurship');

    if (data.orgIndustry.toLowerCase().includes('pharma')) {
        trainingPrograms.push('Regulatory Affairs', 'Quality Management');
    }

    if (data.orgIndustry.toLowerCase().includes('tech')) {
        trainingPrograms.push('AI/ML for Managers', 'Cybersecurity Awareness', 'Cloud Computing');
    }

    const participantsPerProgram = Math.min(Math.max(10, Math.floor(employees / 50)), 100);
    const annualPotential = participantsPerProgram * 3 * 500000; // 3 programs, 500K per person

    return {
        recommendedPrograms: trainingPrograms.slice(0, 5),
        estimatedParticipants: participantsPerProgram,
        programDuration: '2-5 days',
        feeRange: '500K - 2M PKR per program',
        annualTrainingPotential: formatCurrency(annualPotential)
    };
}

function assessCommercializationPotential(data) {
    return {
        opportunities: [
            { type: 'Product', description: 'Market-ready solutions from joint development' },
            { type: 'Service', description: 'Consulting and implementation services' },
            { type: 'IP/Patent', description: 'Intellectual property development' },
            { type: 'Startup', description: 'Spinoff company creation' }
        ],
        feasibilityLevel: data.orgInvestment ? 'High' : 'Medium',
        estimatedTimeToMarket: '12-24 months',
        requiredInvestment: 'TBD - depends on specific opportunity',
        potentialRevenue: 'TBD - depends on market adoption'
    };
}

// ============================================
// PARTNERSHIP VALUE CALCULATION
// ============================================

function calculatePartnershipValue(data) {
    const dimensions = {
        academic: calculateAcademicValue(data),
        research: calculateResearchValue(data),
        student: calculateStudentValue(data),
        faculty: calculateFacultyValue(data),
        commercial: calculateCommercialValue(data),
        innovation: calculateInnovationValue(data),
        entrepreneurship: calculateEntrepreneurshipValue(data),
        revenue: calculateRevenueValue(data),
        strategic: calculateStrategicValue(data)
    };

    // Calculate weighted index
    const weights = AppState.settings.weights;
    let weightedIndex = 0;
    Object.keys(dimensions).forEach(dim => {
        weightedIndex += dimensions[dim].score * (weights[dim] || 0.1);
    });

    return {
        dimensions: dimensions,
        weightedPartnershipIndex: Math.round(weightedIndex),
        indexInterpretation: getIndexInterpretation(Math.round(weightedIndex)),
        weights: weights,
        methodology: 'Multi-dimensional assessment with configurable weights'
    };
}

function calculateAcademicValue(data) {
    let score = 50;
    if (data.orgEmployees && data.orgEmployees > 100) score += 15;
    if (data.orgType === 'Multinational') score += 10;
    if (data.orgIndustry.toLowerCase().includes('tech')) score += 15;

    return {
        score: Math.min(100, score),
        factors: ['Guest lectures', 'Industry visits', 'Student mentoring', 'Case studies'],
        estimatedStudentInvolvement: 50
    };
}

function calculateResearchValue(data) {
    let score = 50;
    if (data.orgIndustry.toLowerCase().includes('pharma')) score += 25;
    if (data.orgInvestment) score += 15;
    if (data.orgEmployees && data.orgEmployees > 200) score += 10;

    return {
        score: Math.min(100, score),
        factors: ['Sponsored research', 'Joint publications', 'Lab collaboration'],
        potentialProjects: 3
    };
}

function calculateStudentValue(data) {
    let score = 60;
    if (data.orgEmployees && data.orgEmployees > 100) score += 20;
    if (data.orgBranches && data.orgBranches > 3) score += 10;

    return {
        score: Math.min(100, score),
        factors: ['Internships', 'Final year projects', 'Case competitions'],
        estimatedStudentCapacity: 30
    };
}

function calculateFacultyValue(data) {
    let score = 50;
    const facultiesInvolved = mapFacultyOpportunities(data).length;
    score += facultiesInvolved * 10;

    return {
        score: Math.min(100, score),
        factors: ['Faculty consulting', 'Capability building', 'Research collaboration'],
        facultiesInvolved: facultiesInvolved
    };
}

function calculateCommercialValue(data) {
    let score = 40;
    if (data.orgRevenue && data.orgRevenue > 500000000) score += 25;
    if (data.orgType === 'Multinational') score += 15;
    if (data.orgInvestment) score += 15;

    return {
        score: Math.min(100, score),
        factors: ['Funded projects', 'Consulting fees', 'Licensing opportunities'],
        estimatedAnnualValue: formatCurrency(calculateCommercialOpportunity(data))
    };
}

function calculateInnovationValue(data) {
    let score = 50;
    if (data.orgType === 'Startup') score += 20;
    if (data.linkedinInfo && data.linkedinInfo.length > 100) score += 10;
    if (data.newsInfo && data.newsInfo.includes('innovation')) score += 10;

    return {
        score: Math.min(100, score),
        factors: ['New product development', 'Technology transfer', 'Patent opportunities'],
        innovationCapacity: score > 70 ? 'High' : score > 50 ? 'Medium' : 'Moderate'
    };
}

function calculateEntrepreneurshipValue(data) {
    let score = 50;
    if (data.orgType === 'Startup' || data.orgType === 'SME') score += 20;
    if (data.orgEmployees && data.orgEmployees < 100) score += 10;

    return {
        score: Math.min(100, score),
        factors: ['Incubation support', 'Startup creation', 'Mentoring'],
        startupCreationPotential: 'TBD'
    };
}

function calculateRevenueValue(data) {
    let score = 40;
    const opportunities = assessConsultancyPotential(data);
    const estimatedRevenue = 2000000; // base assumption

    if (data.orgEmployees && data.orgEmployees > 200) score += 20;
    if (data.orgInvestment && data.orgInvestment > 500000000) score += 20;
    if (data.orgRevenue && data.orgRevenue > 1000000000) score += 15;

    return {
        score: Math.min(100, score),
        factors: ['Research grants', 'Consultancy', 'Training', 'Testing services'],
        estimatedAnnualRevenue: formatCurrency(estimatedRevenue * (score / 40))
    };
}

function calculateStrategicValue(data) {
    let score = 50;
    if (data.orgType === 'Multinational') score += 20;
    if (data.agreementType === 'Strategic Partnership') score += 15;
    if (data.orgIndustry.toLowerCase().includes('pharma')) score += 10;

    return {
        score: Math.min(100, score),
        factors: ['Long-term partnership potential', 'Brand association', 'Global reach'],
        strategicAlignment: score > 70 ? 'High' : score > 50 ? 'Medium' : 'Moderate'
    };
}

// ============================================
// FINANCIAL OPPORTUNITY ESTIMATION
// ============================================

function estimateFinancialOpportunity(data) {
    const conservative = estimateConservative(data);
    const expected = estimateExpected(data);
    const optimistic = estimateOptimistic(data);

    return {
        conservativeScenario: {
            annualRevenue: formatCurrency(conservative.revenue),
            projects: conservative.projects,
            students: conservative.students,
            facultyEngagement: conservative.faculty
        },
        expectedScenario: {
            annualRevenue: formatCurrency(expected.revenue),
            projects: expected.projects,
            students: expected.students,
            facultyEngagement: expected.faculty
        },
        highOpportunityScenario: {
            annualRevenue: formatCurrency(optimistic.revenue),
            projects: optimistic.projects,
            students: optimistic.students,
            facultyEngagement: optimistic.faculty
        },
        disclaimer: 'These are estimates based on organizational profile and should be validated with the organization'
    };
}

function estimateConservative(data) {
    return {
        revenue: data.orgEmployees ? data.orgEmployees * 10000 : 500000,
        projects: Math.max(1, Math.floor((data.orgEmployees || 50) / 100)),
        students: Math.max(3, Math.floor((data.orgEmployees || 50) / 50)),
        faculty: 1
    };
}

function estimateExpected(data) {
    return {
        revenue: data.orgEmployees ? data.orgEmployees * 25000 : 1500000,
        projects: Math.max(2, Math.floor((data.orgEmployees || 50) / 50)),
        students: Math.max(8, Math.floor((data.orgEmployees || 50) / 25)),
        faculty: 2
    };
}

function estimateOptimistic(data) {
    return {
        revenue: data.orgEmployees ? data.orgEmployees * 50000 : 3000000,
        projects: Math.max(4, Math.floor((data.orgEmployees || 50) / 30)),
        students: Math.max(15, Math.floor((data.orgEmployees || 50) / 15)),
        faculty: 3
    };
}

// ============================================
// 3-YEAR ROADMAP GENERATION
// ============================================

function generate3YearRoadmap(data) {
    return {
        year1: {
            theme: 'ENGAGE',
            activities: [
                'Faculty meetings and industry visits',
                'Guest lectures and seminars',
                'Internship placements',
                'Initial student projects',
                'Small consultancy projects',
                'Relationship building'
            ],
            objectives: 'Establish strong relationships and identify collaboration opportunities'
        },
        year2: {
            theme: 'COLLABORATE',
            activities: [
                'Sponsored research projects',
                'Joint product development',
                'Executive training programs',
                'Prototype development',
                'Joint laboratory establishment',
                'Faculty sabbatical exchange'
            ],
            objectives: 'Deepen partnership and create tangible deliverables'
        },
        year3: {
            theme: 'SCALE',
            activities: [
                'Joint center establishment',
                'Commercialization of prototypes',
                'IP and patent filings',
                'Startup creation from research',
                'Long-term research programs',
                'Strategic partnership formalization'
            ],
            objectives: 'Establish sustainable, scalable partnership model'
        }
    };
}

// ============================================
// DASHBOARD GENERATION
// ============================================

function displayAssessmentReport(org) {
    const reportModal = document.getElementById('reportModal');
    const reportBody = document.getElementById('reportBody');

    reportBody.innerHTML = generateFullReport(org);
    reportModal.classList.add('show');

    // Store current org for dashboard
    AppState.currentDashboardOrg = org;
}

function generateFullReport(org) {
    const analysis = org.analysis;

    return `
        <div class="report-section">
            <h2>Executive Summary</h2>
            <p><strong>Organization:</strong> ${org.orgName}</p>
            <p><strong>Industry:</strong> ${org.orgIndustry}</p>
            <p><strong>Partnership Status:</strong> <span class="status-badge ${org.status.toLowerCase()}">${org.status}</span></p>
            <p><strong>Assessment Date:</strong> ${new Date(org.createdDate).toLocaleDateString()}</p>
            <p>${org.orgDescription || 'No description provided'}</p>
        </div>

        <div class="report-section">
            <h2>Organization Profile</h2>
            <h3>Basic Information</h3>
            <table class="comparison-table" style="width: 100%; margin: 10px 0;">
                <tr><td><strong>Name:</strong></td><td>${org.orgName}</td></tr>
                <tr><td><strong>Headquarters:</strong></td><td>${analysis.organizationProfile.headquarters}</td></tr>
                <tr><td><strong>Established:</strong></td><td>${org.orgYearEstablished || 'Not specified'}</td></tr>
                <tr><td><strong>Type:</strong></td><td>${org.orgType}</td></tr>
                <tr><td><strong>Industry:</strong></td><td>${org.orgIndustry}${org.orgSubIndustry ? ' - ' + org.orgSubIndustry : ''}</td></tr>
                <tr><td><strong>Employees:</strong></td><td>${org.orgEmployees || 'Not specified'} (${analysis.organizationProfile.employeeCategory})</td></tr>
                <tr><td><strong>Revenue:</strong></td><td>${org.orgRevenue ? formatCurrency(org.orgRevenue) : 'Not specified'}</td></tr>
                <tr><td><strong>Branches:</strong></td><td>${org.orgBranches || 'Not specified'}</td></tr>
            </table>
            <span class="confidence-badge confidence-${analysis.organizationProfile.confidence.toLowerCase()}">
                ${analysis.organizationProfile.confidence} Confidence
            </span>
        </div>

        <div class="report-section">
            <h2>Market Position & Growth Potential</h2>
            <h3>Market Analysis</h3>
            <p><strong>Target Market:</strong> ${analysis.marketAnalysis.targetMarket.join(', ')}</p>
            <p><strong>Geographic Reach:</strong> ${analysis.marketAnalysis.domesticReach}</p>
            <p><strong>Competitive Position:</strong> ${analysis.marketAnalysis.marketPosition}</p>

            <h3>Growth Assessment</h3>
            <p><strong>Growth Score:</strong> ${analysis.growthAnalysis.growthScore}/100</p>
            <p><strong>Interpretation:</strong> ${analysis.growthAnalysis.scoreInterpretation}</p>
            <p><strong>Expansion Indicators:</strong> ${analysis.growthAnalysis.expansionIndicators.join(', ')}</p>
        </div>

        <div class="report-section">
            <h2>Organizational Capacity</h2>
            <h3>Human Capital</h3>
            <p><strong>Estimated Workforce:</strong> ${analysis.capacityAnalysis.humanCapital.estimatedManpower || 'Not specified'} (${analysis.capacityAnalysis.humanCapital.category})</p>
            <p><strong>Technical Capacity:</strong> ${analysis.capacityAnalysis.humanCapital.technicalCapacity}</p>

            <h3>Infrastructure</h3>
            <p><strong>Locations:</strong> ${analysis.capacityAnalysis.infrastructure.branches || 'Not specified'}</p>
            <p><strong>Digital Capability:</strong> ${analysis.capacityAnalysis.technologyCapability.digitalTransformation}</p>
        </div>

        <div class="report-section">
            <h2>SHU Faculty Opportunities</h2>
            ${generateFacultyOpportunitiesTable(analysis.facultyOpportunities)}
        </div>

        <div class="report-section">
            <h2>Cross-Faculty Opportunities</h2>
            ${generateCrossFacultyTable(analysis.crossFacultyProjects)}
        </div>

        <div class="report-section">
            <h2>Student & Internship Opportunities</h2>
            <h3>Internship Potential</h3>
            <p><strong>Annual Internship Capacity:</strong> ${analysis.projectsAndInternships.internshipPotential.annualInternships}</p>
            <p><strong>Duration:</strong> ${analysis.projectsAndInternships.internshipPotential.duration}</p>
            <p><strong>Internship Score:</strong> ${analysis.projectsAndInternships.internshipPotential.scoreLabel}</p>

            <h3>Student Project Capacity</h3>
            <p><strong>Annual Student Projects:</strong> ${analysis.projectsAndInternships.studentProjects.totalAnnualCapacity}</p>
            <table class="comparison-table" style="width: 100%; margin: 10px 0;">
                ${Object.entries(analysis.projectsAndInternships.studentProjects.byFaculty)
                    .map(([faculty, projects]) => `<tr><td>${faculty}:</td><td>${projects} projects/year</td></tr>`)
                    .join('')}
            </table>
        </div>

        <div class="report-section">
            <h2>Research & Consultancy Potential</h2>
            <h3>Research Collaboration</h3>
            <p><strong>Potential Level:</strong> ${analysis.researchPotential.collaborationPotential}</p>
            <p><strong>Estimated Annual Value:</strong> ${formatCurrency(analysis.researchPotential.estimatedAnnualValue)}</p>

            <h3>Consultancy Opportunities</h3>
            <p><strong>Consultancy Areas:</strong> ${analysis.consultancyPotential.consultancyAreas.join(', ')}</p>
            <p><strong>Estimated Project Value:</strong> ${analysis.consultancyPotential.estimatedProjectSize}</p>
            <p><strong>Duration:</strong> ${analysis.consultancyPotential.estimatedDuration}</p>
        </div>

        <div class="report-section">
            <h2>Training & Executive Education</h2>
            <p><strong>Recommended Programs:</strong> ${analysis.trainingPotential.recommendedPrograms.join(', ')}</p>
            <p><strong>Annual Training Potential:</strong> ${analysis.trainingPotential.annualTrainingPotential}</p>
        </div>

        <div class="report-section">
            <h2>Partnership Value Assessment</h2>
            <p><strong>Partnership Opportunity Index:</strong> ${analysis.partnershipValue.weightedPartnershipIndex}/100</p>
            <p><strong>Interpretation:</strong> ${analysis.partnershipValue.indexInterpretation}</p>

            <h3>Dimension Breakdown</h3>
            <table class="comparison-table" style="width: 100%; margin: 10px 0;">
                ${generateDimensionTable(analysis.partnershipValue.dimensions)}
            </table>
        </div>

        <div class="report-section">
            <h2>Financial Opportunity Estimate (Annual)</h2>
            <table class="comparison-table" style="width: 100%; margin: 10px 0;">
                <tr>
                    <th>Scenario</th>
                    <th>Annual Revenue</th>
                    <th>Projects</th>
                    <th>Students</th>
                </tr>
                <tr>
                    <td><strong>Conservative</strong></td>
                    <td>${analysis.financialEstimate.conservativeScenario.annualRevenue}</td>
                    <td>${analysis.financialEstimate.conservativeScenario.projects}</td>
                    <td>${analysis.financialEstimate.conservativeScenario.students}</td>
                </tr>
                <tr>
                    <td><strong>Expected</strong></td>
                    <td>${analysis.financialEstimate.expectedScenario.annualRevenue}</td>
                    <td>${analysis.financialEstimate.expectedScenario.projects}</td>
                    <td>${analysis.financialEstimate.expectedScenario.students}</td>
                </tr>
                <tr>
                    <td><strong>Optimistic</strong></td>
                    <td>${analysis.financialEstimate.highOpportunityScenario.annualRevenue}</td>
                    <td>${analysis.financialEstimate.highOpportunityScenario.projects}</td>
                    <td>${analysis.financialEstimate.highOpportunityScenario.students}</td>
                </tr>
            </table>
            <p class="text-muted" style="font-size: 12px; margin-top: 10px;">${analysis.financialEstimate.disclaimer}</p>
        </div>

        <div class="report-section">
            <h2>3-Year Partnership Roadmap</h2>
            <h3>Year 1: ENGAGE</h3>
            <ul style="margin-left: 20px;">
                ${analysis.roadmap.year1.activities.map(a => `<li>${a}</li>`).join('')}
            </ul>
            <p style="margin-top: 10px;"><em>${analysis.roadmap.year1.objectives}</em></p>

            <h3 style="margin-top: 20px;">Year 2: COLLABORATE</h3>
            <ul style="margin-left: 20px;">
                ${analysis.roadmap.year2.activities.map(a => `<li>${a}</li>`).join('')}
            </ul>
            <p style="margin-top: 10px;"><em>${analysis.roadmap.year2.objectives}</em></p>

            <h3 style="margin-top: 20px;">Year 3: SCALE</h3>
            <ul style="margin-left: 20px;">
                ${analysis.roadmap.year3.activities.map(a => `<li>${a}</li>`).join('')}
            </ul>
            <p style="margin-top: 10px;"><em>${analysis.roadmap.year3.objectives}</em></p>
        </div>

        <div class="report-section">
            <h2>SHU Partnership Opportunity Map</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 4px;">
                    <h4 style="color: #1976d2; margin-bottom: 10px;">📚 LEARN</h4>
                    <p>What SHU students can learn from ${org.orgName}</p>
                </div>
                <div style="background: #f3e5f5; padding: 15px; border-radius: 4px;">
                    <h4 style="color: #7b1fa2; margin-bottom: 10px;">🔬 RESEARCH</h4>
                    <p>What SHU can research with ${org.orgName}</p>
                </div>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 4px;">
                    <h4 style="color: #388e3c; margin-bottom: 10px;">🔧 SOLVE</h4>
                    <p>What organizational problems SHU can help solve</p>
                </div>
                <div style="background: #fff3e0; padding: 15px; border-radius: 4px;">
                    <h4 style="color: #f57c00; margin-bottom: 10px;">🏗️ BUILD</h4>
                    <p>What products/services SHU can build together</p>
                </div>
            </div>
            <div style="background: #fce4ec; padding: 15px; border-radius: 4px; margin-top: 15px;">
                <h4 style="color: #c2185b; margin-bottom: 10px;">📈 SCALE</h4>
                <p>What can become a commercial, national or international initiative</p>
            </div>
        </div>

        <div class="report-section">
            <h2>Recommended Next Steps</h2>
            <ol style="margin-left: 20px;">
                <li>Schedule initial meeting with organization stakeholders</li>
                <li>Present this assessment and gather feedback</li>
                <li>Identify quick wins (3-6 month projects)</li>
                <li>Formalize collaboration agreement if not already done</li>
                <li>Establish project steering committee</li>
                <li>Plan Year 1 activities</li>
            </ol>
        </div>

        <div class="report-section">
            <h2>Assessment Metadata</h2>
            <p><strong>Assessment ID:</strong> ${org.id}</p>
            <p><strong>Date Created:</strong> ${new Date(org.createdDate).toLocaleString()}</p>
            <p><strong>Agreement Date:</strong> ${org.agreementDate || 'Not specified'}</p>
            <p><strong>Agreement Type:</strong> ${org.agreementType}</p>
            <p><strong>Agreement Duration:</strong> ${org.agreementDuration} months</p>
            <p><strong>Data Completeness:</strong> ${calculateDataCompleteness(org)}%</p>
        </div>
    `;
}

function generateFacultyOpportunitiesTable(opportunities) {
    return `
        <table class="comparison-table" style="width: 100%; margin: 15px 0;">
            <thead>
                <tr>
                    <th>Faculty</th>
                    <th>Opportunities</th>
                    <th>Potential Value</th>
                    <th>Priority</th>
                </tr>
            </thead>
            <tbody>
                ${opportunities.map(opp => `
                    <tr>
                        <td><strong>${opp.faculty}</strong></td>
                        <td>${opp.opportunities.join(', ')}</td>
                        <td>${formatCurrency(opp.estimatedProjectValue)}</td>
                        <td><span class="status-badge ${opp.priorityLevel.toLowerCase()}">${opp.priorityLevel}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateCrossFacultyTable(projects) {
    return `
        ${projects.map(proj => `
            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                <h3 style="color: #003366; margin-bottom: 10px;">${proj.title}</h3>
                <p><strong>Faculties:</strong> ${proj.faculties.join(', ')}</p>
                <p><strong>Problem:</strong> ${proj.problem}</p>
                <p><strong>Solution:</strong> ${proj.solution}</p>
                <p><strong>Estimated Value:</strong> ${formatCurrency(proj.estimatedValue)}</p>
                <p><strong>Duration:</strong> ${proj.duration}</p>
                <p><strong>Research Potential:</strong> <span class="status-badge">${proj.researchPotential}</span></p>
                <p><strong>Commercialization:</strong> <span class="status-badge">${proj.commercializationPotential}</span></p>
            </div>
        `).join('')}
    `;
}

function generateDimensionTable(dimensions) {
    return Object.entries(dimensions).map(([dim, val]) => `
        <tr>
            <td><strong>${dim.charAt(0).toUpperCase() + dim.slice(1)}:</strong></td>
            <td>${val.score}/100</td>
        </tr>
    `).join('');
}

// ============================================
// DASHBOARD VIEW
// ============================================

function viewDashboard(org) {
    AppState.currentDashboardOrg = org;
    switchView('dashboard');

    const noDashboardData = document.getElementById('noDashboardData');
    const dashboardContent = document.getElementById('dashboardContent');

    noDashboardData.style.display = 'none';
    dashboardContent.style.display = 'block';
    dashboardContent.innerHTML = generateDashboard(org);

    // Initialize charts
    setTimeout(() => {
        initializeCharts(org);
    }, 100);
}

function generateDashboard(org) {
    const analysis = org.analysis;

    return `
        <div class="dashboard-header">
            <div class="dashboard-stat">
                <div class="dashboard-stat-label">Organization</div>
                <div class="dashboard-stat-value">${org.orgName}</div>
            </div>
            <div class="dashboard-stat">
                <div class="dashboard-stat-label">Industry</div>
                <div class="dashboard-stat-value">${org.orgIndustry}</div>
            </div>
            <div class="dashboard-stat">
                <div class="dashboard-stat-label">Status</div>
                <div class="dashboard-stat-value">${org.status}</div>
            </div>
            <div class="dashboard-stat">
                <div class="dashboard-stat-label">Employees</div>
                <div class="dashboard-stat-value">${org.orgEmployees || 'N/A'}</div>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="chart-card">
                <h3>Partnership Value Score</h3>
                <div class="chart-container">
                    <canvas id="partnershipRadar"></canvas>
                </div>
                <p style="text-align: center; margin-top: 10px; font-weight: 600; color: #003366;">
                    ${analysis.partnershipValue.weightedPartnershipIndex}/100
                </p>
            </div>

            <div class="chart-card">
                <h3>Faculty Opportunity Distribution</h3>
                <div class="chart-container">
                    <canvas id="facultyChart"></canvas>
                </div>
            </div>

            <div class="chart-card">
                <h3>Financial Opportunity Scenarios</h3>
                <div class="chart-container">
                    <canvas id="financialChart"></canvas>
                </div>
            </div>

            <div class="chart-card">
                <h3>Opportunity Priority Matrix</h3>
                <div class="chart-container">
                    <canvas id="opportunityChart"></canvas>
                </div>
            </div>

            <div class="chart-card" style="grid-column: span 2;">
                <h3>Faculty Opportunity Heatmap</h3>
                <div class="heatmap">
                    ${generateHeatmap(analysis.facultyOpportunities)}
                </div>
            </div>

            <div class="chart-card" style="grid-column: 1 / -1;">
                <h3>3-Year Partnership Roadmap</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 15px;">
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 4px;">
                        <h4 style="color: #1976d2; margin-bottom: 10px;">Year 1: ENGAGE</h4>
                        <ul style="margin-left: 15px; font-size: 13px;">
                            ${analysis.roadmap.year1.activities.slice(0, 3).map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                    <div style="background: #f3e5f5; padding: 15px; border-radius: 4px;">
                        <h4 style="color: #7b1fa2; margin-bottom: 10px;">Year 2: COLLABORATE</h4>
                        <ul style="margin-left: 15px; font-size: 13px;">
                            ${analysis.roadmap.year2.activities.slice(0, 3).map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 4px;">
                        <h4 style="color: #388e3c; margin-bottom: 10px;">Year 3: SCALE</h4>
                        <ul style="margin-left: 15px; font-size: 13px;">
                            ${analysis.roadmap.year3.activities.slice(0, 3).map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateHeatmap(opportunities) {
    const facultyNames = AppState.settings.faculties.map(f => f.name.split(' ')[0]);
    const opportunityTypes = ['Research', 'Consultancy', 'Student Projects', 'Internships', 'Training'];

    let html = '<table class="heatmap-table"><thead><tr><th></th>';
    facultyNames.forEach(f => html += `<th>${f}</th>`);
    html += '</tr></thead><tbody>';

    opportunityTypes.forEach(type => {
        html += `<tr><td class="label-col">${type}</td>`;
        AppState.settings.faculties.forEach(() => {
            const level = Math.random() > 0.6 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';
            html += `<td class="heatmap-${level}">${level.charAt(0).toUpperCase()}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

function initializeCharts(org) {
    const analysis = org.analysis;

    // Partnership Value Radar Chart
    const ctx1 = document.getElementById('partnershipRadar');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'radar',
            data: {
                labels: ['Academic', 'Research', 'Student', 'Faculty', 'Commercial', 'Innovation', 'Entrepreneurship', 'Revenue', 'Strategic'],
                datasets: [{
                    label: 'Partnership Dimensions',
                    data: [
                        analysis.partnershipValue.dimensions.academic.score,
                        analysis.partnershipValue.dimensions.research.score,
                        analysis.partnershipValue.dimensions.student.score,
                        analysis.partnershipValue.dimensions.faculty.score,
                        analysis.partnershipValue.dimensions.commercial.score,
                        analysis.partnershipValue.dimensions.innovation.score,
                        analysis.partnershipValue.dimensions.entrepreneurship.score,
                        analysis.partnershipValue.dimensions.revenue.score,
                        analysis.partnershipValue.dimensions.strategic.score
                    ],
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { max: 100, beginAtZero: true }
                }
            }
        });
    }

    // Faculty Opportunity Chart
    const ctx2 = document.getElementById('facultyChart');
    if (ctx2) {
        const facultyData = analysis.facultyOpportunities.reduce((acc, f) => {
            acc[f.faculty] = f.estimatedProjectValue;
            return acc;
        }, {});

        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: Object.keys(facultyData),
                datasets: [{
                    label: 'Estimated Value (PKR)',
                    data: Object.values(facultyData),
                    backgroundColor: '#0066cc',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y'
            }
        });
    }

    // Financial Scenarios Chart
    const ctx3 = document.getElementById('financialChart');
    if (ctx3) {
        const scenarios = analysis.financialEstimate;

        new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: ['Conservative', 'Expected', 'Optimistic'],
                datasets: [{
                    label: 'Annual Revenue Estimate (PKR)',
                    data: [
                        parseInt(scenarios.conservativeScenario.annualRevenue.replace(/[^\d]/g, '')) || 500000,
                        parseInt(scenarios.expectedScenario.annualRevenue.replace(/[^\d]/g, '')) || 1500000,
                        parseInt(scenarios.highOpportunityScenario.annualRevenue.replace(/[^\d]/g, '')) || 3000000
                    ],
                    backgroundColor: ['#ff9800', '#0066cc', '#27ae60']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Opportunity Priority Chart
    const ctx4 = document.getElementById('opportunityChart');
    if (ctx4) {
        new Chart(ctx4, {
            type: 'doughnut',
            data: {
                labels: ['Quick Wins', 'Medium-term', 'Strategic'],
                datasets: [{
                    data: [30, 40, 30],
                    backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// ============================================
// ORGANIZATIONS MANAGEMENT
// ============================================

function renderOrganizationsList() {
    const search = (document.getElementById('searchOrg')?.value || '').toLowerCase();
    const filterIndustry = document.getElementById('filterIndustry')?.value || '';
    const filterStatus = document.getElementById('filterStatus')?.value || '';

    let filtered = AppState.organizations;

    if (search) {
        filtered = filtered.filter(org => org.orgName.toLowerCase().includes(search));
    }
    if (filterIndustry) {
        filtered = filtered.filter(org => org.orgIndustry === filterIndustry);
    }
    if (filterStatus) {
        filtered = filtered.filter(org => org.status === filterStatus);
    }

    const listContainer = document.getElementById('organizationsList');

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="empty-state"><p>📭 No organizations found</p></div>';
        return;
    }

    listContainer.innerHTML = filtered.map(org => `
        <div class="org-card">
            <div class="org-card-header">
                <h3>${org.orgName}</h3>
                <span class="status-badge ${org.status.toLowerCase()}">${org.status}</span>
            </div>
            <div class="org-card-info">
                <p><strong>Industry:</strong> ${org.orgIndustry}</p>
                <p><strong>Type:</strong> ${org.orgType}</p>
                <p><strong>Employees:</strong> ${org.orgEmployees || 'N/A'}</p>
                <p><strong>Agreement:</strong> ${org.agreementType}</p>
            </div>
            <div class="org-card-actions">
                <button onclick="viewDashboard(AppState.organizations.find(o => o.id === ${org.id}))">Dashboard</button>
                <button onclick="editOrganization(${org.id})">Edit</button>
                <button onclick="deleteOrganization(${org.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function editOrganization(id) {
    const org = AppState.organizations.find(o => o.id === id);
    if (org) {
        // Pre-fill form
        document.getElementById('orgName').value = org.orgName;
        document.getElementById('orgWebsite').value = org.orgWebsite;
        document.getElementById('orgCountry').value = org.orgCountry;
        document.getElementById('orgCity').value = org.orgCity;
        document.getElementById('orgIndustry').value = org.orgIndustry;
        document.getElementById('orgSubIndustry').value = org.orgSubIndustry;
        document.getElementById('orgYearEstablished').value = org.orgYearEstablished || '';
        document.getElementById('orgType').value = org.orgType;
        document.getElementById('agreementType').value = org.agreementType;
        document.getElementById('agreementDate').value = org.agreementDate;
        document.getElementById('agreementDuration').value = org.agreementDuration;
        document.getElementById('shuContact').value = org.shuContact;
        document.getElementById('orgContact').value = org.orgContact;
        document.getElementById('existingCollaboration').value = org.existingCollaboration;
        document.getElementById('orgRevenue').value = org.orgRevenue || '';
        document.getElementById('orgEmployees').value = org.orgEmployees || '';
        document.getElementById('orgBranches').value = org.orgBranches || '';
        document.getElementById('orgInvestment').value = org.orgInvestment || '';
        document.getElementById('orgDescription').value = org.orgDescription;
        document.getElementById('existingProjects').value = org.existingProjects;

        switchView('assessment');

        // Change button text for update mode
        const btn = document.getElementById('analyzeBtn');
        btn.textContent = 'UPDATE ORGANIZATION';
        btn.dataset.orgId = id;
    }
}

function deleteOrganization(id) {
    if (confirm('Are you sure you want to delete this assessment?')) {
        AppState.organizations = AppState.organizations.filter(o => o.id !== id);
        saveToStorage();
        renderOrganizationsList();
        updateHomeStats();
    }
}

function updateIndustryFilter() {
    const industries = [...new Set(AppState.organizations.map(o => o.orgIndustry))];
    const select = document.getElementById('filterIndustry');
    if (select) {
        const current = select.value;
        select.innerHTML = '<option value="">All Industries</option>';
        industries.forEach(ind => {
            const option = document.createElement('option');
            option.value = ind;
            option.textContent = ind;
            select.appendChild(option);
        });
        select.value = current;
    }
}

// ============================================
// COMPARISON FUNCTIONALITY
// ============================================

function renderComparisonSelectors() {
    const container = document.getElementById('comparisonSelectors');
    container.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const div = document.createElement('div');
        div.className = 'form-group';
        const select = document.createElement('select');
        select.innerHTML = '<option value="">Select Organization ' + (i + 1) + '</option>';

        AppState.organizations.forEach(org => {
            const option = document.createElement('option');
            option.value = org.id;
            option.textContent = org.orgName;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            if (e.target.value) {
                if (!AppState.selectedComparison.includes(parseInt(e.target.value))) {
                    AppState.selectedComparison.push(parseInt(e.target.value));
                }
            }
        });

        div.appendChild(select);
        container.appendChild(div);
    }
}

function generateComparison() {
    const selected = AppState.selectedComparison
        .filter(id => AppState.organizations.find(o => o.id === id))
        .map(id => AppState.organizations.find(o => o.id === id));

    if (selected.length < 2) {
        alert('Please select at least 2 organizations to compare');
        return;
    }

    const resultsDiv = document.getElementById('comparisonResults');
    resultsDiv.innerHTML = generateComparisonTable(selected);
}

function generateComparisonTable(orgs) {
    return `
        <h3>Comparative Analysis</h3>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    ${orgs.map(o => `<th>${o.orgName}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Industry</strong></td>
                    ${orgs.map(o => `<td>${o.orgIndustry}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Type</strong></td>
                    ${orgs.map(o => `<td>${o.orgType}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Employees</strong></td>
                    ${orgs.map(o => `<td>${o.orgEmployees || 'N/A'}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Revenue</strong></td>
                    ${orgs.map(o => `<td>${o.orgRevenue ? formatCurrency(o.orgRevenue) : 'N/A'}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Agreement Type</strong></td>
                    ${orgs.map(o => `<td>${o.agreementType}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Partnership Value Score</strong></td>
                    ${orgs.map(o => `<td>${o.analysis.partnershipValue.weightedPartnershipIndex}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Growth Score</strong></td>
                    ${orgs.map(o => `<td>${o.analysis.growthAnalysis.growthScore}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Faculty Opportunities</strong></td>
                    ${orgs.map(o => `<td>${o.analysis.facultyOpportunities.length}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Annual Student Capacity</strong></td>
                    ${orgs.map(o => `<td>${o.analysis.projectsAndInternships.studentProjects.totalAnnualCapacity}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Research Potential</strong></td>
                    ${orgs.map(o => `<td>${o.analysis.researchPotential.collaborationPotential}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Estimated Annual Value</strong></td>
                    ${orgs.map(o => `<td>${o.analysis.financialEstimate.expectedScenario.annualRevenue}</td>`).join('')}
                </tr>
            </tbody>
        </table>
    `;
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

function renderFacultiesList() {
    const container = document.getElementById('facultiesContainer');
    if (!container) return;

    container.innerHTML = '';

    AppState.settings.faculties.forEach((faculty, idx) => {
        const div = document.createElement('div');
        div.className = 'form-section';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h4>${faculty.name}</h4>
                    <p style="margin-top: 8px; font-size: 13px; color: #666;">
                        ${faculty.researchAreas.join(', ')}
                    </p>
                </div>
                <button class="btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="removeFaculty(${idx})">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function addNewFaculty() {
    const name = prompt('Enter faculty name:');
    if (!name) return;

    const areasStr = prompt('Enter research areas (comma-separated):');
    if (!areasStr) return;

    const areas = areasStr.split(',').map(a => a.trim());

    AppState.settings.faculties.push({
        name: name,
        researchAreas: areas
    });

    saveToStorage();
    renderFacultiesList();
}

function removeFaculty(idx) {
    AppState.settings.faculties.splice(idx, 1);
    saveToStorage();
    renderFacultiesList();
}

function renderCostRanges() {
    const tbody = document.getElementById('costRangesTable');
    if (!tbody) return;

    tbody.innerHTML = AppState.settings.costRanges.map((range, idx) => `
        <tr>
            <td>${range.category}</td>
            <td><input type="number" value="${range.min}" onchange="updateCostRange(${idx}, 'min', this.value)"></td>
            <td><input type="number" value="${range.max}" onchange="updateCostRange(${idx}, 'max', this.value)"></td>
            <td><button class="btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="removeCostRange(${idx})">Remove</button></td>
        </tr>
    `).join('');
}

function updateCostRange(idx, field, value) {
    AppState.settings.costRanges[idx][field] = parseInt(value);
    saveToStorage();
}

function removeCostRange(idx) {
    AppState.settings.costRanges.splice(idx, 1);
    saveToStorage();
    renderCostRanges();
}

function renderWeightSliders() {
    const container = document.getElementById('weightSliders');
    if (!container) return;

    const dimensions = ['academic', 'research', 'student', 'faculty', 'commercial', 'innovation', 'entrepreneurship', 'revenue', 'strategic'];

    container.innerHTML = dimensions.map(dim => {
        const value = AppState.settings.weights[dim] || 0.1;
        return `
            <div class="slider-group">
                <label>${dim.charAt(0).toUpperCase() + dim.slice(1)}:</label>
                <input type="range" min="0" max="100" value="${value * 100}"
                       onchange="updateWeight('${dim}', this.value / 100)">
                <span class="slider-value">${Math.round(value * 1000) / 10}%</span>
            </div>
        `;
    }).join('');
}

function updateWeight(dimension, value) {
    AppState.settings.weights[dimension] = parseFloat(value);
    saveToStorage();
    renderWeightSliders();
}

// ============================================
// DEMO DATA
// ============================================

function loadDemoData() {
    if (confirm('This will add demo organizations. Continue?')) {
        const demoOrgs = generateDemoOrganizations();
        AppState.organizations.push(...demoOrgs);
        saveToStorage();
        alert('Demo data loaded successfully!');
        renderOrganizationsList();
        updateHomeStats();
    }
}

function generateDemoOrganizations() {
    const demoData = [
        {
            orgName: 'PharmEvo Solutions',
            orgWebsite: 'https://pharmevo.pk',
            orgCountry: 'Pakistan',
            orgCity: 'Karachi',
            orgIndustry: 'Pharmaceutical',
            orgSubIndustry: 'Drug Manufacturing',
            orgYearEstablished: 2010,
            orgType: 'Private Company',
            agreementType: 'MOU',
            agreementDate: '2023-06-15',
            agreementDuration: 24,
            shuContact: 'Dr. Ahmed Khan',
            orgContact: 'Mr. Farhan Ahmed',
            existingCollaboration: 'Initial discussions on drug formulation research',
            orgRevenue: 2500000000,
            orgEmployees: 250,
            orgBranches: 3,
            orgInvestment: 500000000,
            orgDescription: 'Leading pharmaceutical manufacturer specializing in generic drugs and novel formulations',
            existingProjects: 'Bioequivalence study discussions',
            websiteInfo: 'Company produces 150+ medicines. Strong R&D focus. Exports to 15 countries.',
            financialInfo: '500% growth in 5 years. Profit margins 20-25%.',
            newsInfo: 'Expanded capacity in 2023. Planning new facility in Islamabad.',
            linkedinInfo: '500+ employees. Hiring for R&D and Quality roles. Innovation-focused culture.'
        },
        {
            orgName: 'TechFlow Digital',
            orgWebsite: 'https://techflow.pk',
            orgCountry: 'Pakistan',
            orgCity: 'Lahore',
            orgIndustry: 'Information Technology',
            orgSubIndustry: 'Software Development',
            orgYearEstablished: 2015,
            orgType: 'Private Company',
            agreementType: 'Strategic Partnership',
            agreementDate: '2024-01-10',
            agreementDuration: 36,
            shuContact: 'Prof. Fatima Khan',
            orgContact: 'Ms. Aeisha Malik',
            existingCollaboration: 'Student internships and AI research collaboration',
            orgRevenue: 800000000,
            orgEmployees: 180,
            orgBranches: 2,
            orgInvestment: 200000000,
            orgDescription: 'Technology company specializing in AI/ML solutions and enterprise software',
            existingProjects: 'Machine learning for supply chain optimization',
            websiteInfo: 'Serves 50+ enterprise clients. AI expertise in NLP, computer vision.',
            financialInfo: 'Year-over-year 45% growth. Revenue 800M PKR.',
            newsInfo: 'Raising Series A funding. Opening office in Dubai.',
            linkedinInfo: 'Team includes 15+ AI experts. Regular tech talks and workshops.'
        },
        {
            orgName: 'Medicare Health Systems',
            orgWebsite: 'https://medicarehealth.pk',
            orgCountry: 'Pakistan',
            orgCity: 'Islamabad',
            orgIndustry: 'Healthcare',
            orgSubIndustry: 'Hospital Management',
            orgYearEstablished: 2008,
            orgType: 'Private Company',
            agreementType: 'Sponsored Research',
            agreementDate: '2023-09-20',
            agreementDuration: 12,
            shuContact: 'Dr. Muhammad Zain',
            orgContact: 'Dr. Hiba Ali',
            existingCollaboration: 'Clinical research and medical device testing',
            orgRevenue: 1200000000,
            orgEmployees: 320,
            orgBranches: 5,
            orgInvestment: null,
            orgDescription: 'Premium healthcare provider with 5 hospitals and 100+ clinics across Pakistan',
            existingProjects: 'Digital health platform development',
            websiteInfo: 'Network of 5 major hospitals. 2000+ beds. Modern diagnostic facilities.',
            financialInfo: 'Profit margin 15%. Planning expansion to 10 hospitals by 2026.',
            newsInfo: 'Opened new facility in Rawalpindi. Implementing AI diagnostics.',
            linkedinInfo: '300+ healthcare professionals. Training programs ongoing.'
        }
    ];

    return demoData.map((org, idx) => {
        org.id = Date.now() + idx;
        org.createdDate = new Date().toISOString();
        org.status = ['Active', 'MOU', 'Developing'][Math.floor(Math.random() * 3)];

        // Run basic analysis for demo
        org.analysis = {
            organizationProfile: analyzeOrganizationProfile(org),
            marketAnalysis: analyzeMarketPosition(org),
            growthAnalysis: analyzeGrowthPotential(org),
            capacityAnalysis: analyzeOrganizationalCapacity(org),
            innovationAnalysis: analyzeInnovationCapability(org),
            facultyOpportunities: mapFacultyOpportunities(org),
            crossFacultyProjects: identifyCrossFacultyProjects(org),
            projectsAndInternships: calculateProjectsAndInternships(org),
            researchPotential: assessResearchPotential(org),
            consultancyPotential: assessConsultancyPotential(org),
            trainingPotential: assessTrainingPotential(org),
            commercializationPotential: assessCommercializationPotential(org),
            partnershipValue: calculatePartnershipValue(org),
            financialEstimate: estimateFinancialOpportunity(org),
            roadmap: generate3YearRoadmap(org)
        };

        return org;
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function resetAssessmentForm() {
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
        el.value = '';
    });
    document.getElementById('orgCountry').value = 'Pakistan';
    document.getElementById('agreementDuration').value = '12';
    document.getElementById('analyzeBtn').textContent = 'ANALYZE ORGANIZATION';
    document.getElementById('analyzeBtn').dataset.orgId = '';
}

function updateHomeStats() {
    const totalOrgs = AppState.organizations.length;
    const totalProjects = AppState.organizations.reduce((sum, org) =>
        sum + (org.analysis?.projectsAndInternships?.studentProjects?.totalAnnualCapacity || 0), 0);
    const totalValue = AppState.organizations.reduce((sum, org) => {
        const val = org.analysis?.financialEstimate?.expectedScenario?.annualRevenue?.replace(/[^\d]/g, '') || 0;
        return sum + parseInt(val);
    }, 0);

    document.getElementById('totalOrganizations').textContent = totalOrgs;
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('totalValue').textContent = formatCurrency(totalValue);
}

function formatCurrency(value) {
    if (!value || value === 0) return 'PKR 0';
    const currency = AppState.settings.currency || 'PKR';
    return currency + ' ' + (value / 1000000).toFixed(1) + 'M';
}

function saveToStorage() {
    localStorage.setItem('shuOrganizations', JSON.stringify(AppState.organizations));
    localStorage.setItem('shuSettings', JSON.stringify(AppState.settings));
}

function loadFromStorage() {
    const orgs = localStorage.getItem('shuOrganizations');
    const settings = localStorage.getItem('shuSettings');

    if (orgs) AppState.organizations = JSON.parse(orgs);
    if (settings) AppState.settings = JSON.parse(settings);
}

function exportData() {
    const data = {
        organizations: AppState.organizations,
        settings: AppState.settings,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', `shu-partnership-data-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ============================================
// ANALYSIS HELPER FUNCTIONS
// ============================================

function getPartnershipStatus(agreementType) {
    const statusMap = {
        'MOU': 'MOU',
        'Strategic Partnership': 'Active',
        'Sponsored Research': 'Active',
        'Consultancy': 'Developing',
        'Training': 'Developing',
        'Internship': 'Developing',
        'Other': 'Developing'
    };
    return statusMap[agreementType] || 'Developing';
}

function categorizeEmployees(count) {
    if (!count) return 'Not specified';
    if (count < 50) return 'Micro (< 50)';
    if (count < 200) return 'Small (50-200)';
    if (count < 500) return 'Medium (200-500)';
    if (count < 1000) return 'Large (500-1000)';
    return 'Very Large (1000+)';
}

function categorizeRevenue(revenue) {
    if (!revenue) return 'Not specified';
    if (revenue < 100000000) return 'Small revenue';
    if (revenue < 500000000) return 'Medium revenue';
    if (revenue < 1000000000) return 'Large revenue';
    return 'Very large revenue';
}

function extractMarketSegments(data) {
    const segments = [];
    const industry = data.orgIndustry.toLowerCase();

    if (industry.includes('pharma')) segments.push('Healthcare', 'Retail', 'Hospital');
    if (industry.includes('tech')) segments.push('Enterprise', 'SME', 'Retail');
    if (industry.includes('bank')) segments.push('Corporate', 'Retail', 'Digital');
    if (segments.length === 0) segments.push('Diversified');

    return segments;
}

function getMarketPosition(data) {
    if (data.orgType === 'Multinational') return 'Market Leader/International';
    if (data.orgType === 'Public Company') return 'Established Market Player';
    if (data.orgType === 'Startup') return 'Emerging Player';
    if (data.orgType === 'SME') return 'Niche Player';
    return 'Moderate Market Presence';
}

function assessCompetitiveIntensity(data) {
    const industry = data.orgIndustry.toLowerCase();

    if (industry.includes('pharma')) return 'High - Many established players';
    if (industry.includes('bank') || industry.includes('finance')) return 'High - Highly competitive';
    if (industry.includes('tech')) return 'Very High - Rapid innovation race';
    return 'Moderate to High';
}

function identifyCompetitors(data) {
    const industry = data.orgIndustry.toLowerCase();

    if (industry.includes('pharma')) return ['Ferozsons', 'Abbott', 'Getz Pharma', 'Hikma', 'Others'];
    if (industry.includes('tech')) return ['TechJuice', 'LMKR', 'Daraz', 'Careem', 'Others'];
    if (industry.includes('bank')) return ['HBL', 'MCB', 'UBL', 'Alfalah', 'Others'];
    return ['Other organizations in the sector'];
}

function identifyMarketTrends(data) {
    const trends = ['Digital transformation', 'Sustainability focus'];
    const industry = data.orgIndustry.toLowerCase();

    if (industry.includes('pharma')) trends.push('Affordable medicines', 'Biosimilars');
    if (industry.includes('tech')) trends.push('AI adoption', 'Cloud migration');
    if (industry.includes('healthcare')) trends.push('Telemedicine', 'Health tech');

    return trends;
}

function getGrowthInterpretation(score) {
    if (score >= 80) return 'Exceptional growth potential - Strategic opportunity';
    if (score >= 60) return 'Strong growth potential - High priority';
    if (score >= 40) return 'Moderate growth potential - Consider for engagement';
    return 'Limited growth indicators - Monitor for future opportunities';
}

function identifyExpansionIndicators(data) {
    const indicators = [];

    if (data.orgBranches && data.orgBranches > 2) indicators.push('Multi-location expansion');
    if (data.orgInvestment) indicators.push('Recent investment activity');
    if (data.newsInfo && data.newsInfo.length > 50) indicators.push('Active in market');
    if (data.orgEmployees && data.orgEmployees > 150) indicators.push('Growing workforce');

    return indicators.length > 0 ? indicators : ['Moderate growth activity'];
}

function extractFacilitiesInfo(data) {
    if (data.orgIndustry.toLowerCase().includes('pharma')) return ['Manufacturing facility', 'Quality lab', 'R&D center'];
    if (data.orgIndustry.toLowerCase().includes('tech')) return ['Office', 'Development lab', 'Cloud infrastructure'];
    if (data.orgIndustry.toLowerCase().includes('healthcare')) return ['Hospital facilities', 'Diagnostic centers', 'Clinics'];
    return ['Operations facility'];
}

function assessTechnicalCapacity(data) {
    if (data.orgEmployees && data.orgEmployees > 200) return 'Strong - Dedicated technical teams';
    if (data.orgEmployees && data.orgEmployees > 50) return 'Moderate - Some technical capability';
    return 'Limited information available';
}

function assessManagementCapacity(data) {
    if (data.orgType === 'Multinational' || data.orgType === 'Public Company') return 'Strong - Professional management';
    if (data.orgType === 'Private Company') return 'Likely strong - Established operations';
    if (data.orgType === 'Startup') return 'Developing - Founder-led';
    return 'Not specified';
}

function assessDigitalCapability(data) {
    if (data.orgWebsite) return 'Present - Digital presence confirmed';
    if (data.linkedinInfo) return 'Likely present - Active on LinkedIn';
    return 'Not specified';
}

function assessAIAdoption(data) {
    if (data.linkedinInfo && data.linkedinInfo.includes('AI')) return 'Possible - AI interest shown';
    if (data.orgIndustry.toLowerCase().includes('tech')) return 'Likely - Tech industry standard';
    return 'Not specified';
}

function extractRandDInfo(data) {
    if (data.orgIndustry.toLowerCase().includes('pharma')) return 'Likely - Pharma R&D typical';
    if (data.linkedinInfo && data.linkedinInfo.includes('research')) return 'Confirmed - Research activity mentioned';
    if (data.newsInfo && data.newsInfo.includes('innovation')) return 'Indicated - Innovation focus';
    return 'Not specified';
}

function assessDigitalization(data) {
    if (data.orgWebsite && data.linkedinInfo) return 'Strong digitalization indicators';
    if (data.orgWebsite) return 'Digital presence confirmed';
    return 'Limited information';
}

function assessTechAdoption(data) {
    const text = (data.websiteInfo + data.linkedinInfo + data.newsInfo).toLowerCase();
    if (text.includes('cloud') || text.includes('digital') || text.includes('automation')) return 'Active tech adoption';
    if (text.includes('system') || text.includes('software')) return 'Moderate tech usage';
    return 'Not specified';
}

function extractSkillsRequired(data) {
    const skills = [];
    const industry = data.orgIndustry.toLowerCase();

    if (industry.includes('pharma')) skills.push('Chemistry', 'Quality Assurance', 'Lab work');
    if (industry.includes('tech')) skills.push('Programming', 'Data analysis', 'Problem solving');
    if (industry.includes('healthcare')) skills.push('Healthcare admin', 'Medical knowledge');
    skills.push('Professional communication', 'Teamwork');

    return skills;
}

function assessInternshipScore(employees) {
    if (!employees) return 'Medium';
    if (employees > 500) return 'High';
    if (employees > 100) return 'Moderate-High';
    if (employees > 50) return 'Moderate';
    return 'Low-Moderate';
}

function calculateStudentProjectValue(projectsByFaculty) {
    const total = Object.values(projectsByFaculty).reduce((a, b) => a + b, 0);
    return formatCurrency(total * 200000); // ~200K per project
}

function calculateCommercialOpportunity(data) {
    let value = 500000;
    if (data.orgEmployees) value += data.orgEmployees * 5000;
    if (data.orgRevenue) value += data.orgRevenue * 0.01;
    return value;
}

function getConfidenceLevel(data) {
    let confidence = 50;
    if (data.orgEmployees) confidence += 15;
    if (data.orgRevenue) confidence += 15;
    if (data.orgWebsite) confidence += 10;
    if (data.websiteInfo) confidence += 5;

    return confidence > 70 ? 'High' : confidence > 40 ? 'Medium' : 'Low';
}

function extractSources(data) {
    const sources = [];
    if (data.orgWebsite) sources.push('Organization website');
    if (data.websiteInfo) sources.push('Manual research');
    if (data.linkedinInfo) sources.push('LinkedIn');
    if (data.financialInfo) sources.push('Financial information');
    if (data.newsInfo) sources.push('News/market reports');
    return sources.length > 0 ? sources : ['Manual input'];
}

function calculateDataCompleteness(org) {
    let complete = 0;
    const fields = ['orgName', 'orgIndustry', 'orgType', 'agreementType', 'orgEmployees', 'orgRevenue', 'orgDescription'];

    fields.forEach(field => {
        if (org[field]) complete++;
    });

    return Math.round((complete / fields.length) * 100);
}

function getIndexInterpretation(score) {
    if (score >= 80) return 'Excellent - Strategic priority partnership';
    if (score >= 65) return 'Very Good - High value partnership potential';
    if (score >= 50) return 'Good - Significant collaboration opportunity';
    if (score >= 35) return 'Moderate - Worth exploring further';
    return 'Limited - Monitor for future opportunities';
}

// ============================================
// DEFAULT DATA INITIALIZATION
// ============================================

function getDefaultFaculties() {
    return [
        {
            name: 'Faculty of Computer Science & Computing',
            researchAreas: ['AI/ML', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'Blockchain', 'IoT']
        },
        {
            name: 'Faculty of Business & Management',
            researchAreas: ['Strategy', 'Marketing', 'Finance', 'HR', 'Entrepreneurship', 'Business Analytics']
        },
        {
            name: 'Faculty of Pharmacy',
            researchAreas: ['Drug Discovery', 'Formulation', 'Quality Control', 'Pharmacology', 'Regulatory Affairs', 'Clinical Research']
        },
        {
            name: 'Faculty of Biosciences',
            researchAreas: ['Biotechnology', 'Microbiology', 'Molecular Biology', 'Environmental Biotech', 'Food Science']
        },
        {
            name: 'Faculty of Biomedical Engineering',
            researchAreas: ['Medical Devices', 'Digital Health', 'Diagnostics', 'Prosthetics', 'Biosensors', 'AI in Healthcare']
        }
    ];
}

function getDefaultCostRanges() {
    return [
        { category: 'Micro', min: 250000, max: 1000000 },
        { category: 'Small', min: 1000000, max: 5000000 },
        { category: 'Medium', min: 5000000, max: 25000000 },
        { category: 'Large', min: 25000000, max: 100000000 },
        { category: 'Strategic', min: 100000000, max: 1000000000 }
    ];
}

function getDefaultWeights() {
    return {
        academic: 0.10,
        research: 0.15,
        student: 0.15,
        faculty: 0.10,
        commercial: 0.15,
        innovation: 0.10,
        entrepreneurship: 0.10,
        revenue: 0.10,
        strategic: 0.05
    };
}

function getDefaultExchangeRates() {
    return {
        PKR: 1,
        USD: 278,
        AED: 75.75,
        GBP: 351,
        EUR: 303
    };
}

// Initialize application
console.log('SHU Industry Partner Intelligence Platform loaded successfully');
