const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const cors = require("cors");
const signupRouter = require('./Models/signup');
const loginRouter = require("./Models/login");
const emissioncontroller = require("./Controllers/emission");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// Serve static files (HTML, CSS, JS) from the "Public" directory
app.use(express.static("Public"));

// API routes
app.use('/api', signupRouter);
app.use('/api', loginRouter);
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
