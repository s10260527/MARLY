-- -- CHECKING IF DATA WAS INSERTED CORRECTLY --------------------------------------------------
-- SELECT COUNT(*) FROM Companies;           -- Expect 4
-- SELECT COUNT(*) FROM Facilities;           -- Expect 7
-- SELECT COUNT(*) FROM Departments;          -- Expect 8
-- SELECT COUNT(*) FROM Scope2_Emissions;     -- Expect ~25,550 rows (7 facilities * 3650 days)
-- -- CHECKING IF DATA WAS INSERTED CORRECTLY --------------------------------------------------



USE MARLY;
GO

-- 1. Insert Apple as the company
INSERT INTO Companies (
    company_name, registration_number, company_size, annual_revenue_range,
    established_date, headquarters_location, sustainability_commitment_level,
    baseline_year, campaign_participant
) VALUES
('Apple Inc.', 'AAPL-94-3123456', 'Enterprise', '> $350B', '1976-04-01',
 'Cupertino, California', 'Very High', 2014, 1),
('GreenTech Solutions', 'GT-23-987654', 'Large', '$1B-$10B', '2010-05-15',
 'Berlin, Germany', 'High', 2018, 1),
('EcoTech Industries', 'ETI-45-678901', 'Medium', '$100M-$1B', '2015-11-30',
 'Tokyo, Japan', 'Medium', 2020, 0),
('CleanEnergy Corp', 'CEC-67-234567', 'Large', '$1B-$10B', '2005-03-22',
 'San Francisco, USA', 'Very High', 2016, 1);

DECLARE @apple_id INT = (SELECT company_id FROM Companies WHERE company_name = 'Apple Inc.');
DECLARE @greentech_id INT = @apple_id + 1;
DECLARE @ecotech_id INT = @apple_id + 2;
DECLARE @cleanenergy_id INT = @apple_id + 3;

-- Insert Campaign Data
INSERT INTO Campaigns (
    company_id, campaign_name, description, start_date, end_date
) VALUES
(@apple_id, 'Net Zero Initiative', 'Global carbon neutrality campaign', '2024-01-01', '2030-12-31'),
(@cleanenergy_id, 'Renewable Future', 'Transition to 100% renewable energy', '2024-06-01', '2025-12-31');

DECLARE @net_zero_campaign INT = SCOPE_IDENTITY() - 1;
DECLARE @renewable_campaign INT = SCOPE_IDENTITY();

-- 3. Insert Campaign Participants
INSERT INTO Campaign_participants (campaign_id, company_id, status)
VALUES
(@net_zero_campaign, @apple_id, 'Active'),
(@net_zero_campaign, @greentech_id, 'Active'),
(@net_zero_campaign, @cleanenergy_id, 'Active'),
(@renewable_campaign, @cleanenergy_id, 'Active');

-- Update Companies' campaign_participant status
UPDATE Companies SET campaign_participant = 1
WHERE company_id IN (@apple_id, @greentech_id, @cleanenergy_id);

-- 2. Insert Manufacturing Facilities (Apple)
INSERT INTO Facilities (company_id, facility_name, facility_type, facility_size_sqft, 
                       production_capacity, operating_hours, sector_type)
VALUES 
(@apple_id, 'Zhengzhou Facility', 'Assembly', 2500000.00, 500000, '24/7', 'Final Assembly'),
(@apple_id, 'Shanghai Tech Center', 'Semiconductor', 1800000.00, 350000, '24/7', 'Chip Manufacturing'),
(@apple_id, 'Chennai Production', 'Assembly', 1500000.00, 250000, '24/7', 'iPhone Assembly'),
(@apple_id, 'Taiwan Semiconductor', 'Semiconductor', 2000000.00, 400000, '24/7', 'Apple Silicon'),
(@apple_id, 'Austin R&D Center', 'R&D', 1200000.00, 100000, 'Day Shift', 'Innovation');

-- Insert facilities for other companies
INSERT INTO Facilities (company_id, facility_name, facility_type, facility_size_sqft, 
                       production_capacity, operating_hours, sector_type)
VALUES 
(@greentech_id, 'Berlin Wind Farm', 'Energy Production', 500000.00, 1000, '24/7', 'Renewable Energy'),
(@cleanenergy_id, 'Solar Farm Alpha', 'Energy Production', 1000000.00, 2000, '24/7', 'Solar');

-- Store facility IDs
DECLARE @zhengzhou_id INT, @shanghai_id INT, @chennai_id INT, @taiwan_id INT, @austin_id INT;
SELECT @zhengzhou_id = facility_id FROM Facilities WHERE facility_name = 'Zhengzhou Facility';
SELECT @shanghai_id = facility_id FROM Facilities WHERE facility_name = 'Shanghai Tech Center';
SELECT @chennai_id = facility_id FROM Facilities WHERE facility_name = 'Chennai Production';
SELECT @taiwan_id = facility_id FROM Facilities WHERE facility_name = 'Taiwan Semiconductor';
SELECT @austin_id = facility_id FROM Facilities WHERE facility_name = 'Austin R&D Center';

-- 3. Insert Departments
INSERT INTO Departments (facility_id, department_name, department_code, cost_center)
VALUES
(@zhengzhou_id, 'iPhone Assembly', 'IPHONE', 'CC001'),
(@zhengzhou_id, 'Quality Assurance', 'QA', 'CC002'),
(@zhengzhou_id, 'Process Engineering', 'PE', 'CC003'),
(@zhengzhou_id, 'Supply Chain', 'SC', 'CC004'),
(@shanghai_id, 'Chip Assembly', 'CHIP', 'CC005'),
(@shanghai_id, 'R&D', 'RND', 'CC006'),
(@austin_id, 'Advanced Materials', 'AMAT', 'CC007'),
(@austin_id, 'AI Research', 'AI', 'CC008');

-- 4. Insert Production Lines
INSERT INTO Production_Lines (facility_id, line_name, product_type, capacity_per_hour, 
                            energy_consumption_rate, status, installation_date)
VALUES
(@zhengzhou_id, 'iPhone 15 Line', 'Smartphone', 1800.00, 250.50, 'Active', '2023-06-01'),
(@zhengzhou_id, 'iPhone 14 Line', 'Smartphone', 1500.00, 220.30, 'Active', '2022-06-01'),
(@chennai_id, 'iPhone SE Line', 'Smartphone', 1200.00, 180.20, 'Active', '2021-01-01'),
(@shanghai_id, 'M2 Chip Line', 'Processor', 800.00, 450.50, 'Active', '2022-01-01'),
(@taiwan_id, 'M3 Chip Line', 'Processor', 1000.00, 500.50, 'Active', '2023-01-01');

-- 5. Insert Equipment
INSERT INTO Equipment (line_id, equipment_name, type, manufacturer, model_number, 
                      installation_date, efficiency_rating, power_rating, operational_status)
VALUES
((SELECT line_id FROM Production_Lines WHERE line_name = 'iPhone 15 Line'),
 'SMT Machine A', 'Surface Mount', 'ASM', 'ASM-2023-01', '2023-06-01', 95.5, 75.5, 'Operational'),
((SELECT line_id FROM Production_Lines WHERE line_name = 'iPhone 15 Line'),
 'Testing Station 1', 'Quality Control', 'Keysight', 'KS-2023-02', '2023-06-01', 98.0, 25.2, 'Operational'),
((SELECT line_id FROM Production_Lines WHERE line_name = 'M3 Chip Line'),
 'Lithography System', 'Semiconductor', 'ASML', 'ASML-2023-01', '2023-01-01', 99.0, 250.5, 'Operational'),
((SELECT line_id FROM Production_Lines WHERE line_name = 'M3 Chip Line'),
 'Etching System', 'Semiconductor', 'Applied Materials', 'AM-2023-01', '2023-01-01', 97.5, 200.2, 'Operational');

-- 6. Create helper functions
GO
CREATE FUNCTION CalculateSeasonalFactor(
    @date DATE,
    @facility_id INT
)
RETURNS DECIMAL(10,4)
AS
BEGIN
    DECLARE @month INT = MONTH(@date);
    DECLARE @base_factor DECIMAL(10,4);
    
    -- Base seasonal factor (higher in Q3/Q4 due to new iPhone releases)
    SET @base_factor = 
        CASE 
            WHEN @month IN (9,10,11,12) THEN 1.5  -- New iPhone release period
            WHEN @month IN (7,8) THEN 1.3         -- Production ramp-up
            WHEN @month IN (1,2) THEN 0.7         -- Post-holiday slowdown
            ELSE 1.0                              -- Normal production
        END;
    
    -- Adjust based on facility type
    SELECT @base_factor = @base_factor * 
        CASE facility_type
            WHEN 'Assembly' THEN 1.2              -- Assembly facilities have higher seasonal variation
            WHEN 'Semiconductor' THEN 1.1         -- Chip production is more stable
            ELSE 1.0
        END
    FROM Facilities
    WHERE facility_id = @facility_id;
    
    RETURN @base_factor;
END;
GO

CREATE FUNCTION CalculateTechImprovementFactor(
    @start_date DATE,
    @current_date DATE,
    @facility_id INT
)
RETURNS DECIMAL(10,4)
AS
BEGIN
    DECLARE @years_passed DECIMAL(10,4) = DATEDIFF(DAY, @start_date, @current_date) / 365.0;
    DECLARE @base_improvement DECIMAL(10,4);
    
    -- Get facility type for customized improvement rates
    SELECT @base_improvement = 
        CASE facility_type
            WHEN 'Assembly' THEN 0.05             -- 5% improvement per year for assembly
            WHEN 'Semiconductor' THEN 0.08        -- 8% improvement per year for semiconductor (Moore's Law)
            ELSE 0.04
        END
    FROM Facilities
    WHERE facility_id = @facility_id;
    
    -- Calculate improvement factor (efficiency increases over time)
    RETURN POWER(1 - @base_improvement, @years_passed);
END;
GO

-- Create procedure for generating comprehensive time series data
CREATE PROCEDURE GenerateAppleTimeSeriesData
AS
BEGIN
    DECLARE @StartDate DATE = '2014-01-01';
    DECLARE @EndDate DATE = '2024-01-19';
    DECLARE @CurrentDate DATE = @StartDate;
    
    WHILE @CurrentDate <= @EndDate
    BEGIN
        -- Generate base metrics for each facility
        DECLARE facility_cursor CURSOR FOR
        SELECT facility_id, facility_type
        FROM Facilities;
        
        DECLARE @facility_id INT, @facility_type NVARCHAR(50);
        
        OPEN facility_cursor;
        FETCH NEXT FROM facility_cursor INTO @facility_id, @facility_type;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Calculate factors
            DECLARE @seasonal_factor DECIMAL(10,4) = dbo.CalculateSeasonalFactor(@CurrentDate, @facility_id);
            DECLARE @tech_improvement DECIMAL(10,4) = dbo.CalculateTechImprovementFactor(@StartDate, @CurrentDate, @facility_id);
            
            -- Special factor for iPhone release months
            DECLARE @release_factor DECIMAL(10,4) = 
                CASE 
                    WHEN MONTH(@CurrentDate) = 9 AND @facility_type = 'Assembly' THEN 2.0
                    WHEN MONTH(@CurrentDate) IN (7,8) AND @facility_type = 'Assembly' THEN 1.5
                    ELSE 1.0
                END;

            -- 1. Emissions_Master
            INSERT INTO Emissions_Master (
                facility_id, date, total_gross_emissions, total_net_emissions,
                verification_status, reporting_period, calculation_methodology, sector_emissions_json
            )
            VALUES (
                @facility_id,
                @CurrentDate,
                CASE @facility_type
                    WHEN 'Assembly' THEN 250.0
                    WHEN 'Semiconductor' THEN 400.0
                END * @seasonal_factor * @tech_improvement * @release_factor,
                CASE @facility_type
                    WHEN 'Assembly' THEN 250.0
                    WHEN 'Semiconductor' THEN 400.0
                END * @seasonal_factor * @tech_improvement * @release_factor * 
                (1 - (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.08)),
                'Verified',
                'Daily',
                'GHG Protocol',
                JSON_MODIFY(
                    JSON_MODIFY(
                        JSON_MODIFY('{}', '$.manufacturing', 65),
                        '$.facilities', 25),
                    '$.transport', 10)
            );

            DECLARE @emission_id INT = SCOPE_IDENTITY();

            -- 2. Scope1_Emissions
            INSERT INTO Scope1_Emissions (
                emission_id, date, source_type, fuel_type, quantity_consumed,
                emission_factor, calculated_emissions
            )
            SELECT
                @emission_id,
                @CurrentDate,
                source_type,
                fuel_type,
                base_quantity * @seasonal_factor * @tech_improvement,
                emission_factor,
                (base_quantity * @seasonal_factor * @tech_improvement * emission_factor)
            FROM (
                VALUES 
                    ('Natural Gas', 'Natural Gas', 1000.0, 0.185),
                    ('Diesel', 'Diesel Fuel', 500.0, 0.267),
                    ('Refrigerants', 'HFC', 100.0, 0.789)
            ) AS Sources(source_type, fuel_type, base_quantity, emission_factor);

            DECLARE @dept_id INT = (
                SELECT TOP 1 department_id 
                FROM Departments 
                WHERE facility_id = @facility_id 
                ORDER BY department_id
            );

            -- 3. Scope2_Emissions
            INSERT INTO Scope2_Emissions (
                emission_id, date, electricity_consumption, steam_consumption,
                cooling_consumption, heating_consumption, grid_emission_factor,
                location_based_emissions, market_based_emissions, department_id  -- Added column
            )
            VALUES (
                @emission_id,
                @CurrentDate,
                CASE @facility_type
                    WHEN 'Assembly' THEN 50000.0
                    WHEN 'Semiconductor' THEN 75000.0
                END * @seasonal_factor * @release_factor,
                CASE @facility_type
                    WHEN 'Assembly' THEN 20000.0
                    WHEN 'Semiconductor' THEN 30000.0
                END * @seasonal_factor,
                CASE @facility_type
                    WHEN 'Assembly' THEN 15000.0
                    WHEN 'Semiconductor' THEN 25000.0
                END * @seasonal_factor * 
                CASE WHEN MONTH(@CurrentDate) IN (6,7,8) THEN 1.5 ELSE 1.0 END,
                CASE @facility_type
                    WHEN 'Assembly' THEN 10000.0
                    WHEN 'Semiconductor' THEN 15000.0
                END * @seasonal_factor *
                CASE WHEN MONTH(@CurrentDate) IN (12,1,2) THEN 1.5 ELSE 1.0 END,
                0.5,
                NULL,
                NULL,
                @dept_id  -- Added value
            );

            -- 4. Daily Production and Costs
            INSERT INTO Daily_Summary (
                facility_id, date, total_production, total_emissions, 
                total_energy_consumed, total_costs, efficiency_metrics, department_metrics_json
            )
            VALUES (
                @facility_id,
                @CurrentDate,
                CASE @facility_type
                    WHEN 'Assembly' THEN 25000.0
                    WHEN 'Semiconductor' THEN 15000.0
                END * @seasonal_factor * @release_factor * (1 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.05)),
                CASE @facility_type
                    WHEN 'Assembly' THEN 250.0
                    WHEN 'Semiconductor' THEN 400.0
                END * @seasonal_factor * @tech_improvement,
                CASE @facility_type
                    WHEN 'Assembly' THEN 75000.0
                    WHEN 'Semiconductor' THEN 100000.0
                END * @seasonal_factor * @tech_improvement,
                CASE @facility_type
                    WHEN 'Assembly' THEN 1000000.0
                    WHEN 'Semiconductor' THEN 1500000.0
                END * @seasonal_factor * @release_factor * (1 - (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.03)),
                0.75 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.02),
                JSON_MODIFY(
                    JSON_MODIFY(
                        JSON_MODIFY('{}', '$.production', 0.85 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.01)),
                        '$.quality', 0.90 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.005)),
                    '$.maintenance', 0.88 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.008))
            );

            -- 5. Monthly Reports (first day of each month)
            IF DAY(@CurrentDate) = 1
            BEGIN
                INSERT INTO Monthly_Reports (
                    facility_id, year_month, total_emissions, total_costs,
                    total_production, efficiency_metrics, performance_vs_target, department_metrics_json
                )
                SELECT
                    facility_id,
                    @CurrentDate,
                    SUM(total_emissions),
                    SUM(total_costs),
                    SUM(total_production),
                    AVG(efficiency_metrics),
                    95.0 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.5),
                    JSON_MODIFY(
                        JSON_MODIFY(
                            JSON_MODIFY('{}', '$.production', AVG(CAST(JSON_VALUE(department_metrics_json, '$.production') AS FLOAT))),
                            '$.quality', AVG(CAST(JSON_VALUE(department_metrics_json, '$.quality') AS FLOAT))),
                        '$.maintenance', AVG(CAST(JSON_VALUE(department_metrics_json, '$.maintenance') AS FLOAT)))
                FROM Daily_Summary
                WHERE facility_id = @facility_id
                AND date >= DATEADD(DAY, -30, @CurrentDate)
                AND date < @CurrentDate
                GROUP BY facility_id;

                -- 6. Generate monthly operational costs
                INSERT INTO Operational_Costs_Master (
                    facility_id, date, category, amount, currency,
                    cost_center, payment_status
                )
                SELECT
                    @facility_id,
                    @CurrentDate,
                    category,
                    base_amount * @seasonal_factor * @release_factor * 
                    (1 - (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.02)),
                    'USD',
                    CASE 
                        WHEN category = 'Labor' THEN 'CC001'
                        WHEN category = 'Materials' THEN 'CC002'
                        ELSE 'CC003'
                    END,
                    'Paid'
                FROM (
                    VALUES 
                        ('Labor', CASE @facility_type
                                    WHEN 'Assembly' THEN 2000000.0
                                    WHEN 'Semiconductor' THEN 2500000.0
                                 END),
                        ('Materials', CASE @facility_type
                                       WHEN 'Assembly' THEN 3000000.0
                                       WHEN 'Semiconductor' THEN 4000000.0
                                    END),
                        ('Overhead', CASE @facility_type
                                      WHEN 'Assembly' THEN 1000000.0
                                      WHEN 'Semiconductor' THEN 1500000.0
                                   END)
                ) AS Costs(category, base_amount);
            END;

            FETCH NEXT FROM facility_cursor INTO @facility_id, @facility_type;
        END;
        
        CLOSE facility_cursor;
        DEALLOCATE facility_cursor;
        SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
    END;
END;
GO

CREATE PROCEDURE GenerateAdditionalTimeSeriesData
AS
BEGIN
    DECLARE @StartDate DATE = '2014-01-01';
    DECLARE @EndDate DATE = '2024-01-19';
    DECLARE @CurrentDate DATE = @StartDate;
    
    WHILE @CurrentDate <= @EndDate
    BEGIN
        -- Generate monthly data
        IF DAY(@CurrentDate) = 1
        BEGIN
            -- 1. Labor_Costs (Monthly)
            INSERT INTO Labor_Costs (
                facility_id, department_id, employee_count, regular_hours_cost,
                overtime_cost, benefits_cost, training_cost, period_start_date, period_end_date
            )
            SELECT 
                f.facility_id,
                d.department_id,
                CASE f.facility_type
                    WHEN 'Assembly' THEN 5000
                    WHEN 'Semiconductor' THEN 3000
                END * dbo.CalculateSeasonalFactor(@CurrentDate, f.facility_id),
                CASE f.facility_type
                    WHEN 'Assembly' THEN 2500000
                    WHEN 'Semiconductor' THEN 3000000
                END * dbo.CalculateSeasonalFactor(@CurrentDate, f.facility_id) * 
                (1 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.03)),
                CASE f.facility_type
                    WHEN 'Assembly' THEN 500000
                    WHEN 'Semiconductor' THEN 400000
                END * 
                CASE WHEN MONTH(@CurrentDate) IN (7,8,9) THEN 2.0 ELSE 1.0 END *
                dbo.CalculateSeasonalFactor(@CurrentDate, f.facility_id),
                CASE f.facility_type
                    WHEN 'Assembly' THEN 750000
                    WHEN 'Semiconductor' THEN 900000
                END * (1 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.02)),
                CASE f.facility_type
                    WHEN 'Assembly' THEN 250000
                    WHEN 'Semiconductor' THEN 300000
                END,
                @CurrentDate,
                EOMONTH(@CurrentDate)
            FROM Facilities f
            CROSS JOIN Departments d
            WHERE d.facility_id = f.facility_id;

            -- 2. Utility_Costs (Monthly)
            INSERT INTO Utility_Costs (
                facility_id, utility_type, billing_period, consumption_amount,
                rate_per_unit, total_cost, peak_usage_charges, additional_fees, department_id
            )
            SELECT 
                f.facility_id,
                u.utility_type,
                @CurrentDate,
                u.base_consumption * 
                dbo.CalculateSeasonalFactor(@CurrentDate, f.facility_id) *
                dbo.CalculateTechImprovementFactor(@StartDate, @CurrentDate, f.facility_id),
                u.rate,
                (u.base_consumption * u.rate) * 
                dbo.CalculateSeasonalFactor(@CurrentDate, f.facility_id) *
                dbo.CalculateTechImprovementFactor(@StartDate, @CurrentDate, f.facility_id),
                CASE 
                    WHEN MONTH(@CurrentDate) IN (6,7,8) THEN u.base_peak_charge * 1.5
                    ELSE u.base_peak_charge
                END,
                u.base_fees,
                d.department_id
            FROM Facilities f
            CROSS JOIN (
                VALUES 
                    ('Electricity', 1000000, 0.15, 50000, 10000),
                    ('Water', 500000, 0.05, 25000, 5000),
                    ('Gas', 300000, 0.08, 15000, 3000)
            ) AS u(utility_type, base_consumption, rate, base_peak_charge, base_fees)
            CROSS JOIN Departments d
            WHERE d.facility_id = f.facility_id;

            -- 3. Carbon_Credits (Monthly purchases)
            INSERT INTO Carbon_Credits (
                company_id, purchase_date, expiry_date, quantity, price_per_unit,
                total_cost, project_type, verification_standard, retirement_status, registry_number
            )
            SELECT 
                c.company_id,
                @CurrentDate,
                DATEADD(YEAR, 5, @CurrentDate),
                100000 * (1 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.1)),
                CASE 
                    WHEN p.project_type = 'Renewable Energy' THEN 15
                    WHEN p.project_type = 'Reforestation' THEN 12
                    ELSE 10
                END,
                100000 * (1 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.1)) *
                CASE 
                    WHEN p.project_type = 'Renewable Energy' THEN 15
                    WHEN p.project_type = 'Reforestation' THEN 12
                    ELSE 10
                END,
                p.project_type,
                'Gold Standard',
                'Active',
                'CR-' + CONVERT(VARCHAR(10), YEAR(@CurrentDate)) + '-' + 
                CONVERT(VARCHAR(10), MONTH(@CurrentDate)) + '-' + 
                CONVERT(VARCHAR(10), ABS(CHECKSUM(NEWID())) % 10000)
            FROM Companies c
            CROSS JOIN (
                VALUES 
                    ('Renewable Energy'),
                    ('Reforestation'),
                    ('Methane Capture')
            ) AS p(project_type)
            WHERE c.company_name = 'Apple Inc.';

            -- 4. Renewable_Energy_Offsets (Monthly generation)
            INSERT INTO Renewable_Energy_Offsets (
                facility_id, date, source_type, energy_generated, emissions_offset,
                certification_type, verification_status, cost_savings
            )
            SELECT 
                f.facility_id,
                @CurrentDate,
                s.source_type,
                s.base_generation * 
                dbo.CalculateSeasonalFactor(@CurrentDate, f.facility_id) *
                (1 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.15)),
                s.base_generation * 0.5 * 
                dbo.CalculateSeasonalFactor(@CurrentDate, f.facility_id) *
                (1 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.15)),
                'REC',
                'Verified',
                s.base_generation * 0.12 * 
                (1 + (DATEDIFF(YEAR, @StartDate, @CurrentDate) * 0.05))
            FROM Facilities f
            CROSS JOIN (
                VALUES 
                    ('Solar', 1000000),
                    ('Wind', 800000),
                    ('Biomass', 500000)
            ) AS s(source_type, base_generation);
        END;

        -- 5. Maintenance_Costs (Daily for equipment)
        INSERT INTO Maintenance_Costs (
            equipment_id, maintenance_date, cost_amount, maintenance_type,
            labor_hours, parts_cost, downtime_cost, service_provider
        )
        SELECT 
            e.equipment_id,
            @CurrentDate,
            CASE 
                WHEN e.type = 'Surface Mount' THEN 5000
                WHEN e.type = 'Semiconductor' THEN 8000
                ELSE 3000
            END * dbo.CalculateTechImprovementFactor(@StartDate, @CurrentDate, f.facility_id),
            CASE 
                WHEN DAY(@CurrentDate) = 1 THEN 'Preventive'
                WHEN DATEPART(dw, @CurrentDate) = 1 THEN 'Routine'
                ELSE 'Emergency'
            END,
            CASE 
                WHEN DAY(@CurrentDate) = 1 THEN 8.0
                WHEN DATEPART(dw, @CurrentDate) = 1 THEN 4.0
                ELSE 2.0
            END,
            CASE 
                WHEN e.type = 'Surface Mount' THEN 2000
                WHEN e.type = 'Semiconductor' THEN 3000
                ELSE 1000
            END * (1 + (DATEDIFF(YEAR, e.installation_date, @CurrentDate) * 0.1)),
            CASE 
                WHEN DATEDIFF(YEAR, e.installation_date, @CurrentDate) < 2 THEN 10000
                ELSE 5000
            END,
            'Apple Authorized Service Provider'
        FROM Equipment e
        JOIN Production_Lines pl ON e.line_id = pl.line_id
        JOIN Facilities f ON pl.facility_id = f.facility_id
        WHERE DATEPART(dw, @CurrentDate) = 1
           OR DAY(@CurrentDate) = 1
           OR (ABS(CHECKSUM(NEWID())) % 100) < 10;

        SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
    END;
END;
GO

-- Execute the data generation procedures
EXEC GenerateAppleTimeSeriesData;
EXEC GenerateAdditionalTimeSeriesData;

DECLARE @apple_id INT = (SELECT company_id FROM Companies WHERE company_name = 'Apple Inc.');
DECLARE @cleanenergy_id INT = (SELECT company_id FROM Companies WHERE company_name = 'CleanEnergy Corp');

-- Add sustainability goals
INSERT INTO Sustainability_Goals (company_id, target_description, target_value, target_date, 
                                current_progress, initiative_status)
VALUES
(@apple_id, 'Carbon Neutral Operations', 100.00, '2030-12-31', 75.50, 'In Progress'),
(@cleanenergy_id, '100% Renewable Energy', 100.00, '2025-12-31', 88.20, 'In Progress');