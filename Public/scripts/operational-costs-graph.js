// scripts/operational-costs-graph.js

window.operationalCostsData = null;

const costsState = {
  view: 'overview',
  currentSector: null,
  currentMonth: null,
  navStack: []
};

let verticalBarChart = null;
let horizontalBarChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return;

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
});

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

  document.getElementById('costsBackButton')?.addEventListener('click', handleCostsBack);
}

function updateCostsCharts() {
  if (!window.operationalCostsData) return;
  const d = window.operationalCostsData;

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

  const vData = {
    labels: ds.total.map(x => x.date),
    datasets: [{
      label: 'Costs',
      data: ds.total.map(x => x.value),
      backgroundColor: '#7d70f5'
    }]
  };
  verticalBarChart.data = vData;
  verticalBarChart.update();

  let monthIndex = null;
  if (d.monthlyData.overview && d.monthlyData.overview.total && costsState.currentMonth) {
    monthIndex = d.monthlyData.overview.total.findIndex(x=>x.isoDate===costsState.currentMonth);
  }
  const hData = buildCostsHorizontalData(d, monthIndex);
  horizontalBarChart.data = hData;
  horizontalBarChart.update();

  updateCostsTotal();
}

function handleCostsVerticalClick(e, ele) {
  if (!ele || !ele.length) return;
  costsState.navStack.push({...costsState});
  const idx = ele[0].index;
  const ov = window.operationalCostsData.monthlyData.overview;
  costsState.currentMonth = ov.total[idx].isoDate;
  costsState.view = costsState.currentSector ? 'sector-month' : 'month';
  updateCostsCharts();
}

function handleCostsHorizontalClick(e, ele) {
  if (!ele || !ele.length) return;
  costsState.navStack.push({...costsState});
  const i = ele[0].index;
  const sec = horizontalBarChart.data.labels[i];
  costsState.currentSector = sec;
  costsState.view = 'sector';
  updateCostsCharts();
}

function handleCostsBack() {
  if (costsState.navStack.length>0) {
    const st = costsState.navStack.pop();
    Object.assign(costsState, st);
    updateCostsCharts();
  }
}

function buildCostsHorizontalData(d, monthIndex) {
  const labs=[],vals=[],cols=[];
  const sectorKeys = Object.keys(d.monthlyData).filter(k=>k!=='overview'&&!k.includes('-'));
  sectorKeys.forEach(sec=>{
    const arr = d.monthlyData[sec].total;
    let val=0;
    if (monthIndex!==null && monthIndex>=0) {
      val=arr[monthIndex].value;
    } else {
      val=arr.reduce((acc,x)=>acc+x.value,0);
    }
    labs.push(sec);
    vals.push(val);
    cols.push('#'+Math.floor(Math.random()*16777215).toString(16));
  });
  return { labels: labs, datasets: [{ data: vals, backgroundColor: cols }] };
}

function updateCostsTotal() {
  if (!horizontalBarChart.data.datasets[0]) return;
  const sum = horizontalBarChart.data.datasets[0].data.reduce((a,v)=>a+v,0);
  document.getElementById('costsHorizontalChartTotal').textContent = sum.toFixed(2);
}
