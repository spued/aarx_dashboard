var province_ne_table = null;
var province_rx_table = null;
var pon_onu_table = null;
var master_info = null;
var master_id_data = null;
var active_master_pon_count = [];
var previous_master_pon_count = [];
var pon_count_data = [{ 'pon_name': '-','pon_aarx': '0', 'good' : 0, 'bad' : 0 }];
var pon_onu_data = [{ 'onu_id': 0, 'name' : '-', 'rx' : 0 }];
var master_id_list = [];
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
    //processing: true,
    data:  pon_count_data ,
    columns: [
        { data: 'pon_name' },
        { data: 'pon_aarx' },
        { data: 'good' },
        { data: 'bad' }
    ],
    createdRow: function (data) {
      //console.log(data);
    }
  });

  pon_onu_table = $('#pon_onu_table').DataTable({
    //processing: true,
    data:  pon_onu_data ,
    columns: [
        { data: 'onu_id' },
        { data: 'name' },
        { data: {},
          render: (data) => {
            let html = '';
            if(Math.abs(data.rx - data.aarx) > 2) {
              html='<i class="text text-danger">'+data.rx+'</i>';
            } else {
              html='<i class="text text-success">'+data.rx+'</i>';
            }
            return html;
          } }
    ],
  });

  drawGraph();
});

$('#province_rx_table').on('click', 'tbody td', function() {
  //get textContent of the TD
  //console.log('TD cell textContent : ', this.textContent)
  pon_onu_data = [];
  let data = province_rx_table.row(this).data();
  $("#ponName").text(data.pon_name + ' @RX ' + data.pon_aarx);
  $.post('/rx_pon_onu', { 
    nrssp: data.pon_name,
    master_id: function() {
      if(!!master_id_list[0]) return master_id_list[0];
    }
   }, function(res) {
    //console.log(res.data[0]);
    res.data[0].forEach((item) => {
      //console.log(item);
      pon_onu_data.push({
        onu_id : item.ONU_ID,
        name: item.Name,
        rx: item.Received_Optical_Power,
        aarx: data.pon_aarx
      });
    })
    pon_onu_table.clear().rows.add(pon_onu_data).draw();
    $("#ponONUModal").modal('show');
  })
});

$('#ponONUModal').on('click', 'button.close', function (eventObject) {
  $('#ponONUModal').modal('hide');
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
  $("#rx_table").hide();
  province_ne_table.ajax.reload();
  $("#ne_table").show();
})



function showProvinceRXTable() {
  $("#ne_table").hide();
  $("#rx_table").hide();
  pon_count_data = [];
  $.post('/list_master_id', { prefix: $("#current_prefix").val() }, function(res) {
    //console.log(res);
    let promises = [];
    master_id_list = [];
    master_id_data = res.data;
    let good = bad = 0;
    master_id_data.forEach((element) => {
      if(element.status == 1) {
        $("#current_master_id").val(element.id);
        master_id_list.push(element.id);
        promises.push(
          $.post('/rx_count_pon', { 
            master_id: element.id ,
            prefix: $("#current_prefix").val() 
          }, function(_res) {
            //console.log(_res.data);
            _res.data.forEach((item) => {
              //console.log(item);
              pon_count_data.push(item);
            })
          })
        );
      }
    });
    Promise.all(promises).then(() => {
      //console.log(good,bad);
      province_rx_table.clear().rows.add(pon_count_data).draw();
      $("#rx_table").show();
    });
  })
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
  $.post('/list_master_id', { prefix: $("#current_prefix").val() }, function(res) {
    //console.log(res);
    var promises = [];
    master_ids_data = res.data;
    let good = bad = 0;
    master_ids_data.forEach((element) => {
      if(element.status == 1) {
        promises.push(
          $.post('/rx_count_onu', { 
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



