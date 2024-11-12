// authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token; // Extract token if 'Bearer' is used
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.companyId = decoded.companyId; // Attach companyId to request object
        next();
    } catch (err) {
        return res.status(400).json({ message: "Invalid token." });
    }
};

module.exports = verifyToken;
