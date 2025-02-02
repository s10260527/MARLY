

document.addEventListener("DOMContentLoaded", () => {
    const podiums = document.querySelectorAll(".podium");
    podiums.forEach((podium, index) => {
        podium.style.animationDelay = `${index * 0.3}s`;
    });
});

// Select modal and download button
const modal = document.getElementById("certificate-modal");
const downloadButton = document.getElementById("download-cert-btn");

// Function to open the modal
function openModal() {
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    modal.style.display = "none";
}

// Event listener for closing the modal when clicking outside the modal-content
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }

})
// Fetch data for top 3 companies
fetch("/leaderboard/top3")
    .then(response => response.json())
    .then(data => {
        const topCompanies = data.topCompanies;
        console.log(data)
        // Check if there are 3 companies
        if (topCompanies.length === 3) {
            // Assign values for 1st, 2nd, and 3rd place
            const firstPlace = topCompanies[0];
            const secondPlace = topCompanies[1];
            const thirdPlace = topCompanies[2];

            // Set company names and recycled devices count
            document.getElementById("first-place-name").textContent = firstPlace.company_name;
            document.getElementById("first-place-count").textContent = `${firstPlace.likes} likes`;

            document.getElementById("second-place-name").textContent = secondPlace.company_name;
            document.getElementById("second-place-count").textContent = `${secondPlace.likes} likes`;

            document.getElementById("third-place-name").textContent = thirdPlace.company_name;
            document.getElementById("third-place-count").textContent = `${thirdPlace.likes} likes`;

            // Display winner's poster
            const winnerPosterSection = document.getElementById("winner-poster-section");
            const winnerPoster = document.getElementById("winner-poster");
            // Fetch and display the image as before
            fetch(`/leaderboard/proxy-image?url=${encodeURIComponent(firstPlace.poster_img)}`)
            .then(response => response.blob())
            .then(imageBlob => {
                // Create a URL for the image blob
                console.log(firstPlace.poster_img)
                const imageUrl = URL.createObjectURL(imageBlob);
                winnerPoster.src = imageUrl; // Set the image source
                winnerPoster.alt = `${firstPlace.company_name}'s Poster`; // Set alt text
                winnerPosterSection.style.display = "block"; // Show the winner's poster

                // Now wrap the image with the Instagram link only after it's loaded
                const instagramLink = firstPlace.poster_url; // Get Instagram URL
                console.log(instagramLink);

                // Create the link wrapper
                const linkWrapper = document.createElement('a');
                linkWrapper.href = instagramLink; // Set the Instagram link
                linkWrapper.target = '_blank'; // Open in a new tab

                // Append the image inside the link wrapper
                linkWrapper.appendChild(winnerPoster);
                winnerPosterSection.appendChild(linkWrapper); // Add the link wrapper to the section
            })
            .catch(error => {
                console.error("Error fetching poster image:", error);
            });


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

                // Show the certificate modal
                document.getElementById("certificate-modal").style.display = "block";
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
    doc.addImage(logoUrl, 'PNG', 15, 33, 20, 20); // Adjust position and size as needed

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text("Certificate of Achievement", 105, 50, null, null, "center");

    // Company Name
    doc.setFontSize(20);
    doc.setFont("helvetica", "normal");
    doc.text(`Presented to ${firstPlace.company_name}`, 105, 90, null, null, "center");

    // Achievement Text
    doc.setFontSize(16);
    const month = new Date().toLocaleString('default', { month: 'long' });
    const achievementText = `For getting the highest amount of Instagram likes`;
    const Text = `with ${firstPlace.likes} likes in the month of ${month} ${new Date().getFullYear()}.`;

    // Combine both text parts into one string for the final achievement
    const fullAchievementText = `${achievementText} ${Text}`;

    // Split the combined text into lines based on a max width (e.g., 180)
    const achievementLines = doc.splitTextToSize(fullAchievementText, 180);

    // Render the text on the PDF
    doc.text(achievementLines, 105, 110, { align: "center" });

    // Add Signature Section
    doc.setFontSize(18);
    doc.text("Signed by:", 105, 170, null, null, "center");

    doc.setFont("courier", "italic");
    doc.setFontSize(22);
    doc.text("Verdex", 105, 190, null, null, "center");

    // Date Section
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Issued on: ${new Date().toLocaleDateString()}`, 105, 210, null, null, "center");

    // Add a nice horizontal line above the signature
    doc.setLineWidth(1);
    doc.line(60, 200, 150, 200);

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
