// routes/auth.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check user in DB
    const request = new sql.Request();
    request.input("Email", sql.NVarChar, email);
    const query = `
      SELECT user_id, facility_id, email, password_hash
      FROM Users
      WHERE email = @Email
    `;
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "User not found." });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
