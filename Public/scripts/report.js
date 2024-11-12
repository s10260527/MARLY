document.addEventListener("DOMContentLoaded", function () {
  // Emissions data by sector for the pie chart
  const sectorEmissionsData = {
    labels: ["Direct Emissions", "Product Manufacturing", "Product Transport", "Electricity", "Consumer Product Use", "End of Life Processing"],
    data: [1200, 900, 800, 600, 700, 500]
  };

  // Emissions data by year for each sector for the bar chart
  const yearlyEmissionsData = {
    "Direct Emissions": [1000, 1050, 1100, 1150],
    "Product Manufacturing": [900, 950, 1000, 1050],
    "Product Transport": [800, 820, 850, 870],
    "Electricity": [600, 620, 630, 640],
    "Consumer Product Use": [700, 710, 720, 730],
    "End of Life Processing": [500, 510, 520, 530]
  };
  const years = [2021, 2022, 2023, 2024];

  // Data for total energy consumption by sector
  const sectorEnergyData = {
    labels: ["Direct Emissions", "Product Manufacturing", "Product Transport", "Electricity", "Consumer Product Use", "End of Life Processing"],
    data: [300, 500, 400, 250, 450, 200] // Total energy consumption by sector
  };

  // Monthly energy consumption data for each sector (mock data)
  const monthlyEnergyConsumption = {
    "Direct Emissions": [20, 25, 22, 27, 23, 30, 35, 33, 31, 28, 27, 25],
    "Product Manufacturing": [40, 45, 50, 47, 42, 55, 60, 65, 62, 58, 54, 50],
    "Product Transport": [35, 32, 30, 40, 38, 45, 48, 46, 45, 42, 38, 36],
    "Electricity": [15, 18, 16, 20, 17, 22, 25, 24, 23, 19, 18, 17],
    "Consumer Product Use": [38, 40, 42, 45, 43, 50, 52, 54, 53, 48, 46, 44],
    "End of Life Processing": [10, 12, 14, 13, 11, 15, 18, 16, 14, 13, 12, 11]
  };
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Operational cost data by sector (mock data)
  const operationalCostData = {
    "Direct Emissions": [3000, 3100, 3050, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3750, 3850],
    "Product Manufacturing": [5000, 5100, 5200, 5300, 5250, 5400, 5500, 5600, 5700, 5800, 5900, 6000],
    "Product Transport": [2500, 2600, 2550, 2650, 2700, 2750, 2800, 2900, 2950, 3000, 3050, 3100],
    "Electricity": [1500, 1600, 1550, 1650, 1700, 1800, 1900, 1850, 1950, 2000, 2100, 2150],
    "Consumer Product Use": [4000, 4100, 4200, 4300, 4250, 4350, 4400, 4500, 4600, 4700, 4800, 4900],
    "End of Life Processing": [2000, 2100, 2200, 2250, 2300, 2350, 2400, 2500, 2550, 2600, 2650, 2700]
  };

  // Calculate total operational cost per month
  const totalOperationalCostByMonth = Array.from({ length: 12 }, (_, monthIndex) =>
    Object.values(operationalCostData).reduce((total, sectorCosts) => total + sectorCosts[monthIndex], 0)
  );

  // Function to render the pie chart for overall emissions by sector
  function renderPieChart(data) {
    const pieChartOptions = {
      series: data.data,
      chart: {
        type: 'pie',
        height: 350
      },
      labels: data.labels,
      colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1', '#2ecc71'],
      legend: {
        position: 'bottom'
      }
    };

    if (window.pieChart) window.pieChart.destroy();
    window.pieChart = new ApexCharts(document.querySelector("#pie-chart"), pieChartOptions);
    window.pieChart.render();
  }

  // Function to render the area chart for Current and Goals Orders
  function renderAreaChart() {
    const areaChartOptions = {
      series: [
        { name: 'Current Orders', data: [31, 40, 28, 51, 42, 109, 100] },
        { name: 'Goal Orders', data: [20, 30, 35, 40, 50, 80, 90] }
      ],
      chart: { type: 'area', height: 350, toolbar: { show: false } },
      colors: ['#4f35a1', '#246dec'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      markers: { size: 0 },
      yaxis: { title: { text: 'Orders' } },
      tooltip: { shared: true, intersect: false },
      legend: { position: 'top', horizontalAlign: 'center' }
    };

    if (window.areaChart) window.areaChart.destroy();
    window.areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
    window.areaChart.render();
  }

  // Function to render the energy consumption bar chart by sector
  function renderEnergyBarChart(data) {
    // Reset the title back to the original when switching to sector view
    document.querySelector("#energy-bar-chart").previousElementSibling.textContent = "Energy Consumption by Sector";

    const energyBarChartOptions = {
      series: [{ name: "Energy Consumption", data: data.data || [] }],
      chart: { 
        type: 'bar', 
        height: 350,
        events: {
          dataPointSelection: function(event, chartContext, config) {
            const sectorIndex = config.dataPointIndex;
            if (sectorIndex !== undefined && sectorIndex >= 0) {
              const sectorName = data.labels[sectorIndex];
              const monthlyData = monthlyEnergyConsumption[sectorName];
              renderMonthlyEnergyBarChart(sectorName, monthlyData);
            }
          }
        }
      },
      colors: ['#f5b74f'],
      plotOptions: { bar: { distributed: true, borderRadius: 4, horizontal: false, columnWidth: '40%' } },
      xaxis: { categories: data.labels, title: { text: "Sector" } },
      yaxis: { title: { text: "Energy Consumption (MWh)" } }
    };
  
    if (window.energyBarChart) window.energyBarChart.destroy();
    window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), energyBarChartOptions);
    window.energyBarChart.render();
  }
  
  function renderMonthlyEnergyBarChart(sector, monthlyData) {
    // Update the title directly in the `energy-bar-chart` card
    document.querySelector("#energy-bar-chart").previousElementSibling.textContent = `${sector} Monthly Energy Consumption`;
  
    // Display the "Return to Sector View" button
    document.getElementById("return-button").style.display = "inline";
    
    const monthlyEnergyBarChartOptions = {
      series: [{ name: "Energy Consumption", data: monthlyData || [] }],
      chart: { type: 'bar', height: 350 },
      colors: ['#246dec'],
      plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '40%' } },
      xaxis: { categories: months, title: { text: "Month" } },
      yaxis: { title: { text: "Energy Consumption (MWh)" } }
    };
    
    // Replace the sector view chart with the monthly detailed view
    if (window.energyBarChart) window.energyBarChart.destroy();
    window.energyBarChart = new ApexCharts(document.querySelector("#energy-bar-chart"), monthlyEnergyBarChartOptions);
    window.energyBarChart.render();
  }   

  function renderOperationalCostLineChart(sector = "Total") {
    const data = sector === "Total" ? totalOperationalCostByMonth : operationalCostData[sector];
    const titleText = sector === "Total" ? "Total Monthly Operational Cost" : `${sector} Monthly Operational Cost`;
  
    const operationalCostLineChartOptions = {
      series: [{
        name: "Operational Cost",
        data: data || []
      }],
      chart: {
        type: 'line',
        height: 350
      },
      colors: ['#4f35a1'],
      xaxis: {
        categories: months,
        title: { text: "Month" }
      },
      yaxis: {
        title: { text: "Cost ($)" }
      },
      stroke: {
        curve: 'smooth'
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 4
      },
      title: {
        text: titleText,
        align: 'center'
      }
    };
  
    if (window.operationalCostLineChart) window.operationalCostLineChart.destroy();
    window.operationalCostLineChart = new ApexCharts(document.querySelector("#operational-cost-line-chart"), operationalCostLineChartOptions);
    window.operationalCostLineChart.render();
  }  
    
  function renderYearlyEmissionsBarChart(sector, yearlyData) {
      // Update the title with the selected sector for yearly emissions
      document.querySelector("#bar-chart-title").textContent = `${sector} Emissions by Year`;
    
      const yearlyEmissionsBarChartOptions = {
        series: [{ name: "Emissions", data: yearlyData || [] }],
        chart: { type: 'bar', height: 350 },
        colors: ['#cc3c43'],
        plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '40%' } },
        xaxis: { categories: years, title: { text: "Year" } },
        yaxis: { title: { text: "Emissions (tonnes)" } }
      };
    
      // Destroy any existing bar chart and render the new yearly emissions chart
      if (window.yearlyEmissionsBarChart) window.yearlyEmissionsBarChart.destroy();
      window.yearlyEmissionsBarChart = new ApexCharts(document.querySelector("#bar-chart"), yearlyEmissionsBarChartOptions);
      window.yearlyEmissionsBarChart.render();
    }

  // Display the pie chart and area chart for overall sector emissions on page load
  renderPieChart(sectorEmissionsData);
  renderAreaChart();
  
  // Render the initial energy consumption bar chart by sector
  renderEnergyBarChart(sectorEnergyData);

  // Initial rendering of total operational cost
  renderOperationalCostLineChart();
  
  // Adding event listeners for sector buttons to render operational cost by month for each sector
  document.querySelectorAll(".btn-info").forEach((button) => {
    button.addEventListener("click", function () {
      const sectorName = button.textContent;
      renderOperationalCostLineChart(sectorName);
    });
  });
  
  // Adding event listeners for sector buttons to render emissions by year for each sector
  document.querySelectorAll(".btn-info").forEach((button) => {
    button.addEventListener("click", function () {
      const sectorName = button.textContent;
      const yearlyData = yearlyEmissionsData[sectorName];
      if (yearlyData) {
        renderYearlyEmissionsBarChart(sectorName, yearlyData);
      }
    });
  });

  // Add a centered wrapper for the return button
  const returnButtonWrapper = document.createElement("div");
  returnButtonWrapper.style.display = "flex";
  returnButtonWrapper.style.justifyContent = "center";
  returnButtonWrapper.style.marginTop = "15px"; // Adjust margin as needed

  // Return to sector chart button functionality
  const returnButton = document.createElement("button");
  returnButton.id = "return-button";
  returnButton.textContent = "Return to Sector View";
  returnButton.className = "btn btn-primary";
  returnButton.style.display = "none"; // Hidden initially
  returnButtonWrapper.appendChild(returnButton); // Append button to wrapper

  // Append the wrapper with the centered button after the energy bar chart
  document.querySelector("#energy-bar-chart").after(returnButtonWrapper);

  returnButton.addEventListener("click", function () {
    renderEnergyBarChart(sectorEnergyData);
    returnButton.style.display = "none";
  });
});
