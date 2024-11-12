const sql = require("mssql")
const dbConfig = require("../dbConfig");
const fetch = require('node-fetch');
require("dotenv").config()
class Company {
    constructor(company_id, company_name, industry_type,country, city, contact_email, contact_phone) {
        this.company_id = company_id;
        this.company_name = company_name;
        this.industry_type = industry_type;
        this.campaign_participant = campaign_participant,
        this.country = country;
        this.city = city;
        this.contact_email = contact_email;
        this.contact_phone = contact_phone;

    }
    //get all companies
    static async getAllCompanies() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Companies`; 

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new Volunteer(row.company_id, row.company_name, row.industry_type, row.campaign_participant ,row.country, row.city, row.contact_email, row.contact_phone )
        ) 
    }

    static async isCompanyParticipant(company_id) {
        try {
            await sql.connect(dbConfig);
    
            const sqlQuery = `
                SELECT campaign_participant
                FROM Companies
                WHERE company_id = @company_id;`;
    
            const request = new sql.Request();
            request.input("company_id", sql.Int, company_id);
    
            const result = await request.query(sqlQuery);
            sql.close();
    
            // Check if campaign_participant is 1 (true) for the company
            return result.recordset[0].campaign_participant;
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }
    
    static async updateCompanyParticipation(company_id, isParticipating = true) {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `
                UPDATE Companies
                SET campaign_participant = @campaign_participant
                WHERE company_id = @company_id;`;

            const request = new sql.Request();
            request.input("company_id", sql.Int, company_id);
            request.input("campaign_participant", sql.Bit, isParticipating);

            const result = await request.query(sqlQuery);
            sql.close();

            if (result.rowsAffected > 0) {
                console.log(`Successfully updated company ${company_id} participation status.`);
                return true;
            } else {
                console.log(`No company found with ID ${company_id}.`);
                return false;
            }
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }

}




module.exports = Company;