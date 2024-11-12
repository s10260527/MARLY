const Company = require("../Models/companies")

const checkIsParticipant = async (req, res) => {
    const company_id = req.params.id;
    try {
      const company = await Company.isCompanyParticipant(company_id);
      if (!company) {
        return res.status(404).send("Company not found")
      } 
  
      res.json(company);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving company");
    }
  };

const updateCompanyParticipation = async (req, res) => {
    const company_id = req.params.id;
    try {
        // Set participation to true
        const success = await Company.updateCompanyParticipation(company_id, true);

        if (success) {
            res.status(200).json({ message: `Company ${company_id} is now participating in the campaign.` });
        } else {
            res.status(404).json({ message: `Company with ID ${company_id} not found.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating company participation status" });
    }
};

module.exports = {
    checkIsParticipant,
    updateCompanyParticipation
}
