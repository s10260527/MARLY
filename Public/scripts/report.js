document.addEventListener("DOMContentLoaded", function () {
    // Define descriptions and data for each sector
    const sectorData = {
        "Direct Emissions": {
        data: [45, 25, 15, 10, 5],
        description: "This chart shows the distribution of direct emissions by sources within this sector."
        },
        "Product Manufacturing": {
        data: [40, 20, 25, 10, 5],
        description: "This chart represents emissions from the product manufacturing process."
        },
        "Product Transport": {
        data: [30, 20, 30, 15, 5],
        description: "This chart displays emissions attributed to the transportation of products."
        },
        "Business Travel": {
        data: [35, 25, 20, 15, 5],
        description: "This chart highlights emissions generated from business travel activities."
        }
    };
  
    // Function to display data
    function displayData(title, data, description) {
        // Update title
        document.getElementById("pie-chart-title").textContent = title;

        // Update description
        document.getElementById("pie-chart-description").textContent = description;

        // Create and render the pie chart
        const pieChartOptions = {
        series: data,
        chart: {
            type: 'pie',
            height: 350
        },
        labels: ['Scope 1', 'Scope 2', 'Scope 3', 'Transportation', 'Other'],
        colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1'],
        legend: {
            position: 'bottom'
        }
        };

        // Destroy previous chart instance if it exists
        if (window.pieChart) {
        window.pieChart.destroy();
        }

        // Create a new pie chart instance
        window.pieChart = new ApexCharts(document.querySelector("#pie-chart"), pieChartOptions);
        window.pieChart.render();
    }

    // Event listeners for sector buttons
    document.querySelectorAll(".btn-info").forEach((button) => {
        button.addEventListener("click", function () {
        const sectorName = button.textContent;
        if (sectorData[sectorName]) {
            const { data, description } = sectorData[sectorName];
            displayData(sectorName, data, description);
        }
        });
    });
  
    // Initialize charts after DOM is fully loaded
    const barChartOptions = {
      series: [{ data: [10, 8, 6, 4, 2] }],
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1'],
      plotOptions: { bar: { distributed: true, borderRadius: 4, horizontal: false, columnWidth: '40%' } },
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: { categories: ['Laptop', 'Phone', 'Monitor', 'Headphones', 'Camera'] },
      yaxis: { title: { text: 'Count' } },
    };
  
    const barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
    barChart.render();
  
    const areaChartOptions = {
      series: [
        { name: 'Purchase Orders', data: [31, 40, 28, 51, 42, 109, 100] },
        { name: 'Sales Orders', data: [11, 32, 45, 32, 34, 52, 41] },
      ],
      chart: { height: 350, type: 'area', toolbar: { show: false } },
      colors: ['#4f35a1', '#246dec'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      markers: { size: 0 },
      yaxis: [
        { title: { text: 'Purchase Orders' } },
        { opposite: true, title: { text: 'Sales Orders' } },
      ],
      tooltip: { shared: true, intersect: false },
    };
  
    const areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
    areaChart.render();
  });
  