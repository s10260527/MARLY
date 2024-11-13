const sql = require("mssql");
const dbConfig = require("../dbConfig");

class RecyclableDevice {
    constructor(device_id, device_name, carbon_offset) {
        this.device_id = device_id;
        this.device_name = device_name;
        this.carbon_offset = carbon_offset;
    }


    // Method to add a recycled device record for a company with quantity
    static async addRecycledDeviceRecord(campaign_id, company_id, device_id, quantity, start_date, end_date) {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `
                INSERT INTO Campaign_participants (campaign_id, company_id, device_id, quantity, start_date, end_date)
                VALUES (@campaign_id, @company_id, @device_id, @quantity, @start_date, @end_date);
            `;

            const request = new sql.Request();
            request.input("campaign_id", sql.Int, campaign_id);
            request.input("company_id", sql.Int, company_id);
            request.input("device_id", sql.Int, device_id);
            request.input("quantity", sql.Int, quantity);
            request.input("start_date", sql.Date, start_date);
            request.input("end_date", sql.Date, end_date);

            await request.query(sqlQuery);
            sql.close();

            return { success: true, message: "Recycled device record added successfully." };
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }

    // Method to update the quantity of a recycled device record for a company
    static async updateRecycledDeviceQuantity(campaign_id, company_id, device_id, new_quantity) {
        try {
            await sql.connect(dbConfig);
    
            // Insert a new row into the Campaign_participants table
            const insertQuery = `
                INSERT INTO Campaign_participants (campaign_id, company_id, device_id, quantity)
                VALUES (@campaign_id, @company_id, @device_id, @new_quantity);
            `;
    
            const request = new sql.Request();
            request.input("campaign_id", sql.Int, campaign_id);
            request.input("company_id", sql.Int, company_id);
            request.input("device_id", sql.Int, device_id);
            request.input("new_quantity", sql.Int, new_quantity);
    
            const result = await request.query(insertQuery);
            sql.close();
    
            if (result.rowsAffected[0] > 0) {
                return { success: true, message: "New entry added to recycled device quantity successfully." };
            } else {
                return { success: false, message: "Failed to add new entry." };
            }
        } catch (error) {
            console.error(error);
            throw new Error("Database error");
        }
    }
    
    
    
    
    static async getDeviceIdByName(deviceName) {
        try {
            await sql.connect(dbConfig);

            const sqlQuery = `
                SELECT device_id 
                FROM Recycable_device 
                WHERE device_name = @device_name;
            `;

            const request = new sql.Request();
            request.input("device_name", sql.VarChar, deviceName);
            
            const result = await request.query(sqlQuery);
            sql.close();

            return result.recordset[0] ? result.recordset[0].device_id : null;
        } catch (error) {
            console.error(error);
            throw new Error("Database error while fetching device ID by name");
        }
    }

}

module.exports = RecyclableDevice;
