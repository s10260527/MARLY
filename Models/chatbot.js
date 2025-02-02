const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Chatbot {
    // Other constructor and methods...

    static async getAllSqlTables() {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `
                SELECT * FROM companies WHERE company_Id = 1;
                SELECT TOP 50 * FROM Production_Lines;
                SELECT TOP 50 * FROM Equipment;
                SELECT TOP 50 * FROM Emissions_Master;
                SELECT TOP 50 * FROM Operational_Costs_Master;
                SELECT TOP 50 * FROM Maintenance_Costs;
                SELECT TOP 50 * FROM Sustainability_Goals;


            `;

            const request = new sql.Request();
            const result = await request.query(sqlQuery);

            // The result object will have each table's data in separate recordsets.
            // Extracting all recordsets into a single array.
            const allResults = result.recordsets; // Array of recordsets for each table
            sql.close();

            return allResults;
        } catch (error) {
            console.error("Database error:", error);
            throw new Error("Error retrieving SQL details");
        }
    }
}

module.exports = Chatbot;
