let offset = 0; // Initialize offset for pagination
const limit = 10; // Rows per request
let isLoading = false; // Prevent duplicate requests
let hasMoreData = true; // Flag to stop fetching when all data is loaded

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("No token found. Please log in.");
    window.location.href = "login.html";
    return;
  }

  // Decode and debug token
  const decoded = parseJwt(token);
  console.log("Decoded JWT:", decoded);

  // Initial fetch
  fetchPaginatedData(token);

  // Infinite scroll
  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !isLoading &&
      hasMoreData
    ) {
      fetchPaginatedData(token);
    }
  });
});

function fetchPaginatedData(token) {
  isLoading = true;

  $.ajax({
    type: "GET",
    url: `/api/dashboard/data/paginated?limit=${limit}&offset=${offset}`,
    headers: { Authorization: `Bearer ${token}` },
    success: (response) => {
      console.log("Fetched paginated data:", response);

      const container = $("#dashboardContainer");
      response.data.forEach((row) => {
        const rowHtml = `
          <div class="dashboard-row">
            <p><strong>Date:</strong> ${new Date(row.emission_date).toLocaleDateString()}</p>
            <p><strong>Emissions:</strong> ${row.emissions.toFixed(2)}</p>
            <p><strong>Energy:</strong> ${row.energy.toFixed(2)}</p>
            <p><strong>Costs:</strong> $${row.costs.toFixed(2)}</p>
          </div>
        `;
        container.append(rowHtml);
      });

      offset += limit; // Increment offset for the next request
      if (response.data.length < limit) {
        hasMoreData = false; // Stop further requests if no more data
        console.log("All data loaded.");
      }
    },
    error: (xhr) => {
      console.error("Error fetching paginated data:", xhr);
      if (xhr.status === 401) {
        alert("Unauthorized! Redirecting to login page.");
        window.location.href = "login.html";
      } else {
        alert("An error occurred while fetching data. Please try again later.");
      }
    },
    complete: () => {
      isLoading = false;
    },
  });
}

function updateDataGlance() {
  // Get latest data from graph data
  const latestEmissionsData = emissionsData.monthlyData.overview.total.slice(-2);
  const latestEnergyData = energyData.monthlyData.overview.total.slice(-2);
  const latestCostsData = operationalCostsData.monthlyData.overview.total.slice(-2);

  // Calculate percentage changes
  const emissionsChange = ((latestEmissionsData[1].value - latestEmissionsData[0].value) / latestEmissionsData[0].value) * 100;
  const energyChange = ((latestEnergyData[1].value - latestEnergyData[0].value) / latestEnergyData[0].value) * 100;
  const costsChange = ((latestCostsData[1].value - latestCostsData[0].value) / latestCostsData[0].value) * 100;

  // Update emissions card
  updateCard(
      'carbon-emissions',
      Math.round(latestEmissionsData[1].value),
      emissionsChange
  );

  // Update energy card
  updateCard(
      'energy-consumption',
      Math.round(latestEnergyData[1].value),
      energyChange
  );

  // Update costs card
  updateCard(
      'operational-costs',
      latestCostsData[1].value,
      costsChange
  );

  // Update data insights
  updateDataInsights(latestEmissionsData[1].value, latestEnergyData[1].value);
}

function updateCard(type, value, changePercent) {
  let formattedValue, formattedPercent, unit;
  const isPositive = changePercent > 0;

  switch(type) {
      case 'carbon-emissions':
          formattedValue = `${Math.round(value)}`;
          break;
      case 'energy-consumption':
          formattedValue = `${Math.round(value).toLocaleString()}`;
          break;
      case 'operational-costs':
          if (value >= 1000000) {
              formattedValue = `${(value/1000000).toFixed(1)}`;
              unit = 'Mil';
          } else {
              formattedValue = `${(value/1000).toFixed(1)}`;
              unit = 'k';
          }
          break;
  }

  formattedPercent = `${isPositive ? '+' : ''}${Math.round(changePercent)}%`;

  // Get elements
  const elements = getCardElements(type);
  
  // Update value and unit
  elements.valueDiv.textContent = formattedValue;
  if (type === 'operational-costs' && elements.unitSpan) {
      elements.unitSpan.textContent = unit;
  }
  
  // Update percent change and arrow
  elements.percentSpan.textContent = formattedPercent;
  elements.percentSpan.className = `card-subtitle mb-2 text-body-secondary ${isPositive ? 'positive-percent' : 'negative-percent'}`;
  elements.arrowIcon.className = `bi bi-arrow-${isPositive ? 'up' : 'down'}-right`;
}

function updateDataInsights(emissionsValue, energyValue) {
  // Calculate equivalents
  const carTrips = Math.round(emissionsValue * 1000 / 12); // Convert tons to kg and divide by 12kg per 100km
  const hdbFlats = Math.round(energyValue / 4500);

  // Update DOM
  document.querySelector('#car-equivalent').textContent = `x${carTrips.toLocaleString()}`;
  document.querySelector('#hdb-equivalent').textContent = `x${hdbFlats.toLocaleString()}`;
}

function getCardElements(type) {
  const cardId = `${type}-card`;
  return {
      valueDiv: document.querySelector(`#${cardId} .card-title div`),
      unitSpan: document.querySelector(`#${cardId} .card-title span`),
      percentSpan: document.querySelector(`#${cardId} .card-subtitle`),
      arrowIcon: document.querySelector(`#${cardId} .card-subtitle i`)
  };
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateDataGlance();
  // Add event listener for graph data changes if needed
});
