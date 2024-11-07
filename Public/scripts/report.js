document.getElementById("sector1").addEventListener("click", () => {
    displayData("Data for Sector 1: Carbon emissions over the last quarter have decreased by 5%.");
});
document.getElementById("sector2").addEventListener("click", () => {
    displayData("Data for Sector 2: Operational costs increased by 3% due to rising energy costs.");
});
document.getElementById("sector3").addEventListener("click", () => {
    displayData("Data for Sector 3: Employee sustainability engagement scores are up by 12%.");
});

function displayData(data) {
    document.getElementById("dataDisplay").innerHTML = `<p>${data}</p>`;
}

function generateReport() {
    alert("Generating report...");
}

document.getElementById("readMoreBtn").addEventListener("click", function() {
    const moreText = document.getElementById("moreText");
    const btnText = document.getElementById("readMoreBtn");

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btnText.textContent = "Read Less";
    } else {
        moreText.style.display = "none";
        btnText.textContent = "Read More";
    }
});