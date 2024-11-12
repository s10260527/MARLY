// Input Form Handling (scripts/input.js)

// Select the form container where forms will be added
const formsContainer = document.getElementById('forms-container');

// Select the add form button
const addFormBtn = document.getElementById('add-form-btn');

// Event listener to handle adding a new form
addFormBtn.addEventListener('click', function () {
  // Create a new form element
  const newForm = document.createElement('div');
  newForm.classList.add('form-background'); // Apply the form background styles
  
  // Create the form structure
  const formHTML = `
    <h1 class="h3">New Device Form</h1>
    <form action="">
      <!-- Dropdown for selecting device type -->
      <div class="form-floating">
        <select class="form-control" id="deviceDropdown" required>
          <option value="computer">Computer</option>
          <option value="mobile">Mobile Device</option>
        </select>
        <label for="deviceDropdown">Device Type</label>
      </div>

      <!-- Quantity input for password -->
      <div class="form-floating">
        <input type="number" class="form-control" id="floatingPassword" placeholder="Quantity" min="1" required>
        <label for="floatingPassword">Quantity</label>
      </div>

      <button class="w-100 btn btn-lg" id="submit-btn" type="submit">Submit</button>
      <div class="plus-icon-container">
        <button type="button" class="btn btn-link" id="add-form-btn">
          <i class="fas fa-plus"></i>
        </button>
    </form>
  `;

  // Add the form structure to the new form element
  newForm.innerHTML = formHTML;

  // Append the new form to the forms container
  formsContainer.appendChild(newForm);
});

// Optional: Close functionality for the dynamically created forms
formsContainer.addEventListener('click', function (event) {
  // Check if the clicked element is the close button
  if (event.target && event.target.matches('.btn-close')) {
    // Remove the parent form of the clicked close button
    event.target.closest('.form-background').remove();
  }
});





//-------------------------AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH-----------------------------------

// Global variables
let deviceId = null;
let quantity = null;

document.getElementById("device-form").addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent default form submission

  // Get the device name and quantity from the form
  const deviceName = document.getElementById("deviceDropdown").value;
  quantity = document.getElementById("floatingPassword").value;

  try {
    // Make the request to the backend to get the device ID by name
    const response = await fetch(`/input/getDeviceId/${deviceName}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Device not found');
    }

    // Parse the response
    const data = await response.json();
    deviceId = data.device_id;

    // Call the method to update the recycled device quantity
    await updateRecycledDeviceQuantity(deviceId, quantity);

    // Clear the form fields after submission (reset the form)
    clearForm();

  } catch (error) {
    console.error('Error fetching device ID:', error);
  }
});

// The function that updates the recycled device quantity using the global variables
async function updateRecycledDeviceQuantity(deviceId, quantity) {
  const campaignId = 1;  // Use your actual campaign ID
  const companyId = 1;   // Use your actual company ID

  try {
    // Send the request to update the recycled device quantity
    const updateResponse = await fetch('/input/updateRecycledDeviceQuantity', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        company_id: companyId,
        device_id: deviceId,
        new_quantity: quantity,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update quantity');
    }

    // Parse the update response
    const updateData = await updateResponse.json();
    console.log('Update Successful:', updateData.message);
    
    // Handle success (e.g., display success message or update UI)
    alert('Recycled device quantity updated successfully!');
  } catch (error) {
    console.error('Error updating device quantity:', error);
    // Handle error (e.g., display error message)
    alert('Error updating recycled device quantity');
  }
}

// Function to clear the form fields
function clearForm() {
  // Get the form element
  const form = document.querySelector('form');

  // Reset the form (clear all fields)
  form.reset();
}

