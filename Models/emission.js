const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Emission {
    constructor(emission_id, company_id, emission_year, emission_amount, created_at) {
        this.emission_id = emission_id;
        this.company_id = company_id;
        this.emission_year = emission_year;
        this.emission_amount = emission_amount;
        this.created_at = created_at;
    }

    static async getEmissionById(id) {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `SELECT * FROM Emissions WHERE company_id = @company_id`;

            const request = new sql.Request();
            request.input("company_id", sql.Int, id);
            const result = await request.query(sqlQuery);

            sql.close();

            const emission = result.recordset[0];
            return emission
                ? new Emission(
                    emission.emission_id,
                    emission.company_id,
                    emission.emission_year,
                    emission.emission_amount,
                    emission.created_at
                  )
                : null;
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }

    static async getAllEmissionByCurrentMonth() {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `SELECT * FROM Emissions WHERE MONTH(created_at) = MONTH(GETDATE()) AND YEAR(created_at) = YEAR(GETDATE());`;

            const request = new sql.Request();
            const result = await request.query(sqlQuery);

            sql.close();

            // Map the result to an array of Emission instances
            return result.recordset.map(emission => new Emission(
                emission.emission_id,
                emission.company_id,
                emission.emission_year,
                emission.emission_amount,
                emission.created_at
            ));
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }
}

module.exports = Emission;
