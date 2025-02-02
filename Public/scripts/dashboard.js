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

function navigateToProgressPage() {
    window.location.href = 'progress.html'; // Replace with the actual path of the breakdown page
}


// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateDataGlance();
    // Add event listener for graph data changes if needed
});

document.addEventListener('DOMContentLoaded', function () {
    const savedProgress = localStorage.getItem('netZeroProgress');
    if (savedProgress) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.text-muted');

        progressBar.style.width = `${savedProgress}%`;
        progressBar.setAttribute('aria-valuenow', savedProgress);
        progressText.textContent = `Progress to Net Zero Goal ♻️ (${savedProgress}%)`;
    }
});


document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ JavaScript Loaded");

    // Get progress bar element
    const progressBar = document.getElementById("progressLink");

    // Redirect to progress.html when clicked
    if (progressBar) {
        progressBar.addEventListener("click", function (event) {
            console.log("🔄 Redirecting to progress.html...");
            window.location.href = "progress.html";
        });
    } else {
        console.error("❌ Progress bar link not found!");
    }
});


