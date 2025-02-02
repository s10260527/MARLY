-- -- RESET DATABASE (Clear all schema objects)-------------------------------
-- USE MARLY;
-- GO

-- DECLARE @sql NVARCHAR(MAX) = '';

-- -- 1. Drop Foreign Keys
-- SELECT @sql += 
--     'ALTER TABLE ' + 
--     QUOTENAME(SCHEMA_NAME(t.schema_id)) + '.' + QUOTENAME(t.name) + 
--     ' DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';'
-- FROM sys.foreign_keys AS fk
-- INNER JOIN sys.tables AS t ON fk.parent_object_id = t.object_id;

-- -- 2. Drop Tables
-- SELECT @sql += 
--     'DROP TABLE ' + 
--     QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';'
-- FROM sys.tables;

-- -- 3. Drop Views
-- SELECT @sql += 
--     'DROP VIEW ' + 
--     QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';'
-- FROM sys.views;

-- -- 4. Drop Stored Procedures
-- SELECT @sql += 
--     'DROP PROCEDURE ' + 
--     QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';'
-- FROM sys.procedures;

-- -- 5. Drop Functions
-- SELECT @sql += 
--     'DROP FUNCTION ' + 
--     QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';'
-- FROM sys.objects 
-- WHERE type IN ('FN', 'IF', 'TF', 'FS', 'FT');  -- Scalar, inline, table-valued functions

-- -- Execute all DROP statements
-- EXEC sp_executesql @sql;
-- -- RESET DATABASE END -------------------------------------------------------



-- -- Create the database
-- CREATE DATABASE MARLY;
-- GO



USE MARLY;
GO




-- Enable JSON support
ALTER DATABASE MARLY SET COMPATIBILITY_LEVEL = 130;
GO

CREATE TABLE Companies (
    company_id INT IDENTITY(1,1) PRIMARY KEY,
    company_name NVARCHAR(100) NOT NULL,
    registration_number NVARCHAR(50) NOT NULL,
    company_size NVARCHAR(20),
    annual_revenue_range NVARCHAR(50),
    established_date DATE,
    headquarters_location NVARCHAR(200),
    sustainability_commitment_level NVARCHAR(20),
    baseline_year INT,
    campaign_participant BIT NOT NULL DEFAULT 0, -- Added from seed.sql
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);



-- CAMPAIGN TABLES ----------------------------------
CREATE TABLE Post_Details
(
    post_id INT IDENTITY(1,1) PRIMARY KEY,
	company_id INT,
    company_name VARCHAR(255) NOT NULL,
	poster_url VARCHAR(255),
	poster_name VARCHAR(255),
    likes INT,
    poster_img NVARCHAR(MAX),
    post_date DATETIME NOT NULL
	FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE

);

CREATE TABLE Campaigns (
    campaign_id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL,
    campaign_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
);

CREATE TABLE Campaign_participants (
    campaign_id INT NOT NULL,
    company_id INT NOT NULL,
    participation_date DATE NOT NULL DEFAULT GETDATE(),
    status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id),
    FOREIGN KEY (campaign_id) REFERENCES Campaigns(campaign_id),
    PRIMARY KEY (campaign_id, company_id) -- Composite key
);
-- END OF CAMPAIGN TABLES -----------------------------



CREATE TABLE Facilities (
    facility_id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL,
    facility_name NVARCHAR(100) NOT NULL,
    location_coordinates GEOGRAPHY,
    facility_size_sqft DECIMAL(10,2),
    facility_type NVARCHAR(50),
    production_capacity INT,
    operating_hours NVARCHAR(100),
    sector_type NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);

CREATE TABLE Departments (
    department_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    department_name NVARCHAR(100) NOT NULL,
    department_code NVARCHAR(20),
    cost_center NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id)
);

CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    username NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL,
    department_id INT,
    last_login DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

-- MANUFACTURING DATA TABLES
CREATE TABLE Production_Lines (
    line_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    line_name NVARCHAR(100) NOT NULL,
    product_type NVARCHAR(50),
    capacity_per_hour DECIMAL(10,2),
    energy_consumption_rate DECIMAL(10,2),
    status NVARCHAR(20),
    installation_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id)
);

CREATE TABLE Equipment (
    equipment_id INT IDENTITY(1,1) PRIMARY KEY,
    line_id INT NOT NULL,
    equipment_name NVARCHAR(100) NOT NULL,
    type NVARCHAR(50),
    manufacturer NVARCHAR(100),
    model_number NVARCHAR(50),
    installation_date DATE,
    efficiency_rating DECIMAL(5,2),
    power_rating DECIMAL(10,2),
    operational_status NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (line_id) REFERENCES Production_Lines(line_id)
);

-- EMISSIONS TRACKING TABLES
CREATE TABLE Emissions_Master (
    emission_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    date DATE NOT NULL,
    total_gross_emissions DECIMAL(10,2),
    total_net_emissions DECIMAL(10,2),
    verification_status NVARCHAR(20),
    reporting_period NVARCHAR(50),
    calculation_methodology NVARCHAR(100),
    sector_emissions_json NVARCHAR(MAX), -- Stored as JSON
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id),
    CONSTRAINT [Check_If_JSON] CHECK (ISJSON(sector_emissions_json)=1)
);

CREATE TABLE Scope1_Emissions (
    scope1_id INT IDENTITY(1,1) PRIMARY KEY,
    emission_id INT NOT NULL,
    date DATE NOT NULL,
    source_type NVARCHAR(50),
    fuel_type NVARCHAR(50),
    quantity_consumed DECIMAL(10,2),
    emission_factor DECIMAL(10,4),
    calculated_emissions DECIMAL(10,2),
    measurement_unit NVARCHAR(20),
    data_quality_rating NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (emission_id) REFERENCES Emissions_Master(emission_id)
);

CREATE TABLE Scope2_Emissions (
    scope2_id INT IDENTITY(1,1) PRIMARY KEY,
    emission_id INT NOT NULL,
    date DATE NOT NULL,
    electricity_consumption DECIMAL(10,2),
    steam_consumption DECIMAL(10,2),
    cooling_consumption DECIMAL(10,2),
    heating_consumption DECIMAL(10,2),
    grid_emission_factor DECIMAL(10,4),
    location_based_emissions DECIMAL(10,2),
    market_based_emissions DECIMAL(10,2),
    department_id INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (emission_id) REFERENCES Emissions_Master(emission_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

CREATE TABLE Scope3_Emissions (
    scope3_id INT IDENTITY(1,1) PRIMARY KEY,
    emission_id INT NOT NULL,
    date DATE NOT NULL,
    category NVARCHAR(100),
    activity_data DECIMAL(10,2),
    emission_factor DECIMAL(10,4),
    calculated_emissions DECIMAL(10,2),
    data_source NVARCHAR(100),
    uncertainty_range NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (emission_id) REFERENCES Emissions_Master(emission_id)
);

-- OFFSETS AND CREDITS TABLES
CREATE TABLE Renewable_Energy_Offsets (
    offset_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    date DATE NOT NULL,
    source_type NVARCHAR(50),
    energy_generated DECIMAL(10,2),
    emissions_offset DECIMAL(10,2),
    certification_type NVARCHAR(50),
    verification_status NVARCHAR(20),
    cost_savings DECIMAL(10,2),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id)
);

CREATE TABLE Carbon_Credits (
    credit_id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL,
    purchase_date DATE,
    expiry_date DATE,
    quantity DECIMAL(10,2),
    price_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    project_type NVARCHAR(100),
    verification_standard NVARCHAR(50),
    retirement_status NVARCHAR(20),
    registry_number NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);

-- OPERATIONAL COSTS TABLES
CREATE TABLE Operational_Costs_Master (
    cost_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    date DATE NOT NULL,
    category NVARCHAR(50),
    amount DECIMAL(10,2),
    currency NVARCHAR(3),
    cost_center NVARCHAR(50),
    payment_status NVARCHAR(20),
    billing_cycle NVARCHAR(20),
    recurring_status NVARCHAR(20),
    department_id INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

CREATE TABLE Utility_Costs (
    utility_cost_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    utility_type NVARCHAR(50),
    billing_period DATE,
    consumption_amount DECIMAL(10,2),
    rate_per_unit DECIMAL(10,4),
    total_cost DECIMAL(10,2),
    peak_usage_charges DECIMAL(10,2),
    additional_fees DECIMAL(10,2),
    department_id INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

CREATE TABLE Labor_Costs (
    labor_cost_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    department_id INT NOT NULL,
    employee_count INT,
    regular_hours_cost DECIMAL(10,2),
    overtime_cost DECIMAL(10,2),
    benefits_cost DECIMAL(10,2),
    training_cost DECIMAL(10,2),
    period_start_date DATE,
    period_end_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

CREATE TABLE Maintenance_Costs (
    maintenance_id INT IDENTITY(1,1) PRIMARY KEY,
    equipment_id INT NOT NULL,
    maintenance_date DATE,
    cost_amount DECIMAL(10,2),
    maintenance_type NVARCHAR(50),
    labor_hours DECIMAL(5,2),
    parts_cost DECIMAL(10,2),
    downtime_cost DECIMAL(10,2),
    service_provider NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (equipment_id) REFERENCES Equipment(equipment_id)
);

-- SUSTAINABILITY GOALS AND TRACKING TABLES
CREATE TABLE Sustainability_Goals (
    goal_id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL,
    target_description NVARCHAR(MAX),
    target_value DECIMAL(10,2),
    target_date DATE,
    current_progress DECIMAL(5,2),
    initiative_status NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);

CREATE TABLE Daily_Summary (
    summary_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    date DATE NOT NULL,
    total_production DECIMAL(10,2),
    total_emissions DECIMAL(10,2),
    total_energy_consumed DECIMAL(10,2),
    total_costs DECIMAL(10,2),
    efficiency_metrics DECIMAL(10,2),
    department_metrics_json NVARCHAR(MAX), -- Stored as JSON
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id),
    CONSTRAINT [Check_Daily_Summary_JSON] CHECK (ISJSON(department_metrics_json)=1)
);

CREATE TABLE Monthly_Reports (
    report_id INT IDENTITY(1,1) PRIMARY KEY,
    facility_id INT NOT NULL,
    year_month DATE NOT NULL,
    total_emissions DECIMAL(10,2),
    total_costs DECIMAL(10,2),
    total_production DECIMAL(10,2),
    efficiency_metrics DECIMAL(10,2),
    performance_vs_target DECIMAL(5,2),
    department_metrics_json NVARCHAR(MAX), -- Stored as JSON
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id),
    CONSTRAINT [Check_Monthly_Reports_JSON] CHECK (ISJSON(department_metrics_json)=1)
);

-- REFERENCE TABLES
CREATE TABLE Emission_Factors (
    factor_id INT IDENTITY(1,1) PRIMARY KEY,
    source_type NVARCHAR(50),
    region NVARCHAR(50),
    factor_value DECIMAL(10,4),
    unit NVARCHAR(20),
    valid_from DATE,
    valid_to DATE,
    last_updated DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Cost_Categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(50) NOT NULL,
    description NVARCHAR(200),
    budget_allocation DECIMAL(10,2),
    cost_type NVARCHAR(50),
    accounting_code NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Create indexes for better query performance
CREATE INDEX idx_emissions_master_date ON Emissions_Master(date);
CREATE INDEX idx_facility_sector ON Facilities(sector_type);
CREATE INDEX idx_scope2_emissions_date ON Scope2_Emissions(date);
CREATE INDEX idx_utility_costs_period ON Utility_Costs(billing_period);
CREATE INDEX idx_daily_summary_date ON Daily_Summary(date);
CREATE INDEX idx_monthly_reports_yearmonth ON Monthly_Reports(year_month);