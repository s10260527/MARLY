// signup.js
const express = require("express");
const bcrypt = require("bcryptjs");
const sql = require("mssql");

const router = express.Router();

// Middleware to parse JSON data
router.use(express.json());

// Signup route
router.post("/signup", async (req, res) => {
    const { full_name, email, password, agreed_to_terms } = req.body;

    // Validate required fields
    if (!full_name || !email || !password || agreed_to_terms === undefined) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if the user already exists
        const checkUserQuery = "SELECT * FROM Users WHERE email = @Email";
        const checkUserRequest = new sql.Request();
        checkUserRequest.input("Email", sql.VarChar, email);
        const userResult = await checkUserRequest.query(checkUserQuery);

        if (userResult.recordset.length > 0) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user into the database
        const insertUserQuery = `
            INSERT INTO Users (full_name, email, password_hash, agreed_to_terms)
            VALUES (@FullName, @Email, @PasswordHash, @AgreedToTerms)
        `;
        const insertUserRequest = new sql.Request();
        insertUserRequest.input("FullName", sql.VarChar, full_name);
        insertUserRequest.input("Email", sql.VarChar, email);
        insertUserRequest.input("PasswordHash", sql.VarChar, hashedPassword);
        insertUserRequest.input("AgreedToTerms", sql.Bit, agreed_to_terms);

        await insertUserRequest.query(insertUserQuery);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup error", error);
        res.status(500).json({ message: "An error occurred during signup" });
    }
});

module.exports = router;
