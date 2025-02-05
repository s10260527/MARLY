const sql = require("mssql");

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming user ID is passed via JWT

        const config = {
            user: 'user',
            password: 'MARLY',
            server: 'localhost',
            database: 'MARLY',
            options: {
                encrypt: true,
                trustServerCertificate: true,
            }
        };

        await sql.connect(config);

        const request = new sql.Request();
        request.input('userId', sql.Int, userId);

        const companyQuery = `
            SELECT 
                c.company_name, 
                c.sustainability_commitment_level, 
                c.baseline_year 
            FROM Companies c
            INNER JOIN Facilities f ON c.company_id = f.company_id
            INNER JOIN Users u ON f.facility_id = u.facility_id
            WHERE u.user_id = @userId;
        `;

        const emissionsQuery = `
            SELECT 
                SUM(total_gross_emissions) AS totalEmissions
            FROM Emissions_Master em
            INNER JOIN Facilities f ON em.facility_id = f.facility_id
            INNER JOIN Users u ON f.facility_id = u.facility_id
            WHERE u.user_id = @userId;
        `;

        const energyQuery = `
            SELECT 
                SUM(electricity_consumption + steam_consumption + cooling_consumption + heating_consumption) AS totalEnergyConsumption
            FROM Scope2_Emissions se
            INNER JOIN Emissions_Master em ON se.emission_id = em.emission_id
            INNER JOIN Facilities f ON em.facility_id = f.facility_id
            INNER JOIN Users u ON f.facility_id = u.facility_id
            WHERE u.user_id = @userId;
        `;

        const costsQuery = `
            SELECT 
                SUM(amount) AS totalOperationalCosts
            FROM Operational_Costs_Master ocm
            INNER JOIN Facilities f ON ocm.facility_id = f.facility_id
            INNER JOIN Users u ON f.facility_id = u.facility_id
            WHERE u.user_id = @userId;
        `;

        const companyResult = await request.query(companyQuery);
        const emissionsResult = await request.query(emissionsQuery);
        const energyResult = await request.query(energyQuery);
        const costsResult = await request.query(costsQuery);

        const company = companyResult.recordset[0] || {};
        const totalEmissions = emissionsResult.recordset[0]?.totalEmissions || 0;
        const totalEnergyConsumption = energyResult.recordset[0]?.totalEnergyConsumption || 0;
        const totalOperationalCosts = costsResult.recordset[0]?.totalOperationalCosts || 0;

        res.status(200).json({
            companyName: company.company_name || "Unknown",
            sustainabilityCommitment: company.sustainability_commitment_level || "N/A",
            baselineYear: company.baseline_year || "N/A",
            totalEmissions,
            totalEnergyConsumption,
            totalOperationalCosts,
        });
    } catch (err) {
        console.error("Error retrieving dashboard data:", err);
        res.status(500).json({
            error: "Failed to retrieve dashboard data",
            details: err.message,
        });
    } finally {
        await sql.close();
    }
};
