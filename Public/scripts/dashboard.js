(() => {
  'use strict'

  // Configuration
  let config = {
    totalEmissions: 144,
    sustainableOffset: 36,
    creditsOffset: 24,
    busWeight: 12, // tons per bus
    
    // Mock data generator function
    generateMonthData: (baseTotal) => {
      // Generate random percentages for sustainable and credits
      const maxOffsetPercentage = 1;
      const sustainablePercent = Math.random() * maxOffsetPercentage;
      const remainingForCredits = maxOffsetPercentage - sustainablePercent;
      const creditsPercent = Math.random() * remainingForCredits;

      // Calculate offset values
      const sustainable = Math.round(baseTotal * sustainablePercent);
      const credits = Math.round(baseTotal * creditsPercent);

      // Generate random values for sectors that sum to baseTotal
      const getRandomSectorPercentages = () => {
        // Generate random values between 0-1 for each sector
        const p1 = Math.random();
        const p2 = Math.random();
        const p3 = Math.random();
        const p4 = Math.random();
        const p5 = Math.random();
        const sum = p1 + p2 + p3 + p4 + p5;
        
        // Normalize to make them sum to 1
        return {
          maintenance: p1 / sum,
          electricity: p2 / sum,
          services: p3 / sum,
          transport: p4 / sum,
          others: p5 / sum
        };
      };

      const percentages = getRandomSectorPercentages();
      
      // Create the data object with values rounded to 2 decimal places for the table
      return {
        total: Number(baseTotal.toFixed(2)),
        sustainable: Number(sustainable.toFixed(2)),
        credits: Number(credits.toFixed(2)),
        maintenance: Number((baseTotal * percentages.maintenance).toFixed(2)),
        electricity: Number((baseTotal * percentages.electricity).toFixed(2)),
        services: Number((baseTotal * percentages.services).toFixed(2)),
        transport: Number((baseTotal * percentages.transport).toFixed(2)),
        others: Number((baseTotal * percentages.others).toFixed(2))
      };
    }
  };

  // Add sector data to each month
  config.graphData = [
    { month: '2023-01', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-02', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-03', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-04', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-05', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-06', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-07', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-08', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-09', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-10', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-11', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) },
    { month: '2023-12', ...config.generateMonthData(Math.floor(Math.random() * 400 + 600)) }
  ];

  let currentChart = null;
  let sectorsChart = null;
  let selectedDateRange = {
    start: moment().subtract(1, 'year'),
    end: moment()
  };

  // Calculate totals for date range
  function calculateTotalsForDateRange(data) {
    const totals = {
      total: 0,
      sustainable: 0,
      credits: 0,
      maintenance: 0,
      electricity: 0,
      services: 0,
      transport: 0,
      others: 0
    };

    data.forEach(d => {
      totals.total += d.total;
      totals.sustainable += d.sustainable;
      totals.credits += d.credits;
      totals.maintenance += d.maintenance;
      totals.electricity += d.electricity;
      totals.services += d.services;
      totals.transport += d.transport;
      totals.others += d.others;
    });

    return totals;
  }

  // Initialize bus visualization with dynamic sizing
  function initializeBuses() {
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
    const filteredData = filterDataByDateRange(config.graphData);
    const totals = calculateTotalsForDateRange(filteredData);
    
    // Round to nearest whole number of buses
    const totalBuses = Math.round(totals.total / config.busWeight);
    const sustainableBuses = Math.round(totals.sustainable / config.busWeight);
    const creditsBuses = Math.round(totals.credits / config.busWeight);

    // Update bus counts
    document.getElementById('totalBusCount').textContent = totalBuses;
    document.getElementById('sustainableBusCount').textContent = sustainableBuses;
    document.getElementById('creditsBusCount').textContent = creditsBuses;

    // Clear container
    container.innerHTML = '';

    // Calculate optimal grid layout
    const containerWidth = container.offsetWidth - 32;
    const containerHeight = container.offsetHeight - 32;
    const aspectRatio = 1.5; // width/height ratio for each bus
    const padding = 12; // padding between buses

    // Calculate optimal number of columns
    let maxCols = Math.floor(Math.sqrt(totalBuses * (containerWidth / containerHeight)));
    let numRows = Math.ceil(totalBuses / maxCols);

    // Adjust if too many rows
    while (numRows * (containerWidth / maxCols / aspectRatio + padding) > containerHeight) {
      maxCols++;
      numRows = Math.ceil(totalBuses / maxCols);
    }

    // Calculate bus dimensions
    const busWidth = (containerWidth - (maxCols + 1) * padding) / maxCols;
    const busHeight = busWidth / aspectRatio;

    // Create buses with animation delay
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
      const row = Math.floor(i / maxCols);
      const col = i % maxCols;
      
      bus.style.width = `${busWidth}px`;
      bus.style.height = `${busHeight}px`;
      bus.style.left = `${col * (busWidth + padding) + padding}px`;
      bus.style.top = `${row * (busHeight + padding) + padding}px`;
      bus.style.animationDelay = `${i * 0.05}s`;

      // Create and add bus image
      const img = document.createElement('img');
      img.src = './assets/images/schoolBus.png';
      img.alt = 'School Bus';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
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
    let timeout;

    container.addEventListener('mousemove', (e) => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }

      timeout = window.requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / container.clientWidth - 0.5;
        const y = (e.clientY - rect.top) / container.clientHeight - 0.5;

        Array.from(buses).forEach((bus, index) => {
          const depth = 1 - Math.min(index / buses.length * 0.5, 0.4);
          const rotateX = y * 20 * depth;
          const rotateY = -x * 20 * depth;
          bus.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
      });
    });

    container.addEventListener('mouseleave', () => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }

      Array.from(buses).forEach(bus => {
        bus.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  // Initialize line chart for emissions
  function initializeChart() {
    const ctx = document.getElementById('emissionsChart');
    if (!ctx) return;

    if (currentChart) {
      currentChart.destroy();
    }

    const filteredData = filterDataByDateRange(config.graphData);

    const showTotal = document.getElementById('showTotal').checked;
    const showSustainable = document.getElementById('showSustainable').checked;
    const showCredits = document.getElementById('showCredits').checked;

    const datasets = [];
    
    if (showTotal) {
      datasets.push({
        label: 'Total Emissions',
        data: filteredData.map(d => d.total),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true
      });
    }
    
    if (showSustainable) {
      datasets.push({
        label: 'Sustainable Offset',
        data: filteredData.map(d => d.sustainable),
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true
      });
    }
    
    if (showCredits) {
      datasets.push({
        label: 'Credits Offset',
        data: filteredData.map(d => d.credits),
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        fill: true
      });
    }

    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: filteredData.map(d => moment(d.month).format('MMM YYYY')),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 11
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tons CO₂',
              font: {
                size: 11
              }
            },
            ticks: {
              font: {
                size: 10
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  }

  // Initialize pie chart for sectors
  function initializeSectorsChart() {
    const ctx = document.getElementById('sectorsPieChart');
    if (!ctx) return;

    if (sectorsChart) {
      sectorsChart.destroy();
    }

    const filteredData = filterDataByDateRange(config.graphData);
    const totals = {
      maintenance: 0,
      electricity: 0,
      services: 0,
      transport: 0,
      others: 0
    };

    filteredData.forEach(d => {
      totals.maintenance += d.maintenance;
      totals.electricity += d.electricity;
      totals.services += d.services;
      totals.transport += d.transport;
      totals.others += d.others;
    });

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
    const data = Object.values(totals);
    const labels = ['Maintenance', 'Electricity', 'Services', 'Transport', 'Others'];

    sectorsChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value.toFixed(1)} tons (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Update custom legend
    const legendContainer = document.getElementById('sectorsLegend');
    if (legendContainer) {
      legendContainer.innerHTML = labels.map((label, index) => `
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${colors[index]}"></div>
          <span>${label}</span>
        </div>
      `).join('');
    }
  }

  // Initialize data table
  function initializeTable() {
    const tbody = document.querySelector('#advanced-view table tbody');
    if (!tbody) return;
    
    const filteredData = filterDataByDateRange(config.graphData);
    
    tbody.innerHTML = filteredData.map(d => `
      <tr>
        <td>${moment(d.month).format('MMM YYYY')}</td>
        <td>${d.total.toFixed(2)} tons</td>
        <td>${d.sustainable.toFixed(2)} tons</td>
        <td>${d.credits.toFixed(2)} tons</td>
        <td>${d.maintenance.toFixed(2)} tons</td>
        <td>${d.electricity.toFixed(2)} tons</td>
        <td>${d.services.toFixed(2)} tons</td>
        <td>${d.transport.toFixed(2)} tons</td>
        <td>${d.others.toFixed(2)} tons</td>
      </tr>
    `).join('');
  }

  // Handle view toggle
  function initializeViewToggle() {
    const toggle = document.getElementById('viewToggle');
    if (!toggle) return;

    const visualizationContainer = document.getElementById('visualization-container');
    const busLegend = document.getElementById('bus-legend');
    const busCount = document.getElementById('bus-count');
    const advancedView = document.getElementById('advanced-view');
    const busDescription = document.querySelector('.bus-description');
    const toggleLabel = toggle.nextElementSibling.querySelector('i');

    toggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        visualizationContainer?.classList.add('d-none');
        busLegend?.classList.add('d-none');
        busCount?.classList.add('d-none');
        advancedView?.classList.remove('d-none');
        if (busDescription) busDescription.style.visibility = 'hidden';
        toggleLabel.className = 'bi bi-sunglasses';
        initializeChart();
        initializeSectorsChart();
        initializeTable();
      } else {
        visualizationContainer?.classList.remove('d-none');
        busLegend?.classList.remove('d-none');
        busCount?.classList.remove('d-none');
        advancedView?.classList.add('d-none');
        if (busDescription) busDescription.style.visibility = 'visible';
        toggleLabel.className = 'bi bi-eyeglasses';
        initializeBuses();
      }
    });

    // Add event listeners for line toggles
    ['showTotal', 'showSustainable', 'showCredits'].forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          initializeChart();
        });
      }
    });
  }

  // Initialize date range picker
  function initializeDateRange() {
    const picker = document.getElementById('dateRangePicker');
    if (!picker) return;
    
    $(picker).daterangepicker({
      startDate: selectedDateRange.start,
      endDate: selectedDateRange.end,
      ranges: {
        'Last Month': [moment().subtract(1, 'month'), moment()],
        'Last 3 Months': [moment().subtract(3, 'months'), moment()],
        'Last 6 Months': [moment().subtract(6, 'months'), moment()],
        'Last Year': [moment().subtract(1, 'year'), moment()],
        'All Time': [moment('2023-01-01'), moment()]
      },
      locale: {
        format: 'DD/MM/YYYY'
      },
      autoUpdateInput: false
    }, function(start, end) {
      selectedDateRange = { start, end };
      picker.value = `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
      updateDisplayForDateRange();
    });

    // Handle manual input
    picker.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        const dates = this.value.split('-').map(d => d.trim());
        if (dates.length === 2) {
          const start = moment(dates[0], 'DD/MM/YYYY');
          const end = moment(dates[1], 'DD/MM/YYYY');
          if (start.isValid() && end.isValid()) {
            selectedDateRange = { start, end };
            $(picker).data('daterangepicker').setStartDate(start);
            $(picker).data('daterangepicker').setEndDate(end);
            updateDisplayForDateRange();
          }
        }
      }
    });

    // Initialize with current date range
    picker.value = `${selectedDateRange.start.format('DD/MM/YYYY')} - ${selectedDateRange.end.format('DD/MM/YYYY')}`;
  }

  // Update all displays based on date range
  function updateDisplayForDateRange() {
    const filteredData = filterDataByDateRange(config.graphData);
    const totals = calculateTotalsForDateRange(filteredData);
    
    config.totalEmissions = totals.total;
    config.sustainableOffset = totals.sustainable;
    config.creditsOffset = totals.credits;
    
    updateSummaryDisplay();
    
    if (document.getElementById('viewToggle')?.checked) {
      initializeChart();
      initializeSectorsChart();
      initializeTable();
    } else {
      initializeBuses();
    }
  }

  // Update summary numbers
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
    updateDisplayForDateRange();
    initialize3DEffect();
    initializeViewToggle();
    
    // Add window resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!document.getElementById('viewToggle')?.checked) {
          initializeBuses();
        } else {
          initializeChart();
          initializeSectorsChart();
        }
      }, 250);
    });
  });
})();