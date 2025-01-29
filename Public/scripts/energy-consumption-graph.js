// scripts/energy-consumption-graph.js

window.energyData = null;

const energyState = {
  view: 'overview',
  currentSector: null,
  currentMonth: null,
  navStack: []
};

let energyLineChart = null;
let energyPieChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  $.ajax({
    type: 'GET',
    url: '/api/dashboard/energy',
    headers: { Authorization: `Bearer ${token}` },
    success: (res) => {
      window.energyData = res;
      initEnergyCharts();
      updateEnergyCharts();
    },
    error: (xhr) => {
      console.error("Error fetching /api/dashboard/energy:", xhr);
    }
  });
});

function initEnergyCharts() {
  const lineCtx = document.getElementById('energyLineChart').getContext('2d');
  energyLineChart = new Chart(lineCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleEnergyLineClick,
      scales: { y: { beginAtZero: true } }
    }
  });

  const pieCtx = document.getElementById('energySectorPieChart').getContext('2d');
  energyPieChart = new Chart(pieCtx, {
    type: 'pie',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleEnergyPieClick
    }
  });

  document.getElementById('energyBackButton')?.addEventListener('click', handleEnergyBack);
}

function updateEnergyCharts() {
  if (!window.energyData) return;
  const d = window.energyData;

  let dataKey;
  let isDaily = false;
  if (energyState.view === 'sector-month') {
    dataKey = `${energyState.currentSector}-${energyState.currentMonth}`;
    isDaily = true;
  } else if (energyState.view === 'month') {
    dataKey = energyState.currentMonth;
    isDaily = true;
  } else if (energyState.view === 'sector') {
    dataKey = energyState.currentSector;
  } else {
    dataKey = 'overview';
  }

  const ds = isDaily ? d.dailyData[dataKey] : d.monthlyData[dataKey];
  if (!ds) return;

  const lineData = {
    labels: ds.total.map(x => x.date),
    datasets: [
      {
        label: 'Total Energy Consumption',
        data: ds.total.map(x => x.value),
        borderColor: '#0c45c0',
        backgroundColor: 'rgba(12,69,192,0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };
  energyLineChart.data = lineData;
  energyLineChart.update();

  let monthIndex = null;
  if (d.monthlyData.overview && d.monthlyData.overview.total && energyState.currentMonth) {
    monthIndex = d.monthlyData.overview.total.findIndex(x => x.isoDate === energyState.currentMonth);
  }
  const pData = buildEnergyPieData(d, monthIndex);
  energyPieChart.data = pData;
  energyPieChart.update();
}

function handleEnergyLineClick(evt, elements) {
  if (!elements || !elements.length) return;
  energyState.navStack.push({ ...energyState });
  const idx = elements[0].index;
  const ov = window.energyData.monthlyData.overview;
  energyState.currentMonth = ov.total[idx].isoDate;
  energyState.view = energyState.currentSector ? 'sector-month' : 'month';
  updateEnergyCharts();
}

function handleEnergyPieClick(evt, elements) {
  if (!elements || !elements.length) return;
  energyState.navStack.push({ ...energyState });
  const i = elements[0].index;
  const sec = energyPieChart.data.labels[i];
  energyState.currentSector = sec;
  energyState.view = energyState.currentMonth ? 'sector-month' : 'sector';
  updateEnergyCharts();
}

function handleEnergyBack() {
  if (energyState.navStack.length > 0) {
    const st = energyState.navStack.pop();
    Object.assign(energyState, st);
    updateEnergyCharts();
  }
}

function buildEnergyPieData(d, monthIndex) {
  const labs=[],vals=[],cols=[];
  if (!energyState.currentSector) {
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
  return { labels: labs, datasets: [{ data: vals, backgroundColor: cols }] };
}
