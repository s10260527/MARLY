-- Drop Tables if they exist
DROP TABLE IF EXISTS Companies;
DROP TABLE IF EXISTS Emission_Sources;
DROP TABLE IF EXISTS Emission_Types;
DROP TABLE IF EXISTS Reporting_Periods;
DROP TABLE IF EXISTS Emissions;

CREATE TABLE Companies (
    company_id INT PRIMARY KEY IDENTITY(1,1),
    company_name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(255),
    country VARCHAR(255),
    city VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);


CREATE TABLE Emission_Sources (
    source_id INT PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,  -- e.g., "Fuel Combustion", "Electricity Usage"
    description TEXT
);

CREATE TABLE Emission_Types (
    type_id INT PRIMARY KEY,
    type_name VARCHAR(255) NOT NULL,  -- e.g., "CO2", "CH4", "N2O"
    global_warming_potential DECIMAL(10, 2),  -- GWP values for conversion into CO2 equivalents
    unit VARCHAR(50)  -- e.g., "metric tons"
);

CREATE TABLE Reporting_Periods (
    period_id INT PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE Emissions (
    emission_id INT PRIMARY KEY,
    company_id INT,
    source_id INT,
    type_id INT,
    period_id INT,
    amount DECIMAL(12, 3),  -- e.g., metric tons
    recorded_at DateTime DEFAULT GetDate()
    FOREIGN KEY (company_id) REFERENCES Companies(company_id),
    FOREIGN KEY (source_id) REFERENCES Emission_Sources(source_id),
    FOREIGN KEY (type_id) REFERENCES Emission_Types(type_id),
    FOREIGN KEY (period_id) REFERENCES Reporting_Periods(period_id)
);

INSERT INTO Companies (company_name, industry_type, country, city, contact_email, contact_phone)
VALUES ('Apple', 'Manufacturing', 'USA', 'New York', 'apple@gmail.com', '123-456-7890');




	