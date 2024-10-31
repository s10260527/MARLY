const sql = require("mssql")
const dbConfig = require("../dbConfig");
const fetch = require('node-fetch');
require("dotenv").config()
class Company {
    constructor(company_id, company_name, industry_type,country, city, contact_email, contact_phone) {
        this.company_id = company_id;
        this.company_name = company_name;
        this.industry_type = industry_type;
        this.country = country;
        this.city = city;
        this.contact_email = contact_email;
        this.contact_phone = contact_phone;

    }
    //get all companies
    static async getAllCompanies() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Companies`; 

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new Volunteer(row.company_id, row.company_name, row.industry_type, row.country, row.city, row.contact_email, row.contact_phone )
        ) 
    }

    static async getVolunteerById(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Volunteers WHERE volunteerid = @volunteerid`; //params

        const request = connection.request();
        request.input("volunteerid", id)
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new Volunteer(result.recordset[0].volunteerid, result.recordset[0].name, result.recordset[0].email, result.recordset[0].passwordHash, result.recordset[0].bio, result.recordset[0].dateofbirth, result.recordset[0].profilepicture)
            : null; // not found
    }

    static async getVolunteerByName(username) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Volunteers WHERE name = @name`; //params

        const request = connection.request();
        request.input("name", username)
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new Volunteer(result.recordset[0].volunteerid, result.recordset[0].name, result.recordset[0].email, result.recordset[0].passwordHash, result.recordset[0].bio, result.recordset[0].dateofbirth, result.recordset[0].profilepicture)
            : null; // not found
    }

    static async getVolunteerByEmail(email) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Volunteers WHERE email = @email`; //params

        const request = connection.request();
        request.input("email", email)
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new Volunteer(result.recordset[0].volunteerid, result.recordset[0].name, result.recordset[0].email, result.recordset[0].passwordHash, result.recordset[0].bio, result.recordset[0].dateofbirth, result.recordset[0].profilepicture)
            : null; // not found
    }

    static async deleteVolunteer(id) {
        const connection = await sql.connect(dbConfig)
        const sqlQuery = `DELETE FROM Volunteers WHERE volunteerid = @volunteerid`
        const request = connection.request()
        request.input("volunteerid", id)
        const result = await request.query(sqlQuery);
        connection.close()

        return result.rowsAffected > 0; // Indicate success based on affected rows
    }

    //brandon
    //this method gets all the volunteer's skills
    static async getVolunteerSkills(id) {
        const connection = await sql.connect(dbConfig);
        try {
            const query = `
          SELECT s.skillname
          FROM Skills s
          INNER JOIN VolunteerSkills vs ON vs.skillid = s.skillid
          WHERE vs.volunteerid = @volunteerid;
          `;
            const request = connection.request();
            request.input("volunteerid", id)
            const result = await request.query(query);

            return result.recordset.map(row => row.skillname)
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching volunteer's skill");

        } finally {
            await connection.close();
        }
    }
    //To check if there is an existing email when volunteers are signing up
    static async getVolunteerByEmail(email) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `SELECT * FROM Volunteers WHERE email = @email`; 
    
        const request = connection.request();
        request.input("email", email)
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset[0]
            ? new Volunteer(result.recordset[0].volunteerid, result.recordset[0].name, result.recordset[0].email, result.recordset[0].passwordHash, result.recordset[0].bio, result.recordset[0].dateofbirth, result.recordset[0].profilepicture)
            : null; // not found
    }

    static async createVolunteer(newVolunteerData) {
        if (!newVolunteerData.profilepicture) {
            try {
                newVolunteerData.profilepicture = await fetchRandomImage();
            } catch (error) {
                console.error('Error fetching image data:', error);
                throw new Error('Error fetching image data');
            }
        }

        const connection = await sql.connect(dbConfig);

        const sqlQuery = `
            INSERT INTO volunteers (name, email, passwordHash, bio, dateofbirth, profilepicture) 
            VALUES (@name, @email, @passwordHash, @bio, @dateofbirth, @profilepicture);
            SELECT SCOPE_IDENTITY() AS volunteerid;
        `;

        const request = connection.request();
        request.input("name", newVolunteerData.name);
        request.input("email", newVolunteerData.email);
        request.input("passwordHash", newVolunteerData.passwordHash);
        request.input("bio", newVolunteerData.bio);
        request.input("dateofbirth", newVolunteerData.dateofbirth);
        request.input("profilepicture", newVolunteerData.profilepicture);

        const result = await request.query(sqlQuery);

        connection.close();

        return this.getVolunteerById(result.recordset[0].volunteerid);
    }

    static async updateVolunteer(id, newVolunteerData) {
        const connection = await sql.connect(dbConfig)

        const sqlQuery = `UPDATE Volunteers SET name = @name, email = @email, passwordHash = @passwordHash, bio = @bio, dateofbirth = @dateofbirth, profilepicture = @profilepicture WHERE volunteerid = @volunteerid; SELECT SCOPE_IDENTITY() AS volunteerid;`

        const request = connection.request()
        request.input("volunteerid", id)
        request.input("name", newVolunteerData.name)
        request.input("email", newVolunteerData.email)
        request.input("passwordHash", newVolunteerData.passwordHash)
        request.input("bio", newVolunteerData.bio)
        request.input("dateofbirth", newVolunteerData.dateofbirth)
        request.input("profilepicture", newVolunteerData.profilepicture)

        await request.query(sqlQuery)

        connection.close()

        return this.getVolunteerById(id)
    }
    
    static async updateVolunteerProfilePicture(id, imagepath) {
        const connection = await sql.connect(dbConfig)

        const sqlQuery = `UPDATE Volunteers SET profilepicture = @profilepicture WHERE volunteerid = @volunteerid; SELECT SCOPE_IDENTITY() AS volunteerid;`

        const request = connection.request()
        request.input("volunteerid", id)
        request.input("profilepicture", imagepath)

        await request.query(sqlQuery)

        connection.close()

        return this.getVolunteerById(id)
    }

    static async updateVolunteerPassword(id, hash) {
        const connection = await sql.connect(dbConfig)

        const sqlQuery = `UPDATE Volunteers SET passwordHash = @passwordHash WHERE volunteerid = @volunteerid; SELECT SCOPE_IDENTITY() AS volunteerid;`

        const request = connection.request()
        request.input("volunteerid", id)
        request.input("passwordHash", hash)

        await request.query(sqlQuery)

        connection.close()

        return this.getVolunteerById(id)
    }

    static async searchVolunteers(searchTerm) {
        const connection = await sql.connect(dbConfig)
        
        const sqlQuery = `SELECT * FROM Volunteers WHERE name LIKE '%${searchTerm}%'`
    
        const request = connection.request()
        
        const result = await request.query(sqlQuery);
    
        connection.close()
    
        return result.recordset.map(
            (row) => new Volunteer(row.volunteerid, row.name, row.email, row.passwordHash, row.bio, row.dateofbirth, row.profilepicture)
        ) //convert rows to volunteers
    }
    


}




module.exports = Volunteer;