(() => {
  'use strict'

  // Configuration
  let config = {
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
  let selectedDateRange = {
    start: moment().subtract(1, 'year'),
    end: moment()
  };

  // Calculate totals for date range
  function calculateTotalsForDateRange(data) {
    const totals = {
      total: 0,
      sustainable: 0,
      credits: 0
    };

    data.forEach(d => {
      totals.total += d.total;
      totals.sustainable += d.sustainable;
      totals.credits += d.credits;
    });

    return totals;
  }

  // Initialize bus visualization
  function initializeBuses() {
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
    const filteredData = filterDataByDateRange(config.graphData);
    const totals = calculateTotalsForDateRange(filteredData);
    
    // Round to nearest whole number of buses
    const totalBuses = Math.round(totals.total / config.busWeight);
    const sustainableBuses = Math.round(totals.sustainable / config.busWeight);
    const creditsBuses = Math.round(totals.credits / config.busWeight);

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
      img.src = '../assets/brand/logo.png';
      img.alt = 'School Bus';
      bus.appendChild(img);

      container.appendChild(bus);
    }
  }

  // Filter data based on date range
  function filterDataByDateRange(data) {
    return data.filter(d => {
      const date = moment(d.month);
      return date.isBetween(selectedDateRange.start, selectedDateRange.end, 'month', '[]');
    });
  }

  // Handle mouse movement for 3D effect
  function initialize3DEffect() {
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
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

  // Initialize emissions chart
  function initializeChart() {
    const ctx = document.getElementById('emissionsChart');
    if (!ctx) return;

    if (currentChart) {
      currentChart.destroy();
    }

    const filteredData = filterDataByDateRange(config.graphData);

    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: filteredData.map(d => moment(d.month).format('MMM YYYY')),
        datasets: [
          {
            label: 'Total Emissions',
            data: filteredData.map(d => d.total),
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            fill: true,
            hidden: !document.getElementById('showTotal')?.checked
          },
          {
            label: 'Sustainable Offset',
            data: filteredData.map(d => d.sustainable),
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            fill: true,
            hidden: !document.getElementById('showSustainable')?.checked
          },
          {
            label: 'Credits Offset',
            data: filteredData.map(d => d.credits),
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            fill: true,
            hidden: !document.getElementById('showCredits')?.checked
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
    
    const filteredData = filterDataByDateRange(config.graphData);
    
    tbody.innerHTML = filteredData.map(d => `
      <tr>
        <td>${moment(d.month).format('MMM YYYY')}</td>
        <td>${d.total} tons</td>
        <td>${d.sustainable} tons</td>
        <td>${d.credits} tons</td>
      </tr>
    `).join('');
  }

  // Handle view toggle
  function initializeViewToggle() {
    const toggle = document.getElementById('viewToggle');
    if (!toggle) return;

    const visualizationContainer = document.getElementById('visualization-container');
    const busLegend = document.getElementById('bus-legend');
    const advancedView = document.getElementById('advanced-view');
    const busDescription = document.querySelector('.bus-description');

    toggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        visualizationContainer?.classList.add('d-none');
        busLegend?.classList.add('d-none');
        advancedView?.classList.remove('d-none');
        busDescription.style.visibility = 'hidden';
        initializeChart();
        initializeTable();
      } else {
        visualizationContainer?.classList.remove('d-none');
        busLegend?.classList.remove('d-none');
        advancedView?.classList.add('d-none');
        busDescription.style.visibility = 'visible';
      }
    });

    ['showTotal', 'showSustainable', 'showCredits'].forEach(id => {
      const element = document.getElementById(id);
      element?.addEventListener('change', initializeChart);
    });
  }

  // Initialize date range picker
  function initializeDateRange() {
    const picker = document.getElementById('dateRangePicker');
    if (!picker) return;
    
    $(picker).daterangepicker({
      startDate: selectedDateRange.start,
      endDate: selectedDateRange.end,
      locale: {
        format: 'DD/MM/YYYY'
      },
      ranges: {
        'Last Month': [moment().subtract(1, 'month'), moment()],
        'Last 3 Months': [moment().subtract(3, 'months'), moment()],
        'Last 6 Months': [moment().subtract(6, 'months'), moment()],
        'Last Year': [moment().subtract(1, 'year'), moment()],
        'All Time': [moment('2023-01-01'), moment()]
      }
    });

    $(picker).on('apply.daterangepicker', function(ev, picker) {
      selectedDateRange = {
        start: picker.startDate,
        end: picker.endDate
      };
      updateDisplayForDateRange();
    });
  }

  function updateDisplayForDateRange() {
    const filteredData = filterDataByDateRange(config.graphData);
    const totals = calculateTotalsForDateRange(filteredData);
    
    // Update config with totals
    config.totalEmissions = totals.total;
    config.sustainableOffset = totals.sustainable;
    config.creditsOffset = totals.credits;
    
    // Update displays
    updateSummaryDisplay();
    initializeBuses();
    if (document.getElementById('viewToggle')?.checked) {
      initializeChart();
      initializeTable();
    }
  }

  // Update summary display
  function updateSummaryDisplay() {
    const title = document.querySelector('.display-6');
    const subtext = document.querySelector('.text-muted.small');
    if (!title || !subtext) return;
    
    title.textContent = `${Math.round(config.totalEmissions)} Tons Total`;
    subtext.innerHTML = `
      <span class="text-warning">● ${Math.round(config.sustainableOffset)} Tons</span>,
      <span class="text-success">● ${Math.round(config.creditsOffset)} Tons</span>
    `;
  }

  // Initialize everything when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    initializeDateRange();
    updateDisplayForDateRange(); // This will initialize everything else
    initialize3DEffect();
    initializeViewToggle();
  });
})();