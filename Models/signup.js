const express = require("express");
const bcrypt = require("bcryptjs");
const sql = require("mssql");
const router = express.Router();

// Middleware to parse JSON data
router.use(express.json());

// Signup route
router.post("/", async (req, res) => {
    const {
        username,
        email,
        password,
        role
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if the user already exists
        const checkUserQuery = "SELECT * FROM Users WHERE email = @Email";
        const checkUserRequest = new sql.Request();
        checkUserRequest.input("Email", sql.VarChar, email);
        const userResult = await checkUserRequest.query(checkUserQuery);

        if (userResult.recordset.length > 0) {
            return res.status(400).json({ message: "A user with this email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Get the next facility ID
        const getMaxFacilityIdQuery = "SELECT ISNULL(MAX(facility_id), 0) + 1 AS nextFacilityId FROM Users";
        const facilityIdResult = await new sql.Request().query(getMaxFacilityIdQuery);
        const facilityId = facilityIdResult.recordset[0].nextFacilityId;

        // Get the next department ID
        const getMaxDepartmentIdQuery = "SELECT ISNULL(MAX(department_id), 0) + 1 AS nextDepartmentId FROM Users";
        const departmentIdResult = await new sql.Request().query(getMaxDepartmentIdQuery);
        const departmentId = departmentIdResult.recordset[0].nextDepartmentId;

        // Insert new user into the database
        const insertUserQuery = `
            INSERT INTO Users (username, email, password_hash, role, department_id, facility_id, created_at, updated_at)
            VALUES (@Username, @Email, @PasswordHash, @Role, @DepartmentId, @FacilityId, GETDATE(), GETDATE())
        `;
        const insertUserRequest = new sql.Request();
        insertUserRequest.input("Username", sql.VarChar, username);
        insertUserRequest.input("Email", sql.VarChar, email);
        insertUserRequest.input("PasswordHash", sql.VarChar, hashedPassword);
        insertUserRequest.input("Role", sql.VarChar, role);
        insertUserRequest.input("DepartmentId", sql.Int, departmentId);
        insertUserRequest.input("FacilityId", sql.Int, facilityId);

        await insertUserRequest.query(insertUserQuery);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "An error occurred during signup" });
    }
});

module.exports = router;
