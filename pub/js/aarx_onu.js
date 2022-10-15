var province_ne_table = null;
var master_info = null;
var master_ids = null;
$(function() {
  $("#current_prefix").val($(".btn-province:first-of-type").attr('prefix'));
  if(province_ne_table != null) province_ne_table.destroy();
  province_ne_table = $('#province_ne_table').DataTable({
    processing: true,
    serverSide: false,
    ajax: {
        url: '/list_pon',
        type: 'POST',
        data: { 
          prefix : function() { 
            return $("#current_prefix").val() 
          } 
        }
    },
    columns: [
        { data: 'NE_Name' },
        { data: 'ne_count' }
    ],
  });
  $.post('/list_masters_id', { prefix: $("#current_prefix").val() }, function(res) {
    //console.log(res);
    master_ids = res.data;
    master_ids.forEach(element => {
      $.post('/count_pon', { 
        master_id: element.id ,
        prefix: $("#current_prefix").val() 
      }, function(_res) {
        console.log(_res);
      })
    });
  });
});

$(".btn-province").on("click",function(){
  let prefix = $(this).attr('prefix');
  console.log("Search for province prefix = " + prefix);
  $("#current_prefix").val(prefix);
  province_ne_table.ajax.reload();
  $.post('/list_masters_id', { prefix: $("#current_prefix").val() }, function(res) {
    console.log(res);
    master_ids = res;
  });
})


const graph_data = {
  labels: [
    'Good',
    'Bad'
  ],
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

const graph_config = {
  type: 'doughnut',
  data: graph_data,
  options: {
      onClick: (e) => {
          const canvasPosition = rxChart.helpers.getRelativePosition(e, chart);

          // Substitute the appropriate scale IDs
          const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
          const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
          console.log(dataX,dataY);
      }
  }
};

const rxChart = new Chart(document.getElementById('rxChart'), graph_config);

function clickHandler(evt) {
    const points = rxChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
    if (points.length) {
        const firstPoint = points[0];
        const label = rxChart.data.labels[firstPoint.index];
        const value = rxChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
    }
}