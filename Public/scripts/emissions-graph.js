// Data Structures and Constants
const SECTORS = {
    Maintenance: {
        color: '#FF6B6B',
        subSectors: {
            'Building & Facility Maintenance': { baseValue: 120, variance: 20 },
            'Production Equipment Maintenance': { baseValue: 100, variance: 15 },
            'Infrastructure Maintenance': { baseValue: 90, variance: 15 },
            'Preventive Maintenance Operations': { baseValue: 80, variance: 10 },
            'Emergency Repair Services': { baseValue: 60, variance: 20 }
        }
    },
    Electricity: {
        color: '#4ECDC4',
        subSectors: {
            'Production Line Power Consumption': { baseValue: 100, variance: 25 },
            'Facility Climate Control': { baseValue: 90, variance: 20 },
            'Office & Administrative Power Usage': { baseValue: 80, variance: 15 },
            'Warehouse & Storage Power': { baseValue: 60, variance: 10 },
            'Auxiliary Power Systems': { baseValue: 50, variance: 10 }
        }
    },
    Services: {
        color: '#45B7D1',
        subSectors: {
            'Quality Control Services': { baseValue: 80, variance: 15 },
            'Waste Management Services': { baseValue: 70, variance: 20 },
            'Technical Support Services': { baseValue: 60, variance: 10 },
            'Facility Management Services': { baseValue: 60, variance: 15 },
            'Resource Management Services': { baseValue: 50, variance: 10 }
        }
    },
    Transport: {
        color: '#96CEB4',
        subSectors: {
            'Raw Material Logistics': { baseValue: 70, variance: 20 },
            'Finished Product Distribution': { baseValue: 60, variance: 15 },
            'Internal Transport Operations': { baseValue: 55, variance: 10 },
            'Fleet Management': { baseValue: 50, variance: 15 },
            'Employee Transport Services': { baseValue: 45, variance: 10 }
        }
    },
    Others: {
        color: '#AD9D9D',
        subSectors: {
            'Research & Development Operations': { baseValue: 50, variance: 10 },
            'Administrative Support': { baseValue: 45, variance: 8 },
            'Employee Facilities': { baseValue: 40, variance: 8 },
            'External Support Facilities': { baseValue: 35, variance: 7 },
            'Temporary Project Operations': { baseValue: 30, variance: 10 }
        }
    }
};

// State Management
const state = {
    view: 'overview', // 'overview', 'month', 'sector', 'sector-month'
    currentSector: null,
    currentSubSector: null,
    currentMonth: null,
    showingNetEmissions: false,
    navStack: [] // Add this line
};

// Utility Functions for Data Generation
function distributeTotal(total, parts) {
    const distribution = [];
    let remaining = total;
    
    for (let i = 0; i < parts - 1; i++) {
        // Generate a random portion of the remaining total
        const portion = remaining * (0.1 + Math.random() * 0.3);
        distribution.push(portion);
        remaining -= portion;
    }
    // Add the remaining amount to the last part
    distribution.push(remaining);
    
    return distribution;
}

function constrainOffsets(total, sustainable, credits) {
    if (sustainable + credits > total) {
        // Scale down proportionally
        const scale = total / (sustainable + credits);
        sustainable *= scale;
        credits *= scale;
    }
    return { sustainable, credits };
}

function generateMonthlyData(baseValue, variance, monthCount = 12, totalValue = null) {
    const data = [];
    const currentDate = new Date();
    currentDate.setDate(1); // Ensure we're on the first of the month

    for (let i = monthCount - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const value = Math.max(0, baseValue + (Math.random() - 0.5) * variance);
        data.push({
            date: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
            rawDate: date,
            isoDate: date.toISOString().slice(0, 7), // Add this line to store ISO date
            value: totalValue ? Math.min(value, totalValue) : Math.round(value * 100) / 100
        });
    }
    return data;
}

function generateDailyData(baseValue, variance, days = 30, totalValue = null) {
    const data = [];
    const currentDate = new Date();
    currentDate.setDate(1); // Start from first day of month

    for (let i = 1; i <= days; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const value = Math.max(0, baseValue + (Math.random() - 0.5) * variance);
        data.push({
            date: date.getDate().toString(),
            rawDate: date,
            value: totalValue ? Math.min(value, totalValue) : Math.round(value * 100) / 100
        });
    }
    return data;
}

function generateEmissionsData() {
    const monthlyData = {};
    const dailyData = {};
    
    // Generate overview monthly data first
    const overviewTotal = generateMonthlyData(1000, 200);
    monthlyData.overview = {
        total: overviewTotal,
        sustainable: [],
        credits: []
    };

    // Generate constrained sustainable and credits data for overview
    overviewTotal.forEach((totalData, index) => {
        const { sustainable, credits } = constrainOffsets(
            totalData.value,
            totalData.value * 0.3,
            totalData.value * 0.2
        );

        monthlyData.overview.sustainable.push({
            ...totalData,
            value: sustainable
        });
        monthlyData.overview.credits.push({
            ...totalData,
            value: credits
        });
    });

    // Distribute overview totals among sectors
    overviewTotal.forEach((monthData, monthIndex) => {
        const sectorTotals = distributeTotal(monthData.value, Object.keys(SECTORS).length);
        
        Object.entries(SECTORS).forEach(([sectorName, sectorData], sectorIndex) => {
            if (!monthlyData[sectorName]) {
                monthlyData[sectorName] = {
                    total: [],
                    sustainable: [],
                    credits: []
                };
            }

            const sectorMonthValue = sectorTotals[sectorIndex];
            
            // Add sector monthly data
            monthlyData[sectorName].total[monthIndex] = {
                date: monthData.date,
                rawDate: monthData.rawDate,
                value: sectorMonthValue
            };

            // Generate constrained offsets for sector
            const { sustainable, credits } = constrainOffsets(
                sectorMonthValue,
                sectorMonthValue * 0.3,
                sectorMonthValue * 0.2
            );

            monthlyData[sectorName].sustainable[monthIndex] = {
                date: monthData.date,
                rawDate: monthData.rawDate,
                value: sustainable
            };

            monthlyData[sectorName].credits[monthIndex] = {
                date: monthData.date,
                rawDate: monthData.rawDate,
                value: credits
            };

            // Distribute sector total among subsectors
            const subSectorTotals = distributeTotal(
                sectorMonthValue,
                Object.keys(sectorData.subSectors).length
            );

            Object.entries(sectorData.subSectors).forEach(([subSectorName, subSectorData], subIndex) => {
                const subSectorKey = `${sectorName}-${subSectorName}`;
                if (!monthlyData[subSectorKey]) {
                    monthlyData[subSectorKey] = {
                        total: [],
                        sustainable: [],
                        credits: []
                    };
                }

                const subSectorValue = subSectorTotals[subIndex];
                const { sustainable: subSustainable, credits: subCredits } = constrainOffsets(
                    subSectorValue,
                    subSectorValue * 0.3,
                    subSectorValue * 0.2
                );

                monthlyData[subSectorKey].total[monthIndex] = {
                    date: monthData.date,
                    rawDate: monthData.rawDate,
                    value: subSectorValue
                };

                monthlyData[subSectorKey].sustainable[monthIndex] = {
                    date: monthData.date,
                    rawDate: monthData.rawDate,
                    value: subSustainable
                };

                monthlyData[subSectorKey].credits[monthIndex] = {
                    date: monthData.date,
                    rawDate: monthData.rawDate,
                    value: subCredits
                };
            });

            // Generate daily data for this sector and month
            const monthKey = monthData.rawDate.toISOString().slice(0,7);
            const daysInMonth = new Date(monthData.rawDate.getFullYear(), monthData.rawDate.getMonth() + 1, 0).getDate();
            const dailyBaseValue = sectorMonthValue / daysInMonth;

            dailyData[`${sectorName}-${monthKey}`] = {
                total: generateDailyData(dailyBaseValue, dailyBaseValue * 0.1, daysInMonth, sectorMonthValue),
                sustainable: generateDailyData(dailyBaseValue * 0.3, dailyBaseValue * 0.03, daysInMonth, sectorMonthValue * 0.3),
                credits: generateDailyData(dailyBaseValue * 0.2, dailyBaseValue * 0.02, daysInMonth, sectorMonthValue * 0.2)
            };
        });

        // Generate overview daily data for this month
        const monthKey = monthData.rawDate.toISOString().slice(0,7);
        const daysInMonth = new Date(monthData.rawDate.getFullYear(), monthData.rawDate.getMonth() + 1, 0).getDate();
        const dailyBaseValue = monthData.value / daysInMonth;

        dailyData[monthKey] = {
            total: generateDailyData(dailyBaseValue, dailyBaseValue * 0.1, daysInMonth, monthData.value),
            sustainable: generateDailyData(dailyBaseValue * 0.3, dailyBaseValue * 0.03, daysInMonth, monthData.value * 0.3),
            credits: generateDailyData(dailyBaseValue * 0.2, dailyBaseValue * 0.02, daysInMonth, monthData.value * 0.2)
        };
    });

    return { monthlyData, dailyData };
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

// 1. Modify calculateNetEmissions to return an array of numbers:
function calculateNetEmissions(data) {
    if (!data.total) return [];
    return data.total.map((item, index) => 
        Math.max(0, item.value - data.sustainable[index].value - data.credits[index].value)
    );
}

function formatDate(dateOrString) {
    const date = typeof dateOrString === 'string' 
        ? new Date(dateOrString)
        : dateOrString;
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Generate initial data
const emissionsData = generateEmissionsData();

// Chart Instances
let lineChart = null;
let pieChart = null;

// Chart Configuration and Setup
function initializeCharts() {
    const lineCtx = document.getElementById('emissionsLineChart').getContext('2d');
    const pieCtx = document.getElementById('sectorPieChart').getContext('2d');

    // Setup Line Chart
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: getLineChartData('overview'),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Carbon Emissions (tonnes CO2e)'
                    }
                }
            },
            plugins: {
                legend: {
                    onClick: handleLegendClick
                }
            },
            onClick: handleLineChartClick
        }
    });

    // Setup Pie Chart
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: getPieChartData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: handlePieChartClick,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });

    // Setup Event Listeners
    document.getElementById('backButton').addEventListener('click', handleBackButton);
    document.getElementById('netEmissionsToggle').addEventListener('click', toggleNetEmissions);
}

// Data Processing Functions
// 4. Modify getLineChartData to accept dataKey for 'sector-month':
function getLineChartData(dataKey, isDaily = false) {
    const data = isDaily ? emissionsData.dailyData[dataKey] : emissionsData.monthlyData[dataKey];
    
    return {
        labels: data.total.map(d => d.date),
        datasets: [
            {
                label: 'Total Emissions',
                data: data.total.map(d => d.value),
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Sustainable Offset',
                data: data.sustainable.map(d => d.value),
                borderColor: '#FFCE56',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Carbon Credits',
                data: data.credits.map(d => d.value),
                borderColor: '#4BC0C0',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    };
}

function getPieChartData(monthIndex = null) {
    let sectorData;
    
    if ((state.view === 'sector' || state.view === 'sector-month') && state.currentSector) {
        // Show subsector breakdown
        const sector = SECTORS[state.currentSector];
        sectorData = {};
        
        Object.entries(sector.subSectors).forEach(([name, data], index) => {
            const monthlyData = emissionsData.monthlyData[`${state.currentSector}-${name}`];
            let value;
            
            if (monthIndex !== null) {
                // Single month - use the exact value
                value = monthlyData.total[monthIndex].value;
            } else {
                // Sum all months
                value = monthlyData.total.reduce((sum, item) => sum + item.value, 0);
            }
            
            sectorData[name] = {
                value,
                color: adjustBrightness(sector.color, (index - 2) * 20)
            };
        });
    } else {
        // Show main sector breakdown
        sectorData = {};
        Object.entries(SECTORS).forEach(([name, sector]) => {
            const monthlyData = emissionsData.monthlyData[name];
            let value;
            
            if (monthIndex !== null) {
                // Single month - use the exact value
                value = monthlyData.total[monthIndex].value;
            } else {
                // Sum all months
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

// Event Handlers
// 7. Adjust handleLineChartClick to use correct data index:
function handleLineChartClick(event, elements) {
    if (elements.length === 0) return;

    state.navStack.push({ ...state });

    const elementIndex = elements[0].index;
    let dataKey = state.view === 'sector' ? state.currentSector : 'overview';

    const data = emissionsData.monthlyData[dataKey];
    const monthData = data.total[elementIndex];
    
    // Use the pre-calculated ISO date
    state.currentMonth = monthData.isoDate;
    state.view = state.currentSector ? 'sector-month' : 'month';

    updateCharts();
    updateUIState();
}

// 8. Update handlePieChartClick to set correct view:
function handlePieChartClick(evt, elements) {
    if (elements.length === 0) return;

    // Push current state to navStack
    state.navStack.push({ ...state });

    const index = elements[0].index;
    const labels = pieChart.data.labels;
    state.currentSector = labels[index];
    state.view = state.currentMonth ? 'sector-month' : 'sector';

    // Do not reset `state.showingNetEmissions`
    // ...existing code...

    updateCharts();
    updateUIState();
}

function handleLegendClick(e, legendItem, legend) {
    const index = legendItem.datasetIndex;
    const chart = legend.chart;
    const meta = chart.getDatasetMeta(index);

    meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
    chart.update();

    // Check if all datasets are hidden
    const allHidden = chart.data.datasets.every((dataset, i) => 
        chart.getDatasetMeta(i).hidden === true);

    if (allHidden && !state.showingNetEmissions) {
        toggleNetEmissions();
    } else if (!allHidden && state.showingNetEmissions) {
        toggleNetEmissions();
    }
}

// 4. Modify handleBackButton to pop the last state from navStack
function handleBackButton() {
    if (state.navStack.length > 0) {
        const prevState = state.navStack.pop();
        state.view = prevState.view;
        state.currentSector = prevState.currentSector;
        state.currentMonth = prevState.currentMonth;
        // Do not reset `state.showingNetEmissions`
        updateCharts();
        updateUIState();
    }
}

// 2. Update toggleNetEmissions to format data correctly:
function toggleNetEmissions() {
    state.showingNetEmissions = !state.showingNetEmissions;
    updateCharts();
    document.getElementById('netEmissionsToggle').textContent = 
        state.showingNetEmissions ? 'Show All Emissions' : 'Show Net Emissions';
}

// UI Updates
// 3. Update updateCharts to handle 'sector-month' view:
function updateCharts() {
    let dataKey;
    if (state.view === 'sector-month') {
        dataKey = `${state.currentSector}-${state.currentMonth}`;
    } else if (state.view === 'month') {
        dataKey = state.currentMonth;
    } else if (state.view === 'sector') {
        dataKey = state.currentSector;
    } else {
        dataKey = 'overview';
    }

    let isDaily = state.view === 'month' || state.view === 'sector-month';
    let data = isDaily ? emissionsData.dailyData[dataKey] : emissionsData.monthlyData[dataKey];

    let lineData;
    if (state.showingNetEmissions) {
        const netEmissionsValues = calculateNetEmissions(data);
        lineData = {
            labels: data.total.map(d => d.date),
            datasets: [{
                label: 'Net Emissions',
                data: netEmissionsValues,
                borderColor: '#794ACF',
                backgroundColor: 'rgba(121, 74, 207, 0.2)',
                tension: 0.4,
                fill: true
            }]
        };
    } else {
        lineData = {
            labels: data.total.map(d => d.date),
            datasets: [
                {
                    label: 'Total Emissions',
                    data: data.total.map(d => d.value),
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Sustainable Offset',
                    data: data.sustainable.map(d => d.value),
                    borderColor: '#FFCE56',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Carbon Credits',
                    data: data.credits.map(d => d.value),
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    }

    lineChart.data = lineData;
    lineChart.update();

    // Update Pie Chart
    let monthIndex = null;
    if (state.currentMonth) {
        const dataOverview = emissionsData.monthlyData.overview;
        monthIndex = dataOverview.total.findIndex(d => 
            d.rawDate.toISOString().slice(0, 7) === state.currentMonth);
    }
    pieChart.data = getPieChartData(monthIndex);
    pieChart.update();
}

// 7. Ensure the net emissions toggle button label is updated appropriately in updateUIState
function updateUIState() {
    // Update titles and visibility
    const backButton = document.getElementById('backButton');
    const netEmissionsToggle = document.getElementById('netEmissionsToggle');
    const viewIndicator = document.getElementById('viewIndicator');
    
    backButton.style.display = state.view !== 'overview' ? 'block' : 'none';
    netEmissionsToggle.style.display = 'block';
    
    // Update titles
    let lineTitle = 'Carbon Emissions';
    let pieTitle = 'Emissions by Sector';
    
    if (state.currentMonth) {
        const date = new Date(state.currentMonth + '-01T00:00:00');
        date.setMonth(date.getMonth() + 1); // Add one month for display
        const monthStr = formatDate(date);
        lineTitle += ` - ${monthStr}`;
        pieTitle += ` - ${monthStr}`;
    }
    
    if (state.currentSector) {
        lineTitle += ` - ${state.currentSector}`;
        pieTitle = state.view === 'sector' ? `${state.currentSector} Subsector Breakdown` : pieTitle;
    }
    
    document.getElementById('lineChartTitle').textContent = lineTitle;
    document.getElementById('pieChartTitle').textContent = pieTitle;
    
    // Update view indicator
    let viewText = '';
    switch (state.view) {
        case 'month':
            const date = new Date(state.currentMonth + '-01T00:00:00');
            date.setMonth(date.getMonth() + 1); // Add one month for display
            viewText = `Viewing: ${formatDate(date)}`;
            break;
        case 'sector':
            viewText = `Viewing: ${state.currentSector}`;
            break;
        case 'sector-month':
            const monthDate = new Date(state.currentMonth + '-01T00:00:00');
            monthDate.setMonth(monthDate.getMonth() + 1); // Add one month for display
            viewText = `Viewing: ${state.currentSector} - ${formatDate(monthDate)}`;
            break;
    }
    viewIndicator.textContent = viewText;

    document.getElementById('netEmissionsToggle').textContent = 
        state.showingNetEmissions ? 'Show All Emissions' : 'Show Net Emissions';
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateUIState();
});