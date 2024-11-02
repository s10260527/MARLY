async function fetchEmissionsByCurrentMonth() {
    try {
        const response = await fetch(`/emission/current_month`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const emissions = await response.json();
        return emissions;
    } catch (error) {
        console.error('Error fetching emissions:', error);
        return []; // Return an empty array if there's an error
    }
}

async function displayLeaderboard() {
    const leaderboardTableBody = document.getElementById('leaderboardTableBody');
    
    // Clear the existing rows in the leaderboard
    leaderboardTableBody.innerHTML = ''; // Clear previous entries

    // Fetch emissions data
    const emissions = await fetchEmissionsByCurrentMonth();

    // Create and append rows to the leaderboard
    emissions.forEach((emission, index) => {
        const row = document.createElement('tr');

        // Create number cell
        const numberCell = document.createElement('td');
        numberCell.className = 'number';
        numberCell.textContent = index + 1; // Rankings start from 1
        row.appendChild(numberCell);

        // Create name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'name';
        nameCell.textContent = emission.company_name; // Assuming the backend returns company_name
        row.appendChild(nameCell);

        // Create points cell
        const pointsCell = document.createElement('td');
        pointsCell.className = 'points';
        pointsCell.textContent = emission.total_emission; // Assuming total_emission is returned

        // If rank is 1, add the gold medal icon
        if (index === 0) {
            const medalIcon = document.createElement('img');
            medalIcon.src = "https://github.com/malunaridev/Challenges-iCodeThis/blob/master/4-leaderboard/assets/gold-medal.png?raw=true";
            medalIcon.alt = "gold medal";
            medalIcon.className = "gold-medal";
            pointsCell.appendChild(medalIcon);
        }

        row.appendChild(pointsCell);

        // Append the row to the leaderboard table body
        leaderboardTableBody.appendChild(row);
    });
}

// Call the function to display the leaderboard once the page loads
document.addEventListener('DOMContentLoaded', displayLeaderboard);
