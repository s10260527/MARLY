// public/scripts/dashboard.js

// Helper to decode JWT for debugging
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(window.atob(base64));
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    console.log("Local Storage Token:", token);

    if (!token) {
        alert("No token found, please log in.");
        window.location.href = "login.html";
        return;
    }

    // Debug decode
    const decoded = parseJwt(token);
    console.log("Decoded JWT Payload:", decoded);

    // Proceed with your AJAX call
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/api/dashboard/data",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        success: function (response) {
            console.log("Dashboard data fetch success:", response);

            // Update the cards with fetched data
            $("#sidebarCompanyName").text(response.companyName);
            $("#carbon-emissions-card h5 div").text(response.totalEmissions.toFixed(2));
            $("#energy-consumption-card h5 div").text(response.totalEnergyConsumption.toFixed(2));
            $("#operational-costs-card h5 div").text(`$${response.totalOperationalCosts.toFixed(2)}`);

            // Populate additional data for insights
            emissionsData = {
                monthlyData: {
                    overview: {
                        total: [
                            { value: response.totalEmissions - 10 },
                            { value: response.totalEmissions }
                        ]
                    }
                }
            };
            energyData = {
                monthlyData: {
                    overview: {
                        total: [
                            { value: response.totalEnergyConsumption - 200 },
                            { value: response.totalEnergyConsumption }
                        ]
                    }
                }
            };
            operationalCostsData = {
                monthlyData: {
                    overview: {
                        total: [
                            { value: response.totalOperationalCosts - 1000 },
                            { value: response.totalOperationalCosts }
                        ]
                    }
                }
            };

            // Update the dashboard glance
            updateDataGlance();
        },
        error: function (xhr) {
            console.error("Failed to fetch dashboard data:", xhr);

            // Handle specific error cases
            if (xhr.status === 401) {
                console.warn("Unauthorized! Redirecting to login page...");
                window.location.href = "/login.html";
            } else if (xhr.status === 403) {
                console.log("1")
                console.warn("Forbidden! Check your server permissions.");
                alert("You do not have permission to access this resource.");
            } else {
                alert("An error occurred while fetching dashboard data. Please try again later.");
            }
        },
    });
});

// Helper function to update individual cards
function updateCard(type, value, changePercent) {
    let formattedValue, formattedPercent, unit;
    const isPositive = changePercent > 0;

    switch (type) {
        case 'carbon-emissions':
            formattedValue = `${Math.round(value)}`;
            break;
        case 'energy-consumption':
            formattedValue = `${Math.round(value).toLocaleString()}`;
            break;
        case 'operational-costs':
            if (value >= 1000000) {
                formattedValue = `${(value / 1000000).toFixed(1)}`;
                unit = 'M';
            } else {
                formattedValue = `${(value / 1000).toFixed(1)}`;
                unit = 'K';
            }
            break;
    }

    formattedPercent = `${isPositive ? '+' : ''}${Math.round(changePercent)}%`;

    // Get elements for the card
    const elements = getCardElements(type);

    // Update the card values
    elements.valueDiv.textContent = formattedValue;
    if (type === 'operational-costs' && elements.unitSpan) {
        elements.unitSpan.textContent = unit;
    }
    elements.percentSpan.textContent = formattedPercent;
    elements.percentSpan.className = `card-subtitle mb-2 text-body-secondary ${isPositive ? 'positive-percent' : 'negative-percent'}`;
    elements.arrowIcon.className = `bi bi-arrow-${isPositive ? 'up' : 'down'}-right`;
}

// Update the "data glance" cards on the dashboard
function updateDataGlance() {
    if (!emissionsData || !energyData || !operationalCostsData) {
        console.error("Data is not loaded yet.");
        return;
    }

    // Extract the latest data points from each dataset
    const latestEmissionsData = emissionsData.monthlyData.overview.total.slice(-2);
    const latestEnergyData = energyData.monthlyData.overview.total.slice(-2);
    const latestCostsData = operationalCostsData.monthlyData.overview.total.slice(-2);

    // Calculate percentage changes
    const emissionsChange = ((latestEmissionsData[1].value - latestEmissionsData[0].value) / latestEmissionsData[0].value) * 100;
    const energyChange = ((latestEnergyData[1].value - latestEnergyData[0].value) / latestEnergyData[0].value) * 100;
    const costsChange = ((latestCostsData[1].value - latestCostsData[0].value) / latestCostsData[0].value) * 100;

    // Update the dashboard cards with the calculated data
    updateCard('carbon-emissions', Math.round(latestEmissionsData[1].value), emissionsChange);
    updateCard('energy-consumption', Math.round(latestEnergyData[1].value), energyChange);
    updateCard('operational-costs', latestCostsData[1].value, costsChange);

    // Update additional data insights (e.g., equivalences)
    updateDataInsights(latestEmissionsData[1].value, latestEnergyData[1].value);
}

// Function to update data insights (e.g., equivalences)
function updateDataInsights(emissionsValue, energyValue) {
    const carTrips = Math.round(emissionsValue * 1000 / 12); // Convert tons to kg and divide by 12kg per 100km
    const hdbFlats = Math.round(energyValue / 4500); // Divide by the energy consumption of an HDB flat

    document.querySelector('#car-equivalent').textContent = `x${carTrips.toLocaleString()}`;
    document.querySelector('#hdb-equivalent').textContent = `x${hdbFlats.toLocaleString()}`;
}

// Helper function to get elements for each card
function getCardElements(type) {
    const cardId = `${type}-card`;
    return {
        valueDiv: document.querySelector(`#${cardId} .card-title div`),
        unitSpan: document.querySelector(`#${cardId} .card-title span`),
        percentSpan: document.querySelector(`#${cardId} .card-subtitle`),
        arrowIcon: document.querySelector(`#${cardId} .card-subtitle i`)
    };
}
