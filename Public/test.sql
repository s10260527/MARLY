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

-- Sample data for sub_sectors
INSERT INTO sub_sectors (sub_sector_id, sector_id, sub_sector_name) VALUES
-- Maintenance Sub-sectors
(101, 1, 'Building & Facility Maintenance'),
(102, 1, 'Production Equipment Maintenance'),
(103, 1, 'Infrastructure Maintenance'),
(104, 1, 'Preventive Maintenance Operations'),
(105, 1, 'Emergency Repair Services'),

-- Electricity Sub-sectors
(201, 2, 'Production Line Power Consumption'),
(202, 2, 'Facility Climate Control'),
(203, 2, 'Office & Administrative Power Usage'),
(204, 2, 'Warehouse & Storage Power'),
(205, 2, 'Auxiliary Power Systems'),

-- Services Sub-sectors
(301, 3, 'Quality Control Services'),
(302, 3, 'Waste Management Services'),
(303, 3, 'Technical Support Services'),
(304, 3, 'Facility Management Services'),
(305, 3, 'Resource Management Services'),

-- Transport Sub-sectors
(401, 4, 'Raw Material Logistics'),
(402, 4, 'Finished Product Distribution'),
(403, 4, 'Internal Transport Operations'),
(404, 4, 'Fleet Management'),
(405, 4, 'Employee Transport Services'),

-- Others Sub-sectors
(501, 5, 'Research & Development Operations'),
(502, 5, 'Administrative Support'),
(503, 5, 'Employee Facilities'),
(504, 5, 'External Support Facilities'),
(505, 5, 'Temporary Project Operations');