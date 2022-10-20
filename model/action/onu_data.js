const e = require('express');
const logger = require('../../lib/logger');
var db_conn = require('../core/data_connection');

function getOverAllNEData() {
    let sql = "SELECT NE_Name,count(*) AS ne_count FROM aarx_status WHERE status = 1 GROUP BY substr(NE_Name, 1,3)";
    return new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            //console.log(rows);
            resolve(rows);
        });
    });
}

function getDataByPrefix(prefix) {
    let sql = "SELECT count(*) AS ne_count FROM aarx_status WHERE status = 1 AND NE_Name LIKE '"+ prefix + "%'";
    //console.log(sql);
    return new Promise(function(resolve, reject) {
            db_conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                resolve(rows);
            });
    }); 
}

function getPONDataByPrefix(prefix) {
    let sql = "SELECT NE_Name,count(*) AS ne_count FROM aarx_status WHERE status = 1 AND NE_Name LIKE '"+ prefix + "%' GROUP BY NE_Name";
    //console.log(sql);
    return new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
}
function getMasterIDByPrefix(prefix) {
    let sql = "SELECT master_id,count(*) AS master_count FROM aarx_status WHERE status = 1 AND NE_Name LIKE '"+ prefix + "%' GROUP BY master_id";
    //console.log(sql);
    return new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
}
function getOverAllMasterData() {
    let sql = "SELECT * FROM aarx_master WHERE status = 1 OR status = 2";
    //console.log(db_conn);
    return new Promise(function(resolve, reject) {
            db_conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                resolve(rows);
            });
    });      
}
function getActiveMasterIDByPrefix(prefix) {
    // get active master id by status status 0 = last, 1 = previous
    // get all master id that use by those prefix
    let sql = "SELECT master_id,count(*) AS master_count FROM aarx_status WHERE status = 1 AND NE_Name LIKE '"+ prefix + "%' GROUP BY master_id";
    // get all master prefix that has status 0 or 1
    let sql_1 = "SELECT * FROM aarx_master WHERE status = 1 OR status = 2";
    let sql_2 = "SELECT NE_Name,count(*) AS pon_count FROM aarx_status WHERE status = 1 AND NE_Name LIKE '"+ prefix + "%' GROUP BY NE_Name";
    //console.log(sql);

    let master_ids =  new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    let active_ids =  new Promise(function(resolve, reject) {
        db_conn.query(sql_1, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    let pons =  new Promise(function(resolve, reject) {
        db_conn.query(sql_2, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    return Promise.all([master_ids, active_ids, pons]).then((results) => {
        //console.log(results);
        let ids = [];
        results[1].forEach((item) => {
            if(results[0].find((ele) => {
                return ele.master_id == item.id;
            })) {
                ids.push(item);
            }
        });
        return ids;
    });
}

function countPONByMasterID(master_id, prefix) {
    let sql = "SELECT master_id,count(*) AS pon_count FROM import_data WHERE NE_Name LIKE '"+ prefix +
     "%' AND master_id = "+ master_id +" GROUP BY master_id";
    //console.log(sql);
    return new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
}
function getRXONUCount(data) {
    // get all master prefix that has status active == 0 or previous == 1
    let sql = "SELECT * FROM aarx_master WHERE id = " + data.master_id;
    let sql_1 = "SELECT * FROM aarx_status WHERE master_id = " + data.master_id;
    // get all master id that use by those prefix
    let sql_2 = "SELECT * FROM import_data WHERE master_id = " + data.master_id + " AND NE_Name LIKE '"+ data.prefix + "%'";
    //console.log(sql);

    let master_data =  new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    let pons=  new Promise(function(resolve, reject) {
        db_conn.query(sql_1, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    let onus =  new Promise(function(resolve, reject) {
        db_conn.query(sql_2, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    return Promise.all([master_data, pons, onus]).then((res) => {
        //console.log(res);
        let onu_data = res[2];
        let pon_data = res[1];
        let NRSSP = '';
        let AARX_Power = 0;
        let good = bad = 0;
        let onu_count = {
            good : 0,
            bad : 0
        };
        onu_data.forEach((onu) => {
            NRSSP = onu.NE_Name + '-' + onu.Rack + '-' + onu.Shelf + '-' + onu.Slot + '-' + onu.Port;
            AARX_Power = pon_data.find((pon_item) => {
                return pon_item.NRSSP == NRSSP;
            })
            //console.log("NRSSP = " + NRSSP + " Get AARX = " + AARX_Power.aarx + " VS ONU_RX = " + onu.Received_Optical_Power);
            if((onu.Received_Optical_Power - AARX_Power.aarx)  < (-2)) {
                //console.log('This is bad');
                bad++;
            } else {
                //console.log('This is Good');
                good++;
            }
        })
        onu_count.good = good;
        onu_count.bad = bad;
        console.log("onu rx result for " + data.prefix + " " + JSON.stringify(onu_count));
        return onu_count;
    });
}
function getRXONUData(data) {
    //console.log(data);
    // get all master prefix that has status active == 0 or previous == 1
    let sql = "SELECT * FROM aarx_master WHERE id = " + data.master_id;
    let sql_1 = "SELECT * FROM aarx_status WHERE status = 1 AND master_id = "+ data.master_id + " AND NE_Name LIKE '"+ data.prefix + "%'";
    // get all master id that use by those prefix
    let sql_2 = "SELECT * FROM import_data WHERE master_id = "+ data.master_id + " AND NE_Name LIKE '"+ data.prefix + "%'";
    
    let master_data =  new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    let pons=  new Promise(function(resolve, reject) {
        db_conn.query(sql_1, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    let onus =  new Promise(function(resolve, reject) {
        db_conn.query(sql_2, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    return Promise.all([master_data, pons, onus]).then((res) => {
        //console.log(res);
        let onu_data = res[2];
        let pon_data = res[1];
        let NRSSP = '';
        let good = bad = 0;
        let onu_count = [];

        pon_data.forEach(pon => {
            good = 0; 
            bad = 0;
            onu_data.forEach((onu) => {
                NRSSP = onu.NE_Name + '-' + onu.Rack + '-' + onu.Shelf + '-' + onu.Slot + '-' + onu.Port;
                if(NRSSP == pon.NRSSP) {
                    //console.log("NRSSP = " + NRSSP + " Get AARX = " + AARX_Power.aarx + " VS ONU_RX = " + onu.Received_Optical_Power);
                    if((onu.Received_Optical_Power - pon.aarx) < (-2)) {
                        //console.log('This is bad');
                        bad++;
                    } else {
                        //console.log('This is Good');
                        good++;
                    }
                }
            })
            onu_count.push( { 
                pon_name : pon.NRSSP,
                pon_aarx : pon.aarx,
                good: good,
                bad: bad
            });
        })
        //console.log(onu_count);
        return onu_count;
    });
}
function getPONONURXData(data) {
    // get all master id that use by those prefix
    let sql = "SELECT * FROM import_data WHERE NE_Name LIKE '"+ data.ne_name + 
    "' AND Rack = "+ data.rack +
    " AND Shelf = "+ data.shelf +
    " AND Slot = "+ data.slot +
    " AND Port = "+ data.port +
    " AND (master_id = -1";

    data.master_id.forEach(item => {
        sql += ' OR master_id = ' + item;
    })

    sql += ')';
    //console.log(sql);
    let onus = new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    return Promise.all([onus]).then((res) => {
        //console.log(res);
        return res;
    });
}

function getNCONUData(data) {
//console.log(data);
    // get all master prefix that has status active == 0 or previous == 1
    let sql = "SELECT * FROM aarx_master WHERE id = " + data.master_id;
    let sql_1 = "SELECT * FROM aarx_status WHERE status = 1 AND master_id = "+ data.master_id + " AND NE_Name LIKE '"+ data.prefix + "%'";
    // get all master id that use by those prefix
    let sql_2 = "SELECT * FROM import_data WHERE master_id = "+ data.master_id + " AND NE_Name LIKE '"+ data.prefix + "%'";
    
    let master_data =  new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    let pons=  new Promise(function(resolve, reject) {
        db_conn.query(sql_1, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    let onus =  new Promise(function(resolve, reject) {
        db_conn.query(sql_2, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
    return Promise.all([master_data, pons, onus]).then((res) => {
        //console.log(res);
        let onu_data = res[2];
        let pon_data = res[1];
        let NRSSP = '';
        let good = bad = 0;
        let onu_count = [];

        pon_data.forEach(pon => {
            good = 0; 
            bad = 0;
            onu_data.forEach((onu) => {
                NRSSP = onu.NE_Name + '-' + onu.Rack + '-' + onu.Shelf + '-' + onu.Slot + '-' + onu.Port;
                if(NRSSP == pon.NRSSP) {
                    //console.log("NRSSP = " + NRSSP + " Get AARX = " + AARX_Power.aarx + " VS ONU_RX = " + onu.Received_Optical_Power);
                    if((onu.Received_Optical_Power - pon.aarx) < (-2)) {
                        //console.log('This is bad');
                        bad++;
                    } else {
                        //console.log('This is Good');
                        good++;
                    }
                }
            })
            onu_count.push( { 
                pon_name : pon.NRSSP,
                pon_aarx : pon.aarx,
                good: good,
                bad: bad
            });
        })
        //console.log(onu_count);
        return onu_count;
    });
}
module.exports = {
    getOverAllNEData,
    getDataByPrefix,
    getPONDataByPrefix,
    getOverAllMasterData,
    getMasterIDByPrefix,
    getActiveMasterIDByPrefix,
    countPONByMasterID,
    getRXONUCount,
    getRXONUData,
    getPONONURXData,
    getNCONUData
}