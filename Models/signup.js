// signup.js
const express = require("express");
const bcrypt = require("bcryptjs");
const sql = require("mssql");
const router = express.Router();

// Middleware to parse JSON data
router.use(express.json());

// Signup route
router.post("/", async (req, res) => {
    const {
        company_name,
        contact_email,
        password,
        industry_type,
        country,
        city,
        contact_phone,
    } = req.body;

    // Validate required fields
    if (!company_name || !contact_email || !password || !industry_type || !country || !city || !contact_phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if the company already exists
        const checkCompanyQuery = "SELECT * FROM Companies WHERE contact_email = @ContactEmail";
        const checkCompanyRequest = new sql.Request();
        checkCompanyRequest.input("ContactEmail", sql.VarChar, contact_email);
        const companyResult = await checkCompanyRequest.query(checkCompanyQuery);

        if (companyResult.recordset.length > 0) {
            return res.status(400).json({ message: "A company with this email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new company into the database
        const insertCompanyQuery = `
            INSERT INTO Companies (company_name, industry_type, country, city, contact_email, contact_phone, hashed_password, created_at)
            VALUES (@CompanyName, @IndustryType, @Country, @City, @ContactEmail, @ContactPhone, @HashedPassword, GETDATE())
        `;
        const insertCompanyRequest = new sql.Request();
        insertCompanyRequest.input("CompanyName", sql.VarChar, company_name);
        insertCompanyRequest.input("IndustryType", sql.VarChar, industry_type);
        insertCompanyRequest.input("Country", sql.VarChar, country);
        insertCompanyRequest.input("City", sql.VarChar, city);
        insertCompanyRequest.input("ContactEmail", sql.VarChar, contact_email);
        insertCompanyRequest.input("ContactPhone", sql.VarChar, contact_phone);
        insertCompanyRequest.input("HashedPassword", sql.VarChar, hashedPassword);

        await insertCompanyRequest.query(insertCompanyQuery);

        res.status(201).json({ message: "Company registered successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "An error occurred during signup" });
    }
});

module.exports = router;
