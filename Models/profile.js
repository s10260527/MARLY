const express = require("express");
const sql = require("mssql");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware to parse JSON data
router.use(express.json());

// Profile route for the current user's company data
router.get("/current", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Query to get the company details using the user_id
        const getCompanyQuery = `
            SELECT 
                c.company_name, 
                c.industry_type, 
                c.contact_email, 
                c.country, 
                c.city, 
                c.contact_phone, 
                FORMAT(c.created_at, 'dd/MM/yyyy') AS formatted_created_at
            FROM Companies c
            WHERE c.user_id = @UserId
        `;
        const request = new sql.Request();
        request.input("UserId", sql.Int, userId);

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
            city: company.city,
            contactPhone: company.contact_phone,
        };

        res.status(200).json(profileData);
    } catch (error) {
        console.error("Profile retrieval error:", error);
        res.status(500).json({ message: "An error occurred while retrieving the profile" });
    }
});

module.exports = router;
