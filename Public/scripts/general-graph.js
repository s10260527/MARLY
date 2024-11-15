// Function to generate random data
function generateData(months, baseValue, variance) {
    return months.map(() => baseValue + (Math.random() - 0.5) * variance);
}

// Get last 12 months
function getLast12Months() {
    const months = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        months.push(date.toLocaleString('default', { month: 'short', year: '2-digit' }));
    }
    return months;
}

let carbonData = [];
let energyConsumptionData = [];
let costData = [];
let chart = null; // Define chart variable

// Initialize Chart
function initGeneralChart() {
    const ctx = document.getElementById('general-graph').getContext('2d');
    const months = getLast12Months();

    // Ensure the data variables are properly initialized
    carbonData = emissionsData.monthlyData.overview.total.map(d => d.value);
    energyConsumptionData = energyData.monthlyData.overview.total.map(d => d.value);
    costData = operationalCostsData.monthlyData.overview.total.map(d => d.value);

    // Add click handler to options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            title: {
                display: false
            },
            legend: {
                display: true,
                onClick: function(e, legendItem) {
                    const index = legendItem.datasetIndex;
                    const ci = this.chart;
                    const meta = ci.getDatasetMeta(index);

                    // Toggle visibility
                    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                    ci.update();
                },
                labels: {
                    color: '#000000',
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: "'Poppins', sans-serif",
                        size: 12,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (context.datasetIndex === 0) {
                                label += context.parsed.y.toFixed(2) + ' metric tons';
                            } else if (context.datasetIndex === 1) {
                                label += context.parsed.y.toFixed(2) + ' kWh';
                            } else {
                                label += '$' + context.parsed.y.toLocaleString();
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    color: '#000000',
                    font: {
                        weight: '500'
                    }
                },
                backgroundColor: '#eff6f2'
            },
            'y-carbon': {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Carbon Emissions (metric tons)',
                    color: '#000000',
                    font: {
                        weight: '500'
                    }
                },
                ticks: {
                    color: '#000000',
                    font: {
                        weight: '500'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                backgroundColor: '#eff6f2'
            },
            'y-energy': {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Energy Consumption (kWh)',
                    color: '#000000',
                    font: {
                        weight: '500'
                    }
                },
                ticks: {
                    color: '#000000',
                    font: {
                        weight: '500'
                    }
                },
                grid: {
                    drawOnChartArea: false,
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                backgroundColor: '#eff6f2'
            },
            'y-cost': {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Operational Costs ($)',
                    color: '#000000',
                    font: {
                        weight: '500'
                    }
                },
                ticks: {
                    color: '#000000',
                    font: {
                        weight: '500'
                    }
                },
                grid: {
                    drawOnChartArea: false,
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                backgroundColor: '#eff6f2'
            }
        },
        onClick: function(event, elements) {
            if (elements.length > 0) {
                const index = elements[0].index;
                const monthData = months[index];
                const date = new Date();
                // Change the month calculation to match the clicked month
                date.setMonth(date.getMonth() - (12 - index));
                const isoDate = date.toISOString().slice(0, 7);
                
                syncGraphsMonthView(isoDate);
            }
        }
    };

    // Create chart with updated options
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Carbon Emissions (metric tons)',
                    data: carbonData,
                    borderColor: '#16b65b',
                    backgroundColor: 'rgba(22, 182, 91, 0.1)',
                    yAxisID: 'y-carbon',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2.5
                },
                {
                    label: 'Energy Consumption (kWh)',
                    data: energyConsumptionData,
                    borderColor: '#0c45c0',
                    backgroundColor: 'rgba(12, 69, 192, 0.1)',
                    yAxisID: 'y-energy',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2.5
                },
                {
                    label: 'Operational Costs ($)',
                    data: costData,
                    borderColor: '#7d70f5',
                    backgroundColor: 'rgba(125, 112, 245, 0.1)',
                    yAxisID: 'y-cost',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2.5
                }
            ]
        },
        options: options
    });
}

// Function to filter the general graph by the selected date range
function filterGeneralGraph(startIso, endIso) {
    const filteredLabels = [];
    const filteredCarbonData = [];
    const filteredEnergyData = [];
    const filteredCostData = [];

    const months = getLast12Months();
    months.forEach((month, index) => {
        const isoDate = new Date().setMonth(new Date().getMonth() - (11 - index));
        const isoString = new Date(isoDate).toISOString().slice(0, 7);
        if (isoString >= startIso && isoString <= endIso) {
            filteredLabels.push(month);
            filteredCarbonData.push(carbonData[index]);
            filteredEnergyData.push(energyConsumptionData[index]);
            filteredCostData.push(costData[index]);
        }
    });

    chart.data.labels = filteredLabels;
    chart.data.datasets[0].data = filteredCarbonData;
    chart.data.datasets[1].data = filteredEnergyData;
    chart.data.datasets[2].data = filteredCostData;
    chart.update();
}

// Function to sync month view across all graphs
function syncGraphsMonthView(isoDate) {
    // Update Emissions Graph
    state.navStack.push({ ...state });
    state.currentMonth = isoDate;
    state.view = 'month';
    updateCharts();
    updateUIState();

    // Update Energy Graph
    energyState.navStack.push({ ...energyState });
    energyState.currentMonth = isoDate;
    energyState.view = 'month';
    updateEnergyCharts();
    updateEnergyUIState();

    // Update Costs Graph
    costsState.navStack.push({ ...costsState });
    costsState.currentMonth = isoDate;
    costsState.view = 'month';
    updateCostsCharts();
    updateCostsUIState();

    // Switch to the "Detailed Graph" tab if not already active
    const detailedGraphTabs = document.getElementById('detailedGraphTabs');
    const carbonTab = new bootstrap.Tab(detailedGraphTabs.querySelector('#carbon-tab'));
    carbonTab.show();

    // Scroll to detailed graphs section
    document.querySelector('.detailed-graph').scrollIntoView({ behavior: 'smooth' });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initGeneralChart);