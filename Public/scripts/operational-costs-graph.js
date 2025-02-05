// scripts/operational-costs-graph.js

window.operationalCostsData = null;

const costsState = {
  view: 'overview',
  currentSector: null,
  currentMonth: null,
  navStack: [],
  showingNetCosts: false  // Added flag for net costs toggle
};

let verticalBarChart = null;
let horizontalBarChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Initial fetch
  $.ajax({
    type: 'GET',
    url: '/api/dashboard/costs',
    headers: { Authorization: `Bearer ${token}` },
    success: (res) => {
      window.operationalCostsData = res;
      initCostsCharts();
      updateCostsCharts();
      updateCostsTotal();
    },
    error: (xhr) => {
      console.error("Error fetching /api/dashboard/costs:", xhr);
    }
  });

  // The back button for reverting from drill-down
  document.getElementById('costsBackButton')?.addEventListener('click', handleCostsBack);
  // Added event listener for Net Operational Costs toggle
  document.getElementById('netCostsToggle')?.addEventListener('click', toggleNetCosts);
});

// Called when new data from month picker arrives
function refreshCostsData(newData) {
  costsState.view = 'overview';
  costsState.currentSector = null;
  costsState.currentMonth = null;
  costsState.navStack = [];
  window.operationalCostsData = newData;
  
  if (!verticalBarChart || !horizontalBarChart) {
    initCostsCharts();
  }
  updateCostsCharts();
  updateCostsTotal();
}

function initCostsCharts() {
  const vCtx = document.getElementById('costsVerticalBarChart').getContext('2d');
  verticalBarChart = new Chart(vCtx, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleCostsVerticalClick,
      scales: { y: { beginAtZero: true } }
    }
  });

  const hCtx = document.getElementById('costsHorizontalBarChart').getContext('2d');
  horizontalBarChart = new Chart(hCtx, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleCostsHorizontalClick,
      scales: { x: { beginAtZero: true } }
    }
  });
}

function updateCostsCharts() {
  if (!window.operationalCostsData) return;
  const d = window.operationalCostsData;

  // Show user a message if they're in a sector
  const viewIndicator = document.getElementById('costsViewIndicator');
  if (costsState.currentSector) {
    viewIndicator.textContent = `You are viewing the chart for ${costsState.currentSector} data.`;
    viewIndicator.style.display = 'block';
    viewIndicator.style.marginTop = '8px';  // Add a bit of spacing
  } else {
    viewIndicator.textContent = '';
    viewIndicator.style.display = 'none'; // Hide if not in sector view
  }

  let dataKey;
  if (costsState.view === 'sector-month') {
    dataKey = `${costsState.currentSector}-${costsState.currentMonth}`;
  } else if (costsState.view === 'month') {
    dataKey = costsState.currentMonth;
  } else if (costsState.view === 'sector') {
    dataKey = costsState.currentSector;
  } else {
    dataKey = 'overview';
  }

  const ds = d.monthlyData[dataKey];
  if (!ds) return;

  // Determine vertical bar chart data, applying net toggle if enabled
  const vLabels = ds.total.map(x => x.date);
  const vValues = costsState.showingNetCosts ? computeNetCosts(ds) : ds.total.map(x => x.value);
  const vLabelText = costsState.showingNetCosts ? 'Net Operational Costs' : 'Costs';

  const vData = {
    labels: vLabels,
    datasets: [{
      label: vLabelText,
      data: vValues,
      backgroundColor: '#7d70f5'
    }]
  };
  verticalBarChart.data = vData;
  verticalBarChart.update();

  // Horizontal bar chart data
  let monthIndex = null;
  if (d.monthlyData.overview && d.monthlyData.overview.total && costsState.currentMonth) {
    monthIndex = d.monthlyData.overview.total.findIndex(x => x.isoDate === costsState.currentMonth);
  }
  const hData = buildCostsHorizontalData(d, monthIndex);
  horizontalBarChart.data = hData;
  horizontalBarChart.update();

  updateCostsTotal();
}

// Click on vertical bar chart = drill down by month
function handleCostsVerticalClick(e, ele) {
  if (!ele || !ele.length) return;
  costsState.navStack.push({ ...costsState });

  const idx = ele[0].index;
  const ov = window.operationalCostsData.monthlyData.overview;
  costsState.currentMonth = ov.total[idx].isoDate;
  costsState.view = costsState.currentSector ? 'sector-month' : 'month';

  updateCostsCharts();
}

// Click on horizontal bar chart = drill down by sector
function handleCostsHorizontalClick(e, ele) {
  if (!ele || !ele.length) return;
  costsState.navStack.push({ ...costsState });

  const i = ele[0].index;
  const sec = horizontalBarChart.data.labels[i];
  costsState.currentSector = sec;
  costsState.view = costsState.currentMonth ? 'sector-month' : 'sector';

  updateCostsCharts();
}

function handleCostsBack() {
  if (costsState.navStack.length > 0) {
    const st = costsState.navStack.pop();
    Object.assign(costsState, st);
    updateCostsCharts();
  } else {
    // Revert to default
    costsState.view = 'overview';
    costsState.currentSector = null;
    costsState.currentMonth = null;
    updateCostsCharts();
  }
}

function computeNetCosts(ds) {
  if (!ds || !ds.total) return [];
  // If offset data exists, subtract it from total; otherwise, return total values.
  if (!ds.offset) return ds.total.map(x => x.value);
  return ds.total.map((item, i) => {
    const offset = ds.offset[i]?.value || 0;
    return Math.max(0, item.value - offset);
  });
}

function buildCostsHorizontalData(d, monthIndex) {
  const labs = [], vals = [], cols = [];
  const sectorKeys = Object.keys(d.monthlyData).filter(k => k !== 'overview' && !k.includes('-'));
  sectorKeys.forEach(sec => {
    const arr = d.monthlyData[sec].total;
    let val = 0;
    if (monthIndex !== null && monthIndex >= 0) {
      if (costsState.showingNetCosts && d.monthlyData[sec].offset) {
        val = arr[monthIndex].value - d.monthlyData[sec].offset[monthIndex].value;
      } else {
        val = arr[monthIndex].value;
      }
    } else {
      if (costsState.showingNetCosts && d.monthlyData[sec].offset) {
        val = arr.reduce((acc, x, i) => acc + (x.value - d.monthlyData[sec].offset[i].value), 0);
      } else {
        val = arr.reduce((acc, x) => acc + x.value, 0);
      }
    }
    labs.push(sec);
    vals.push(val);
    cols.push('#' + Math.floor(Math.random() * 16777215).toString(16));
  });
  return { labels: labs, datasets: [{ data: vals, backgroundColor: cols }] };
}

function updateCostsTotal() {
  if (!horizontalBarChart.data.datasets[0]) return;
  const sum = horizontalBarChart.data.datasets[0].data.reduce((a, v) => a + v, 0);
  document.getElementById('costsHorizontalChartTotal').textContent = sum.toFixed(2);
}

function toggleNetCosts() {
  costsState.showingNetCosts = !costsState.showingNetCosts;
  updateCostsCharts();
}
