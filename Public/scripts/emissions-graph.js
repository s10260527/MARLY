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
});

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

  document.getElementById('backButton')?.addEventListener('click', handleEmissionsBack);
  document.getElementById('netEmissionsToggle')?.addEventListener('click', toggleNetEmissions);
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
  emissionsState.navStack.push({...emissionsState});
  const idx = elements[0].index;
  const ov = window.emissionsData.monthlyData.overview;
  emissionsState.currentMonth = ov.total[idx].isoDate;
  emissionsState.view = emissionsState.currentSector ? 'sector-month' : 'month';
  updateEmissionsCharts();
}

function handleEmissionsPieClick(evt, elements) {
  if (!elements || !elements.length) return;
  emissionsState.navStack.push({...emissionsState});
  const i = elements[0].index;
  const sec = sectorPieChart.data.labels[i];
  emissionsState.currentSector = sec;
  emissionsState.view = emissionsState.currentMonth ? 'sector-month' : 'sector';
  updateEmissionsCharts();
}

function handleEmissionsBack() {
  if (emissionsState.navStack.length > 0) {
    const st = emissionsState.navStack.pop();
    Object.assign(emissionsState, st);
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
        val=arr.reduce((acc,x)=>acc+x.value,0);
      }
      labs.push(se);
      vals.push(val);
      cols.push('#'+Math.floor(Math.random()*16777215).toString(16));
    });
  }
  // else if in sector, show subSectors
  return {
    labels: labs,
    datasets: [{ data: vals, backgroundColor: cols }]
  };
}
