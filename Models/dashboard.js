const express = require("express");
const router = express.Router();
const sql = require("mssql");
const jwt = require("jsonwebtoken");

// Middleware to parse JSON bodies
router.use(express.json());

// Paginated dashboard data route
router.get("/data/paginated", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header is missing" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = parseInt(req.query.offset, 10) || 0;

        const companyQuery = `
            SELECT c.company_id, c.company_name
            FROM Companies c
            INNER JOIN Facilities f ON f.company_id = c.company_id
            INNER JOIN Users u ON u.facility_id = f.facility_id
            WHERE u.user_id = @UserId
        `;
        const companyReq = new sql.Request();
        companyReq.input("UserId", sql.Int, userId);

        const companyResult = await companyReq.query(companyQuery);
        if (companyResult.recordset.length === 0) {
            return res.status(404).json({ message: "No company found for this user" });
        }

        const companyId = companyResult.recordset[0].company_id;

        const dashboardQuery = `
            SELECT 
                em.total_gross_emissions AS emissions,
                uc.consumption_amount AS energy,
                oc.amount AS costs,
                em.date AS emission_date
            FROM Facilities f
            LEFT JOIN Emissions_Master em ON f.facility_id = em.facility_id
            LEFT JOIN Utility_Costs uc ON f.facility_id = uc.facility_id
            LEFT JOIN Operational_Costs_Master oc ON f.facility_id = oc.facility_id
            WHERE f.company_id = @CompanyId
            ORDER BY em.date DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
        `;
        const dashboardReq = new sql.Request();
        dashboardReq.input("CompanyId", sql.Int, companyId);
        dashboardReq.input("Limit", sql.Int, limit);
        dashboardReq.input("Offset", sql.Int, offset);

        const dashboardResult = await dashboardReq.query(dashboardQuery);

        if (dashboardResult.recordset.length === 0) {
            return res.status(404).json({ message: "No data found for this query" });
        }

        res.status(200).json({
            data: dashboardResult.recordset,
            limit,
            offset,
        });
    } catch (error) {
        console.error("Error in paginated data route:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
