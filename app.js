const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // NEW: Add cookie-parser
const jwt = require("jsonwebtoken"); // NEW: Add jwt
const bcrypt = require("bcryptjs"); // NEW: Add bcrypt

const signupRouter = require('./Models/signup');
const loginRouter = require("./Models/login");
const emissionController = require("./Controllers/emission");
const profileRouter = require("./Models/profile");
const verifyToken = require("./Middleware/authMiddleware"); // Import the JWT verification middleware

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // Allow credentials for CORS
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser

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
app.use('/api/signup', signupRouter); // Signup route
app.use('/api/login', loginRouter); // Login route
app.use('/api/profile', authenticateToken, profileRouter); // Profile route with token authentication

// Emission-related routes
app.get("/api/emission/totalemission", emissionController.getTopEmissionsByCurrentMonth);
app.get("/api/emission/mostimproved", emissionController.getMostImprovedByMonth);

// Serve static files (HTML, CSS, JS) from the "Public" directory
app.use(express.static("Public"));

// Redirect to profile after successful login
app.post('/api/login', async (req, res) => {
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
        console.error("Login error", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

// Start server
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

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Server shutting down gracefully");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});
