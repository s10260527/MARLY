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

    static async getTopEmissionsByCurrentMonth() {
        try {
            await sql.connect(dbConfig);
    
            const sqlQuery = `
                SELECT c.company_id, c.company_name, SUM(e.emission_amount) AS total_emission
                FROM Emissions e
                JOIN Companies c ON e.company_id = c.company_id
                WHERE MONTH(e.created_at) = MONTH(GETDATE()) AND YEAR(e.created_at) = YEAR(GETDATE())
                GROUP BY c.company_id, c.company_name
                ORDER BY total_emission ASC
                OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;`; // Get the top 10
    
            const request = new sql.Request();
            const result = await request.query(sqlQuery);
    
            sql.close();
    
            return result.recordset; // Returns an array of companies with their emissions
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }
    static async getMostImprovedByMonth() {
        try {
            await sql.connect(dbConfig);
    
            const sqlQuery = `
                WITH EmissionChanges AS (
                    SELECT 
                        e1.company_id,
                        c.company_name,
                        e1.emission_amount AS oct_emission,
                        e2.emission_amount AS nov_emission,
                        ((e1.emission_amount - e2.emission_amount) / NULLIF(e1.emission_amount, 0)) * 100 AS percentage_improvement
                    FROM 
                        Emissions e1
                    JOIN 
                        Emissions e2 ON e1.company_id = e2.company_id 
                                     AND e1.emission_year = 2024 
                                     AND e2.emission_year = 2024
                                     AND MONTH(e1.created_at) = 10  -- October
                                     AND MONTH(e2.created_at) = 11  -- November
                    JOIN 
                        Companies c ON e1.company_id = c.company_id
                )
                SELECT TOP 10 
                    company_name,
                    oct_emission,
                    nov_emission,
                    percentage_improvement
                FROM 
                    EmissionChanges
                ORDER BY 
                    percentage_improvement DESC;`; // Get the top 10
    
            const request = new sql.Request();
            const result = await request.query(sqlQuery);
    
            sql.close();
    
            return result.recordset; // Returns an array of companies with their emissions
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
