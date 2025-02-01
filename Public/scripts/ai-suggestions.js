// public/script.js

// State management
let currentSuggestions = [];
let currentCategory = 'all';

// DOM Elements
const suggestionCards = document.getElementById('suggestionCards');
const cardTemplate = document.getElementById('cardTemplate');
const lastUpdatedElement = document.getElementById('lastUpdated');
const refreshButton = document.getElementById('refreshBtn');
const categoryToggles = document.querySelectorAll('.category-toggle');

// Helper Functions
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `Updated ${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    return 'Updated just now';
}

function getPriorityStyle(priority) {
    switch (priority.toLowerCase()) {
        case 'high':
            return {
                badgeClass: 'bg-danger',
                textClass: '',
                borderClass: 'priority-high'
            };
        case 'medium':
            return {
                badgeClass: 'bg-warning',
                textClass: 'text-dark',
                borderClass: 'priority-medium'
            };
        case 'low':
            return {
                badgeClass: 'bg-success',
                textClass: '',
                borderClass: 'priority-low'
            };
        default:
            return {
                badgeClass: 'bg-secondary',
                textClass: '',
                borderClass: ''
            };
    }
}

function getTrendIcon(trend) {
    if (trend > 0) {
        // Positive trend means reduction (good), so show downward green arrow
        return `<i class="fas fa-arrow-down text-success"></i> ${trend}%`;
    } else if (trend < 0) {
        // Negative trend means increase (bad), so show upward red arrow
        return `<i class="fas fa-arrow-up text-danger"></i> ${Math.abs(trend)}%`;
    }
    return `<i class="fas fa-minus text-secondary"></i> 0%`;
}

// Card Creation
function createSuggestionCard(suggestion) {
    const clone = cardTemplate.content.cloneNode(true);
    const card = clone.querySelector('.suggestion-card');
    
    // Get priority styles
    const priorityStyle = getPriorityStyle(suggestion.priority);
    
    // Add priority class to card
    card.classList.add(priorityStyle.borderClass);
    
    // Set badge classes
    const badge = card.querySelector('.badge');
    badge.classList.add(priorityStyle.badgeClass);
    if (priorityStyle.textClass) {
        badge.classList.add(priorityStyle.textClass);
    }
    badge.textContent = `${suggestion.priority} Priority`;
    
    // Set content
    card.querySelector('h6').textContent = suggestion.title;
    card.querySelector('.description').textContent = suggestion.description;
    card.querySelector('.trend').innerHTML = getTrendIcon(suggestion.trend);
    card.querySelector('.impact').textContent = suggestion.impact;
    card.querySelector('.timeline').textContent = suggestion.timeline;
    
    // Create progress ring
    const progressRing = card.querySelector('.progress-ring');
    const completion = suggestion.completion || 0;
    progressRing.innerHTML = `
        <svg class="progress-ring__svg" width="40" height="40">
            <circle class="progress-ring__circle--bg" cx="20" cy="20" r="16" />
            <circle class="progress-ring__circle" cx="20" cy="20" r="16" 
                    style="stroke-dasharray: ${2 * Math.PI * 16}; 
                           stroke-dashoffset: ${2 * Math.PI * 16 * (1 - completion / 100)}" />
        </svg>
        <span class="progress-ring__text">${completion}%</span>`;
    
    // Set data attribute for filtering
    card.dataset.category = suggestion.category.toLowerCase();
    
    // Add hover animation
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateX(5px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateX(0)';
    });
    
    return card;
}

// Data Fetching
async function fetchSuggestions() {
    try {
        refreshButton.disabled = true;
        refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Refreshing...';
        
        const response = await fetch('/api/suggestions');
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const data = await response.json();
        currentSuggestions = data.suggestions;
        
        updateLastUpdated();
        renderSuggestions();
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        suggestionCards.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load suggestions. Please try again later.
            </div>
        `;
    } finally {
        refreshButton.disabled = false;
        refreshButton.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Refresh Suggestions';
    }
}

// Rendering
function renderSuggestions() {
    suggestionCards.innerHTML = '';
    const filteredSuggestions = currentCategory === 'all' 
        ? currentSuggestions 
        : currentSuggestions.filter(s => s.category.toLowerCase() === currentCategory);
    
    if (filteredSuggestions.length === 0) {
        suggestionCards.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="fas fa-info-circle me-2"></i>
                No suggestions found for this category.
            </div>
        `;
        return;
    }
    
    filteredSuggestions.forEach(suggestion => {
        suggestionCards.appendChild(createSuggestionCard(suggestion));
    });
}

function updateLastUpdated() {
    const now = new Date();
    lastUpdatedElement.textContent = formatTimeAgo(now);
}

// Event Listeners
categoryToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        categoryToggles.forEach(btn => btn.classList.remove('active'));
        toggle.classList.add('active');
        currentCategory = toggle.dataset.category;
        renderSuggestions();
    });
});

refreshButton.addEventListener('click', fetchSuggestions);

// Auto-refresh every 5 minutes
setInterval(fetchSuggestions, 5 * 60 * 1000);

// Initial load
document.addEventListener('DOMContentLoaded', fetchSuggestions);