// app.js
const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const signupRouter = require('./Models/signup');
const loginRouter = require("./Models/login");
const emissionController = require("./Controllers/emission");
const profileRouter = require("./Models/profile");
const verifyToken = require("./Middleware/authMiddleware"); // Import the JWT verification middleware
const companycontroller = require("./Controllers/company");
const inputcontroller = require("./Controllers/input");
const leaderboardcontroller= require("./Controllers/leaderboard");
const reportController = require('./Controllers/report');


require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());

// Centralized authentication middleware
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

// API routes
app.use('/api/signup', signupRouter); // Signup route
app.use('/api/login', loginRouter); // Login route
app.use('/api/profile', authenticateToken, profileRouter); // Profile route with token authentication

// Emission-related routes
app.get("/api/emission/totalemission", emissionController.getTopEmissionsByCurrentMonth);
app.get("/api/emission/mostimproved", emissionController.getMostImprovedByMonth);

// Serve static files (HTML, CSS, JS) from the "Public" directory
app.use(express.static("Public"));

// Test database connection endpoint (For debugging)
app.get('/api/test-db', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT 1 AS result');
        res.status(200).json({ message: 'Database connection is successful', result: result.recordset });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ message: 'Database connection failed', error: err.message });
    }
});

// Start server
// Campaign routes
app.get("/campaign/isParticipant/:id", companycontroller.checkIsParticipant);
app.patch("/campaign/updateParticipationStatus/:id", companycontroller.updateCompanyParticipation);
app.patch("/campaign/updateParticipationStatus/:id", companycontroller.updateCompanyParticipation);

//input routes
app.get("/input/getDeviceId/:device_name", inputcontroller.getDeviceIdByName);
app.post('/input/updateRecycledDeviceQuantity', inputcontroller.updateRecycledDeviceQuantity);

//Leaderboard routes
app.get("/leaderboard/top3", leaderboardcontroller.displayTop3CompaniesForCurrentMonth);

// Report-related routes
app.get("/api/report/emissions-by-sector", reportController.getEmissionsBySector);
app.get("/api/report/energy-consumption-by-sector", reportController.getEnergyConsumptionBySector);
app.get("/api/report/operational-cost-by-month", reportController.getOperationalCostByMonth);
app.get("/api/report/yearly-emissions-by-sector", reportController.getYearlyEmissionsBySector);


app.listen(port, async () => {
    try {
        await sql.connect({
            ...dbConfig,
            options: {
                encrypt: true,
                enableArithAbort: true,
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000,
            }
        });
        console.log("Database connection success");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
    console.log(`Server listening on port ${port}`);
});


// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Server shutting down gracefully");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});