// app.js
const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig"); // your DB credentials file
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Imports for your existing routes/models
const authRoutes = require("./Models/auth");
const signupRouter = require("./Models/signup");
const loginRouter = require("./Models/login");
const emissionController = require("./Controllers/emission");
const profileRouter = require("./Models/profile"); // <-- updated profile
const companycontroller = require("./Controllers/company");
const inputcontroller = require("./Controllers/input");
const leaderboardcontroller = require("./Controllers/leaderboard");
const reportController = require("./Controllers/report");
const chatbotController = require("./Controllers/chatbot");

// AI Suggestions
const aiSuggestionsController = require("./Controllers/ai-suggestions/aiSuggestionsController");

// ADD THESE TWO LINES to define the missing dashboard references
const dashboardRouter = require("./Models/dashboard");
const dashboardController = require("./Controllers/dashboardController");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ credentials: true, origin: "http://127.0.0.1:3000" }));
app.use(express.json());
app.use(express.static("Public"));
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  })
);
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
app.get("/api/suggestions", aiSuggestionsController.getSuggestions); 
app.get("/api/suggestions/:id/details", aiSuggestionsController.getSuggestionDetails); 
app.get("/api/sector-analysis", aiSuggestionsController.getSectorAnalysis); 
app.get("/api/equipment-health", aiSuggestionsController.getEquipmentHealth); 
app.get("/api/implementation-progress", aiSuggestionsController.getImplementationProgress);

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);

// Use the new dashboardRouter + controller
app.use("/api/dashboard", authenticateToken, dashboardRouter);
app.get(
  "/api/dashboard/data",
  authenticateToken,
  dashboardController.getDashboardData
);

// NEW profile route usage
app.use("/api/profile", authenticateToken, profileRouter);

// Emission endpoints
app.get(
  "/api/emission/totalemission",
  authenticateToken,
  emissionController.getTopEmissionsByCurrentMonth
);
app.get(
  "/api/emission/mostimproved",
  authenticateToken,
  emissionController.getMostImprovedByMonth
);

// Serve static files (HTML, CSS, JS) from the "Public" directory
app.use(express.static("Public"));

// Test database connection endpoint (For debugging)
app.get("/api/test-db", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query("SELECT 1 AS result");
    res
      .status(200)
      .json({ message: "Database connection is successful", result: result.recordset });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

// Start server
// ChatBot routes
app.get("/chatbot/data", chatbotController.getAllSqlDetails);

// Campaign routes
app.get("/campaign/isParticipant/:id", companycontroller.checkIsParticipant);
app.patch("/campaign/updateParticipationStatus/:id", companycontroller.updateCompanyParticipation);

// Input endpoints
app.post("/input/addPost", inputcontroller.addPostUrl);
app.get("/input/:id", inputcontroller.getCompanyName);

// Leaderboard
app.get(
  "/leaderboard/top3",
  leaderboardcontroller.displayTop3CompaniesForCurrentMonth
);
app.get("/leaderboard/proxy-image", leaderboardcontroller.proxyImage);

// Reports
app.get(
  "/api/report/emissions-by-sector",
  authenticateToken,
  reportController.getEmissionsBySector
);
app.get(
  "/api/report/energy-consumption-by-sector",
  authenticateToken,
  reportController.getEnergyConsumptionBySector
);
app.get(
  "/api/report/operational-cost-by-month",
  authenticateToken,
  reportController.getOperationalCostByMonth
);
app.get(
  "/api/report/yearly-emissions-by-sector",
  authenticateToken,
  reportController.getYearlyEmissionsBySector
);

// 1) Paginated route
app.get("/api/dashboard/data/paginated", authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    let pool = await sql.connect(dbConfig);

    // Example combining data for emissions, energy, costs
    // Adjust as needed for real queries
    const result = await pool.request().query(`
      SELECT TOP(${limit})
        CONVERT(varchar(10), em.date, 120) AS emission_date,
        CAST(em.total_gross_emissions AS DECIMAL(10,2)) AS emissions,
        (
          SELECT SUM(consumption_amount)
          FROM Utility_Costs u
          WHERE u.facility_id = em.facility_id
            AND u.billing_period = em.date
        ) AS energy,
        (
          SELECT SUM(amount)
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

// 2) /api/dashboard/emissions
app.get("/api/dashboard/emissions", authenticateToken, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);

    // Check for query params
    const { start, end } = req.query;
    let whereClause = "";
    if (start && end) {
      whereClause = "WHERE em.date BETWEEN @start AND @end";
    }

    // Summaries by year+month
    const monthlyEmissionsRequest = pool.request();
    if (start && end) {
      monthlyEmissionsRequest.input("start", sql.DateTime, start);
      monthlyEmissionsRequest.input("end", sql.DateTime, end);
    }
    const monthlyEmissions = await monthlyEmissionsRequest.query(`
      SELECT YEAR(date) AS yr,
             MONTH(date) AS mo,
             SUM(total_gross_emissions) AS sumGross
      FROM Emissions_Master em
      ${whereClause}
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date), MONTH(date);
    `);

    // Summaries by sector
    const sectorEmissionsRequest = pool.request();
    if (start && end) {
      sectorEmissionsRequest.input("start", sql.DateTime, start);
      sectorEmissionsRequest.input("end", sql.DateTime, end);
    }
    const sectorEmissions = await sectorEmissionsRequest.query(`
      SELECT f.sector_type AS sector,
             YEAR(em.date) AS yr,
             MONTH(em.date) AS mo,
             SUM(em.total_gross_emissions) AS sumGross
      FROM Emissions_Master em
      JOIN Facilities f ON em.facility_id = f.facility_id
      ${whereClause}
      GROUP BY f.sector_type, YEAR(em.date), MONTH(em.date)
      ORDER BY f.sector_type, YEAR(em.date), MONTH(em.date);
    `);

    // Build overview arrays
    const overviewTotal = [];
    const overviewSustainable = [];
    const overviewCredits = [];

    monthlyEmissions.recordset.forEach((row) => {
      const iso = `${row.yr}-${String(row.mo).padStart(2, "0")}`;
      const dateLabel = new Date(row.yr, row.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const grossVal = parseFloat(row.sumGross) || 0;
      const sustVal = grossVal * 0.3; // example calculation
      const credVal = grossVal * 0.2; // example calculation

      overviewTotal.push({ date: dateLabel, isoDate: iso, value: grossVal });
      overviewSustainable.push({ date: dateLabel, isoDate: iso, value: sustVal });
      overviewCredits.push({ date: dateLabel, isoDate: iso, value: credVal });
    });

    const sectorMap = {};
    sectorEmissions.recordset.forEach((row) => {
      const sectorName = row.sector || "Other";
      if (!sectorMap[sectorName]) {
        sectorMap[sectorName] = {
          total: [],
          sustainable: [],
          credits: [],
        };
      }
      const iso = `${row.yr}-${String(row.mo).padStart(2, "0")}`;
      const dateLabel = new Date(row.yr, row.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const val = parseFloat(row.sumGross) || 0;
      const sustVal = val * 0.3;
      const credVal = val * 0.2;

      sectorMap[sectorName].total.push({ date: dateLabel, isoDate: iso, value: val });
      sectorMap[sectorName].sustainable.push({ date: dateLabel, isoDate: iso, value: sustVal });
      sectorMap[sectorName].credits.push({ date: dateLabel, isoDate: iso, value: credVal });
    });

    const monthlyData = {
      overview: {
        total: overviewTotal,
        sustainable: overviewSustainable,
        credits: overviewCredits,
      },
    };
    Object.keys(sectorMap).forEach((sectorName) => {
      monthlyData[sectorName] = sectorMap[sectorName];
    });

    // dailyData if needed
    const dailyData = {};

    return res.json({ monthlyData, dailyData });
  } catch (err) {
    console.error("Error in /api/dashboard/emissions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 3) /api/dashboard/energy
app.get("/api/dashboard/energy", authenticateToken, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    const { start, end } = req.query;
    let whereClause = "";
    if (start && end) {
      whereClause = "WHERE u.billing_period BETWEEN @start AND @end";
    }

    const monthlyEnergyRequest = pool.request();
    if (start && end) {
      monthlyEnergyRequest.input("start", sql.DateTime, start);
      monthlyEnergyRequest.input("end", sql.DateTime, end);
    }
    const monthlyEnergy = await monthlyEnergyRequest.query(`
      SELECT YEAR(u.billing_period) AS yr,
             MONTH(u.billing_period) AS mo,
             SUM(u.consumption_amount) AS sumConsumption
      FROM Utility_Costs u
      ${whereClause}
      GROUP BY YEAR(u.billing_period), MONTH(u.billing_period)
      ORDER BY YEAR(u.billing_period), MONTH(u.billing_period);
    `);

    const overviewTotal = [];
    monthlyEnergy.recordset.forEach((row) => {
      const iso = `${row.yr}-${String(row.mo).padStart(2, "0")}`;
      const dateLabel = new Date(row.yr, row.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const val = parseFloat(row.sumConsumption) || 0;
      overviewTotal.push({ date: dateLabel, isoDate: iso, value: val });
    });

    // Summaries by sector
    let sectorWhere = "";
    if (start && end) {
      sectorWhere = "AND u.billing_period BETWEEN @start AND @end";
    }
    const sectorRequest = pool.request();
    if (start && end) {
      sectorRequest.input("start", sql.DateTime, start);
      sectorRequest.input("end", sql.DateTime, end);
    }
    const sectorResult = await sectorRequest.query(`
      SELECT f.sector_type AS sector,
             YEAR(u.billing_period) AS yr,
             MONTH(u.billing_period) AS mo,
             SUM(u.consumption_amount) AS sumConsumption
      FROM Utility_Costs u
      JOIN Facilities f ON u.facility_id = f.facility_id
      WHERE 1=1
      ${sectorWhere}
      GROUP BY f.sector_type, YEAR(u.billing_period), MONTH(u.billing_period)
      ORDER BY f.sector_type, YEAR(u.billing_period), MONTH(u.billing_period);
    `);

    const sectorMap = {};
    sectorResult.recordset.forEach((r) => {
      const sector = r.sector || "Other";
      if (!sectorMap[sector]) {
        sectorMap[sector] = { total: [] };
      }
      const iso = `${r.yr}-${String(r.mo).padStart(2, "0")}`;
      const dateLabel = new Date(r.yr, r.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const val = parseFloat(r.sumConsumption) || 0;
      sectorMap[sector].total.push({ date: dateLabel, isoDate: iso, value: val });
    });

    const monthlyData = { overview: { total: overviewTotal } };
    Object.keys(sectorMap).forEach((sector) => {
      monthlyData[sector] = sectorMap[sector];
    });

    const dailyData = {};

    return res.json({ monthlyData, dailyData });
  } catch (err) {
    console.error("Error in /api/dashboard/energy:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 4) /api/dashboard/costs
app.get("/api/dashboard/costs", authenticateToken, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    const { start, end } = req.query;
    let whereClause = "";
    if (start && end) {
      whereClause = "WHERE o.date BETWEEN @start AND @end";
    }

    const monthlyCostsRequest = pool.request();
    if (start && end) {
      monthlyCostsRequest.input("start", sql.DateTime, start);
      monthlyCostsRequest.input("end", sql.DateTime, end);
    }
    const monthlyCosts = await monthlyCostsRequest.query(`
      SELECT YEAR(o.date) AS yr,
             MONTH(o.date) AS mo,
             SUM(o.amount) AS sumCost
      FROM Operational_Costs_Master o
      ${whereClause}
      GROUP BY YEAR(o.date), MONTH(o.date)
      ORDER BY YEAR(o.date), MONTH(o.date);
    `);

    const overviewTotal = [];
    monthlyCosts.recordset.forEach((r) => {
      const iso = `${r.yr}-${String(r.mo).padStart(2, "0")}`;
      const dateLabel = new Date(r.yr, r.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const val = parseFloat(r.sumCost) || 0;
      overviewTotal.push({ date: dateLabel, isoDate: iso, value: val });
    });

    // Summaries by sector
    let sectorWhere = "";
    if (start && end) {
      sectorWhere = "AND o.date BETWEEN @start AND @end";
    }
    const sectorRequest = pool.request();
    if (start && end) {
      sectorRequest.input("start", sql.DateTime, start);
      sectorRequest.input("end", sql.DateTime, end);
    }
    const sectorResult = await sectorRequest.query(`
      SELECT f.sector_type AS sector,
             YEAR(o.date) AS yr,
             MONTH(o.date) AS mo,
             SUM(o.amount) AS sumCost
      FROM Operational_Costs_Master o
      JOIN Facilities f ON o.facility_id = f.facility_id
      WHERE 1=1
      ${sectorWhere}
      GROUP BY f.sector_type, YEAR(o.date), MONTH(o.date)
      ORDER BY f.sector_type, YEAR(o.date), MONTH(o.date);
    `);

    const sectorMap = {};
    sectorResult.recordset.forEach((r) => {
      const sector = r.sector || "Other";
      if (!sectorMap[sector]) {
        sectorMap[sector] = { total: [] };
      }
      const iso = `${r.yr}-${String(r.mo).padStart(2, "0")}`;
      const dateLabel = new Date(r.yr, r.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const val = parseFloat(r.sumCost) || 0;
      sectorMap[sector].total.push({ date: dateLabel, isoDate: iso, value: val });
    });

    const monthlyData = {
      overview: { total: overviewTotal },
    };
    Object.keys(sectorMap).forEach((sector) => {
      monthlyData[sector] = sectorMap[sector];
    });

    return res.json({ monthlyData });
  } catch (err) {
    console.error("Error in /api/dashboard/costs:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// NEW: /api/dashboard/general route that returns general graph data filtered by start and end dates
app.get("/api/dashboard/general", authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;
    let pool = await sql.connect(dbConfig);

    // Emissions data
    let emWhere = "";
    if (start && end) {
      emWhere = "WHERE date BETWEEN @start AND @end";
    }
    const emReq = pool.request();
    if (start && end) {
      emReq.input("start", sql.DateTime, start);
      emReq.input("end", sql.DateTime, end);
    }
    const emissionsResult = await emReq.query(`
      SELECT YEAR(date) AS yr,
             MONTH(date) AS mo,
             SUM(total_gross_emissions) AS sumGross
      FROM Emissions_Master
      ${emWhere}
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date), MONTH(date);
    `);
    const overviewTotalE = [];
    emissionsResult.recordset.forEach((row) => {
      const iso = `${row.yr}-${String(row.mo).padStart(2, "0")}`;
      const dateLabel = new Date(row.yr, row.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const grossVal = parseFloat(row.sumGross) || 0;
      overviewTotalE.push({ date: dateLabel, isoDate: iso, value: grossVal });
    });
    const emissionsMonthlyData = { overview: { total: overviewTotalE } };

    // Energy data
    let enWhere = "";
    if (start && end) {
      enWhere = "WHERE billing_period BETWEEN @start AND @end";
    }
    const enReq = pool.request();
    if (start && end) {
      enReq.input("start", sql.DateTime, start);
      enReq.input("end", sql.DateTime, end);
    }
    const energyResult = await enReq.query(`
      SELECT YEAR(billing_period) AS yr,
             MONTH(billing_period) AS mo,
             SUM(consumption_amount) AS sumConsumption
      FROM Utility_Costs
      ${enWhere}
      GROUP BY YEAR(billing_period), MONTH(billing_period)
      ORDER BY YEAR(billing_period), MONTH(billing_period);
    `);
    const overviewTotalEn = [];
    energyResult.recordset.forEach((row) => {
      const iso = `${row.yr}-${String(row.mo).padStart(2, "0")}`;
      const dateLabel = new Date(row.yr, row.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const val = parseFloat(row.sumConsumption) || 0;
      overviewTotalEn.push({ date: dateLabel, isoDate: iso, value: val });
    });
    const energyMonthlyData = { overview: { total: overviewTotalEn } };

    // Costs data
    let coWhere = "";
    if (start && end) {
      coWhere = "WHERE date BETWEEN @start AND @end";
    }
    const coReq = pool.request();
    if (start && end) {
      coReq.input("start", sql.DateTime, start);
      coReq.input("end", sql.DateTime, end);
    }
    const costsResult = await coReq.query(`
      SELECT YEAR(date) AS yr,
             MONTH(date) AS mo,
             SUM(amount) AS sumCost
      FROM Operational_Costs_Master
      ${coWhere}
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date), MONTH(date);
    `);
    const overviewTotalC = [];
    costsResult.recordset.forEach((row) => {
      const iso = `${row.yr}-${String(row.mo).padStart(2, "0")}`;
      const dateLabel = new Date(row.yr, row.mo - 1, 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const val = parseFloat(row.sumCost) || 0;
      overviewTotalC.push({ date: dateLabel, isoDate: iso, value: val });
    });
    const costsMonthlyData = { overview: { total: overviewTotalC } };

    return res.json({
      emissions: { monthlyData: emissionsMonthlyData },
      energy: { monthlyData: energyMonthlyData },
      costs: { monthlyData: costsMonthlyData },
    });
  } catch (err) {
    console.error("Error in /api/dashboard/general:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Serve static files, e.g. your profile.html
app.use(express.static("Public"));

// Test DB route (optional)
app.get("/api/test-db", async (req, res) => {
  try {
    // simple test query
    const request = new sql.Request();
    const result = await request.query("SELECT 1 AS result");
    res
      .status(200)
      .json({ message: "Database connection is successful", result: result.recordset });
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
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
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
