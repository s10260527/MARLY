
-- Drop Tables if they exist
DROP TABLE IF EXISTS Companies;
DROP TABLE IF EXISTS Emissions;
-- Drop the CompanySectors table if it exists
DROP TABLE IF EXISTS CompanySectors;

-- Create Companies Table
CREATE TABLE Companies
(
    company_id INT PRIMARY KEY IDENTITY(1,1),
    company_name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(255),
    country VARCHAR(255),
    city VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);

-- Create Emissions Table
CREATE TABLE Emissions
(
    emission_id INT PRIMARY KEY IDENTITY(1,1),
    company_id INT,
    emission_year INT,
    emission_amount DECIMAL(10, 2),
    -- in metric tons, for example
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
);

-- Create CompanySectors table
CREATE TABLE CompanySectors
(
    sector_id INT PRIMARY KEY IDENTITY(1,1),
    company_id INT,
    sector_name VARCHAR(255) NOT NULL,
    emission_amount DECIMAL(10, 2),
    -- emission amount in metric tons
    fiscal_year INT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
);

-- Insert sample data for manufacturing companies
INSERT INTO Companies
    (company_name, industry_type, country, city, contact_email, contact_phone)
VALUES
    ('Microsoft', 'Manufacturing', 'USA', 'Seattle', 'contact@microsoft.com', '425-882-8080'),
    ('Toyota', 'Manufacturing', 'Japan', 'Toyota City', 'contact@toyota.co.jp', '81-565-28-2121'),
    ('Samsung', 'Manufacturing', 'South Korea', 'Seoul', 'contact@samsung.com', '82-2-2053-3000'),
    ('Nestle', 'Manufacturing', 'Switzerland', 'Vevey', 'contact@nestle.com', '41-21-924-1111'),
    ('Volkswagen', 'Manufacturing', 'Germany', 'Wolfsburg', 'contact@volkswagen.de', '49-5361-90'),
    ('BP', 'Manufacturing', 'United Kingdom', 'London', 'contact@bp.com', '44-207-496-4000'),
    ('ExxonMobil', 'Manufacturing', 'USA', 'Irving', 'contact@exxonmobil.com', '972-444-1000'),
    ('Amazon', 'Manufacturing', 'USA', 'Seattle', 'contact@amazon.com', '206-266-1000'),
    ('Sony', 'Manufacturing', 'Japan', 'Tokyo', 'contact@sony.jp', '81-3-6748-2111'),
    ('L’Oréal', 'Manufacturing', 'France', 'Paris', 'contact@loreal.com', '33-1-47-56-70-00');

-- Insert emission data for manufacturing companies for the year 2024
INSERT INTO Emissions
    (company_id, emission_year, emission_amount)
VALUES
    (1, 2024, 1200.50),
    -- Microsoft
    (2, 2024, 1500.00),
    -- Toyota
    (3, 2024, 1700.75),
    -- Samsung
    (4, 2024, 1100.25),
    -- Nestle
    (5, 2024, 1250.00),
    -- Volkswagen
    (6, 2024, 980.45),
    -- BP
    (7, 2024, 1420.60),
    -- ExxonMobil
    (8, 2024, 1600.10),
    -- Amazon
    (9, 2024, 1350.30),
    -- Sony
    (10, 2024, 900.00);
-- L’Oréal

-- Insert additional emissions for each manufacturing company

-- Insert sample data into CompanySectors table based on the sectors identified in the Apple report
INSERT INTO CompanySectors
    (company_id, sector_name, emission_amount, fiscal_year)
VALUES
    -- Manufacturing emissions for each company
    (1, 'Manufacturing', 950.00, 2024),
    -- Microsoft
    (2, 'Manufacturing', 1200.00, 2024),
    -- Toyota
    (3, 'Manufacturing', 1100.75, 2024),
    -- Samsung
    (4, 'Manufacturing', 800.50, 2024),
    -- Nestle
    (5, 'Manufacturing', 900.00, 2024),
    -- Volkswagen

    -- Transportation emissions for each company
    (1, 'Transportation', 250.00, 2024),
    -- Microsoft
    (2, 'Transportation', 300.00, 2024),
    -- Toyota
    (3, 'Transportation', 320.50, 2024),
    -- Samsung
    (4, 'Transportation', 200.00, 2024),
    -- Nestle
    (5, 'Transportation', 280.00, 2024),
    -- Volkswagen

    -- Product Use emissions for each company
    (1, 'Product Use', 180.00, 2024),
    -- Microsoft
    (2, 'Product Use', 210.00, 2024),
    -- Toyota
    (3, 'Product Use', 250.00, 2024),
    -- Samsung
    (4, 'Product Use', 170.00, 2024),
    -- Nestle
    (5, 'Product Use', 190.00, 2024),
    -- Volkswagen

    -- Electricity emissions for each company
    (1, 'Electricity', 120.00, 2024),
    -- Microsoft
    (2, 'Electricity', 130.00, 2024),
    -- Toyota
    (3, 'Electricity', 145.00, 2024),
    -- Samsung
    (4, 'Electricity', 110.00, 2024),
    -- Nestle
    (5, 'Electricity', 135.00, 2024);
-- Volkswagen

-- Insert data for the past four years (2021 to 2024) in the CompanySectors table
-- Data for 2021
INSERT INTO CompanySectors
    (company_id, sector_name, emission_amount, fiscal_year)
VALUES
    (1, 'Manufacturing', 940.00, 2021),
    (1, 'Transportation', 240.00, 2021),
    (1, 'Product Use', 170.00, 2021),
    (1, 'Electricity', 115.00, 2021),

    (2, 'Manufacturing', 1150.00, 2021),
    (2, 'Transportation', 290.00, 2021),
    (2, 'Product Use', 200.00, 2021),
    (2, 'Electricity', 125.00, 2021);

-- Add similar records for other companies (3 to 10) for the year 2021

-- Data for 2022
INSERT INTO CompanySectors
    (company_id, sector_name, emission_amount, fiscal_year)
VALUES
    (1, 'Manufacturing', 945.00, 2022),
    (1, 'Transportation', 245.00, 2022),
    (1, 'Product Use', 175.00, 2022),
    (1, 'Electricity', 120.00, 2022),

    (2, 'Manufacturing', 1170.00, 2022),
    (2, 'Transportation', 295.00, 2022),
    (2, 'Product Use', 205.00, 2022),
    (2, 'Electricity', 130.00, 2022);

-- Add similar records for other companies (3 to 10) for the year 2022

-- Data for 2023
INSERT INTO CompanySectors
    (company_id, sector_name, emission_amount, fiscal_year)
VALUES
    (1, 'Manufacturing', 960.00, 2023),
    (1, 'Transportation', 250.00, 2023),
    (1, 'Product Use', 180.00, 2023),
    (1, 'Electricity', 125.00, 2023),

    (2, 'Manufacturing', 1190.00, 2023),
    (2, 'Transportation', 300.00, 2023),
    (2, 'Product Use', 210.00, 2023),
    (2, 'Electricity', 135.00, 2023);

-- Add similar records for other companies (3 to 10) for the year 2023

-- November 2024 emissions
INSERT INTO Emissions
    (company_id, emission_year, emission_amount, created_at)
VALUES
    (1, 2024, 1300.00, GETDATE()),
    -- Microsoft
    (2, 2024, 1600.00, GETDATE()),
    -- Toyota
    (3, 2024, 1800.00, GETDATE()),
    -- Samsung
    (4, 2024, 1200.00, GETDATE()),
    -- Nestle
    (5, 2024, 1400.00, GETDATE()),
    -- Volkswagen
    (6, 2024, 1000.00, GETDATE()),
    -- BP
    (7, 2024, 1500.00, GETDATE()),
    -- ExxonMobil
    (8, 2024, 1700.00, GETDATE()),
    -- Amazon
    (9, 2024, 1450.00, GETDATE()),
    -- Sony
    (10, 2024, 950.00, GETDATE());
-- L’Oréal

-- October 2024 emissions
INSERT INTO Emissions
    (company_id, emission_year, emission_amount, created_at)
VALUES
    (1, 2024, 1250.00, DATEADD(MONTH, -1, GETDATE())),
    -- Microsoft
    (2, 2024, 1550.00, DATEADD(MONTH, -1, GETDATE())),
    -- Toyota
    (3, 2024, 1750.00, DATEADD(MONTH, -1, GETDATE())),
    -- Samsung
    (4, 2024, 1150.00, DATEADD(MONTH, -1, GETDATE())),
    -- Nestle
    (5, 2024, 1350.00, DATEADD(MONTH, -1, GETDATE())),
    -- Volkswagen
    (6, 2024, 980.00, DATEADD(MONTH, -1, GETDATE())),
    -- BP
    (7, 2024, 1450.00, DATEADD(MONTH, -1, GETDATE())),
    -- ExxonMobil
    (8, 2024, 1650.00, DATEADD(MONTH, -1, GETDATE())),
    -- Amazon
    (9, 2024, 1400.00, DATEADD(MONTH, -1, GETDATE())),
    -- Sony
    (10, 2024, 920.00, DATEADD(MONTH, -1, GETDATE()));
-- L’Oréal

ALTER TABLE Companies
ADD hashed_password VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Main Sectors table
CREATE TABLE sectors (
    sector_id INT PRIMARY KEY,
    company_id INT,
    sector_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);

-- Sub-sectors table
CREATE TABLE sub_sectors (
    sub_sector_id INT PRIMARY KEY,
    sector_id INT,
    company_id INT,
    sub_sector_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sector_id) REFERENCES sectors(sector_id),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);

-- Carbon Emissions Tracking
CREATE TABLE carbon_emissions (
    emission_id INT PRIMARY KEY,
    sub_sector_id INT,
    company_id INT,
    date DATE NOT NULL,
    gross_emissions DECIMAL(10,2) NOT NULL, -- in tonnes CO2e
    emissions_source VARCHAR(100), -- e.g., 'electricity', 'fuel', 'process'
    sustainable_offset DECIMAL(10,2) DEFAULT 0.00, -- offset by sustainable sources
    credit_offset DECIMAL(10,2) DEFAULT 0.00, -- offset by carbon credits
    net_emissions DECIMAL(10,2), -- gross_emissions - (sustainable_offset + credit_offset)
    notes TEXT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sub_sector_id) REFERENCES sub_sectors(sub_sector_id),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);

-- Carbon Offset Details
CREATE TABLE carbon_offset_details (
    offset_id INT PRIMARY KEY,
    emission_id INT,
    offset_type VARCHAR(50), -- 'sustainable' or 'credit'
    offset_source VARCHAR(100), -- e.g., 'solar panels', 'wind energy', 'carbon credit provider'
    amount DECIMAL(10,2),
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    verification_reference VARCHAR(100),
    valid_from DATE,
    valid_until DATE,
    notes TEXT,
    FOREIGN KEY (emission_id) REFERENCES carbon_emissions(emission_id)
);

-- Energy Consumption Tracking
CREATE TABLE energy_consumption (
    consumption_id INT PRIMARY KEY,
    sub_sector_id INT,
    company_id INT,
    date DATE NOT NULL,
    energy_type VARCHAR(50), -- e.g., 'electricity', 'natural gas', 'diesel'
    amount DECIMAL(10,2), -- in appropriate unit (kWh, m3, L)
    unit VARCHAR(20), -- 'kWh', 'm3', 'L'
    source VARCHAR(50), -- 'grid', 'solar', 'generator'
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sub_sector_id) REFERENCES sub_sectors(sub_sector_id),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);

-- Operational Costs Tracking
CREATE TABLE operational_costs (
    cost_id INT PRIMARY KEY,
    sub_sector_id INT,
    company_id INT,
    date DATE NOT NULL,
    cost_category VARCHAR(50), -- e.g., 'labor', 'maintenance', 'supplies'
    description TEXT,
    amount DECIMAL(10,2),
    payment_status VARCHAR(20), -- 'paid', 'pending', 'approved'
    payment_date DATE,
    invoice_reference VARCHAR(100),
    notes TEXT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sub_sector_id) REFERENCES sub_sectors(sub_sector_id),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);

-- Monthly Summaries
CREATE TABLE monthly_summaries (
    summary_id INT PRIMARY KEY,
    sub_sector_id INT,
    company_id INT,
    year INT,
    month INT,
    total_emissions DECIMAL(10,2),
    total_sustainable_offset DECIMAL(10,2),
    total_credit_offset DECIMAL(10,2),
    net_emissions DECIMAL(10,2),
    total_energy_consumption DECIMAL(10,2),
    total_operational_costs DECIMAL(10,2),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sub_sector_id) REFERENCES sub_sectors(sub_sector_id),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id)
);
