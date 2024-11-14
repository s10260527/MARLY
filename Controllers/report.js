// Controllers/reportController.js
const reportModel = require("../Models/report");

module.exports = {
    // Controller to get emissions by sector
    getEmissionsBySector: async (req, res) => {
        try {
            const data = await reportModel.getEmissionsBySector();
            res.status(200).json(data);
        } catch (err) {
            console.error("Error fetching emissions by sector:", err);
            res.status(500).json({ error: "Failed to fetch emissions data" });
        }
        res.json({ message: "Emissions by sector data" });
    },

    // Controller to get energy consumption by sector
    getEnergyConsumptionBySector: async (req, res) => {
        try {
            const data = await reportModel.getEnergyConsumptionBySector();
            res.status(200).json(data);
        } catch (err) {
            console.error("Error fetching energy consumption data:", err);
            res.status(500).json({ error: "Failed to fetch energy consumption data" });
        }
    },

    // Controller to get operational cost by month
    getOperationalCostByMonth: async (req, res) => {
        try {
            const data = await reportModel.getOperationalCostByMonth();
            res.status(200).json(data);
        } catch (err) {
            console.error("Error fetching operational cost data:", err);
            res.status(500).json({ error: "Failed to fetch operational cost data" });
        }
    },

    // Controller to get yearly emissions by sector
    getYearlyEmissionsBySector: async (req, res) => {
        try {
            const data = await reportModel.getYearlyEmissionsBySector();
            res.status(200).json(data);
        } catch (err) {
            console.error("Error fetching yearly emissions data:", err);
            res.status(500).json({ error: "Failed to fetch yearly emissions data" });
        }
    }
};
