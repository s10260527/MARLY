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
            SELECT S.sector_name, SUM(MEC.total_energy) AS total_energy
            FROM MonthlyEnergyConsumption MEC
            JOIN Sectors S ON MEC.sector_id = S.sector_id
            WHERE MEC.subsector_id IS NULL  -- Exclude subsectors if applicable
            GROUP BY S.sector_name
        `;
        const request = new sql.Request();
        const result = await request.query(query);
        return result.recordset;
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
