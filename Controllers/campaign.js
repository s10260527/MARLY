
const Campaign = require("../Models/campaign");

const checkIsParticipant = async (req, res) => {
    const company_id = req.params.id;
    try {
      const company = await Campaign.isCompanyParticipant(company_id);
      if (!company) {
        return res.status(404).send("Company not found")
      } 
  
      res.json(company);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving company");
    }
  };

module.exports = {
    checkIsParticipant
};
