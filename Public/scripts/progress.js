document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded!"); // Debugging: Check if script runs

    // Get button and modal elements
    const openUpdateModalBtn = document.getElementById("openUpdateModal");
    const updateEmissionsForm = document.getElementById("updateEmissionsForm");

    if (!openUpdateModalBtn) {
        console.error("Update button not found!");
        return;
    }

    if (!updateEmissionsForm) {
        console.error("Update form not found!");
        return;
    }

    // Show modal when update button is clicked
    openUpdateModalBtn.addEventListener("click", function () {
        console.log("Update button clicked!"); // Debugging
        const modal = new bootstrap.Modal(document.getElementById("updateEmissionsModal"));
        modal.show();
    });

    // Handle form submission
    updateEmissionsForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Form submitted!"); // Debugging

        // Get input values
        const cat1 = document.getElementById("category1").value || 0;
        const cat2 = document.getElementById("category2").value || 0;
        const cat3 = document.getElementById("category3").value || 0;

        // Update table with new values
        document.getElementById("cat1-emissions").textContent = `${cat1} MT`;
        document.getElementById("cat2-emissions").textContent = `${cat2} MT`;
        document.getElementById("cat3-emissions").textContent = `${cat3} MT`;

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("updateEmissionsModal"));
        modal.hide();
    });
});
