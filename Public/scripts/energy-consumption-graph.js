// Data Structures and Constants
const ENERGY_SECTORS = {
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
const energyState = {
    view: 'overview',
    currentSector: null,
    currentSubSector: null,
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

function generateDailyData(baseValue, variance, days = 30) {
    const data = [];
    const currentDate = new Date();
    currentDate.setDate(1);

    for (let i = 1; i <= days; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const value = Math.max(0, baseValue + (Math.random() - 0.5) * variance);
        data.push({
            date: date.getDate().toString(),
            rawDate: date,
            value: Math.round(value * 100) / 100
        });
    }
    return data;
}

function generateEnergyConsumptionData() {
    const monthlyData = {};
    const dailyData = {};

    const overviewTotal = generateMonthlyData(50000, 10000);
    monthlyData.overview = {
        total: overviewTotal
    };

    overviewTotal.forEach((monthData, monthIndex) => {
        const sectorTotals = distributeTotal(monthData.value, Object.keys(ENERGY_SECTORS).length);

        Object.entries(ENERGY_SECTORS).forEach(([sectorName, sectorData], sectorIndex) => {
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

            const monthKey = monthData.rawDate.toISOString().slice(0,7);
            const daysInMonth = new Date(monthData.rawDate.getFullYear(), monthData.rawDate.getMonth() + 1, 0).getDate();
            const dailyBaseValue = sectorMonthValue / daysInMonth;

            dailyData[`${sectorName}-${monthKey}`] = {
                total: generateDailyData(dailyBaseValue, dailyBaseValue * 0.1, daysInMonth)
            };
        });

        const monthKey = monthData.rawDate.toISOString().slice(0,7);
        const daysInMonth = new Date(monthData.rawDate.getFullYear(), monthData.rawDate.getMonth() + 1, 0).getDate();
        const dailyBaseValue = monthData.value / daysInMonth;

        dailyData[monthKey] = {
            total: generateDailyData(dailyBaseValue, dailyBaseValue * 0.1, daysInMonth)
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

function formatDate(dateOrString) {
    const date = typeof dateOrString === 'string' 
        ? new Date(dateOrString)
        : dateOrString;
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Generate initial data
const energyData = generateEnergyConsumptionData();

// Chart Instances
let energyLineChart = null;
let energyPieChart = null;

// Chart Configuration and Setup
function initializeEnergyCharts() {
    const lineCtx = document.getElementById('energyLineChart').getContext('2d');
    const pieCtx = document.getElementById('energySectorPieChart').getContext('2d');

    energyLineChart = new Chart(lineCtx, {
        type: 'line',
        data: getEnergyLineChartData('overview'),
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
                        text: 'Energy Consumption (kWh)'
                    }
                }
            },
            plugins: {
                legend: {
                    onClick: handleEnergyLegendClick
                }
            },
            onClick: handleEnergyLineChartClick
        }
    });

    energyPieChart = new Chart(pieCtx, {
        type: 'pie',
        data: getEnergyPieChartData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: handleEnergyPieChartClick,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });

    document.getElementById('energyBackButton').addEventListener('click', handleEnergyBackButton);
}

function getEnergyLineChartData(dataKey, isDaily = false) {
    const data = isDaily ? energyData.dailyData[dataKey] : energyData.monthlyData[dataKey];

    return {
        labels: data.total.map(d => d.date),
        datasets: [
            {
                label: 'Total Energy Consumption',
                data: data.total.map(d => d.value),
                borderColor: '#0c45c0',
                backgroundColor: 'rgba(12, 69, 192, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
}

function getEnergyPieChartData(monthIndex = null) {
    let sectorData;
    
    if ((energyState.view === 'sector' || energyState.view === 'sector-month') && energyState.currentSector) {
        const sector = ENERGY_SECTORS[energyState.currentSector];
        sectorData = {};
        
        Object.entries(sector.subSectors).forEach(([name, data], index) => {
            const monthlyData = energyData.monthlyData[`${energyState.currentSector}-${name}`];
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
        sectorData = {};
        Object.entries(ENERGY_SECTORS).forEach(([name, sector]) => {
            const monthlyData = energyData.monthlyData[name];
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

function handleEnergyLineChartClick(event, elements) {
    if (elements.length === 0) return;

    energyState.navStack.push({ ...energyState });

    const elementIndex = elements[0].index;
    let dataKey = energyState.view === 'sector' ? energyState.currentSector : 'overview';

    const data = energyData.monthlyData[dataKey];
    const monthData = data.total[elementIndex];
    
    energyState.currentMonth = monthData.isoDate;
    energyState.view = energyState.currentSector ? 'sector-month' : 'month';

    updateEnergyCharts();
    updateEnergyUIState();
}

function handleEnergyPieChartClick(evt, elements) {
    if (elements.length === 0) return;

    energyState.navStack.push({ ...energyState });

    const index = elements[0].index;
    const labels = energyPieChart.data.labels;
    energyState.currentSector = labels[index];
    energyState.view = energyState.currentMonth ? 'sector-month' : 'sector';

    updateEnergyCharts();
    updateEnergyUIState();
}

function handleEnergyLegendClick(e, legendItem, legend) {
    const index = legendItem.datasetIndex;
    const chart = legend.chart;
    const meta = chart.getDatasetMeta(index);

    meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
    chart.update();
}

function handleEnergyBackButton() {
    if (energyState.navStack.length > 0) {
        const prevState = energyState.navStack.pop();
        energyState.view = prevState.view;
        energyState.currentSector = prevState.currentSector;
        energyState.currentMonth = prevState.currentMonth;
        updateEnergyCharts();
        updateEnergyUIState();
    }
}

function updateEnergyCharts() {
    let dataKey;
    if (energyState.view === 'sector-month') {
        dataKey = `${energyState.currentSector}-${energyState.currentMonth}`;
    } else if (energyState.view === 'month') {
        dataKey = energyState.currentMonth;
    } else if (energyState.view === 'sector') {
        dataKey = energyState.currentSector;
    } else {
        dataKey = 'overview';
    }

    let isDaily = energyState.view === 'month' || energyState.view === 'sector-month';
    let data = isDaily ? energyData.dailyData[dataKey] : energyData.monthlyData[dataKey];

    let lineData = {
        labels: data.total.map(d => d.date),
        datasets: [
            {
                label: 'Total Energy Consumption',
                data: data.total.map(d => d.value),
                borderColor: '#0c45c0',
                backgroundColor: 'rgba(12, 69, 192, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    energyLineChart.data = lineData;
    energyLineChart.update();

    let monthIndex = null;
    if (energyState.currentMonth) {
        const dataOverview = energyData.monthlyData.overview;
        monthIndex = dataOverview.total.findIndex(d => 
            d.rawDate.toISOString().slice(0, 7) === energyState.currentMonth);
    }
    energyPieChart.data = getEnergyPieChartData(monthIndex);
    energyPieChart.update();
}

function updateEnergyUIState() {
    const backButton = document.getElementById('energyBackButton');
    const viewIndicator = document.getElementById('energyViewIndicator');

    backButton.style.display = energyState.view !== 'overview' ? 'block' : 'none';

    let lineTitle = 'Energy Consumption';
    let pieTitle = 'Energy Consumption by Sector';

    if (energyState.currentMonth) {
        const date = new Date(energyState.currentMonth + '-01T00:00:00');
        date.setMonth(date.getMonth() + 1);
        const monthStr = formatDate(date);
        lineTitle += ` - ${monthStr}`;
        pieTitle += ` - ${monthStr}`;
    }

    if (energyState.currentSector) {
        lineTitle += ` - ${energyState.currentSector}`;
        pieTitle = energyState.view === 'sector' ? `${energyState.currentSector} Subsector Breakdown` : pieTitle;
    }

    document.getElementById('energyLineChartTitle').textContent = lineTitle;
    document.getElementById('energyPieChartTitle').textContent = pieTitle;

    let viewText = '';
    switch (energyState.view) {
        case 'month':
            const date = new Date(energyState.currentMonth + '-01T00:00:00');
            date.setMonth(date.getMonth() + 1);
            viewText = `Viewing: ${formatDate(date)}`;
            break;
        case 'sector':
            viewText = `Viewing: ${energyState.currentSector}`;
            break;
        case 'sector-month':
            const monthDate = new Date(energyState.currentMonth + '-01T00:00:00');
            monthDate.setMonth(monthDate.getMonth() + 1);
            viewText = `Viewing: ${energyState.currentSector} - ${formatDate(monthDate)}`;
            break;
    }
    viewIndicator.textContent = viewText;
}

function filterEnergyGraph(startIso, endIso) {
    const filteredLabels = [];
    const filteredTotalData = [];

    const data = energyData.monthlyData.overview;
    data.total.forEach((item, index) => {
        if (item.isoDate >= startIso && item.isoDate <= endIso) {
            filteredLabels.push(item.date);
            filteredTotalData.push(item.value);
        }
    });

    energyLineChart.data.labels = filteredLabels;
    energyLineChart.data.datasets[0].data = filteredTotalData;
    energyLineChart.update();

    // Update pie chart
    updateEnergyPieChart(filteredLabels);
}

function updateEnergyPieChart(filteredLabels) {
    const monthIndex = energyData.monthlyData.overview.total.findIndex(d => filteredLabels.includes(d.date));
    energyPieChart.data = getEnergyPieChartData(monthIndex);
    energyPieChart.update();
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEnergyCharts();
    updateEnergyUIState();
});