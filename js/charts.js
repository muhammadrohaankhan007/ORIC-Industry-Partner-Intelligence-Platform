/**
 * SHU INDUSTRY PARTNER INTELLIGENCE & OPPORTUNITY ASSESSMENT PLATFORM
 * Chart.js Visualizations (Requirement 25)
 * Manages Radar, Bar, Donut, and Scenario charts with responsive theming.
 */

const SHU_CHARTS = {
  instances: {},

  /**
   * Safe destruction of previous chart instance
   */
  destroy(canvasId) {
    if (this.instances[canvasId]) {
      try {
        this.instances[canvasId].destroy();
      } catch (e) {
        console.warn("Chart destroy warning:", e);
      }
      delete this.instances[canvasId];
    }
  },

  /**
   * Helper to get theme colors
   */
  getThemeColors() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      textColor: isDark ? "#e2e8f0" : "#334155",
      gridColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      primary: "#0A2540",
      secondary: "#005A9C",
      accent: "#C59B27",
      emerald: "#059669",
      purple: "#7c3aed"
    };
  },

  /**
   * Render 9-Dimension Radar Chart: SHU Partnership Potential
   */
  renderRadarChart(canvasId, scores) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    const colors = this.getThemeColors();
    const labels = [
      "Academic Value",
      "Research Value",
      "Student Value",
      "Faculty Value",
      "Commercial Value",
      "Innovation Value",
      "Entrepreneurship",
      "Revenue Potential",
      "Strategic Value"
    ];

    const dataValues = [
      scores.academicValue || 80,
      scores.researchValue || 80,
      scores.studentValue || 85,
      scores.facultyValue || 75,
      scores.commercialValue || 70,
      scores.innovationValue || 80,
      scores.entrepreneurshipValue || 70,
      scores.revenuePotential || 75,
      scores.strategicValue || 85
    ];

    this.instances[canvasId] = new Chart(canvas, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          label: "Partnership Dimension Score (0–100)",
          data: dataValues,
          backgroundColor: "rgba(0, 90, 156, 0.22)",
          borderColor: "#005A9C",
          borderWidth: 2.5,
          pointBackgroundColor: "#C59B27",
          pointBorderColor: "#fff",
          pointHoverRadius: 6,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: colors.gridColor },
            grid: { color: colors.gridColor },
            pointLabels: {
              color: colors.textColor,
              font: { size: 11, weight: "600", family: "'Inter', sans-serif" }
            },
            suggestedMin: 30,
            suggestedMax: 100,
            ticks: {
              backdropColor: "transparent",
              color: colors.textColor,
              stepSize: 20
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(10, 37, 64, 0.95)",
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 12, weight: "bold" }
          }
        }
      }
    });
  },

  /**
   * Render Faculty Opportunity Bar Chart
   */
  renderFacultyBarChart(canvasId, facultyOpps) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    const colors = this.getThemeColors();
    const labels = facultyOpps.map(f => {
      // Shorten name for chart clarity
      return f.facultyName.replace("Faculty of ", "");
    });

    const activeCurrency = SHU_CONFIG.activeCurrency || "PKR";
    const currRate = (SHU_CONFIG.currencies[activeCurrency] || { rate: 1.0 }).rate;

    const values = facultyOpps.map(f => Math.round((f.estimatedValuePKR || 3000000) * currRate));

    this.instances[canvasId] = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: `Estimated Project Value (${activeCurrency})`,
          data: values,
          backgroundColor: [
            "rgba(37, 99, 235, 0.82)",
            "rgba(13, 148, 136, 0.82)",
            "rgba(22, 163, 74, 0.82)",
            "rgba(217, 119, 6, 0.82)",
            "rgba(147, 51, 234, 0.82)"
          ],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Value: ${formatCurrency((context.raw / currRate))}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { size: 10, weight: "500" }
            }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              callback: (v) => activeCurrency === "PKR" ? (v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v) : v.toLocaleString()
            }
          }
        }
      }
    });
  },

  /**
   * Render Donut Chart: Opportunity Distribution
   */
  renderOpportunityDonutChart(canvasId, partner) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    const colors = this.getThemeColors();
    const labels = [
      "Sponsored Research",
      "Executive Training",
      "Industry Consultancy",
      "Student Internships & FYPs",
      "Commercialization & IP"
    ];

    // Estimated distribution percentages based on partner type
    let data = [30, 20, 20, 15, 15];
    const ind = (partner.basicInfo?.industry || "").toLowerCase();
    if (ind.includes("pharma")) {
      data = [35, 15, 15, 20, 15];
    } else if (ind.includes("tech")) {
      data = [25, 25, 15, 20, 15];
    } else if (ind.includes("health")) {
      data = [20, 20, 25, 25, 10];
    }

    this.instances[canvasId] = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            "#005A9C",
            "#059669",
            "#C59B27",
            "#7c3aed",
            "#e11d48"
          ],
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute("data-theme") === "dark" ? "#1e293b" : "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors.textColor,
              font: { size: 10, weight: "500" },
              padding: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw}%`
            }
          }
        }
      }
    });
  },

  /**
   * Render Financial Scenarios Comparison Chart
   */
  renderScenarioChart(canvasId, scenarios) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    const colors = this.getThemeColors();
    const labels = ["Conservative Scenario", "Expected Scenario", "High Opportunity Scenario"];
    const values = [
      scenarios.conservative?.annualRevenuePKR || 8000000,
      scenarios.expected?.annualRevenuePKR || 22000000,
      scenarios.highOpportunity?.annualRevenuePKR || 55000000
    ];

    this.instances[canvasId] = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Annual Potential Revenue (PKR)",
          data: values,
          backgroundColor: [
            "rgba(100, 116, 139, 0.85)",
            "rgba(2, 132, 199, 0.85)",
            "rgba(5, 150, 105, 0.85)"
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Potential Revenue: ${formatCurrency(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { weight: "600" } }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              callback: (v) => formatCurrency(v)
            }
          }
        }
      }
    });
  }
};
