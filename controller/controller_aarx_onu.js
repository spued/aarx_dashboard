const db = require('../model');
const logger = require('../lib/logger');

function parseNRSSP(nrssp) {
    var res = nrssp.split('-');
    return res;
}

const post_rx_province = async (req, res) => {
    logger.info("Controller : province list rx onu = " + req.body.prefix);
    resData = {
        code : 1,
        msg : 'Error : Default'
    };
    db.getPONDataByPrefix(req.body.prefix).then(function(rows) {
        //console.log(rows);
        resData.data = rows;
        resData.rowCount = rows.length;
        resData.code = 0;
        resData.msg = 'OK';
        res.json(resData);
    }).catch((err) => setImmediate(() => { throw err; }));
}
const post_masters_info = async (req, res) => {
    logger.info("Controller : get master list");
    resData = {
        code : 1,
        msg : 'Error : Default'
    };
    db.getOverAllMasterData().then(function(rows) {
        //console.log(rows);
        resData.data = rows;
        resData.rowCount = rows.length;
        resData.code = 0;
        resData.msg = 'OK';
        res.json(resData);
    }).catch((err) => setImmediate(() => { throw err; }));
}
const post_list_master_id = async (req, res) => {
    logger.info("Controller : get master id list for profix = " + req.body.prefix);
    resData = {
        code : 1,
        msg : 'Error : Default'
    };
    db.getActiveMasterIDByPrefix(req.body.prefix).then(function(rows) {
        //console.log(rows);
        resData.data = rows;
        resData.rowCount = rows.length;
        resData.code = 0;
        resData.msg = 'OK';
        res.json(resData);
    }).catch((err) => setImmediate(() => { throw err; }));
}
const post_count_pon = async (req, res) => {
    logger.info("Controller : get pon count for master id = " + req.body.master_id);
    resData = {
        code : 1,
        msg : 'Error : Default'
    };
    db.countPONByMasterID(req.body.master_id, req.body.prefix).then(function(rows) {
        //console.log(rows);
        resData.data = rows;
        resData.rowCount = rows.length;
        resData.code = 0;
        resData.msg = 'OK';
        res.json(resData);
    }).catch((err) => setImmediate(() => { throw err; }));
}
const post_rx_onu_count = async (req, res) => {
    logger.info("Controller : get onu count for master id = " + req.body.master_id);
    resData = {
        code : 1,
        msg : 'Error : Default'
    };
    let _data = {
        master_id : req.body.master_id, 
        prefix : req.body.prefix
    }
    db.getRXONUCount(_data).then(function(rows) {
        //console.log(rows);
        resData.data = rows;
        resData.rowCount = rows.length;
        resData.code = 0;
        resData.msg = 'OK';
        res.json(resData);
    }).catch((err) => setImmediate(() => { throw err; }));
}
const post_rx_pon_count = async (req, res) => {
    logger.info("Controller : get RX pon for master id = " + req.body.master_id);
    resData = {
        code : 1,
        msg : 'Error : Default'
    };
    let _data = {
        master_id : req.body.master_id, 
        prefix : req.body.prefix
    }
    db.getRXONUData(_data).then(function(rows) {
        //console.log(rows);
        resData.data = rows;
        resData.rowCount = rows.length;
        resData.code = 0;
        resData.msg = 'OK';
        res.json(resData);
    }).catch((err) => setImmediate(() => { throw err; }));
}

const post_pon_onu = async (req, res) => {
    logger.info("Controller : get pon onu list for NRSSP = " + req.body.nrssp);
    resData = {
        code : 1,
        msg : 'Error : Default'
    };
    let nrssp = parseNRSSP(req.body.nrssp);
    let _data = {
        ne_name : nrssp[0], 
        rack : nrssp[1],
        shelf : nrssp[2],
        slot : nrssp[3],
        port : nrssp[4],
        master_id: req.body.master_id
    }
    console.log(_data);
    db.getPONONURXData(_data).then(function(rows) {
        //console.log(rows);
        resData.data = rows;
        resData.rowCount = rows.length;
        resData.code = 0;
        resData.msg = 'OK';
        res.json(resData);
    }).catch((err) => setImmediate(() => { throw err; }));
}
module.exports = {
    post_rx_province,
    post_masters_info,
    post_list_master_id,
    post_count_pon,
    post_rx_onu_count,
    post_rx_pon_count,
    post_pon_onu
}