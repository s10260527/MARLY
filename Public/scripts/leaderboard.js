document.addEventListener("DOMContentLoaded", () => {
    const podiums = document.querySelectorAll(".podium");
    podiums.forEach((podium, index) => {
        podium.style.animationDelay = `${index * 0.3}s`;
    });
});

// Fetch data for top 3 companies
fetch("/leaderboard/top3")
    .then(response => response.json())
    .then(data => {
        const topCompanies = data.topCompanies;

        // Check if there are 3 companies
        if (topCompanies.length === 3) {
            // Assign values for 1st, 2nd, and 3rd place
            const firstPlace = topCompanies[0];
            const secondPlace = topCompanies[1];
            const thirdPlace = topCompanies[2];

            // Set company names and recycled devices count
            document.getElementById("first-place-name").textContent = firstPlace.company_name;
            document.getElementById("first-place-count").textContent = `${firstPlace.total_recycled_devices} devices`;

            document.getElementById("second-place-name").textContent = secondPlace.company_name;
            document.getElementById("second-place-count").textContent = `${secondPlace.total_recycled_devices} devices`;

            document.getElementById("third-place-name").textContent = thirdPlace.company_name;
            document.getElementById("third-place-count").textContent = `${thirdPlace.total_recycled_devices} devices`;

            // Assume you get the companyId of the logged-in company, e.g., from localStorage or sessionStorage
            const companyId = localStorage.getItem('companyId'); // Example: replace with actual method for getting companyId
            console.log("companyId: ", companyId)
            console.log("First place company ID:", firstPlace.company_id);

            // Check if the logged-in company is the first place
            if (String(companyId) === String(firstPlace.company_id)) {
                const certificateBtnContainer = document.getElementById("certificate-btn-container");
                certificateBtnContainer.style.display = "block";  // Show the certificate button for first place
            } else {
                const certificateBtnContainer = document.getElementById("certificate-btn-container");
                certificateBtnContainer.style.display = "none";  // Hide if not first place
            }

            // Handle the "Get Certificate" button click
            document.getElementById("first-place-cert-btn").addEventListener("click", () => {
                document.getElementById("certificate-company-name").textContent = firstPlace.company_name;
                document.getElementById("certificate-recycled-count").textContent = firstPlace.total_recycled_devices;

                // Show the certificate modal
                document.getElementById("certificate-modal").style.display = "block";
            });

            // Close modal
            document.getElementById("close-cert-modal").addEventListener("click", () => {
                document.getElementById("certificate-modal").style.display = "none";
            });

            // Generate and download certificate
            document.getElementById("download-cert-btn").addEventListener("click", () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
            
                // Set certificate background and border
                doc.setFillColor(255, 255, 255); // White background
                doc.rect(10, 10, 190, 277, 'F'); // Full background area
            
                // Add border for the certificate
                doc.setLineWidth(3);
                doc.setDrawColor(0, 0, 0); // Black border
                doc.rect(5, 5, 200, 285); // Outer border
            
                // Add decorative lines
                doc.setLineWidth(1);
                doc.line(10, 70, 200, 70); // Top line
                doc.line(10, 220, 200, 220); // Bottom line
            
                // Logo (replace with actual logo URL or base64-encoded string)
                const logoUrl = '../assets/brand/logo.png'; // Replace with your logo URL or base64 image string
                doc.addImage(logoUrl, 'PNG', 20, 25, 20, 20); // Adjust position and size as needed
            
                // Title
                doc.setFont("helvetica", "bold");
                doc.setFontSize(24);
                doc.text("Certificate of Achievement", 105, 40, null, null, "center");
            
                // Company Name
                doc.setFontSize(18);
                doc.text(`Presented to ${firstPlace.company_name}`, 105, 90, null, null, "center");
            
                // Achievement
                doc.setFontSize(14);
                const month = new Date().toLocaleString('default', { month: 'long' });
                const achievementText = `For coming in first place in the campaign: Tech to Trash and recycling a total of ${firstPlace.total_recycled_devices} devices in the month of ${month} ${new Date().getFullYear()}.`;

                // Split the text into lines based on a max width (e.g., 180)
                const achievementLines = doc.splitTextToSize(achievementText, 180);
                doc.text(achievementLines, 105, 110, { align: "center" });
                // Month and Year   
                doc.setFontSize(12);            
                // Signature Section
                doc.setFontSize(16);
                doc.text("Signed by:", 105, 170, null, null, "center");
                doc.setFont("courier", "italic");
                doc.setFontSize(22);
                doc.text("Verdex", 105, 190, null, null, "center");
            
                // Date (optional)
                doc.setFont("helvetica", "normal");
                doc.setFontSize(12);
                doc.text(`Issued on: ${new Date().toLocaleDateString()}`, 105, 210, null, null, "center");
            
                // Save the PDF
                doc.save(`${firstPlace.company_name}_certificate.pdf`);
            
                // Close the modal after download
                document.getElementById("certificate-modal").style.display = "none";
            });
            
        }
    })
    .catch(error => {
        console.error("Error fetching top companies:", error);
    });
