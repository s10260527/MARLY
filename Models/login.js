const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const router = express.Router();

// Middleware to parse JSON data
router.use(express.json());

// Login route
router.post("/", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Check if the user exists
        const checkUserQuery = "SELECT * FROM Users WHERE email = @Email";
        const request = new sql.Request();
        request.input("Email", sql.VarChar, email);
        const userResult = await request.query(checkUserQuery);

        if (userResult.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = userResult.recordset[0];

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Send response
        res.status(200).json({
            message: "Login successful",
            token, // Send the token to the frontend
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

module.exports = router;
