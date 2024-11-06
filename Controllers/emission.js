const Emission = require("../Models/emission")

const getEmissionById = async (req, res) => {
    const companyid = req.params.id;
    try {
      const emission = await Emission.getEmissionById(companyid);
      if (!emission) {
        return res.status(404).send("Emission not found")
      }
      res.json(emission);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving emission");
    }
};

const getTopEmissionsByCurrentMonth = async (req, res) => {
  try {
    const emission = await Emission.getTopEmissionsByCurrentMonth();
    if (!emission) {
      return res.status(404).send("Emission not found")
    }
    res.json(emission);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving emission");
  }
};

const getMostImprovedByMonth = async (req, res) => {
  try {
    const emission = await Emission.getMostImprovedByMonth();
    if (!emission) {
      return res.status(404).send("Emission not found")
    }
    res.json(emission);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving emission");
  }
};

module.exports = {
    getEmissionById,
    getTopEmissionsByCurrentMonth,
    getMostImprovedByMonth
}
