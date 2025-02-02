// scripts/emissions-graph.js

window.emissionsData = null;

const emissionsState = {
  view: 'overview',
  currentSector: null,
  currentMonth: null,
  showingNetEmissions: false,
  navStack: []
};

let emissionsLineChart = null;
let sectorPieChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Initial fetch - can remove if you only rely on month picker
  $.ajax({
    type: 'GET',
    url: '/api/dashboard/emissions',
    headers: { Authorization: `Bearer ${token}` },
    success: (res) => {
      window.emissionsData = res;
      initEmissionsCharts();
      updateEmissionsCharts();
    },
    error: (xhr) => {
      console.error("Error fetching /api/dashboard/emissions:", xhr);
    }
  });

  // Listen for the "Back" button in the carbon tab
  document.getElementById('backButton')?.addEventListener('click', handleEmissionsBack);
  // Net Emissions toggle
  document.getElementById('netEmissionsToggle')?.addEventListener('click', toggleNetEmissions);
});

// Called from the "monthRangeChanged" listener or reset to default
function refreshEmissionsData(newData) {
  // Overwrite the global data
  window.emissionsData = newData;
  // Reset state
  emissionsState.view = 'overview';
  emissionsState.currentSector = null;
  emissionsState.currentMonth = null;
  emissionsState.navStack = [];
  
  if (!emissionsLineChart || !sectorPieChart) {
    initEmissionsCharts();
  }
  updateEmissionsCharts();
}

function initEmissionsCharts() {
  const lineCtx = document.getElementById('emissionsLineChart').getContext('2d');
  emissionsLineChart = new Chart(lineCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleEmissionsLineClick,
      scales: { y: { beginAtZero: true } }
    }
  });

  const pieCtx = document.getElementById('sectorPieChart').getContext('2d');
  sectorPieChart = new Chart(pieCtx, {
    type: 'pie',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleEmissionsPieClick
    }
  });
}

function updateEmissionsCharts() {
  if (!window.emissionsData) return;
  const d = window.emissionsData;

  let dataKey;
  let isDaily = false;
  if (emissionsState.view === 'sector-month') {
    dataKey = `${emissionsState.currentSector}-${emissionsState.currentMonth}`;
    isDaily = true;
  } else if (emissionsState.view === 'month') {
    dataKey = emissionsState.currentMonth;
    isDaily = true;
  } else if (emissionsState.view === 'sector') {
    dataKey = emissionsState.currentSector;
  } else {
    dataKey = 'overview';
  }

  const ds = isDaily ? d.dailyData[dataKey] : d.monthlyData[dataKey];
  if (!ds) return;

  // If user has drilled down to a sector, show a message
  const viewIndicator = document.getElementById('viewIndicator');
  if (emissionsState.currentSector) {
    viewIndicator.textContent = `You are viewing the chart for ${emissionsState.currentSector} data.`;
  } else {
    viewIndicator.textContent = '';
  }

  let lineData;
  if (emissionsState.showingNetEmissions) {
    const netVals = computeNet(ds);
    lineData = {
      labels: ds.total.map(x => x.date),
      datasets: [
        {
          label: 'Net Emissions',
          data: netVals,
          borderColor: '#794ACF',
          backgroundColor: 'rgba(121,74,207,0.2)',
          fill: true
        }
      ]
    };
  } else {
    lineData = {
      labels: ds.total.map(x => x.date),
      datasets: [
        {
          label: 'Total Emissions',
          data: ds.total.map(x => x.value),
          borderColor: '#16b65b',
          backgroundColor: 'rgba(22,182,91,0.1)',
          fill: true
        },
        {
          label: 'Sustainable Offset',
          data: ds.sustainable.map(x => x.value),
          borderColor: '#FFCE56',
          backgroundColor: 'rgba(255,206,86,0.2)',
          fill: true
        },
        {
          label: 'Carbon Credits',
          data: ds.credits.map(x => x.value),
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255,99,132,0.2)',
          fill: true
        }
      ]
    };
  }

  emissionsLineChart.data = lineData;
  emissionsLineChart.update();

  let monthIndex = null;
  if (d.monthlyData.overview && d.monthlyData.overview.total && emissionsState.currentMonth) {
    monthIndex = d.monthlyData.overview.total.findIndex(x => x.isoDate === emissionsState.currentMonth);
  }
  const pData = buildPieData(d, monthIndex);
  sectorPieChart.data = pData;
  sectorPieChart.update();
}

function handleEmissionsLineClick(evt, elements) {
  if (!elements || !elements.length) return;
  emissionsState.navStack.push({ ...emissionsState });
  const idx = elements[0].index;
  const ov = window.emissionsData.monthlyData.overview;
  emissionsState.currentMonth = ov.total[idx].isoDate;
  emissionsState.view = emissionsState.currentSector ? 'sector-month' : 'month';
  updateEmissionsCharts();
}

// *** DRILL DOWN EXAMPLE ***
// When user clicks a pie slice, show only that sector's data
function handleEmissionsPieClick(evt, elements) {
  if (!elements || !elements.length) return;
  emissionsState.navStack.push({ ...emissionsState });
  const i = elements[0].index;
  const sec = sectorPieChart.data.labels[i]; // e.g. "iPhone Assembly"
  
  // Set the currentSector and change the view to 'sector' or 'sector-month'
  emissionsState.currentSector = sec;
  emissionsState.view = emissionsState.currentMonth ? 'sector-month' : 'sector';
  
  updateEmissionsCharts(); 
}

// The user clicks "Back" to revert
function handleEmissionsBack() {
  if (emissionsState.navStack.length > 0) {
    const st = emissionsState.navStack.pop();
    Object.assign(emissionsState, st);
    updateEmissionsCharts();
  } else {
    // If no navStack, revert to overview
    emissionsState.view = 'overview';
    emissionsState.currentSector = null;
    updateEmissionsCharts();
  }
}

function toggleNetEmissions() {
  emissionsState.showingNetEmissions = !emissionsState.showingNetEmissions;
  updateEmissionsCharts();
}

function computeNet(ds) {
  if (!ds || !ds.total) return [];
  return ds.total.map((item, i) => {
    const s = ds.sustainable[i]?.value || 0;
    const c = ds.credits[i]?.value || 0;
    return Math.max(0, item.value - s - c);
  });
}

function buildPieData(d, monthIndex) {
  const labs=[],vals=[],cols=[];
  // if not in sector view
  if (!emissionsState.currentSector) {
    const sectorKeys = Object.keys(d.monthlyData).filter(k => k!=='overview' && !k.includes('-'));
    sectorKeys.forEach(se => {
      const arr = d.monthlyData[se].total;
      let val=0;
      if (monthIndex !== null && monthIndex >= 0) {
        val=arr[monthIndex].value;
      } else {
        // Summation for all months
        val=arr.reduce((acc,x)=>acc+x.value,0);
      }
      labs.push(se);
      vals.push(val);
      cols.push('#'+Math.floor(Math.random()*16777215).toString(16));
    });
  } else {
    // If we want to handle sub-sectors or detailed sub-breakdowns, do so here
    // Otherwise show just one slice, or skip
  }
  return { labels: labs, datasets: [{ data: vals, backgroundColor: cols }] };
}
