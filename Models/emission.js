const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Emission {
    constructor(emission_id, company_id, emission_type, period_id, amount) {
        this.emission_id = emission_id;
        this.company_id = company_id;
        this.emission_type = emission_type;
        this.period_id = period_id;
        this.amount = amount;
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
                    emission.emission_type,  // This will now directly show the type
                    emission.period_id,
                    emission.amount
                  )
                : null;
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }
}

module.exports = Emission;
