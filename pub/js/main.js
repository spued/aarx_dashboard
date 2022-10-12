const chartjs = require("chart.js");
const labels = [
    'Good',
    'Bad'
  ];

  const data = {
    labels: labels,
    datasets: [{
      label: 'A@RX ONU graph',
      backgroundColor: [
        'rgb(10, 190, 10)',
        'rgb(200, 10, 10)',
        'rgb(255, 205, 86)'
      ],
      hoverOffset: 4,
      data: [30000, 2000]
    }]
  };

  const config = {
    type: 'doughnut',
    data: data,
    options: {
        onClick: (e) => {
            const canvasPosition = Chart.helpers.getRelativePosition(e, chart);

            // Substitute the appropriate scale IDs
            const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
            const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
            console.log(dataX,dataY);
        }
    }
  };

  const myChart = new Chart(
    document.getElementById('myChart'),
    config
  );

function clickHandler(evt) {
    const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
    if (points.length) {
        const firstPoint = points[0];
        const label = myChart.data.labels[firstPoint.index];
        const value = myChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
    }
}