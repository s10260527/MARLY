document.addEventListener("DOMContentLoaded", async function () {
  // Fetch data for emissions by sector
  async function fetchEmissionsBySector() {
    try {
      const response = await fetch("/api/report/emissions-by-sector");
      if (!response.ok) throw new Error("Failed to fetch emissions data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching emissions data:", error);
      return [];
    }
  }

  async function fetchEnergyConsumptionBySector() {
    try {
        const response = await fetch("http://localhost:3000/api/report/energy-consumption-by-sector");
        if (!response.ok) throw new Error("Failed to fetch energy consumption data");
        
        const data = await response.json();

        // Add empty monthly data if not present
        data.forEach(sector => {
            if (!sector.monthlyData) {
                sector.monthlyData = new Array(12).fill(0); // Placeholder for each month
            }
        });

        return data;
    } catch (error) {
        console.error("Error fetching energy consumption data:", error);
        return [];
    }
}


  // Fetch data for operational costs by month
  async function fetchOperationalCostByMonth() {
    try {
        const response = await fetch("/api/report/operational-cost-by-month");
        if (!response.ok) throw new Error("Failed to fetch operational costs data");
        const data = await response.json();

        // Transform the data into a structure that's easier for the chart
        const transformedData = data.reduce((acc, item) => {
            const { sector_name, month, operational_cost } = item;
            if (!acc[sector_name]) acc[sector_name] = new Array(12).fill(0); // Initialize with 12 months
            acc[sector_name][month - 1] = operational_cost; // Fill month index with the operational cost
            return acc;
        }, {});

        // Add total costs for each month
        transformedData.total = Array.from({ length: 12 }, (_, i) =>
            Object.values(transformedData).reduce((sum, sectorCosts) => sum + sectorCosts[i], 0)
        );

        return transformedData;
    } catch (error) {
        console.error("Error fetching operational costs data:", error);
        return { total: new Array(12).fill(0) }; // Return empty data if there’s an error
    }
  }


  // Fetch data for yearly emissions by sector
  async function fetchYearlyEmissionsBySector() {
    try {
      const response = await fetch("/api/report/yearly-emissions-by-sector");
      if (!response.ok) throw new Error("Failed to fetch yearly emissions data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching yearly emissions data:", error);
      return [];
    }
  }

  // Data objects for charts
  const sectorEmissionsData = await fetchEmissionsBySector();
  const sectorEnergyData = await fetchEnergyConsumptionBySector();
  // Initial data fetch and chart rendering
  const monthlyOperationalCostData = await fetchOperationalCostByMonth();
  const yearlyEmissionsData = await fetchYearlyEmissionsBySector();

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = yearlyEmissionsData.length ? Object.keys(yearlyEmissionsData[0]) : [];

  console.log("Emissions Data:", sectorEmissionsData);
  console.log("Energy Consumption Data:", sectorEnergyData);


  // Render Pie Chart for Emissions by Sector
  function renderPieChart(data = []) {
    if (data.length === 0) {
      console.warn("No data available for pie chart");
      return;
    }

    const pieChartOptions = {
      series: data.map(d => d.total_emissions || 0), // Adjust to match data key
      chart: { type: 'pie', height: 350 },
      labels: data.map(d => d.sector_name || "Unknown"), // Adjust to match data key
      colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1', '#2ecc71'],
      legend: { position: 'bottom' }
    };

    if (window.pieChart) window.pieChart.destroy();
    window.pieChart = new ApexCharts(document.querySelector("#pie-chart"), pieChartOptions);
    window.pieChart.render();
  }


  // Render Bar Chart for Energy Consumption by Sector
  function renderEnergyBarChart(data = []) {
    if (data.length === 0) {
        console.warn("No data available for energy bar chart");
        return;
    }

    const energyBarChartOptions = {
        series: [{ name: "Energy Consumption", data: data.map(d => d.total_energy || 0) }],
        chart: { 
            type: 'bar', 
            height: 350,
            events: {
                dataPointSelection: (event, chartContext, { dataPointIndex }) => {
                    const selectedSector = data[dataPointIndex].sector_name;
                    const monthlyData = data[dataPointIndex].monthlyData || []; // Add monthlyData to data
                    renderMonthlyEnergyBarChart(selectedSector, monthlyData);
                }
            }
        },
        xaxis: { 
            categories: data.map(d => d.sector_name || "Unknown"), 
            title: { text: "Sector" } 
        },
        yaxis: { title: { text: "Energy Consumption (MWh)" } },
        colors: ['#f5b74f']
    };

    if (window.energyBarChart) window.energyBarChart.destroy();
    window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), energyBarChartOptions);
    window.energyBarChart.render();
  }

  // Render Monthly Energy Bar Chart for a specific sector
  function renderMonthlyEnergyBarChart(sector, monthlyData = []) {
    if (monthlyData.length === 0) {
        console.warn(`No monthly data available for ${sector}`);
        return;
    }

    const monthlyEnergyBarChartOptions = {
        series: [{ name: "Energy Consumption", data: monthlyData }],
        chart: { type: 'bar', height: 350 },
        xaxis: { categories: months, title: { text: "Month" } },
        yaxis: { title: { text: "Energy Consumption (MWh)" } },
        title: { text: `${sector} Monthly Energy Consumption`, align: 'center' }
    };

    if (window.energyBarChart) window.energyBarChart.destroy();
    window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), monthlyEnergyBarChartOptions);
    window.energyBarChart.render();
  }


  // Render Line Chart for Operational Cost by Month
  function renderOperationalCostLineChart(sector = "Total", data = monthlyOperationalCostData) {
    const lineChartData = sector === "Total" && data.total ? data.total : (data[sector] || []);

    if (lineChartData.length === 0) {
        console.warn(`No operational cost data available for ${sector}`);
        return; // Exit the function if no data is available
    }

    const operationalCostLineChartOptions = {
        series: [{ name: "Operational Cost", data: lineChartData }],
        chart: { type: 'line', height: 350 },
        xaxis: { categories: months, title: { text: "Month" } },
        yaxis: { title: { text: "Cost ($)" } },
        title: { text: `${sector} Monthly Operational Cost`, align: 'center' },
        colors: ['#4f35a1'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' }
    };

    if (window.operationalCostLineChart) window.operationalCostLineChart.destroy();
    window.operationalCostLineChart = new ApexCharts(document.querySelector("#operational-cost-line-chart"), operationalCostLineChartOptions);
    window.operationalCostLineChart.render();
  }


  // Render Bar Chart for Yearly Emissions by Sector
  function renderYearlyEmissionsBarChart(sector) {
    const yearlyData = yearlyEmissionsData.find(s => s.label === sector) || {};

    if (!yearlyData.data) {
      console.warn(`No yearly emissions data available for ${sector}`);
      return;
    }

    const options = {
      series: [{ name: "Emissions", data: yearlyData.data }],
      chart: { type: 'bar', height: 350 },
      xaxis: { categories: years, title: { text: "Year" } },
      yaxis: { title: { text: "Emissions (tonnes)" } },
      title: { text: `${sector} Emissions Over Years`, align: 'center' },
      colors: ['#cc3c43']
    };

    if (window.yearlyEmissionsBarChart) window.yearlyEmissionsBarChart.destroy();
    window.yearlyEmissionsBarChart = new ApexCharts(document.querySelector("#bar-chart"), options);
    window.yearlyEmissionsBarChart.render();
  }

  // Display modals for table data
  function showTableModal(title, tableHtml) {
    let modal = document.getElementById('tableModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tableModal';
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"></h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = tableHtml;
    $(modal).modal('show');
  }

  function generateEmissionsTable() {
    let html = `<table class="table"><thead><tr><th>Sector</th><th>Emissions (tonnes)</th></tr></thead><tbody>`;
    sectorEmissionsData.forEach((entry) => {
      html += `<tr><td>${entry.label}</td><td>${entry.value}</td></tr>`;
    });
    html += `</tbody></table>`;
    showTableModal('Emissions by Sector', html);
  }

  function generateEnergyConsumptionTable() {
    let html = `<table class="table"><thead><tr><th>Sector</th><th>Energy Consumption (MWh)</th></tr></thead><tbody>`;
    sectorEnergyData.forEach((entry) => {
      html += `<tr><td>${entry.label}</td><td>${entry.value}</td></tr>`;
    });
    html += `</tbody></table>`;
    showTableModal('Energy Consumption by Sector', html);
  }

  function generateOperationalCostTable() {
    let html = `<table class="table"><thead><tr><th>Month</th><th>Cost ($)</th></tr></thead><tbody>`;
    months.forEach((month, i) => {
      html += `<tr><td>${month}</td><td>${monthlyOperationalCostData.total[i]}</td></tr>`;
    });
    html += `</tbody></table>`;
    showTableModal('Total Operational Cost by Month', html);
  }

  // Attach event listeners for table icons
  document.querySelectorAll('.table-icon').forEach((icon, index) => {
    icon.addEventListener('click', () => {
      if (index === 0) generateEmissionsTable();
      else if (index === 1) generateEnergyConsumptionTable();
      else if (index === 2) generateOperationalCostTable();
    });
  });

  // Handle sector button clicks to display sector data
  document.querySelectorAll(".btn-info").forEach((button) => {
    button.addEventListener("click", function () {
      const sector = button.textContent.trim();
      renderSectorDetails(sector);
    });
  });

  // Function to render sector details with description and charts
  function renderSectorDetails(sector) {
    const sectorDetailsContainer = document.getElementById("sector-details");
    sectorDetailsContainer.innerHTML = '';

    // Emissions Chart with Description
    let emissionsHtml = `
      <div class="chart-description-container">
        <div class="chart" id="sector-emissions-chart"></div>
        <div class="description">
          <h5>${sector} Emissions Over Years</h5>
          <p>This chart shows the trend of emissions for ${sector} over the years, contributing to the sustainability goals.</p>
        </div>
      </div>`;
    sectorDetailsContainer.insertAdjacentHTML('beforeend', emissionsHtml);

    // Energy Consumption Chart with Description
    let energyHtml = `
      <div class="chart-description-container">
        <div class="chart" id="sector-energy-chart"></div>
        <div class="description">
          <h5>${sector} Monthly Energy Consumption</h5>
          <p>This chart reflects the energy consumption of ${sector} on a monthly basis.</p>
        </div>
      </div>`;
    sectorDetailsContainer.insertAdjacentHTML('beforeend', energyHtml);

    // Operational Cost Chart with Description
    let costHtml = `
      <div class="chart-description-container">
        <div class="chart" id="sector-cost-chart"></div>
        <div class="description">
          <h5>${sector} Monthly Operational Costs</h5>
          <p>Displays the operational costs incurred by ${sector} each month, reflecting financial efficiency.</p>
        </div>
      </div>`;
    sectorDetailsContainer.insertAdjacentHTML('beforeend', costHtml);

    // Render charts
    renderYearlyEmissionsBarChart(sector);
    renderMonthlyEnergyBarChart(sector, sectorEnergyData.find(s => s.label === sector).monthlyData);
    renderOperationalCostLineChart(sector);
  }

  // Initial chart renders
  renderPieChart(sectorEmissionsData);
  renderEnergyBarChart(sectorEnergyData);
  renderOperationalCostLineChart("Total", monthlyOperationalCostData); // Default view

});
