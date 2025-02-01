const sql = require("mssql");
const dbConfig = require("../dbConfig");

class LeaderBoard {
    // Other constructor and methods...

    // Method to get top 3 companies by recycled devices for a given month and year
    static async getTop3CompaniesByRecycledDevices(month, year) {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `
                SELECT TOP 3 post_id, company_id, company_name, poster_url, poster_name, likes, poster_img, post_date
                FROM Post_Details
                WHERE 
                    MONTH(post_date) = 1  -- Filter for January (1 is the month for January)
                ORDER BY likes DESC;

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