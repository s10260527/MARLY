// Function to fetch whether the company is part of the campaign
let companyId = localStorage.getItem('companyId')
async function checkIfCompanyIsParticipant(companyId) {
    try {
        // Fetch the data from the backend to check if the company is a participant
        const response = await fetch(`/campaign/isParticipant/${companyId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const isParticipant = await response.json(); // Assuming the response is a boolean
        console.log("check:", isParticipant)
        return isParticipant;
    } catch (error) {
        console.error('Error fetching participant status:', error);
        return false; // Default to false if there is an error
    }
}

// Event listener for the "Get Involved" button click
document.getElementById("getInvolvedBtn").addEventListener("click", async function() {
    // Get company ID from localStorage
    //const companyId = localStorage.getItem("company_id");

    if (!companyId) {
        alert("Company ID is missing. Please ensure the company is logged in.");
        return;
    }

    // Check if the company is a participant in the campaign
    const isParticipant = await checkIfCompanyIsParticipant(companyId);

    if (isParticipant) {
        // Allow the company to get involved, e.g., redirect to the form or show content
        window.location.href = "input.html";  // Redirect to the form or campaign page
    } else {
        // Display a message that the company is not a participant
        alert("Your company is not currently a participant in the campaign.");
        window.location.href = "policy.html"
    }
});
