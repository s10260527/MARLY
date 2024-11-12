const express = require("express");
const sql = require("mssql");
const router = express.Router();

// Middleware to parse JSON data
router.use(express.json());

// Profile route
router.get("/:companyId", async (req, res) => {
    try {
        const companyId = req.params.companyId;

        // Query to get the company details using company ID from the request parameter
        const getCompanyQuery = `
            SELECT company_name, industry_type, contact_email, country, city, FORMAT(created_at, 'dd/MM/yyyy') AS formatted_created_at 
            FROM Companies
            WHERE company_id = @CompanyId
        `;
        const request = new sql.Request();
        request.input("CompanyId", sql.Int, companyId);

        const companyResult = await request.query(getCompanyQuery);

        if (companyResult.recordset.length === 0) {
            return res.status(404).json({ message: "Company data not found" });
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
