const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Route imports
const authRoutes = require("./Models/auth");
const signupRouter = require("./Models/signup");
const loginRouter = require("./Models/login");
const emissionController = require("./Controllers/emission");
const profileRouter = require("./Models/profile");
const companycontroller = require("./Controllers/company");
const inputcontroller = require("./Controllers/input");
const leaderboardcontroller = require("./Controllers/leaderboard");
const reportController = require("./Controllers/report");
const dashboardRouter = require("./Models/dashboard");
const dashboardController = require("./Controllers/dashboardController");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ credentials: true, origin: "http://127.0.0.1:3000" }));
app.use(express.json());
app.use(cookieParser());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/dashboard", authenticateToken, dashboardRouter);
app.get("/api/dashboard/data", authenticateToken, dashboardController.getDashboardData);
app.use("/api/profile", authenticateToken, profileRouter);
app.get("/api/profile/current", authenticateToken, (req, res) => {
  res.redirect("/api/profile");
});

app.get("/api/emission/totalemission", authenticateToken, emissionController.getTopEmissionsByCurrentMonth);
app.get("/api/emission/mostimproved", authenticateToken, emissionController.getMostImprovedByMonth);
app.get("/campaign/isParticipant/:id", companycontroller.checkIsParticipant);
app.patch("/campaign/updateParticipationStatus/:id", companycontroller.updateCompanyParticipation);
app.get("/input/getDeviceId/:device_name", inputcontroller.getDeviceIdByName);
app.post("/input/updateRecycledDeviceQuantity", inputcontroller.updateRecycledDeviceQuantity);
app.get("/leaderboard/top3", leaderboardcontroller.displayTop3CompaniesForCurrentMonth);

// Report Routes
app.get("/api/report/emissions-by-sector", authenticateToken, reportController.getEmissionsBySector);
app.get("/api/report/energy-consumption-by-sector", authenticateToken, reportController.getEnergyConsumptionBySector);
app.get("/api/report/operational-cost-by-month", authenticateToken, reportController.getOperationalCostByMonth);
app.get("/api/report/yearly-emissions-by-sector", authenticateToken, reportController.getYearlyEmissionsBySector);

// 1) Add route for /api/dashboard/data/paginated
app.get("/api/dashboard/data/paginated", authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    let pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
      SELECT TOP(${limit}) 
        CONVERT(varchar(10), em.date, 120) AS emission_date,
        CAST(em.total_gross_emissions AS DECIMAL(10,2)) AS emissions,
        (SELECT SUM(consumption_amount) 
         FROM Utility_Costs u 
         WHERE u.facility_id = em.facility_id 
           AND u.billing_period = em.date
        ) AS energy,
        (SELECT SUM(amount)
         FROM Operational_Costs_Master o
         WHERE o.facility_id = em.facility_id
           AND o.date = em.date
        ) AS costs
      FROM Emissions_Master em
      ORDER BY em.date DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY;
    `);

    res.status(200).json({ data: result.recordset });
  } catch (err) {
    console.error("Error in /api/dashboard/data/paginated:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 2) Expand /api/dashboard/energy to return real data
app.get("/api/dashboard/energy", authenticateToken, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);

    const monthlyQuery = await pool.request().query(`
      SELECT YEAR(billing_period) AS yr,
             MONTH(billing_period) AS mo,
             SUM(consumption_amount) AS totalConsumption
      FROM Utility_Costs
      GROUP BY YEAR(billing_period), MONTH(billing_period)
      ORDER BY YEAR(billing_period), MONTH(billing_period);
    `);

    const monthlyRows = monthlyQuery.recordset;
    const overviewTotal = monthlyRows.map(row => ({
      date: new Date(row.yr, row.mo -1, 1)
        .toLocaleString('default', { month: 'short', year: 'numeric' }),
      isoDate: `${row.yr}-${String(row.mo).padStart(2, "0")}`,
      value: parseFloat(row.totalConsumption) || 0
    }));

    const monthlyData = { overview: { total: overviewTotal } };
    return res.json({ monthlyData });
  } catch(err){
    console.error("Error in /api/dashboard/energy:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 3) Expand /api/dashboard/costs to return real data
app.get("/api/dashboard/costs", authenticateToken, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);

    const monthlyQuery = await pool.request().query(`
      SELECT YEAR(date) AS yr,
             MONTH(date) AS mo,
             SUM(amount) AS totalCosts
      FROM Operational_Costs_Master
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date), MONTH(date);
    `);

    const monthlyRows = monthlyQuery.recordset;
    const overviewTotal = monthlyRows.map(row => ({
      date: new Date(row.yr, row.mo -1, 1)
        .toLocaleString('default', { month: 'short', year: 'numeric' }),
      isoDate: `${row.yr}-${String(row.mo).padStart(2, "0")}`,
      value: parseFloat(row.totalCosts) || 0
    }));

    const monthlyData = { overview: { total: overviewTotal } };
    return res.json({ monthlyData });
  } catch(err){
    console.error("Error in /api/dashboard/costs:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 4) Add missing /api/dashboard/emissions route
app.get("/api/dashboard/emissions", authenticateToken, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);

    const emissionsQuery = await pool.request().query(`
      SELECT YEAR(date) AS yr,
             MONTH(date) AS mo,
             SUM(total_gross_emissions) AS totalEmissions
      FROM Emissions_Master
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date), MONTH(date);
    `);

    const monthlyRows = emissionsQuery.recordset;
    const overviewTotal = monthlyRows.map(row => ({
      date: new Date(row.yr, row.mo - 1, 1)
        .toLocaleString("default", { month: "short", year: "numeric" }),
      isoDate: `${row.yr}-${String(row.mo).padStart(2, "0")}`,
      value: parseFloat(row.totalEmissions) || 0
    }));

    const monthlyData = { overview: { total: overviewTotal } };
    return res.json({ monthlyData });
  } catch (err) {
    console.error("Error in /api/dashboard/emissions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 5) Add route for emissions-by-sector
app.get("/api/dashboard/emissions-by-sector", authenticateToken, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT sector, SUM(total_gross_emissions) AS totalEmissions
      FROM Emissions_Master
      GROUP BY sector
      ORDER BY totalEmissions DESC;
    `);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error in /api/dashboard/emissions-by-sector:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 6) Add route for operational-costs-by-sector
app.get("/api/dashboard/operational-costs-by-sector", authenticateToken, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT sector, SUM(amount) AS totalCost
      FROM Operational_Costs_Master
      GROUP BY sector
      ORDER BY totalCost DESC;
    `);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error in /api/dashboard/operational-costs-by-sector:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Serve static files from the 'Public' directory
app.use(express.static("Public"));

// Test Database Connection Route (Optional)
app.get("/api/test-db", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query("SELECT 1 AS result");
    res.status(200).json({ message: "Database connection is successful", result: result.recordset });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

// Start the server
const server = app.listen(port, async () => {
  try {
    await sql.connect({
      ...dbConfig,
      options: { encrypt: true, enableArithAbort: true },
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
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
