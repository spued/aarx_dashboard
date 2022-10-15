const e = require('express');
var db_conn = require('../core/data_connection');

function getOverAllNEData() {
    let sql = "SELECT NE_Name,count(*) AS ne_count FROM aarx_status GROUP BY substr(NE_Name, 1,3)";
    return new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            //console.log(rows);
            resolve(rows);
        });
    });
}

function getDataByPrefix(prefix) {
    let sql = "SELECT count(*) AS ne_count FROM aarx_status WHERE NE_Name LIKE '"+ prefix + "%'";
    //console.log(sql);
    return new Promise(function(resolve, reject) {
            db_conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                resolve(rows);
            });
    }); 
}

function getPONDataByPrefix(prefix) {
    let sql = "SELECT NE_Name,count(*) AS ne_count FROM aarx_status WHERE NE_Name LIKE '"+ prefix + "%' GROUP BY NE_Name";
    //console.log(sql);
    return new Promise(function(resolve, reject) {
        db_conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
}
function getMasterIDByPrefix(prefix) {
    let sql = "SELECT master_id,count(*) AS master_count FROM aarx_status WHERE NE_Name LIKE '"+ prefix + "%' GROUP BY master_id";
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
    let sql = "SELECT master_id,count(*) AS master_count FROM aarx_status WHERE NE_Name LIKE '"+ prefix + "%' GROUP BY master_id";
    // get all master prefix that has status 0 or 1
    let sql_1 = "SELECT * FROM aarx_master WHERE status = 1 OR status = 2";
    let sql_2 = "SELECT NE_Name,count(*) AS pon_count FROM aarx_status WHERE NE_Name LIKE '"+ prefix + "%' GROUP BY NE_Name";
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
module.exports = {
    getOverAllNEData,
    getDataByPrefix,
    getPONDataByPrefix,
    getOverAllMasterData,
    getMasterIDByPrefix,
    getActiveMasterIDByPrefix,
    countPONByMasterID
}