const companyId = localStorage.getItem('companyId');

document.addEventListener("DOMContentLoaded", function () {
  const instagramForm = document.getElementById("instagramForm");
  const instagramPostUrl = document.getElementById("instagramPostUrl");

  instagramForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default form submission

    const url = instagramPostUrl.value.trim(); // Get the URL from the input field

    if (!url) {
      alert("Please enter a valid URL.");
      return;
    }

    if (!companyId) {
      alert("Company ID is missing.");
      return;
    }

    console.log("Retrieved URL:", url);
    console.log("Company ID:", companyId);

    try {
      // Step 1: Retrieve company name using a GET request
      const response = await fetch(`/input/${companyId}`, { // Pass company_id in URL
        method: 'GET', // Use GET since we are retrieving data
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch company name. Status: ${response.status}`);
      }

      const company_name = await response.json();
      if (company_name) {
        console.log("Company Name before sending to newPostData:", company_name);
        console.log("Company id before sending to newPostData:", companyId);
        // Step 2: Construct the newPostData object
        const newPostData = {
          company_id: companyId,
          company_name: company_name, // Pass the company name
          poster_url: url,
        };

        console.log("newPostData:", newPostData);  // Log newPostData to verify the values

        // Step 3: Send the URL, company ID, and company name to the backend
        const postResponse = await fetch('/input/addPost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPostData),  // Send newPostData here
        });

        const postData = await postResponse.json();

        if (postData.message) {
          alert(postData.message); // Show success or error message from backend
        } else {
          alert("Error: Could not add the post details.");
        }
      } else {
        alert("Company name not found.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the request.");
    }

    // Clear the form
    instagramPostUrl.value = "";
  });
});
