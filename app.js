const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const emissioncontroller = require("./Controllers/emission")


require("dotenv").config()

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("Public"));

app.get("/emission/:id",emissioncontroller.getEmissionById); // by company's id


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

const signupRouter = require('./signup');
app.use('/api', signupRouter);
