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

    // Fetch energy consumption data by sector
    getEnergyConsumptionBySector: async () => {
        const query = `
            SELECT S.sector_name, SUM(ED.emission_amount) AS total_energy
            FROM EmissionsData ED
            JOIN Sectors S ON ED.sector_id = S.sector_id
            WHERE S.sector_name = 'Electricity'
            GROUP BY S.sector_name
        `;
        const request = new sql.Request();
        const result = await request.query(query);
        return result.recordset;
    },

    // Fetch operational costs by month for each sector
    getOperationalCostByMonth: async () => {
        const query = `
            SELECT DATEPART(month, emission_date) AS month, 
                   S.sector_name,
                   SUM(ED.emission_amount) AS operational_cost
            FROM EmissionsData ED
            JOIN Sectors S ON ED.sector_id = S.sector_id
            GROUP BY DATEPART(month, emission_date), S.sector_name
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
