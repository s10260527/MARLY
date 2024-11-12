document.getElementById("emissionForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Gather form data
    const formData = {
        company_id: document.getElementById("company_id").value,
        emission_year: document.getElementById("emission_year").value,
        emission_amount: document.getElementById("emission_amount").value,
        project_count: document.getElementById("project_count").value,
        employee_count: document.getElementById("employee_count").value,
        comments: document.getElementById("comments").value
    };

    try {
        // Send the data to the server
        const response = await fetch("/emission", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        // Handle response
        if (response.ok) {
            alert("Emission report submitted successfully.");
            document.getElementById("emissionForm").reset();
        } else {
            const errorData = await response.json();
            alert(`Failed to submit report: ${errorData.message || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error submitting report:", error);
        alert("Failed to submit report. Please try again later.");
    }
});
