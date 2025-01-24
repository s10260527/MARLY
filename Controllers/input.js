const Input = require("../Models/input");

const getCompanyName = async (req, res) => {
  const company_id = req.params.id;
  try {
    const company = await Input.getCompanyName(company_id);
    if (!company) {
      return res.status(404).send("company name not found")
    } 

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving company");
  }
};


const addPostUrl = async (req, res) => {
  const { company_id, company_name, poster_url } = req.body;
  console.log("Received new post data:", req.body); // Log the received body

  // Basic validation
  if (!company_id || !poster_url || !company_name) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // Scrape Instagram post details using the `scrapeInstagramPost` function
    const postDetails = await Input.scrapeInstagramPost(poster_url);

    if (!postDetails) {
      return res.status(404).json({ message: "Failed to scrape post details" });
    }
    console.log("name in controller:",company_name )
    // Create a new post object with the required details
    const newPostData = {
      company_id,
      company_name: company_name,
      poster_url,
      poster_name: postDetails.posterName,
      likes: parseInt(postDetails.likes) || 0, // Ensure likes is an integer
      poster_img: postDetails.imageUrl,
      post_date: new Date(postDetails.postDate) || new Date(), // Default to current date
    };
    console.log("new post data:", newPostData)
    // Insert post details into the database
    const result = await Input.createPost(newPostData);

    if (result) {
      res.status(201).json({ message: "Post URL and details added successfully", company_id: result });
    } else {
      res.status(500).json({ message: "Failed to add Post URL and details" });
    }
  } catch (error) {
    console.error("Error adding post URL:", error.message);
    res.status(500).json({ message: "Error adding post URL" });
  }
};

module.exports = {
  addPostUrl,
  getCompanyName
};
