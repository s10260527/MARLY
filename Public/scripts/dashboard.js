(() => {
  'use strict'

  // Configuration
  const config = {
    totalEmissions: 144,
    sustainableOffset: 36,
    creditsOffset: 24,
    busWeight: 12, // tons per bus
    graphData: [
      { month: '2023-01', total: 150, sustainable: 30, credits: 20 },
      { month: '2023-02', total: 144, sustainable: 36, credits: 24 },
      { month: '2023-03', total: 140, sustainable: 38, credits: 26 },
      { month: '2023-04', total: 142, sustainable: 35, credits: 25 },
      { month: '2023-05', total: 138, sustainable: 37, credits: 27 },
      { month: '2023-06', total: 136, sustainable: 38, credits: 28 },
      { month: '2023-07', total: 134, sustainable: 39, credits: 29 },
      { month: '2023-08', total: 132, sustainable: 40, credits: 30 },
      { month: '2023-09', total: 130, sustainable: 41, credits: 31 },
      { month: '2023-10', total: 128, sustainable: 42, credits: 32 },
      { month: '2023-11', total: 126, sustainable: 43, credits: 33 },
      { month: '2023-12', total: 124, sustainable: 44, credits: 34 }
    ]
  };

  let currentChart = null;

  // Initialize bus visualization
  function initializeBuses() {
    const container = document.getElementById('visualization-container');
    const totalBuses = Math.ceil(config.totalEmissions / config.busWeight);
    const sustainableBuses = Math.ceil(config.sustainableOffset / config.busWeight);
    const creditsBuses = Math.ceil(config.creditsOffset / config.busWeight);

    // Clear container
    container.innerHTML = '';

    // Create buses
    for (let i = 0; i < totalBuses; i++) {
      const bus = document.createElement('div');
      bus.className = 'school-bus';
      
      // Add appropriate overlay class
      if (i < sustainableBuses) {
        bus.classList.add('sustainable-offset');
      } else if (i < sustainableBuses + creditsBuses) {
        bus.classList.add('credits-offset');
      }

      // Position bus
      const row = Math.floor(i / 5);
      const col = i % 5;
      bus.style.left = `${col * 20}%`;
      bus.style.top = `${row * 100}px`;

      // Add bus image
      const img = document.createElement('img');
      img.src = 'assets/brand/logo.png'; // Update path to your bus image
      img.alt = 'School Bus';
      bus.appendChild(img);

      container.appendChild(bus);
    }
  }

  // Handle mouse movement for 3D effect
  function initialize3DEffect() {
    const container = document.getElementById('visualization-container');
    const buses = container.getElementsByClassName('school-bus');

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / container.clientWidth - 0.5;
      const y = (e.clientY - rect.top) / container.clientHeight - 0.5;

      Array.from(buses).forEach(bus => {
        const rotateX = y * 20;
        const rotateY = -x * 20;
        bus.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    });

    container.addEventListener('mouseleave', () => {
      Array.from(buses).forEach(bus => {
        bus.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  // Filter data based on date range
  function filterData(range) {
    const now = new Date();
    const months = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12,
      'ALL': config.graphData.length
    };
    
    const monthsToShow = months[range];
    return config.graphData.slice(-monthsToShow);
  }

  // Initialize emissions chart
  function initializeChart() {
    const ctx = document.getElementById('emissionsChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (currentChart) {
      currentChart.destroy();
    }

    const data = filterData(document.getElementById('dateRangeFilter').value);
    
    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => {
          const date = new Date(d.month);
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }),
        datasets: [
          {
            label: 'Total Emissions',
            data: data.map(d => d.total),
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            fill: true,
            hidden: !document.getElementById('showTotal').checked
          },
          {
            label: 'Sustainable Offset',
            data: data.map(d => d.sustainable),
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            fill: true,
            hidden: !document.getElementById('showSustainable').checked
          },
          {
            label: 'Credits Offset',
            data: data.map(d => d.credits),
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            fill: true,
            hidden: !document.getElementById('showCredits').checked
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tons CO₂'
            }
          }
        }
      }
    });
  }

  // Initialize data table
  function initializeTable() {
    const tbody = document.getElementById('emissions-table-body');
    if (!tbody) return;

    const data = filterData(document.getElementById('dateRangeFilter').value);
    
    tbody.innerHTML = data.map(d => {
      const date = new Date(d.month);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return `
        <tr>
          <td>${monthYear}</td>
          <td>${d.total} tons</td>
          <td>${d.sustainable} tons</td>
          <td>${d.credits} tons</td>
        </tr>
      `;
    }).join('');
  }

  // Handle view toggle
  function initializeViewToggle() {
    const toggle = document.getElementById('viewToggle');
    const visualizationContainer = document.getElementById('visualization-container');
    const busLegend = document.getElementById('bus-legend');
    const advancedView = document.getElementById('advanced-view');
    const busDescription = document.querySelector('.bus-description');

    toggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        visualizationContainer.classList.add('d-none');
        busLegend.classList.add('d-none');
        advancedView.classList.remove('d-none');
        busDescription.classList.add('d-none');
        initializeChart();
        initializeTable();
      } else {
        visualizationContainer.classList.remove('d-none');
        busLegend.classList.remove('d-none');
        advancedView.classList.add('d-none');
        busDescription.classList.remove('d-none');
      }
    });

    // Initialize chart filters
    document.getElementById('dateRangeFilter').addEventListener('change', () => {
      initializeChart();
      initializeTable();
    });

    ['showTotal', 'showSustainable', 'showCredits'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        initializeChart();
      });
    });
  }

  // Initialize everything when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    initializeBuses();
    initialize3DEffect();
    initializeViewToggle();
  });

})();
