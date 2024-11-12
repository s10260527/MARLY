const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Campaign {
    constructor(campaign_id, company_id, campaign_name, description, target_amount, start_date, end_date, created_at) {
        this.campaign_id = campaign_id;
        this.company_id = company_id;
        this.campaign_name = campaign_name;
        this.description = description;
        this.target_amount = target_amount;
        this.start_date = start_date;
        this.end_date = end_date;
        this.created_at = created_at;
    }

    // Method to check if a company is a participant of a campaign
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
            return result.recordset[0].campaign_participant === 1;
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }
    

    // Method to get a campaign by its ID
    static async getCampaignById(campaign_id) {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `SELECT * FROM Campaigns WHERE campaign_id = @campaign_id`;

            const request = new sql.Request();
            request.input("campaign_id", sql.Int, campaign_id);
            const result = await request.query(sqlQuery);

            sql.close();

            const campaign = result.recordset[0];
            return campaign
                ? new Campaign(
                    campaign.campaign_id,
                    campaign.company_id,
                    campaign.campaign_name,
                    campaign.description,
                    campaign.target_amount,
                    campaign.start_date,
                    campaign.end_date,
                    campaign.created_at
                  )
                : null;
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }

    // Method to get all campaigns for a specific company
    static async getCampaignsByCompanyId(company_id) {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `SELECT * FROM Campaigns WHERE company_id = @company_id ORDER BY created_at DESC`;

            const request = new sql.Request();
            request.input("company_id", sql.Int, company_id);
            const result = await request.query(sqlQuery);

            sql.close();

            return result.recordset.map(campaign => new Campaign(
                campaign.campaign_id,
                campaign.company_id,
                campaign.campaign_name,
                campaign.description,
                campaign.target_amount,
                campaign.start_date,
                campaign.end_date,
                campaign.created_at
            ));
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }
}

module.exports = Campaign;
