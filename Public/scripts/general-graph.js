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

// Initialize Chart
function initGeneralChart() {
    const ctx = document.getElementById('general-graph').getContext('2d');
    const months = getLast12Months();

    // Generate sample data
    const carbonData = generateData(months, 500, 200);
    const energyData = generateData(months, 200000, 50000);
    const costData = generateData(months, 1000000, 200000);

    // Create chart with existing configuration
    const chart = new Chart(ctx, {
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
                    data: energyData,
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
        options: {
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
                                    label += context.parsed.y.toFixed(2) + ' tonnes';
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
            }
        }
    });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initGeneralChart);