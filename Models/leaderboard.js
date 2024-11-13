const sql = require("mssql");
const dbConfig = require("../dbConfig");

class LeaderBoard {
    // Other constructor and methods...

    // Method to get top 3 companies by recycled devices for a given month and year
    static async getTop3CompaniesByRecycledDevices(month, year) {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `
                SELECT TOP 3 c.company_id, c.company_name, SUM(cp.quantity) AS total_recycled_devices
                FROM Companies c
                JOIN Campaign_participants cp ON c.company_id = cp.company_id
                JOIN Campaigns cam ON cp.campaign_id = cam.campaign_id
                WHERE MONTH(cam.start_date) = @month AND YEAR(cam.start_date) = @year
                GROUP BY c.company_id, c.company_name
                ORDER BY total_recycled_devices DESC;
            `;

            const request = new sql.Request();
            request.input("month", sql.Int, month);
            request.input("year", sql.Int, year);

            const result = await request.query(sqlQuery);
            sql.close();

            return result.recordset;
        } catch (error) {
            console.error("Database error:", error);
            throw new Error("Error retrieving top 3 companies by recycled devices");
        }
    }
}

module.exports = LeaderBoard;
