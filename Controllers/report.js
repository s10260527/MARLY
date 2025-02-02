const Report = require("../Models/report");

const getEmissionsBySector = async (req, res) => {
    try {
      const data = await Report.getEmissionsBySector();
      if (!data) {
        // Maybe return an empty array or 200 with []
        return res.status(200).json([]);
      }
      res.json(data);
    } catch (error) {
      console.error("Error fetching emissions by sector:", error.message);
      res.status(500).json({ message: error.message });
    }
  };  

const getEnergyConsumptionBySector = async (req, res) => {
    try {
        const data = await Report.getEnergyConsumptionBySector();
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }
        res.json(data);
    } catch (error) {
        console.error("Error fetching energy consumption:", error.message);
        res.status(500).json({ message: error.message });
    }
};

const getOperationalCostByMonth = async (req, res) => {
    try {
        const data = await Report.getOperationalCostByMonth();
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }
        res.json(data);
    } catch (error) {
        console.error("Error fetching operational costs:", error.message);
        res.status(500).json({ message: error.message });
    }
};

const getYearlyEmissionsBySector = async (req, res) => {
    try {
        const data = await Report.getYearlyEmissionsBySector();
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }
        res.json(data);
    } catch (error) {
        console.error("Error fetching yearly emissions:", error.message);
        res.status(500).json({ message: error.message });
    }
};

const getSustainabilityGoals = async (req, res) => {
    try {
        const data = await Report.getSustainabilityGoals();
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }
        res.json(data);
    } catch (error) {
        console.error("Error fetching sustainability goals:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// **Export functions**
module.exports = {
    getEmissionsBySector,
    getEnergyConsumptionBySector,
    getOperationalCostByMonth,
    getYearlyEmissionsBySector,
    getSustainabilityGoals,
};
