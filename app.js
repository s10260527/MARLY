const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // NEW: Add cookie-parser
const jwt = require("jsonwebtoken"); // NEW: Add jwt

const signupRouter = require('./Models/signup');
const loginRouter = require("./Models/login");
const emissioncontroller = require("./Controllers/emission");
const profileRouter = require("./Models/profile");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser()); // NEW: Use cookie-parser

// Serve static files (HTML, CSS, JS) from the "Public" directory
app.use(express.static("Public"));

// Centralized authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies

    if (!token) {
        return res.status(401).json({ message: "Access token required", redirectUrl: "/login.html" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token", redirectUrl: "/login.html" });
        }
        req.user = user; // Attach user info to request
        next();
    });
};

// API routes
app.use('/api', signupRouter);
app.use('/api', loginRouter);
app.use('/api/profile', authenticateToken, profileRouter); // NEW: Apply token authentication for profile route
app.get("/emission/totalemission", emissioncontroller.getTopEmissionsByCurrentMonth);
app.get("/emission/mostimproved", emissioncontroller.getMostImprovedByMonth);

app.listen(port, async () => {
    try {
        await sql.connect(dbConfig);
        console.log("Database connection success");
    } catch (err) {
        console.error("Database connection error", err);
        process.exit(1);
    }
    console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
    console.log("Server shutting down gracefully");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});
