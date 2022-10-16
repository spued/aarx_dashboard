var province_ne_table = null;
var province_rx_table = null;
var master_info = null;
var master_ids_data = null;
var active_master_pon_count = [];
var previous_master_pon_count = [];

$(function() {
  $("#rx_table").hide();
  $("#current_prefix").val($(".btn-province:first-of-type").attr('prefix'));
  $(".main_graph > label").text($(".btn-province:first-of-type").text());
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

  province_rx_table = $('#province_rx_table').DataTable({
    processing: true,
    serverSide: false,
    ajax: {
        url: '/rx_pon',
        type: 'POST',
        data: { 
          prefix : function() { 
            return $("#current_prefix").val() 
          },
          master_id : function() { 
            return $("#current_master_id").val() 
          }
        }
    },
    columns: [
        { data: 'pon_name' },
        { data: 'good' },
        { data: 'bad' }
    ],
  });
  drawGraph();
});

$(".btn-province").on("click",function(){
  let prefix = $(this).attr('prefix');
  //console.log("Search for province prefix = " + prefix);
  
  $("#current_prefix").val(prefix);
  $(".main_graph > label").text($(this).text());
  $.post('/list_masters_id', { prefix: $("#current_prefix").val() }, function(res) {
    //console.log(res);
    master_ids = res;
  });
  drawGraph();
  province_ne_table.ajax.reload();
 
})

function showProvinceRXTable() {
  $("#ne_table").hide();
  $("#current_master_id").val(109);
  province_rx_table.ajax.reload();
  $("#rx_table").show();
}

const graph_profile = {
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
    data: [100, 100]
  }]
};

const graph_config = {
  type: 'doughnut',
  data: graph_profile,
  options: {
    onClick: clickHandler,
    plugins: {
      legend: {
          display: true,
          labels: {
              color: 'rgb(0, 0, 0)'
          }
      }
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
      //console.log(label , value);
      if(label.startsWith('Bad')) { 
        showProvinceRXTable();
      } else {
        //console.log('later');
      }
  }
}
function drawGraph() {
  $.post('/list_masters_id', { prefix: $("#current_prefix").val() }, function(res) {
    //console.log(res);
    var promises = [];
    master_ids_data = res.data;
    let good = bad = 0;
    master_ids_data.forEach((element) => {
      if(element.status == 1) {
      promises.push(
        $.post('/rx_onu', { 
          master_id: element.id ,
          prefix: $("#current_prefix").val() 
        }, function(_res) {
          //console.log(_res);
          good += _res.data.good;
          bad += _res.data.bad;
        })
      );
    }
    });
    Promise.all(promises).then(() => {
      //console.log(good,bad);
      rxChart.data.datasets[0].data = [good,bad];
      rxChart.data.labels = ['Good = ' + good, 'Bad = ' + bad];
      rxChart.update();
      rxChart.show();
      
    });
  })
  
}



