
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

-- Drop Users table if it exists
DROP TABLE IF EXISTS Users;

-- Create Users table
CREATE TABLE Users
(
    user_id INT PRIMARY KEY IDENTITY(1,1),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    agreed_to_terms BIT NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Insert sample data into Users table
INSERT INTO Users
    (full_name, email, password_hash, agreed_to_terms, created_at)
VALUES
    ('John Doe', 'john.doe@example.com', 'hashed_password_here', 1, '2024-10-24 15:30:56.230'),
    ('Jason Smith', 'JasonsCompany@gmail.com', '$2a$10$0ZFEsWP3fFEqM3zkKqHVUxbls8j0fJ0V/H4TqDoV...', 1, '2024-11-07 13:14:58.287');

ALTER TABLE Companies
ADD hashed_password VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

--Create Data for Monthly data--
CREATE TABLE monthly_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    month VARCHAR(3),
    year INT,
    carbon_emissions DECIMAL(5,2),
    energy_consumption INT,
    operational_costs DECIMAL(5,2)
);

--Insert sample data into monthly_data table--
-- Data for 2023
INSERT INTO monthly_data (month, year, carbon_emissions, energy_consumption, operational_costs) VALUES
('Jan', 2023, 10.00, 2000, 30.00),
('Feb', 2023, 11.00, 2100, 28.00),
('Mar', 2023, 13.00, 2200, 27.00),
('Apr', 2023, 12.00, 2150, 26.00),
('May', 2023, 15.00, 2250, 29.00),
('Jun', 2023, 14.00, 2300, 28.00),
('Jul', 2023, 18.00, 2400, 30.00),
('Aug', 2023, 17.00, 2450, 29.00),
('Sep', 2023, 16.00, 2500, 27.00),
('Oct', 2023, 19.00, 2550, 26.00),
('Nov', 2023, 20.00, 2600, 25.00),
('Dec', 2023, 21.00, 2650, 24.00);

-- Data for 2024
INSERT INTO monthly_data (month, year, carbon_emissions, energy_consumption, operational_costs) VALUES
('Jan', 2024, 22.00, 2700, 26.00),
('Feb', 2024, 20.00, 2750, 27.00),
('Mar', 2024, 19.00, 2800, 28.00),
('Apr', 2024, 18.00, 2850, 29.00),
('May', 2024, 21.00, 2900, 30.00),
('Jun', 2024, 20.00, 2950, 29.00),
('Jul', 2024, 23.00, 3000, 31.00),
('Aug', 2024, 22.00, 3050, 32.00),
('Sep', 2024, 24.00, 3100, 30.00),
('Oct', 2024, 23.00, 3150, 31.00);
