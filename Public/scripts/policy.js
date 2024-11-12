// Function to update the company's participation status
async function updateCompanyParticipation(companyId) {
    try {
        // Send a PATCH request to the server to update participation status
        const response = await fetch(`/campaign/updateParticipationStatus/${companyId}`, {
            method: "PATCH",  // Correct method for updating data
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const updateStatus = await response.json(); // Assuming the response is a status message or boolean
        return updateStatus;  // Return the server response to indicate success or failure
    } catch (error) {
        console.error('Error updating participant status:', error);
        return false; // Default to false if there is an error
    }
}

// Event listener for the "Get Involved" button click
document.getElementById("submitButton").addEventListener("click", async function() {
    // Get company ID from localStorage
    const companyId = 3;  // You can also get it from localStorage, e.g., localStorage.getItem("company_id")

    if (!companyId) {
        alert("Company ID is missing. Please ensure the company is logged in.");
        return;
    }

    // Check if the company is a participant in the campaign
    const updateParticipation = await updateCompanyParticipation(companyId);

    if (updateParticipation) {
        // Allow the company to get involved, e.g., redirect to the form or show content
        window.location.href = "input.html";  // Redirect to the next step or form
    } else {
        // Display a message that the company is not a participant
        alert("Unable to update participation status.");
    }
});
