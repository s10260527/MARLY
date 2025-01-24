const sql = require('mssql');
const dbConfig = require("../dbConfig");
const puppeteer = require('puppeteer');

class Input {
  constructor(company_id, company_name, poster_url, poster_name, likes, poster_img, post_date) {
    this.company_id = company_id;
    this.company_name = company_name;
    this.poster_url = poster_url;
    this.poster_name = poster_name;
    this.likes = likes;
    this.poster_img = poster_img;
    this.post_date = post_date;
  }

  static async getCompanyName(company_id) {
    let connection;
      // Connect to the database
      connection = await sql.connect(dbConfig); 
  
      // SQL query to fetch the company name by ID
      const sqlQuery = `
        SELECT company_name 
        FROM Companies 
        WHERE company_id = @company_id
      `;
  
      // Create request and pass the company_id as an input parameter
      const request = connection.request();
      request.input("company_id", sql.Int, company_id);
  
      // Execute the query
      const result = await request.query(sqlQuery);
      console.log("company name in model:", result.recordset[0].company_name)

      // Check if a company was found
  
      // Return the company name
      return result.recordset[0].company_name;

      connection.close();

  }
  


      // Function to scrape Instagram post details using Puppeteer
      static async scrapeInstagramPost(url) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        try {
          await page.goto(url, { waitUntil: 'networkidle2' });
          await page.waitForSelector('article', { timeout: 10000 });

          const data = await page.evaluate(() => {
            const posterNameElement = document.querySelector('span[class="x1lliihq x1plvlek xryxfnj x1n2onr6 x1ji0vk5 x18bv5gf x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x1i0vuye xvs91rp x1s688f x5n08af x10wh9bi x1wdrske x8viiok x18hxmgj"]');
            const likesElement = document.querySelector('span[class="html-span xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x1hl2dhg x16tdsg8 x1vvkbs"]');
            const imageElement = document.querySelector('article img');
            const dateElement = document.querySelector('time');

            return {
              posterName: posterNameElement?.innerText || 'No name found',
              likes: likesElement?.innerText || 'No likes found',
              imageUrl: imageElement?.src || 'No image found',
              postDate: dateElement?.getAttribute("datetime") || 'No date found',
            };
          });

          await browser.close();
          return data;
        } catch (error) {
          await browser.close();
          throw new Error("Failed to scrape the Instagram post.");
        }
      }

    // Function to insert post data into Post_Details table
    static async createPost(newPostData) {
      const connection = await sql.connect(dbConfig);
    
      // Log the newPostData to make sure it's being passed correctly
      console.log("newPostData:", newPostData);
    
      const sqlQuery = `
        INSERT INTO Post_Details (company_id, company_name, poster_url, poster_name, likes, poster_img, post_date)
        VALUES (@company_id, @company_name, @poster_url, @poster_name, @likes, @poster_img, @post_date);
        SELECT SCOPE_IDENTITY() AS inserted_id;  -- Get the last inserted identity value
      `;
    
      const request = connection.request();
    
      // Set up the inputs for the SQL query
      request.input("company_id", sql.Int, parseInt(newPostData.company_id, 10));
      request.input("company_name", sql.NVarChar, newPostData.company_name);
      request.input("poster_url", sql.NVarChar, newPostData.poster_url);
      request.input("poster_name", sql.NVarChar, newPostData.poster_name);
      request.input("likes", sql.Int, newPostData.likes);
      request.input("poster_img", sql.NVarChar, newPostData.poster_img);
      request.input("post_date", sql.DateTime, newPostData.post_date || new Date());
    
      try {
        // Execute the query to insert the data and retrieve the inserted ID
        const result = await request.query(sqlQuery);
    
        // Log the result to verify the returned data
        console.log("Query result:", result);
    
        // Ensure result.recordset is not empty or undefined before accessing the inserted ID
        if (result.recordset && result.recordset.length > 0) {
          const insertedId = parseInt(result.recordset[0].inserted_id, 10); // Convert to integer
          console.log("Inserted post ID:", insertedId);
          connection.close();
          return insertedId;  // Return the inserted ID as integer
        } else {
          throw new Error("Failed to retrieve inserted post ID. Result set is empty.");
        }
      } catch (error) {
        connection.close();
        console.error("Error inserting post details:", error); // Log the detailed error
        throw new Error("Failed to insert post details into Post_Details table.");
      }
    }
    
  }

module.exports = Input;
