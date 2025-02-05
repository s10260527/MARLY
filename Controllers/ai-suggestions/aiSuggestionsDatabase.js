// server/database.js

const sql = require('mssql');

// KEEP your old line but comment it out (DO NOT delete):
// const config = require('../../dbConfig').database;

// ADD a new line that imports the entire config object
const fullDbConfig = require('../../dbConfig');


// Now fix each function to use "fullDbConfig" instead of "config"

async function getLatestEmissionsData() {
    try {
        // old line (comment out):
        // const pool = await sql.connect(config);

        // new line:
        const pool = await sql.connect(fullDbConfig);

        const result = await pool.request().query(`
            WITH LatestEmission AS (
                SELECT 
                    em.emission_id,
                    em.facility_id,
                    em.date,
                    em.total_gross_emissions,
                    em.total_net_emissions,
                    ROW_NUMBER() OVER (PARTITION BY em.facility_id ORDER BY em.date DESC, em.emission_id DESC) as rn
                FROM Emissions_Master em
            )
            SELECT 
                le.total_gross_emissions,
                le.total_net_emissions,
                s2.electricity_consumption,
                s2.cooling_consumption,
                s2.heating_consumption,
                ds.total_production,
                ds.total_energy_consumed,
                ds.total_costs,
                ds.efficiency_metrics,
                f.facility_name,
                f.facility_type,
                f.sector_type,
                d.department_name
            FROM LatestEmission le
            JOIN Facilities f ON le.facility_id = f.facility_id
            LEFT JOIN Scope2_Emissions s2 ON le.emission_id = s2.emission_id
            LEFT JOIN Daily_Summary ds ON le.facility_id = ds.facility_id 
                AND le.date = ds.date
            LEFT JOIN Departments d ON s2.department_id = d.department_id
            WHERE le.rn = 1
            AND le.total_gross_emissions IS NOT NULL
            ORDER BY f.facility_id;
        `);
        
        console.log('Query result:', result.recordset); // Debug log
        return result.recordset;
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
}

async function getMaintenanceData() {
    try {
        // old line (comment out):
        // const pool = await sql.connect(config);

        // new line:
        const pool = await sql.connect(fullDbConfig);

        const result = await pool.request().query(`
            SELECT TOP 5
                m.maintenance_date,
                m.maintenance_type,
                m.cost_amount,
                e.equipment_name,
                e.efficiency_rating,
                e.operational_status
            FROM Maintenance_Costs m
            JOIN Equipment e ON m.equipment_id = e.equipment_id
            ORDER BY m.maintenance_date DESC
        `);
        return result.recordset;
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
}

async function getUtilityCosts() {
    try {
        // old:
        // const pool = await sql.connect(config);

        // new:
        const pool = await sql.connect(fullDbConfig);

        const result = await pool.request().query(`
            SELECT TOP 5
                utility_type,
                consumption_amount,
                total_cost,
                peak_usage_charges
            FROM Utility_Costs
            ORDER BY billing_period DESC
        `);
        return result.recordset;
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
}

// In database.js, update getSectorAnalysisData function
async function getSectorAnalysisData() {
    try {
        // old:
        // const pool = await sql.connect(config);

        // new:
        const pool = await sql.connect(fullDbConfig);

        const result = await pool.request().query(`
            WITH LatestData AS (
                SELECT 
                    f.facility_id,
                    f.sector_type,
                    f.facility_name,
                    s1.calculated_emissions as scope1_emissions,
                    CASE 
                        WHEN s2.electricity_consumption IS NOT NULL 
                        THEN s2.electricity_consumption * s2.grid_emission_factor / 1000.0  -- Convert to metric tons
                        ELSE 0 
                    END as scope2_emissions,
                    s3.calculated_emissions as scope3_emissions,
                    em.total_gross_emissions,
                    ds.total_costs,
                    ds.efficiency_metrics,
                    em.date,
                    ROW_NUMBER() OVER (PARTITION BY f.facility_id ORDER BY em.date DESC) as rn
                FROM Facilities f
                LEFT JOIN Emissions_Master em ON f.facility_id = em.facility_id
                LEFT JOIN Scope1_Emissions s1 ON em.emission_id = s1.emission_id
                LEFT JOIN Scope2_Emissions s2 ON em.emission_id = s2.emission_id
                LEFT JOIN Scope3_Emissions s3 ON em.emission_id = s3.emission_id
                LEFT JOIN Daily_Summary ds ON f.facility_id = ds.facility_id 
                    AND em.date = ds.date
            )
            SELECT 
                sector_type,
                AVG(ISNULL(scope1_emissions, 0)) as scope1_emissions,  -- Using AVG
                AVG(ISNULL(scope2_emissions, 0)) as scope2_emissions,  -- Using AVG
                AVG(ISNULL(scope3_emissions, 0)) as scope3_emissions,  -- Using AVG
                SUM(ISNULL(total_costs, 0)) as total_costs,           -- Keep SUM for costs
                AVG(ISNULL(efficiency_metrics, 0)) as efficiency_metrics
            FROM LatestData
            WHERE rn = 1
            GROUP BY sector_type;
        `);

        return result.recordset;
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
}

async function getFacilityRankings() {
    try {
        // old:
        // const pool = await sql.connect(config);

        // new:
        const pool = await sql.connect(fullDbConfig);

        const result = await pool.request().query(`
            WITH LatestData AS (
                SELECT 
                    f.facility_id,
                    f.facility_name,
                    f.facility_type,
                    em.total_gross_emissions,
                    -- Cap efficiency_metrics at 100
                    CASE 
                        WHEN ds.efficiency_metrics > 100.00 THEN 100.00
                        ELSE ds.efficiency_metrics
                    END as capped_efficiency_metrics,
                    ds.total_costs,
                    ROW_NUMBER() OVER (PARTITION BY f.facility_id ORDER BY em.date DESC) as rn
                FROM Facilities f
                LEFT JOIN Emissions_Master em ON f.facility_id = em.facility_id
                LEFT JOIN Daily_Summary ds ON f.facility_id = ds.facility_id
                    AND em.date = ds.date
            )
            SELECT 
                facility_id,
                facility_name,
                facility_type,
                COALESCE(total_gross_emissions, 0) as total_emissions,
                COALESCE(capped_efficiency_metrics, 0) as efficiency_metrics,
                COALESCE(total_costs, 0) as total_costs
            FROM LatestData
            WHERE rn = 1
            ORDER BY capped_efficiency_metrics DESC;
        `);

        console.log('Facility Rankings Query Result:', result.recordset);
        return result.recordset;
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
}

async function getEquipmentHealthData() {
    try {
        // old:
        // const pool = await sql.connect(config);

        // new:
        const pool = await sql.connect(fullDbConfig);

        const result = await pool.request().query(`
            SELECT TOP 5
                e.equipment_id,
                e.equipment_name,
                e.type,
                e.efficiency_rating,
                e.operational_status,
                MAX(m.maintenance_date) as last_maintenance_date,
                AVG(m.cost_amount) as avg_maintenance_cost
            FROM Equipment e
            LEFT JOIN Maintenance_Costs m ON e.equipment_id = m.equipment_id
            GROUP BY 
                e.equipment_id,
                e.equipment_name,
                e.type,
                e.efficiency_rating,
                e.operational_status
            ORDER BY e.efficiency_rating DESC;
        `);
        
        if (result.recordset.length === 0) {
            return [{
                equipment_id: 1,
                equipment_name: 'No equipment data available',
                efficiency_rating: 0,
                operational_status: 'Unknown'
            }];
        }
        
        return result.recordset;
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
}

async function getImplementationProgress() {
    try {
        // old:
        // const pool = await sql.connect(config);

        // new:
        const pool = await sql.connect(fullDbConfig);

        const result = await pool.request().query(`
            SELECT 
                COUNT(CASE WHEN initiative_status = 'Completed' THEN 1 END) as completed_count,
                COUNT(*) as total_count,
                CAST(AVG(CAST(current_progress as FLOAT)) as DECIMAL(5,2)) as avg_progress
            FROM Sustainability_Goals;
        `);

        if (!result.recordset[0] || result.recordset[0].total_count === 0) {
            return {
                completed_count: 0,
                total_count: 0,
                avg_progress: 0
            };
        }

        return {
            completed_count: result.recordset[0].completed_count || 0,
            total_count: result.recordset[0].total_count || 0,
            avg_progress: result.recordset[0].avg_progress || 0
        };
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
}

module.exports = {
    getLatestEmissionsData,
    getMaintenanceData,
    getUtilityCosts,
    getSectorAnalysisData,
    getFacilityRankings,
    getEquipmentHealthData,
    getImplementationProgress
};
