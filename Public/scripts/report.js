// document.addEventListener("DOMContentLoaded", async function () {
//   // Fetch data for emissions by sector
//   async function fetchEmissionsBySector() {
//     try {
//       const response = await fetch("/api/report/emissions-by-sector");
//       if (!response.ok) throw new Error("Failed to fetch emissions data");
//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching emissions data:", error);
//       return [];
//     }
//   }

//   async function fetchEnergyConsumptionBySector() {
//     try {
//         const response = await fetch("http://localhost:3000/api/report/energy-consumption-by-sector");
//         if (!response.ok) throw new Error("Failed to fetch energy consumption data");
        
//         const data = await response.json();
//         console.log("Energy Consumption Data from API:", data); // Debugging

//         return data;
//     } catch (error) {
//         console.error("Error fetching energy consumption data:", error);
//         return [];
//     }
//   }

//   async function fetchEnergyConsumptionBySector() {
//     try {
//         const response = await fetch("http://localhost:3000/api/report/energy-consumption-by-sector");
//         if (!response.ok) throw new Error("Failed to fetch energy consumption data");
        
//         const data = await response.json();
//         console.log("Energy Consumption Data from API:", data); // Debugging

//         // Ensure monthly data is populated
//         data.forEach(sector => {
//             if (!sector.monthlyData) {
//                 sector.monthlyData = new Array(12).fill(0); // Placeholder
//             }
//         });

//         return data;
//     } catch (error) {
//         console.error("Error fetching energy consumption data:", error);
//         return [];
//     }
//   }

//   // Fetch data for operational costs by month
//   async function fetchOperationalCostByMonth() {
//     try {
//         const response = await fetch("/api/report/operational-cost-by-month");
//         if (!response.ok) throw new Error("Failed to fetch operational costs data");
//         const data = await response.json();

//         // Transform the data into a structure that's easier for the chart
//         const transformedData = data.reduce((acc, item) => {
//             const { sector_name, month, operational_cost } = item;
//             if (!acc[sector_name]) acc[sector_name] = new Array(12).fill(0); // Initialize with 12 months
//             acc[sector_name][month - 1] = operational_cost; // Fill month index with the operational cost
//             return acc;
//         }, {});

//         // Add total costs for each month
//         transformedData.total = Array.from({ length: 12 }, (_, i) =>
//             Object.values(transformedData).reduce((sum, sectorCosts) => sum + sectorCosts[i], 0)
//         );

//         return transformedData;
//     } catch (error) {
//         console.error("Error fetching operational costs data:", error);
//         return { total: new Array(12).fill(0) }; // Return empty data if there’s an error
//     }
//   }


//   // Fetch data for yearly emissions by sector
//   async function fetchYearlyEmissionsBySector() {
//     try {
//       const response = await fetch("/api/report/yearly-emissions-by-sector");
//       if (!response.ok) throw new Error("Failed to fetch yearly emissions data");
//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching yearly emissions data:", error);
//       return [];
//     }
//   }

//   // Data objects for charts
//   const sectorEmissionsData = await fetchEmissionsBySector();
//   const sectorEnergyData = await fetchEnergyConsumptionBySector();
//   // Initial data fetch and chart rendering
//   const monthlyOperationalCostData = await fetchOperationalCostByMonth();
//   const yearlyEmissionsData = await fetchYearlyEmissionsBySector();

//   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//   const years = yearlyEmissionsData.length ? Object.keys(yearlyEmissionsData[0]) : [];

//   const mockMonthlyData = {
//     Electricity: [400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510],
//     Manufacturing: [300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410],
//     Transportation: [250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360],
//     WasteManagement: [150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205],
//     WaterSupply: [200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255]
//   };

//   console.log("Emissions Data:", sectorEmissionsData);
//   console.log("Energy Consumption Data:", sectorEnergyData);

//   // Render Pie Chart for Emissions by Sector
//   function renderPieChart(data = []) {
//     if (data.length === 0) {
//       console.warn("No data available for pie chart");
//       return;
//     }

//     const pieChartOptions = {
//       series: data.map(d => d.total_emissions || 0), // Adjust to match data key
//       chart: { type: 'pie', height: 350 },
//       labels: data.map(d => d.sector_name || "Unknown"), // Adjust to match data key
//       colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1', '#2ecc71'],
//       legend: { position: 'bottom' }
//     };

//     if (window.pieChart) window.pieChart.destroy();
//     window.pieChart = new ApexCharts(document.querySelector("#pie-chart"), pieChartOptions);
//     window.pieChart.render();
//   }


//   // Render Bar Chart for Energy Consumption by Sector
//   function renderEnergyBarChart(data = []) {
//     if (data.length === 0) {
//         console.warn("No data available for energy bar chart");
//         return;
//     }

//     // Back button logic
//     const backButton = document.getElementById("back-to-sector-chart");
//     backButton.style.display = "none"; // Hide initially
//     backButton.addEventListener("click", () => {
//         renderEnergyBarChart(data); // Re-render the sector chart
//     });

//     const energyBarChartOptions = {
//         series: [{ name: "Energy Consumption", data: data.map(d => d.total_energy || 0) }],
//         chart: {
//             type: 'bar',
//             height: 350,
//             events: {
//                 dataPointSelection: (event, chartContext, { dataPointIndex }) => {
//                     const selectedSector = data[dataPointIndex].sector_name;
//                     const monthlyData = data[dataPointIndex].monthlyData || [];
//                     renderMonthlyEnergyBarChart(selectedSector, monthlyData, data); // Pass data for back navigation
//                 }
//             }
//         },
//         xaxis: {
//             categories: data.map(d => d.sector_name || "Unknown"),
//             title: { text: "Sector" }
//         },
//         yaxis: { title: { text: "Energy Consumption (MWh)" } },
//         colors: ['#f5b74f']
//     };

//     if (window.energyBarChart) window.energyBarChart.destroy();
//     window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), energyBarChartOptions);
//     window.energyBarChart.render();
//   }

//   // Render Monthly Energy Bar Chart for a specific sector
//   // function renderMonthlyEnergyBarChart(sector, monthlyData = [], sectorData = []) {
//   //   if (monthlyData.length === 0) {
//   //       console.warn(`No monthly data available for ${sector}`);
//   //       return;
//   //   }

//   //   // Back button logic
//   //   const backButton = document.getElementById("back-to-sector-chart");
//   //   backButton.style.display = "inline-block"; // Show the back button
//   //   backButton.onclick = () => {
//   //       renderEnergyBarChart(sectorData); // Go back to the sector chart
//   //   };

//   //   const monthlyEnergyBarChartOptions = {
//   //       series: [{ name: "Energy Consumption", data: monthlyData }],
//   //       chart: { type: 'bar', height: 350 },
//   //       xaxis: { categories: months, title: { text: "Month" } },
//   //       yaxis: { title: { text: "Energy Consumption (MWh)" } },
//   //       title: { text: `${sector} Monthly Energy Consumption`, align: 'center' },
//   //       colors: ['#246dec']
//   //   };

//   //   if (window.energyBarChart) window.energyBarChart.destroy();
//   //   window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), monthlyEnergyBarChartOptions);
//   //   window.energyBarChart.render();
//   // }

//   // Example usage in renderMonthlyEnergyBarChart
//   function renderMonthlyEnergyBarChart(sector) {
//     const monthlyData = mockMonthlyData[sector] || new Array(12).fill(0);

//     // Back button logic
//     const backButton = document.getElementById("back-to-sector-chart");
//     backButton.style.display = "inline-block"; // Show the back button
//     backButton.onclick = () => {
//         renderEnergyBarChart(sectorData); // Go back to the sector chart
//     };

//     const monthlyEnergyBarChartOptions = {
//         series: [{ name: "Energy Consumption", data: monthlyData }],
//         chart: { type: 'bar', height: 350 },
//         xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], title: { text: "Month" } },
//         yaxis: { title: { text: "Energy Consumption (MWh)" } },
//         title: { text: `${sector} Monthly Energy Consumption`, align: 'center' },
//         colors: ['#246dec']
//     };

//     if (window.energyBarChart) window.energyBarChart.destroy();
//     window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), monthlyEnergyBarChartOptions);
//     window.energyBarChart.render();
//   }

//   // Render Line Chart for Operational Cost by Month
//   function renderOperationalCostLineChart(sector = "Total", data = monthlyOperationalCostData) {
//     const lineChartData = sector === "Total" && data.total ? data.total : (data[sector] || []);

//     if (lineChartData.length === 0) {
//         console.warn(`No operational cost data available for ${sector}`);
//         return; // Exit the function if no data is available
//     }

//     const operationalCostLineChartOptions = {
//         series: [{ name: "Operational Cost", data: lineChartData }],
//         chart: { type: 'line', height: 350 },
//         xaxis: { categories: months, title: { text: "Month" } },
//         yaxis: { title: { text: "Cost ($)" } },
//         title: { text: `${sector} Monthly Operational Cost`, align: 'center' },
//         colors: ['#4f35a1'],
//         dataLabels: { enabled: false },
//         stroke: { curve: 'smooth' }
//     };

//     if (window.operationalCostLineChart) window.operationalCostLineChart.destroy();
//     window.operationalCostLineChart = new ApexCharts(document.querySelector("#operational-cost-line-chart"), operationalCostLineChartOptions);
//     window.operationalCostLineChart.render();
//   }


//   // Render Bar Chart for Yearly Emissions by Sector
//   function renderMonthlyEmissionsBarChart(sector) {
//     // Ensure the chart container exists
//     const chartContainer = document.querySelector("#bar-chart");
//     if (!chartContainer) {
//         console.error("Error: #bar-chart container not found in DOM.");
//         return;
//     }

//     const monthlyData = mockMonthlyData[sector] || new Array(12).fill(0);

//     if (monthlyData.length === 0) {
//         console.warn(`No monthly emissions data available for ${sector}`);
//         return;
//     }

//     const options = {
//         series: [{ name: "Emissions", data: monthlyData }],
//         chart: { type: 'bar', height: 350 },
//         xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], title: { text: "Month" } },
//         yaxis: { title: { text: "Emissions (tonnes)" } },
//         title: { text: `${sector} Monthly Emissions`, align: 'center' },
//         colors: ['#cc3c43']
//     };

//     // Destroy previous chart if it exists
//     if (window.emissionsBarChart) window.emissionsBarChart.destroy();
    
//     // Initialize and render the new chart
//     window.emissionsBarChart = new ApexCharts(chartContainer, options);
//     window.emissionsBarChart.render();
//   }



//   // Display modals for table data
//   function showTableModal(title, tableHtml) {
//     let modal = document.getElementById('tableModal');
//     if (!modal) {
//       modal = document.createElement('div');
//       modal.id = 'tableModal';
//       modal.className = 'modal fade';
//       modal.innerHTML = `
//         <div class="modal-dialog">
//           <div class="modal-content">
//             <div class="modal-header">
//               <h5 class="modal-title"></h5>
//               <button type="button" class="close" data-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">&times;</span>
//               </button>
//             </div>
//             <div class="modal-body"></div>
//           </div>
//         </div>
//       `;
//       document.body.appendChild(modal);
//     }
//     modal.querySelector('.modal-title').textContent = title;
//     modal.querySelector('.modal-body').innerHTML = tableHtml;
//     $(modal).modal('show');
//   }

//   function generateEmissionsTable() {
//     let html = `<table class="table"><thead><tr><th>Sector</th><th>Emissions (tonnes)</th></tr></thead><tbody>`;
//     sectorEmissionsData.forEach((entry) => {
//       html += `<tr><td>${entry.label}</td><td>${entry.value}</td></tr>`;
//     });
//     html += `</tbody></table>`;
//     showTableModal('Emissions by Sector', html);
//   }

//   function generateEnergyConsumptionTable() {
//     let html = `<table class="table"><thead><tr><th>Sector</th><th>Energy Consumption (MWh)</th></tr></thead><tbody>`;
//     sectorEnergyData.forEach((entry) => {
//       html += `<tr><td>${entry.label}</td><td>${entry.value}</td></tr>`;
//     });
//     html += `</tbody></table>`;
//     showTableModal('Energy Consumption by Sector', html);
//   }

//   function generateOperationalCostTable() {
//     let html = `<table class="table"><thead><tr><th>Month</th><th>Cost ($)</th></tr></thead><tbody>`;
//     months.forEach((month, i) => {
//       html += `<tr><td>${month}</td><td>${monthlyOperationalCostData.total[i]}</td></tr>`;
//     });
//     html += `</tbody></table>`;
//     showTableModal('Total Operational Cost by Month', html);
//   }

//   // Attach event listeners for table icons
//   document.querySelectorAll('.table-icon').forEach((icon, index) => {
//     icon.addEventListener('click', () => {
//       if (index === 0) generateEmissionsTable();
//       else if (index === 1) generateEnergyConsumptionTable();
//       else if (index === 2) generateOperationalCostTable();
//     });
//   });

//   // Handle sector button clicks to display sector data
//   document.querySelectorAll(".btn-info").forEach((button) => {
//     button.addEventListener("click", function () {
//       const sector = button.textContent.trim();
//       renderSectorDetails(sector);
//     });
//   });

//   function renderSectorDetails(sector) {
//     const sectorDetailsContainer = document.getElementById("sector-details");
//     sectorDetailsContainer.innerHTML = ''; // Clear existing content

//     // Emissions Chart with Description
//     let emissionsHtml = `
//       <div class="chart-description-container">
//         <div class="chart" id="bar-chart" style="height: 350px;"></div> <!-- Ensure #bar-chart is included here -->
//         <div class="description">
//           <h5>${sector} Monthly Emissions</h5>
//           <p>This chart shows the trend of emissions for ${sector} on a monthly basis, contributing to sustainability goals.</p>
//         </div>
//       </div>`;
//     sectorDetailsContainer.insertAdjacentHTML('beforeend', emissionsHtml);

//     // Energy Consumption Chart with Description
//     let energyHtml = `
//       <div class="chart-description-container">
//         <div class="chart" id="sector-energy-chart"></div>
//         <div class="description">
//           <h5>${sector} Monthly Energy Consumption</h5>
//           <p>This chart reflects the energy consumption of ${sector} on a monthly basis.</p>
//         </div>
//       </div>`;
//     sectorDetailsContainer.insertAdjacentHTML('beforeend', energyHtml);

//     // Operational Cost Chart with Description
//     let costHtml = `
//       <div class="chart-description-container">
//         <div class="chart" id="sector-cost-chart"></div>
//         <div class="description">
//           <h5>${sector} Monthly Operational Costs</h5>
//           <p>Displays the operational costs incurred by ${sector} each month, reflecting financial efficiency.</p>
//         </div>
//       </div>`;
//     sectorDetailsContainer.insertAdjacentHTML('beforeend', costHtml);

//     // Render charts
//     renderMonthlyEmissionsBarChart(sector); // This will now find #bar-chart
//     const energyDataForSector = sectorEnergyData.find(s => s.sector_name === sector);
//     const monthlyData = energyDataForSector ? energyDataForSector.monthlyData : new Array(12).fill(0); // Use placeholder if no data
//     renderMonthlyEnergyBarChart(sector, monthlyData);
//     renderOperationalCostLineChart(sector);
//   }

//   // Initial chart renders
//   renderPieChart(sectorEmissionsData);
//   renderEnergyBarChart(sectorEnergyData);
//   renderOperationalCostLineChart("Total", monthlyOperationalCostData); // Default view

// });

document.addEventListener("DOMContentLoaded", function () {
  // Mock data for emissions by sector
  const mockEmissionsData = [
    { sector_name: "Electricity", total_emissions: 1200 },
    { sector_name: "Transportation", total_emissions: 1500 },
    { sector_name: "Manufacturing", total_emissions: 800 },
    { sector_name: "Waste Management", total_emissions: 500 },
    { sector_name: "Water Supply", total_emissions: 300 },
  ];

  // Mock data for energy consumption by sector
  const mockEnergyConsumptionData = [
    { sector_name: "Electricity", total_energy: 5000, monthlyData: [400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510] },
    { sector_name: "Transportation", total_energy: 4000, monthlyData: [250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360] },
    { sector_name: "Manufacturing", total_energy: 3000, monthlyData: [300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410] },
    { sector_name: "Waste Management", total_energy: 1500, monthlyData: [150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205] },
    { sector_name: "Water Supply", total_energy: 1200, monthlyData: [200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255] },
  ];

  // Mock data for operational costs
  const mockOperationalCosts = {
    total: [1000, 1100, 1050, 1200, 1250, 1300, 1400, 1350, 1500, 1450, 1600, 1550],
    Electricity: [400, 420, 410, 450, 460, 470, 490, 480, 500, 510, 520, 530],
    Transportation: [300, 310, 305, 320, 330, 340, 350, 340, 360, 370, 380, 390],
    Manufacturing: [200, 210, 205, 220, 230, 240, 250, 240, 260, 270, 280, 290],
  };

  // Mock data for current and goal emissions
  const mockEmissionGoalsData = {
    current: [400, 420, 430, 450, 470, 490, 500, 510, 520, 530, 540, 550],
    goal: [300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520],
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Render Pie Chart for Emissions by Sector
  function renderPieChart(data = []) {
    const pieChartOptions = {
      series: data.map((d) => d.total_emissions),
      chart: { type: "pie", height: 350 },
      labels: data.map((d) => d.sector_name),
      colors: ["#246dec", "#cc3c43", "#367952", "#f5b74f", "#4f35a1", "#2ecc71"],
      legend: { position: "bottom" },
    };

    if (window.pieChart) window.pieChart.destroy();
    window.pieChart = new ApexCharts(document.querySelector("#pie-chart"), pieChartOptions);
    window.pieChart.render();
  }

  // Render Bar Chart for Energy Consumption by Sector
  function renderEnergyBarChart(data = []) {
    const energyBarChartOptions = {
      series: [{ name: "Energy Consumption", data: data.map((d) => d.total_energy) }],
      chart: {
        type: "bar",
        height: 350,
        events: {
          dataPointSelection: (event, chartContext, { dataPointIndex }) => {
            const selectedSector = data[dataPointIndex].sector_name;
            const monthlyData = data[dataPointIndex].monthlyData || [];
            toggleToMonthlyEnergyChart(selectedSector, monthlyData);
          },
        },
      },
      xaxis: { categories: data.map((d) => d.sector_name), title: { text: "Sector" } },
      yaxis: { title: { text: "Energy Consumption (MWh)" } },
      colors: ["#f5b74f"],
    };

    if (window.energyBarChart) window.energyBarChart.destroy();
    window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), energyBarChartOptions);
    window.energyBarChart.render();
  }

  // Render Monthly Energy Bar Chart
  function renderMonthlyEnergyBarChart(sector, monthlyData = []) {
    const monthlyEnergyBarChartOptions = {
      series: [{ name: "Energy Consumption", data: monthlyData }],
      chart: { type: "bar", height: 350 },
      xaxis: { categories: months, title: { text: "Month" } },
      yaxis: { title: { text: "Energy Consumption (MWh)" } },
      title: { text: `${sector} Monthly Energy Consumption`, align: "center" },
      colors: ["#246dec"],
    };

    if (window.energyBarChart) window.energyBarChart.destroy();
    window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), monthlyEnergyBarChartOptions);
    window.energyBarChart.render();
  }

  // Toggle to Monthly Energy Chart
  function toggleToMonthlyEnergyChart(sector, monthlyData) {
    // Show back button
    document.getElementById("back-to-sector-chart").style.display = "block";

    // Render monthly energy chart
    renderMonthlyEnergyBarChart(sector, monthlyData);
  }

  // Toggle back to Energy Consumption by Sector
  function toggleToSectorChart() {
    // Hide back button
    document.getElementById("back-to-sector-chart").style.display = "none";

    // Render main energy bar chart
    renderEnergyBarChart(mockEnergyConsumptionData);
  }

  // Attach click event for the back button
  document.getElementById("back-to-sector-chart").addEventListener("click", toggleToSectorChart);

  // Initial render
  renderEnergyBarChart(mockEnergyConsumptionData);

  // Render Current and Goal Emission Chart
  function renderEmissionGoalsChart(data) {
    const options = {
      series: [
        { name: "Current Emissions", data: data.current },
        { name: "Goal Emissions", data: data.goal },
      ],
      chart: { type: "area", height: 350 },
      xaxis: { categories: months, title: { text: "Month" } },
      yaxis: { title: { text: "Emissions (tonnes)" } },
      colors: ["#246dec", "#f5b74f"],
      stroke: { curve: "smooth" },
      title: { text: "Current and Goals Emissions", align: "center" },
    };

    if (window.emissionGoalsChart) window.emissionGoalsChart.destroy();
    window.emissionGoalsChart = new ApexCharts(document.querySelector("#area-chart"), options);
    window.emissionGoalsChart.render();
  }

  function renderMonthlyEmissionsBarChart(sector, monthlyData = []) {
    const options = {
      series: [{ name: "Emissions", data: monthlyData }],
      chart: { type: "bar", height: 350 },
      xaxis: { categories: months, title: { text: "Month" } },
      yaxis: { title: { text: "Emissions (tonnes)" } },
      title: { text: `${sector} Monthly Emissions`, align: "center" },
      colors: ["#cc3c43"],
    };

    if (window.monthlyEmissionsChart) {
      window.monthlyEmissionsChart.destroy(); // Destroy existing chart
    }

    window.monthlyEmissionsChart = new ApexCharts(
      document.querySelector("#sector-emissions-chart"),
      options
    );
    window.monthlyEmissionsChart.render();
  }

  
  // Render Line Chart for Operational Cost by Month
  function renderOperationalCostLineChart(sector = "Total", data = mockOperationalCosts) {
    const lineChartData = sector === "Total" ? data.total : data[sector] || [];
    const options = {
      series: [{ name: "Operational Cost", data: lineChartData }],
      chart: { type: "line", height: 350 },
      xaxis: { categories: months, title: { text: "Month" } },
      yaxis: { title: { text: "Cost ($)" } },
      title: { text: `${sector} Monthly Operational Cost`, align: "center" },
      colors: ["#4f35a1"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
    };

    if (window.operationalCostLineChart) window.operationalCostLineChart.destroy();
    window.operationalCostLineChart = new ApexCharts(document.querySelector("#operational-cost-line-chart"), options);
    window.operationalCostLineChart.render();
  }

  // Add functionality to sector buttons
  document.querySelectorAll(".btn-info").forEach((button) => {
    button.addEventListener("click", function () {
      const sector = button.textContent.trim();
      renderSectorDetails(sector);
    });
  });

  function renderSectorDetails(sector) {
    const sectorDetailsContainer = document.getElementById("sector-details");
    sectorDetailsContainer.innerHTML = ''; // Clear existing content
  
    // Insert HTML for charts
    const html = `
      <div class="chart-description-container">
        <div class="chart" id="sector-emissions-chart" style="height: 350px;"></div>
        <div class="description">
          <h5>${sector} Monthly Emissions</h5>
          <p>This chart shows the monthly emissions for ${sector}.</p>
        </div>
      </div>
      <div class="chart-description-container">
        <div class="chart" id="sector-energy-chart" style="height: 350px;"></div>
        <div class="description">
          <h5>${sector} Monthly Energy Consumption</h5>
          <p>This chart reflects the energy consumption of ${sector} on a monthly basis.</p>
        </div>
      </div>`;
    sectorDetailsContainer.insertAdjacentHTML("beforeend", html);
  
    // Mock data for monthly emissions by sector
    const mockMonthlyEmissionsData = {
      Electricity: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210],
      Transportation: [90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
      Manufacturing: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105],
      WasteManagement: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
      WaterSupply: [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42],
    };
  
    // Render Emissions Chart
    renderMonthlyEmissionsBarChart(sector, mockMonthlyEmissionsData[sector] || []);
  
    // Render Energy Chart
    const sectorData = mockEnergyConsumptionData.find((s) => s.sector_name === sector);
    const monthlyData = sectorData ? sectorData.monthlyData : new Array(12).fill(0);
    renderMonthlyEnergyBarChart(sector, monthlyData);
  }  
  
  // Initial chart renders
  renderPieChart(mockEmissionsData);
  renderEnergyBarChart(mockEnergyConsumptionData);

  // Display modals for table data
  function showTableModal(title, tableHtml) {
    const modal = document.createElement("div");
    modal.id = "tableModal";
    modal.className = "modal fade show";
    modal.style.display = "block"; // Ensure it's visible
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" onclick="document.body.removeChild(this.parentElement.parentElement.parentElement)"></button>
          </div>
          <div class="modal-body">${tableHtml}</div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  // Generate Emissions Table
  function generateEmissionsTable() {
    let html = "<table class='table'><thead><tr><th>Sector</th><th>Total Emissions (tonnes)</th></tr></thead><tbody>";
    mockEmissionsData.forEach((entry) => {
      html += `<tr><td>${entry.sector_name}</td><td>${entry.total_emissions}</td></tr>`;
    });
    html += "</tbody></table>";
    showTableModal("Emissions by Sector", html);
  }

  // Attach event listeners to table icons
  document.querySelectorAll(".table-icon").forEach((icon, index) => {
    icon.addEventListener("click", () => {
      if (index === 0) generateEmissionsTable();
    });
  });


  // Initial chart renders
  renderPieChart(mockEmissionsData);
  renderEnergyBarChart(mockEnergyConsumptionData);
  renderOperationalCostLineChart("Total", mockOperationalCosts); // Ensure this is included
  renderEmissionGoalsChart(mockEmissionGoalsData);
});


