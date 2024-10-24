const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser")


require("dotenv").config()

const app = express();
const port = process.env.PORT || 3000;
const staticMiddleware = express.static("public");

//verifyJWT middleware to routes that need authentication
app.get('/users/validate', verifyJWT, (req, res) => {
    res.json(req.user); // Return the entire user object
});


//html routes
//common
app.get('/login', (req, res) => {
    res.redirect('/index.html')
});

//ngo routes
app.get('/ngo/dashboard', verifyJWT, (req,res) => {
    res.redirect('/ngodashboard.html');
})
app.get('/ngo/profile', verifyJWT, (req, res) => {
    res.redirect('/ngoprofilepage.html');
})

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
