const LeaderBoard = require("../Models/leaderboard");
const axios = require("axios");

const displayTop3CompaniesForCurrentMonth = async (req, res) => {
    try {
        // Get the current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed in JavaScript
        const currentYear = currentDate.getFullYear();

        // Fetch the top 3 companies based on the current month and year
        const topCompanies = await LeaderBoard.getTop3CompaniesByRecycledDevices(currentMonth, currentYear);

        if (topCompanies && topCompanies.length > 0) {
            res.status(200).json({
                month: currentMonth,
                year: currentYear,
                topCompanies: topCompanies
            });
        } else {
            res.status(404).json({ message: "No recycled data found for this month and year." });
        }
    } catch (error) {
        console.error("Error retrieving top companies:", error);
        res.status(500).json({ message: "Error retrieving top companies for the current month" });
    }
};

const proxyImage = async (req, res) => {
    try {
        const imageUrl = req.query.url; // Extract the image URL from the query parameters
        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required" });
        }

        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        res.set("Content-Type", response.headers["content-type"]); // Set content type
        res.send(response.data); // Send the image data back
    } catch (error) {
        console.error("Error fetching image:", error.message);
        res.status(500).json({ error: "Failed to fetch image" });
    }
};

module.exports = {
    displayTop3CompaniesForCurrentMonth,
    proxyImage
};
