// Data Structures and Constants
const SECTORS = {
    Maintenance: {
        color: '#FF6B6B',
        subSectors: {
            'Building & Facility Maintenance': { baseValue: 5000, variance: 1000 },
            'Production Equipment Maintenance': { baseValue: 4500, variance: 900 },
            'Infrastructure Maintenance': { baseValue: 4000, variance: 800 },
            'Preventive Maintenance Operations': { baseValue: 3500, variance: 700 },
            'Emergency Repair Services': { baseValue: 3000, variance: 600 }
        }
    },
    Electricity: {
        color: '#4ECDC4',
        subSectors: {
            'Production Line Power Consumption': { baseValue: 8000, variance: 1600 },
            'Facility Climate Control': { baseValue: 7000, variance: 1400 },
            'Office & Administrative Power Usage': { baseValue: 6000, variance: 1200 },
            'Warehouse & Storage Power': { baseValue: 5000, variance: 1000 },
            'Auxiliary Power Systems': { baseValue: 4000, variance: 800 }
        }
    },
    Services: {
        color: '#45B7D1',
        subSectors: {
            'Quality Control Services': { baseValue: 3000, variance: 600 },
            'Waste Management Services': { baseValue: 2500, variance: 500 },
            'Technical Support Services': { baseValue: 2000, variance: 400 },
            'Facility Management Services': { baseValue: 1500, variance: 300 },
            'Resource Management Services': { baseValue: 1000, variance: 200 }
        }
    },
    Transport: {
        color: '#96CEB4',
        subSectors: {
            'Raw Material Logistics': { baseValue: 4000, variance: 800 },
            'Finished Product Distribution': { baseValue: 3500, variance: 700 },
            'Internal Transport Operations': { baseValue: 3000, variance: 600 },
            'Fleet Management': { baseValue: 2500, variance: 500 },
            'Employee Transport Services': { baseValue: 2000, variance: 400 }
        }
    },
    Others: {
        color: '#AD9D9D',
        subSectors: {
            'Research & Development Operations': { baseValue: 1500, variance: 300 },
            'Administrative Support': { baseValue: 1200, variance: 240 },
            'Employee Facilities': { baseValue: 1000, variance: 200 },
            'External Support Facilities': { baseValue: 800, variance: 160 },
            'Temporary Project Operations': { baseValue: 600, variance: 120 }
        }
    }
};

// State Management
const state = {
    view: 'overview', // 'overview', 'month', 'sector', 'sector-month'
    currentSector: null,
    currentMonth: null,
    navStack: []
};

// Utility Functions for Data Generation
function distributeTotal(total, parts) {
    const distribution = [];
    let remaining = total;
    
    for (let i = 0; i < parts - 1; i++) {
        const portion = remaining * (0.1 + Math.random() * 0.3);
        distribution.push(portion);
        remaining -= portion;
    }
    distribution.push(remaining);
    
    return distribution;
}

function generateMonthlyData(baseValue, variance, monthCount = 12) {
    const data = [];
    const currentDate = new Date();
    currentDate.setDate(1);

    for (let i = monthCount - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const value = Math.max(0, baseValue + (Math.random() - 0.5) * variance);
        data.push({
            date: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
            rawDate: date,
            isoDate: date.toISOString().slice(0, 7),
            value: Math.round(value * 100) / 100
        });
    }
    return data;
}

function generateOperationalCostsData() {
    const monthlyData = {};

    const overviewTotal = generateMonthlyData(50000, 10000);
    monthlyData.overview = {
        total: overviewTotal
    };

    overviewTotal.forEach((monthData, monthIndex) => {
        const sectorTotals = distributeTotal(monthData.value, Object.keys(SECTORS).length);

        Object.entries(SECTORS).forEach(([sectorName, sectorData], sectorIndex) => {
            if (!monthlyData[sectorName]) {
                monthlyData[sectorName] = {
                    total: []
                };
            }

            const sectorMonthValue = sectorTotals[sectorIndex];

            monthlyData[sectorName].total[monthIndex] = {
                date: monthData.date,
                rawDate: monthData.rawDate,
                value: sectorMonthValue
            };

            const subSectorTotals = distributeTotal(
                sectorMonthValue,
                Object.keys(sectorData.subSectors).length
            );

            Object.entries(sectorData.subSectors).forEach(([subSectorName, subSectorData], subIndex) => {
                const subSectorKey = `${sectorName}-${subSectorName}`;
                if (!monthlyData[subSectorKey]) {
                    monthlyData[subSectorKey] = {
                        total: []
                    };
                }

                const subSectorValue = subSectorTotals[subIndex];

                monthlyData[subSectorKey].total[monthIndex] = {
                    date: monthData.date,
                    rawDate: monthData.rawDate,
                    value: subSectorValue
                };
            });
        });
    });

    return { monthlyData };
}

// Other Utility Functions
function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function formatDate(dateOrString) {
    const date = typeof dateOrString === 'string' 
        ? new Date(dateOrString)
        : dateOrString;
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Generate initial data
const operationalCostsData = generateOperationalCostsData();

// Chart Instances
let verticalBarChart = null;
let horizontalBarChart = null;

// Chart Configuration and Setup
function initializeCharts() {
    const verticalBarCtx = document.getElementById('operationalCostsVerticalBarChart').getContext('2d');
    const horizontalBarCtx = document.getElementById('operationalCostsHorizontalBarChart').getContext('2d');

    verticalBarChart = new Chart(verticalBarCtx, {
        type: 'bar',
        data: getVerticalBarChartData('overview'),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Operational Costs ($)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            onClick: handleVerticalBarChartClick
        }
    });

    horizontalBarChart = new Chart(horizontalBarCtx, {
        type: 'bar',
        data: getHorizontalBarChartData(),
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Operational Costs ($)'
                    }
                },
                y: {
                    ticks: {
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            const words = label.split(' ');
                            const lines = [];
                            let currentLine = words[0];

                            for (let i = 1; i < words.length; i++) {
                                if (currentLine.length + words[i].length < 20) {
                                    currentLine += " " + words[i];
                                } else {
                                    lines.push(currentLine);
                                    currentLine = words[i];
                                }
                            }
                            lines.push(currentLine);
                            return lines;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            onClick: handleHorizontalBarChartClick
        }
    });

    document.getElementById('backButton').addEventListener('click', handleBackButton);
}

function getVerticalBarChartData(dataKey) {
    if (state.currentMonth) {
        const monthIndex = operationalCostsData.monthlyData.overview.total.findIndex(
            d => d.rawDate.toISOString().slice(0, 7) === state.currentMonth
        );

        let datasets = [];
        const baseData = state.currentSector 
            ? operationalCostsData.monthlyData[state.currentSector]
            : operationalCostsData.monthlyData.overview;
        
        // Add transparent bars for non-selected months
        datasets.push({
            label: 'Total',
            data: baseData.total.map((d, i) => 
                i !== monthIndex ? d.value : null
            ),
            backgroundColor: state.currentSector 
                ? adjustBrightness(SECTORS[state.currentSector].color, 20) // Changed from 60 to 20 for less transparency
                : 'rgba(12, 69, 192, 0.3)',
            borderColor: state.currentSector 
                ? adjustBrightness(SECTORS[state.currentSector].color, 20) // Changed from 60 to 20
                : 'rgba(12, 69, 192, 0.3)',
            borderWidth: 1
            // Removed barPercentage and categoryPercentage here
        });

        // Add stacked bars for the selected month
        if (state.currentSector) {
            Object.entries(SECTORS[state.currentSector].subSectors).forEach(([name, subData], index) => {
                const subSectorData = operationalCostsData.monthlyData[`${state.currentSector}-${name}`].total[monthIndex];
                datasets.push({
                    label: name,
                    data: baseData.total.map((_, i) => 
                        i === monthIndex ? subSectorData.value : null
                    ),
                    backgroundColor: adjustBrightness(SECTORS[state.currentSector].color, (index - 2) * 20),
                    stack: 'selected-month'
                    // Removed barPercentage and categoryPercentage here
                });
            });
        } else {
            Object.entries(SECTORS).forEach(([sectorName, sectorData]) => {
                const sectorMonthData = operationalCostsData.monthlyData[sectorName].total[monthIndex];
                datasets.push({
                    label: sectorName,
                    data: baseData.total.map((_, i) => 
                        i === monthIndex ? sectorMonthData.value : null
                    ),
                    backgroundColor: sectorData.color,
                    stack: 'selected-month'
                    // Removed barPercentage and categoryPercentage here
                });
            });
        }

        return {
            labels: baseData.total.map(d => d.date),
            datasets: datasets
        };
    }

    // Show single-color bars for overview or sector view
    const data = state.currentSector 
        ? operationalCostsData.monthlyData[state.currentSector]
        : operationalCostsData.monthlyData.overview;

    return {
        labels: data.total.map(d => d.date),
        datasets: [{
            label: 'Total Operational Costs',
            data: data.total.map(d => d.value),
            backgroundColor: state.currentSector 
                ? SECTORS[state.currentSector].color 
                : '#0c45c0',
            borderColor: state.currentSector 
                ? SECTORS[state.currentSector].color 
                : '#0c45c0',
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.9
        }]
    };
}

function getHorizontalBarChartData(monthIndex = null) {
    let sectorData = {};
    if (state.view === 'sector' || state.view === 'sector-month') {
        const sector = SECTORS[state.currentSector];
        Object.entries(sector.subSectors).forEach(([name, subSector], index) => {
            const monthlyData = operationalCostsData.monthlyData[`${state.currentSector}-${name}`];
            let value;
            
            if (monthIndex !== null) {
                value = monthlyData.total[monthIndex].value;
            } else {
                value = monthlyData.total.reduce((sum, item) => sum + item.value, 0);
            }
            
            sectorData[name] = {
                value,
                color: adjustBrightness(sector.color, (index - 2) * 20)
            };
        });
    } else {
        Object.entries(SECTORS).forEach(([name, sector]) => {
            const monthlyData = operationalCostsData.monthlyData[name];
            let value;
            
            if (monthIndex !== null) {
                value = monthlyData.total[monthIndex].value;
            } else {
                value = monthlyData.total.reduce((sum, item) => sum + item.value, 0);
            }
            
            sectorData[name] = {
                value,
                color: sector.color
            };
        });
    }

    return {
        labels: Object.keys(sectorData),
        datasets: [{
            data: Object.values(sectorData).map(s => s.value),
            backgroundColor: Object.values(sectorData).map(s => s.color),
            borderWidth: 1
        }]
    };
}

function handleVerticalBarChartClick(event, elements) {
    if (elements.length === 0) return;

    state.navStack.push({ ...state });

    const elementIndex = elements[0].index;
    const data = operationalCostsData.monthlyData.overview;
    const monthData = data.total[elementIndex];
    
    state.currentMonth = monthData.isoDate;
    state.view = state.currentSector ? 'sector-month' : 'month';

    // Adjust opacity of unselected months
    verticalBarChart.data.datasets[0].backgroundColor = verticalBarChart.data.datasets[0].data.map((_, index) => {
        return index === elementIndex ? '#0c45c0' : 'rgba(12, 69, 192, 0.3)';
    });

    updateCharts();
    updateUIState();
}

function handleHorizontalBarChartClick(evt, elements) {
    if (elements.length === 0) return;

    state.navStack.push({ ...state });

    const index = elements[0].index;
    const labels = horizontalBarChart.data.labels;
    state.currentSector = labels[index];
    state.view = 'sector';

    updateCharts();
    updateUIState();
}

function handleBackButton() {
    if (state.navStack.length > 0) {
        const prevState = state.navStack.pop();
        state.view = prevState.view;
        state.currentSector = prevState.currentSector;
        state.currentMonth = prevState.currentMonth;
        updateCharts();
        updateUIState();
    }
}

function updateCharts() {
    let dataKey;
    if (state.view === 'sector' || state.view === 'sector-month') {
        dataKey = state.currentSector;
    } else if (state.view === 'month') {
        dataKey = state.currentMonth;
    } else {
        dataKey = 'overview';
    }

    verticalBarChart.data = getVerticalBarChartData('overview');
    verticalBarChart.update();

    let monthIndex = null;
    if (state.currentMonth) {
        const dataOverview = operationalCostsData.monthlyData.overview;
        monthIndex = dataOverview.total.findIndex(d => 
            d.rawDate.toISOString().slice(0, 7) === state.currentMonth);
    }
    horizontalBarChart.data = getHorizontalBarChartData(monthIndex);
    horizontalBarChart.update();
    updateHorizontalChartTotal();
}

function updateHorizontalChartTotal() {
    const total = horizontalBarChart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    document.getElementById('horizontalChartTotal').textContent = total.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function updateUIState() {
    const backButton = document.getElementById('backButton');
    const viewIndicator = document.getElementById('viewIndicator');

    backButton.style.display = state.view !== 'overview' ? 'block' : 'none';

    let verticalTitle = 'Operational Costs Over Time';
    let horizontalTitle = 'Operational Costs by Sector';

    if (state.currentMonth) {
        const date = new Date(state.currentMonth + '-01T00:00:00');
        date.setMonth(date.getMonth() + 1);
        const monthStr = formatDate(date);
        horizontalTitle += ` - ${monthStr}`;
    }

    if (state.currentSector) {
        horizontalTitle = `${state.currentSector} Subsector Breakdown`;
    }

    document.getElementById('verticalBarChartTitle').textContent = verticalTitle;
    document.getElementById('horizontalBarChartTitle').textContent = horizontalTitle;

    let viewText = '';
    switch (state.view) {
        case 'month':
            const date = new Date(state.currentMonth + '-01T00:00:00');
            date.setMonth(date.getMonth() + 1);
            viewText = `Viewing: ${formatDate(date)}`;
            break;
        case 'sector':
            if (state.currentMonth) {
                // Add one month for display
                const sectorDate = new Date(state.currentMonth + '-01T00:00:00');
                sectorDate.setMonth(sectorDate.getMonth() + 1);
                viewText = `Viewing: ${state.currentSector} - ${formatDate(sectorDate)}`;
            } else {
                viewText = `Viewing: ${state.currentSector}`;
            }
            break;
        case 'sector-month':
            const monthDate = new Date(state.currentMonth + '-01T00:00:00');
            monthDate.setMonth(monthDate.getMonth() + 1);
            viewText = `Viewing: ${state.currentSector} - ${formatDate(monthDate)}`;
            break;
    }
    viewIndicator.textContent = viewText;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateUIState();
    updateHorizontalChartTotal(); // Add this line to update total on initial load
});
