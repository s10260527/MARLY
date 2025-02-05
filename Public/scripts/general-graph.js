// scripts/general-graph.js

let chart = null;

// We keep the existing approach that waits for emissionsData, energyData, operationalCostsData
document.addEventListener('DOMContentLoaded', () => {
  const check = setInterval(() => {
    if (window.emissionsData && window.energyData && window.operationalCostsData) {
      clearInterval(check);
      initGeneralChart();
    }
  }, 500);
});

function initGeneralChart() {
  const ctx = document.getElementById('general-graph').getContext('2d');

  const eData = window.emissionsData.monthlyData.overview;
  const nData = window.energyData.monthlyData.overview;
  const cData = window.operationalCostsData.monthlyData.overview;

  const cArr = eData.total.map(x => x.value);
  const eArr = nData.total.map(x => x.value);
  const oArr = cData.total.map(x => x.value);

  // We assume they have the same .length
  const labels = eData.total.map(x => x.date);

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Carbon Emissions (t)',
          data: cArr,
          borderColor: '#16b65b',
          backgroundColor: 'rgba(22,182,91,0.1)',
          yAxisID: 'yCarbon',
          fill: false
        },
        {
          label: 'Energy (kWh)',
          data: eArr,
          borderColor: '#0c45c0',
          backgroundColor: 'rgba(12,69,192,0.1)',
          yAxisID: 'yEnergy',
          fill: false
        },
        {
          label: 'Costs ($)',
          data: oArr,
          borderColor: '#7d70f5',
          backgroundColor: 'rgba(125,112,245,0.1)',
          yAxisID: 'yCosts',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        yCarbon: { type: 'linear', position: 'left', title: { display: true, text: 'Emissions' } },
        yEnergy: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'kWh' } },
        yCosts: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '$' } }
      }
    }
  });
}

// Called by the month picker success callback
function refreshGeneralGraphData(emissions, energy, costs) {
  // Overwrite window.*Data so the next iteration is correct
  window.emissionsData = emissions;
  window.energyData = energy;
  window.operationalCostsData = costs;

  if (!chart) {
    // If chart not created yet, init
    initGeneralChart();
    return;
  }

  const eData = emissions.monthlyData.overview;
  const nData = energy.monthlyData.overview;
  const cData = costs.monthlyData.overview;

  const cArr = eData.total.map(x => x.value);
  const eArr = nData.total.map(x => x.value);
  const oArr = cData.total.map(x => x.value);
  const labels = eData.total.map(x => x.date);

  chart.data.labels = labels;
  chart.data.datasets[0].data = cArr;
  chart.data.datasets[1].data = eArr;
  chart.data.datasets[2].data = oArr;
  chart.update();
}
