// scripts/report.js

async function fetchData(endpoint) {
  try {
    const response = await fetch(`/report/${endpoint}`);
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint} data`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    return [];
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // Fetch only the routes you actually have on the backend
  const emissionsData         = await fetchData("emissions-by-sector");
  const energyConsumptionData = await fetchData("energy-consumption-by-sector");
  const sustainabilityGoalsData = await fetchData("sustainability-goals");
  const operationalCostData   = await fetchData("operational-cost-by-month");
  const yearlyEmissionsData   = await fetchData("yearly-emissions-by-sector");
  const scopeEmissionsData = await fetchData("scope-emissions"); // <-- if you have a route

  console.log("Emissions Data:", emissionsData);
  console.log("Energy Consumption Data:", energyConsumptionData);
  console.log("Sustainability Goals Data:", sustainabilityGoalsData);
  console.log("Operational Cost Data:", operationalCostData);
  console.log("Yearly Emissions Data:", yearlyEmissionsData);
  console.log("Scope Emissions Data:", scopeEmissionsData);

  // Store each array in an object, keyed by a name that matches data-table attributes
  const dataMap = {
    emissionsData,
    energyConsumptionData,
    sustainabilityGoalsData,
    operationalCostData,
    yearlyEmissionsData,
    scopeEmissionsData
  };

  // -----------------------------------------
  // CHART RENDERING FUNCTIONS
  // -----------------------------------------

  // 1) Pie Chart (e.g. for Emissions by Sector)
  function renderPieChart(data, elementId, title) {
    const options = {
      series: data.map(d => d.total_emissions),
      chart: { type: "pie", height: 350 },
      labels: data.map(d => d.sector_name), // Must match your backend's field
      title: { text: title, align: "center" },
      colors: ["#246dec", "#cc3c43", "#367952", "#f5b74f", "#4f35a1", "#2ecc71"],
    };
    const chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
    chart.render();
  }

  // 2) Bar Chart (Generic version: pass data, elementId, title)
  function renderBarChart(data, elementId, title) {
    // Adjust "xaxis.categories" and "series.data" if your object fields differ
    const options = {
      series: [{
        name: "Value", 
        data: data.map(d => d.total_emissions || d.total_energy) 
      }],
      chart: { type: "bar", height: 350 },
      xaxis: { 
        categories: data.map(d => d.sector_name), 
        title: { text: "Sector" } 
      },
      title: { text: title, align: "center" },
      colors: ["#246dec", "#cc3c43", "#367952", "#f5b74f", "#4f35a1", "#2ecc71"],
    };
    const chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
    chart.render();
  }

  // 3) Line Chart (e.g. for Yearly Emissions Over Time)
  function renderLineChart(data, elementId, title) {
    // Filter out any row missing 'year'/'month' or 'yearly_emissions'/'total_emissions'
    const validData = data.filter(
      (d) =>
        (typeof d.year === 'number' || typeof d.month === 'number') &&
        (typeof d.yearly_emissions === 'number' || typeof d.total_emissions === 'number')
    );
  
    const options = {
      series: [
        {
          name: "Emissions",
          data: validData.map((d) => d.yearly_emissions ?? d.total_emissions)
        }
      ],
      chart: { type: "line", height: 350 },
      xaxis: {
        categories: validData.map((d) => d.year ?? d.month),
        title: { text: "Year or Month" }
      },
      yaxis: { title: { text: "Emissions" } },
      title: { text: title, align: "center" },
      stroke: { curve: "smooth" }
    };
  
    const chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
    chart.render();
  }
  

  // 4) Radial Bar Chart (Generic version)
  function renderRadialBarChart(data, elementId, title) {
    // E.g. for sustainability goals
    const options = {
      series: data.map(d => d.current_progress),
      chart: { type: "radialBar", height: 350 },
      labels: data.map(d => d.target_description),
      title: { text: title, align: "center" },
      colors: ["#246dec"]
    };
    const chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
    chart.render();
  }

  // -----------------------------------------
  // RENDER THE CHARTS IF DATA IS AVAILABLE
  // -----------------------------------------

  // Pie chart: Emissions by Sector
  if (emissionsData.length) {
    renderPieChart(emissionsData, "pie-chart-emissions", "Total Emissions by Sector");
  }

  // Example if you have scope data:
  // if (scopeEmissionsData.length) {
  //   renderBarChart(scopeEmissionsData, "bar-chart-scope", "Scope Emissions");
  // }

  // Bar chart: Energy consumption (using same "renderBarChart" but passing a different elementId/title)
  if (energyConsumptionData.length) {
    renderBarChart(energyConsumptionData, "stacked-bar-chart-energy", "Energy Consumption by Sector");
  }

  // Radial Bar: Sustainability Goals
  if (sustainabilityGoalsData.length) {
    renderRadialBarChart(sustainabilityGoalsData, "progress-chart-goals", "Sustainability Goals Progress");
  }

  // Line chart: Yearly Emissions
  if (yearlyEmissionsData.length) {
    renderLineChart(yearlyEmissionsData, "line-chart-emissions", "Yearly Emissions by Sector");
  }

  // -----------------------------------------------------
  //  TABLE ICON CLICK -> SHOW DATA IN A MODAL TABLE
  // -----------------------------------------------------
  const tableIcons = document.querySelectorAll(".table-icon");
  tableIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      // Which dataset to show?
      const datasetName = this.getAttribute("data-table");
      // If not found, just use empty array
      const currentData = dataMap[datasetName] || [];

      // Populate the table
      populateDataTable(currentData);

      // (Bootstrap automatically shows the modal because we used
      //  data-bs-toggle="modal" data-bs-target="#dataTableModal"
      //  If you wanted to manually show it, you'd do:)
      // const modalEl = document.getElementById("dataTableModal");
      // const modal = new bootstrap.Modal(modalEl);
      // modal.show();
    });
  });

  // A helper function to fill the <tbody> of #chartDataTable
  function populateDataTable(dataArray) {
    // Adjust columns based on what your data looks like
    const tableBody = document.querySelector("#chartDataTable tbody");
    tableBody.innerHTML = ""; // Clear old rows

    // Example: if each object has { sector_name, total_emissions }
    dataArray.forEach((row) => {
      const tr = document.createElement("tr");
      // Show "sector_name" in first column, "value" in second
      // e.g. "Value" might be row.total_emissions, or row.current_progress, etc.
      tr.innerHTML = `
        <td>${row.sector_name ?? "N/A"}</td>
        <td>${row.total_emissions ?? row.total_energy ?? row.current_progress ?? "N/A"}</td>
      `;
      tableBody.appendChild(tr);
    });
  }
});
