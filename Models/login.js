const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const router = express.Router();

// Middleware to parse JSON data
router.use(express.json());

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Check if the company exists
        const checkCompanyQuery = "SELECT * FROM Companies WHERE contact_email = @ContactEmail";
        const checkCompanyRequest = new sql.Request();
        checkCompanyRequest.input("ContactEmail", sql.VarChar, email);
        const companyResult = await checkCompanyRequest.query(checkCompanyQuery);

        if (companyResult.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const company = companyResult.recordset[0];

        // Compare the password
        const isMatch = await bcrypt.compare(password, company.hashed_password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign({ companyId: company.company_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set the token in a cookie to be used in other pages
        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({ message: "Login successful", success: true, redirectUrl: "/dashboard.html" });
    } catch (error) {
        console.error("Login error", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

module.exports = router;
