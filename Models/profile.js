const express = require("express");
const sql = require("mssql");
const router = express.Router();

// Middleware to parse JSON data
router.use(express.json());

// Profile route (no authentication)
router.get("/profile", async (req, res) => {
    try {
        // Query to get the first company entry in the Companies table
        const getCompanyQuery = `
            SELECT TOP 1 company_name, industry_type, contact_email, country, city, FORMAT(created_at, 'dd/MM/yyyy') AS formatted_created_at 
            FROM Companies
            ORDER BY company_id ASC
        `;
        const request = new sql.Request();
        const companyResult = await request.query(getCompanyQuery);

        if (companyResult.recordset.length === 0) {
            return res.status(404).json({ message: "No company data found" });
        }

        const company = companyResult.recordset[0];
        const profileData = {
            companyName: company.company_name,
            industryType: company.industry_type,
            joined: company.formatted_created_at,
            businessEmail: company.contact_email,
            country: company.country,
            city: company.city
        };

        res.status(200).json(profileData);
    } catch (error) {
        console.error("Profile retrieval error", error);
        res.status(500).json({ message: "An error occurred while retrieving the profile" });
    }
});

module.exports = router;
