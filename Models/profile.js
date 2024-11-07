// profile.js
const express = require("express");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const router = express.Router();

// Middleware to parse JSON data
router.use(express.json());

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Access token required", redirectUrl: "/login.html" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token", redirectUrl: "/login.html" });
        }
        req.user = user;
        next();
    });
};

// Profile route
router.get("/profile", authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Query to get user details from the Users table
        const getUserQuery = "SELECT user_id, full_name, email, FORMAT(created_at, 'dd/MM/yyyy') AS formatted_created_at FROM Users WHERE user_id = @UserId";
        const request = new sql.Request();
        request.input("UserId", sql.Int, userId);
        const userResult = await request.query(getUserQuery);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userResult.recordset[0];
        const profileData = {
            companyName: user.full_name,
            joined: user.formatted_created_at,
            businessEmail: user.email
        };

        res.status(200).json(profileData);
    } catch (error) {
        console.error("Profile retrieval error", error);
        res.status(500).json({ message: "An error occurred while retrieving the profile" });
    }
});

module.exports = router;
