const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Report {
    static async getEmissionsBySector() {
        try {
            await sql.connect(dbConfig);
            const query = `
                SELECT 
                    'Manufacturing' AS sector_name, 
                    SUM(CAST(JSON_VALUE(sector_emissions_json, '$.manufacturing') AS FLOAT)) AS total_emissions
                FROM Emissions_Master
                UNION ALL
                SELECT 
                    'Facilities' AS sector_name, 
                    SUM(CAST(JSON_VALUE(sector_emissions_json, '$.facilities') AS FLOAT)) AS total_emissions
                FROM Emissions_Master
                UNION ALL
                SELECT 
                    'Transport' AS sector_name, 
                    SUM(CAST(JSON_VALUE(sector_emissions_json, '$.transport') AS FLOAT)) AS total_emissions
                FROM Emissions_Master;
            `;

            const result = await sql.query(query);
            return result.recordset;
        } catch (error) {
            console.error("Error fetching emissions by sector:", error.message);
            throw new Error("Failed to fetch emissions by sector.");
        }
    }

    static async getEnergyConsumptionBySector() {
        try {
            await sql.connect(dbConfig);
            const query = `
                SELECT 
                    F.sector_type AS sector_name,
                    SUM(S2.electricity_consumption + S2.steam_consumption + S2.cooling_consumption + S2.heating_consumption) AS total_energy
                FROM Facilities F
                JOIN Departments D ON F.facility_id = D.facility_id
                JOIN Scope2_Emissions S2 ON D.department_id = S2.department_id
                GROUP BY F.sector_type;
            `;

            const result = await sql.query(query);
            return result.recordset;
        } catch (error) {
            console.error("Error fetching energy consumption:", error.message);
            throw new Error("Failed to fetch energy consumption by sector.");
        }
    }

    static async getOperationalCostByMonth() {
        try {
            await sql.connect(dbConfig);
            const query = `
                SELECT 
                    DATEPART(MONTH, OC.date) AS month,
                    F.sector_type AS sector_name,
                    SUM(OC.amount) AS operational_cost
                FROM Operational_Costs_Master OC
                JOIN Facilities F ON OC.facility_id = F.facility_id
                GROUP BY DATEPART(MONTH, OC.date), F.sector_type
                ORDER BY month;
            `;

            const result = await sql.query(query);
            return result.recordset;
        } catch (error) {
            console.error("Error fetching operational cost data:", error.message);
            throw new Error("Failed to fetch operational cost data.");
        }
    }

    static async getYearlyEmissionsBySector() {
        try {
            await sql.connect(dbConfig);
            const query = `
                SELECT 
                    YEAR(EM.date) AS year,
                    F.sector_type AS sector_name,
                    SUM(S1.calculated_emissions + S2.location_based_emissions) AS yearly_emissions
                FROM Emissions_Master EM
                JOIN Facilities F ON EM.facility_id = F.facility_id
                JOIN Scope1_Emissions S1 ON EM.emission_id = S1.emission_id
                JOIN Scope2_Emissions S2 ON EM.emission_id = S2.emission_id
                GROUP BY YEAR(EM.date), F.sector_type
                ORDER BY year;
            `;

            const result = await sql.query(query);
            return result.recordset;
        } catch (error) {
            console.error("Error fetching yearly emissions data:", error.message);
            throw new Error("Failed to fetch yearly emissions data.");
        }
    }

    static async getSustainabilityGoals() {
        try {
            await sql.connect(dbConfig);
            const query = `
                SELECT 
                    target_description,
                    target_value,
                    target_date,
                    current_progress,
                    initiative_status
                FROM Sustainability_Goals;
            `;

            const result = await sql.query(query);
            return result.recordset;
        } catch (error) {
            console.error("Error fetching sustainability goals:", error.message);
            throw new Error("Failed to fetch sustainability goals.");
        }
    }
}

// **Export the class**
module.exports = Report;
