// login.js
const express = require("express");
const bcrypt = require("bcryptjs");
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
        // Check if the user exists
        const checkUserQuery = "SELECT * FROM Users WHERE email = @Email";
        const checkUserRequest = new sql.Request();
        checkUserRequest.input("Email", sql.VarChar, email);
        const userResult = await checkUserRequest.query(checkUserQuery);

        if (userResult.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = userResult.recordset[0];

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(200).json({ message: "Login successful", redirectUrl: "/index.html" });
    } catch (error) {
        console.error("Login error", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

module.exports = router;
