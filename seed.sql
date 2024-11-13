

-- Now drop the tables
DROP TABLE IF EXISTS Campaigns;
DROP TABLE IF EXISTS Recycable_device;
DROP TABLE IF EXISTS Companies;
DROP TABLE IF EXISTS Campaign_participants;
DROP TABLE IF EXISTS Sectors;
DROP TABLE IF EXISTS EmissionsData;
DROP TABLE IF EXISTS Subsectors;
DROP TABLE IF EXISTS sub_sectors;





-- Create Companies Table
CREATE TABLE Companies (
    company_id INT PRIMARY KEY IDENTITY(1,1),
    company_name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(255),
	campaign_participant BIT,
    country VARCHAR(255),	
    city VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Recycable_device (
    device_id INT PRIMARY KEY IDENTITY(1,1),  -- Unique identifier for each device
    device_name VARCHAR(255) NOT NULL,         -- Name of the recyclable device
    carbon_offset DECIMAL(10, 2)              -- Carbon offset in metric tons
);

CREATE TABLE Campaigns (
    campaign_id INT PRIMARY KEY IDENTITY(1,1),  -- Unique identifier for each campaign
    company_id INT,                             -- Foreign key to link to Companies table
    campaign_name NVARCHAR(100) NOT NULL,       -- Name of the campaign
    description NVARCHAR(MAX) NOT NULL,         -- Detailed description of the campaign
    start_date DATE NOT NULL,                   -- Start date of the campaign
    end_date DATE NOT NULL,                     -- End date of the campaign
    created_at DATETIME DEFAULT GETDATE(),      -- Timestamp for when the campaign was created
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
);

CREATE TABLE Campaign_participants (
    campaign_id INT,  
    company_id INT,                             -- Foreign key to link to Companies table
    device_id INT,
	quantity INT,
    created_at DATETIME DEFAULT GETDATE(),      -- Timestamp for when the campaign was created
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE NO ACTION,
    FOREIGN KEY (campaign_id) REFERENCES Campaigns(campaign_id) ON DELETE NO ACTION,
    FOREIGN KEY (device_id) REFERENCES Recycable_device(device_id) ON DELETE NO ACTION
);

-- Step 1: Create the Sectors table
CREATE TABLE Sectors (
    sector_id INT PRIMARY KEY IDENTITY(1,1),
    sector_name NVARCHAR(255) NOT NULL
);

-- Step 2: Create the Subsectors table
CREATE TABLE Subsectors (
    subsector_id INT PRIMARY KEY IDENTITY(1,1),
    subsector_name VARCHAR(255) NOT NULL,
    sector_id INT,
    FOREIGN KEY (sector_id) REFERENCES Sectors(sector_id)
);

-- Step 3: Create the EmissionsData table
CREATE TABLE EmissionsData (
    sector_id INT NOT NULL,
    subsector_id INT NOT NULL,
    emission_date DATE NOT NULL,
    emission_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sector_id) REFERENCES Sectors(sector_id),
    FOREIGN KEY (subsector_id) REFERENCES Subsectors(subsector_id)
);

-- Step 4: Insert mock data into Sectors
INSERT INTO Sectors (sector_name) VALUES 
('Electricity'),
('Transportation'),
('Manufacturing'),
('Waste Management'),
('Water Supply');

-- Step 5: Insert mock data into Subsectors
INSERT INTO Subsectors (subsector_name, sector_id) VALUES 
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

-- Insert for January 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-01-01', 150.50),
(1, 2, '2024-01-01', 120.30),
(1, 3, '2024-01-01', 95.75),
(2, 6, '2024-01-01', 200.60),
(2, 7, '2024-01-01', 180.40),
(3, 11, '2024-01-01', 130.25),
(4, 16, '2024-01-01', 75.20),
(5, 21, '2024-01-01', 40.10);

-- Insert for February 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-02-01', 140.80),
(1, 2, '2024-02-01', 110.20),
(1, 3, '2024-02-01', 100.10),
(2, 6, '2024-02-01', 190.50),
(2, 7, '2024-02-01', 170.80),
(3, 11, '2024-02-01', 120.35),
(4, 16, '2024-02-01', 80.90),
(5, 21, '2024-02-01', 45.50);

-- Insert for March 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-03-01', 135.20),
(1, 2, '2024-03-01', 115.30),
(1, 3, '2024-03-01', 110.15),
(2, 6, '2024-03-01', 185.75),
(2, 7, '2024-03-01', 165.65),
(3, 11, '2024-03-01', 125.40),
(4, 16, '2024-03-01', 78.50),
(5, 21, '2024-03-01', 42.30);

-- Insert for April 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-04-01', 145.60),
(1, 2, '2024-04-01', 118.40),
(1, 3, '2024-04-01', 105.25),
(2, 6, '2024-04-01', 190.90),
(2, 7, '2024-04-01', 175.60),
(3, 11, '2024-04-01', 128.30),
(4, 16, '2024-04-01', 82.60),
(5, 21, '2024-04-01', 46.80);

-- Insert for May 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-05-01', 155.40),
(1, 2, '2024-05-01', 121.20),
(1, 3, '2024-05-01', 112.50),
(2, 6, '2024-05-01', 198.20),
(2, 7, '2024-05-01', 180.80),
(3, 11, '2024-05-01', 132.45),
(4, 16, '2024-05-01', 85.10),
(5, 21, '2024-05-01', 49.60);

-- Insert for June 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-06-01', 148.25),
(1, 2, '2024-06-01', 113.50),
(1, 3, '2024-06-01', 108.70),
(2, 6, '2024-06-01', 193.10),
(2, 7, '2024-06-01', 172.40),
(3, 11, '2024-06-01', 130.55),
(4, 16, '2024-06-01', 80.30),
(5, 21, '2024-06-01', 44.10);

-- Insert for July 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-07-01', 160.75),
(1, 2, '2024-07-01', 125.10),
(1, 3, '2024-07-01', 118.60),
(2, 6, '2024-07-01', 202.30),
(2, 7, '2024-07-01', 185.40),
(3, 11, '2024-07-01', 136.25),
(4, 16, '2024-07-01', 88.10),
(5, 21, '2024-07-01', 51.50);

-- Insert for August 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-08-01', 155.10),
(1, 2, '2024-08-01', 121.40),
(1, 3, '2024-08-01', 111.90),
(2, 6, '2024-08-01', 199.80),
(2, 7, '2024-08-01', 178.30),
(3, 11, '2024-08-01', 133.00),
(4, 16, '2024-08-01', 84.40),
(5, 21, '2024-08-01', 47.90);

-- Insert for September 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-09-01', 150.00),
(1, 2, '2024-09-01', 116.60),
(1, 3, '2024-09-01', 107.30),
(2, 6, '2024-09-01', 194.10),
(2, 7, '2024-09-01', 173.50),
(3, 11, '2024-09-01', 129.80),
(4, 16, '2024-09-01', 79.90),
(5, 21, '2024-09-01', 43.40);

-- Insert for October 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-10-01', 145.90),
(1, 2, '2024-10-01', 118.30),
(1, 3, '2024-10-01', 102.75),
(2, 6, '2024-10-01', 191.40),
(2, 7, '2024-10-01', 174.90),
(3, 11, '2024-10-01', 124.00),
(4, 16, '2024-10-01', 81.20),
(5, 21, '2024-10-01', 45.00);

-- Insert for November 2024
INSERT INTO EmissionsData (sector_id, subsector_id, emission_date, emission_amount)
VALUES
(1, 1, '2024-11-01', 150.80),
(1, 2, '2024-11-01', 120.40),
(1, 3, '2024-11-01', 108.60),
(2, 6, '2024-11-01', 196.80),
(2, 7, '2024-11-01', 179.00),
(3, 11, '2024-11-01', 130.15),
(4, 16, '2024-11-01', 83.70),
(5, 21, '2024-11-01', 48.30);




-- Insert mock data into Companies
INSERT INTO Companies (company_name, industry_type, campaign_participant, country, city, contact_email, contact_phone)
VALUES
('Apple Inc', 'Tech Manufacturing', 0, 'USA', 'New York', 'contact@Apple.com', '123-456-7890'),
('GreenTech Solutions', 'Tech Manufacturing', 1, 'Germany', 'Berlin', 'support@greentech.com', '234-567-8901'),
('Innovate Electronics', 'Electronics', 0, 'South Korea', 'Seoul', 'info@innovateelectronics.com', '345-678-9012'),
('EcoTech Industries', 'Tech Manufacturing', 1, 'Japan', 'Tokyo', 'contact@ecotechindustries.com', '456-789-0123'),
('SmartTech Corp.', 'Tech Manufacturing', 0, 'Singapore', 'Singapore', 'sales@smarttech.com', '567-890-1234');

-- Insert mock data into Recycable_device
INSERT INTO Recycable_device (device_name, carbon_offset)
VALUES
('Smartphone', 0.5),
('Laptop', 1.2),
('Tablet', 0.8)

-- Insert mock data into Campaigns
-- Inserting Tech No Trash campaign for Microsoft
INSERT INTO Campaigns (company_id, campaign_name, description, start_date, end_date)
VALUES
    (1,  'Tech To Trash', 'Encourage the recycling of electronic waste by setting up collection points in manufacturing facilities for old devices, parts, and batteries.', '2024-11-01', '2024-11-30');

-- Insert mock data into Campaign_participants
INSERT INTO Campaign_participants (campaign_id, company_id, device_id, quantity)
VALUES
(1, 1, 1, 3),
(1, 2, 2,3),
(1, 3, 3, 4),
(1, 4, 2, 1),
(1, 5, 3, 3);






























