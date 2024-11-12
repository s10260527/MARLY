const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const cors = require("cors");
const signupRouter = require('./Models/signup');
const emissioncontroller = require("./Controllers/emission");
const companycontroller = require("./Controllers/company");
const inputcontroller = require("./Controllers/input");


require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the "Public" directory
app.use(express.static("Public"));

// Define a route to serve the signup page
app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/Public/signup.html");
});

// API routes
app.use('/api', signupRouter);
app.get("/emission/totalemission", emissioncontroller.getTopEmissionsByCurrentMonth);
app.get("/emission/mostimproved", emissioncontroller.getMostImprovedByMonth);

// Campaign routes
app.get("/campaign/isParticipant/:id", companycontroller.checkIsParticipant);
app.patch("/campaign/updateParticipationStatus/:id", companycontroller.updateCompanyParticipation);
app.patch("/campaign/updateParticipationStatus/:id", companycontroller.updateCompanyParticipation);

//input routes
app.get("/input/getDeviceId/:device_name", inputcontroller.getDeviceIdByName);
app.get("/input/getDeviceId/:device_name", inputcontroller.getDeviceIdByName);
app.put('/input/updateRecycledDeviceQuantity', inputcontroller.updateRecycledDeviceQuantity);




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
