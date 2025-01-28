// routes/dashboard.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");
const jwt = require("jsonwebtoken");

// Parse JSON bodies in this router
router.use(express.json());

router.get("/data", async (req, res) => {
  try {
    // 1) Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn("Authorization header is missing");
      return res.status(401).json({ message: "Authorization header is required" });
    }

    // 2) Extract and validate token
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.warn("Malformed authorization header");
      return res.status(401).json({ message: "Malformed authorization header" });
    }

    // DEBUG: Log the token for verification
    console.log("Token received:", token);

    // 3) Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.log("3")
      console.error("JWT verification failed:", err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    const userId = decoded.userId;
    console.log(`User ID from token: ${userId}`);

    // 4) Fetch the company linked to the user
    const companyQuery = `
      SELECT c.company_id, c.company_name
      FROM Companies c
      INNER JOIN Facilities f ON f.company_id = c.company_id
      INNER JOIN Users u ON u.facility_id = f.facility_id
      WHERE u.user_id = @UserId
    `;
    console.log("Executing company query...");
    const companyReq = new sql.Request();
    companyReq.input("UserId", sql.Int, userId);

    let companyResult;
    try {
      companyResult = await companyReq.query(companyQuery);
    } catch (err) {
      console.error("Error executing company query:", err.message);
      return res.status(500).json({ message: "Database error during company query" });
    }

    if (companyResult.recordset.length === 0) {
      console.warn(`No company found for user ID: ${userId}`);
      return res.status(404).json({ message: "No company found for this user" });
    }

    const companyId = companyResult.recordset[0].company_id;
    const companyName = companyResult.recordset[0].company_name;
    console.log(`Company found: ${companyName} (ID: ${companyId})`);

    // 5) Fetch dashboard data
    const dashboardQuery = `
      SELECT 
          ISNULL(SUM(em.total_gross_emissions), 0) AS totalEmissions,
          ISNULL(SUM(uc.consumption_amount), 0) AS totalEnergyConsumption,
          ISNULL(SUM(oc.amount), 0) AS totalOperationalCosts
      FROM Facilities f
        LEFT JOIN Emissions_Master em ON f.facility_id = em.facility_id
        LEFT JOIN Utility_Costs uc ON f.facility_id = uc.facility_id
        LEFT JOIN Operational_Costs_Master oc ON f.facility_id = oc.facility_id
      WHERE f.company_id = @CompanyId
    `;
    console.log("Executing dashboard query...");
    const dashboardReq = new sql.Request();
    dashboardReq.input("CompanyId", sql.Int, companyId);

    let dashboardResult;
    try {
      dashboardResult = await dashboardReq.query(dashboardQuery);
    } catch (err) {
      console.error("Error executing dashboard query:", err.message);
      return res.status(500).json({ message: "Database error during dashboard query" });
    }

    if (dashboardResult.recordset.length === 0) {
      console.warn(`No dashboard data found for company ID: ${companyId}`);
      return res.status(404).json({ message: "No dashboard data found" });
    }

    const row = dashboardResult.recordset[0];
    console.log("Dashboard data retrieved successfully:", row);

    // DEBUG: Log the result of the dashboard query
    console.log("Dashboard query result:", dashboardResult.recordset);

    // 6) Return the data to the client
    return res.status(200).json({
      companyName,
      totalEmissions: row.totalEmissions || 0,
      totalEnergyConsumption: row.totalEnergyConsumption || 0,
      totalOperationalCosts: row.totalOperationalCosts || 0,
    });
  } catch (error) {
    console.error("Unexpected error in /data route:", error.message);
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn("JWT error:", error.message);
      console.log("2")
      return res.status(403).json({ message: "Invalid token" });
     
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Helper function to extract and log SQL parameters for debugging
function logSqlParams(request) {
  request.parameters.forEach((param) => {
    console.log(`SQL Parameter - Name: ${param.name}, Type: ${param.type}, Value: ${param.value}`);
  });
}

module.exports = router;
