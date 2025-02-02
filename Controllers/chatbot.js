const Chatbot = require("../Models/chatbot");

const getAllSqlDetails = async (req, res) => {
    try {
        // Fetch all SQL table details
        const SqlDetails = await Chatbot.getAllSqlTables();

        // Check if SqlDetails is not empty or null
        if (SqlDetails && SqlDetails.length > 0) {
            res.status(200).json({
                message: "Successfully retrieved all SQL table details",
                sqlDetails: SqlDetails
            });
        } else {
            res.status(404).json({ message: "No SQL table details found." });
        }
    } catch (error) {
        console.error("Error retrieving SQL details:", error);
        res.status(500).json({ message: "Error retrieving SQL table details." });
    }
};

module.exports = {
    getAllSqlDetails
};
