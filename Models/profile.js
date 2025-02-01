// Models/profile.js
const express = require("express");
const sql = require("mssql");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dbConfig = require("../dbConfig");

// Middleware to parse JSON data
router.use(express.json());

// GET /api/profile/current
router.get("/current", async (req, res) => {
  try {
    // 1) Confirm there's a token in Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // 2) Verify & decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // e.g., 1

    // 3) Connect to DB and build query
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    // NOTE: We now assume `userId` == `company_id`.
    // So we match c.company_id to the userId from the token
    const getCompanyQuery = `
      SELECT
        c.company_id,
        c.company_name,
        c.registration_number,
        c.company_size,
        c.annual_revenue_range,
        FORMAT(c.established_date, 'yyyy-MM-dd') AS established_date,
        c.headquarters_location,
        c.sustainability_commitment_level,
        c.baseline_year,
        c.campaign_participant,
        FORMAT(c.created_at, 'dd/MM/yyyy HH:mm:ss') AS created_at,
        FORMAT(c.updated_at, 'dd/MM/yyyy HH:mm:ss') AS updated_at
      FROM Companies c
      WHERE c.company_id = @UserId
    `;
    request.input("UserId", sql.Int, userId);

    // 4) Run query & handle results
    const result = await request.query(getCompanyQuery);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Company data not found" });
    }

    const row = result.recordset[0];
    const profileData = {
      companyId: row.company_id,
      companyName: row.company_name,
      registrationNumber: row.registration_number,
      companySize: row.company_size,
      annualRevenueRange: row.annual_revenue_range,
      establishedDate: row.established_date,
      headquartersLocation: row.headquarters_location,
      sustainabilityCommitmentLevel: row.sustainability_commitment_level,
      baselineYear: row.baseline_year,
      campaignParticipant: row.campaign_participant,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ message: "An error occurred while retrieving the profile" });
  }
});

module.exports = router;
