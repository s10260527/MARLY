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

     // CREATE a new emission record
     static async createEmission(emissionData) {
        try {
            await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Emissions (company_id, emission_year, emission_amount, created_at)
                VALUES (@company_id, @emission_year, @emission_amount, GETDATE())
            `;
            const request = new sql.Request();
            request.input("company_id", sql.Int, emissionData.company_id);
            request.input("emission_year", sql.Int, emissionData.emission_year);
            request.input("emission_amount", sql.Float, emissionData.emission_amount);
            await request.query(sqlQuery);
            sql.close();
        } catch (error) {
            console.error(error);
            throw new Error("Error creating emission record");
        }
    }
    // UPDATE an existing emission record
    static async updateEmission(id, updatedData) {
        try {
            await sql.connect(dbConfig);
            const sqlQuery = `
                UPDATE Emissions 
                SET emission_amount = @emission_amount, emission_year = @emission_year
                WHERE emission_id = @emission_id
            `;
            const request = new sql.Request();
            request.input("emission_id", sql.Int, id);
            request.input("emission_year", sql.Int, updatedData.emission_year);
            request.input("emission_amount", sql.Float, updatedData.emission_amount);
            await request.query(sqlQuery);
            sql.close();
        } catch (error) {
            console.error(error);
            throw new Error("Error updating emission record");
        }
    }
    
}

module.exports = Emission;
