document.addEventListener("DOMContentLoaded", async function () {
  // Fetch data for emissions by sector
  async function fetchEmissionsBySector() {
    const response = await fetch("/api/report/emissions-by-sector");
    return response.json();
  }

  // Fetch data for energy consumption by sector
  async function fetchEnergyConsumptionBySector() {
    const response = await fetch("/api/report/energy-consumption-by-sector");
    return response.json();
  }

  // Fetch data for operational costs by month
  async function fetchOperationalCostByMonth() {
    const response = await fetch("/api/report/operational-cost-by-month");
    return response.json();
  }

  // Fetch data for yearly emissions by sector
  async function fetchYearlyEmissionsBySector() {
    const response = await fetch("/api/report/yearly-emissions-by-sector");
    return response.json();
  }

  // Data objects for charts
  const sectorEmissionsData = await fetchEmissionsBySector();
  const sectorEnergyData = await fetchEnergyConsumptionBySector();
  const monthlyOperationalCostData = await fetchOperationalCostByMonth();
  const yearlyEmissionsData = await fetchYearlyEmissionsBySector();

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Object.keys(yearlyEmissionsData[Object.keys(yearlyEmissionsData)[0]]);

  // Render Pie Chart for Emissions by Sector
  function renderPieChart(data) {
    const pieChartOptions = {
      series: data.map(d => d.value),
      chart: {
        type: 'pie',
        height: 350
      },
      labels: data.map(d => d.label),
      colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1', '#2ecc71'],
      legend: {
        position: 'bottom'
      }
    };

    if (window.pieChart) window.pieChart.destroy();
    window.pieChart = new ApexCharts(document.querySelector("#pie-chart"), pieChartOptions);
    window.pieChart.render();
  }

  // Render Bar Chart for Energy Consumption by Sector
  function renderEnergyBarChart(data) {
    const energyBarChartOptions = {
      series: [{ name: "Energy Consumption", data: data.map(d => d.value) }],
      chart: {
        type: 'bar',
        height: 350,
        events: {
          dataPointSelection: function (event, chartContext, config) {
            const sectorName = data[config.dataPointIndex].label;
            const monthlyData = data[config.dataPointIndex].monthlyData;
            renderMonthlyEnergyBarChart(sectorName, monthlyData);
          }
        }
      },
      xaxis: {
        categories: data.map(d => d.label),
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
  function renderMonthlyEnergyBarChart(sector, monthlyData) {
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
    const lineChartData = sector === "Total" ? data.total : data[sector];

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
    const yearlyData = yearlyEmissionsData[sector];
    const options = {
      series: [{ name: "Emissions", data: Object.values(yearlyData) }],
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
  renderOperationalCostLineChart();
});
