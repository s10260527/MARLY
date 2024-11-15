
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

function generateEnergyConsumptionData() {
    const monthlyData = {};
    const dailyData = {};

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

function generateEmissionsData() {
    const monthlyData = {};
    const dailyData = {};
    
    const overviewTotal = generateMonthlyData(1000, 200);
    monthlyData.overview = {
        total: overviewTotal,
        sustainable: [],
        credits: []
    };

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
            
            monthlyData[sectorName].total[monthIndex] = {
                date: monthData.date,
                rawDate: monthData.rawDate,
                value: sectorMonthValue
            };

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

            const subSectorTotals = distributeTotal(
                sectorMonthValue,
                Object.keys(sectorData.subSectors).length
            );

            Object.entries(sectorData.subSectors).forEach(([subSectorName, subIndex]) => {
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

            const monthKey = monthData.rawDate.toISOString().slice(0,7);
            const daysInMonth = new Date(monthData.rawDate.getFullYear(), monthData.rawDate.getMonth() + 1, 0).getDate();
            const dailyBaseValue = sectorMonthValue / daysInMonth;

            dailyData[`${sectorName}-${monthKey}`] = {
                total: generateDailyData(dailyBaseValue, dailyBaseValue * 0.1, daysInMonth, sectorMonthValue),
                sustainable: generateDailyData(dailyBaseValue * 0.3, dailyBaseValue * 0.03, daysInMonth, sectorMonthValue * 0.3),
                credits: generateDailyData(dailyBaseValue * 0.2, dailyBaseValue * 0.02, daysInMonth, sectorMonthValue * 0.2)
            };
        });

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

function constrainOffsets(total, sustainable, credits) {
    if (sustainable + credits > total) {
        const scale = total / (sustainable + credits);
        sustainable *= scale;
        credits *= scale;
    }
    return { sustainable, credits };
}

export { SECTORS, generateOperationalCostsData, generateEnergyConsumptionData, generateEmissionsData };