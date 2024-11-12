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
const verifyToken = require("./Middleware/authMiddleware");

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

// Redirect to profile after successful login (Avoid duplicate routes with loginRouter)
app.post('/api/login/custom', async (req, res) => {
    const { email, password } = req.body;
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
        const isMatch = await bcrypt.compare(password, company.hashed_password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign({ companyId: company.company_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set the token in a cookie to be used in other pages
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

        // Return response with company ID to be saved in local storage
        res.status(200).json({
            message: "Login successful",
            success: true,
            redirectUrl: "/profile.html",
            companyId: company.company_id
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

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
const server = app.listen(port, async () => {
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

// Increase server timeout to 120 seconds
server.timeout = 120000; 

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Server shutting down gracefully");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});
