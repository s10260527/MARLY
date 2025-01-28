let offset = 0; // Initialize offset for pagination
const limit = 10; // Rows per request
let isLoading = false; // Prevent duplicate requests
let hasMoreData = true; // Flag to stop fetching when all data is loaded

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("No token found. Please log in.");
    window.location.href = "login.html";
    return;
  }

  // Decode and debug token
  const decoded = parseJwt(token);
  console.log("Decoded JWT:", decoded);

  // Initial fetch
  fetchPaginatedData(token);

  // Infinite scroll
  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !isLoading &&
      hasMoreData
    ) {
      fetchPaginatedData(token);
    }
  });
});

function fetchPaginatedData(token) {
  isLoading = true;

  $.ajax({
    type: "GET",
    url: `/api/dashboard/data/paginated?limit=${limit}&offset=${offset}`,
    headers: { Authorization: `Bearer ${token}` },
    success: (response) => {
      console.log("Fetched paginated data:", response);

      const container = $("#dashboardContainer");
      response.data.forEach((row) => {
        const rowHtml = `
          <div class="dashboard-row">
            <p><strong>Date:</strong> ${new Date(row.emission_date).toLocaleDateString()}</p>
            <p><strong>Emissions:</strong> ${row.emissions.toFixed(2)}</p>
            <p><strong>Energy:</strong> ${row.energy.toFixed(2)}</p>
            <p><strong>Costs:</strong> $${row.costs.toFixed(2)}</p>
          </div>
        `;
        container.append(rowHtml);
      });

      offset += limit; // Increment offset for the next request
      if (response.data.length < limit) {
        hasMoreData = false; // Stop further requests if no more data
        console.log("All data loaded.");
      }
    },
    error: (xhr) => {
      console.error("Error fetching paginated data:", xhr);
      if (xhr.status === 401) {
        alert("Unauthorized! Redirecting to login page.");
        window.location.href = "login.html";
      } else {
        alert("An error occurred while fetching data. Please try again later.");
      }
    },
    complete: () => {
      isLoading = false;
    },
  });
}
