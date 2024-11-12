const RecyclableDevice = require("../Models/input");

const getDeviceIdByName = async (req, res) => {
    const device_name = req.params.device_name;
    try {
        const device_id = await RecyclableDevice.getDeviceIdByName(device_name);

        if (!device_id) {
            return res.status(404).send("Device not found");
        }

        res.json({ device_id });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving device");
    }
};

const updateRecycledDeviceQuantity = async (req, res) => {
    const { campaign_id, company_id, device_id, new_quantity } = req.body;

    // Basic validation
    if (!campaign_id || !company_id || !device_id || !new_quantity) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        const result = await RecyclableDevice.updateRecycledDeviceQuantity(campaign_id, company_id, device_id, new_quantity);

        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(404).json({ message: result.message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating recycled device quantity" });
    }
};





module.exports = {
    getDeviceIdByName,
    updateRecycledDeviceQuantity
};
