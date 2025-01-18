

-- Now drop the tables
DROP TABLE IF EXISTS Campaigns;
DROP TABLE IF EXISTS Post_Details;
DROP TABLE IF EXISTS Companies;
DROP TABLE IF EXISTS Sectors;
DROP TABLE IF EXISTS EmissionsData;
DROP TABLE IF EXISTS Subsectors;
DROP TABLE IF EXISTS sub_sectors;
DROP TABLE IF EXISTS MonthlyEnergyConsumption;
DROP TABLE IF EXISTS OperationalCosts;





-- Create Companies Table
CREATE TABLE Companies
(
    company_id INT PRIMARY KEY IDENTITY(1,1),
    company_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(100),
    industry_type VARCHAR(255),
    campaign_participant BIT,
    country VARCHAR(255),
    city VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Post_Details
(
    company_id INT PRIMARY KEY IDENTITY(1,1),
    company_name VARCHAR(255) NOT NULL,
	poster_name VARCHAR(255),
    likes INT,
    poster_img NVARCHAR(MAX),
    post_date DATETIME NOT NULL
);

CREATE TABLE Campaigns
(
    campaign_id INT PRIMARY KEY IDENTITY(1,1),
    -- Unique identifier for each campaign
    company_id INT,
    -- Foreign key to link to Companies table
    campaign_name NVARCHAR(100) NOT NULL,
    -- Name of the campaign
    description NVARCHAR(MAX) NOT NULL,
    -- Detailed description of the campaign
    start_date DATE NOT NULL,
    -- Start date of the campaign
    end_date DATE NOT NULL,
    -- End date of the campaign
    created_at DATETIME DEFAULT GETDATE(),
    -- Timestamp for when the campaign was created
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
);


-- Step 1: Create the Sectors table
CREATE TABLE Sectors
(
    sector_id INT PRIMARY KEY IDENTITY(1,1),
    sector_name NVARCHAR(255) NOT NULL
);

-- Step 2: Create the Subsectors table
CREATE TABLE Subsectors
(
    subsector_id INT PRIMARY KEY IDENTITY(1,1),
    subsector_name VARCHAR(255) NOT NULL,
    sector_id INT,
    FOREIGN KEY (sector_id) REFERENCES Sectors(sector_id)
);

-- Step 3: Create the EmissionsData table
CREATE TABLE EmissionsData
(
    company_id INT,
    sector_id INT NOT NULL,
    subsector_id INT NOT NULL,
    emission_date DATE NOT NULL,
    emission_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sector_id) REFERENCES Sectors(sector_id),
    FOREIGN KEY (subsector_id) REFERENCES Subsectors(subsector_id),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE NO ACTION

);

-- Insert mock data into Companies
INSERT INTO Companies
    (company_name, hashed_password, industry_type, campaign_participant, country, city, contact_email, contact_phone)
VALUES
    ('Apple Inc', '$2a$10$r8V1ec90pHSZl4GjLjnqR.tHMEBtGMFQjAWnUdgin6oadESeL3fza', 'Tech Manufacturing', 0, 'USA', 'New York', 'contact@Apple.com', '123-456-7890'),
    ('GreenTech Solutions', '$2a$10$r8V1ec90pHSZl4GjLjnqR.tHMEBtGMFQjAWnUdgin6oadESeL3fza', 'Tech Manufacturing', 1, 'Germany', 'Berlin', 'support@greentech.com', '234-567-8901'),
    ('Innovate Electronics', '$2a$10$r8V1ec90pHSZl4GjLjnqR.tHMEBtGMFQjAWnUdgin6oadESeL3fza', 'Electronics', 0, 'South Korea', 'Seoul', 'info@innovateelectronics.com', '345-678-9012'),
    ('EcoTech Industries', '$2a$10$r8V1ec90pHSZl4GjLjnqR.tHMEBtGMFQjAWnUdgin6oadESeL3fza', 'Tech Manufacturing', 1, 'Japan', 'Tokyo', 'contact@ecotechindustries.com', '456-789-0123'),
    ('SmartTech Corp.', '$2a$10$r8V1ec90pHSZl4GjLjnqR.tHMEBtGMFQjAWnUdgin6oadESeL3fza', 'Tech Manufacturing', 0, 'Singapore', 'Singapore', 'sales@smarttech.com', '567-890-1234');

-- Insert mock data into Recycable_device


-- Insert mock data into Campaigns
-- Inserting Tech No Trash campaign for Microsoft
INSERT INTO Campaigns
    (company_id, campaign_name, description, start_date, end_date)
VALUES
    (1, 'Tech To Trash', 'Encourage the recycling of electronic waste by setting up collection points in manufacturing facilities for old devices, parts, and batteries.', '2024-11-01', '2024-11-30');


-- Step 4: Insert mock data into Sectors
INSERT INTO Sectors
    (sector_name)
VALUES
    ('Electricity'),
    ('Transportation'),
    ('Manufacturing'),
    ('Waste Management'),
    ('Water Supply');

-- Step 5: Insert mock data into Subsectors
INSERT INTO Subsectors
    (subsector_name, sector_id)
VALUES
    ('Lighting', 1),
    ('Equipment', 1),
    ('Heating', 1),
    ('Cooling', 1),
    ('Other Electrical Uses', 1),
    ('Vehicles', 2),
    ('Logistics', 2),
    ('Public Transport', 2),
    ('Shipping', 2),
    ('Air Travel', 2),
    ('Machinery', 3),
    ('Processing', 3),
    ('Packaging', 3),
    ('Assembly', 3),
    ('Inspection', 3),
    ('Landfill', 4),
    ('Recycling', 4),
    ('Composting', 4),
    ('Hazardous Waste', 4),
    ('Wastewater', 4),
    ('Purification', 5),
    ('Distribution', 5),
    ('Leakage', 5),
    ('Irrigation', 5),
    ('Reservoir', 5);

-- Step 6: Insert mock data for a single company into EmissionsData
-- Generate mock data for each month from January 2024 to November 2024

-- Insert mock data for EmissionsData with company_id = 1

-- Insert for January 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-01-01', 150.50),
    (1, 1, 2, '2024-01-01', 120.30),
    (1, 3, 11, '2024-01-01', 95.75),
    (1, 2, 6, '2024-01-01', 200.60),
    (1, 2, 7, '2024-01-01', 180.40),
    (1, 3, 11, '2024-01-01', 130.25),
    (1, 4, 16, '2024-01-01', 75.20),
    (1, 5, 21, '2024-01-01', 40.10);

-- Insert for February 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-02-01', 140.80),
    (1, 1, 2, '2024-02-01', 110.20),
    (1, 1, 3, '2024-02-01', 100.10),
    (1, 2, 6, '2024-02-01', 190.50),
    (1, 2, 7, '2024-02-01', 170.80),
    (1, 3, 11, '2024-02-01', 120.35),
    (1, 4, 16, '2024-02-01', 80.90),
    (1, 5, 21, '2024-02-01', 45.50);

-- Insert for March 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-03-01', 135.20),
    (1, 1, 2, '2024-03-01', 115.30),
    (1, 1, 3, '2024-03-01', 110.15),
    (1, 2, 6, '2024-03-01', 185.75),
    (1, 2, 7, '2024-03-01', 165.65),
    (1, 3, 11, '2024-03-01', 125.40),
    (1, 4, 16, '2024-03-01', 78.50),
    (1, 5, 21, '2024-03-01', 42.30);

-- Insert for April 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-04-01', 145.60),
    (1, 1, 2, '2024-04-01', 118.40),
    (1, 1, 3, '2024-04-01', 105.25),
    (1, 2, 6, '2024-04-01', 190.90),
    (1, 2, 7, '2024-04-01', 175.60),
    (1, 3, 11, '2024-04-01', 128.30),
    (1, 4, 16, '2024-04-01', 82.60),
    (1, 5, 21, '2024-04-01', 46.80);

-- Insert for May 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-05-01', 155.40),
    (1, 1, 2, '2024-05-01', 121.20),
    (1, 1, 3, '2024-05-01', 112.50),
    (1, 2, 6, '2024-05-01', 198.20),
    (1, 2, 7, '2024-05-01', 180.80),
    (1, 3, 11, '2024-05-01', 132.45),
    (1, 4, 16, '2024-05-01', 85.10),
    (1, 5, 21, '2024-05-01', 49.60);

-- Insert for June 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-06-01', 148.25),
    (1, 1, 2, '2024-06-01', 113.50),
    (1, 1, 3, '2024-06-01', 108.70),
    (1, 2, 6, '2024-06-01', 193.10),
    (1, 2, 7, '2024-06-01', 172.40),
    (1, 3, 11, '2024-06-01', 130.55),
    (1, 4, 16, '2024-06-01', 80.30),
    (1, 5, 21, '2024-06-01', 44.10);

-- Insert for July 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-07-01', 160.75),
    (1, 1, 2, '2024-07-01', 125.10),
    (1, 1, 3, '2024-07-01', 118.60),
    (1, 2, 6, '2024-07-01', 202.30),
    (1, 2, 7, '2024-07-01', 185.40),
    (1, 3, 11, '2024-07-01', 136.25),
    (1, 4, 16, '2024-07-01', 88.10),
    (1, 5, 21, '2024-07-01', 51.50);

-- Insert for August 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-08-01', 155.10),
    (1, 1, 2, '2024-08-01', 121.40),
    (1, 1, 3, '2024-08-01', 111.90),
    (1, 2, 6, '2024-08-01', 199.80),
    (1, 2, 7, '2024-08-01', 178.30),
    (1, 3, 11, '2024-08-01', 133.00),
    (1, 4, 16, '2024-08-01', 84.40),
    (1, 5, 21, '2024-08-01', 47.90);

-- Insert for September 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-09-01', 150.00),
    (1, 1, 2, '2024-09-01', 116.60),
    (1, 1, 3, '2024-09-01', 107.30),
    (1, 2, 6, '2024-09-01', 194.10),
    (1, 2, 7, '2024-09-01', 173.50),
    (1, 3, 11, '2024-09-01', 129.80),
    (1, 4, 16, '2024-09-01', 79.90),
    (1, 5, 21, '2024-09-01', 43.40);

-- Insert for October 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-10-01', 145.90),
    (1, 1, 2, '2024-10-01', 118.30),
    (1, 1, 3, '2024-10-01', 102.75),
    (1, 2, 6, '2024-10-01', 191.40),
    (1, 2, 7, '2024-10-01', 171.20),
    (1, 3, 11, '2024-10-01', 127.00),
    (1, 4, 16, '2024-10-01', 77.60),
    (1, 5, 21, '2024-10-01', 41.20);

-- Insert for November 2024
INSERT INTO EmissionsData
    (company_id, sector_id, subsector_id, emission_date, emission_amount)
VALUES
    (1, 1, 1, '2024-11-01', 142.70),
    (1, 1, 2, '2024-11-01', 114.50),
    (1, 1, 3, '2024-11-01', 98.10),
    (1, 2, 6, '2024-11-01', 187.50),
    (1, 2, 7, '2024-11-01', 168.40),
    (1, 3, 11, '2024-11-01', 123.90),
    (1, 4, 16, '2024-11-01', 74.80),
    (1, 5, 21, '2024-11-01', 39.70);


-- Create MonthlyEnergyConsumption Table
CREATE TABLE MonthlyEnergyConsumption
(
    energy_id INT PRIMARY KEY IDENTITY(1,1),
    sector_id INT NOT NULL,
    subsector_id INT NULL,
    month DATE NOT NULL,
    total_energy DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sector_id) REFERENCES Sectors(sector_id),
    FOREIGN KEY (subsector_id) REFERENCES Subsectors(subsector_id)
);

-- Create OperationalCosts Table
CREATE TABLE OperationalCosts
(
    cost_id INT PRIMARY KEY IDENTITY(1,1),
    company_id INT,
    sector_id INT,
    month DATE,
    cost_amount DECIMAL(10, 2),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id),
    FOREIGN KEY (sector_id) REFERENCES Sectors(sector_id)
);

-- Insert data into MonthlyEnergyConsumption Table
INSERT INTO MonthlyEnergyConsumption
    (sector_id, subsector_id, month, total_energy)
VALUES
    (1, NULL, '2024-01-01', 400.5),
    (1, NULL, '2024-02-01', 410.7),
    (1, NULL, '2024-03-01', 390.3),
    (2, NULL, '2024-01-01', 600.8),
    (2, NULL, '2024-02-01', 620.4),
    (2, NULL, '2024-03-01', 610.0),
    (3, NULL, '2024-01-01', 700.2),
    (3, NULL, '2024-02-01', 710.5),
    (3, NULL, '2024-03-01', 690.0),
    (4, NULL, '2024-01-01', 300.5),
    (4, NULL, '2024-02-01', 305.3),
    (4, NULL, '2024-03-01', 298.7),
    (5, NULL, '2024-01-01', 150.6),
    (5, NULL, '2024-02-01', 152.9),
    (5, NULL, '2024-03-01', 151.2);

-- Insert data into OperationalCosts Table
INSERT INTO OperationalCosts
    (company_id, sector_id, month, cost_amount)
VALUES
    (1, 1, '2024-01-01', 1200.50),
    (1, 2, '2024-01-01', 950.75),
    (1, 3, '2024-01-01', 800.60),
    (1, 4, '2024-01-01', 1050.40),
    (1, 5, '2024-01-01', 900.30),
    (1, 1, '2024-02-01', 1150.20),
    (1, 2, '2024-02-01', 980.50),
    (1, 3, '2024-02-01', 810.45),
    (1, 4, '2024-02-01', 1075.80),
    (1, 5, '2024-02-01', 920.70);







