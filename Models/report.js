// Models/report.js
const sql = require("mssql");

module.exports = {
    // Fetch emissions data by sector
    getEmissionsBySector: async () => {
        const query = `
            SELECT S.sector_name, SUM(ED.emission_amount) AS total_emissions
            FROM EmissionsData ED
            JOIN Sectors S ON ED.sector_id = S.sector_id
            GROUP BY S.sector_name
        `;
        const request = new sql.Request();
        const result = await request.query(query);
        return result.recordset;
    },

    // Fetch energy consumption data by sector using MonthlyEnergyConsumption
    getEnergyConsumptionBySector: async () => {
        const query = `
            SELECT 
                S.sector_name, 
                DATEPART(month, MEC.month) AS month,
                SUM(MEC.total_energy) AS monthly_energy
            FROM MonthlyEnergyConsumption MEC
            JOIN Sectors S ON MEC.sector_id = S.sector_id
            WHERE MEC.subsector_id IS NULL
            GROUP BY S.sector_name, DATEPART(month, MEC.month)
            ORDER BY S.sector_name, DATEPART(month, MEC.month);
        `;
        const request = new sql.Request();
        const result = await request.query(query);
    
        // Transform the result to match the expected structure in the frontend
        const transformedData = result.recordset.reduce((acc, row) => {
            const sector = acc.find(s => s.sector_name === row.sector_name);
            if (sector) {
                sector.monthlyData[row.month - 1] = row.monthly_energy;
            } else {
                const newSector = {
                    sector_name: row.sector_name,
                    total_energy: 0,  // Set later if needed
                    monthlyData: new Array(12).fill(0),
                };
                newSector.monthlyData[row.month - 1] = row.monthly_energy;
                acc.push(newSector);
            }
            return acc;
        }, []);
    
        return transformedData;
    },    

    // Fetch operational costs by month for each sector from OperationalCosts table
    getOperationalCostByMonth: async () => {
        const query = `
            SELECT DATEPART(month, month) AS month, 
                   S.sector_name,
                   SUM(OC.cost_amount) AS operational_cost
            FROM OperationalCosts OC
            JOIN Sectors S ON OC.sector_id = S.sector_id
            GROUP BY DATEPART(month, month), S.sector_name
            ORDER BY month;
        `;
        const request = new sql.Request();
        const result = await request.query(query);
        return result.recordset;
    },

    // Fetch yearly emissions data by sector
    getYearlyEmissionsBySector: async () => {
        const query = `
            SELECT DATEPART(year, emission_date) AS year, 
                   S.sector_name,
                   SUM(ED.emission_amount) AS yearly_emissions
            FROM EmissionsData ED
            JOIN Sectors S ON ED.sector_id = S.sector_id
            GROUP BY DATEPART(year, emission_date), S.sector_name
            ORDER BY year;
        `;
        const request = new sql.Request();
        const result = await request.query(query);
        return result.recordset;
    }
};
