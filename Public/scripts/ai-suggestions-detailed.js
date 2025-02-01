// public/suggestions-page.js

// State management
let currentSuggestions = [];
let currentFilter = 'all';
let sectorChart = null;
let lastSectorData = null;
let currentMetric = 'emissions';

// DOM Elements
const suggestionFilters = document.getElementById('suggestionFilters');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const progressCircle = document.getElementById('progressCircle');
const progressStats = document.getElementById('progressStats');
const equipmentList = document.getElementById('equipmentList');
const refreshButton = document.getElementById('refreshBtn');
const exportButton = document.getElementById('exportBtn');

// Add this function for action handling
function initiateSuggestionAction(suggestionId) {
    // Implement action handling
    console.log('Taking action on suggestion:', suggestionId);
    // You can add modal or redirect logic here
}

// Initialize Charts
function initializeSectorChart(data) {
    const ctx = document.getElementById('sectorChart').getContext('2d');
    if (sectorChart) {
        sectorChart.destroy();
    }

    sectorChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.sector_type),
            datasets: [{
                label: 'Avg. Emissions',
                data: data.map(d => d.avg_emissions),
                backgroundColor: '#6f42c1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Emissions by Sector'
                }
            }
        }
    });
}

// Create Progress Circle
function createProgressCircle(progress) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    
    progressCircle.innerHTML = `
        <div class="position-relative" style="width: 150px; height: 150px;">
            <svg width="150" height="150" style="transform: rotate(-90deg);">
                <circle 
                    cx="75" 
                    cy="75" 
                    r="${radius}"
                    stroke="#e9ecef"
                    stroke-width="10"
                    fill="none"
                />
                <circle 
                    cx="75" 
                    cy="75" 
                    r="${radius}"
                    stroke="#6f42c1"
                    stroke-width="10"
                    fill="none"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                />
            </svg>
            <div class="position-absolute top-50 start-50 translate-middle text-center">
                <div class="h3 mb-0">${progress}%</div>
                <div class="text-muted">Complete</div>
            </div>
        </div>
    `;
}

// Render Functions
function renderSuggestionCard(suggestion) {
    if (!suggestion.id) {
        console.warn('Suggestion missing ID:', suggestion);
        return document.createElement('div');
    }

    // Ensure facilities is always an array
    const facilities = Array.isArray(suggestion.facilities) ? suggestion.facilities : 
                      suggestion.facilities ? [suggestion.facilities] : 
                      ['All Facilities'];

    const card = document.createElement('div');
    card.className = `card suggestion-card priority-${suggestion.priority.toLowerCase()} mb-3`;
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <span class="badge bg-${suggestion.priority === 'High' ? 'danger' : 
                                       suggestion.priority === 'Medium' ? 'warning' : 
                                       'success'} me-2">
                        ${suggestion.priority} Priority
                    </span>
                    <span class="badge bg-${suggestion.category === 'Emissions' ? 'success' : 
                                         suggestion.category === 'Costs' ? 'info' : 
                                         'primary'}">
                        ${suggestion.category}
                    </span>
                </div>
                <span class="badge bg-light text-dark">
                    ${suggestion.type === 'Global' ? 'All Facilities' : 'Facility-Specific'}
                </span>
            </div>
            
            <h5 class="card-title mb-3">${suggestion.title || 'Untitled Suggestion'}</h5>
            <p class="card-text">${suggestion.description || 'No description available'}</p>
            
            <div class="mb-3">
                <small class="text-muted">Applicable to:</small>
                <div class="d-flex flex-wrap gap-2 mt-1">
                    ${facilities.map(facility => `
                        <span class="badge bg-light text-dark">
                            <i class="fas fa-building me-1"></i>${facility}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-4">
                    <small class="text-muted d-block">Potential Impact</small>
                    <strong>${suggestion.impact || 'N/A'}</strong>
                </div>
                <div class="col-md-4">
                    <small class="text-muted d-block">Timeline</small>
                    <strong>${suggestion.timeline || 'N/A'}</strong>
                </div>
                <div class="col-md-4">
                    <small class="text-muted d-block">ROI</small>
                    <strong>${suggestion.roi || 'N/A'}</strong>
                </div>
            </div>

            <div class="progress mb-3" style="height: 5px;">
                <div class="progress-bar bg-success" role="progressbar" 
                     style="width: ${suggestion.completion || 0}%"></div>
            </div>

            <div class="d-flex justify-content-between align-items-center">
                <button class="btn btn-primary btn-sm view-details" data-id="${suggestion.id}">
                    View Details
                </button>
                <div class="text-end">
                    <small class="text-muted">Completion:</small>
                    <strong class="ms-1">${suggestion.completion || 0}%</strong>
                </div>
            </div>
        </div>
    `;

    const viewDetailsBtn = card.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', () => showSuggestionDetails(suggestion.id));

    return card;
}
// Fix the equipment health rendering
function renderEquipmentHealth(equipment) {
    const efficiency = parseFloat(equipment.efficiency_rating) || 0;
    const lastMaintenance = equipment.last_maintenance_date ? 
        formatDate(equipment.last_maintenance_date) : 'No maintenance recorded';
    
    return `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">
                        <span class="health-indicator health-${getHealthStatus(efficiency)}"></span>
                        ${equipment.equipment_name}
                    </h6>
                    <small class="text-muted">Last maintenance: ${lastMaintenance}</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-${getHealthStatus(efficiency)}">
                        ${efficiency.toFixed(1)}%
                    </span>
                    <small class="d-block text-muted">${equipment.operational_status || 'Unknown'}</small>
                </div>
            </div>
        </div>
    `;
}

// Fix the facility ranking rendering
function renderFacilityRanking(facility, index) {
    const efficiency = facility.efficiency || 0;
    const emissions = facility.emissions || 0;
    
    return `
        <div class="list-group-item">
            <div class="d-flex align-items-center">
                <div class="facility-rank">${index + 1}</div>
                <div>
                    <h6 class="mb-0">${facility.facility_name}</h6>
                    <small class="text-muted">
                        Efficiency: ${parseFloat(efficiency).toFixed(1)}% | 
                        Emissions: ${parseFloat(emissions).toFixed(1)} MT
                    </small>
                </div>
            </div>
        </div>
    `;
}

// Modal Functions
async function showSuggestionDetails(suggestionId) {
    if (!suggestionId) {
        console.error('No suggestion ID provided');
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('suggestionDetailModal'));
    const content = document.getElementById('suggestionDetailContent');
    const suggestion = currentSuggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) {
        console.error('Suggestion not found:', suggestionId);
        return;
    }

    // Update modal title and show loading state
    document.querySelector('#suggestionDetailModal .modal-title').innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <span class="badge bg-${suggestion.priority === 'High' ? 'danger' : 
                                   suggestion.priority === 'Medium' ? 'warning' : 
                                   'success'}">${suggestion.priority}</span>
            <span>${suggestion.title}</span>
        </div>
    `;
    
    content.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mb-0">Analyzing data and generating detailed insights...</p>
        </div>
    `;
    modal.show();

    try {
        const response = await fetch(`/api/suggestions/${suggestionId}/details`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const details = await response.json();

        content.innerHTML = `
            <!-- Overview Section -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <span class="badge bg-${suggestion.type === 'Global' ? 'primary' : 'info'} mb-2">
                                ${suggestion.type} Initiative
                            </span>
                            <h6 class="mb-1">Applicable Facilities:</h6>
                            <p class="mb-0">${suggestion.facilities.join(', ')}</p>
                        </div>
                        <div class="text-end">
                            <div class="small text-muted">Current Progress</div>
                            <div class="progress" style="width: 100px; height: 8px;">
                                <div class="progress-bar bg-success" style="width: ${suggestion.completion}%"></div>
                            </div>
                            <small class="text-muted">${suggestion.completion}% Complete</small>
                        </div>
                    </div>
                    <p class="mb-0">${suggestion.description}</p>
                </div>
            </div>

            <!-- Impact Analysis Cards -->
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card h-100 border-0 bg-success bg-opacity-10">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-leaf text-success me-2"></i>
                                <h6 class="mb-0">Environmental Impact</h6>
                            </div>
                            <h4 class="mb-2">${details.analysis.potential_savings.emissions} MT</h4>
                            <p class="small mb-0">Annual CO₂ Reduction</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-0 bg-primary bg-opacity-10">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-dollar-sign text-primary me-2"></i>
                                <h6 class="mb-0">Financial Impact</h6>
                            </div>
                            <h4 class="mb-2">$${details.analysis.potential_savings.cost}</h4>
                            <p class="small mb-0">Annual Cost Savings</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-0 bg-info bg-opacity-10">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-chart-line text-info me-2"></i>
                                <h6 class="mb-0">Efficiency Gain</h6>
                            </div>
                            <h4 class="mb-2">${details.analysis.potential_savings.efficiency}%</h4>
                            <p class="small mb-0">Operational Improvement</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Implementation Timeline -->
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <h6 class="mb-0">Implementation Plan</h6>
                </div>
                <div class="card-body">
                    <div class="timeline">
                        ${details.implementation.steps.map((step, index) => `
                            <div class="timeline-item">
                                <div class="timeline-marker bg-primary">${step.step}</div>
                                <div class="timeline-content">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <h6 class="mb-0">${step.title}</h6>
                                        <span class="badge bg-light text-dark">${step.timeline}</span>
                                    </div>
                                    <p class="mb-2">${step.description}</p>
                                    <div class="d-flex flex-wrap gap-2">
                                        ${step.resources_needed.map(resource => 
                                            `<span class="badge bg-light text-dark">
                                                <i class="fas fa-cube me-1"></i>${resource}
                                            </span>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card-footer bg-light">
                    <div class="row text-center g-3">
                        <div class="col-md-4">
                            <small class="text-muted d-block">Total Timeline</small>
                            <strong>${details.implementation.estimated_completion_time}</strong>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Implementation Cost</small>
                            <strong>$${details.implementation.total_cost}</strong>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">ROI Period</small>
                            <strong>${details.implementation.roi_period}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Monitoring & KPIs -->
            <div class="card">
                <div class="card-header bg-light">
                    <h6 class="mb-0">Monitoring & Success Metrics</h6>
                </div>
                <div class="card-body">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <h6 class="mb-3">Key Performance Indicators</h6>
                            <div class="d-flex flex-column gap-2">
                                ${details.monitoring.kpis.map(kpi => `
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-chart-line text-primary me-2"></i>
                                        <span>${kpi}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="mb-3">Success Criteria</h6>
                            <div class="d-flex flex-column gap-2">
                                ${details.monitoring.success_criteria.map(criteria => `
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-check-circle text-success me-2"></i>
                                        <span>${criteria}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 pt-3 border-top">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-clock text-muted me-2"></i>
                            <span>Measurement Frequency: ${details.monitoring.measurement_frequency}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching suggestion details:', error);
        content.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong>Error loading details:</strong> ${error.message}
            </div>
        `;
    }
}

async function fetchSuggestionDetails(suggestionId, contentElement) {
    try {
        const response = await fetch(`/api/suggestions/${suggestionId}/details`);
        const details = await response.json();
        
        contentElement.innerHTML = `
            <div class="suggestion-details">
                <div class="mb-4">
                    <h6 class="mb-3">Current State Analysis</h6>
                    <p>${details.analysis.current_state}</p>
                    <div class="mb-3">
                        <strong>Impact Areas:</strong>
                        <ul>
                            ${details.analysis.impact_areas.map(area => `<li>${area}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="mb-4">
                    <h6 class="mb-3">Implementation Steps</h6>
                    ${details.implementation.steps.map(step => `
                        <div class="implementation-step">
                            <h6>${step.title}</h6>
                            <p>${step.description}</p>
                            <small class="text-muted">Timeline: ${step.timeline}</small>
                        </div>
                    `).join('')}
                </div>

                <div class="mb-4">
                    <h6 class="mb-3">Expected Outcomes</h6>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h3>${details.analysis.potential_savings.emissions}MT</h3>
                                    <small class="text-muted">Emissions Reduction</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h3>$${details.analysis.potential_savings.cost}</h3>
                                    <small class="text-muted">Cost Savings</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h3>${details.analysis.potential_savings.efficiency}%</h3>
                                    <small class="text-muted">Efficiency Gain</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <h6 class="mb-3">Monitoring Plan</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <strong>Key Performance Indicators:</strong>
                            <ul>
                                ${details.monitoring.kpis.map(kpi => `<li>${kpi}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <strong>Success Criteria:</strong>
                            <ul>
                                ${details.monitoring.success_criteria.map(criteria => 
                                    `<li>${criteria}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        contentElement.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load suggestion details. Please try again later.
            </div>
        `;
    }
}

// Utility Functions
function getHealthStatus(efficiency) {
    if (efficiency >= 95) return 'good';
    if (efficiency >= 85) return 'warning';
    return 'critical';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    }).format(date);
}

// Data Fetching
// Add error handling to data fetching
async function fetchAllData() {
    try {
        setLoading(true);
        
        const [suggestionsResponse, sectorAnalysis, equipmentHealth, progress] = await Promise.all([
            fetch('/api/suggestions').then(res => res.json()),
            fetch('/api/sector-analysis').then(res => res.json()),
            fetch('/api/equipment-health').then(res => res.json()),
            fetch('/api/implementation-progress').then(res => res.json())
        ]);

        console.log('Sector Analysis Response:', sectorAnalysis); // Debug log

        // Store suggestions in the global variable
        currentSuggestions = suggestionsResponse.suggestions || [];
        
        // Update UI
        renderSuggestions();
        updateSectorAnalysis(sectorAnalysis);
        updateEquipmentHealth(equipmentHealth || []);
        updateProgress(progress);

    } catch (error) {
        console.error('Error fetching data:', error);
        showErrorToast('Failed to load dashboard data');
        currentSuggestions = []; // Reset on error
    } finally {
        setLoading(false);
    }
}

// UI Update Functions
function renderSuggestions() {
    suggestionsContainer.innerHTML = '';
    const filteredSuggestions = currentFilter === 'all' 
        ? currentSuggestions 
        : currentSuggestions.filter(s => s.category.toLowerCase() === currentFilter);

    if (filteredSuggestions.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-filter fa-2x mb-3"></i>
                <p>No suggestions found for the selected filter.</p>
            </div>
        `;
        return;
    }

    filteredSuggestions.forEach(suggestion => {
        suggestionsContainer.appendChild(renderSuggestionCard(suggestion));
    });
}

function updateSectorAnalysis(data, metric = currentMetric) {
    if (!data) return;
    
    console.log('Updating sector analysis with data:', data);
    lastSectorData = data; // Store the data for later use

    // Initialize/update the sector chart
    initializeSectorChart(data.sectorData, metric);

    // Make sure we have facility rankings data
    if (data.facilityRankings && Array.isArray(data.facilityRankings)) {
        updateFacilityRankings(data.facilityRankings, metric);
    } else {
        console.error('Missing or invalid facility rankings data:', data.facilityRankings);
    }
}

function updateFacilityRankings(facilities, metric = currentMetric) {
    const rankingsContainer = document.getElementById('facilityRankings');
    if (!rankingsContainer) return;

    // Sort facilities based on metric
    const sortedFacilities = [...facilities].sort((a, b) => {
        if (metric === 'emissions') {
            return b.total_emissions - a.total_emissions;
        }
        return b.total_costs - a.total_costs;
    });

    console.log('Sorted Facilities:', sortedFacilities);

    rankingsContainer.innerHTML = sortedFacilities
        .slice(0, 5) // Show top 5
        .map((facility, index) => {
            const emissionsValue = parseFloat(facility.total_emissions) || 0;
            // Cap efficiency at 100%
            const efficiencyValue = Math.min(parseFloat(facility.efficiency_metrics) || 0, 100);
            const costsValue = parseFloat(facility.total_costs) || 0;

            return `
                <div class="list-group-item">
                    <div class="d-flex align-items-center">
                        <div class="facility-rank">${index + 1}</div>
                        <div class="flex-grow-1">
                            <h6 class="mb-0">${facility.facility_name}</h6>
                            ${metric === 'emissions' ? `
                                <small class="text-muted">
                                    Emissions: ${emissionsValue.toFixed(1)} MT CO₂e | 
                                    Efficiency: ${efficiencyValue.toFixed(1)}%
                                </small>
                            ` : `
                                <small class="text-muted">
                                    Total Costs: $${costsValue.toLocaleString()}
                                </small>
                            `}
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
}

// Add the event listener for sector filters
document.addEventListener('DOMContentLoaded', () => {
    // ... existing DOMContentLoaded code ...

    // Add sector filter event listener
    document.getElementById('sectorFilters').addEventListener('click', (e) => {
        if (e.target.dataset.metric) {
            currentMetric = e.target.dataset.metric;
            
            // Update active state
            e.target.closest('.btn-group').querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Update visualizations using the stored data
            if (lastSectorData) {
                updateSectorAnalysis(lastSectorData, currentMetric);
            }
        }
    });
});

function updateEquipmentHealth(data) {
    equipmentList.innerHTML = data
        .map(equipment => renderEquipmentHealth(equipment))
        .join('');
}

// Update the progress circle with default values
function updateProgress(data = { avg_progress: 0, completed_count: 0, total_count: 0 }) {
    const progress = parseFloat(data.avg_progress) || 0;
    createProgressCircle(progress);
    
    progressStats.innerHTML = `
        <p class="mb-0">${data.completed_count || 0} of ${data.total_count || 0} actions completed</p>
        <small class="text-muted">Last updated: ${formatDate(new Date())}</small>
    `;
}

// Utility Functions
function generateCSV(suggestions) {
    const headers = ['Priority', 'Category', 'Title', 'Description', 'Impact', 'Timeline', 'ROI', 'Completion'];
    const rows = suggestions.map(s => [
        s.priority,
        s.category,
        s.title,
        s.description,
        s.impact,
        s.timeline,
        s.roi,
        `${s.completion}%`
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
}

function setLoading(isLoading) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const suggestionsContainer = document.getElementById('suggestionsContainer');
    
    if (isLoading) {
        loadingSpinner.classList.remove('d-none');
        suggestionsContainer.classList.add('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
        suggestionsContainer.classList.remove('d-none');
    }
}

function showErrorToast(message) {
    const toast = document.getElementById('errorToast');
    const toastBody = toast.querySelector('.toast-body');
    toastBody.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    fetchAllData();

    // Filter buttons
    suggestionFilters.addEventListener('click', (e) => {
        if (e.target.dataset.filter) {
            currentFilter = e.target.dataset.filter;
            
            // Update active state
            suggestionFilters.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            renderSuggestions();
        }
    });

    // Refresh button
    refreshButton.addEventListener('click', fetchAllData);

    // Export button
    exportButton.addEventListener('click', exportDashboard);

});

function initializeSectorChart(data, metric) {
    const ctx = document.getElementById('sectorChart');
    if (!ctx) return;
    
    if (sectorChart) {
        sectorChart.destroy();
    }

    const chartData = {
        labels: data.map(d => d.sector_type),
        datasets: metric === 'emissions' ? [
            {
                label: 'Scope 1',
                data: data.map(d => d.scope1_emissions || 0),
                backgroundColor: '#28a745',
                stack: 'Stack 0',
            },
            {
                label: 'Scope 2',
                data: data.map(d => d.scope2_emissions || 0),
                backgroundColor: '#17a2b8',
                stack: 'Stack 0',
            },
            {
                label: 'Scope 3',
                data: data.map(d => d.scope3_emissions || 0),
                backgroundColor: '#6c757d',
                stack: 'Stack 0',
            }
        ] : [{
            label: 'Total Costs',
            data: data.map(d => d.total_costs || 0),
            backgroundColor: '#6f42c1',
        }]
    };

    sectorChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    stacked: metric === 'emissions',
                },
                y: {
                    stacked: metric === 'emissions',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: metric === 'emissions' ? 'Emissions (MT CO₂e)' : 'Costs ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return metric === 'emissions' 
                                ? value.toFixed(1)
                                : '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.parsed.y;
                            if (metric === 'emissions') {
                                return `${label}: ${value.toFixed(1)} MT CO₂e`;
                            }
                            return `${label}: $${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

// Add event listener for sector filters
document.getElementById('sectorFilters').addEventListener('click', (e) => {
    if (e.target.dataset.metric) {
        currentMetric = e.target.dataset.metric;
        
        // Update active state
        e.target.parentElement.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Update visualizations
        updateSectorAnalysis(lastSectorData, currentMetric);
    }
});

// Progress toast component - create it once at the start
function createProgressToast() {
    const progressToast = document.createElement('div');
    progressToast.className = 'toast position-fixed bottom-0 end-0 m-4';
    progressToast.id = 'exportProgressToast';
    progressToast.setAttribute('role', 'alert');
    progressToast.setAttribute('aria-live', 'assertive');
    progressToast.style.minWidth = '300px';
    progressToast.style.zIndex = '1050';
    progressToast.innerHTML = `
        <div class="toast-body p-3">
            <div class="d-flex justify-content-between mb-2">
                <strong>Generating Report</strong>
                <div class="text-muted small progress-percentage">0%</div>
            </div>
            <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: 0%"></div>
            </div>
            <div class="text-muted small mt-2" id="exportStatus">Initializing...</div>
        </div>
    `;
    document.body.appendChild(progressToast);
    return progressToast;
}

// Helper function to draw progress circle
function drawProgressCircle(pdf, x, y, radius, progress, text) {
    const steps = 100;
    const centerX = x + radius;
    const centerY = y + radius;
    
    // Draw background circle
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(2);
    for (let i = 0; i < steps; i++) {
        const angle1 = (i / steps) * 2 * Math.PI;
        const angle2 = ((i + 1) / steps) * 2 * Math.PI;
        pdf.line(
            centerX + radius * Math.cos(angle1),
            centerY + radius * Math.sin(angle1),
            centerX + radius * Math.cos(angle2),
            centerY + radius * Math.sin(angle2)
        );
    }
    
    // Draw progress arc
    const progressSteps = Math.floor((progress / 100) * steps);
    pdf.setDrawColor(111, 66, 193); // Purple color (#6f42c1)
    for (let i = 0; i < progressSteps; i++) {
        const angle1 = (i / steps) * 2 * Math.PI - (Math.PI / 2);
        const angle2 = ((i + 1) / steps) * 2 * Math.PI - (Math.PI / 2);
        pdf.line(
            centerX + radius * Math.cos(angle1),
            centerY + radius * Math.sin(angle1),
            centerX + radius * Math.cos(angle2),
            centerY + radius * Math.sin(angle2)
        );
    }
    
    // Add percentage text
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const percentageText = `${progress.toFixed(1)}%`;
    const textWidth = pdf.getStringUnitWidth(percentageText) * 20 / pdf.internal.scaleFactor;
    pdf.text(percentageText, centerX - (textWidth / 2), centerY);
    
    // Add label
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const labelWidth = pdf.getStringUnitWidth(text) * 12 / pdf.internal.scaleFactor;
    pdf.text(text, centerX - (labelWidth / 2), centerY + 10);
}

// Enhanced exportDashboard function
async function exportDashboard() {
    const progressToast = createProgressToast();
    const bsToast = new bootstrap.Toast(progressToast, { autohide: false });
    
    try {
        bsToast.show();
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Exporting...';

        function updateProgress(percentage, status) {
            progressToast.querySelector('.progress-bar').style.width = `${percentage}%`;
            progressToast.querySelector('.progress-percentage').textContent = `${Math.round(percentage)}%`;
            progressToast.querySelector('#exportStatus').textContent = status;
        }

        updateProgress(5, 'Collecting data...');

        // Fetch all necessary data
        const [suggestionsData, sectorData, implementationData, equipmentData] = await Promise.all([
            fetch('/api/suggestions').then(res => res.json()),
            fetch('/api/sector-analysis').then(res => res.json()),
            fetch('/api/implementation-progress').then(res => res.json()),
            fetch('/api/equipment-health').then(res => res.json())
        ]);

        // Initialize PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 20;
        const textWidth = pageWidth - (2 * margin);
        let yOffset = margin;

        // Helper function for delayed API calls
        async function fetchWithDelay(url, delay = 3000) {
            await new Promise(resolve => setTimeout(resolve, delay));
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }

        // Helper function to add suggestion box with proper text wrapping
        function addSuggestionBox(suggestion) {
            pdf.setFontSize(14);
            const titleLines = pdf.splitTextToSize(suggestion.title, textWidth - 10);
            const titleHeight = titleLines.length * 7;

            pdf.setFontSize(12);
            const detailsText = `Priority: ${suggestion.priority} | Impact: ${suggestion.impact} | ROI: ${suggestion.roi}`;
            const detailsLines = pdf.splitTextToSize(detailsText, textWidth - 10);
            const detailsHeight = detailsLines.length * 6;

            const descriptionLines = pdf.splitTextToSize(suggestion.description, textWidth - 10);
            const descriptionHeight = descriptionLines.length * 6;

            const boxHeight = titleHeight + detailsHeight + descriptionHeight + 20;

            if (yOffset + boxHeight > pageHeight - margin) {
                pdf.addPage();
                yOffset = margin;
            }

            pdf.setDrawColor(200);
            pdf.rect(margin, yOffset, textWidth, boxHeight);

            let currentOffset = yOffset + 10;
            
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(titleLines, margin + 5, currentOffset);
            currentOffset += titleHeight + 5;

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(detailsLines, margin + 5, currentOffset);
            currentOffset += detailsHeight + 5;

            pdf.text(descriptionLines, margin + 5, currentOffset);

            return boxHeight + 10;
        }

        // Cover Page
        updateProgress(10, 'Creating cover page...');
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Artificial Intelligence Suggestions Report', margin, pageHeight / 3);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight / 3 + 20);
        pdf.text(`Report Period: ${new Date().toLocaleDateString()}`, margin, pageHeight / 3 + 30);

        // Table of Contents
        pdf.addPage();
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        yOffset = margin;
        pdf.text('Table of Contents', margin, yOffset);
        yOffset += 20;

        const sections = [
            'AI-Generated Suggestions',
            'Sector Performance Analysis',
            'Facility Rankings',
            'Implementation Progress',
            'Equipment Health Monitor'
        ];

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        sections.forEach((section, index) => {
            pdf.text(`${index + 1}. ${section}`, margin, yOffset);
            yOffset += 10;
        });

        // Process suggestions
        updateProgress(20, 'Processing suggestions...');
        const detailedSuggestions = [];
        for (let i = 0; i < suggestionsData.suggestions.length; i++) {
            try {
                const suggestion = suggestionsData.suggestions[i];
                updateProgress(
                    20 + (30 * (i / suggestionsData.suggestions.length)),
                    `Processing suggestion ${i + 1} of ${suggestionsData.suggestions.length}...`
                );
                
                const details = await fetchWithDelay(`/api/suggestions/${suggestion.id}/details`);
                detailedSuggestions.push({ ...suggestion, details });
            } catch (error) {
                console.error('Error fetching suggestion details:', error);
                continue;
            }
        }

        // AI-Generated Suggestions Section
        pdf.addPage();
        yOffset = margin;
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI-Generated Suggestions', margin, yOffset);
        yOffset += 20;

        // Add suggestions
        detailedSuggestions.forEach((suggestion) => {
            // Start each suggestion on a new page
            pdf.addPage();
            yOffset = margin;

            // Add section header for each suggestion
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('AI Suggestion', margin, yOffset);
            yOffset += 15;

            // Add the suggestion box
            const boxHeight = addSuggestionBox(suggestion);
            yOffset += boxHeight;

            // Add implementation steps if available
            if (suggestion.details?.implementation?.steps) {
                pdf.setFont('helvetica', 'bold');
                pdf.text('Implementation Steps:', margin, yOffset);
                yOffset += 10;
                pdf.setFont('helvetica', 'normal');

                suggestion.details.implementation.steps.forEach(step => {
                    const stepText = `${step.step}. ${step.title}: ${step.description}`;
                    const stepLines = pdf.splitTextToSize(stepText, textWidth - 15);
                    
                    // Check if we need a new page for steps
                    if (yOffset + (stepLines.length * 7) > pageHeight - margin) {
                        pdf.addPage();
                        yOffset = margin;
                        // Add a continuation header
                        pdf.setFont('helvetica', 'bold');
                        pdf.text('Implementation Steps (continued):', margin, yOffset);
                        yOffset += 10;
                        pdf.setFont('helvetica', 'normal');
                    }
                    
                    pdf.text(stepLines, margin + 10, yOffset);
                    yOffset += stepLines.length * 7 + 5;
                });
            } else if (suggestion.details === null) {
                // Handle case where details couldn't be fetched
                yOffset += 10;
                pdf.setFont('helvetica', 'italic');
                pdf.setTextColor(150, 0, 0); // Dark red color
                pdf.text('Implementation details could not be loaded.', margin, yOffset);
                pdf.setTextColor(0, 0, 0); // Reset text color
                pdf.setFont('helvetica', 'normal');
            }
        });

        // Sector Performance Analysis - Emissions
        updateProgress(70, 'Adding sector analysis...');
        pdf.addPage();
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sector Performance Analysis - Emissions', margin, margin);

        const emissionsChart = document.getElementById('sectorChart');
        if (emissionsChart) {
            const canvas = await html2canvas(emissionsChart, {
                scale: 2,
                logging: false,
                willReadFrequently: true,
                backgroundColor: '#ffffff'
            });
            const chartImage = canvas.toDataURL('image/png');
            const imgWidth = textWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(chartImage, 'PNG', margin, margin + 20, imgWidth, imgHeight);
        }

        // Sector Performance Analysis - Costs
        pdf.addPage();
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sector Performance Analysis - Costs', margin, margin);

        const costsButton = document.querySelector('#sectorFilters [data-metric="costs"]');
        if (costsButton) {
            costsButton.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const costsChart = document.getElementById('sectorChart');
            if (costsChart) {
                const canvas = await html2canvas(costsChart, {
                    scale: 2,
                    logging: false,
                    willReadFrequently: true,
                    backgroundColor: '#ffffff'
                });
                const chartImage = canvas.toDataURL('image/png');
                const imgWidth = textWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(chartImage, 'PNG', margin, margin + 20, imgWidth, imgHeight);
            }
            
            // Switch back to emissions view
            document.querySelector('#sectorFilters [data-metric="emissions"]')?.click();
        }

        // Facility Rankings
        pdf.addPage();
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Facility Rankings', margin, margin);
        yOffset = margin + 20;

        // Emissions Rankings
        pdf.setFontSize(16);
        pdf.text('Emissions Rankings', margin, yOffset);
        yOffset += 10;

        // Add table headers
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const headers = ['Rank', 'Facility', 'Emissions (MT CO₂e)', 'Efficiency'];
        const colWidths = [15, 70, 50, 35];
        headers.forEach((header, i) => {
            pdf.text(header, margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yOffset);
        });
        yOffset += 10;

        // Add emissions rankings data
        pdf.setFont('helvetica', 'normal');
        const emissionsRankings = [...sectorData.facilityRankings]
            .sort((a, b) => b.total_emissions - a.total_emissions)
            .slice(0, 5);
            
        emissionsRankings.forEach((facility, index) => {
            const values = [
                (index + 1).toString(),
                facility.facility_name,
                facility.total_emissions.toFixed(1),
                `${facility.efficiency_metrics.toFixed(1)}%`
            ];
            values.forEach((value, i) => {
                pdf.text(value.toString(),
                        margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
                        yOffset);
            });
            yOffset += 7;
        });

        // Cost Rankings
        yOffset += 20;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Cost Rankings', margin, yOffset);
        yOffset += 10;

        // Add table headers
        pdf.setFontSize(12);
        const costHeaders = ['Rank', 'Facility', 'Total Costs ($)', 'Efficiency'];
        costHeaders.forEach((header, i) => {
            pdf.text(header, margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yOffset);
        });
        yOffset += 10;

        // Add cost rankings data
        pdf.setFont('helvetica', 'normal');
        const costRankings = [...sectorData.facilityRankings]
            .sort((a, b) => b.total_costs - a.total_costs)
            .slice(0, 5);
            
        costRankings.forEach((facility, index) => {
            const values = [
                (index + 1).toString(),
                facility.facility_name,
                facility.total_costs.toLocaleString(),
                `${facility.efficiency_metrics.toFixed(1)}%`
            ];
            values.forEach((value, i) => {
                pdf.text(value.toString(),
                        margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
                        yOffset);
            });
            yOffset += 7;
        });

        // Implementation Progress
        pdf.addPage();
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Implementation Progress', margin, margin);
        yOffset = margin + 30;

        // Draw progress circle
        drawProgressCircle(pdf, margin, yOffset, 30, implementationData.avg_progress, 'Complete');
        yOffset += 80;

        // Add progress stats
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Completed Actions: ${implementationData.completed_count}/${implementationData.total_count}`,
                margin, yOffset);
        yOffset += 10;
        pdf.text(`Overall Progress: ${implementationData.avg_progress.toFixed(1)}%`,
                margin, yOffset);

        // Equipment Health Monitor
        updateProgress(90, 'Adding equipment health data...');
        pdf.addPage();
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Equipment Health Monitor', margin, margin);
        yOffset = margin + 20;

        equipmentData.forEach(equipment => {
            if (yOffset > pageHeight - 30) {
                pdf.addPage();
                yOffset = margin;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(equipment.equipment_name, margin, yOffset);
            yOffset += 8;

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');

            const efficiency = parseFloat(equipment.efficiency_rating) || 0;
            const efficiencyText = `Efficiency Rating: ${efficiency.toFixed(1)}%`;
            const statusText = `Status: ${equipment.operational_status}`;
            
            // Add color indicator based on efficiency
            pdf.setFillColor(
                efficiency >= 90 ? 40 : efficiency >= 70 ? 255 : 220,
                efficiency >= 90 ? 167 : efficiency >= 70 ? 193 : 53,
                efficiency >= 90 ? 69 : efficiency >= 70 ? 7 : 69
            );
            pdf.circle(margin + 3, yOffset - 3, 2, 'F');
            
            pdf.text(efficiencyText, margin + 10, yOffset);
            yOffset += 7;
            pdf.text(statusText, margin + 10, yOffset);
            yOffset += 15;

            // Add maintenance info if available
            if (equipment.last_maintenance_date) {
                const maintenanceText = `Last Maintenance: ${new Date(equipment.last_maintenance_date).toLocaleDateString()}`;
                pdf.text(maintenanceText, margin + 10, yOffset);
                yOffset += 15;
            }
        });

        // Save PDF
        updateProgress(95, 'Finalizing report...');
        const fileName = `ai_suggestions_report_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

        // Show success and cleanup
        updateProgress(100, 'Report downloaded successfully!');
        setTimeout(() => {
            bootstrap.Toast.getInstance(progressToast).hide();
            setTimeout(() => progressToast.remove(), 500);
        }, 1500);

    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Failed to generate report', 'error');
        bootstrap.Toast.getInstance(progressToast).hide();
        setTimeout(() => progressToast.remove(), 500);
    } finally {
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.disabled = false;
        exportBtn.innerHTML = '<i class="fas fa-download me-1"></i>Export';
    }
}

// Helper function to show toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    document.querySelector('.toast-container').appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}